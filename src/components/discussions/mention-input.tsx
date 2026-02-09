"use client";

import { useState, useRef, useEffect } from "react";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface UserSuggestion {
  id: string;
  name: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: MentionInputProps) {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect @mention trigger
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);

    // Find the last @ that isn't followed by a space
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if we're in a valid mention (no spaces after @)
      if (!afterAt.includes(" ") && afterAt.length > 0) {
        setMentionQuery(afterAt);
        setMentionStart(lastAtIndex);
        fetchSuggestions(afterAt);
        setShowSuggestions(true);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionQuery("");
    setMentionStart(-1);
  }, [value]);

  async function fetchSuggestions(query: string) {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.users || []);
        setSelectedIndex(0);
      }
    } catch {
      setSuggestions([]);
    }
  }

  function insertMention(user: UserSuggestion) {
    if (mentionStart === -1) return;

    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${before}@${user.name} ${after}`;

    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);

    // Move cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = mentionStart + user.name.length + 2;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-storm/30 rounded-lg focus:ring-2 focus:ring-sky focus:border-transparent resize-none"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-w-xs bg-white dark:bg-ocean-dark border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                i === selectedIndex
                  ? "bg-sky/10 text-ocean"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">@{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
