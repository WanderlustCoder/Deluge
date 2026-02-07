"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Camera, Receipt, CheckCircle, AlertTriangle, Flag, Plus, X } from "lucide-react";

interface GoalVerification {
  id: string;
  photoUrls: string[];
  receiptUrls: string[] | null;
  description: string | null;
  status: string;
  flagCount: number;
  submittedAt: string;
}

interface GoalVerificationFormProps {
  loanId: string;
  tier: number;
  verification: GoalVerification | null;
  isBorrower: boolean;
  isFunder: boolean;
  onUpdate: () => void;
}

export function GoalVerificationForm({
  loanId,
  tier,
  verification,
  isBorrower,
  isFunder,
  onUpdate,
}: GoalVerificationFormProps) {
  const { toast } = useToast();
  const [photoUrls, setPhotoUrls] = useState<string[]>([""]);
  const [receiptUrls, setReceiptUrls] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Tier-based requirements
  const minPhotos = tier >= 3 ? 2 : 1;
  const requiresReceipt = tier >= 3;

  function addPhotoUrl() {
    setPhotoUrls([...photoUrls, ""]);
  }

  function removePhotoUrl(index: number) {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  }

  function updatePhotoUrl(index: number, value: string) {
    const updated = [...photoUrls];
    updated[index] = value;
    setPhotoUrls(updated);
  }

  function addReceiptUrl() {
    setReceiptUrls([...receiptUrls, ""]);
  }

  function removeReceiptUrl(index: number) {
    setReceiptUrls(receiptUrls.filter((_, i) => i !== index));
  }

  function updateReceiptUrl(index: number, value: string) {
    const updated = [...receiptUrls];
    updated[index] = value;
    setReceiptUrls(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validPhotoUrls = photoUrls.filter((url) => url.trim());
    const validReceiptUrls = receiptUrls.filter((url) => url.trim());

    if (validPhotoUrls.length < minPhotos) {
      toast(`At least ${minPhotos} photo(s) required for Tier ${tier}`, "error");
      return;
    }

    if (requiresReceipt && validReceiptUrls.length === 0) {
      toast(`Receipt documentation required for Tier ${tier}`, "error");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/loans/${loanId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoUrls: validPhotoUrls,
        receiptUrls: validReceiptUrls.length > 0 ? validReceiptUrls : undefined,
        description: description || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast(data.error || "Failed to submit verification", "error");
      return;
    }

    toast("Verification submitted!", "success");
    onUpdate();
  }

  async function handleFlag() {
    const res = await fetch(`/api/loans/${loanId}/verify/flag`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.error || "Failed to flag verification", "error");
      return;
    }

    toast("Verification flagged for review. Thank you.", "success");
    onUpdate();
  }

  // Show existing verification
  if (verification) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-storm dark:text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal" />
              Goal Verification
            </h3>
            {verification.status === "flagged" && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Under Review
              </span>
            )}
            {verification.status === "approved" && (
              <span className="text-sm text-teal flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Approved
              </span>
            )}
          </div>

          {/* Photo Gallery */}
          <div className="mb-4">
            <p className="text-sm font-medium text-storm dark:text-white mb-2">Photos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {verification.photoUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Verification photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          </div>

          {/* Receipts */}
          {verification.receiptUrls && verification.receiptUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-storm dark:text-white mb-2">Receipts</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {verification.receiptUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Receipt ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {verification.description && (
            <div className="mb-4">
              <p className="text-sm font-medium text-storm dark:text-white mb-1">Description</p>
              <p className="text-storm-light dark:text-gray-400">{verification.description}</p>
            </div>
          )}

          {/* Flag button for funders */}
          {isFunder && !isBorrower && verification.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlag}
              className="text-storm-light hover:text-red-500"
            >
              <Flag className="h-4 w-4 mr-1" />
              Flag for Review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show form for borrower if not yet submitted
  if (isBorrower) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-5">
          <h3 className="font-heading font-semibold text-storm dark:text-white mb-2 flex items-center gap-2">
            <Camera className="h-5 w-5 text-ocean" />
            Verify Your Goal
          </h3>
          <p className="text-sm text-storm-light dark:text-gray-400 mb-4">
            Submit photos and documentation showing how you used the loan funds.
            {tier >= 3 && " Higher tiers require more documentation."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo URLs */}
            <div>
              <label className="block text-sm font-medium text-storm dark:text-white mb-2">
                Photo URLs ({minPhotos}+ required)
              </label>
              {photoUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    id={`photo-${index}`}
                    value={url}
                    onChange={(e) => updatePhotoUrl(index, e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1"
                  />
                  {photoUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhotoUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhotoUrl}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
            </div>

            {/* Receipt URLs (if required) */}
            {(requiresReceipt || receiptUrls.some((u) => u.trim())) && (
              <div>
                <label className="block text-sm font-medium text-storm dark:text-white mb-2">
                  Receipt URLs {requiresReceipt && "(required)"}
                </label>
                {receiptUrls.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      id={`receipt-${index}`}
                      value={url}
                      onChange={(e) => updateReceiptUrl(index, e.target.value)}
                      placeholder="https://example.com/receipt.jpg"
                      className="flex-1"
                    />
                    {receiptUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReceiptUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReceiptUrl}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Receipt
                </Button>
              </div>
            )}

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-storm dark:text-white mb-1"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell funders how you used the loan..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-storm dark:text-white placeholder:text-storm-light/60 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ocean/50 focus:border-ocean resize-none"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Submit Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // For non-borrowers viewing an unverified loan
  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <h3 className="font-heading font-semibold text-storm dark:text-white mb-2 flex items-center gap-2">
          <Camera className="h-5 w-5 text-storm-light" />
          Goal Verification
        </h3>
        <p className="text-sm text-storm-light dark:text-gray-400">
          The borrower has not yet submitted goal verification for this loan.
        </p>
      </CardContent>
    </Card>
  );
}
