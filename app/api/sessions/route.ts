import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/services/SessionManager';
import { CreateSessionRequest, CreateSessionResponse } from '@/types';

/**
 * GET /api/sessions — 取得會話列表
 * Query params: mode (optional, 'direct' | 'indirect'), limit (optional, default 30)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') as 'direct' | 'indirect' | null;
    const limit = parseInt(url.searchParams.get('limit') || '30', 10);

    const sessionManager = new SessionManager();
    const sessions = await sessionManager.getSessions(mode || undefined, limit);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('取得會話列表時發生錯誤:', error);
    return NextResponse.json(
      { error: '無法取得會話列表' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions — 建立新會話
 */
export async function POST(request: Request) {
  try {
    // 解析請求內容
    const body: CreateSessionRequest = await request.json();
    
    // 驗證模式參數
    if (!body.mode || (body.mode !== 'direct' && body.mode !== 'indirect')) {
      return NextResponse.json(
        { error: '無效的模式參數，必須是 "direct" 或 "indirect"' },
        { status: 400 }
      );
    }

    // 建立會話管理器實例
    const sessionManager = new SessionManager();
    
    // 調用 SessionManager.createSession
    const session = await sessionManager.createSession(body.mode);
    
    // 返回 CreateSessionResponse
    const response: CreateSessionResponse = {
      session
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('建立會話時發生錯誤:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '無法建立會話' 
      },
      { status: 500 }
    );
  }
}
