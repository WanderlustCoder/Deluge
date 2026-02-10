"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Retail",
  "Services",
  "Health & Wellness",
  "Home Services",
  "Professional",
  "Entertainment",
  "Education",
  "Automotive",
  "Other",
];

interface Listing {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export default function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/business/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data: Listing = await res.json();

        setName(data.name);
        setCategory(data.category);
        setDescription(data.description);
        setLocation(data.location);
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setWebsite(data.website || "");
        setImageUrl(data.imageUrl || "");
        setIsActive(data.isActive);
      } catch {
        toast("Listing not found", "error");
        router.push("/business/my");
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id, router, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/business/${id}`, {
        method: "PUT",
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
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update listing");
        return;
      }

      toast("Listing updated!", "success");
      router.push(`/business/${id}`);
    } catch {
      setError("Failed to update listing");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/business/my"
          className="text-sm text-ocean hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Listings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-storm dark:text-white flex items-center gap-2">
          <Store className="h-6 w-6 text-ocean" />
          Edit Listing
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          Update your business information
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Business Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your business name"
              required
            />

            <Select
              id="category"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <div>
              <Textarea
                id="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Briefly describe your business (max 300 characters)"
                required
              />
              <p className="text-xs text-storm-light dark:text-gray-400 text-right">
                {description.length}/300
              </p>
            </div>

            <Input
              id="location"
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or neighborhood"
              required
            />

            <Input
              id="address"
              label="Street Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
            />

            <Input
              id="phone"
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />

            <Input
              id="website"
              label="Website (optional)"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourbusiness.com"
            />

            <Input
              id="imageUrl"
              label="Image URL (optional)"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-ocean focus:ring-ocean"
              />
              <label
                htmlFor="isActive"
                className="text-sm text-storm dark:text-white"
              >
                Listing is active and visible
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" loading={saving} className="flex-1">
                Save Changes
              </Button>
              <Link href={`/business/${id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
