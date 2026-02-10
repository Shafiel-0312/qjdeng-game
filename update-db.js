const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lantern.db');

console.log('🔧 修复数据库...');

// 直接添加列（如果不存在）
db.run("ALTER TABLE parts ADD COLUMN compatible_types TEXT DEFAULT '[]'", (err) => {
  if (err) {
    console.log('列可能已存在，继续...');
  }
  
  // 设置兼容性
  db.run("UPDATE parts SET compatible_types = '[\"panel\",\"connector\"]' WHERE type = 'frame'");
  db.run("UPDATE parts SET compatible_types = '[\"frame\",\"decoration\"]' WHERE type = 'panel'");
  db.run("UPDATE parts SET compatible_types = '[\"panel\",\"light\"]' WHERE type = 'decoration'");
  
  console.log('✅ 兼容性设置完成');
  
  // 显示
  db.all("SELECT id, name, type, compatible_types FROM parts", (err, rows) => {
    if (err) {
      console.log('错误:', err.message);
    } else {
      console.log('当前数据:');
      rows.forEach(r => {
        console.log(`${r.id}. ${r.name} (${r.type}) -> ${r.compatible_types}`);
      });
    }
    db.close();
  });
});