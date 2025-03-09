import GameManager from './managers/game-manager.js';
import CONFIG from './config/config.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
    console.log('游戏启动...');
    
    try {
        // 创建游戏管理器实例
        const gameManager = new GameManager(CONFIG.API_KEY, CONFIG.MODEL);
        
        // 初始化游戏
        const initialized = await gameManager.initialize();
        if (!initialized) {
            console.error('游戏初始化失败');
            return;
        }
        
        // 启动游戏
        gameManager.start();
        
        // 添加退出游戏的处理
        window.addEventListener('beforeunload', () => {
            gameManager.stop();
        });
        
    } catch (error) {
        console.error('游戏启动失败:', error);
    }
}); 