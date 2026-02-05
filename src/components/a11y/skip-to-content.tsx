export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ocean focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:ring-offset-2 focus:font-semibold"
    >
      Skip to main content
    </a>
  );
}
