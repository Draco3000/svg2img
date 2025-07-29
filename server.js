const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器已启动，访问 http://localhost:${PORT}`);
});