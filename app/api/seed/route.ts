import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/utils/seed';

/**
 * API Route 用於初始化資料庫和生成虛擬數據
 * GET /api/seed
 */
export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ 
      success: true, 
      message: '虛擬業務數據初始化完成' 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知錯誤' 
      },
      { status: 500 }
    );
  }
}
