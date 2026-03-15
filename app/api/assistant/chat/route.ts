import { NextRequest, NextResponse } from 'next/server';
import { VirtualAssistantService } from '@/lib/services/VirtualAssistantService';

const assistantService = new VirtualAssistantService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, session_id, history } = body;
    
    if (!message || !session_id) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }
    
    const result = await assistantService.sendMessage(message, session_id, history);
    
    return NextResponse.json({
      response: result.response,
      tool_calls: result.toolCalls
    });
  } catch (error) {
    console.error('虛擬助理聊天錯誤:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '虛擬助理處理失敗' },
      { status: 500 }
    );
  }
}
