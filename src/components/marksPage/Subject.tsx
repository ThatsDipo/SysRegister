import calculateAverage from "@/utils/calculateAverage";
import Gauge from "@/components/metrics/Gauge";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import SubjectDetails from "./SubjectDetails";
import { ChevronRight } from "lucide-react";

// TODO: Use a "subject" type or an array to figure out what to show, no need to manually pass the periods
export default function Subject({
  name,
  firstPeriod,
  secondPeriod,
}: {
  name: string;
  firstPeriod: number[];
  secondPeriod: number[];
}) {
  return (
    <div>
      <Drawer>
        <DrawerTrigger asChild>
          <div className="cursor-pointer bg-secondary shadow-md p-4 rounded-md text-foreground">
            <div className="text-md flex items-center gap-2 justify-between mb-2 ">
              <h2 className="truncate font-semibold uppercase">{name}</h2>
              <ChevronRight className="opacity-40" size={20} />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Gauge
                label="Trimestre"
                value={parseFloat(calculateAverage(firstPeriod))}
                size={80}
              />
              <Gauge
                label="Pentamestre"
                value={parseFloat(calculateAverage(secondPeriod))}
                size={80}
              />
            </div>
          </div>
        </DrawerTrigger>
        <SubjectDetails
          name={name}
          firstPeriod={firstPeriod}
          secondPeriod={secondPeriod}
        />
      </Drawer>
    </div>
  );
}
