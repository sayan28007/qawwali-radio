function IconButton({
  label,
  onClick,
  size = "md",
  children,
}: {
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  const dim = size === "md" ? "h-10 w-10" : "h-8 w-8";
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex ${dim} items-center justify-center rounded-full text-parchment transition-colors hover:bg-white/10 active:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-bright`}
    >
      {children}
    </button>
  );
}

export default function Transport({
  isPlaying,
  onPrev,
  onToggle,
  onNext,
}: {
  isPlaying: boolean;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <IconButton label="Previous track" onClick={onPrev} size="sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M7 6a1 1 0 0 1 2 0v12a1 1 0 1 1-2 0Zm3.2 5.15 8.36-5.86A1 1 0 0 1 20 6.13v11.74a1 1 0 0 1-1.44.84l-8.36-5.86a1 1 0 0 1 0-1.7Z" />
        </svg>
      </IconButton>

      <IconButton label={isPlaying ? "Pause" : "Play"} onClick={onToggle}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M8 5.5A1.5 1.5 0 0 1 9.5 4h1A1.5 1.5 0 0 1 12 5.5v13A1.5 1.5 0 0 1 10.5 20h-1A1.5 1.5 0 0 1 8 18.5Zm6.5 0A1.5 1.5 0 0 1 16 4h1a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 17 20h-1a1.5 1.5 0 0 1-1.5-1.5Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M8.5 5.65a1 1 0 0 1 1.53-.85l9 6.35a1 1 0 0 1 0 1.7l-9 6.35a1 1 0 0 1-1.53-.85Z" />
          </svg>
        )}
      </IconButton>

      <IconButton label="Next track" onClick={onNext} size="sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M17 6a1 1 0 0 0-2 0v12a1 1 0 1 0 2 0ZM13.8 11.15 5.44 5.29A1 1 0 0 0 4 6.13v11.74a1 1 0 0 0 1.44.84l8.36-5.86a1 1 0 0 0 0-1.7Z" />
        </svg>
      </IconButton>
    </div>
  );
}
