import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  isCurrency?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  isCurrency,
}: StatCardProps) {
  return (
    // Changed w-[220px] to w-full so it responds to the Grid
    <div className="bg-white p-4 text-black rounded-[20px] flex items-center justify-between w-full h-[150px]">
      {/* Left Side: Icon & Label */}
      <div className="flex flex-col justify-between h-full">
        <div className="p-2 bg-[#DC8404] rounded-full text-black w-fit">
          {icon}
        </div>
        <p className="text-gray-500 text-[12px] font-medium mt-4">{label}</p>
      </div>

      {/* Right Side: Value */}
      {/* Changed justify-between to justify-center to center the number vertically */}
      <div className="flex flex-col bg-[#F3F4F6] rounded-[20px] p-4 items-end justify-center h-full min-w-[100px]">
        <h3 className="text-2xl font-bold text-black">
          {isCurrency ? "₦" : ""}
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
      </div>
    </div>
  );
}