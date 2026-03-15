import { sql } from '@/lib/db';
import { Session, ChatMessage, ISessionManager } from '@/types';

/**
 * 會話管理器
 * 負責管理測試會話的生命週期，包括建立會話、讀取會話、管理訊息等
 */
export class SessionManager implements ISessionManager {
  /**
   * 建立新會話
   * @param mode 注入模式（'direct' 或 'indirect'）
   * @returns 新建立的會話物件
   */
  async createSession(mode: 'direct' | 'indirect'): Promise<Session> {
    try {
      const result = await sql`
        INSERT INTO sessions (mode, is_active)
        VALUES (${mode}, true)
        RETURNING id, start_time, mode, is_active
      `;

      const row = result.rows[0];
      
      return {
        id: row.id,
        start_time: new Date(row.start_time),
        mode: row.mode,
        is_active: row.is_active
      };
    } catch (error) {
      console.error('建立會話時發生錯誤:', error);
      throw new Error('無法建立會話');
    }
  }

  /**
   * 取得特定會話
   * @param sessionId 會話 ID
   * @returns 會話物件，如果不存在則返回 null
   */
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const result = await sql`
        SELECT id, start_time, mode, is_active
        FROM sessions
        WHERE id = ${sessionId}
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        id: row.id,
        start_time: new Date(row.start_time),
        mode: row.mode,
        is_active: row.is_active
      };
    } catch (error) {
      console.error('取得會話時發生錯誤:', error);
      throw new Error('無法取得會話');
    }
  }

  /**
   * 取得會話的所有訊息
   * @param sessionId 會話 ID
   * @returns 訊息陣列，按時間順序排列
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const result = await sql`
        SELECT id, session_id, role, content, timestamp, tool_calls
        FROM messages
        WHERE session_id = ${sessionId}
        ORDER BY timestamp ASC
      `;

      return result.rows.map(row => ({
        id: row.id,
        session_id: row.session_id,
        role: row.role,
        content: row.content,
        timestamp: new Date(row.timestamp),
        tool_calls: row.tool_calls || undefined
      }));
    } catch (error) {
      console.error('取得訊息時發生錯誤:', error);
      throw new Error('無法取得訊息');
    }
  }

  /**
   * 新增訊息到會話
   * @param sessionId 會話 ID
   * @param message 訊息物件
   */
  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      // 確保會話存在
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('會話不存在');
      }

      await sql`
        INSERT INTO messages (session_id, role, content, tool_calls)
        VALUES (
          ${sessionId},
          ${message.role},
          ${message.content},
          ${message.tool_calls ? JSON.stringify(message.tool_calls) : null}::jsonb
        )
      `;
    } catch (error) {
      console.error('新增訊息時發生錯誤:', error);
      throw new Error('無法新增訊息');
    }
  }

  /**
   * 取得所有會話（可依模式過濾）
   * @param mode 注入模式（可選）
   * @param limit 最多返回筆數（預設 30）
   * @returns 會話陣列，按建立時間降序排列
   */
  async getSessions(mode?: 'direct' | 'indirect', limit = 30): Promise<Session[]> {
    try {
      const result = mode
        ? await sql`
            SELECT s.id, s.start_time, s.mode, s.is_active,
                   COUNT(m.id)::int AS message_count
            FROM sessions s
            LEFT JOIN messages m ON m.session_id = s.id
            WHERE s.mode = ${mode}
            GROUP BY s.id
            ORDER BY s.start_time DESC
            LIMIT ${limit}
          `
        : await sql`
            SELECT s.id, s.start_time, s.mode, s.is_active,
                   COUNT(m.id)::int AS message_count
            FROM sessions s
            LEFT JOIN messages m ON m.session_id = s.id
            GROUP BY s.id
            ORDER BY s.start_time DESC
            LIMIT ${limit}
          `;

      return result.rows.map(row => ({
        id: row.id,
        start_time: new Date(row.start_time),
        mode: row.mode,
        is_active: row.is_active,
        message_count: row.message_count ?? 0
      }));
    } catch (error) {
      console.error('取得會話列表時發生錯誤:', error);
      throw new Error('無法取得會話列表');
    }
  }

  /**
   * 刪除會話及其所有相關資料
   * @param sessionId 會話 ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const result = await sql`
        DELETE FROM sessions WHERE id = ${sessionId}
      `;
      if (result.rowCount === 0) {
        throw new Error('會話不存在');
      }
    } catch (error) {
      console.error('刪除會話時發生錯誤:', error);
      throw new Error('無法刪除會話');
    }
  }

  /**
   * 結束會話
   * @param sessionId 會話 ID
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const result = await sql`
        UPDATE sessions
        SET is_active = false
        WHERE id = ${sessionId}
      `;

      if (result.rowCount === 0) {
        throw new Error('會話不存在');
      }
    } catch (error) {
      console.error('結束會話時發生錯誤:', error);
      throw new Error('無法結束會話');
    }
  }
}
