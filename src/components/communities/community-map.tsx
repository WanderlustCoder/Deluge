"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Plus, Minus, Home } from "lucide-react";
import {
  US_COUNTIES_URL,
  IDAHO_FIPS,
  MAP_COLORS,
} from "@/lib/geo-data";

export type MapLevel = "country" | "state" | "county" | "city" | "district" | "neighborhood";

interface Community {
  id: string;
  name: string;
  slug: string | null;
  level: string | null;
  latitude: number | null;
  longitude: number | null;
  memberCount: number;
  isMember?: boolean;
  bounds?: string | null;
  parentId?: string | null;
  _count?: {
    children: number;
    projects: number;
  };
}

interface CommunityMapProps {
  communities: Community[]; // Counties
  onCommunityClick: (community: Community) => void;
  onCommunityHover?: (community: Community | null) => void;
  selectedCommunityId?: string;
  centerOn?: { lat: number; lng: number; zoom: number };
}

// Default center on Treasure Valley
const DEFAULT_CENTER: [number, number] = [-116.2, 43.6];
const DEFAULT_ZOOM = 1;

export function CommunityMap({
  communities,
  onCommunityClick,
  onCommunityHover,
  selectedCommunityId,
  centerOn,
}: CommunityMapProps) {
  const [position, setPosition] = useState({
    coordinates: centerOn
      ? [centerOn.lng, centerOn.lat] as [number, number]
      : DEFAULT_CENTER,
    zoom: centerOn?.zoom || DEFAULT_ZOOM,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Create lookup map from community names to data
  const communityByName = useMemo(() => {
    const map = new Map<string, Community>();
    communities.forEach((c) => {
      map.set(c.name, c);
      map.set(c.name.toLowerCase().replace(" county", ""), c);
    });
    return map;
  }, [communities]);

  // Handle zoom/pan
  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  const handleZoomIn = () => {
    setPosition((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.5) }));
  };

  const handleReset = () => {
    setPosition({
      coordinates: centerOn
        ? [centerOn.lng, centerOn.lat] as [number, number]
        : DEFAULT_CENTER,
      zoom: centerOn?.zoom || DEFAULT_ZOOM,
    });
  };

  // Get fill color for counties
  const getCountyFillColor = useCallback(
    (community: Community | undefined) => {
      if (!community) return MAP_COLORS.noData;
      if (community.id === selectedCommunityId) return MAP_COLORS.active;
      if (community.id === hoveredId) {
        return community.isMember ? MAP_COLORS.joinedHover : MAP_COLORS.hover;
      }
      if (community.isMember) return MAP_COLORS.joined;
      if (community._count && community._count.children > 0) return MAP_COLORS.hasChildren;
      return MAP_COLORS.default;
    },
    [selectedCommunityId, hoveredId]
  );

  const handleMouseEnter = (community: Community | undefined) => {
    if (community) {
      setHoveredId(community.id);
      onCommunityHover?.(community);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    onCommunityHover?.(null);
  };

  const handleGeoClick = (name: string) => {
    const countyName = name + " County";
    const community = communityByName.get(countyName) || communityByName.get(name);
    if (community) {
      onCommunityClick(community);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-foam rounded-lg border border-gray-200 overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <Plus className="h-4 w-4 text-storm" />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <Minus className="h-4 w-4 text-storm" />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          onClick={handleReset}
          title="Reset view"
        >
          <Home className="h-4 w-4 text-storm" />
        </button>
      </div>

      {/* Instruction */}
      <div className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm text-sm z-10">
        <span className="text-storm-light">Click a county to see its cities</span>
      </div>

      <div style={{ width: "100%", height: "100%" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 4000,
            center: [-115.5, 44],
          }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={handleMoveEnd}
            minZoom={0.5}
            maxZoom={8}
          >
            {/* Idaho counties */}
            <Geographies geography={US_COUNTIES_URL}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => {
                    const stateId = geo.id.toString().substring(0, 2);
                    return stateId === IDAHO_FIPS;
                  })
                  .map((geo) => {
                    const countyName = geo.properties.name + " County";
                    const community = communityByName.get(countyName);
                    const isSelected = community?.id === selectedCommunityId;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getCountyFillColor(community)}
                        stroke={isSelected ? MAP_COLORS.active : "#FFFFFF"}
                        strokeWidth={isSelected ? 2 : 0.5}
                        onMouseEnter={() => handleMouseEnter(community)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleGeoClick(geo.properties.name)}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: community
                              ? (community.isMember ? MAP_COLORS.joinedHover : MAP_COLORS.hover)
                              : MAP_COLORS.noData,
                            outline: "none",
                            cursor: community ? "pointer" : "default",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Hover tooltip */}
      {hoveredId && (() => {
        const hoveredCommunity = communities.find((c) => c.id === hoveredId);
        if (!hoveredCommunity) return null;

        return (
          <div className="absolute bottom-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md text-sm z-10 pointer-events-none">
            <p className="font-medium flex items-center gap-1.5">
              {hoveredCommunity.name}
              {hoveredCommunity.isMember && (
                <span className="text-xs px-1.5 py-0.5 bg-teal/10 text-teal rounded">Joined</span>
              )}
            </p>
            <p className="text-storm-light text-xs">
              {hoveredCommunity._count?.children || 0} cities · {hoveredCommunity.memberCount || 0} members
            </p>
          </div>
        );
      })()}
    </div>
  );
}
