import { sql } from '@/lib/db';
import { Customer } from '@/types';

/**
 * 取得客戶列表
 * 從 Postgres 資料庫讀取客戶，支援可選的 email 搜尋
 * 
 * @param email - 可選的電子郵件，用於搜尋匹配的客戶
 * @returns 客戶陣列
 */
export async function get_customers(email?: string): Promise<Customer[]> {
  try {
    let result;
    
    if (email) {
      // 如果提供 email，則搜尋匹配的客戶（使用 ILIKE 進行不區分大小寫的模糊搜尋）
      result = await sql`
        SELECT id, name, email, created_at
        FROM customers
        WHERE email ILIKE ${`%${email}%`}
        ORDER BY created_at DESC
      `;
    } else {
      // 如果沒有提供 email，則返回所有客戶
      result = await sql`
        SELECT id, name, email, created_at
        FROM customers
        ORDER BY created_at DESC
      `;
    }
    
    // 將資料庫結果轉換為 Customer 型別
    const customers: Customer[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: new Date(row.created_at)
    }));
    
    return customers;
  } catch (error) {
    console.error('取得客戶時發生錯誤:', error);
    throw new Error('無法取得客戶資料');
  }
}
