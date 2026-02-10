"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Eye,
  ArrowLeft,
  ExternalLink,
  Droplet,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface BusinessListing {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  tier: string;
  owner: { id: string; name: string };
  _count: { views: number };
}

export default function BusinessDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [credit, setCredit] = useState(0);

  useEffect(() => {
    fetch(`/api/business/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setListing(data);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Record view when page loads
  useEffect(() => {
    if (listing && !viewRecorded) {
      fetch(`/api/business/${params.id}/view`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.viewRecorded) {
            setViewRecorded(true);
            setCredit(data.watershedCredit);
            toast(
              `Earned ${formatCurrency(data.watershedCredit)} viewing this business!`,
              "success"
            );
          }
        })
        .catch(() => {});
    }
  }, [listing, viewRecorded, params.id, toast]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-storm-light dark:text-gray-400">Business not found.</p>
        <Link href="/business">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/business"
          className="text-sm text-ocean hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Link>
      </div>

      {/* Credit earned banner */}
      {viewRecorded && credit > 0 && (
        <div className="bg-teal/10 border border-teal/30 rounded-lg p-3 mb-6 flex items-center gap-2">
          <Droplet className="h-5 w-5 text-teal" />
          <span className="text-sm text-teal">
            You earned {formatCurrency(credit)} for viewing this business!
          </span>
        </div>
      )}

      <Card>
        <CardContent className="pt-0">
          {listing.imageUrl && (
            <div className="relative h-48 -mx-6 mb-4">
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="w-full h-full object-cover rounded-t-xl"
              />
              {listing.tier === "enhanced" && (
                <Badge variant="gold" className="absolute top-4 right-4">
                  <Star className="h-3 w-3 mr-1" />
                  Featured Business
                </Badge>
              )}
            </div>
          )}

          <div className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
                  {listing.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="ocean">{listing.category}</Badge>
                  <span className="text-sm text-storm-light dark:text-gray-400 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing._count.views} views
                  </span>
                </div>
              </div>
              {listing.tier === "enhanced" && !listing.imageUrl && (
                <Badge variant="gold">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            <p className="text-storm dark:text-gray-300 leading-relaxed mb-6">
              {listing.description}
            </p>

            {/* Contact Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ocean mt-0.5" />
                <div>
                  <p className="text-storm dark:text-white">{listing.location}</p>
                  {listing.address && (
                    <p className="text-sm text-storm-light dark:text-gray-400">
                      {listing.address}
                    </p>
                  )}
                </div>
              </div>

              {listing.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-ocean" />
                  <a
                    href={`tel:${listing.phone}`}
                    className="text-storm dark:text-white hover:text-ocean"
                  >
                    {listing.phone}
                  </a>
                </div>
              )}

              {listing.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-ocean" />
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ocean hover:underline flex items-center gap-1"
                  >
                    {listing.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <p className="text-sm text-storm-light dark:text-gray-400 mt-4">
              Listed by {listing.owner.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
