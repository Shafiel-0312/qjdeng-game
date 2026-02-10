const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lantern.db');

console.log('🔧 修复数据库兼容性...');

db.serialize(() => {
  // 清空兼容性数据
  db.run("UPDATE parts SET compatible_types = '[]'");
  
  // 设置正确兼容性
  db.run("UPDATE parts SET compatible_types = '[\"panel\",\"connector\"]' WHERE type = 'frame'");
  db.run("UPDATE parts SET compatible_types = '[\"frame\",\"decoration\"]' WHERE type = 'panel'");
  db.run("UPDATE parts SET compatible_types = '[\"panel\",\"light\"]' WHERE type = 'decoration'");
  db.run("UPDATE parts SET compatible_types = '[\"decoration\"]' WHERE type = 'light'");
  
  // 显示结果
  db.all("SELECT id, name, type, compatible_types FROM parts", (err, rows) => {
    if (err) {
      console.log('❌ 错误:', err.message);
      return;
    }
    
    console.log('✅ 修复完成！当前数据:');
    console.table(rows.map(r => ({
      id: r.id,
      部件: r.name,
      类型: r.type,
      可连接: r.compatible_types
    })));
    
    console.log('\n🎯 现在测试:');
    console.log('1. frame(主骨架) 可以连接 panel(三角灯面)');
    console.log('2. panel 可以连接 decoration(装饰流苏)');
    console.log('3. decoration 可以连接 light(灯芯)');
  });
});

db.close();