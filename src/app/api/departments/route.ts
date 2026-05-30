import { NextResponse } from 'next/server';
import { getDepartments } from '@/services/departmentService';

// GET /api/departments — cached 5 min at Vercel CDN edge
// Eliminates Lambda cold starts for department list fetches
export async function GET() {
  try {
    const data = await getDepartments();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
