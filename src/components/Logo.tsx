import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {/* We remove the hardcoded 'w-28' from the inner div wrapper
        and let the 'className' prop control the width/height on the parent.
        We add a default width in the cn() above if you want a fallback.
      */}
      <div className="relative flex items-center justify-center w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/asset_files/Hair by Vintage/image 1.png"
          alt="Vintage"
          className="w-full h-auto object-contain" // Adapts to the parent width
        />
      </div>
      <span className="sr-only">Vintage</span>
    </div>
  );
}

export default Logo;
