import Clock from "@/components/Clock";
import ListenerCount from "@/components/ListenerCount";
import SocialLinks from "@/components/SocialLinks";
import Player from "@/components/Player";
import TimeOfDayBackground from "@/components/TimeOfDayBackground";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      {/* 1. Fixed scene — swaps by local time of day, landscape/portrait per orientation */}
      <TimeOfDayBackground />

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
