import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmployees, addEmployee, removeEmployee, updateEmployee, isCorporateAdmin, getCorporateAccount } from '@/lib/corporate';

// GET /api/corporate/[slug]/employees - List employees
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const department = searchParams.get('department') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const employees = await getEmployees(account.id, { status, department, search, limit, offset });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Error listing employees:', error);
    return NextResponse.json(
      { error: 'Failed to list employees' },
      { status: 500 }
    );
  }
}

// POST /api/corporate/[slug]/employees - Add employee
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { userId, employeeId, department, isAdmin } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Only platform admins can make someone a corporate admin
    const adminStatus = isPlatformAdmin ? isAdmin : false;

    const employee = await addEmployee(account.id, userId, {
      employeeId,
      department,
      isAdmin: adminStatus,
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error('Error adding employee:', error);
    const message = error instanceof Error ? error.message : 'Failed to add employee';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/corporate/[slug]/employees - Update employee
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await request.json();
    const { userId, employeeId, department, isAdmin, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Only platform admins can change admin status
    const updates: Record<string, unknown> = {};
    if (employeeId !== undefined) updates.employeeId = employeeId;
    if (department !== undefined) updates.department = department;
    if (status !== undefined) updates.status = status;
    if (isPlatformAdmin && isAdmin !== undefined) updates.isAdmin = isAdmin;

    await updateEmployee(account.id, userId, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating employee:', error);
    const message = error instanceof Error ? error.message : 'Failed to update employee';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/corporate/[slug]/employees - Remove employee
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Check access
    const isPlatformAdmin = session.user.accountType === 'admin';
    const isCorpAdmin = await isCorporateAdmin(session.user.id, slug);

    if (!isPlatformAdmin && !isCorpAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const account = await getCorporateAccount(slug);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await removeEmployee(account.id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing employee:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove employee';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
