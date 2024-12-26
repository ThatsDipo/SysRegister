export const dynamic = "force-dynamic";
import { Mark } from "@/types";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

async function scrapeData(authToken: string, subjectName: string, periodIndex: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const context = browser.defaultBrowserContext();
    await context.setCookie({
        name: "PHPSESSID",
        value: authToken,
        domain: "web.spaggiari.eu",
    });

    // TODO: Add support for student users
    await page.goto(
        "https://web.spaggiari.eu/cvv/app/default/genitori_voti.php",
        { waitUntil: "domcontentloaded" }
    );
    await page.waitForNetworkIdle();
    const data = await page.evaluate(async (subjectName: string, periodIndex: string) => {
        // get an array with available year subdivisions
        async function getYearSubdivisions() {
            const result: string[] = [];
            const subdivisionsDivs = (document.querySelector(".ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all"))?.querySelectorAll("li") || null;
            if (!subdivisionsDivs) {
                return null;
            }
            Array.from(subdivisionsDivs).forEach((subdivisionDiv) => {
                result.push(subdivisionDiv.textContent || "");
            });
            return result;
        }

        // move to the wanted year subdivision
        async function selectYearSubdivision(yearSubdivision: string) {
            const subdivisionsDivs = await getYearSubdivisions();
            if (!subdivisionsDivs) {
                return null;
            }
            await new Promise<void>((resolve) => {
                const elements = document.querySelectorAll("*");
                Array.from(elements).forEach((element) => {
                    if (element.textContent === yearSubdivision) {
                        (element as HTMLElement).click();
                        resolve();
                    }
                });
            });
        }

        // get each subjects marks with its data
        async function getSubjectWithMarks(yearSubdivision: string) {
            const result: Mark[] = [];
            const index = (await getYearSubdivisions())?.indexOf(yearSubdivision) || 0;
            let table = Array.from((document.querySelector("#tabs")?.children[index + 1]?.querySelector(".inner")?.querySelector(".table_sessione.griglia_tab")?.querySelector("tbody")?.querySelectorAll("tr") || []));
            if (!table) {
                return null;
            }
            // make the table usable
            table = table.slice(2);
            for (let i = table.length - 1; i >= 0; i--) {
                if (i % 2 !== 0) {
                    table.splice(i, 1);
                }
            }
            // get subjects with marks
            for (const row of table) {
                const marks: Mark[] = [];
                const rowArray = Array.from(row.querySelectorAll("td"));
                const currentSubjectName = rowArray[0].textContent?.trim() || "";
                if (currentSubjectName == subjectName) {
                    rowArray.splice(0, 2);
                    console.log(rowArray);
                    for (const mark of rowArray) {
                        mark.click();
                        await new Promise(resolve => setTimeout(resolve, 300));
                        const dialog = document.querySelector("#popupContact_readonly")?.firstElementChild?.firstElementChild?.firstElementChild;
                        marks.push({
                            type: dialog?.firstElementChild?.firstElementChild?.querySelector("#DisplayMateria")?.textContent?.trim().split("-")[2]?.trim() || "",
                            affectsAverage: (dialog?.children[2]?.children[3]?.children[0]?.classList.contains("f_reg_voto_dettaglio")) ? false : true || false,
                            date: dialog?.children[2]?.children[1]?.textContent?.trim()?.replaceAll("-", "/") || "",
                            value: dialog?.children[2]?.children[3]?.textContent?.trim() || "",
                            note: dialog?.children[3]?.children[1]?.textContent?.trim() || "",
                        });
                    }
                }
                result.push(...marks);
            }
            return result;
        }

        // scraping logic
        const data: Mark[] = [];
        const yearSubdivisions = await getYearSubdivisions();
        if (!yearSubdivisions) {
            console.log("Year subdivisions not found");
            return null;
        }

        await selectYearSubdivision(yearSubdivisions[parseInt(periodIndex)]);
        const marks: Mark[] = await getSubjectWithMarks(yearSubdivisions[parseInt(periodIndex)]) as Mark[];
        if (!marks) {
            console.log("No current marks");
            return null;
        }
        marks.forEach(mark => data.push(mark));
        return data;
    }, subjectName, periodIndex);

    // await browser.close();
    return data;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authToken = searchParams.get("authToken");
        const subjectName = searchParams.get("subjectName");
        const periodIndex = searchParams.get("periodIndex");

        if (!authToken) {
            return NextResponse.json({ error: "Missing auth token" }, { status: 400 });
        }
        if (!subjectName) {
            return NextResponse.json({ error: "Missing subject name" }, { status: 400 });
        }
        if (!periodIndex) {
            return NextResponse.json({ error: "Missing period index" }, { status: 400 });
        }

        const data = await scrapeData(authToken, subjectName, periodIndex);
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("Error scraping:", error);
        return NextResponse.json({ error: "Failed to scrape the page" }, { status: 500 });
    }
}
