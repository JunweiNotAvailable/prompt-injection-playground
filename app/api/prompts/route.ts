import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Prompt } from '@/types';

// GET /api/prompts - 取得提示詞列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    let result;
    if (mode) {
      result = await sql`
        SELECT * FROM prompts
        WHERE mode = ${mode}
        ORDER BY is_active DESC, created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM prompts
        ORDER BY mode, is_active DESC, created_at DESC
      `;
    }

    const prompts: Prompt[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      mode: row.mode,
      content: row.content,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }));

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('取得提示詞列表錯誤:', error);
    return NextResponse.json(
      { error: '無法取得提示詞列表' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - 建立新提示詞
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, mode, content } = body;

    if (!name || !mode || !content) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    if (!['direct', 'indirect_email', 'indirect_database'].includes(mode)) {
      return NextResponse.json(
        { error: '無效的模式' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO prompts (name, mode, content, is_active)
      VALUES (${name}, ${mode}, ${content}, false)
      RETURNING *
    `;

    const prompt: Prompt = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      mode: result.rows[0].mode,
      content: result.rows[0].content,
      is_active: result.rows[0].is_active,
      created_at: new Date(result.rows[0].created_at),
      updated_at: new Date(result.rows[0].updated_at)
    };

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('建立提示詞錯誤:', error);
    return NextResponse.json(
      { error: '無法建立提示詞' },
      { status: 500 }
    );
  }
}
