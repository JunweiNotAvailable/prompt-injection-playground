import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT * FROM customers
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ customers: result.rows });
  } catch (error) {
    console.error('取得客戶列表錯誤:', error);
    return NextResponse.json(
      { error: '無法取得客戶列表' },
      { status: 500 }
    );
  }
}
