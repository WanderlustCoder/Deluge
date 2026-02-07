"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  User,
  Calendar,
  Lock,
  Users,
  HandCoins,
  DollarSign,
  Award,
} from "lucide-react";

interface UserBadge {
  id: string;
  key: string;
  name: string;
  icon: string;
  tier: string;
  earnedAt: string;
}

interface ProfileData {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  profileVisibility?: string;
  memberSince: string;
  badges: UserBadge[];
  stats: {
    totalFunded: number;
    projectsBacked: number;
    loansFunded: number;
    loansAmount: number;
    communitiesJoined: number;
  };
  isOwnProfile: boolean;
}

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${params.id}/profile`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Failed to load profile");
          });
        }
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-storm-light dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Lock className="h-12 w-12 text-storm-light mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-xl text-storm dark:text-white mb-2">
          Profile Unavailable
        </h2>
        <p className="text-storm-light dark:text-gray-400 mb-6">{error}</p>
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-ocean/20 flex items-center justify-center">
                <User className="h-10 w-10 text-ocean" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading font-bold text-2xl text-storm dark:text-white">
                  {profile.name}
                </h1>
                {profile.isOwnProfile && (
                  <Link href="/account">
                    <Button size="sm" variant="outline">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="text-storm dark:text-gray-300 mb-3">
                  {profile.bio}
                </p>
              )}

              <p className="text-sm text-storm-light dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since{" "}
                {formatDistanceToNow(new Date(profile.memberSince), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-6 w-6 text-teal mx-auto mb-2" />
            <p className="font-heading font-bold text-xl text-storm dark:text-white">
              {formatCurrency(profile.stats.totalFunded)}
            </p>
            <p className="text-xs text-storm-light dark:text-gray-400">
              Total Funded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-6 w-6 text-ocean mx-auto mb-2" />
            <p className="font-heading font-bold text-xl text-storm dark:text-white">
              {profile.stats.projectsBacked}
            </p>
            <p className="text-xs text-storm-light dark:text-gray-400">
              Projects Backed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <HandCoins className="h-6 w-6 text-gold mx-auto mb-2" />
            <p className="font-heading font-bold text-xl text-storm dark:text-white">
              {profile.stats.loansFunded}
            </p>
            <p className="text-xs text-storm-light dark:text-gray-400">
              Loans Funded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 text-teal mx-auto mb-2" />
            <p className="font-heading font-bold text-xl text-storm dark:text-white">
              {profile.stats.communitiesJoined}
            </p>
            <p className="text-xs text-storm-light dark:text-gray-400">
              Communities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-heading font-semibold text-storm dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              Badges ({profile.badges.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium text-storm dark:text-white text-sm">
                      {badge.name}
                    </p>
                    <p className="text-xs text-storm-light dark:text-gray-400">
                      {formatDistanceToNow(new Date(badge.earnedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
