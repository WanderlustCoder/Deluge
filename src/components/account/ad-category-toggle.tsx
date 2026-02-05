"use client";

interface AdCategoryToggleProps {
  category: string;
  description: string;
  blocked: boolean;
  onToggle: (category: string) => void;
}

export function AdCategoryToggle({
  category,
  description,
  blocked,
  onToggle,
}: AdCategoryToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-border last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-storm dark:text-dark-text">{category}</p>
        <p className="text-xs text-storm-light dark:text-dark-text-secondary">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium ${blocked ? "text-red-500 dark:text-red-400" : "text-teal dark:text-teal-light"}`}>
          {blocked ? "Blocked" : "Showing"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={!blocked}
          aria-label={`${blocked ? "Unblock" : "Block"} ${category} ads`}
          onClick={() => onToggle(category)}
          className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            blocked ? "bg-red-400" : "bg-teal"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              blocked ? "translate-x-0" : "translate-x-5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
