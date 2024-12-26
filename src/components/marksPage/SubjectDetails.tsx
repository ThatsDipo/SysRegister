/* eslint-disable react-hooks/exhaustive-deps */
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import Gauge from "../metrics/Gauge";
import calculateAverage from "@/utils/calculateAverage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkLine from "./MarkLine";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Mark } from "@/types";
import { FileQuestion, LoaderCircle, TriangleAlert } from "lucide-react";

export default function SubjectDetails({
  name,
  firstPeriod,
  secondPeriod,
}: {
  name: string;
  firstPeriod: number[];
  secondPeriod: number[];
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [firstPeriodResults, setFirstPeriodResults] = useState<Mark[]>([]);
  const [secondPeriodResults, setSecondPeriodResults] = useState<Mark[]>([]);

  useEffect(() => {
    if (firstPeriodResults?.length === 0) {
      getDetailedMarks(name, "trimestre").then(() => {
        if (secondPeriodResults?.length === 0) {
          getDetailedMarks(name, "pentamestre");
        }
      });
    }
  }, [name]);

  const getDetailedMarks = async (
    subjectName: string,
    selectedPeriod: string
  ) => {
    if (firstPeriodResults?.length > 0 && selectedPeriod === "trimestre") {
      return;
    }
    if (secondPeriodResults?.length > 0 && selectedPeriod === "pentamestre") {
      return;
    }
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found in localStorage");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/getMarksData/details?authToken=${authToken}&subjectName=${subjectName}&periodIndex=${
          selectedPeriod == "trimestre" ? 0 : 1
        }`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch scraped result");
      }

      const result = await response.json();

      if (result.data == null) {
        setError(true);
        return;
      }

      if (selectedPeriod == "trimestre") {
        setFirstPeriodResults(result.data);
      } else {
        setSecondPeriodResults(result.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DrawerContent className="px-4 bg-secondary">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-left mb-4 mt-2 px-0 flex items-center justify-between">
            <div className="flex translate-y-1 items-start flex-col justify-center h-full">
              <DrawerTitle>
                {name.trim().toUpperCase().slice(0, name.indexOf("-"))}
              </DrawerTitle>
              <DrawerDescription>
                {name
                  .trim()
                  .slice(name.indexOf("-") + 2, name.length)
                  .charAt(0)
                  .toUpperCase() +
                  name
                    .trim()
                    .slice(name.indexOf("-") + 2, name.length)
                    .slice(1)
                    .toLowerCase()}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge
                value={parseFloat(calculateAverage(firstPeriod))}
                size={70}
              />
              <Gauge
                value={parseFloat(calculateAverage(secondPeriod))}
                size={70}
              />
            </div>
          </DrawerHeader>
          <Tabs defaultValue="trimestre" className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trimestre">1° Trimestre</TabsTrigger>
              <TabsTrigger value="pentamestre">2° Pentamestre</TabsTrigger>
            </TabsList>
            <TabsContent
              value="trimestre"
              className="space-y-3 h-[45svh] pt-3 overflow-y-auto overflow-x-hidden"
            >
              {firstPeriodResults?.length === 0 && (
                <div className="text-center h-full text-foreground">
                  {loading ? (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <LoaderCircle className="animate-spin mb-6" size={56} />
                      <p className="font-semibold">
                        Stiamo elaborando le tue valutazioni...
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Nessun dato verra&apos; salvato sui nostri server.
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <TriangleAlert className="mb-6" size={56} />
                      <p className="font-semibold">
                        Si e&apos; verificato un errore durante la connessione
                        con il registro
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Ci odiano abbastanza :/
                      </p>
                    </div>
                  ) : (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <FileQuestion className="mb-6" size={56} />
                      <p className="font-semibold">
                        Non ci sono valutazioni in questo periodo.
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Ritorna quando avrai ricevuto un voto
                      </p>
                    </div>
                  )}
                </div>
              )}
              {firstPeriodResults
                ?.slice()
                .reverse()
                .map((mark: Mark) => (
                  <MarkLine
                    key={
                      mark.date +
                      mark.value +
                      mark.note +
                      Math.random().toString(36).substring(2, 15)
                    }
                    date={mark.date}
                    value={mark.value}
                    note={mark.note}
                    type={mark.type}
                    affectsAverage={mark.affectsAverage}
                  />
                ))}
            </TabsContent>
            <TabsContent
              value="pentamestre"
              className="space-y-3 h-[45svh] pt-3 overflow-y-auto overflow-x-hidden"
            >
              {secondPeriodResults?.length === 0 && (
                <div className="text-center h-full text-foreground">
                  {loading ? (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <LoaderCircle className="animate-spin mb-6" size={56} />
                      <p className="font-semibold">
                        Stiamo elaborando le tue valutazioni...
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Nessun dato verra&apos; salvato sui nostri server.
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <TriangleAlert className="mb-6" size={56} />
                      <p className="font-semibold">
                        Si e&apos; verificato un errore durante la connessione
                        con il registro
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Ci odiano abbastanza :/
                      </p>
                    </div>
                  ) : (
                    <div className="flex text-center flex-col h-full items-center justify-center">
                      <FileQuestion className="mb-6" size={56} />
                      <p className="font-semibold">
                        Non ci sono valutazioni in questo periodo.
                      </p>
                      <p className="opacity-60 text-xs mt-1">
                        Ritorna quando avrai ricevuto un voto
                      </p>
                    </div>
                  )}
                </div>
              )}
              {secondPeriodResults
                ?.slice()
                .reverse()
                .map((mark: Mark) => (
                  <MarkLine
                    key={
                      mark.date +
                      mark.value +
                      mark.note +
                      Math.random().toString(36).substring(2, 15)
                    }
                    date={mark.date}
                    value={mark.value}
                    note={mark.note}
                    type={mark.type}
                    affectsAverage={mark.affectsAverage}
                  />
                ))}
            </TabsContent>
          </Tabs>
          <DrawerFooter className="px-0 mb-4">
            <DrawerClose asChild>
              <Button className="w-full">Ok</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </div>
  );
}
