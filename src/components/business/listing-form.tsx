"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const listingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(300, "Description must be under 300 characters"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ListingFormData = z.infer<typeof listingSchema>;

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

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ListingForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Create Listing",
}: ListingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const description = watch("description");
  const descriptionLength = description?.length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Business Name *
        </label>
        <input
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
          placeholder="Your business name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category *
        </label>
        <select
          {...register("category")}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
          placeholder="Describe your business (max 300 characters)"
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-sm ${descriptionLength > 300 ? "text-red-500" : "text-gray-500"}`}>
            {descriptionLength}/300
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City/Area *
          </label>
          <input
            {...register("location")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
            placeholder="e.g., Boise, ID"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Street Address
          </label>
          <input
            {...register("address")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
            placeholder="123 Main St"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website
          </label>
          <input
            {...register("website")}
            type="url"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
            placeholder="https://your-website.com"
          />
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image URL
        </label>
        <input
          {...register("imageUrl")}
          type="url"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ocean focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && (
          <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-ocean text-white rounded-lg font-medium hover:bg-ocean/90 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
