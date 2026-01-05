import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode; // Pass the icon component
  isCurrency?: boolean;
  trendDirection?: "up" | "down"; // Add trend direction
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  isCurrency,
  trendDirection = "up", // Default to up
}: StatCardProps) {
  const isUp = trendDirection === "up";
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
  const trendColorClass = isUp
    ? "text-green-600 bg-[#EBF9F1]"
    : "text-red-600 bg-[#FEE2E2]";

  return (
    <div className="bg-white p-4  text-black rounded-[20px] flex items-center justify-between w-[220px] h-[150px]">
      {/* Left Side: Icon & Label */}
      <div className="flex flex-col justify-between h-full">
        <div className="p-2 bg-[#DC8404] rounded-full text-black w-fit">
          {icon}
        </div>
        <p className="text-wh text-[12px] font-medium mt-4">{label}</p>
      </div>

      {/* Right Side: Value & Trend */}
      <div className="flex flex-col bg-[#F3F4F6] rounded-[20px] p-4 items-end justify-between h-full">
        <h3 className="text-2xl font-bold text-black">
          {isCurrency ? "₦" : ""}
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>

        <div
          className={cn(
            "flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full",
            trendColorClass
          )}
        >
          <TrendIcon size={10} /> {trend}%
        </div>
      </div>
    </div>
  );
}
