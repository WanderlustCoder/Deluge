// GET/POST /api/admin/institutions - Super admin institution management

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  listInstitutions,
  createInstitution,
  InstitutionType,
  InstitutionTier,
  InstitutionStatus,
} from '@/lib/institutions';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as InstitutionStatus | null;
  const type = searchParams.get('type') as InstitutionType | null;

  try {
    const institutions = await listInstitutions({
      status: status || undefined,
      type: type || undefined,
    });

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json({ error: 'Failed to fetch institutions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.accountType !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      type,
      adminEmail,
      description,
      tier,
      contractStart,
      contractEnd,
      monthlyFee,
    } = body;

    if (!name || !slug || !type || !adminEmail || !contractStart) {
      return NextResponse.json(
        { error: 'Name, slug, type, adminEmail, and contractStart are required' },
        { status: 400 }
      );
    }

    const institution = await createInstitution({
      name,
      slug,
      type: type as InstitutionType,
      adminEmail,
      description,
      tier: tier as InstitutionTier,
      contractStart: new Date(contractStart),
      contractEnd: contractEnd ? new Date(contractEnd) : undefined,
      monthlyFee,
    });

    return NextResponse.json(institution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json({ error: 'Failed to create institution' }, { status: 500 });
  }
}
