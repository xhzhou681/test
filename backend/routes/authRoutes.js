const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 用户注册
router.post('/register', async (req, res) => {
  console.log(req.body);
  try { // 取消注释try块
    const { username, password } = req.body;
    // 添加用户名存在性检查
    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: '用户注册成功' });
  } catch (error) {
    res.status(400).json({ error: '注册失败' }); // 错误响应需要统一格式
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('登录尝试:', username, '密码长度:', password.length);
    
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    console.log('11111');
    console.log('数据库中的密码哈希:', users[0].password, '用户名:', users[0].username);
    
    // 添加更多调试信息
    const passwordMatch = bcrypt.compareSync(password, users[0].password);
    console.log('密码比较结果:', passwordMatch, '输入的密码:', password);
    
    if (users.length === 0 || !passwordMatch) {
    //  if (users.length === 0 || password !== users[0].password){
      console.log('22222');

      return res.status(401).json({ error: '无效的凭证' });
    }

    console.log('33333');

    const token = jwt.sign(
      { id: users[0].id, role: users[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: users[0].role });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});



module.exports = router;