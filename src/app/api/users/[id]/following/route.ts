import { NextRequest, NextResponse } from "next/server";
import { getUserFollowing, getFollowedCommunities } from "@/lib/follows";
import { getFollowedProjects } from "@/lib/project-follow";
import { logError } from "@/lib/logger";

// GET: Get who a user is following
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "users"; // users, projects, communities, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (type === "users") {
      const result = await getUserFollowing(id, page, limit);
      return NextResponse.json(result);
    }

    if (type === "projects") {
      const result = await getFollowedProjects(id, page, limit);
      return NextResponse.json(result);
    }

    if (type === "communities") {
      const result = await getFollowedCommunities(id, page, limit);
      return NextResponse.json(result);
    }

    if (type === "all") {
      const [users, projects, communities] = await Promise.all([
        getUserFollowing(id, 1, 10),
        getFollowedProjects(id, 1, 10),
        getFollowedCommunities(id, 1, 10),
      ]);

      return NextResponse.json({
        users: users.following,
        projects: projects.projects,
        communities: communities.communities,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    logError("api/users/following", error, { userId: id });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
