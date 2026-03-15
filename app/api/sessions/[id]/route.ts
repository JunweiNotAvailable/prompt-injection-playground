import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/services/SessionManager';

const sessionManager = new SessionManager();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await sessionManager.getSession(id);
    
    if (!session) {
      return NextResponse.json(
        { error: '找不到會話' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('取得會話錯誤:', error);
    return NextResponse.json(
      { error: '無法取得會話' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sessionManager.deleteSession(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除會話錯誤:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '無法刪除會話' },
      { status: 500 }
    );
  }
}
