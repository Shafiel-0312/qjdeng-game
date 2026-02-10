// 千角灯游戏 - 最简单启动版本
const express = require('express');
const app = express();
const PORT = 3000;

// 让服务器能接收JSON数据
app.use(express.json());

// 内存中存储千角灯部件
let parts = [
  { id: 1, name: '主骨架', type: 'frame', x: 0, y: 0, z: 0 },
  { id: 2, name: '三角灯面', type: 'panel', x: 1, y: 0, z: 0 },
  { id: 3, name: '装饰流苏', type: 'decoration', x: 0, y: 1, z: 0 }
];

// 🎮 核心功能1：获取所有部件
app.get('/api/parts', (req, res) => {
  console.log('📦 有人请求部件列表');
  res.json({
    success: true,
    message: '这是你的千角灯部件',
    count: parts.length,
    data: parts
  });
});

// 🎮 核心功能2：添加新部件
app.post('/api/parts', (req, res) => {
  const newPart = req.body;
  newPart.id = parts.length + 1;
  parts.push(newPart);
  
  console.log('➕ 添加了新部件：', newPart.name);
  res.json({
    success: true,
    message: '部件添加成功！',
    data: newPart
  });
});

// 🎮 核心功能3：拼装验证
app.post('/api/assemble', (req, res) => {
  const { part1Id, part2Id, distance } = req.body;
  
  // 简单逻辑：距离小于0.5就算成功
  const isSuccess = distance < 0.5;
  
  console.log(`🔗 拼装验证：部件${part1Id} + 部件${part2Id} = ${isSuccess ? '成功' : '失败'}`);
  
  res.json({
    success: true,
    assembled: isSuccess,
    message: isSuccess ? '🎉 拼装成功！' : '❌ 位置不对，再试试',
    score: isSuccess ? 100 : 0
  });
});

// 🎮 核心功能4：游戏首页
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>千角灯游戏控制台</title>
      <style>
        body { font-family: Arial; padding: 30px; background: #f5f5f5; }
        h1 { color: #d63031; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        button { background: #0984e3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0770c4; }
        code { background: #eee; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>🎮 千角灯3D拼接游戏控制台</h1>
      <p>服务器正常运行中！开始你的游戏开发之旅吧！</p >
      
      <div class="card">
        <h3>📡 测试API接口</h3>
        <button onclick="testGetParts()">测试获取部件</button>
        <button onclick="testAssemble()">测试拼装验证</button>
        <div id="result" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;"></div>
      </div>
      
      <div class="card">
        <h3>🔧 可用接口</h3>
        <ul>
          <li><code>GET /api/parts</code> - 获取所有部件</li>
          <li><code>POST /api/parts</code> - 添加新部件</li>
          <li><code>POST /api/assemble</code> - 验证拼装</li>
        </ul>
      </div>
      
      <div class="card">
        <h3>🚀 下一步行动</h3>
        <ol>
          <li>保持这个终端运行（不要关闭！）</li>
          <li>用上面的按钮测试接口</li>
          <li>打开MySQL，创建数据库</li>
          <li>将数据从内存移到数据库</li>
        </ol>
      </div>
      
      <script>
        async function testGetParts() {
          try {
            const res = await fetch('/api/parts');
            const data = await res.json();
            document.getElementById('result').innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (err) {
            document.getElementById('result').innerHTML = '错误：' + err;
          }
        }
        
        async function testAssemble() {
          const data = {
            part1Id: 1,
            part2Id: 2,
            distance: 0.3  // 小于0.5会成功
          };
          
          try {
            const res = await fetch('/api/assemble', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await res.json();
            document.getElementById('result').innerHTML = 
              '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
          } catch (err) {
            document.getElementById('result').innerHTML = '错误：' + err;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// 🚀 启动服务器
app.listen(PORT, () => {
  console.log(`
  ========================================
  🎮 千角灯游戏后端启动！
  📡 访问：http://localhost:${PORT}
  ⏰ ${new Date().toLocaleString()}
  ========================================
  
  核心功能已就绪：
  1. ✅ 获取部件接口：/api/parts
  2. ✅ 添加部件接口：/api/parts (POST)
  3. ✅ 拼装验证接口：/api/assemble (POST)
  
  测试方法：
  1. 浏览器打开上面的地址
  2. 点击页面中的测试按钮
  3. 或用Thunder Client测试
  
  按 Ctrl+C 停止服务器
  ========================================
  `);
});
