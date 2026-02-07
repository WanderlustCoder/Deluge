"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

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

export default function NewBusinessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/business", {
      method: "POST",
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
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create listing");
      return;
    }

    toast("Business listing created!", "success");
    router.push(`/business/${data.data.id}`);
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

      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-storm dark:text-white flex items-center gap-2">
          <Store className="h-6 w-6 text-ocean" />
          Add Your Business
        </h1>
        <p className="text-storm-light dark:text-gray-400 mt-1">
          List your business for free and help others discover you
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
                placeholder="Briefly describe your business (max 50 words)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Create Listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
