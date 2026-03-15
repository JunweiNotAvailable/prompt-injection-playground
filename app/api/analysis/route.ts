import { NextRequest, NextResponse } from 'next/server';
import { AttackAnalysisService } from '@/lib/services/AttackAnalysisService';
import { sql } from '@/lib/db';

const analysisService = new AttackAnalysisService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_input, assistant_response, tools_called, mode, session_id } = body;
    
    if (!user_input || !assistant_response || !mode || !session_id) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }
    
    // 分析攻擊
    const analysis = await analysisService.analyzeAttack(
      user_input,
      assistant_response,
      tools_called || [],
      mode
    );
    
    // 儲存攻擊記錄到資料庫
    const result = await sql`
      INSERT INTO attack_records (
        session_id,
        mode,
        success,
        severity,
        reason,
        user_input,
        assistant_response,
        tools_called
      ) VALUES (
        ${session_id},
        ${mode},
        ${analysis.success},
        ${analysis.severity},
        ${analysis.reason},
        ${user_input},
        ${assistant_response},
        ${tools_called || []}
      )
      RETURNING *
    `;
    
    const record = result.rows[0];
    
    return NextResponse.json({
      analysis,
      record
    });
  } catch (error) {
    console.error('分析攻擊錯誤:', error);
    return NextResponse.json(
      { error: '無法分析攻擊' },
      { status: 500 }
    );
  }
}
