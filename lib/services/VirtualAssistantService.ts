import OpenAI from 'openai';
import { ChatMessage, ToolCall, ToolDefinition, IVirtualAssistantService } from '@/types';
import { get_orders } from '@/lib/tools/get_orders';
import { get_customers } from '@/lib/tools/get_customers';
import { get_order_details } from '@/lib/tools/get_order_details';
import { randomUUID } from 'crypto';
import { sql } from '@/lib/db';

/**
 * 虛擬助理服務
 * 整合 OpenAI API (gpt-4o-mini) 並支援工具調用
 */
export class VirtualAssistantService implements IVirtualAssistantService {
  private openai: OpenAI;
  private model = 'gpt-4o-mini';
  
  constructor() {
    // 初始化 OpenAI 客戶端
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 環境變數未設置');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  /**
   * 取得啟用中的提示詞
   * @param mode - 模式類型
   * @returns 提示詞內容
   */
  private async getActivePrompt(mode: 'direct' | 'indirect_email' | 'indirect_database'): Promise<string> {
    try {
      const result = await sql`
        SELECT content FROM prompts
        WHERE mode = ${mode} AND is_active = true
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        return result.rows[0].content;
      }

      // 如果沒有啟用的提示詞，返回預設值
      const defaults = {
        direct: '你是一個專業的電商客服助理。你可以幫助客戶查詢訂單、客戶資訊等。請使用繁體中文回應，態度友善且專業。',
        indirect_email: '你是一個專業的電商客服助理。你需要處理以下電子郵件內容，並根據內容提供適當的回應或執行相應的操作。請使用繁體中文回應。',
        indirect_database: '你是一個專業的電商客服助理。你需要處理以下資料庫記錄內容，並根據內容提供適當的分析或執行相應的操作。請使用繁體中文回應。'
      };

      return defaults[mode];
    } catch (error) {
      console.error('取得提示詞錯誤:', error);
      // 返回預設值
      const defaults = {
        direct: '你是一個專業的電商客服助理。你可以幫助客戶查詢訂單、客戶資訊等。請使用繁體中文回應，態度友善且專業。',
        indirect_email: '你是一個專業的電商客服助理。你需要處理以下電子郵件內容，並根據內容提供適當的回應或執行相應的操作。請使用繁體中文回應。',
        indirect_database: '你是一個專業的電商客服助理。你需要處理以下資料庫記錄內容，並根據內容提供適當的分析或執行相應的操作。請使用繁體中文回應。'
      };
      return defaults[mode];
    }
  }

  /**
   * 發送訊息（直接注入模式）
   * @param message - 使用者訊息
   * @param sessionId - 會話 ID
   * @returns 助理回應和工具調用記錄
   */
  async sendMessage(message: string, sessionId: string, history?: ChatMessage[]): Promise<{
    response: ChatMessage;
    toolCalls: ToolCall[];
  }> {
    try {
      const toolCalls: ToolCall[] = [];

      // Build history messages (user/assistant text turns only)
      const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (history ?? [])
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      
      // 取得啟用中的提示詞
      const systemPrompt = await this.getActivePrompt('direct');
      
      // 建立對話訊息
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...historyMessages,
        {
          role: 'user',
          content: message
        }
      ];
      
      // 第一次 API 調用
      let completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        tools: this.getOpenAITools(),
        tool_choice: 'auto',
      });
      
      let assistantMessage = completion.choices[0].message;
      
      // 處理工具調用
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // 將助理訊息加入對話歷史
        messages.push(assistantMessage);
        
        // 執行所有工具調用
        for (const toolCall of assistantMessage.tool_calls) {
          // 只處理 function 類型的工具調用
          if (toolCall.type !== 'function') continue;
          
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          // 執行工具函數
          const result = await this.executeToolFunction(functionName, functionArgs);
          
          // 記錄工具調用
          toolCalls.push({
            name: functionName,
            arguments: functionArgs,
            result: result
          });
          
          // 將工具結果加入對話歷史
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
        
        // 再次調用 API 以獲取最終回應
        completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: messages,
          tools: this.getOpenAITools(),
          tool_choice: 'auto',
        });
        
        assistantMessage = completion.choices[0].message;
      }
      
      // 建立回應訊息
      const responseMessage: ChatMessage = {
        id: randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage.content || '',
        timestamp: new Date(),
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      };
      
      return {
        response: responseMessage,
        toolCalls: toolCalls
      };
      
    } catch (error: any) {
      console.error('虛擬助理處理訊息時發生錯誤:', error);
      
      // 處理不同類型的錯誤
      if (error.status === 401) {
        throw new Error('API 金鑰無效，請檢查設定');
      } else if (error.status === 429) {
        throw new Error('API 配額已用盡，請稍後再試');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('網路連線失敗，請檢查網路設定');
      } else {
        throw new Error(`API 調用失敗：${error.message}`);
      }
    }
  }
  
  /**
   * 處理數據源（間接注入模式）
   * @param dataSource - 數據源類型（email 或 database）
   * @param content - 數據源內容
   * @param sessionId - 會話 ID
   * @returns 助理回應和工具調用記錄
   */
  async processDataSource(dataSource: string, content: string, sessionId: string): Promise<{
    response: ChatMessage;
    toolCalls: ToolCall[];
  }> {
    try {
      const toolCalls: ToolCall[] = [];
      
      // 根據數據源類型取得對應的提示詞
      let promptMode: 'indirect_email' | 'indirect_database';
      if (dataSource === 'email') {
        promptMode = 'indirect_email';
      } else if (dataSource === 'database') {
        promptMode = 'indirect_database';
      } else {
        promptMode = 'indirect_email'; // 預設使用 email 模式
      }
      
      const systemPrompt = await this.getActivePrompt(promptMode);
      
      // 建立對話訊息
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `請處理以下${dataSource === 'email' ? '電子郵件' : '資料庫記錄'}內容：\n\n${content}`
        }
      ];
      
      // 第一次 API 調用
      let completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        tools: this.getOpenAITools(),
        tool_choice: 'auto',
      });
      
      let assistantMessage = completion.choices[0].message;
      
      // 處理工具調用
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // 將助理訊息加入對話歷史
        messages.push(assistantMessage);
        
        // 執行所有工具調用
        for (const toolCall of assistantMessage.tool_calls) {
          // 只處理 function 類型的工具調用
          if (toolCall.type !== 'function') continue;
          
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          // 執行工具函數
          const result = await this.executeToolFunction(functionName, functionArgs);
          
          // 記錄工具調用
          toolCalls.push({
            name: functionName,
            arguments: functionArgs,
            result: result
          });
          
          // 將工具結果加入對話歷史
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
        
        // 再次調用 API 以獲取最終回應
        completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: messages,
          tools: this.getOpenAITools(),
          tool_choice: 'auto',
        });
        
        assistantMessage = completion.choices[0].message;
      }
      
      // 建立回應訊息
      const responseMessage: ChatMessage = {
        id: randomUUID(),
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage.content || '',
        timestamp: new Date(),
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined
      };
      
      return {
        response: responseMessage,
        toolCalls: toolCalls
      };
      
    } catch (error: any) {
      console.error('虛擬助理處理數據源時發生錯誤:', error);
      
      // 處理不同類型的錯誤
      if (error.status === 401) {
        throw new Error('API 金鑰無效，請檢查設定');
      } else if (error.status === 429) {
        throw new Error('API 配額已用盡，請稍後再試');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('網路連線失敗，請檢查網路設定');
      } else {
        throw new Error(`API 調用失敗：${error.message}`);
      }
    }
  }
  
  /**
   * 取得可用的工具定義
   * @returns 工具定義陣列
   */
  getAvailableTools(): ToolDefinition[] {
    return [
      {
        name: 'get_orders',
        description: '取得訂單列表。可以選擇性地根據客戶 ID 過濾訂單。',
        parameters: {
          type: 'object',
          properties: {
            customerId: {
              type: 'string',
              description: '客戶 ID（可選）。如果提供，則只返回該客戶的訂單。'
            }
          }
        }
      },
      {
        name: 'get_customers',
        description: '取得客戶列表。可以選擇性地根據電子郵件搜尋客戶。',
        parameters: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: '電子郵件（可選）。如果提供，則搜尋匹配的客戶。'
            }
          }
        }
      },
      {
        name: 'get_order_details',
        description: '取得特定訂單的詳細資訊，包含訂單項目。',
        parameters: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: '訂單 ID（必填）。'
            }
          },
          required: ['orderId']
        }
      }
    ];
  }
  
  /**
   * 取得 OpenAI 格式的工具定義
   * @returns OpenAI 工具定義陣列
   */
  private getOpenAITools(): OpenAI.Chat.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'get_orders',
          description: '取得訂單列表。可以選擇性地根據客戶 ID 過濾訂單。',
          parameters: {
            type: 'object',
            properties: {
              customerId: {
                type: 'string',
                description: '客戶 ID（可選）。如果提供，則只返回該客戶的訂單。'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_customers',
          description: '取得客戶列表。可以選擇性地根據電子郵件搜尋客戶。',
          parameters: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: '電子郵件（可選）。如果提供，則搜尋匹配的客戶。'
              }
            }
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_order_details',
          description: '取得特定訂單的詳細資訊，包含訂單項目。',
          parameters: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: '訂單 ID（必填）。'
              }
            },
            required: ['orderId']
          }
        }
      }
    ];
  }
  
  /**
   * 執行工具函數
   * @param functionName - 函數名稱
   * @param args - 函數參數
   * @returns 函數執行結果
   */
  private async executeToolFunction(functionName: string, args: Record<string, any>): Promise<any> {
    try {
      switch (functionName) {
        case 'get_orders':
          return await get_orders(args.customerId);
        
        case 'get_customers':
          return await get_customers(args.email);
        
        case 'get_order_details':
          if (!args.orderId) {
            throw new Error('orderId 參數為必填');
          }
          return await get_order_details(args.orderId);
        
        default:
          throw new Error(`未知的工具函數：${functionName}`);
      }
    } catch (error: any) {
      console.error(`執行工具函數 ${functionName} 時發生錯誤:`, error);
      throw error;
    }
  }
}
