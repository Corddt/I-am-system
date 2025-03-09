# 天道模拟器 (Celestial Path Simulator)

一个基于AI的修真模拟游戏，让玩家扮演天道系统，引导修真者的成长。

[English Version Below](#english)

## 项目简介

这是一个独特的文字冒险游戏，玩家将扮演天道系统的角色，引导修真者在修仙世界中成长。游戏采用AI生成技术，创造出丰富多彩的修真世界，提供沉浸式的游戏体验。

### 主要特点

- 🎮 **系统扮演**: 玩家作为天道系统，可以为主角分配任务、提供机缘
- 🌍 **丰富世界观**: 融合多种修真小说元素，构建完整的修真世界体系
- 🤖 **AI驱动**: 使用先进的AI模型生成剧情、对话和任务
- 📝 **动态剧情**: 根据玩家选择实时生成剧情发展
- 💾 **进度保存**: 自动保存游戏进度，支持角色导入导出
- 🎨 **个性化定制**: 支持自定义修炼体系、世界风格等设置

### 游戏特色

1. **多样化的系统类型**
   - 传统修炼系统
   - 法器养成系统
   - 丹道系统
   - 阵法系统
   - 自定义系统

2. **丰富的修炼特性**
   - 五行道法
   - 剑道修炼
   - 体修之道
   - 符箓之术
   - 御兽之法
   - 丹道医术
   - 幻术之道

3. **多元的世界风格**
   - 正统修真
   - 阴暗诡秘
   - 轻松日常
   - 争锋修道
   - 探索神秘

## 安装说明

### 环境要求
- Node.js (推荐 v14.0.0 或更高版本)
- 现代浏览器（Chrome, Firefox, Edge等）
- AI API密钥 (从 https://api.siliconflow.cn 获取)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/celestial-path-simulator.git
cd celestial-path-simulator
```

2. 安装依赖
```bash
npm install
```

3. 启动服务器
```bash
node server.js
```

4. 访问游戏
打开浏览器，访问 http://localhost:3000/story_config.html

## 使用说明

1. **初始配置**
   - 输入API密钥
   - 选择世界背景设定
   - 配置主角性别和系统类型
   - 选择修炼特性和世界风格

2. **游戏操作**
   - 查看主角状态和世界信息
   - 分配任务给主角
   - 观察主角行为和对话
   - 干预主角的修炼进程

3. **数据管理**
   - 游戏进度自动保存
   - 支持导出故事内容
   - 可导入已有角色继续游戏

## 项目结构

```
celestial-path-simulator/
├── src/                  # 源代码目录
│   ├── config/          # 配置文件
│   ├── services/       # 服务类
│   └── ui/            # 用户界面组件
├── public/             # 静态资源
│   ├── css/           # 样式文件
│   └── js/            # 客户端脚本
├── data/               # 数据存储
│   ├── characters/    # 角色存档
│   └── stories/       # 故事存档
├── game.html           # 游戏主页面
├── story_config.html   # 故事配置页面
├── server.js          # 服务器入口
└── package.json       # 项目配置
```

## 开发计划

- [ ] 添加更多世界背景选项
- [ ] 增加NPC互动系统
- [ ] 实现多角色同时培养
- [ ] 添加成就系统
- [ ] 支持自定义剧情模板
- [ ] 引入战斗系统
- [ ] 添加宗门管理功能

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目。请确保：
1. 提交前已经测试过代码
2. 遵循现有的代码风格
3. 提供清晰的提交信息
4. 更新相关文档

## 许可证

本项目采用 MIT 许可证

---

<a name="english"></a>
# Celestial Path Simulator

An AI-powered cultivation simulation game where players act as the celestial system guiding cultivators' growth.

[详细中文说明见上方](#天道模拟器-celestial-path-simulator)

## Project Overview

This is a unique text-based adventure game where players take on the role of a celestial system, guiding cultivators in their journey through a mystical world. The game uses AI generation technology to create a rich cultivation world and provide an immersive gaming experience.

### Key Features

- 🎮 **System Role-Playing**: Players act as the celestial system, assigning tasks and providing opportunities
- 🌍 **Rich World Setting**: Combines various cultivation novel elements to build a complete mystical world
- 🤖 **AI-Driven**: Uses advanced AI models to generate plots, dialogues, and tasks
- 📝 **Dynamic Storyline**: Real-time story generation based on player choices
- 💾 **Progress Saving**: Auto-saves game progress, supports character import/export
- 🎨 **Customization**: Supports custom cultivation systems and world styles

[Detailed features and installation guide in Chinese version above]

## License

This project is licensed under the MIT License