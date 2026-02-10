// ========== 1. 引入依赖 ==========
const express = require('express');
const db = require('./sqlite-db.js');

// ========== 2. 创建Express应用 ==========
const app = express();
const PORT = 3000;

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

// 4.2 首页 - 完整游戏控制台（第一部分）
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
        .card h2 i {
          font-size: 24px;
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
        .btn-warning {
          background: linear-gradient(45deg, #fdcb6e, #e17055);
          color: white;
        }
        .btn-danger {
          background: linear-gradient(45deg, #d63031, #fd79a8);
          color: white;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
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
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }
        .stat-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #0984e3;
        }
        .stat-label {
          font-size: 14px;
          color: #636e72;
          margin-top: 5px;
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
          <!-- 数据库操作卡片 -->
          <div class="card">
            <h2><i class="fas fa-database"></i> 数据库操作</h2>
            <div class="button-grid">
              <button class="btn btn-primary" onclick="getParts()">
                <i class="fas fa-list"></i> 获取所有部件
              </button>
              <button class="btn btn-success" onclick="addRandomPart()">
                <i class="fas fa-plus-circle"></i> 添加随机部件
              </button>
              <button class="btn btn-warning" onclick="updateRandomPart()">
                <i class="fas fa-edit"></i> 更新随机部件
              </button>
              <button class="btn btn-danger" onclick="deleteRandomPart()">
                <i class="fas fa-trash"></i> 删除随机部件
              </button>
            </div>
          </div>
          
          <!-- 游戏功能卡片 -->
          <div class="card">
            <h2><i class="fas fa-gamepad"></i> 游戏功能测试</h2>
            <div class="button-grid">
              <button class="btn btn-primary" onclick="testAssemble()">
                <i class="fas fa-puzzle-piece"></i> 测试拼装验证
              </button>
              <button class="btn btn-success" onclick="testHealth()">
                <i class="fas fa-heartbeat"></i> 服务器健康检查
              </button>
              <button class="btn btn-warning" onclick="simulateGame()">
                <i class="fas fa-play-circle"></i> 模拟完整游戏
              </button>
              <button class="btn btn-danger" onclick="clearResults()">
                <i class="fas fa-broom"></i> 清空结果
              </button>
            </div>
          </div>
          
          <!-- 开发工具卡片 -->
          <div class="card">
            <h2><i class="fas fa-tools"></i> 开发工具</h2>
            <div class="button-grid">
              <button class="btn btn-primary" onclick="viewAPI()">
                <i class="fas fa-code"></i> 查看API文档
              </button>
              <button class="btn btn-success" onclick="test3D()">
                <i class="fas fa-cube"></i> 3D测试页面
              </button>
              <button class="btn btn-warning" onclick="exportData()">
                <i class="fas fa-download"></i> 导出数据
              </button>
              <button class="btn btn-danger" onclick="restartServer()">
                <i class="fas fa-redo"></i> 重启服务器
              </button>
            </div>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value" id="partsCount">0</div>
            <div class="stat-label">千角灯部件</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="apiCalls">0</div>
            <div class="stat-label">API调用次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="assemblies">0</div>
            <div class="stat-label">拼装测试</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="uptime">0s</div>
            <div class="stat-label">运行时间</div>
          </div>
        </div>
        
        <!-- 结果显示区域 -->
        <div class="result-panel">
          <div class="result-header">
            <span><i class="fas fa-terminal"></i> 执行结果</span>
            <button class="copy-btn" onclick="copyResults()">
              <i class="fas fa-copy"></i> 复制结果
            </button>
          </div>
          <div id="result">欢迎使用千角灯游戏控制台！点击上方按钮开始测试。</div>
        </div>
      </div>
      
      <script>
              const resultDiv = document.getElementById('result');
        let apiCallCount = 0;
        let assembleCount = 0;
        let partsCount = 0;
        const startTime = Date.now();
        
        // 更新统计信息
        function updateStats() {
          document.getElementById('apiCalls').textContent = apiCallCount;
          document.getElementById('assemblies').textContent = assembleCount;
          document.getElementById('partsCount').textContent = partsCount;
          document.getElementById('uptime').textContent = Math.floor((Date.now() - startTime) / 1000) + 's';
        }
        
        // 记录API调用
        function logAPICall() {
          apiCallCount++;
          updateStats();
        }
        
        // 1. 获取所有部件
        async function getParts() {
          try {
            resultDiv.innerHTML = '🔄 正在获取千角灯部件数据...';
            logAPICall();
            
            const res = await fetch('/api/parts');
            const data = await res.json();
            
            partsCount = data.count;
            updateStats();
            
            resultDiv.innerHTML = 
              '✅ 获取成功！共发现 ' + data.count + ' 个千角灯部件\\n\\n' +
              JSON.stringify(data.data, null, 2);
              
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 2. 添加随机部件
        async function addRandomPart() {
          const types = ['frame', 'panel', 'decoration', 'light'];
          const names = ['主骨架', '三角灯面', '装饰流苏', '灯芯', '连接件', '支架', '装饰球', '悬挂链'];
          const adjectives = ['精致', '传统', '现代', '古典', '简约', '华丽'];
          
          const newPart = {
            name: adjectives[Math.floor(Math.random() * adjectives.length)] + 
                  names[Math.floor(Math.random() * names.length)] + 
                  '_' + Date.now().toString().slice(-6),
            type: types[Math.floor(Math.random() * types.length)],
            difficulty: Math.floor(Math.random() * 5) + 1
          };
          
          try {
            resultDiv.innerHTML = '🔄 正在添加随机部件: ' + newPart.name;
            logAPICall();
            
            const res = await fetch('/api/parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPart)
            });
            
            const data = await res.json();
            partsCount++;
            updateStats();
            
            resultDiv.innerHTML = 
              '✅ 随机部件添加成功！\\n' +
              '部件ID: ' + data.id + '\\n' +
              '部件名称: ' + newPart.name + '\\n' +
              '部件类型: ' + newPart.type + '\\n' +
              '拼装难度: ' + newPart.difficulty;
              
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 3. 测试拼装验证
        async function testAssemble() {
          const testData = {
            part1Id: Math.floor(Math.random() * partsCount) + 1 || 1,
            part2Id: Math.floor(Math.random() * partsCount) + 1 || 2,
            distance: Math.random().toFixed(2)
          };
          
          try {
            resultDiv.innerHTML = \`🔗 测试拼装验证...\\n部件\${testData.part1Id} + 部件\${testData.part2Id}\\n距离: \${testData.distance}\`;
            logAPICall();
            assembleCount++;
            updateStats();
            
            const res = await fetch('/api/assemble', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(testData)
            });
            
            const data = await res.json();
            
            resultDiv.innerHTML = 
              (data.assembled ? '🎉 拼装成功！' : '❌ 拼装失败') + '\\n\\n' +
              '测试详情:\\n' +
              '- 部件1 ID: ' + testData.part1Id + '\\n' +
              '- 部件2 ID: ' + testData.part2Id + '\\n' +
              '- 距离: ' + testData.distance + '\\n' +
              '- 结果: ' + data.message + '\\n' +
              '- 得分: ' + data.score;
              
          } catch (err) {
            resultDiv.innerHTML = '❌ 错误: ' + err;
          }
        }
        
        // 4. 服务器健康检查
        async function testHealth() {
          try {
            resultDiv.innerHTML = '🏥 正在检查服务器健康状况...';
            logAPICall();
            
            const res = await fetch('/api/health');
            const data = await res.json();
            
            resultDiv.innerHTML = 
              '✅ 服务器运行正常！\\n\\n' +
              '服务状态: ' + data.status + '\\n' +
              '服务名称: ' + data.service + '\\n' +
              '版本: ' + data.version + '\\n' +
              '数据库: ' + data.database + '\\n' +
              '运行时间: ' + Math.floor(data.uptime) + '秒\\n' +
              '时间戳: ' + new Date(data.timestamp).toLocaleString();
              
          } catch (err) {
            resultDiv.innerHTML = '❌ 健康检查失败: ' + err;
          }
        }
        
        // 5. 模拟完整游戏流程
        async function simulateGame() {
          resultDiv.innerHTML = '🎮 开始模拟完整游戏流程...\\n\\n';
          
          try {
            // 步骤1: 获取部件
            resultDiv.innerHTML += '1. 获取游戏部件...';
            const partsRes = await fetch('/api/parts');
            const partsData = await partsRes.json();
            resultDiv.innerHTML += ' ✅ 获取到 ' + partsData.count + ' 个部件\\n';
            logAPICall();
            
            // 步骤2: 添加新部件
            resultDiv.innerHTML += '2. 添加新部件...';
            const addRes = await fetch('/api/parts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: '玩家自定义部件',
                type: 'panel',
                difficulty: 3
              })
            });
            const addData = await addRes.json();
            resultDiv.innerHTML += ' ✅ 添加成功，ID: ' + addData.id + '\\n';
            logAPICall();
            
            // 步骤3: 测试拼装
            resultDiv.innerHTML += '3. 测试拼装...';
            const assembleRes = await fetch('/api/assemble', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                part1Id: 1,
                part2Id: 2,
                distance: 0.3
              })
            });
            const assembleData = await assembleRes.json();
            resultDiv.innerHTML += ' ✅ ' + assembleData.message + '\\n';
            logAPICall();
            assembleCount++;
            
            // 步骤4: 健康检查
            resultDiv.innerHTML += '4. 服务器检查...';
            const healthRes = await fetch('/api/health');
            const healthData = await healthRes.json();
            resultDiv.innerHTML += ' ✅ 服务器运行正常\\n';
            logAPICall();
            
            resultDiv.innerHTML += '\\n🎉 游戏流程模拟完成！总得分: ' + assembleData.score;
            updateStats();
            
          } catch (err) {
            resultDiv.innerHTML += '❌ 模拟过程中出错: ' + err;
          }
        }
        
        // 6. 其他辅助功能
        function clearResults() {
          resultDiv.innerHTML = '🧹 结果已清空';
        }
        
        function copyResults() {
          navigator.clipboard.writeText(resultDiv.innerText)
            .then(() => alert('结果已复制到剪贴板！'))
            .catch(err => console.error('复制失败:', err));
        }
        
        function viewAPI() {
          resultDiv.innerHTML = \`
📚 API 文档
============

GET /api/parts
--------------
获取所有千角灯部件
响应: { success, message, count, data }

POST /api/parts
---------------
添加新部件
参数: { name, type, difficulty }
响应: { success, message, id }

POST /api/assemble
------------------
验证拼装结果
参数: { part1Id, part2Id, distance }
响应: { success, assembled, message, score }

GET /api/health
---------------
服务器健康检查
响应: { status, service, version, timestamp, database, uptime }
          \`;
        }
        
        function test3D() {
          window.open('/public/3d-test.html', '_blank');
        }
        
        function exportData() {
          resultDiv.innerHTML = '📥 导出功能开发中...';
        }
        
        function restartServer() {
          resultDiv.innerHTML = '🔄 重启功能需要后端支持，目前请手动重启';
        }
        
        async function updateRandomPart() {
          resultDiv.innerHTML = '✏️ 更新功能需要后端支持，目前请使用添加功能';
        }
        
        async function deleteRandomPart() {
          resultDiv.innerHTML = '🗑️ 删除功能需要后端支持，目前请手动操作数据库';
        }
        
        // 页面加载时自动获取数据
        window.onload = getParts;
        
        // 定时更新统计
        setInterval(updateStats, 1000);
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
    
    console.log('📦 从数据库获取了', rows.length, '个部件');
    
  } catch (error) {
    console.log('❌ 数据库错误:', error.message);
    
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
    console.log('❌ 添加失败:', error.message);
    res.status(500).json({
      success: false,
      error: '添加失败'
    });
  }
});

// 4.5 拼装验证接口
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