const express = require('express');
const db = require('./sqlite-db.js');
const LanternAssembler = require('./assemble-logic');

const app = express();
const PORT = 3000;

app.use(express.json());

// 首页（进入游戏按钮）
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>千角灯游戏</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #667eea; 
          min-height: 100vh; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
        }
        .start-screen { 
          text-align: center; 
          background: white; 
          padding: 50px; 
          border-radius: 20px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.2); 
          max-width: 500px; 
          width: 90%; 
        }
        .title { 
          font-size: 36px; 
          color: #2d3436; 
          margin-bottom: 10px; 
        }
        .start-btn { 
          background: #0984e3; 
          color: white; 
          border: none; 
          padding: 18px 50px; 
          font-size: 20px; 
          border-radius: 50px; 
          cursor: pointer; 
        }
        .start-btn:hover {
          background: #0770c4;
        }
      </style>
    </head>
    <body>
      <div class="start-screen">
        <h1 class="title">千角灯3D拼接游戏</h1>
        <button class="start-btn" onclick="startGame()">进入游戏控制台</button>
      </div>
      <script>
        function startGame() { 
          window.location.href='/game'; 
        }
      </script>
    </body>
    </html>
  `);
});

// 游戏控制台页面
app.get('/game', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>千角灯游戏</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f8f9fa; 
          min-height: 100vh; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
          text-align: center; 
        }
        .menu { 
          max-width: 600px; 
          margin: 50px auto; 
          padding: 20px; 
        }
        .menu-btn { 
          display: block; 
          width: 100%; 
          padding: 25px; 
          margin: 20px 0; 
          background: #0984e3; 
          color: white; 
          border: none; 
          border-radius: 10px; 
          font-size: 24px; 
          cursor: pointer; 
        }
        .menu-btn:hover { 
          background: #0770c4; 
        }
        .btn-2 { 
          background: #00b894; 
        }
        .btn-2:hover { 
          background: #00a085; 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/'">返回首页</button>
        <h1>千角灯游戏</h1>
      </div>
      
      <div class="menu">
        <button class="menu-btn" onclick="startMaking()">
          🛠️ 开始制作
        </button>
        
        <button class="menu-btn btn-2" onclick="showHanging()">
          🏮 实景悬挂
        </button>
      </div>
      
      <script>
        function startMaking() {
          window.location.href = '/making';
        }
        function showHanging() {
          window.location.href = '/hanging';
        }
      </script>
    </body>
    </html>
  `);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 获取部件
app.get('/api/parts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, type FROM parts');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 添加部件
app.post('/api/parts', async (req, res) => {
  try {
    const { name, type } = req.body;
    const [result] = await db.query('INSERT INTO parts (name, type) VALUES (?, ?)', [name || '新部件', type || 'frame']);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 简单拼装
app.post('/api/assemble', (req, res) => {
  const { distance } = req.body;
  const success = distance < 0.5;
  res.json({ 
    success: true, 
    assembled: success, 
    message: success ? '成功' : '失败', 
    score: success ? 100 : 0 
  });
});

// 详细拼装
app.post('/api/assemble/detailed', async (req, res) => {
  try {
    const [p1] = await db.query('SELECT * FROM parts WHERE id = ?', [1]);
    const [p2] = await db.query('SELECT * FROM parts WHERE id = ?', [2]);
    
    if (!p1.length || !p2.length) {
      return res.json({ success: false, error: '部件不存在' });
    }
    
    const result = LanternAssembler.validateAssembly(p1[0], p2[0], {}, {});
    res.json(result);
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 制作页面 - 只有两个按钮
app.get('/making', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>开始制作</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .steps { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
        }
        .step { 
          background: white; 
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .step-btn { 
          display: block; 
          width: 100%; 
          padding: 20px; 
          margin: 15px 0; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          font-size: 20px; 
          cursor: pointer; 
          text-align: center; 
        }
        .step-btn:hover { 
          opacity: 0.9;
        }
        .btn-instruction { 
          background: #00b894; 
        }
        .btn-create { 
          background: #6c5ce7; 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .description {
          color: #666;
          margin: 10px 0 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/game'">返回主菜单</button>
        <h1>开始制作</h1>
      </div>
      
      <div class="steps">
        <div class="step">
          <h2>制作说明</h2>
          <p class="description">了解千角灯的材料故事和传统技艺</p>
          <button class="step-btn btn-instruction" onclick="viewInstruction()">
            📖 制作说明
          </button>
        </div>
        
        <div class="step">
          <h2>自主创作</h2>
          <p class="description">自由拼装，创造你的千角灯作品</p>
          <button class="step-btn btn-create" onclick="createOwn()">
            🎨 自主创作
          </button>
        </div>
      </div>
      
      <script>
        function viewInstruction() {
          window.location.href = '/instruction';
        }
        function createOwn() {
          window.location.href = '/create';
        }
      </script>
    </body>
    </html>
  `);
});

// 制作说明页面
app.get('/instruction', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>制作说明</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
        }
        .instruction-card { 
          background: white; 
          padding: 40px; 
          margin: 30px 0; 
          border-radius: 15px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
          text-align: center; 
        }
        .instruction-btn { 
          display: block; 
          width: 100%; 
          padding: 25px; 
          margin: 25px 0; 
          color: white; 
          border: none; 
          border-radius: 10px; 
          font-size: 22px; 
          cursor: pointer; 
        }
        .instruction-btn:hover { 
          opacity: 0.9;
        }
        .btn-materials { 
          background: #00b894; 
        }
        .btn-skills { 
          background: #fd79a8; 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .description { 
          color: #666; 
          margin: 15px 0 30px 0; 
          font-size: 16px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/making'">返回制作页面</button>
        <h1>制作说明</h1>
      </div>
      
      <div class="content">
        <div class="instruction-card">
          <h2>深入了解千角灯</h2>
          <p class="description">选择您想要了解的内容：</p>
          
          <button class="instruction-btn btn-materials" onclick="viewMaterialsStory()">
            📖 材料故事
          </button>
          
          <button class="instruction-btn btn-skills" onclick="viewSkillExplanation()">
            🔧 技艺解说
          </button>
        </div>
      </div>
      
      <script>
        function viewMaterialsStory() {
          window.location.href = '/materials-story';
        }
        function viewSkillExplanation() {
          window.location.href = '/skill-explanation';
        }
      </script>
    </body>
    </html>
  `);
});

// 材料故事页面
app.get('/materials-story', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>材料故事</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
          background: white; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .material-card { 
          background: #f8f9fa; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px; 
          border-left: 4px solid #00b894; 
        }
        .material-title {
          color: #2d3436;
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/instruction'">返回制作说明</button>
        <h1>材料故事</h1>
      </div>
      
      <div class="content">
        <h2>千角灯的传统材料</h2>
        <p>千角灯作为非物质文化遗产，其材料选择有着深厚的文化内涵：</p>
        
        <div class="material-card">
          <h3 class="material-title">🎋 竹材骨架</h3>
          <p><strong>文化寓意：</strong>竹子象征着坚韧不拔、虚心有节，代表了中国文人的气节。</p>
          <p><strong>工艺特点：</strong>选用3-5年生的毛竹，经过蒸煮、晾晒、弯曲等多道工序处理。</p>
          <p><strong>故事传说：</strong>相传古代工匠在竹林中发现自然弯曲的竹子，启发创造了千角灯的弧形结构。</p>
        </div>
        
        <div class="material-card">
          <h3 class="material-title">🏮 丝质灯面</h3>
          <p><strong>文化寓意：</strong>丝绸代表富贵吉祥，灯面上常绘有吉祥图案和民间故事。</p>
          <p><strong>工艺特点：</strong>使用苏杭上等丝绸，经过染色、绘制、裱糊等工序。</p>
          <p><strong>历史渊源：</strong>宋代宫廷曾用金线刺绣的丝绸制作千角灯，成为皇家庆典的珍品。</p>
        </div>
        
        <div class="material-card">
          <h3 class="material-title">✨ 琉璃装饰</h3>
          <p><strong>文化寓意：</strong>琉璃代表光明纯洁，能够折射出七彩光芒。</p>
          <p><strong>工艺特点：</strong>采用传统琉璃烧制技艺，每片都是手工制作。</p>
          <p><strong>民间传说：</strong>传说琉璃能够驱邪避凶，为悬挂千角灯的家庭带来平安。</p>
        </div>
        
        <div class="material-card">
          <h3 class="material-title">🪡 铜制连接件</h3>
          <p><strong>文化寓意：</strong>铜器象征稳固长久，寓意家族传承。</p>
          <p><strong>工艺特点：</strong>使用传统失蜡法铸造，确保每个连接件都精准契合。</p>
          <p><strong>工匠智慧：</strong>铜制榫卯结构不用一根钉子，却能承受数十斤重量。</p>
        </div>
        
        <p style="margin-top: 30px; font-style: italic; color: #666;">
          每一件材料都承载着历史故事和文化记忆，体现了传统工匠的智慧与匠心。
        </p>
      </div>
    </body>
    </html>
  `);
});

// 技艺解说页面
app.get('/skill-explanation', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>技艺解说</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
          background: white; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .skill-card { 
          background: #f8f9fa; 
          padding: 20px; 
          margin: 20px 0; 
          border-radius: 8px; 
          border-left: 4px solid #0984e3; 
        }
        .skill-title {
          color: #2d3436;
          margin-top: 0;
        }
        .step-list {
          padding-left: 20px;
        }
        .step-list li {
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/instruction'">返回制作说明</button>
        <h1>技艺解说</h1>
      </div>
      
      <div class="content">
        <h2>千角灯制作技艺详解</h2>
        <p>千角灯的制作技艺已被列为非物质文化遗产，以下是最核心的技艺要点：</p>
        
        <div class="skill-card">
          <h3 class="skill-title">📐 设计放样技艺</h3>
          <p><strong>核心要点：</strong>在不使用现代测量工具的情况下，仅凭经验和口诀进行设计。</p>
          <ul class="step-list">
            <li><strong>口诀传承：</strong>"三六九，走一走；四八十二，定方圆"</li>
            <li><strong>比例关系：</strong>严格遵循黄金分割比例和传统美学规范</li>
            <li><strong>放样方法：</strong>在地上用石灰画出1:1的灯体轮廓</li>
          </ul>
        </div>
        
        <div class="skill-card">
          <h3 class="skill-title">🔨 榫卯结构技艺</h3>
          <p><strong>核心要点：</strong>全灯不用一根钉子，完全依靠榫卯连接。</p>
          <ul class="step-list">
            <li><strong>燕尾榫：</strong>用于主要骨架连接，受力最强</li>
            <li><strong>穿带榫：</strong>用于横向连接，增加稳定性</li>
            <li><strong>楔钉榫：</strong>用于装饰件连接，方便拆卸</li>
            <li><strong>口诀：</strong>"榫对卯，卯合榫，严丝合缝不用钉"</li>
          </ul>
        </div>
        
        <div class="skill-card">
          <h3 class="skill-title">🎨 装饰绘制技艺</h3>
          <p><strong>核心要点：</strong>每幅图案都有特定的文化寓意。</p>
          <ul class="step-list">
            <li><strong>题材选择：</strong>民间故事、吉祥图案、历史典故</li>
            <li><strong>绘制技法：</strong>工笔重彩、写意泼墨相结合</li>
            <li><strong>色彩运用：</strong>遵循"红黄为贵，蓝绿为辅"的传统配色</li>
            <li><strong>特殊技艺：</strong>夜间发光颜料的运用</li>
          </ul>
        </div>
        
        <div class="skill-card">
          <h3 class="skill-title">💡 灯光布局技艺</h3>
          <p><strong>核心要点：</strong>确保灯光均匀分布，不产生阴影。</p>
          <ul class="step-list">
            <li><strong>光源选择：</strong>传统使用油灯，现代改用LED</li>
            <li><strong>布局原则：</strong>"中心主灯，四角辅灯，层层递进"</li>
            <li><strong>亮度控制：</strong>通过灯罩厚度调节光线强弱</li>
            <li><strong>散热设计：</strong>自然对流散热结构</li>
          </ul>
        </div>
        
        <div class="skill-card">
          <h3 class="skill-title">🔄 拼装调试技艺</h3>
          <p><strong>核心要点：</strong>最后的组装需要精准的平衡调试。</p>
          <ul class="step-list">
            <li><strong>组装顺序：</strong>"先下后上，先内后外，先骨后皮"</li>
            <li><strong>平衡测试：</strong>悬挂后观察各角度是否水平</li>
            <li><strong>承重测试：</strong>逐步增加重量测试结构强度</li>
            <li><strong>灯光测试：</strong>夜间测试灯光效果</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px; font-style: italic; color: #666;">
          这些技艺都是师徒口传心授，每一代工匠都在传承中不断创新和发展。
        </p>
      </div>
    </body>
    </html>
  `);
});

// 自主创作页面
app.get('/create', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>自主创作</title>
      <style>
        body { 
          font-family: Arial; 
          padding: 20px; 
          background: #f0f2f5;
        }
        .creation-area { 
          max-width: 800px; 
          margin: auto; 
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .btn { 
          padding: 15px 30px; 
          margin: 10px; 
          background: #0984e3; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 16px;
        }
        .btn:hover {
          background: #0770c4;
        }
        .create-btn { 
          background: #6c5ce7; 
        }
        .create-btn:hover {
          background: #5b4bd4;
        }
        .back-btn { 
          background: #636e72; 
          margin-bottom: 20px;
        }
        .back-btn:hover {
          background: #525b64;
        }
      </style>
    </head>
    <body>
      <div style="max-width: 800px; margin: auto;">
        <button class="btn back-btn" onclick="window.location.href='/making'">返回制作页面</button>
      </div>
      <div class="creation-area">
        <h1>自主创作</h1>
        <p>自由组合部件，创造你的千角灯作品：</p>
        
        <div style="margin: 30px 0;">
          <button class="btn" onclick="addPart()">
            添加新部件
          </button>
          
          <button class="btn create-btn" onclick="showCreation()">
            查看创作作品
          </button>
        </div>
        
        <p id="message" style="margin-top:20px; padding: 15px; background: #f8f9fa; border-radius: 5px;"></p>
      </div>
      
      <script>
        async function addPart() {
          const name = prompt('输入部件名称:', '自定义部件');
          const type = prompt('输入部件类型(frame/panel/decoration/light):', 'panel');
          
          if (name && type) {
            const res = await fetch('/api/parts', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({name: name, type: type})
            });
            const data = await res.json();
            document.getElementById('message').innerHTML = 
              data.success ? '✅ 部件添加成功！ID: ' + data.id : '❌ 添加失败';
          }
        }
        
        function showCreation() {
          document.getElementById('message').innerHTML = 
            '🎨 创作功能开发中，敬请期待！<br>' +
            '你可以：<br>' +
            '1. 添加自定义部件<br>' +
            '2. 练习拼装技巧<br>' +
            '3. 查看制作说明中的技艺讲解';
        }
      </script>
    </body>
    </html>
  `);
});

// 实景悬挂主页面
app.get('/hanging', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>实景悬挂</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
        }
        .scene-card { 
          background: white; 
          padding: 40px; 
          margin: 30px 0; 
          border-radius: 15px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
          text-align: center; 
        }
        .scene-btn { 
          display: block; 
          width: 100%; 
          padding: 25px; 
          margin: 25px 0; 
          color: white; 
          border: none; 
          border-radius: 10px; 
          font-size: 22px; 
          cursor: pointer; 
        }
        .scene-btn:hover { 
          opacity: 0.9;
        }
        .btn-system { 
          background: #00b894; 
        }
        .btn-custom { 
          background: #fd79a8; 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .description { 
          color: #666; 
          margin: 15px 0 30px 0; 
          font-size: 16px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/game'">返回主菜单</button>
        <h1>实景悬挂</h1>
      </div>
      
      <div class="content">
        <div class="scene-card">
          <h2>选择悬挂场景</h2>
          <p class="description">将你的千角灯作品放置在不同场景中预览效果</p>
          
          <button class="scene-btn btn-system" onclick="viewSystemScene()">
            🏛️ 系统场景
          </button>
          
          <button class="scene-btn btn-custom" onclick="viewCustomScene()">
            🎨 自定义场景
          </button>
        </div>
      </div>
      
      <script>
        function viewSystemScene() {
          window.location.href = '/system-scene';
        }
        function viewCustomScene() {
          window.location.href = '/custom-scene';
        }
      </script>
    </body>
    </html>
  `);
});

// 系统场景页面
app.get('/system-scene', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>系统场景</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
        }
        .scene-card { 
          background: white; 
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .scene-option { 
          display: block; 
          width: 100%; 
          padding: 20px; 
          margin: 15px 0; 
          background: #00b894; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          font-size: 18px; 
          cursor: pointer; 
          text-align: left;
        }
        .scene-option:hover { 
          background: #00a085; 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .scene-img {
          width: 100%;
          height: 200px;
          background: #ddd;
          border-radius: 8px;
          margin: 15px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/hanging'">返回实景悬挂</button>
        <h1>系统场景</h1>
      </div>
      
      <div class="content">
        <div class="scene-card">
          <h3>🏮 传统庙宇场景</h3>
          <div class="scene-img">传统庙宇场景预览图</div>
          <p>在传统中式庙宇中悬挂千角灯，感受历史文化氛围。</p>
          <button class="scene-option" onclick="selectScene('temple')">
            选择传统庙宇场景
          </button>
        </div>
        
        <div class="scene-card">
          <h3>🏢 现代展厅场景</h3>
          <div class="scene-img">现代展厅场景预览图</div>
          <p>在现代艺术展厅中展示千角灯，体现传统与现代的融合。</p>
          <button class="scene-option" onclick="selectScene('gallery')">
            选择现代展厅场景
          </button>
        </div>
        
        <div class="scene-card">
          <h3>🎭 文化节庆场景</h3>
          <div class="scene-img">文化节庆场景预览图</div>
          <p>在传统节日庆典中悬挂千角灯，增添喜庆氛围。</p>
          <button class="scene-option" onclick="selectScene('festival')">
            选择文化节庆场景
          </button>
        </div>
        
        <div class="scene-card">
          <h3>🏡 家庭悬挂场景</h3>
          <div class="scene-img">家庭场景预览图</div>
          <p>在家中客厅或庭院悬挂千角灯，体验传统文化生活。</p>
          <button class="scene-option" onclick="selectScene('home')">
            选择家庭悬挂场景
          </button>
        </div>
      </div>
      
      <script>
        function selectScene(sceneType) {
          alert('已选择场景: ' + sceneType + '\\n场景加载中...');
          // 这里可以添加实际场景加载逻辑
        }
      </script>
    </body>
    </html>
  `);
});

// 自定义场景页面
app.get('/custom-scene', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>自定义场景</title>
      <style>
        body { 
          font-family: Arial; 
          margin: 0; 
          padding: 0; 
          background: #f0f2f5; 
        }
        .header { 
          background: #2d3436; 
          color: white; 
          padding: 20px; 
        }
        .content { 
          max-width: 800px; 
          margin: 30px auto; 
          padding: 20px; 
        }
        .custom-card { 
          background: white; 
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .back-btn { 
          background: #636e72; 
          padding: 10px 20px; 
          border: none; 
          color: white; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 10px; 
        }
        .upload-area {
          border: 2px dashed #fd79a8;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          margin: 20px 0;
          background: #fff5f7;
        }
        .setting-group {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        label {
          display: block;
          margin: 10px 0 5px 0;
          color: #2d3436;
        }
        input[type="range"] {
          width: 100%;
          margin: 10px 0;
        }
        input[type="color"] {
          width: 50px;
          height: 30px;
          border: none;
          border-radius: 4px;
        }
        .apply-btn {
          background: #6c5ce7;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        }
        .apply-btn:hover {
          background: #5b4bd4;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-btn" onclick="window.location.href='/hanging'">返回实景悬挂</button>
        <h1>自定义场景</h1>
      </div>
      
      <div class="content">
        <div class="custom-card">
          <h3>上传自定义场景</h3>
          <p>上传您的场景图片：</p>
          <div class="upload-area">
            <p>📁 拖放图片文件到这里，或点击选择文件</p>
            <input type="file" id="scene-upload" accept="image/*" style="margin:20px 0; padding:10px;">
            <p style="color: #666; font-size: 14px;">支持 JPG、PNG 格式，最大 5MB</p>
          </div>
          <button onclick="uploadScene()" style="padding:12px 25px; background:#fd79a8; color:white; border:none; border-radius:8px; cursor:pointer;">上传场景图片</button>
        </div>
        
        <div class="custom-card">
          <h3>场景参数设置</h3>
          <p>调整场景的各项参数：</p>
          
          <div class="setting-group">
            <label>背景颜色：</label>
            <input type="color" id="bg-color" value="#f0f2f5">
            
            <label>灯光强度：<span id="light-value">70</span>%</label>
            <input type="range" id="light-intensity" min="0" max="100" value="70" oninput="document.getElementById('light-value').textContent = this.value">
            
            <label>悬挂高度：<span id="height-value">5</span>米</label>
            <input type="range" id="hang-height" min="1" max="10" value="5" step="0.5" oninput="document.getElementById('height-value').textContent = this.value">
            
            <label>背景模糊度：<span id="blur-value">20</span>%</label>
            <input type="range" id="bg-blur" min="0" max="100" value="20" oninput="document.getElementById('blur-value').textContent = this.value">
          </div>
          
          <button onclick="applyCustomSettings()" class="apply-btn">应用自定义设置</button>
        </div>
        
        <div class="custom-card">
          <h3>预览区域</h3>
          <p>您的自定义场景预览：</p>
          <div id="preview-area" style="width:100%; height:200px; background:#ddd; border-radius:8px; margin:20px 0; display:flex; align-items:center; justify-content:center; color:#666;">
            场景预览将显示在这里
          </div>
        </div>
      </div>
      
      <script>
        function uploadScene() {
          const fileInput = document.getElementById('scene-upload');
          if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            alert('场景图片已上传: ' + fileName);
            document.getElementById('preview-area').innerHTML = 
              '已上传: ' + fileName + '<br>' +
              '<span style="font-size:14px;">点击"应用自定义设置"预览效果</span>';
          } else {
            alert('请先选择图片文件');
          }
        }
        
        function applyCustomSettings() {
          const bgColor = document.getElementById('bg-color').value;
          const lightIntensity = document.getElementById('light-intensity').value;
          const hangHeight = document.getElementById('hang-height').value;
          const bgBlur = document.getElementById('bg-blur').value;
          
          // 更新预览区域
          const preview = document.getElementById('preview-area');
          preview.style.background = bgColor;
          preview.style.opacity = lightIntensity / 100;
          preview.innerHTML = 
            '🎨 自定义场景已应用<br>' +
            '<span style="font-size:14px;">背景色: ' + bgColor + '<br>' +
            '灯光: ' + lightIntensity + '%<br>' +
            '高度: ' + hangHeight + '米<br>' +
            '模糊度: ' + bgBlur + '%</span>';
            
          alert('自定义设置已应用！\\n背景颜色：' + bgColor + '\\n灯光强度：' + lightIntensity + '%\\n悬挂高度：' + hangHeight + '米\\n背景模糊度：' + bgBlur + '%');
        }
      </script>
    </body>
    </html>
  `);
});

// 启动
app.listen(PORT, () => {
  console.log('服务器启动: http://localhost:' + PORT);
});