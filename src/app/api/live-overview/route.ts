import { NextResponse } from 'next/server';
import { getLiveOverview } from '@/services/departmentService';

// GET /api/live-overview — cached 10s at Vercel CDN edge
// Changes on every token advance but a short stale window is acceptable for a home page strip
export async function GET() {
  try {
    const data = await getLiveOverview();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
