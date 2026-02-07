// Geographic data URLs for react-simple-maps
// These are public domain topojson files

// US States - natural earth data
export const US_STATES_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// US Counties - for county-level drilling
export const US_COUNTIES_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

// World countries - for country selection
export const WORLD_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Idaho state FIPS code for filtering
export const IDAHO_FIPS = "16";

// Idaho county FIPS codes
export const IDAHO_COUNTY_FIPS: Record<string, string> = {
  "Ada County": "16001",
  "Canyon County": "16027",
  "Gem County": "16045",
  "Payette County": "16075",
  "Washington County": "16087",
  "Owyhee County": "16073",
  "Elmore County": "16039",
};

// Map center coordinates
export const MAP_CENTERS = {
  usa: { lat: 39.8283, lng: -98.5795, zoom: 1 },
  idaho: { lat: 44.0682, lng: -114.742, zoom: 1.5 },
  treasureValley: { lat: 43.6, lng: -116.4, zoom: 4 },
};

// Color scales for map
export const MAP_COLORS = {
  default: "#E5E7EB", // gray-200
  hover: "#93C5FD", // blue-300
  active: "#0D47A1", // ocean
  hasChildren: "#BFDBFE", // blue-200
  noData: "#F3F4F6", // gray-100
  joined: "#00897B", // teal - for communities user has joined
  joinedHover: "#4DB6AC", // teal-300
};

// County-specific colors for city markers
export const COUNTY_COLORS: Record<string, string> = {
  "Ada County": "#0D47A1", // ocean blue
  "Canyon County": "#7C3AED", // purple
  "Gem County": "#059669", // emerald
  "Payette County": "#DC2626", // red
  "Washington County": "#D97706", // amber
  "Owyhee County": "#4338CA", // indigo
  "Elmore County": "#0891B2", // cyan
};

// Get color for a county (fallback to default blue)
export function getCountyColor(countyName: string | null | undefined): string {
  if (!countyName) return "#0D47A1";
  return COUNTY_COLORS[countyName] || "#0D47A1";
}
