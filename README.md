# 提示注入沙盒 (Prompt Injection Playground)

一個教育性工具，讓開發者能夠安全地實驗和理解提示注入攻擊。

Playground: https://piplayground-vert.vercel.app

## 功能特色

- **直接注入模式**：透過聊天介面直接測試提示注入
- **間接注入模式**：透過外部數據源（電子郵件、資料庫記錄）測試間接注入
- **自動攻擊分析**：AI 自動分析攻擊嚴重程度和成功與否
- **虛擬電商環境**：模擬真實場景的客戶和訂單數據
- **攻擊記錄追蹤**：完整記錄所有測試歷史

## 技術棧

- **全端框架**：Next.js 14+ (App Router) with TypeScript
- **前端**：React 18+, Tailwind CSS
- **資料庫**：Vercel Postgres (PostgreSQL)
- **AI 模型**：OpenAI API (gpt-4o-mini)

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

建立 `.env.local` 檔案並設置以下變數：

```env
# Vercel Postgres
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# OpenAI API
OPENAI_API_KEY="sk-..."
```

### 3. 初始化資料庫

首次使用前，需要初始化資料庫並生成虛擬數據：

```bash
# 啟動開發伺服器
npm run dev

# 在瀏覽器中訪問以下 URL 來初始化資料庫
http://localhost:3000/api/seed
```

或者使用 curl：

```bash
curl http://localhost:3000/api/seed
```

### 4. 啟動應用

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 開始使用。

## 使用指南

### 沙盒 (Playground)

1. **選擇注入模式**：
   - **直接注入**：在聊天介面中直接輸入惡意提示
   - **間接注入**：編輯電子郵件或資料庫記錄內容，插入惡意指令

2. **開始測試**：
   - 直接注入：輸入訊息並發送
   - 間接注入：編輯數據源內容後點擊「觸發 AI 助理處理」

3. **查看結果**：
   - 右側面板顯示工具調用記錄
   - 自動分析面板顯示攻擊分析結果

### 儀表板 (Dashboard)

- **虛擬業務數據**：查看模擬的客戶和訂單資料
- **攻擊記錄**：查看所有測試歷史和分析結果

## 資料庫架構

### 虛擬業務數據
- `customers` - 客戶資料
- `orders` - 訂單資料

### 工具自身數據
- `sessions` - 測試會話
- `messages` - 對話訊息
- `attack_records` - 攻擊記錄

## 開發

### 建構生產版本

```bash
npm run build
npm start
```

### 程式碼檢查

```bash
npm run lint
```

## 部署

推薦使用 Vercel 部署：

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設置環境變數
4. 部署完成後訪問 `/api/seed` 初始化資料庫

## 注意事項

- 本工具僅供教育目的使用
- 請勿在生產環境中使用
- 確保 OpenAI API 金鑰安全
- 定期檢查 API 使用量

## 授權

MIT License
