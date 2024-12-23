export default function Line({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-start overflow-hidden flex-col">
      <p className="font-semibold">{label}</p>
      <div className="relative w-full bg-neutral-700">
        <div
          className={`asbolute block text-right top-0 bottom-0 left-0 ${
            value <= 5.5
              ? "bg-red-600"
              : value <= 6.0
              ? "bg-yellow-600"
              : "bg-green-600"
          }`}
          style={{ width: `${(isNaN(value) ? 0 : value) * 10}%` }}
        >
          <span className="font-semibold mr-1.5 ml-1.5">
            {isNaN(value) ? 0 : value}
            <span className="text-xs font-normal">/10</span>
          </span>
        </div>
      </div>
    </div>
  );
}
