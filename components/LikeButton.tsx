"use client";

export default function LikeButton({
  liked,
  onClick,
}: {
  liked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={liked ? "Unlike this song" : "Like this song"}
      aria-pressed={liked}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
        liked ? "text-brass-bright" : "text-white/60"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7-4.35-9.5-8.5C.8 9 2 5.5 5.2 4.6 7.4 4 9.6 5 11 6.8 12.4 5 14.6 4 16.8 4.6 20 5.5 21.2 9 19.5 12.5 17 16.65 12 21 12 21Z" />
      </svg>
    </button>
  );
}
