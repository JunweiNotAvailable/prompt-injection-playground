import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await sql`
      SELECT * FROM orders
      WHERE id = ${id}
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '找不到訂單' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ order: result.rows[0] });
  } catch (error) {
    console.error('取得訂單詳情錯誤:', error);
    return NextResponse.json(
      { error: '無法取得訂單詳情' },
      { status: 500 }
    );
  }
}
