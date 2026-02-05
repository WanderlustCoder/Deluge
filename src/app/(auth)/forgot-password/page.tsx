"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="font-heading font-bold text-2xl text-center text-storm mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-storm-light text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="bg-teal/10 text-teal rounded-lg p-4 text-sm">
              If an account exists with that email, we&apos;ve sent a password
              reset link. Check your inbox (and spam folder).
            </div>
            <Link
              href="/login"
              className="text-ocean font-medium hover:underline text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
            </form>

            <p className="text-sm text-storm-light text-center mt-6">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-ocean font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
