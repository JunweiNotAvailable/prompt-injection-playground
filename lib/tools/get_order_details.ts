import { sql } from '@/lib/db';
import { Order } from '@/types';

/**
 * 取得訂單詳情
 * 從 Postgres 資料庫讀取特定訂單的完整資訊（包含 items JSONB）
 * 
 * @param orderId - 訂單 ID
 * @returns 訂單物件或 null（如果訂單不存在）
 */
export async function get_order_details(orderId: string): Promise<Order | null> {
  try {
    // 從資料庫讀取特定訂單的完整資訊
    const result = await sql`
      SELECT id, customer_id, amount, status, items, created_at
      FROM orders
      WHERE id = ${orderId}
      LIMIT 1
    `;
    
    // 如果沒有找到訂單，返回 null
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // 將資料庫結果轉換為 Order 型別
    const order: Order = {
      id: row.id,
      customer_id: row.customer_id,
      amount: parseFloat(row.amount),
      status: row.status,
      items: row.items, // JSONB 欄位會自動解析為物件
      created_at: new Date(row.created_at)
    };
    
    return order;
  } catch (error) {
    console.error('取得訂單詳情時發生錯誤:', error);
    throw new Error('無法取得訂單詳情');
  }
}
