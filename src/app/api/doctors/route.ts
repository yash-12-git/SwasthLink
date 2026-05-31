import { NextResponse } from 'next/server';
import { getDoctorsByDepartment } from '@/services/doctorService';

// GET /api/doctors?dept=X&h=<hospitalSlug> — cached 20s at Vercel CDN edge
// Short TTL so queue counts (doctor availability) stay reasonably fresh
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deptId = searchParams.get('dept');
  const h      = searchParams.get('h') ?? undefined;
  if (!deptId) return NextResponse.json([], { status: 400 });

  try {
    const data = await getDoctorsByDepartment(deptId, h);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
