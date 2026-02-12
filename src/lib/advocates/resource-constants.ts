export type ResourceType =
  | "presentation"
  | "flyer"
  | "video"
  | "guide"
  | "template";

export type ResourceCategory = "welcome" | "events" | "outreach";

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "presentation", label: "Presentation" },
  { value: "flyer", label: "Flyer" },
  { value: "video", label: "Video" },
  { value: "guide", label: "Guide" },
  { value: "template", label: "Template" },
];

export const RESOURCE_CATEGORIES: {
  value: ResourceCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "welcome",
    label: "Welcoming New Members",
    description: "Materials for onboarding",
  },
  {
    value: "events",
    label: "Hosting Events",
    description: "Event planning resources",
  },
  {
    value: "outreach",
    label: "Community Outreach",
    description: "Spreading the word",
  },
];
