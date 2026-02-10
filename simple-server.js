const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>千角灯游戏测试</h1><button onclick="test()">测试详细拼装接口</button><script>async function test(){const r=await fetch("/api/assemble/detailed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});const d=await r.json();alert(JSON.stringify(d));}</script>');
});

app.post('/api/assemble/detailed', (req, res) => {
  console.log('收到拼装请求');
  res.json({
    success: true,
    assembled: true,
    accuracy: 95.5,
    score: 955,
    message: '详细拼装测试成功'
  });
});

app.listen(PORT, () => {
  console.log('服务器启动: http://localhost:' + PORT);
});