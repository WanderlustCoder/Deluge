import { Droplets } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <p className="text-sm text-storm-light">
            &copy; {new Date().getFullYear()} Deluge Fund PBC. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
