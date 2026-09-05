import Clock from "@/components/Clock";
import ListenerCount from "@/components/ListenerCount";
import SocialLinks from "@/components/SocialLinks";
import Player from "@/components/Player";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      {/* 1. Fixed scene, landscape by default, portrait swap in CSS */}
      <div className="hero-bg fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
      </div>

      {/* 2. Fixed grain */}
      <div className="grain-overlay pointer-events-none fixed inset-0 -z-10" />

      {/* 3. Fixed top row */}
      <Clock />
      <ListenerCount />
      <SocialLinks />

      {/* spacer so the flex column has a top/bottom to justify-between */}
      <div aria-hidden className="flex-1" />

      {/* 4. Player, bottom-anchored */}
      <div className="relative z-20 flex w-full justify-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Player />
      </div>
    </main>
  );
}
