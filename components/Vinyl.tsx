import Image from "next/image";

export default function Vinyl({
  isPlaying,
  size = 80,
}: {
  isPlaying: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 rounded-full ring-1 ring-white/15"
      style={{
        width: size,
        height: size,
        animation: "spin 8s linear infinite",
        animationPlayState: isPlaying ? "running" : "paused",
      }}
    >
      <Image
        src="/cover/station.jpg"
        alt=""
        fill
        sizes={`${size}px`}
        className="rounded-full object-cover"
        priority
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40"
        style={{ width: 12, height: 12 }}
      />
    </div>
  );
}
