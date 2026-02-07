import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  addUserSkill,
  getUserSkills,
  updateUserSkill,
  removeUserSkill,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
} from '@/lib/skills';

// GET /api/account/skills - Get user's skills
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skills = await getUserSkills(session.user.id);

    return NextResponse.json({
      skills,
      categories: SKILL_CATEGORIES,
      levels: SKILL_LEVELS,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/account/skills - Add a skill
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skill, category, level, description, isPublic } = body;

    if (!skill || !category) {
      return NextResponse.json(
        { error: 'Skill and category are required' },
        { status: 400 }
      );
    }

    const validCategories = Object.keys(SKILL_CATEGORIES);
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const userSkill = await addUserSkill(
      session.user.id,
      skill,
      category,
      level || 'intermediate',
      description,
      isPublic ?? true
    );

    return NextResponse.json({ success: true, skill: userSkill });
  } catch (error) {
    console.error('Error adding skill:', error);
    const message = error instanceof Error ? error.message : 'Failed to add skill';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/account/skills - Update a skill
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, level, description, isPublic } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    const skill = await updateUserSkill(id, session.user.id, {
      level,
      description,
      isPublic,
    });

    return NextResponse.json({ success: true, skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    const message = error instanceof Error ? error.message : 'Failed to update skill';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/account/skills - Remove a skill
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    await removeUserSkill(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing skill:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove skill';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
