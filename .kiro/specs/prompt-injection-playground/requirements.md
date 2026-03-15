# 需求文件

## 簡介

提示注入沙盒（Prompt Injection Playground）是一個教育性工具，讓開發者能夠安全地實驗和理解提示注入攻擊。系統提供兩種注入模式（直接注入和間接注入），並使用虛擬電商環境來模擬真實場景。系統會自動分析攻擊結果，幫助開發者了解提示注入的風險和嚴重程度。

## 術語表

- **Playground（沙盒）**: 使用者進行提示注入測試的互動介面
- **Dashboard（儀表板）**: 顯示虛擬資料庫業務數據和攻擊記錄的介面
- **Direct_Injection（直接注入）**: 使用者直接透過聊天介面向 AI 助理發送惡意提示的攻擊模式
- **Indirect_Injection（間接注入）**: 惡意提示透過外部數據源（如電子郵件、資料庫記錄）間接傳遞給 AI 助理的攻擊模式
- **Virtual_Assistant（虛擬助理）**: 扮演電商客服代理的 AI 模型，可調用工具查詢訂單等資訊
- **Analysis_Model（分析模型）**: 評估攻擊嚴重程度和成功與否的 AI 模型
- **Attack_Record（攻擊記錄）**: 記錄每次注入嘗試的結果、嚴重程度和分析資訊
- **Business_Data（業務數據）**: 虛擬電商環境中的客戶、訂單等模擬數據
- **System（系統）**: 整個提示注入沙盒應用程式

## 需求

### 需求 1：模式選擇

**使用者故事：** 作為開發者，我想要選擇不同的注入模式，以便我可以測試不同類型的提示注入攻擊。

#### 驗收標準

1. THE System SHALL 提供直接注入模式選項
2. THE System SHALL 提供間接注入模式選項
3. WHEN 使用者選擇一個模式，THE System SHALL 顯示對應的測試介面
4. THE System SHALL 在介面上清楚標示當前選擇的模式

### 需求 2：直接注入模式

**使用者故事：** 作為開發者，我想要透過聊天介面直接測試提示注入，以便我可以了解直接攻擊向量的運作方式。

#### 驗收標準

1. WHEN Direct_Injection 模式啟用，THE System SHALL 顯示聊天介面
2. WHEN 使用者提交訊息，THE Virtual_Assistant SHALL 使用 gpt-4o-mini 模型處理該訊息
3. THE Virtual_Assistant SHALL 能夠調用工具函數（如 get_orders、get_customers）
4. WHEN Virtual_Assistant 回應完成，THE System SHALL 在聊天介面顯示回應內容
5. THE System SHALL 保存對話歷史記錄在當前會話中

### 需求 3：間接注入模式

**使用者故事：** 作為開發者，我想要測試透過外部數據源的間接注入，以便我可以了解資料污染攻擊的風險。

#### 驗收標準

1. WHEN Indirect_Injection 模式啟用，THE System SHALL 顯示包含外部數據源的介面
2. THE System SHALL 提供至少兩種外部數據源場景（電子郵件和資料庫記錄）
3. WHEN 使用者選擇一個數據源，THE System SHALL 顯示該數據源的內容
4. WHEN 使用者修改數據源內容，THE System SHALL 允許儲存修改
5. WHEN 使用者觸發 Virtual_Assistant 處理，THE Virtual_Assistant SHALL 讀取數據源內容並處理
6. THE System SHALL 在介面上顯示 Virtual_Assistant 的處理結果

### 需求 4：虛擬助理工具調用

**使用者故事：** 作為開發者，我想要虛擬助理能夠調用多種工具，以便我可以測試工具調用相關的注入攻擊。

#### 驗收標準

1. THE Virtual_Assistant SHALL 實作 get_orders 工具函數
2. THE Virtual_Assistant SHALL 實作 get_customers 工具函數
3. THE Virtual_Assistant SHALL 實作 get_order_details 工具函數
4. WHEN Virtual_Assistant 需要查詢資訊，THE Virtual_Assistant SHALL 調用適當的工具函數
5. THE Virtual_Assistant SHALL 將工具函數的回傳結果整合到回應中
6. THE System SHALL 在介面上顯示哪些工具被調用

### 需求 5：攻擊分析

**使用者故事：** 作為開發者，我想要系統自動分析我的注入嘗試，以便我可以了解攻擊的嚴重程度和成功與否。

#### 驗收標準

1. WHEN 使用者完成一次注入測試，THE Analysis_Model SHALL 使用 gpt-4o-mini 分析該測試
2. THE Analysis_Model SHALL 判斷攻擊是否成功
3. THE Analysis_Model SHALL 評估攻擊嚴重程度（低、中、高）
4. THE Analysis_Model SHALL 提供攻擊成功或失敗的原因說明
5. THE System SHALL 將分析結果儲存為 Attack_Record
6. THE System SHALL 在介面上顯示分析結果

### 需求 6：視圖切換

**使用者故事：** 作為開發者，我想要在沙盒和儀表板之間切換，以便我可以查看測試結果和虛擬數據。

#### 驗收標準

1. THE System SHALL 提供切換到 Playground 的導航選項
2. THE System SHALL 提供切換到 Dashboard 的導航選項
3. WHEN 使用者點擊導航選項，THE System SHALL 在 200 毫秒內切換到對應視圖
4. THE System SHALL 在導航介面上標示當前所在視圖

### 需求 7：儀表板業務數據顯示

**使用者故事：** 作為開發者，我想要在儀表板查看虛擬電商的業務數據，以便我可以了解系統中有哪些數據可供測試。

#### 驗收標準

1. WHEN Dashboard 啟用，THE System SHALL 顯示虛擬客戶列表
2. WHEN Dashboard 啟用，THE System SHALL 顯示虛擬訂單列表
3. THE System SHALL 為每個客戶顯示客戶 ID、姓名和電子郵件
4. THE System SHALL 為每個訂單顯示訂單 ID、客戶 ID、金額和狀態
5. THE System SHALL 允許使用者查看個別訂單的詳細資訊

### 需求 8：儀表板攻擊記錄顯示

**使用者故事：** 作為開發者，我想要在儀表板查看所有攻擊記錄，以便我可以追蹤我的測試歷史和結果。

#### 驗收標準

1. WHEN Dashboard 啟用，THE System SHALL 顯示所有 Attack_Record
2. THE System SHALL 為每個 Attack_Record 顯示時間戳記
3. THE System SHALL 為每個 Attack_Record 顯示注入模式類型
4. THE System SHALL 為每個 Attack_Record 顯示攻擊是否成功
5. THE System SHALL 為每個 Attack_Record 顯示嚴重程度
6. THE System SHALL 為每個 Attack_Record 顯示分析原因摘要
7. THE System SHALL 按時間倒序排列 Attack_Record

### 需求 9：虛擬數據初始化

**使用者故事：** 作為開發者，我想要系統預先載入虛擬業務數據，以便我可以立即開始測試而不需要手動建立數據。

#### 驗收標準

1. WHEN System 首次啟動，THE System SHALL 初始化至少 5 筆虛擬客戶記錄
2. WHEN System 首次啟動，THE System SHALL 初始化至少 10 筆虛擬訂單記錄
3. THE System SHALL 確保每筆訂單關聯到有效的客戶 ID
4. THE System SHALL 在客戶端儲存虛擬數據（使用 localStorage 或類似機制）
5. WHEN 使用者清除數據，THE System SHALL 提供重置為初始虛擬數據的選項

### 需求 10：多語言支援

**使用者故事：** 所有介面和文件使用繁體中文，以便我可以更容易理解和使用系統。

#### 驗收標準

1. THE System SHALL 使用繁體中文（zh-tw）顯示所有使用者介面文字
2. THE System SHALL 使用繁體中文提供系統提示和錯誤訊息
3. THE System SHALL 使用繁體中文撰寫程式碼註解
4. THE Virtual_Assistant SHALL 使用繁體中文與使用者互動
5. THE Analysis_Model SHALL 使用繁體中文提供分析結果

### 需求 11：會話管理

**使用者故事：** 作為開發者，我想要能夠開始新的測試會話，以便我可以進行多個獨立的測試實驗。

#### 驗收標準

1. THE System SHALL 提供開始新會話的選項
2. WHEN 使用者開始新會話，THE System SHALL 清除當前對話歷史
3. WHEN 使用者開始新會話，THE System SHALL 保留虛擬 Business_Data
4. WHEN 使用者開始新會話，THE System SHALL 保留所有歷史 Attack_Record
5. THE System SHALL 為每個會話生成唯一識別碼

### 需求 12：錯誤處理

**使用者故事：** 作為開發者，我想要系統妥善處理錯誤情況，以便我可以了解問題並繼續測試。

#### 驗收標準

1. WHEN API 調用失敗，THE System SHALL 顯示描述性錯誤訊息
2. WHEN Virtual_Assistant 無法處理請求，THE System SHALL 記錄錯誤並通知使用者
3. WHEN Analysis_Model 分析失敗，THE System SHALL 標記該 Attack_Record 為分析失敗狀態
4. IF 網路連線中斷，THEN THE System SHALL 顯示連線錯誤訊息
5. THE System SHALL 在錯誤發生後保持可用狀態

