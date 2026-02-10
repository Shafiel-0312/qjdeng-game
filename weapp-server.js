// 微信小程序专用后端
const express = require('express');
const db = require('./sqlite-db.js');

const app = express();
const PORT = 3002; // 用3002端口

// 解析JSON
app.use(express.json());

// 1. 微信小程序首页
app.get('/', (req, res) => {
  res.send('千角灯微信小程序后端（端口3002）');
});

// 2. 获取所有部件（小程序用）
app.get('/api/weapp/parts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, type FROM parts');
    res.json({
      code: 0,
      data: rows,
      message: 'success'
    });
  } catch (err) {
    res.json({ code: -1, message: err.message });
  }
});

// 3. 简单拼装（小程序用）
app.post('/api/weapp/assemble', (req, res) => {
  const { distance = 0.3 } = req.body;
  const success = distance < 0.3;
  
  res.json({
    code: 0,
    data: {
      assembled: success,
      accuracy: success ? 95 : 30,
      message: success ? '拼装成功' : '需要调整'
    }
  });
});

// 启动
app.listen(PORT, () => {
  console.log(`
  ================================
  📱 微信小程序后端启动
  📡 端口: ${PORT}
  ⚠️  原网页版在3000端口，不受影响
  ================================
  `);
});