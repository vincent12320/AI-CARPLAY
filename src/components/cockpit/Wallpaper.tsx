import wallpaper from "@/assets/wallpaper-snow.jpg";

export function Wallpaper() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <img
        src={wallpaper}
        alt=""
        width={1920}
        height={1216}
        className="h-full w-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
    </div>
  );
}
