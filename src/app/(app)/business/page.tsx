"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, MapPin, Plus, Star, ExternalLink } from "lucide-react";

interface BusinessListing {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string | null;
  tier: string;
  owner: { name: string };
  _count: { views: number };
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Retail",
  "Services",
  "Health & Wellness",
  "Home & Garden",
  "Professional",
  "Entertainment",
  "Other",
];

export default function BusinessDirectoryPage() {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  async function fetchListings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);

    const res = await fetch(`/api/business?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();
  }, [category]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchListings();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
            Business Directory
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1">
            Discover local businesses and earn watershed credits
          </p>
        </div>
        <Link href="/business/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Your Business
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardContent className="pt-5">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-storm-light" />
              <Input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  category === cat
                    ? "bg-ocean text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-storm dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-center py-12">
            <p className="text-storm-light dark:text-gray-400">
              No businesses yet. Be the first to add yours!
            </p>
            <Link href="/business/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Add Your Business
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
            {total} business{total !== 1 ? "es" : ""} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/business/${listing.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-4">
                    {listing.imageUrl && (
                      <div className="relative h-32 -mx-4 -mt-4 mb-4">
                        <img
                          src={listing.imageUrl}
                          alt={listing.name}
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                        {listing.tier === "enhanced" && (
                          <Badge
                            variant="gold"
                            className="absolute top-2 right-2"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold text-storm dark:text-white">
                        {listing.name}
                      </h3>
                      {!listing.imageUrl && listing.tier === "enhanced" && (
                        <Badge variant="gold" className="ml-2 flex-shrink-0">
                          <Star className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    <Badge variant="ocean" className="mb-2">
                      {listing.category}
                    </Badge>

                    <p className="text-sm text-storm-light dark:text-gray-400 line-clamp-2 mb-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-storm-light dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.location}
                      </span>
                      <span>{listing._count.views} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
