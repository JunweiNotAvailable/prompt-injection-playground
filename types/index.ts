// 客戶
export interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

// 訂單項目
export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

// 訂單
export interface Order {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at: Date;
}

// 工具調用
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result: any;
}

// 聊天訊息
export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tool_calls?: ToolCall[];
}

// 會話
export interface Session {
  id: string;
  start_time: Date;
  mode: 'direct' | 'indirect';
  is_active: boolean;
  message_count?: number;
}

// 分析結果
export interface AnalysisResult {
  success: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

// 攻擊記錄
export interface AttackRecord {
  id: string;
  session_id: string;
  timestamp: Date;
  mode: 'direct' | 'indirect';
  success: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  user_input: string;
  assistant_response: string;
  tools_called: string[];
}

// 提示詞
export interface Prompt {
  id: string;
  name: string;
  mode: 'direct' | 'indirect_email' | 'indirect_database';
  content: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// API 請求/回應介面

// POST /api/sessions - 建立會話
export interface CreateSessionRequest {
  mode: 'direct' | 'indirect';
}

export interface CreateSessionResponse {
  session: Session;
}

// POST /api/messages - 發送訊息
export interface SendMessageRequest {
  session_id: string;
  content: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  analysis?: AnalysisResult;
}

// POST /api/assistant/chat - 虛擬助理聊天
export interface AssistantChatRequest {
  message: string;
  session_id: string;
}

export interface AssistantChatResponse {
  response: ChatMessage;
  tool_calls: ToolCall[];
}

// POST /api/assistant/process - 處理數據源
export interface ProcessDataSourceRequest {
  data_source: string;
  content: string;
  session_id: string;
}

export interface ProcessDataSourceResponse {
  response: ChatMessage;
  tool_calls: ToolCall[];
}

// POST /api/analysis - 分析攻擊
export interface AnalyzeAttackRequest {
  user_input: string;
  assistant_response: string;
  tools_called: string[];
  mode: 'direct' | 'indirect';
  session_id: string;
}

export interface AnalyzeAttackResponse {
  analysis: AnalysisResult;
  record: AttackRecord;
}

// GET /api/attack-records
export interface GetAttackRecordsResponse {
  records: AttackRecord[];
}

// GET /api/customers
export interface GetCustomersResponse {
  customers: Customer[];
}

// GET /api/orders
export interface GetOrdersResponse {
  orders: Order[];
}

// GET /api/orders/[id]
export interface GetOrderDetailsResponse {
  order: Order;
}

// GET /api/prompts
export interface GetPromptsRequest {
  mode?: 'direct' | 'indirect_email' | 'indirect_database';
}

export interface GetPromptsResponse {
  prompts: Prompt[];
}

// POST /api/prompts
export interface CreatePromptRequest {
  name: string;
  mode: 'direct' | 'indirect_email' | 'indirect_database';
  content: string;
}

export interface CreatePromptResponse {
  prompt: Prompt;
}

// PUT /api/prompts/[id]
export interface UpdatePromptRequest {
  name?: string;
  content?: string;
  is_active?: boolean;
}

export interface UpdatePromptResponse {
  prompt: Prompt;
}

// DELETE /api/prompts/[id]
export interface DeletePromptResponse {
  success: boolean;
}

// 工具定義
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// 服務介面

// 虛擬助理服務
export interface IVirtualAssistantService {
  sendMessage(message: string, sessionId: string): Promise<{
    response: ChatMessage;
    toolCalls: ToolCall[];
  }>;
  processDataSource(dataSource: string, content: string, sessionId: string): Promise<{
    response: ChatMessage;
    toolCalls: ToolCall[];
  }>;
  getAvailableTools(): ToolDefinition[];
}

// 攻擊分析服務
export interface IAttackAnalysisService {
  analyzeAttack(
    userInput: string,
    assistantResponse: string,
    toolsCalled: string[],
    mode: 'direct' | 'indirect'
  ): Promise<AnalysisResult>;
}

// 會話管理器
export interface ISessionManager {
  createSession(mode: 'direct' | 'indirect'): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  getMessages(sessionId: string): Promise<ChatMessage[]>;
  addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  endSession(sessionId: string): Promise<void>;
}
