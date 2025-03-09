class StoryManager {
    constructor(gameState, aiService, fileManager, uiManager) {
        this.gameState = gameState;
        this.aiService = aiService;
        this.fileManager = fileManager;
        this.uiManager = uiManager;
        this.characterProfile = null;
        this.storyLoopInterval = null;
    }

    async initialize() {
        try {
            // 生成角色背景
            this.characterProfile = await this.aiService.generateCharacterProfile();
            
            // 记录初始状态
            await this.logInitialState();
            
            // 开始故事循环
            this.startStoryLoop();
            
            return true;
        } catch (error) {
            console.error('初始化故事管理器失败:', error);
            throw error;
        }
    }

    async logInitialState() {
        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        // 记录初始场景
        this.uiManager.logStory(
            `[系统] ${characterInfo.name}开始了修真之旅`,
            `【${worldInfo.time}】`
        );
        
        // 保存角色信息
        await this.fileManager.saveCharacterProfile(
            characterInfo.name,
            this.characterProfile
        );
    }

    startStoryLoop() {
        if (this.storyLoopInterval) return;
        
        this.storyLoopInterval = setInterval(async () => {
            try {
                await this.generateAction();
            } catch (error) {
                console.error('生成行动失败:', error);
            }
        }, 300000); // 每5分钟生成一次
    }

    stopStoryLoop() {
        if (this.storyLoopInterval) {
            clearInterval(this.storyLoopInterval);
            this.storyLoopInterval = null;
        }
    }

    async generateAction() {
        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        try {
            const action = await this.aiService.generateAction(
                characterInfo.name,
                worldInfo.time,
                characterInfo.level,
                characterInfo.qi.split('/')[0],
                characterInfo.qi.split('/')[1]
            );
            
            if (action) {
                this.uiManager.logStory(
                    `[行动] ${action.action}`,
                    `【${worldInfo.time}】`
                );
                
                if (action.event) {
                    this.uiManager.logStory(
                        `[事件] ${action.event}`,
                        `【${worldInfo.time}】`
                    );
                }
                
                if (action.npc) {
                    this.uiManager.logStory(
                        `[对话] ${action.npc}`,
                        `【${worldInfo.time}】`
                    );
                }
                
                // 保存故事进展
                await this.saveStory();
            }
        } catch (error) {
            console.error('生成行动失败:', error);
            this.uiManager.logStory(
                `[系统] 生成行动失败: ${error.message}`,
                `【${worldInfo.time}】`
            );
        }
    }

    async generateTasks() {
        try {
            return await this.aiService.generateTasks();
        } catch (error) {
            console.error('生成任务失败:', error);
            throw error;
        }
    }

    async assignTask(task, reward) {
        const worldInfo = this.gameState.getWorldInfo();
        this.uiManager.logStory(
            `[任务] 接受任务: ${task}\n奖励: ${reward}`,
            `【${worldInfo.time}】`
        );
        await this.saveStory();
    }

    async saveStory() {
        try {
            const characterInfo = this.gameState.getCharacterInfo();
            const worldInfo = this.gameState.getWorldInfo();
            
            await this.fileManager.saveStoryProgress(characterInfo.name, {
                time: worldInfo.time,
                day: worldInfo.day,
                scene: this.lastScene,
                action: this.lastAction,
                effect: this.lastEffect
            });
        } catch (error) {
            console.error('保存故事进展失败:', error);
            throw error;
        }
    }
}

export default StoryManager; 