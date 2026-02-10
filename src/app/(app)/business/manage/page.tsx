"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Store, Trash2, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const CATEGORIES = [
  "Food & Dining",
  "Retail",
  "Services",
  "Health & Wellness",
  "Home & Garden",
  "Professional",
  "Entertainment",
  "Other",
];

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
  _count: { views: number };
}

export default function ManageBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Fetch user's listing
    fetch("/api/business?limit=1")
      .then((res) => res.json())
      .then((data) => {
        const userListing = data.listings?.find((l: BusinessListing) => true); // First one
        if (userListing) {
          setListing(userListing);
          setName(userListing.name);
          setCategory(userListing.category);
          setDescription(userListing.description);
          setLocation(userListing.location);
          setAddress(userListing.address || "");
          setPhone(userListing.phone || "");
          setWebsite(userListing.website || "");
          setImageUrl(userListing.imageUrl || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;

    setError("");
    setSaving(true);

    const res = await fetch(`/api/business/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        description,
        location,
        address: address || undefined,
        phone: phone || undefined,
        website: website || undefined,
        imageUrl: imageUrl || undefined,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to update listing");
      return;
    }

    toast("Listing updated!", "success");
  }

  async function handleDelete() {
    if (!listing) return;

    if (!confirm("Are you sure you want to delete your business listing?")) {
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/business/${listing.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    setDeleting(false);

    if (!res.ok) {
      toast(data.error || "Failed to delete listing", "error");
      return;
    }

    toast("Listing deleted", "success");
    router.push("/business");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Store className="h-12 w-12 text-storm-light mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl text-storm dark:text-white mb-2">
          No Business Listing
        </h2>
        <p className="text-storm-light dark:text-gray-400 mb-6">
          You haven&apos;t created a business listing yet.
        </p>
        <Link href="/business/new">
          <Button>Create Your Listing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/business"
          className="text-sm text-ocean hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-storm dark:text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-ocean" />
            Manage Your Business
          </h1>
          <p className="text-storm-light dark:text-gray-400 mt-1 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {listing._count.views} total views
          </p>
        </div>
        <Link href={`/business/${listing.id}`}>
          <Button variant="outline" size="sm">
            View Listing
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              id="name"
              label="Business Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-storm dark:text-white"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-storm dark:text-white"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
                required
              />
            </div>

            <Input
              id="location"
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <Input
              id="address"
              label="Street Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Input
              id="phone"
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              id="website"
              label="Website (optional)"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <Input
              id="imageUrl"
              label="Image URL (optional)"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={saving} className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-5">
          <h3 className="font-heading font-semibold text-storm dark:text-white mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
            Deleting your listing will remove it from the directory permanently.
          </p>
          <Button
            variant="outline"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
