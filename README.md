# Ichiban Kuji Backend

一個使用 TypeScript + Hono.js + Prisma + PostgreSQL 開發的一番賞抽獎系統後端 API。

## 功能特點

- 🔐 JWT 身份驗證與授權
- 👥 使用者管理（註冊、登入、權限控制）
- 🎁 獎品管理（CRUD 操作）
- 🎯 抽獎套組管理
- 🎲 抽獎機制
- 🔒 並發控制
- 📝 完整的資料驗證
- 🗃️ PostgreSQL 資料庫

## 技術堆疊

- **框架**: Hono.js
- **語言**: TypeScript
- **ORM**: Prisma
- **資料庫**: PostgreSQL
- **身份驗證**: JWT
- **資料驗證**: Zod

## 快速開始

### 環境要求

- Node.js >= 18
- PostgreSQL >= 14
- pnpm

### 安裝步驟

1. 複製專案
```bash
git clone <repository-url>
cd ichiban-kuji-backend# Ichiban Kuji Backend

一個使用 TypeScript + Hono.js + Prisma + PostgreSQL 開發的一番賞抽獎系統後端 API。

## 功能特點

- 🔐 JWT 身份驗證與授權
- 👥 使用者管理（註冊、登入、權限控制）
- 🎁 獎品管理（CRUD 操作）
- 🎯 抽獎套組管理
- 🎲 抽獎機制
- 🔒 並發控制
- 📝 完整的資料驗證
- 🗃️ PostgreSQL 資料庫

## 技術堆疊

- **框架**: Hono.js
- **語言**: TypeScript
- **ORM**: Prisma
- **資料庫**: PostgreSQL
- **身份驗證**: JWT
- **資料驗證**: Zod

## 快速開始

### 環境要求

- Node.js >= 18
- PostgreSQL >= 14
- pnpm

### 安裝步驟

1. 複製專案
```bash
git clone <repository-url>
cd ichiban-kuji-backend
```

2. 安裝依賴
```bash
pnpm install
```

3. 複製 `.env.example` 檔案並命名為 `.env`，並設定環境變數
```bash
cp .env.example .env
```

4. 編輯 `.env` 檔案，設定 PostgreSQL 連線資訊
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ichiban_kuji"
DIRECT_URL="postgresql://user:password@localhost:5432/ichiban_kuji"
JWT_SECRET="your-jwt-secret"
```

5. 建立資料庫
```bash
pnpm prisma:migrate
```

6. 啟動開發伺服器
```bash
pnpm dev
```

## API 文件
認證相關
* `POST /api/auth/register` - 使用者註冊
* `POST /api/auth/login` - 使用者登入
* `GET /api/auth/verify` - 驗證 Token
獎品管理
* `GET /api/prizes/:id` - 取得單一獎品
* `POST /api/prizes` - 新增獎品
* `PUT /api/prizes/:id` - 更新獎品
* `DELETE /api/prizes/:id` - 刪除獎品
抽獎套組
* `GET /api/draw-sets` - 取得所有套組
* `GET /api/draw-sets/:id` - 取得單一套組
* `POST /api/draw-sets` - 建立套組
* `PUT /api/draw-sets/:id` - 更新套組
* `DELETE /api/draw-sets/:id` - 刪除套組
抽獎相關
* `POST /api/draws` - 執行抽獎
* `GET /api/draws/history` - 取得使用者抽獎歷史
* `GET /api/draws/history/:drawSetId` - 取得特定套組的抽獎歷史

## 開發指令
```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # 建置專案
pnpm start        # 執行生產環境
pnpm prisma:generate  # 產生 Prisma Client
pnpm prisma:migrate   # 執行資料庫遷移
```

## 資料庫結構
主要資料表：
- `users` - 使用者資料
- `prizes` - 獎品資料
- `draw_sets` - 抽獎套組資料
- `draws_records` - 抽獎紀錄
- `draws_set_prizes` - 抽獎套組與獎品關聯表
- `draws_set_locks` - 抽獎套組鎖定紀錄

## 錯誤處理
API 錯誤回應格式：
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}
```

## 貢獻
1. Fork 專案
2. 建立分支 (`git checkout -b feature/fooBar`)
3. 提交變更 (`git commit -am 'Add some fooBar'`)
4. 推送到分支 (`git push origin feature/fooBar`)
5. 建立一個新的 Pull Request

## 支援
如果有任何問題或建議，請開啟 Issue 討論。