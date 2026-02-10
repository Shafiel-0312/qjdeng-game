const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建/连接到SQLite数据库文件
const dbPath = path.join(__dirname, 'lantern.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 使用SQLite数据库（免安装）');

// 初始化表
db.serialize(() => {
  // 1. 创建parts表（扩展版）
  db.run(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('frame', 'panel', 'decoration', 'light', 'connector')),
      position_json TEXT DEFAULT '{"x":0,"y":0,"z":0}',
      rotation_json TEXT DEFAULT '{"x":0,"y":0,"z":0}',
      difficulty INTEGER DEFAULT 1,
      mesh_path TEXT,
      connection_points TEXT DEFAULT '[]',
      compatible_types TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 2. 创建users表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 3. 创建game_records表
  db.run(`
    CREATE TABLE IF NOT EXISTS game_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      level_id INTEGER DEFAULT 1,
      time_used INTEGER,
      accuracy REAL,
      score INTEGER,
      parts_used TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 4. 插入示例数据
  db.get('SELECT COUNT(*) as count FROM parts', (err, row) => {
    if (err) {
      console.log('❌ 查询失败:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO parts (name, type, difficulty, connection_points, compatible_types) VALUES (?, ?, ?, ?, ?)');
      
      // 示例数据带连接信息
      stmt.run('主骨架', 'frame', 1, 
        '[{"x":0,"y":0.5,"z":0,"type":"socket"},{"x":0,"y":-0.5,"z":0,"type":"socket"}]',
        '["panel", "connector"]'
      );
      stmt.run('三角灯面', 'panel', 2,
        '[{"x":0.5,"y":0,"z":0,"type":"tenon"},{"x":-0.5,"y":0,"z":0,"type":"tenon"}]',
        '["frame", "decoration"]'
      );
      stmt.run('装饰流苏', 'decoration', 3,
        '[{"x":0,"y":0.3,"z":0,"type":"hook"}]',
        '["panel", "light"]'
      );
      stmt.finalize();
      console.log('✅ 示例数据插入完成（带连接点）');
    } else {
      console.log('📊 现有数据:', row.count, '条记录');
    }
    
    // 显示数据
    db.all('SELECT id, name, type, difficulty FROM parts', (err, rows) => {
      if (err) {
        console.log('❌ 查询数据失败:', err.message);
      } else {
        console.log('🎯 数据库内容:');
        console.table(rows);
        console.log('✅ 数据库结构已更新为游戏专用结构');
      }
    });
  });
});

// 导出Promise版本的db
const dbPromise = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve([{ insertId: this.lastID }]);
        });
      }
    });
  }
};

module.exports = dbPromise;