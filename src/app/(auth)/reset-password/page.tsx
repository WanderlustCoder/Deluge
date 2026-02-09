"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to reset password.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <h1 className="font-heading font-bold text-2xl text-storm mb-4">
            Invalid Link
          </h1>
          <p className="text-sm text-storm-light mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-ocean font-medium hover:underline text-sm"
          >
            Request a new reset link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <h1 className="font-heading font-bold text-2xl text-storm mb-4">
            Password Reset!
          </h1>
          <div className="bg-teal/10 text-teal rounded-lg p-4 text-sm mb-4">
            Your password has been updated. Redirecting to sign in...
          </div>
          <Link
            href="/login"
            className="text-ocean font-medium hover:underline text-sm"
          >
            Go to Sign In
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="font-heading font-bold text-2xl text-center text-storm mb-2">
          Set New Password
        </h1>
        <p className="text-sm text-storm-light text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="password"
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
        </form>

        <p className="text-sm text-storm-light text-center mt-6">
          <Link
            href="/login"
            className="text-ocean font-medium hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
