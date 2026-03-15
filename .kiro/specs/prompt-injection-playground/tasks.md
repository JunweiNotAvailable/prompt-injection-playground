# 實作計畫：提示注入沙盒

## 概述

本實作計畫將提示注入沙盒分解為漸進式的開發任務。系統採用 Next.js 14+ (App Router) 全端架構，使用 TypeScript、React 18+、Tailwind CSS、Vercel Postgres 和 OpenAI API。實作將從資料庫設置開始，逐步建構 API Routes、服務層、React 元件，最後整合所有功能。

## 任務

- [x] 1. 設置專案基礎架構
  - 初始化 Next.js 14+ 專案（App Router）with TypeScript
  - 安裝必要依賴：@vercel/postgres、openai、tailwindcss
  - 配置環境變數（.env.local）：POSTGRES_URL、OPENAI_API_KEY
  - 建立基本目錄結構（app、components、lib、types、contexts）
  - _需求：所有需求的技術基礎_

- [x] 2. 定義 TypeScript 型別和介面
  - 建立 types/index.ts 檔案
  - 定義資料模型介面（Customer、Order、OrderItem、AttackRecord、ChatMessage、Session、ToolCall）
  - 定義 API 請求/回應介面（CreateSessionRequest/Response、SendMessageRequest/Response 等）
  - 定義服務介面（IVirtualAssistantService、IAttackAnalysisService、ISessionManager）
  - _需求：所有需求的型別安全基礎_

- [ ] 3. 建立資料庫 Schema 和種子數據
  - [x] 3.1 建立資料庫連接配置
    - 建立 lib/db.ts，匯出 sql 客戶端
    - _需求：9.4_

  - [x] 3.2 建立資料庫表格
    - 建立 lib/utils/seed.ts
    - 實作 createTables 函數，建立 customers、orders、sessions、messages、attack_records 表
    - 包含所有索引和約束（外鍵、唯一性、檢查約束）
    - _需求：9.1, 9.2, 9.3_

  - [x] 3.3 生成虛擬業務數據
    - 實作 seedDatabase 函數
    - 插入至少 5 筆虛擬客戶記錄（真實感的中文姓名和電子郵件）
    - 插入至少 10 筆虛擬訂單記錄（關聯到有效客戶 ID，多樣化狀態和金額）
    - 確保每筆訂單包含 1-5 個訂單項目（JSONB 格式）
    - _需求：9.1, 9.2, 9.3_

  - [ ]* 3.4 撰寫資料庫種子數據的屬性測試
    - **屬性 21：訂單客戶關聯有效性**
    - **驗證需求：9.3**

- [ ] 4. 實作工具函數（虛擬助理可調用）
  - [x] 4.1 實作 get_orders 工具函數
    - 建立 lib/tools/get_orders.ts
    - 從 Postgres 讀取訂單，支援可選的 customerId 過濾
    - 返回 Order[] 型別
    - _需求：4.1_

  - [x] 4.2 實作 get_customers 工具函數
    - 建立 lib/tools/get_customers.ts
    - 從 Postgres 讀取客戶，支援可選的 email 搜尋
    - 返回 Customer[] 型別
    - _需求：4.2_

  - [x] 4.3 實作 get_order_details 工具函數
    - 建立 lib/tools/get_order_details.ts
    - 從 Postgres 讀取特定訂單的完整資訊（包含 items JSONB）
    - 返回 Order | null 型別
    - _需求：4.3_

  - [ ]* 4.4 撰寫工具函數的單元測試
    - 測試 get_orders 的過濾邏輯和空結果情況
    - 測試 get_customers 的搜尋邏輯
    - 測試 get_order_details 的不存在訂單情況
    - _需求：4.1, 4.2, 4.3_

- [ ] 5. 實作虛擬助理服務
  - [x] 5.1 建立 VirtualAssistantService 類別
    - 建立 lib/services/VirtualAssistantService.ts
    - 實作 sendMessage 方法（直接注入模式）
    - 實作 processDataSource 方法（間接注入模式）
    - 實作 getAvailableTools 方法，返回工具定義
    - 整合 OpenAI API (gpt-4o-mini) with function calling
    - 處理工具調用並整合結果到回應中
    - 使用繁體中文系統提示
    - _需求：2.2, 3.5, 4.4, 4.5, 10.4_

  - [x] 5.2 實作錯誤處理
    - 處理 OpenAI API 錯誤（401、429、網路錯誤）
    - 拋出描述性錯誤訊息（繁體中文）
    - _需求：12.1, 12.2_

  - [ ]* 5.3 撰寫虛擬助理服務的單元測試
    - 測試工具調用邏輯
    - 測試錯誤處理（API 失敗、超時）
    - Mock OpenAI API 回應
    - _需求：2.2, 4.4, 4.5, 12.2_

- [ ] 6. 實作攻擊分析服務
  - [x] 6.1 建立 AttackAnalysisService 類別
    - 建立 lib/services/AttackAnalysisService.ts
    - 實作 analyzeAttack 方法
    - 使用 OpenAI API (gpt-4o-mini) 分析注入嘗試
    - 判斷攻擊成功與否、評估嚴重程度（low/medium/high）、提供原因說明
    - 使用繁體中文系統提示和回應
    - _需求：5.1, 5.2, 5.3, 5.4, 10.5_

  - [x] 6.2 實作分析失敗處理
    - 當分析 API 失敗時，返回預設分析結果（success: false, severity: 'low', reason: '分析失敗'）
    - _需求：12.3_

  - [ ]* 6.3 撰寫攻擊分析服務的屬性測試
    - **屬性 11：分析結果完整性**
    - **驗證需求：5.2, 5.3, 5.4**

- [ ] 7. 實作會話管理器
  - [x] 7.1 建立 SessionManager 類別
    - 建立 lib/services/SessionManager.ts
    - 實作 createSession 方法（插入到 sessions 表）
    - 實作 getSession 方法（從 sessions 表讀取）
    - 實作 getMessages 方法（從 messages 表讀取）
    - 實作 addMessage 方法（插入到 messages 表）
    - 實作 endSession 方法（更新 is_active 為 false）
    - _需求：11.1, 11.2, 11.5_

  - [ ]* 7.2 撰寫會話管理器的屬性測試
    - **屬性 25：會話 ID 唯一性**
    - **驗證需求：11.5**

- [ ] 8. 建立 API Routes - 會話管理
  - [x] 8.1 實作 POST /api/sessions
    - 建立 app/api/sessions/route.ts
    - 處理 CreateSessionRequest，調用 SessionManager.createSession
    - 返回 CreateSessionResponse
    - 錯誤處理和驗證
    - _需求：11.1, 11.5_

  - [x] 8.2 實作 GET /api/sessions/[id]
    - 建立 app/api/sessions/[id]/route.ts
    - 調用 SessionManager.getSession
    - 返回會話資料或 404
    - _需求：11.1_

  - [ ]* 8.3 撰寫會話 API 的單元測試
    - 測試建立會話的請求/回應格式
    - 測試無效模式的錯誤處理
    - _需求：11.1, 11.5_

- [ ] 9. 建立 API Routes - 訊息管理
  - [x] 9.1 實作 POST /api/messages
    - 建立 app/api/messages/route.ts
    - 處理 SendMessageRequest
    - 調用 SessionManager.addMessage
    - 返回 SendMessageResponse
    - _需求：2.5_

  - [x] 9.2 實作 GET /api/messages
    - 在 app/api/messages/route.ts 新增 GET handler
    - 接受 session_id 查詢參數
    - 調用 SessionManager.getMessages
    - 返回訊息列表
    - _需求：2.5_

- [ ] 10. 建立 API Routes - 虛擬助理
  - [x] 10.1 實作 POST /api/assistant/chat
    - 建立 app/api/assistant/chat/route.ts
    - 處理 AssistantChatRequest
    - 調用 VirtualAssistantService.sendMessage
    - 返回 AssistantChatResponse（包含 tool_calls）
    - _需求：2.2, 2.4, 4.4, 4.5_

  - [x] 10.2 實作 POST /api/assistant/process
    - 建立 app/api/assistant/process/route.ts
    - 處理 ProcessDataSourceRequest
    - 調用 VirtualAssistantService.processDataSource
    - 返回 ProcessDataSourceResponse
    - _需求：3.5, 3.6_

- [ ] 11. 建立 API Routes - 攻擊分析
  - [x] 11.1 實作 POST /api/analysis
    - 建立 app/api/analysis/route.ts
    - 處理 AnalyzeAttackRequest
    - 調用 AttackAnalysisService.analyzeAttack
    - 儲存分析結果到 attack_records 表
    - 返回 AnalyzeAttackResponse
    - _需求：5.1, 5.5, 5.6_

  - [ ]* 11.2 撰寫分析結果儲存的屬性測試
    - **屬性 12：分析結果儲存往返**
    - **驗證需求：5.5**

- [ ] 12. 建立 API Routes - 攻擊記錄
  - [x] 12.1 實作 GET /api/attack-records
    - 建立 app/api/attack-records/route.ts
    - 從 attack_records 表讀取所有記錄
    - 按 timestamp DESC 排序
    - 返回 GetAttackRecordsResponse
    - _需求：8.1, 8.7_

  - [ ]* 12.2 撰寫攻擊記錄排序的屬性測試
    - **屬性 20：攻擊記錄時間排序**
    - **驗證需求：8.7**

- [ ] 13. 建立 API Routes - 業務數據
  - [x] 13.1 實作 GET /api/customers
    - 建立 app/api/customers/route.ts
    - 從 customers 表讀取所有客戶
    - 返回 GetCustomersResponse
    - _需求：7.1, 7.3_

  - [x] 13.2 實作 GET /api/orders
    - 建立 app/api/orders/route.ts
    - 從 orders 表讀取所有訂單
    - 返回 GetOrdersResponse
    - _需求：7.2, 7.4_

  - [x] 13.3 實作 GET /api/orders/[id]
    - 建立 app/api/orders/[id]/route.ts
    - 從 orders 表讀取特定訂單詳情
    - 返回 GetOrderDetailsResponse 或 404
    - _需求：7.5_

  - [ ]* 13.4 撰寫業務數據的屬性測試
    - **屬性 22：虛擬數據儲存往返**
    - **驗證需求：9.4**

- [ ] 14. 建立全域狀態管理
  - [x] 14.1 建立 AppContext
    - 建立 contexts/AppContext.tsx
    - 使用 React Context API + useReducer
    - 管理當前視圖（playground/dashboard）、當前模式（direct/indirect）
    - 提供 actions：switchView、switchMode
    - _需求：1.3, 6.3_

  - [x] 14.2 建立 SessionContext
    - 建立 contexts/SessionContext.tsx
    - 管理當前會話、對話歷史、攻擊記錄
    - 提供 actions：createSession、addMessage、loadMessages
    - _需求：2.5, 11.1, 11.2_

- [ ] 15. 建立導航元件
  - [x] 15.1 實作 Navigation 元件
    - 建立 components/Navigation.tsx
    - 顯示 Playground 和 Dashboard 切換按鈕
    - 標示當前視圖（使用不同樣式）
    - 使用 AppContext 切換視圖
    - 使用 Tailwind CSS 樣式
    - _需求：6.1, 6.2, 6.4_

  - [ ]* 15.2 撰寫導航元件的屬性測試
    - **屬性 15：當前視圖標示**
    - **驗證需求：6.4**

- [ ] 16. 建立 Playground 視圖 - 模式選擇
  - [x] 16.1 實作 ModeSelector 元件
    - 建立 components/Playground/ModeSelector.tsx
    - 顯示直接注入和間接注入選項
    - 標示當前選擇的模式
    - 使用 AppContext 切換模式
    - 使用 Tailwind CSS 樣式
    - _需求：1.1, 1.2, 1.3, 1.4_

  - [ ]* 16.2 撰寫模式選擇器的屬性測試
    - **屬性 1：模式選擇顯示對應介面**
    - **屬性 2：當前模式標示**
    - **驗證需求：1.3, 1.4**

- [ ] 17. 建立 Playground 視圖 - 直接注入模式
  - [x] 17.1 實作 ChatInterface 元件
    - 建立 components/Playground/DirectInjection/ChatInterface.tsx
    - 包含訊息輸入框和發送按鈕
    - 調用 POST /api/assistant/chat
    - 顯示載入狀態
    - 錯誤處理和通知
    - _需求：2.1, 2.2_

  - [x] 17.2 實作 MessageList 元件
    - 建立 components/Playground/DirectInjection/MessageList.tsx
    - 顯示對話歷史（user 和 assistant 訊息）
    - 區分使用者和助理訊息的樣式
    - 自動捲動到最新訊息
    - _需求：2.4, 2.5_

  - [ ]* 17.3 撰寫聊天介面的屬性測試
    - **屬性 3：訊息處理回應**
    - **屬性 4：對話歷史保存**
    - **驗證需求：2.2, 2.4, 2.5**

- [ ] 18. 建立 Playground 視圖 - 間接注入模式
  - [x] 18.1 實作 DataSourceSelector 元件
    - 建立 components/Playground/IndirectInjection/DataSourceSelector.tsx
    - 顯示數據源選項（電子郵件、資料庫記錄）
    - 切換當前選擇的數據源
    - _需求：3.2, 3.3_

  - [x] 18.2 實作 EmailEditor 元件
    - 建立 components/Playground/IndirectInjection/EmailEditor.tsx
    - 顯示可編輯的電子郵件內容（textarea）
    - 儲存修改到本地狀態
    - _需求：3.3, 3.4_

  - [x] 18.3 實作 DatabaseEditor 元件
    - 建立 components/Playground/IndirectInjection/DatabaseEditor.tsx
    - 顯示可編輯的資料庫記錄內容（textarea）
    - 儲存修改到本地狀態
    - _需求：3.3, 3.4_

  - [x] 18.4 實作 ProcessButton 元件
    - 建立 components/Playground/IndirectInjection/ProcessButton.tsx
    - 觸發虛擬助理處理數據源
    - 調用 POST /api/assistant/process
    - 顯示處理結果
    - _需求：3.5, 3.6_

  - [ ]* 18.5 撰寫間接注入模式的屬性測試
    - **屬性 5：數據源選擇顯示內容**
    - **屬性 6：數據源修改往返**
    - **屬性 7：數據源處理**
    - **驗證需求：3.3, 3.4, 3.5, 3.6**

- [ ] 19. 建立 Playground 視圖 - 工具調用顯示
  - [x] 19.1 實作 ToolCallDisplay 元件
    - 建立 components/Playground/ToolCallDisplay.tsx
    - 顯示虛擬助理調用的工具列表
    - 顯示每個工具的名稱、參數和結果
    - 使用可摺疊的樣式顯示詳細資訊
    - _需求：4.6_

  - [ ]* 19.2 撰寫工具調用顯示的屬性測試
    - **屬性 8：工具調用結果整合**
    - **屬性 9：工具調用顯示**
    - **驗證需求：4.5, 4.6**

- [ ] 20. 建立 Playground 視圖 - 攻擊分析面板
  - [x] 20.1 實作 AnalysisPanel 元件
    - 建立 components/Playground/AnalysisPanel.tsx
    - 在每次助理回應後自動觸發分析
    - 調用 POST /api/analysis
    - 顯示分析結果（成功/失敗、嚴重程度、原因）
    - 使用不同顏色標示嚴重程度（低：綠色、中：黃色、高：紅色）
    - _需求：5.1, 5.6_

  - [ ]* 20.2 撰寫分析面板的屬性測試
    - **屬性 10：注入測試分析**
    - **屬性 13：分析結果顯示**
    - **驗證需求：5.1, 5.6**

- [ ] 21. 建立 Playground 主視圖
  - [x] 21.1 實作 PlaygroundView 元件
    - 建立 components/Playground/PlaygroundView.tsx
    - 整合 ModeSelector、ChatInterface/DataSourceSelector、ToolCallDisplay、AnalysisPanel
    - 根據當前模式顯示對應的介面
    - 提供「開始新會話」按鈕
    - 使用 Tailwind CSS 佈局
    - _需求：1.3, 11.1_

  - [ ]* 21.2 撰寫新會話功能的屬性測試
    - **屬性 23：新會話清除對話歷史**
    - **屬性 24：新會話保留業務數據**
    - **驗證需求：11.2, 11.3, 11.4**

- [ ] 22. 建立 Dashboard 視圖 - 業務數據面板
  - [x] 22.1 實作 CustomerList 元件
    - 建立 components/Dashboard/CustomerList.tsx
    - 調用 GET /api/customers
    - 顯示客戶列表（表格格式）
    - 顯示客戶 ID、姓名、電子郵件
    - _需求：7.1, 7.3_

  - [x] 22.2 實作 OrderList 元件
    - 建立 components/Dashboard/OrderList.tsx
    - 調用 GET /api/orders
    - 顯示訂單列表（表格格式）
    - 顯示訂單 ID、客戶 ID、金額、狀態
    - 提供查看詳情按鈕
    - _需求：7.2, 7.4_

  - [x] 22.3 實作 OrderDetails 元件
    - 建立 components/Dashboard/OrderDetails.tsx
    - 調用 GET /api/orders/[id]
    - 顯示訂單完整資訊（包含訂單項目）
    - 使用 Modal 或側邊欄顯示
    - _需求：7.5_

  - [x] 22.4 實作 BusinessDataPanel 元件
    - 建立 components/Dashboard/BusinessDataPanel.tsx
    - 整合 CustomerList 和 OrderList
    - 使用 Tabs 或分區顯示
    - _需求：7.1, 7.2_

  - [ ]* 22.5 撰寫業務數據顯示的屬性測試
    - **屬性 16：客戶資訊顯示完整性**
    - **屬性 17：訂單資訊顯示完整性**
    - **屬性 18：訂單詳情查看**
    - **驗證需求：7.3, 7.4, 7.5**

- [ ] 23. 建立 Dashboard 視圖 - 攻擊記錄面板
  - [x] 23.1 實作 AttackRecordList 元件
    - 建立 components/Dashboard/AttackRecordList.tsx
    - 調用 GET /api/attack-records
    - 顯示攻擊記錄列表（表格或卡片格式）
    - 顯示時間戳記、注入模式、成功狀態、嚴重程度、原因摘要
    - 使用不同顏色標示嚴重程度
    - 確認記錄按時間倒序排列
    - _需求：8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 23.2 撰寫攻擊記錄顯示的屬性測試
    - **屬性 19：攻擊記錄顯示完整性**
    - **驗證需求：8.2, 8.3, 8.4, 8.5, 8.6**

- [ ] 24. 建立 Dashboard 主視圖
  - [x] 24.1 實作 DashboardView 元件
    - 建立 components/Dashboard/DashboardView.tsx
    - 整合 BusinessDataPanel 和 AttackRecordList
    - 使用 Tailwind CSS 佈局（兩欄或分區）
    - _需求：7.1, 8.1_

- [ ] 25. 建立應用程式根佈局和頁面
  - [x] 25.1 實作根佈局
    - 建立 app/layout.tsx
    - 包含 AppContext 和 SessionContext Providers
    - 包含 Navigation 元件
    - 設置 Tailwind CSS 和全域樣式
    - 設置繁體中文 lang 屬性
    - _需求：10.1_

  - [x] 25.2 實作首頁（Playground）
    - 建立 app/page.tsx
    - 渲染 PlaygroundView 元件
    - _需求：1.3_

  - [x] 25.3 實作 Dashboard 頁面
    - 建立 app/dashboard/page.tsx
    - 渲染 DashboardView 元件
    - _需求：6.1, 6.2_

- [ ] 26. 整合和最終調整
  - [x] 26.1 整合所有元件和 API
    - 確保所有 API Routes 正確連接到服務層
    - 確保所有 React 元件正確使用 Context 和 API
    - 測試完整的使用者流程（直接注入和間接注入）
    - _需求：所有需求_

  - [x] 26.2 實作錯誤處理和通知
    - 在所有 API Routes 加入錯誤處理
    - 在所有元件加入錯誤邊界和通知
    - 確保所有錯誤訊息使用繁體中文
    - _需求：12.1, 12.2, 12.3, 12.4, 12.5, 10.2_

  - [x] 26.3 優化使用者體驗
    - 確保視圖切換在 200 毫秒內完成
    - 加入載入狀態指示器
    - 優化 Tailwind CSS 樣式和響應式設計
    - _需求：6.3_

  - [x] 26.4 建立資料庫初始化腳本
    - 建立執行 seedDatabase 的腳本或 API endpoint
    - 提供重置虛擬數據的功能
    - _需求：9.5_

- [x] 27. 檢查點 - 確保所有測試通過
  - 執行所有單元測試和屬性測試
  - 確認所有功能正常運作
  - 如有問題請詢問使用者

## 注意事項

- 標記 `*` 的任務為可選測試任務，可跳過以加快 MVP 開發
- 每個任務都參考了具體的需求編號，確保可追溯性
- 檢查點任務確保漸進式驗證
- 屬性測試驗證通用正確性屬性
- 單元測試驗證具體範例和邊界情況
- 所有程式碼、註解和使用者介面文字使用繁體中文
