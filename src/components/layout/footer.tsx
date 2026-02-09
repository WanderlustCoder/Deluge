import Link from "next/link";
import { Droplets } from "lucide-react";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/about/how-it-works", label: "How It Works" },
  { href: "/about/transparency", label: "Transparency" },
  { href: "/about/team", label: "Team" },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-ocean" />
              <span className="font-heading font-bold text-sm tracking-wide text-ocean">
                DELUGE
              </span>
              <span className="text-sm text-storm-light ml-2">
                One by One, All at Once.
              </span>
            </div>
            <nav className="flex items-center gap-4" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-storm-light hover:text-ocean transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-storm-light">
              &copy; {new Date().getFullYear()} Deluge Fund PBC. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
