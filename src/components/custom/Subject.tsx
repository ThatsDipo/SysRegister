import calculateAverage from "@/utils/calculateAverage";
import Gauge from "./Gauge";

// TODO: Use a "subject" type or an array to figure out what to show, no need to manually pass the periods
export default function Subject({name, firstPeriod, secondPeriod}: { name: string; firstPeriod: number[]; secondPeriod: number[] }) {

  return (
    <div className="bg-secondary shadow-md p-4 rounded-md text-foreground">
      <h2 className="text-md truncate font-semibold mb-2 uppercase">{name}</h2>
      <div className="flex items-center justify-center gap-4 mt-4">
        <Gauge label="Trimestre" value={parseFloat(calculateAverage(firstPeriod))} size={80} />
        <Gauge label="Pentamestre" value={parseFloat(calculateAverage(secondPeriod))} size={80} />
      </div>
    </div>
  );
}
