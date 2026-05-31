import { NextResponse } from 'next/server';
import { getDepartments } from '@/services/departmentService';

// GET /api/departments?h=<hospitalSlug> — cached 5 min at Vercel CDN edge
// Cache key includes ?h= so each hospital gets its own cached copy
export async function GET(request: Request) {
  const h = new URL(request.url).searchParams.get('h') ?? undefined;
  try {
    const data = await getDepartments(h);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
