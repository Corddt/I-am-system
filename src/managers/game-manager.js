import AIService from '../services/ai-service.js';
import CharacterService from '../services/character-service.js';
import StoryService from '../services/story-service.js';
import UIManager from '../ui/ui-manager.js';

class GameManager {
    constructor(apiKey, model) {
        this.aiService = new AIService(apiKey, model);
        this.uiManager = new UIManager();
        this.characterService = new CharacterService(this.aiService);
        this.storyService = new StoryService(this.aiService, this.uiManager);
        
        this.gameState = {
            character: null,
            worldState: {
                currentTime: '早上',
                timePeriods: ['早上', '下午', '晚上'],
                currentPeriodIndex: 0
            },
            isRunning: false
        };
    }

    async initialize() {
        try {
            console.log('初始化游戏...');
            this.uiManager.updateLoadingStatus('正在初始化游戏...');

            // 生成角色信息
            const characterName = await this.characterService.generateCharacterName();
            const characterProfile = await this.characterService.generateCharacterProfile();
            
            this.gameState.character = {
                name: characterName,
                level: '练气一阶',
                qi: '0/100',
                profile: characterProfile
            };

            // 更新UI显示
            this.uiManager.updateCharacterInfo(this.gameState.character);
            this.uiManager.updateLoadingStatus('角色创建完成');

            console.log('游戏初始化完成');
            return true;
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.uiManager.showError(error);
            return false;
        }
    }

    start() {
        if (this.gameState.isRunning) {
            console.warn('游戏已经在运行中');
            return;
        }

        console.log('启动游戏...');
        this.gameState.isRunning = true;

        // 启动故事生成循环
        this.storyService.startStoryLoop(
            this.gameState.character,
            this.gameState.worldState
        );

        // 启动时间循环
        this.startTimeLoop();

        // 显示游戏界面
        this.uiManager.hideLoadingScreen();
        this.uiManager.showGameContainer();
    }

    stop() {
        if (!this.gameState.isRunning) {
            return;
        }

        console.log('停止游戏...');
        this.gameState.isRunning = false;
        this.storyService.stopStoryLoop();
        
        if (this.timeLoopInterval) {
            clearInterval(this.timeLoopInterval);
            this.timeLoopInterval = null;
        }
    }

    startTimeLoop() {
        // 每30秒更新一次时间
        this.timeLoopInterval = setInterval(() => {
            this.updateGameTime();
        }, 30000);
    }

    updateGameTime() {
        const { timePeriods, currentPeriodIndex } = this.gameState.worldState;
        const nextIndex = (currentPeriodIndex + 1) % timePeriods.length;
        
        this.gameState.worldState.currentPeriodIndex = nextIndex;
        this.gameState.worldState.currentTime = timePeriods[nextIndex];
        
        console.log('更新游戏时间:', this.gameState.worldState.currentTime);
        
        // 记录时间变化
        const timeStr = new Date().toLocaleTimeString();
        this.uiManager.logStory(
            `[系统] 时间流转，当前时辰: ${this.gameState.worldState.currentTime}`,
            timeStr
        );
    }
}

export default GameManager; 