// init-db.js - 最简单的数据库初始化
const mysql = require('mysql2');

console.log('🚀 开始设置千角灯数据库...');

// 创建连接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456'  // 改成你MySQL的密码
});

// 执行SQL函数
function runSQL(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) {
        console.log('❌ SQL错误:', error.message);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function setup() {
  try {
    // 1. 创建数据库
    console.log('1. 创建数据库...');
    await runSQL('CREATE DATABASE IF NOT EXISTS lantern_game');
    await runSQL('USE lantern_game');
    
    // 2. 创建简单的parts表
    console.log('2. 创建数据表...');
    await runSQL(`
      CREATE TABLE IF NOT EXISTS parts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        type VARCHAR(20),
        x FLOAT DEFAULT 0,
        y FLOAT DEFAULT 0,
        z FLOAT DEFAULT 0,
        difficulty INT DEFAULT 1
      )
    `);
    
    // 3. 检查是否有数据
    console.log('3. 检查数据...');
    const [rows] = await runSQL('SELECT COUNT(*) as count FROM parts');
    
    if (rows[0].count === 0) {
      console.log('4. 插入示例数据...');
      await runSQL(`
        INSERT INTO parts (name, type, difficulty) VALUES
        ('主骨架', 'frame', 1),
        ('三角形灯面', 'panel', 2),
        ('装饰流苏', 'decoration', 3),
        ('灯芯', 'light', 4)
      `);
    }
    
    // 4. 显示结果
    const [data] = await runSQL('SELECT * FROM parts');
    console.log('✅ 数据库设置完成！');
    console.log('📊 当前数据:', data);
    
  } catch (error) {
    console.log('❌ 设置失败，可能原因：');
    console.log('   - MySQL服务没启动 (运行: net start MySQL80)');
    console.log('   - 密码错误 (默认: root123)');
    console.log('   - 网络问题');
  } finally {
    connection.end();
    console.log('\n🎯 接下来：');
    console.log('1. 确保MySQL服务已启动');
    console.log('2. 运行: node server.js');
    console.log('3. 访问: http://localhost:3000');
  }
}

// 执行
setup();