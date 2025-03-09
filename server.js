const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.static('.'));

// 详细的日志中间件
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[SERVER] ${req.method} ${req.url} - 开始处理`);
    
    // 捕获响应完成事件
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[SERVER] ${req.method} ${req.url} - 完成处理 ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// 确保目录存在
app.post('/api/ensure-directory', (req, res) => {
    const { directory } = req.body;
    
    if (!directory) {
        console.error('[SERVER] 确保目录存在失败: 缺少目录参数');
        return res.status(400).json({ 
            success: false, 
            error: '缺少目录参数' 
        });
    }
    
    console.log(`[SERVER] 确保目录存在: ${directory}`);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(directory);
    if (normalizedPath.includes('..')) {
        console.error(`[SERVER] 确保目录存在失败: 非法路径 ${normalizedPath}`);
        return res.status(403).json({ 
            success: false, 
            error: '非法路径' 
        });
    }
    
    const dirPath = path.join(__dirname, normalizedPath);
    
    try {
        // 检查目录是否存在
        if (fs.existsSync(dirPath)) {
            console.log(`[SERVER] 目录已存在: ${dirPath}`);
            return res.json({ 
                success: true, 
                exists: true 
            });
        }
        
        // 创建目录
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[SERVER] 目录创建成功: ${dirPath}`);
        
        // 创建.gitkeep文件以确保目录被Git跟踪
        const gitkeepPath = path.join(dirPath, '.gitkeep');
        fs.writeFileSync(gitkeepPath, '');
        console.log(`[SERVER] .gitkeep文件创建成功: ${gitkeepPath}`);
        
        return res.json({ 
            success: true, 
            exists: false 
        });
    } catch (error) {
        console.error(`[SERVER] 确保目录存在时出错: ${error.message}`);
        console.error(error.stack);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 保存文件
app.post('/api/save-file', (req, res) => {
    const { filename, content } = req.body;
    
    if (!filename || content === undefined) {
        console.error('[SERVER] 保存文件失败: 缺少文件名或内容');
        return res.status(400).json({ 
            success: false, 
            error: '缺少文件名或内容' 
        });
    }
    
    console.log(`[SERVER] 保存文件: ${filename}, 内容长度: ${content.length}`);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..')) {
        console.error(`[SERVER] 保存文件失败: 非法路径 ${normalizedPath}`);
        return res.status(403).json({ 
            success: false, 
            error: '非法路径' 
        });
    }
    
    const filePath = path.join(__dirname, normalizedPath);
    
    // 确保目录存在
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`[SERVER] 为文件创建目录: ${dirPath}`);
        } catch (error) {
            console.error(`[SERVER] 创建目录失败: ${error.message}`);
            console.error(error.stack);
            return res.status(500).json({ 
                success: false, 
                error: `创建目录失败: ${error.message}` 
            });
        }
    }
    
    try {
        fs.writeFileSync(filePath, content);
        console.log(`[SERVER] 文件保存成功: ${filePath}`);
        return res.json({ 
            success: true, 
            path: filename 
        });
    } catch (error) {
        console.error(`[SERVER] 保存文件失败: ${error.message}`);
        console.error(error.stack);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 加载文件
app.get('/api/load-file', (req, res) => {
    const { filename } = req.query;
    
    if (!filename) {
        console.error('[SERVER] 加载文件失败: 缺少文件名');
        return res.status(400).json({ 
            success: false, 
            error: '缺少文件名' 
        });
    }
    
    console.log(`[SERVER] 加载文件: ${filename}`);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..')) {
        console.error(`[SERVER] 加载文件失败: 非法路径 ${normalizedPath}`);
        return res.status(403).json({ 
            success: false, 
            error: '非法路径' 
        });
    }
    
    const filePath = path.join(__dirname, normalizedPath);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[SERVER] 文件不存在: ${filePath}`);
            return res.status(404).json({ 
                success: false, 
                error: '文件不存在' 
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`[SERVER] 文件加载成功: ${filePath}, 内容长度: ${content.length}`);
        return res.json({ 
            success: true, 
            content 
        });
    } catch (error) {
        console.error(`[SERVER] 加载文件失败: ${error.message}`);
        console.error(error.stack);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 列出文件
app.get('/api/list-files', (req, res) => {
    const { directory } = req.query;
    
    if (!directory) {
        console.error('[SERVER] 列出文件失败: 缺少目录参数');
        return res.status(400).json({ 
            success: false, 
            error: '缺少目录参数' 
        });
    }
    
    console.log(`[SERVER] 列出目录文件: ${directory}`);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(directory);
    if (normalizedPath.includes('..')) {
        console.error(`[SERVER] 列出文件失败: 非法路径 ${normalizedPath}`);
        return res.status(403).json({ 
            success: false, 
            error: '非法路径' 
        });
    }
    
    const dirPath = path.join(__dirname, normalizedPath);
    
    try {
        // 如果目录不存在，创建它
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`[SERVER] 目录不存在，已创建: ${dirPath}`);
            
            // 创建.gitkeep文件
            const gitkeepPath = path.join(dirPath, '.gitkeep');
            fs.writeFileSync(gitkeepPath, '');
            console.log(`[SERVER] .gitkeep文件创建成功: ${gitkeepPath}`);
            
            return res.json({ 
                success: true, 
                files: ['.gitkeep'] 
            });
        }
        
        const files = fs.readdirSync(dirPath);
        console.log(`[SERVER] 目录文件列表: ${dirPath}`, files);
        return res.json({ 
            success: true, 
            files 
        });
    } catch (error) {
        console.error(`[SERVER] 列出文件失败: ${error.message}`);
        console.error(error.stack);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 获取文件状态
app.get('/api/file-stats', (req, res) => {
    const { filename } = req.query;
    
    if (!filename) {
        console.error('[SERVER] 获取文件状态失败: 缺少文件名');
        return res.status(400).json({ 
            success: false, 
            error: '缺少文件名' 
        });
    }
    
    console.log(`[SERVER] 获取文件状态: ${filename}`);
    
    // 安全检查：防止目录遍历攻击
    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..')) {
        console.error(`[SERVER] 获取文件状态失败: 非法路径 ${normalizedPath}`);
        return res.status(403).json({ 
            success: false, 
            error: '非法路径' 
        });
    }
    
    const filePath = path.join(__dirname, normalizedPath);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[SERVER] 文件不存在: ${filePath}`);
            return res.status(404).json({ 
                success: false, 
                error: '文件不存在' 
            });
        }
        
        const stats = fs.statSync(filePath);
        console.log(`[SERVER] 文件状态获取成功: ${filePath}`, {
            size: stats.size,
            mtime: stats.mtime
        });
        return res.json({ 
            success: true, 
            stats: {
                size: stats.size,
                mtime: stats.mtime,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile()
            }
        });
    } catch (error) {
        console.error(`[SERVER] 获取文件状态失败: ${error.message}`);
        console.error(error.stack);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`[SERVER] 服务器运行在 http://localhost:${port}`);
    
    // 确保characters目录存在
    const charactersDir = path.join(__dirname, 'characters');
    if (!fs.existsSync(charactersDir)) {
        try {
            fs.mkdirSync(charactersDir, { recursive: true });
            console.log(`[SERVER] characters目录创建成功: ${charactersDir}`);
            
            // 创建.gitkeep文件
            const gitkeepPath = path.join(charactersDir, '.gitkeep');
            fs.writeFileSync(gitkeepPath, '');
            console.log(`[SERVER] .gitkeep文件创建成功: ${gitkeepPath}`);
        } catch (error) {
            console.error(`[SERVER] 创建characters目录失败: ${error.message}`);
        }
    } else {
        console.log(`[SERVER] characters目录已存在: ${charactersDir}`);
    }
});