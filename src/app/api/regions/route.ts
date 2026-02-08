import { NextResponse } from 'next/server';
import { getActiveRegions, getRegion, isRegionLaunched } from '@/lib/regions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const launchedOnly = searchParams.get('launched') === 'true';

    if (code) {
      // Get specific region
      const region = await getRegion(code);
      if (!region) {
        return NextResponse.json(
          { error: 'Region not found' },
          { status: 404 }
        );
      }

      const isLaunched = await isRegionLaunched(code);
      return NextResponse.json({
        ...region,
        isLaunched,
      });
    }

    // Get all regions
    const regions = await getActiveRegions();

    if (launchedOnly) {
      // Filter to launched regions only
      const launchedRegions = await Promise.all(
        regions.map(async (region) => ({
          ...region,
          isLaunched: await isRegionLaunched(region.code),
        }))
      );
      return NextResponse.json(launchedRegions.filter((r) => r.isLaunched));
    }

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
