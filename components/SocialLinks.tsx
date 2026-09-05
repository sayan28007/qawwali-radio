const LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/let.it.happen_07/",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5ZM17.25 6a.75.75 0 1 1-.75.75.75.75 0 0 1 .75-.75Z",
  },
  {
    label: "X",
    href: "https://x.com/Dynamic__sayan",
    path: "M3 3h4.6l4.1 5.6L16.8 3H21l-6.9 8.2L21.4 21h-4.6l-4.5-6.1L6.8 21H2.6l7.3-8.6Z",
  },
];

export default function SocialLinks() {
  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-30">
      <div className="glass flex items-center gap-1 rounded-2xl px-2 py-2">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
            className="flex h-7 w-7 items-center justify-center rounded-full text-parchment/70 transition-colors hover:bg-white/10 hover:text-brass-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-bright"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d={link.path} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
