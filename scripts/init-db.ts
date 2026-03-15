/**
 * 資料庫初始化腳本
 * 
 * 使用方法：
 * 1. 確保 .env.local 已設置正確的資料庫連接資訊
 * 2. 執行：npx tsx scripts/init-db.ts
 * 
 * 或者直接訪問 API endpoint：
 * curl http://localhost:3000/api/seed
 */

import { seedDatabase } from '../lib/utils/seed';

async function main() {
  console.log('開始初始化資料庫...');
  
  try {
    await seedDatabase();
    console.log('✓ 資料庫初始化完成！');
    console.log('✓ 虛擬客戶和訂單數據已生成');
    process.exit(0);
  } catch (error) {
    console.error('✗ 初始化失敗:', error);
    process.exit(1);
  }
}

main();
