/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// TODO: Make this a server component if possible, needs to not save the token.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Gauge from "@/components/custom/Gauge";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import calculateAverage from "@/utils/calculateAverage";
import Subject from "@/components/custom/Subject";
import { MarkData } from "@/types";
import Line from "@/components/custom/Line";

export default function Home() {
  const router = useRouter();
  const [result, setresult] = useState<MarkData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      router.push("/auth");
      return;
    }

    fetchScrapedresult();
  }, []);

  const fetchScrapedresult = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found in localStorage");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/getMarksData?authToken=${authToken}`);
      if (!response.ok) {
        throw new Error("Failed to fetch scraped result");
      }

      const result = await response.json();
      setresult(result.data);
    } catch (error: unknown) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    // Exact same logic as the offical website lol
    localStorage.removeItem("authToken");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex text-center flex-col min-h-[calc(100svh-60px)] items-center justify-center">
        <LoaderCircle className="animate-spin mb-6" size={56} />
        <p className="font-semibold">Stiamo elaborando le tue valutazioni...</p>
        <p className="opacity-60 text-xs mt-1">
          Nessun dato verra&apos; salvato sui nostri server.
        </p>
      </div>
    );
  }

  // TODO: Handle errors and auth token expiration
  if (error) {
    logOut();
    // return (
    //   <div className="flex text-center flex-col min-h-[calc(100svh-60px)] items-center justify-center">
    //     <TriangleAlert className="mb-6" size={56} />
    //     <p className="font-semibold">
    //       Si e&apos; verificato un errore durante la connessione con il registro
    //     </p>
    //     <div className="flex items-center pt-4 gap-2.5">
    //       <Button
    //         variant={"outline"}
    //         className="text-destructive hover:text-red-600"
    //         onClick={() => logOut()}
    //       >
    //         Logout
    //       </Button>
    //       <Button variant={"default"} onClick={() => window.location.reload()}>
    //         Riprova
    //       </Button>
    //     </div>
    //   </div>
    // );
  }

  return (
    <div className="min-h-[calc(100svh-60px)]">
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-start flex-col">
          <p className="font-bold text-lg flex items-center gap-1.5">
            SysRegister{" "}
            <span className="text-xs bg-red-600 rounded-sm px-1">BETA</span>
          </p>
          <p className="text-sm opacity-60">
            Made with 💘 by{" "}
            <a target="_blank" href="https://instagram.com/sys.white">
              @SysWhite
            </a>
          </p>
        </div>
        <Button
          variant={"outline"}
          className="text-destructive hover:text-red-600"
          onClick={() => logOut()}
        >
          Logout
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="mt-4 bg-secondary shadow-md p-4 rounded-md text-center text-foreground">
          <div className="flex justify-center items-center">
            <div className="w-full flex items-center flex-col mt-0 gap-4">
              <Gauge
                value={parseFloat(
                  calculateAverage(
                    result.flatMap((res) =>
                      res.data.flatMap((subject) => subject.marks)
                    )
                  )
                )}
                label="Media generale"
              />
              <div className="space-y-2 w-full">
                {result.flatMap((res) => (
                  <Line
                    key={res.name}
                    label={res.name}
                    value={parseFloat(
                      calculateAverage(
                        res.data.flatMap((subject) => subject.marks)
                      )
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {result[0].data.some((subject) => {
          const firstPeriodAverage = parseFloat(
            calculateAverage(subject.marks)
          );
          const secondPeriodMarks =
            result[1]?.data.find((s) => s.name === subject.name)?.marks || [];
          const secondPeriodAverage = parseFloat(
            calculateAverage(secondPeriodMarks)
          );
          let combinedAverage = (firstPeriodAverage + secondPeriodAverage) / 2;
          if (isNaN(combinedAverage)) {
            combinedAverage = firstPeriodAverage;
          }
          return combinedAverage < 6;
        }) && (
          <div>
            <p className="text-2xl font-semibold mb-2">
              Da recuperare (
              {
                result[0].data.filter((subject) => {
                  const firstPeriodAverage = parseFloat(
                    calculateAverage(subject.marks)
                  );
                  const secondPeriodMarks =
                    result[1]?.data.find((s) => s.name === subject.name)
                      ?.marks || [];
                  const secondPeriodAverage = parseFloat(
                    calculateAverage(secondPeriodMarks)
                  );
                  const combinedAverage =
                    (firstPeriodAverage + secondPeriodAverage) / 2;
                  return combinedAverage < 6;
                }).length
              }
              )
            </p>
            <div className="grid grid-cols-1 gap-2">
              {result[0].data
                .filter((subject) => {
                  const firstPeriodAverage = parseFloat(
                    calculateAverage(subject.marks)
                  );
                  const secondPeriodMarks =
                    result[1]?.data.find((s) => s.name === subject.name)
                      ?.marks || [];
                  const secondPeriodAverage = parseFloat(
                    calculateAverage(secondPeriodMarks)
                  );
                  const combinedAverage =
                    (firstPeriodAverage + secondPeriodAverage) / 2;
                  return combinedAverage < 6;
                })
                .map((subject) => (
                  <Subject
                    key={subject.name}
                    name={subject.name}
                    firstPeriod={subject.marks}
                    secondPeriod={
                      result[1]?.data.find((s) => s.name === subject.name)
                        ?.marks || []
                    }
                  />
                ))}
            </div>
          </div>
        )}
        {result[0].data.some((subject) => {
          const firstPeriodAverage = parseFloat(
            calculateAverage(subject.marks)
          );
          const secondPeriodMarks =
            result[1]?.data.find((s) => s.name === subject.name)?.marks || [];
          const secondPeriodAverage = parseFloat(
            calculateAverage(secondPeriodMarks)
          );
          let combinedAverage = (firstPeriodAverage + secondPeriodAverage) / 2;
          if (isNaN(combinedAverage)) {
            combinedAverage = firstPeriodAverage;
          }
          return combinedAverage >= 6;
        }) && (
          <div className="mb-4">
            <p className="text-2xl font-semibold mb-2">
              Sufficienti (
              {
                result[0].data.filter(
                  (subject) => parseFloat(calculateAverage(subject.marks)) >= 6
                ).length
              }
              )
            </p>
            <div className="grid grid-cols-1 gap-2">
              {result[0].data
                .filter(
                  (subject) => parseFloat(calculateAverage(subject.marks)) >= 6
                )
                .map((subject) => (
                  <Subject
                    key={subject.name}
                    name={subject.name}
                    firstPeriod={subject.marks}
                    secondPeriod={
                      result[1]?.data.find((s) => s.name === subject.name)
                        ?.marks || []
                    }
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
