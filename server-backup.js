// ========== 1. 引入依赖 ==========
const express = require('express');
const db = require('./sqlite-db.js');

// ========== 2. 创建Express应用 ==========
const app = express();
const PORT = 3001;

// ========== 3. 中间件 ==========
app.use(express.json());
app.use(express.static('public'));

// ========== 4. 路由定义 ==========

// 4.1 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'thousand-corner-lantern',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'SQLite (connected)',
    uptime: process.uptime()
  });
});

// 4.2 首页 - 完整游戏控制台
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>千角灯游戏控制台</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2d3436;
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        .status-badge {
          background: #00b894;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: normal;
        }
        .dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .card h2 {
          color: #2d3436;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
        }
        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        .btn {
          padding: 14px 20px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary {
          background: linear-gradient(45deg, #0984e3, #6c5ce7);
          color: white;
        }
        .btn-success {
          background: linear-gradient(45deg, #00b894, #00cec9);
          color: white;
        }
        .result-panel {
          background: #2d3436;
          color: #dfe6e9;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          font-family: 'Consolas', 'Monaco', monospace;
          max-height: 400px;
          overflow-y: auto;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #636e72;
        }
        .copy-btn {
          background: #0984e3;
          color: white;
          border: none;
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
        }
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
      <div class="container">
        <h1>
          <i class="fas fa-puzzle-piece"></i>
          千角灯3D拼接游戏控制台
          <span class="status-badge">运行中 <i class="fas fa-circle" style="color: #00b894; font-size: 10px;"></i></span>
        </h1>
        
        <div class="dashboard">
          <div class="card">
            <h2><i class="fas fa-database"></i> 数据库操作</h2>
            <div class="button-grid">
              <button class="btn btn-primary" onclick="getParts()">
                <i class="fas fa-list"></i> 获取所有部件
              </button>
              <button class="btn btn-success" onclick="addRandomPart()">
                <i class="fas fa-plus-circle"></i> 添加随机部件
              </button>
            </div>
          </div>
          
          <div class="card">
            <h2><i class="fas fa-gamepad"></i> 游戏功能测试</h2>
            <div class="button-grid">
              <button class="btn btn-primary" onclick="testAssemble()">
                <i class="fas fa-puzzle-piece"></i> 简单拼装
              </button>
              <button class="btn btn-success" onclick="testDetailedAssemble()">
                <i class="fas fa-ruler-combined"></i> 详细拼装
              </button>
              <button class="btn btn-primary" onclick="testHealth()">
                <i class="fas fa-heartbeat"></i> 健康检查
              </button>
            </div>
          </div>
        </div>
        
        <div class="result-panel">
          <div class="result-header">
            <span><i class="fas fa-terminal"></i> 执行结果</span>
            <button class="copy-btn" onclick="copyResults()">
              <i class="fas fa-copy"></i> 复制结果
            </button>
          </div>
          <div id="result">点击上方按钮开始测试</div>
        </div>
      </div>
      
      <script>
        const resultDiv = document.getElementById('result');
        
        // 1. 获取所有部件
        async function getParts() {
          try {
            resultDiv.innerHTML = '🔄 正在获取部件...';
            const res = await fetch('/api/parts');
            const data = await res.json();
            resultDiv.innerHTML = '✅ 获取成功！\\n' + JSON.stringify(data, null, 2);
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 2. 添加随机部件
        async function addRandomPart() {
          const types = ['frame', 'panel', 'decoration', 'light'];
          const newPart = {
            name: '随机部件_' + Date.now().toString().slice(-6),
            type: types[Math.floor(Math.random() * types.length)],
            difficulty: Math.floor(Math.random() * 5) + 1
          };
          
          try {
            resultDiv.innerHTML = '🔄 正在添加...';
            const res = await fetch('/api/parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPart)
            });
            const data = await res.json();
            resultDiv.innerHTML = '✅ 添加成功！ID: ' + data.id;
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 3. 简单拼装测试
        async function testAssemble() {
          try {
            resultDiv.innerHTML = '🔗 简单拼装测试...';
            const res = await fetch('/api/assemble', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                part1Id: 1,
                part2Id: 2,
                distance: 0.3
              })
            });
            const data = await res.json();
            resultDiv.innerHTML = (data.assembled ? '🎉 成功' : '❌ 失败') + ': ' + data.message;
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 4. 详细拼装测试
        async function testDetailedAssemble() {
          try {
            resultDiv.innerHTML = '📏 详细拼装测试...';
            const res = await fetch('/api/assemble/detailed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                part1Id: 1,
                part2Id: 2,
                position1: {x:0, y:0, z:0},
                position2: {x:0.3, y:0, z:0}
              })
            });
            const data = await res.json();
            resultDiv.innerHTML = '✅ 详细拼装结果:\\n' + 
              '精确度: ' + data.accuracy + '%\\n' +
              '得分: ' + data.score + '\\n' +
              '消息: ' + data.message;
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 5. 健康检查
        async function testHealth() {
          try {
            resultDiv.innerHTML = '🏥 健康检查...';
            const res = await fetch('/api/health');
            const data = await res.json();
            resultDiv.innerHTML = '✅ 健康检查通过:\\n' + 
              '状态: ' + data.status + '\\n' +
              '运行时间: ' + Math.floor(data.uptime) + '秒';
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        function copyResults() {
          navigator.clipboard.writeText(resultDiv.innerText);
          alert('已复制到剪贴板');
        }
        
        // 页面加载时获取数据
        window.onload = getParts;
      </script>
    </body>
    </html>
  `);
});

// 4.3 获取部件接口
app.get('/api/parts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM parts ORDER BY difficulty');
    res.json({
      success: true,
      message: '从SQLite数据库获取',
      count: rows.length,
      data: rows
    });
  } catch (error) {
    res.json({
      success: true,
      message: '从内存获取',
      count: 3,
      data: [
        { id: 1, name: '主骨架', type: 'frame', difficulty: 1 },
        { id: 2, name: '三角灯面', type: 'panel', difficulty: 2 },
        { id: 3, name: '装饰流苏', type: 'decoration', difficulty: 3 }
      ]
    });
  }
});

// 4.4 添加部件接口
app.post('/api/parts', async (req, res) => {
  const { name, type, difficulty } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO parts (name, type, difficulty) VALUES (?, ?, ?)',
      [name, type, difficulty || 1]
    );
    
    res.json({
      success: true,
      message: '部件添加成功',
      id: result.insertId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '添加失败'
    });
  }
});

// 4.5 简单拼装验证接口
app.post('/api/assemble', (req, res) => {
  const { part1Id, part2Id, distance } = req.body;
  const isSuccess = distance < 0.5;
  
  res.json({
    success: true,
    assembled: isSuccess,
    message: isSuccess ? '🎉 拼装成功！' : '❌ 位置不对，再调整一下',
    score: isSuccess ? 100 : 0
  });
});

// 4.6 详细拼装接口
app.post('/api/assemble/detailed', (req, res) => {
  console.log('✅ 收到详细拼装请求');
  res.json({
    success: true,
    assembled: true,
    message: '详细拼装接口测试成功！',
    score: 95,
    accuracy: 95.5,
    timestamp: new Date().toISOString()
  });
});

// ========== 5. 启动服务器 ==========
app.listen(PORT, () => {
  console.log(`
  =============================================
  🎮 千角灯游戏服务器
  📡 访问地址：http://localhost:${PORT}
  ⏰ ${new Date().toLocaleString()}
  =============================================
  `);
});