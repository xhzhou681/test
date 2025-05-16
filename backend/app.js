require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());

//下面的跨域访问安全更高
// app.use(cors({
//   origin: 'http://localhost:80',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(express.json());
// 路由
app.use('/api/auth', authRoutes);

// 初始化数据库
async function initializeDB() {
  try {
    const connection = await db.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255)  NULL,
          role ENUM('admin', 'user') DEFAULT 'user'
        )
      `);
      
      // 创建默认管理员用户
      const [admin] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
      if (!admin.length) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await connection.query(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          ['admin', hashedPassword, 'admin']
        );
      }
    } finally {
      connection.release();
    }
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败，但应用将继续运行:', error);
  }
}

// 获取科室列表
app.get('/api/ksmc', async (req, res) => {
  try {
    const response = await axios.get('https://www.yizhenghospitalwx.cn/wx/mzgh/readallks.php', {
      timeout: 5000
    });
    
    if (!response.data?.returnvaluerow || !Array.isArray(response.data.returnvaluerow)) {
      // 如果API失败，返回一些默认科室
      console.log('API返回无效数据，使用默认科室');
      return res.json(['急诊护理组', '外科', '妇科', '儿科']);
    }
    
    // 提取科室名称
    const departments = response.data.returnvaluerow.map(item => item.ksmc);
    console.log('成功获取科室列表:', departments);
    res.json(departments);
  } catch (error) {
    console.error('获取科室列表失败:', error);
    // 出错时返回默认科室列表
    res.json(['急诊护理组', '外科', '妇科', '儿科']);
  }
});

// 查询明细表
app.post('/api/mxb', async (req, res) => {
  try {
    const { query, ksmc } = req.body;
    const response = await axios.post('https://www.yizhenghospitalwx.cn/wx/mzgh/readmxb.php', {
      query,
      ksmc
    }, {
      timeout: 5000
    });
    if (!response.data?.returnvaluerow || !Array.isArray(response.data.returnvaluerow)) {
      return res.json(['没有找到匹配的结果']);
    }
    res.json(response.data.returnvaluerow.map(item => item.ybbm));
  } catch (error) {
    console.error('查询明细表失败:', error);
    res.json(['查询失败，请稍后重试']);
  }
});


const PORT = 3066;

app.listen(PORT, () => {
  // 尝试初始化数据库，但不阻塞应用启动
  initializeDB().catch(err => console.error('数据库初始化失败:', err));
  console.log(`Server running on port ${PORT}`);
});