"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CommunityMap } from "@/components/communities/community-map";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  List,
  MapPin,
  Users,
  FolderOpen,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Home,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
  slug: string | null;
  level: string | null;
  latitude: number | null;
  longitude: number | null;
  memberCount: number;
  isMember?: boolean;
  parentId?: string | null;
  _count?: {
    children: number;
    projects: number;
  };
}

export default function CommunitiesMapPage() {
  const router = useRouter();
  const [counties, setCounties] = useState<Community[]>([]);
  const [cities, setCities] = useState<Community[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state for drill-down
  const [selectedCounty, setSelectedCounty] = useState<Community | null>(null);
  const [selectedCity, setSelectedCity] = useState<Community | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<Community | null>(null);

  // Load all geographic levels
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/communities/hierarchy?level=county&includeStats=true").then((r) => r.json()),
      fetch("/api/communities/hierarchy?level=city&includeStats=true").then((r) => r.json()),
      fetch("/api/communities/hierarchy?level=neighborhood&includeStats=true").then((r) => r.json()).catch(() => []),
    ])
      .then(([countyData, cityData, neighborhoodData]) => {
        setCounties(countyData);
        setCities(cityData);
        setNeighborhoods(neighborhoodData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle county click from map
  const handleCountyClick = useCallback((county: Community) => {
    setSelectedCounty(county);
    setSelectedCity(null);
  }, []);

  // Handle city click from sidebar
  const handleCityClick = useCallback((city: Community) => {
    setSelectedCity(city);
  }, []);

  // Go back one level
  const handleBack = useCallback(() => {
    if (selectedCity) {
      setSelectedCity(null);
    } else if (selectedCounty) {
      setSelectedCounty(null);
    }
  }, [selectedCity, selectedCounty]);

  // Get cities for selected county
  const filteredCities = selectedCounty
    ? cities.filter((c) => c.parentId === selectedCounty.id)
    : [];

  // Get neighborhoods for selected city
  const filteredNeighborhoods = selectedCity
    ? neighborhoods.filter((c) => c.parentId === selectedCity.id)
    : [];

  // Calculate stats
  const totalCities = cities.length;
  const joinedCommunities = [...counties, ...cities, ...neighborhoods].filter((c) => c.isMember).length;

  // Current breadcrumb path
  const getBreadcrumb = () => {
    const parts = ["Idaho"];
    if (selectedCounty) parts.push(selectedCounty.name);
    if (selectedCity) parts.push(selectedCity.name);
    return parts;
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm">
            Explore Communities
          </h1>
          <p className="text-storm-light text-sm">
            Select a county to browse cities and neighborhoods
          </p>
        </div>
        <Link href="/communities">
          <Button variant="outline" size="sm">
            <List className="h-4 w-4 mr-1.5" />
            List View
          </Button>
        </Link>
      </div>

      {/* Main content - Map + Sidebar */}
      <div className="flex gap-4 h-[calc(100%-4rem)]">
        {/* Map */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-storm-light">Loading map...</p>
            </div>
          ) : (
            <CommunityMap
              communities={counties}
              onCommunityClick={handleCountyClick}
              onCommunityHover={setHoveredCommunity}
              selectedCommunityId={selectedCounty?.id}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Breadcrumb header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-1 text-sm">
              {(selectedCounty || selectedCity) && (
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 rounded hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-storm-light" />
                </button>
              )}
              {getBreadcrumb().map((part, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />}
                  <span className={i === getBreadcrumb().length - 1 ? "font-medium text-storm" : "text-storm-light"}>
                    {part}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {!selectedCounty ? (
              /* No county selected - show prompt */
              <div className="p-6 text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-storm-light text-sm">
                  Click a county on the map to see its communities
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-storm-light mb-2">Quick stats</p>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-storm">{counties.length}</p>
                      <p className="text-xs text-storm-light">Counties</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-storm">{totalCities}</p>
                      <p className="text-xs text-storm-light">Cities</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-teal">{joinedCommunities}</p>
                      <p className="text-xs text-storm-light">Joined</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : !selectedCity ? (
              /* County selected - show cities */
              <div className="p-3">
                {/* County info */}
                <div className="mb-3 p-3 bg-ocean/5 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-storm">{selectedCounty.name}</p>
                      <p className="text-xs text-storm-light mt-0.5">
                        {filteredCities.length} cities · {selectedCounty.memberCount} members
                      </p>
                    </div>
                    {selectedCounty.isMember && (
                      <Badge variant="success" className="text-xs">
                        <Check className="h-3 w-3 mr-0.5" />
                        Joined
                      </Badge>
                    )}
                  </div>
                  <Link href={`/communities/${selectedCounty.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View County Page
                    </Button>
                  </Link>
                </div>

                {/* Cities list */}
                <p className="text-xs font-medium text-storm-light uppercase tracking-wide mb-2 px-1">
                  Cities ({filteredCities.length})
                </p>
                <div className="space-y-1">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCityClick(city)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-ocean" />
                          <span className="font-medium text-storm text-sm">{city.name}</span>
                          {city.isMember && (
                            <span className="text-xs px-1.5 py-0.5 bg-teal/10 text-teal rounded">Joined</span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-storm transition-colors" />
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-6 text-xs text-storm-light">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {city.memberCount}
                        </span>
                        {city._count && city._count.children > 0 && (
                          <span className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            {city._count.children} neighborhoods
                          </span>
                        )}
                        {city._count && (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {city._count.projects}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="text-sm text-storm-light text-center py-4">
                      No cities in this county yet
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* City selected - show neighborhoods */
              <div className="p-3">
                {/* City info */}
                <div className="mb-3 p-3 bg-ocean/5 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-ocean" />
                        <p className="font-medium text-storm">{selectedCity.name}</p>
                      </div>
                      <p className="text-xs text-storm-light mt-0.5">
                        {filteredNeighborhoods.length} neighborhoods · {selectedCity.memberCount} members
                      </p>
                    </div>
                    {selectedCity.isMember && (
                      <Badge variant="success" className="text-xs">
                        <Check className="h-3 w-3 mr-0.5" />
                        Joined
                      </Badge>
                    )}
                  </div>
                  <Link href={`/communities/${selectedCity.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View City Page
                    </Button>
                  </Link>
                </div>

                {/* Neighborhoods list */}
                {filteredNeighborhoods.length > 0 ? (
                  <>
                    <p className="text-xs font-medium text-storm-light uppercase tracking-wide mb-2 px-1">
                      Neighborhoods ({filteredNeighborhoods.length})
                    </p>
                    <div className="space-y-1">
                      {filteredNeighborhoods.map((neighborhood) => (
                        <Link
                          key={neighborhood.id}
                          href={`/communities/${neighborhood.id}`}
                          className="block w-full text-left p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-storm text-sm">{neighborhood.name}</span>
                              {neighborhood.isMember && (
                                <span className="text-xs px-1.5 py-0.5 bg-teal/10 text-teal rounded">Joined</span>
                              )}
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-storm transition-colors" />
                          </div>
                          <div className="flex items-center gap-3 mt-1 ml-6 text-xs text-storm-light">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {neighborhood.memberCount}
                            </span>
                            {neighborhood._count && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="h-3 w-3" />
                                {neighborhood._count.projects}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Home className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-storm-light">
                      No neighborhoods defined yet
                    </p>
                    <p className="text-xs text-storm-light mt-1">
                      Visit the city page to explore projects and members
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal"></span>
                <span className="text-storm-light">Joined</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-200"></span>
                <span className="text-storm-light">Has cities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-200"></span>
                <span className="text-storm-light">Empty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
