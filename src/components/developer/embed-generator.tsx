'use client';

import { useState, useMemo } from 'react';
import { Code, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { generateEmbedCode, generateDonateButtonHtml, EmbedConfig, EmbedType } from '@/lib/api/embeds';

interface EmbedGeneratorProps {
  projectId?: string;
  projectTitle?: string;
}

const EMBED_TYPES: { value: EmbedType; label: string; description: string }[] = [
  { value: 'donate-button', label: 'Donate Button', description: 'A simple button linking to the project' },
  { value: 'project-card', label: 'Project Card', description: 'A card showing project info and progress' },
  { value: 'progress-bar', label: 'Progress Bar', description: 'A minimalist funding progress bar' },
];

export function EmbedGenerator({ projectId, projectTitle }: EmbedGeneratorProps) {
  const [embedType, setEmbedType] = useState<EmbedType>('donate-button');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showProgress, setShowProgress] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#0D47A1');
  const [copied, setCopied] = useState(false);
  const [useIframe, setUseIframe] = useState(true);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://deluge.fund';

  const embedCode = useMemo(() => {
    if (!projectId) return '';

    if (embedType === 'donate-button' && !useIframe) {
      return generateDonateButtonHtml(projectId, baseUrl, {
        text: 'Support on Deluge',
        primaryColor,
      });
    }

    const config: EmbedConfig = {
      type: embedType,
      projectId,
      theme,
      size,
      showProgress,
      primaryColor,
    };

    return generateEmbedCode(config, baseUrl);
  }, [projectId, embedType, theme, size, showProgress, primaryColor, useIframe, baseUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Widget Type</label>
            <div className="space-y-2">
              {EMBED_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    embedType === type.value
                      ? 'border-ocean bg-ocean/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="embedType"
                    value={type.value}
                    checked={embedType === type.value}
                    onChange={() => setEmbedType(type.value)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">{type.label}</span>
                    <p className="text-sm text-storm/60">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {embedType === 'donate-button' && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useIframe}
                  onChange={(e) => setUseIframe(e.target.checked)}
                />
                <span className="text-sm">Use iframe (recommended)</span>
              </label>
              <p className="text-xs text-storm/60 mt-1">
                Iframe provides automatic styling. Disable for plain HTML button.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
              />
            </div>
          </div>

          {embedType !== 'donate-button' && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProgress}
                  onChange={(e) => setShowProgress(e.target.checked)}
                />
                <span className="text-sm">Show progress bar</span>
              </label>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/20 min-h-[200px] flex items-center justify-center">
            {projectId ? (
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Support on Deluge
                </div>
                <p className="text-sm text-storm/60 mt-3">
                  {projectTitle || 'Select a project'}
                </p>
              </div>
            ) : (
              <p className="text-storm/50 text-center">
                Select a project to preview the embed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Embed Code */}
      {projectId && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4" />
              Embed Code
            </label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ocean hover:bg-ocean/10 rounded transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm font-mono">
            {embedCode}
          </pre>
        </div>
      )}
    </div>
  );
}
