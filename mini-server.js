// 千角灯小程序专用后端
const express = require('express');
const cors = require('cors');
const db = require('./sqlite-db.js');
const LanternAssembler = require('./assemble-logic');

const app = express();
const PORT = 3001; // 用3001端口

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/mini/health', (req, res) => {
  res.json({ code: 0, message: '小程序后端正常' });
});

// 获取部件
app.get('/api/mini/parts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, type FROM parts');
    res.json({ code: 0, data: rows });
  } catch (err) {
    res.json({ code: -1, message: err.message });
  }
});

// 启动
app.listen(PORT, () => {
  console.log('小程序后端: http://localhost:' + PORT);
});