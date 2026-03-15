import { sql } from '@/lib/db';
import { Order } from '@/types';

/**
 * 取得訂單列表
 * 從 Postgres 資料庫讀取訂單，支援可選的 customerId 過濾
 * 
 * @param customerId - 可選的客戶 ID，用於過濾特定客戶的訂單
 * @returns 訂單陣列
 */
export async function get_orders(customerId?: string): Promise<Order[]> {
  try {
    let result;
    
    if (customerId) {
      // 如果提供 customerId，則過濾該客戶的訂單
      result = await sql`
        SELECT id, customer_id, amount, status, items, created_at
        FROM orders
        WHERE customer_id = ${customerId}
        ORDER BY created_at DESC
      `;
    } else {
      // 如果沒有提供 customerId，則返回所有訂單
      result = await sql`
        SELECT id, customer_id, amount, status, items, created_at
        FROM orders
        ORDER BY created_at DESC
      `;
    }
    
    // 將資料庫結果轉換為 Order 型別
    const orders: Order[] = result.rows.map((row: any) => ({
      id: row.id,
      customer_id: row.customer_id,
      amount: parseFloat(row.amount),
      status: row.status,
      items: row.items, // JSONB 欄位會自動解析為物件
      created_at: new Date(row.created_at)
    }));
    
    return orders;
  } catch (error) {
    console.error('取得訂單時發生錯誤:', error);
    throw new Error('無法取得訂單資料');
  }
}
