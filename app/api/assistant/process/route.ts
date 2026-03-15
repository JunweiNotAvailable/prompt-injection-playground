import { NextRequest, NextResponse } from 'next/server';
import { VirtualAssistantService } from '@/lib/services/VirtualAssistantService';

const assistantService = new VirtualAssistantService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data_source, content, session_id } = body;
    
    if (!data_source || !content || !session_id) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }
    
    const result = await assistantService.processDataSource(data_source, content, session_id);
    
    return NextResponse.json({
      response: result.response,
      tool_calls: result.toolCalls
    });
  } catch (error) {
    console.error('處理數據源錯誤:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '處理數據源失敗' },
      { status: 500 }
    );
  }
}
