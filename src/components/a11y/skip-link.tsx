'use client';

interface SkipLinkProps {
  href?: string;
  children?: string;
}

export function SkipLink({ href = '#main-content', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        sr-only
        focus:not-sr-only
        focus:absolute
        focus:top-4
        focus:left-4
        focus:z-[9999]
        focus:px-4
        focus:py-2
        focus:bg-ocean
        focus:text-white
        focus:rounded-lg
        focus:outline-none
        focus:ring-2
        focus:ring-white
        focus:ring-offset-2
        focus:ring-offset-ocean
      "
    >
      {children}
    </a>
  );
}

// Multiple skip links for complex layouts
export function SkipLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label="Skip links">
      {links.map((link) => (
        <SkipLink key={link.href} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </nav>
  );
}
