const express = require('express');
const db = require('./sqlite-db.js');  // 引入数据库
const LanternAssembler = require('./assemble-logic');  // 引入拼装逻辑

const app = express();
const PORT = 3000;

app.use(express.json());

// 主页
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>千角灯游戏</title>
    <style>
      body { font-family: Arial; padding: 20px; }
      button { padding: 10px 20px; margin: 5px; background: #0984e3; color: white; border: none; border-radius: 5px; cursor: pointer; }
      button:hover { background: #0770c4; }
      .result { margin-top: 20px; padding: 15px; background: #2d3436; color: white; border-radius: 5px; }
    </style>
    </head>
    <body>
      <h1>🎮 千角灯3D拼接游戏</h1>
      <div>
        <button onclick="testSimple()">简单拼装</button>
        <button onclick="testDetailed()">详细拼装</button>
        <button onclick="getParts()">查看部件</button>
        <button onclick="addPart()">添加部件</button>
      </div>
      <div class="result" id="result">点击按钮测试</div>
      <script>
        const result = document.getElementById('result');
        
        async function testSimple() {
          result.innerHTML = '测试中...';
          const res = await fetch('/api/assemble', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({part1Id:1, part2Id:2, distance:0.3})
          });
          result.innerHTML = JSON.stringify(await res.json(), null, 2);
        }
        
        async function testDetailed() {
          result.innerHTML = '详细拼装测试中...';
          const res = await fetch('/api/assemble/detailed', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              part1Id: 1,
              part2Id: 2,
              position1: {x:0, y:0, z:0},
              position2: {x:0.3, y:0, z:0}
            })
          });
          const data = await res.json();
          result.innerHTML = 
            '精确度: ' + data.accuracy + '%<br>' +
            '得分: ' + data.score + '<br>' +
            '结果: ' + data.message + '<br>' +
            '部件: ' + (data.parts ? data.parts.part1.name + ' + ' + data.parts.part2.name : '') + '<br>' +
            '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        
        async function getParts() {
          result.innerHTML = '获取部件中...';
          const res = await fetch('/api/parts');
          const data = await res.json();
          result.innerHTML = '共有 ' + data.count + ' 个部件:<br>' + 
            data.data.map(p => p.id + '. ' + p.name + ' (' + p.type + ')').join('<br>');
        }
        
        async function addPart() {
          result.innerHTML = '添加部件中...';
          const res = await fetch('/api/parts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              name: '新部件_' + Date.now().toString().slice(-4),
              type: 'panel'
            })
          });
          result.innerHTML = '添加成功: ' + JSON.stringify(await res.json(), null, 2);
        }
      </script>
    </body>
    </html>
  `);
});

// API接口
app.get('/api/parts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, type, difficulty FROM parts ORDER BY id');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/parts', async (req, res) => {
  try {
    const { name, type } = req.body;
    const [result] = await db.query(
      'INSERT INTO parts (name, type) VALUES (?, ?)',
      [name || '新部件', type || 'frame']
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/assemble', (req, res) => {
  const { distance } = req.body;
  const success = distance < 0.5;
  res.json({
    success: true,
    assembled: success,
    message: success ? '拼装成功' : '拼装失败',
    score: success ? 100 : 0
  });
});

app.post('/api/assemble/detailed', async (req, res) => {
  try {
    const { part1Id = 1, part2Id = 2, position1, position2 } = req.body;
    
    // 获取部件
    const [part1Rows] = await db.query('SELECT * FROM parts WHERE id = ?', [part1Id]);
    const [part2Rows] = await db.query('SELECT * FROM parts WHERE id = ?', [part2Id]);
    
    if (!part1Rows.length || !part2Rows.length) {
      return res.json({ success: false, error: '部件不存在' });
    }
    
    const part1 = part1Rows[0];
    const part2 = part2Rows[0];
    
    // 测试位置
    const pos1 = position1 || {x:0, y:0, z:0};
    const pos2 = position2 || {x:0.3, y:0, z:0};
    
    // 调用拼装逻辑
    const result = LanternAssembler.validateAssembly(
      part1,
      part2,
      { position: pos1 },
      { position: pos2 }
    );
    
    // 添加部件信息
    result.parts = {
      part1: { id: part1.id, name: part1.name, type: part1.type },
      part2: { id: part2.id, name: part2.name, type: part2.type }
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('详细拼装错误:', error);
    res.json({ 
      success: false, 
      error: error.message,
      debug: '请检查assemble-logic.js文件是否存在'
    });
  }
});

// 启动
app.listen(PORT, () => {
  console.log(`
  ======================================
  🎮 千角灯游戏服务器启动
  📡 http://localhost:${PORT}
  ⏰ ${new Date().toLocaleString()}
  ======================================
  `);
});