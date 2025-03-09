/**
 * 故事管理器 - 管理游戏故事和剧情
 */
class StoryManager {
    constructor(gameState, aiService, fileManager, uiManager) {
        this.gameState = gameState;
        this.aiService = aiService;
        this.fileManager = fileManager;
        this.uiManager = uiManager;
        this.characterProfile = null;
        this.storyLoopInterval = null;
        this.lastScene = null;
        this.lastAction = null;
        this.lastEffect = null;
        
        console.log('[StoryManager] 初始化故事管理器');
    }

    /**
     * 初始化故事管理器
     */
    async initialize() {
        try {
            console.log('[StoryManager] 开始初始化...');
            
            // 生成角色背景
            this.characterProfile = await this.aiService.generateCharacterProfile();
            
            // 记录初始状态
            await this.logInitialState();
            
            // 开始故事循环
            this.startStoryLoop();
            
            console.log('[StoryManager] 初始化完成');
            return true;
        } catch (error) {
            console.error('[StoryManager] 初始化故事管理器失败:', error);
            throw error;
        }
    }

    /**
     * 记录初始状态
     */
    async logInitialState() {
        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        // 记录初始场景
        this.uiManager.logStory(
            `[系统] ${characterInfo.name}开始了修真之旅`,
            `【${worldInfo.time}】`
        );
        
        // 保存角色信息
        try {
            await this.fileManager.saveCharacterProfile(
                characterInfo.name,
                this.characterProfile
            );
            console.log('[StoryManager] 角色信息保存成功');
        } catch (error) {
            console.error('[StoryManager] 保存角色信息失败:', error);
            
            // 重试一次
            try {
                console.log('[StoryManager] 尝试重新保存角色信息...');
                await this.fileManager.saveCharacterProfile(
                    characterInfo.name,
                    this.characterProfile
                );
                console.log('[StoryManager] 角色信息重新保存成功');
            } catch (retryError) {
                console.error('[StoryManager] 重新保存角色信息失败:', retryError);
            }
        }
    }

    /**
     * 开始故事循环
     */
    startStoryLoop() {
        if (this.storyLoopInterval) return;
        
        console.log('[StoryManager] 开始故事循环');
        this.storyLoopInterval = setInterval(async () => {
            try {
                await this.generateAction();
            } catch (error) {
                console.error('[StoryManager] 生成行动失败:', error);
            }
        }, 300000); // 每5分钟生成一次
    }

    /**
     * 停止故事循环
     */
    stopStoryLoop() {
        if (this.storyLoopInterval) {
            clearInterval(this.storyLoopInterval);
            this.storyLoopInterval = null;
            console.log('[StoryManager] 停止故事循环');
        }
    }

    /**
     * 生成行动
     */
    async generateAction() {
        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        console.log('[StoryManager] 生成行动...');
        
        try {
            const action = await this.aiService.generateAction(
                characterInfo.name,
                worldInfo.time,
                characterInfo.level,
                characterInfo.qi.split('/')[0],
                characterInfo.qi.split('/')[1]
            );
            
            if (action) {
                this.lastAction = action.action;
                
                this.uiManager.logStory(
                    `[行动] ${action.action}`,
                    `【${worldInfo.time}】`
                );
                
                if (action.event) {
                    this.lastEffect = action.event;
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
                
                // 随机增加真气
                const qiGain = Math.floor(Math.random() * 10) + 5;
                const breakthrough = this.gameState.addQi(qiGain);
                
                if (breakthrough) {
                    this.uiManager.logStory(
                        `[系统] ${characterInfo.name}突破到了${this.gameState.getCharacterInfo().level}！`,
                        `【${worldInfo.time}】`
                    );
                }
            }
        } catch (error) {
            console.error('[StoryManager] 生成行动失败:', error);
            this.uiManager.logStory(
                `[系统] 生成行动失败: ${error.message}`,
                `【${worldInfo.time}】`
            );
        }
    }

    /**
     * 生成任务
     */
    async generateTasks() {
        try {
            console.log('[StoryManager] 生成任务...');
            return await this.aiService.generateTasks();
        } catch (error) {
            console.error('[StoryManager] 生成任务失败:', error);
            throw error;
        }
    }

    /**
     * 分配任务
     */
    async assignTask(task, reward) {
        const worldInfo = this.gameState.getWorldInfo();
        console.log('[StoryManager] 分配任务:', task);
        
        this.uiManager.logStory(
            `[任务] 接受任务: ${task}\n奖励: ${reward}`,
            `【${worldInfo.time}】`
        );
        
        // 添加奖励物品
        if (typeof reward === 'string' && reward.includes('灵石') || reward.includes('丹药')) {
            this.gameState.addItem(reward);
        }
        
        await this.saveStory();
    }

    /**
     * 保存故事
     */
    async saveStory() {
        try {
            const characterInfo = this.gameState.getCharacterInfo();
            const worldInfo = this.gameState.getWorldInfo();
            
            await this.fileManager.saveStoryProgress(characterInfo.name, {
                time: `${worldInfo.time} ${worldInfo.day}`,
                scene: this.lastScene,
                action: this.lastAction,
                effect: this.lastEffect
            });
            
            console.log('[StoryManager] 故事保存成功');
            return true;
        } catch (error) {
            console.error('[StoryManager] 保存故事进展失败:', error);
            return false;
        }
    }
}

export default StoryManager; 