import Link from "next/link";
import { Droplets } from "lucide-react";

const platformLinks = [
  { href: "/about", label: "About" },
  { href: "/about/how-it-works", label: "How It Works" },
  { href: "/about/transparency", label: "Transparency" },
  { href: "/about/team", label: "Team" },
  { href: "/about/roadmap", label: "Roadmap" },
];

const resourceLinks = [
  { href: "/transparency", label: "Reports" },
  { href: "/stories", label: "Stories" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/trust", label: "Trust & Safety" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Droplets className="h-5 w-5 text-ocean dark:text-sky" />
              <span className="font-heading font-bold text-sm tracking-wide text-ocean dark:text-sky">
                DELUGE
              </span>
            </Link>
            <p className="text-sm text-storm-light leading-relaxed">
              Community-driven giving. Your attention becomes action, flowing into
              projects that change lives.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-storm mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-storm mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-storm mb-3">
              Get Started
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-storm mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-storm-light">
            &copy; {new Date().getFullYear()} Deluge Fund PBC. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
