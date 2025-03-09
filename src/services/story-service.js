class StoryService {
    constructor(aiService, uiManager) {
        this.aiService = aiService;
        this.uiManager = uiManager;
        this.lastStoryTime = null;
        this.storyInterval = 5000; // 5秒生成一次故事
        this.debugMode = true; // 启用调试模式
        
        console.log('[StoryService] 构造函数被调用，初始化完成');
    }

    async generateStory(characterInfo, worldState) {
        try {
            console.log('[StoryService] 开始生成故事...');
            
            // 检查参数
            if (!characterInfo || !worldState) {
                console.error('[StoryService] 缺少必要参数:', { characterInfo, worldState });
                return this.getDefaultStory(characterInfo || { name: '未知' }, worldState || { currentTime: '未知' });
            }

            // 检查是否应该生成新故事
            const currentTime = Date.now();
            if (this.lastStoryTime && (currentTime - this.lastStoryTime) < this.storyInterval) {
                console.log('[StoryService] 故事生成间隔太短，跳过本次生成');
                return;
            }

            const promptContent = `你是一位修真小说的故事生成器。请根据以下信息生成一个简短的修真场景。

场景要求：
1. 时间：${worldState.currentTime}
2. 角色：${characterInfo.name}（${characterInfo.level}，修为：${characterInfo.qi}）
3. 场景要包含：
   - 具体的环境描写
   - 角色的修炼或行动
   - 可能的奇遇或对话
4. 内容要求：
   - 场景描写要生动形象
   - 符合修真小说的风格
   - 考虑角色当前的境界和修为
5. 返回格式（JSON）：
{
    "scene": "环境和场景的具体描写",
    "action": "角色的具体行动",
    "dialogue": "如果有对话，在这里描述",
    "effect": "这个场景对角色的影响"
}`;

            console.log('[StoryService] 发送到AI的提示词:', promptContent);

            const content = await this.aiService.generateContent([{
                role: "system",
                content: promptContent
            }], true);

            console.log('[StoryService] AI返回的原始内容:', content);

            if (!content) {
                console.warn('[StoryService] 故事生成失败，使用默认场景');
                return this.getDefaultStory(characterInfo, worldState);
            }

            let story;
            try {
                story = JSON.parse(content);
                console.log('[StoryService] 解析后的故事内容:', story);
                
                // 验证并补充缺失字段
                const requiredFields = ['scene', 'action', 'effect'];
                const missingFields = requiredFields.filter(field => !story[field]);
                
                if (missingFields.length > 0) {
                    console.warn('[StoryService] 故事缺少必要字段:', missingFields);
                    
                    // 补充缺失的字段
                    if (!story.scene) {
                        story.scene = `${characterInfo.name}所在的修炼之地，灵气氤氲。`;
                        console.log('[StoryService] 添加默认场景描述');
                    }
                    if (!story.action) {
                        story.action = `${characterInfo.name}正在专心修炼。`;
                        console.log('[StoryService] 添加默认行动描述');
                    }
                    if (!story.effect) {
                        story.effect = '修为略有精进。';
                        console.log('[StoryService] 添加默认效果描述');
                    }
                }
            } catch (parseError) {
                console.error('[StoryService] JSON解析失败:', parseError);
                return this.getDefaultStory(characterInfo, worldState);
            }

            this.lastStoryTime = currentTime;
            
            // 记录故事
            const timeStr = new Date().toLocaleTimeString();
            
            // 确保UI管理器存在
            if (!this.uiManager) {
                console.error('[StoryService] UI管理器不存在，无法显示故事');
                return story;
            }
            
            // 确保logStory方法存在
            if (typeof this.uiManager.logStory !== 'function') {
                console.error('[StoryService] UI管理器缺少logStory方法');
                return story;
            }
            
            console.log('[StoryService] 开始显示故事内容');
            
            // 按顺序显示故事内容
            if (story.scene) {
                const sceneText = `[场景] ${story.scene}`;
                console.log('[StoryService] 显示场景:', sceneText);
                this.uiManager.logStory(sceneText, timeStr);
            }
            
            if (story.action) {
                const actionText = `[行动] ${story.action}`;
                console.log('[StoryService] 显示行动:', actionText);
                this.uiManager.logStory(actionText, timeStr);
            }
            
            if (story.dialogue) {
                const dialogueText = `[${characterInfo.name}] ${story.dialogue}`;
                console.log('[StoryService] 显示对话:', dialogueText);
                this.uiManager.logStory(dialogueText, timeStr);
            }
            
            if (story.effect) {
                const effectText = `[系统] ${story.effect}`;
                console.log('[StoryService] 显示效果:', effectText);
                this.uiManager.logStory(effectText, timeStr);
            }
            
            console.log('[StoryService] 故事显示完成');

            return story;
        } catch (error) {
            console.error('[StoryService] 生成故事时出错:', error);
            return this.getDefaultStory(characterInfo, worldState);
        }
    }

    getDefaultStory(characterInfo, worldState) {
        console.log('[StoryService] 使用默认故事');
        
        const timeStr = new Date().toLocaleTimeString();
        const defaultStories = {
            '早上': {
                scene: `${characterInfo.name}沐浴在晨光中，感受着天地间最为纯净的灵气。山间云雾缭绕，一缕金色的阳光穿透云层，洒在${characterInfo.name}的身上。`,
                action: `${characterInfo.name}盘膝而坐，运转功法，吸收着晨间灵气。`,
                effect: '吸收了清晨的灵气，修为略有精进。'
            },
            '下午': {
                scene: `${characterInfo.name}在山间寻找灵药，不时有灵兽远远观望。微风拂过草地，带来阵阵药香，前方似乎有珍稀灵药的踪迹。`,
                action: `${characterInfo.name}小心翼翼地采集着灵药，同时警惕着周围的动静。`,
                effect: '对天地灵气的感知提升了一些。'
            },
            '晚上': {
                scene: `${characterInfo.name}在月光下打坐，周围萤火点点，灵气氤氲。夜空中繁星点点，一道月华洒落，为修炼提供了绝佳的条件。`,
                action: `${characterInfo.name}借着月华之力，运转功法，吸收着精纯的月之精华。`,
                effect: '在月华的滋养下，修为稳步提升。'
            }
        };

        const story = defaultStories[worldState.currentTime] || {
            scene: `${characterInfo.name}静坐修炼，感受着周围的灵气。四周一片宁静，唯有微风拂过树梢的沙沙声。`,
            action: `${characterInfo.name}专注地运转功法，吸收着周围的灵气。`,
            effect: '修为略有精进。'
        };

        console.log('[StoryService] 选择的默认故事:', story);
        
        // 确保UI管理器存在
        if (!this.uiManager) {
            console.error('[StoryService] UI管理器不存在，无法显示默认故事');
            return story;
        }
        
        // 确保logStory方法存在
        if (typeof this.uiManager.logStory !== 'function') {
            console.error('[StoryService] UI管理器缺少logStory方法');
            return story;
        }

        // 按顺序显示故事内容
        try {
            console.log('[StoryService] 开始显示默认故事内容');
            this.uiManager.logStory(`[场景] ${story.scene}`, timeStr);
            this.uiManager.logStory(`[行动] ${story.action}`, timeStr);
            this.uiManager.logStory(`[系统] ${story.effect}`, timeStr);
            console.log('[StoryService] 默认故事显示完成');
        } catch (error) {
            console.error('[StoryService] 显示默认故事时出错:', error);
        }

        return story;
    }

    startStoryLoop(characterInfo, worldState) {
        console.log('[StoryService] 启动故事生成循环');
        
        // 清除可能存在的旧定时器
        if (this.storyLoopInterval) {
            console.log('[StoryService] 清除旧的故事循环定时器');
            clearInterval(this.storyLoopInterval);
        }

        // 立即生成一个故事
        console.log('[StoryService] 立即生成第一个故事');
        this.generateStory(characterInfo, worldState);

        // 设置定时器，每隔一段时间生成新故事
        console.log('[StoryService] 设置故事循环定时器，间隔:', this.storyInterval, 'ms');
        this.storyLoopInterval = setInterval(() => {
            console.log('[StoryService] 定时器触发，生成新故事');
            this.generateStory(characterInfo, worldState);
        }, this.storyInterval);
    }

    stopStoryLoop() {
        console.log('[StoryService] 停止故事生成循环');
        
        if (this.storyLoopInterval) {
            console.log('[StoryService] 清除故事循环定时器');
            clearInterval(this.storyLoopInterval);
            this.storyLoopInterval = null;
        } else {
            console.log('[StoryService] 没有活动的故事循环定时器');
        }
    }
}

export default StoryService; 