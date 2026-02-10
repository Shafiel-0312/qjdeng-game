const mysql = require('mysql2');

// 常见的MySQL默认密码
const commonPasswords = [
  '',            // 空密码（很多人安装时直接回车）
  'root123',     // 你之前用的
  '123456',      // 最常见
  'password',    // 英文"密码"
  'admin',       // 管理员
  'root',        // 用户名当密码
  '12345678',    
  '123123',
  '000000',
  'mysql',       // 软件名
  '1234',
  '111111',
  'admin123',
  'root@123',
  'Root123',     // 注意大小写
  'Root@123',
  'Root123456'
];

console.log('🔍 开始测试MySQL密码...');
console.log('服务状态: MySQL80 正在运行 ✅');

let found = false;

// 逐个测试密码
commonPasswords.forEach((pwd, index) => {
  setTimeout(() => {
    if (found) return;
    
    console.log(`尝试 ${index + 1}/${commonPasswords.length}: "${pwd || '(空)'}"`);
    
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: pwd
    });
    
    connection.connect((err) => {
      if (err) {
        // 密码错误，继续下一个
        if (index === commonPasswords.length - 1 && !found) {
          console.log('\n❌ 所有常见密码都试过了');
          console.log('💡 可能需要重置密码');
          suggestReset();
        }
      } else {
        found = true;
        console.log('\n🎉🎉🎉 找到密码了！');
        console.log(`✅ 正确密码是: "${pwd || '(空密码，直接回车)'}"`);
        console.log('\n📝 请更新以下文件中的密码:');
        console.log('1. db.js 中的 password');
        console.log('2. init-db.js 中的 password');
        
        // 测试数据库操作
        connection.query('SHOW DATABASES', (err, results) => {
          if (err) {
            console.log('⚠️ 能连接但查询出错:', err.message);
          } else {
            console.log('📊 现有数据库:', results.map(r => r.Database));
          }
          connection.end();
        });
      }
    });
  }, index * 300); // 每个密码间隔300ms
});

function suggestReset() {
  console.log('\n🔧 重置密码方法:');
  console.log('1. 记住密码法 - 想想安装时设的密码');
  console.log('2. 重装法 - 卸载重装MySQL，这次记住密码');
  console.log('3. 跳过法 - 先用内存数据开发');
  console.log('\n💡 建议: 先用空密码试试，不行就跳过数据库');
}