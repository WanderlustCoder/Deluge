'use client';

import { FileText, Presentation, Video, FileCheck, File } from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    category: string;
    fileUrl?: string | null;
    content?: string | null;
  };
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  presentation: Presentation,
  flyer: FileText,
  video: Video,
  guide: FileCheck,
  template: File,
};

const TYPE_LABELS: Record<string, string> = {
  presentation: 'Presentation',
  flyer: 'Flyer',
  video: 'Video',
  guide: 'Guide',
  template: 'Template',
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = TYPE_ICONS[resource.type] || File;

  const handleClick = () => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <div
      onClick={resource.fileUrl ? handleClick : undefined}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
        resource.fileUrl ? 'cursor-pointer hover:border-ocean-300 dark:hover:border-ocean-600' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center text-ocean-600 dark:text-ocean-400 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {resource.title}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {TYPE_LABELS[resource.type] || resource.type}
            </span>
          </div>

          {resource.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {resource.description}
            </p>
          )}

          {resource.fileUrl && (
            <p className="text-sm text-ocean-600 dark:text-ocean-400 mt-2">
              Click to open
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
