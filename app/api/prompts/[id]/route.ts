import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Prompt } from '@/types';

// PUT /api/prompts/[id] - 更新提示詞
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, content, is_active } = body;

    // 如果要設為啟用，先將同模式的其他提示詞設為停用
    if (is_active === true) {
      const currentPrompt = await sql`
        SELECT mode FROM prompts WHERE id = ${id}
      `;
      
      if (currentPrompt.rows.length > 0) {
        await sql`
          UPDATE prompts
          SET is_active = false
          WHERE mode = ${currentPrompt.rows[0].mode} AND id != ${id}
        `;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await sql.query(
      `UPDATE prompts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '找不到提示詞' },
        { status: 404 }
      );
    }

    const prompt: Prompt = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      mode: result.rows[0].mode,
      content: result.rows[0].content,
      is_active: result.rows[0].is_active,
      created_at: new Date(result.rows[0].created_at),
      updated_at: new Date(result.rows[0].updated_at)
    };

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('更新提示詞錯誤:', error);
    return NextResponse.json(
      { error: '無法更新提示詞' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - 刪除提示詞
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 檢查是否為啟用中的提示詞
    const checkResult = await sql`
      SELECT is_active FROM prompts WHERE id = ${id}
    `;

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: '找不到提示詞' },
        { status: 404 }
      );
    }

    if (checkResult.rows[0].is_active) {
      return NextResponse.json(
        { error: '無法刪除啟用中的提示詞' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM prompts WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除提示詞錯誤:', error);
    return NextResponse.json(
      { error: '無法刪除提示詞' },
      { status: 500 }
    );
  }
}
