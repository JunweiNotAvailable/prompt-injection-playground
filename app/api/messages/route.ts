import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/services/SessionManager';

const sessionManager = new SessionManager();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, role, content, tool_calls } = body;
    
    if (!session_id || !role || !content) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }
    
    const message = {
      id: crypto.randomUUID(),
      session_id,
      role,
      content,
      timestamp: new Date(),
      tool_calls: tool_calls || undefined
    };
    
    await sessionManager.addMessage(session_id, message);
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('新增訊息錯誤:', error);
    return NextResponse.json(
      { error: '無法新增訊息' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const session_id = searchParams.get('session_id');
    
    if (!session_id) {
      return NextResponse.json(
        { error: '缺少 session_id 參數' },
        { status: 400 }
      );
    }
    
    const messages = await sessionManager.getMessages(session_id);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('取得訊息錯誤:', error);
    return NextResponse.json(
      { error: '無法取得訊息' },
      { status: 500 }
    );
  }
}
