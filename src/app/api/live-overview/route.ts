import { NextResponse } from 'next/server';
import { getLiveOverview } from '@/services/departmentService';

// GET /api/live-overview?h=<hospitalSlug> — cached 10s at Vercel CDN edge
// Changes on every token advance but a short stale window is acceptable for a home page strip
export async function GET(request: Request) {
  const h = new URL(request.url).searchParams.get('h') ?? undefined;
  try {
    const data = await getLiveOverview(h);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
