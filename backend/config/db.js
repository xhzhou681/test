const mysql = require('mysql2/promise');
require('dotenv').config();

// 使用环境变量或默认值
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 添加连接错误处理
pool.on('error', (err) => {
  console.error('MySQL连接池错误:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('数据库连接丢失');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('数据库连接数过多');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('数据库连接被拒绝');
  }
});

module.exports = {
  getConnection: async () => {
    try {
      return await pool.getConnection();
    } catch (err) {
      console.error('获取数据库连接失败:', err);
      throw err;
    }
  },
  execute: async (query, params) => {
    try {
      return await pool.execute(query, params);
    } catch (err) {
      console.error('执行SQL查询失败:', err, '查询:', query);
      throw err;
    }
  }
};