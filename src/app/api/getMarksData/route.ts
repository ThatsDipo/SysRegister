export const dynamic = "force-dynamic";
import { MarkData, Subject } from "@/types";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

async function scrapeData(authToken: string) {
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
    await page.waitForSelector('.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all');
    const data = await page.evaluate(async () => {
        // used for formatting
        const markTable: { [key: string]: number } = {
            "1": 1, "1+": 1.25, "1½": 1.5, "2-": 1.75, "2": 2, "2+": 2.25, "2½": 2.5,
            "3-": 2.75, "3": 3, "3+": 3.25, "3½": 3.5, "4-": 3.75, "4": 4, "4+": 4.25,
            "4½": 4.5, "5-": 4.75, "5": 5, "5+": 5.25, "5½": 5.5, "6-": 5.75, "6": 6,
            "6+": 6.25, "6½": 6.5, "7-": 6.75, "7": 7, "7+": 7.25, "7½": 7.5, "8-": 7.75,
            "8": 8, "8+": 8.25, "8½": 8.5, "9-": 8.75, "9": 9, "9+": 9.25, "9½": 9.5,
            "10-": 9.75, "10": 10
        };

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

        // get selected year subdivision subjects
        async function getSubjectsWithMarks(yearSubdivision: string) {
            const result: Subject[] = [];
            const index = (await getYearSubdivisions())?.indexOf(yearSubdivision) || 0;
            const table = Array.from((document.querySelector("#tabs")?.children[index + 1]?.querySelector(".inner")?.querySelector(".table_sessione.griglia_tab")?.querySelector("tbody")?.querySelectorAll("tr") || []));
            if (!table) {
                return null;
            }
            // make the table usable
            table.splice(0, 2);
            for (let i = table.length - 1; i >= 0; i--) {
                if (i % 2 !== 0) {
                    table.splice(i, 1);
                }
            }
            // get subjects with marks
            table.forEach((row) => {
                const subject: Subject = {
                    name: "",
                    marks: [],
                };
                const rowArray = Array.from(row.querySelectorAll("td"))
                subject.name = rowArray[0].textContent?.trim() || "";
                rowArray.splice(0, 2);
                rowArray.forEach((mark) => {
                    const markElement = mark.querySelector("div");
                    const possibleMark = markTable[markElement?.textContent?.trim() as string];
                    if (possibleMark && !(markElement?.classList.contains("f_reg_voto_dettaglio"))) {
                        subject.marks.push(possibleMark);
                    }
                });
                result.push(subject);
            });
            return result;
        }

        // scraping logic
        const data: MarkData = [];
        const yearSubdivisions = await getYearSubdivisions();
        if (!yearSubdivisions) {
            console.log("Year subdivisions not found");
            return null;
        }
        await yearSubdivisions.forEach(async (yearSubdivision) => {
            await selectYearSubdivision(yearSubdivision);
            const subjects = await getSubjectsWithMarks(yearSubdivision);
            if (!subjects) {
                console.log("Subjects not found");
                return null;
            }
            data.push({ name: yearSubdivision, data: subjects });
        });
        return data;
    }, page);

    await browser.close();
    return data;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authToken = searchParams.get("authToken");

        if (!authToken) {
            return NextResponse.json({ error: "Missing auth token" }, { status: 400 });
        }

        const data = await scrapeData(authToken);
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("Error scraping:", error);
        return NextResponse.json({ error: "Failed to scrape the page" }, { status: 600 });
    }
}
