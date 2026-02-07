"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { Store, Plus, Edit2, Trash2, Eye, Star, Bookmark, ArrowLeft } from "lucide-react";

interface MyListing {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string | null;
  tier: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    views: number;
    saves: number;
    recommendations: number;
  };
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      const res = await fetch("/api/business?mine=true");
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      toast("Failed to load your listings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/business/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setListings((prev) => prev.filter((l) => l.id !== id));
      toast("Listing deleted", "success");
    } catch {
      toast("Failed to delete listing", "error");
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/business"
          className="text-sm text-ocean hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-ocean" />
            My Business Listings
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1">
            Manage your business listings and track engagement
          </p>
        </div>
        <Link href="/business/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Listing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-center py-12">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-storm dark:text-white mb-2">
              No listings yet
            </h3>
            <p className="text-storm-light dark:text-gray-400 mb-6">
              Create your first business listing to reach the community
            </p>
            <Link href="/business/new">
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Create Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="pt-5">
                <div className="flex gap-6">
                  <div className="w-32 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🏪
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/business/${listing.id}`}
                          className="font-heading font-semibold text-lg text-storm dark:text-white hover:text-ocean"
                        >
                          {listing.name}
                        </Link>
                        <p className="text-sm text-ocean">{listing.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={listing.isActive ? "teal" : "default"}>
                          {listing.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {listing.tier === "enhanced" && (
                          <Badge variant="gold">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-storm-light dark:text-gray-400 text-sm mt-2 line-clamp-1">
                      {listing.description}
                    </p>

                    <div className="flex items-center gap-6 mt-4 text-sm text-storm-light dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing._count.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        {listing._count.saves} saves
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {listing._count.recommendations} recs
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/business/${listing.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteListing(listing.id, listing.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
