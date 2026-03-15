import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const [countResult, recordsResult] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total FROM attack_records`,
      sql`
        SELECT * FROM attack_records
        ORDER BY timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    ]);

    const total: number = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      records: recordsResult.rows,
      pagination: { page, limit, total, totalPages }
    });
  } catch (error) {
    console.error('取得攻擊記錄錯誤:', error);
    return NextResponse.json(
      { error: '無法取得攻擊記錄' },
      { status: 500 }
    );
  }
}
