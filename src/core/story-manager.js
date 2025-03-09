import CONFIG from '../config/config.js';
import FileManager from '../services/file-manager.js';

class StoryManager {
    constructor(aiService, gameState, uiManager) {
        this.aiService = aiService;
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.storyInterval = null;
        this.characterProfile = null;
        this.fileManager = new FileManager();
        this.storyContent = [];
    }

    // 记录故事内容
    logStory(content) {
        console.log('记录故事内容，长度:', content.length);
        this.storyContent.push({
            time: new Date(),
            content: content
        });
    }

    // 保存故事进展
    async saveStory() {
        try {
            console.log('开始保存故事进展...');
            
            // 如果没有故事内容，不需要保存
            if (this.storyContent.length === 0) {
                console.log('没有故事内容需要保存');
                return false;
            }
            
            const characterInfo = this.gameState.getCharacterInfo();
            const story = this.formatStoryContent();
            
            // 保存故事进展
            const storyPath = await this.fileManager.saveStoryProgress(
                characterInfo.name,
                story
            );
            console.log('故事进展保存成功，路径:', storyPath);
            
            // 同时保存角色信息
            if (this.characterProfile) {
                console.log('正在保存最新的角色信息...');
                // 更新角色信息，包含当前状态
                const updatedProfile = this.updateCharacterProfile(characterInfo);
                
                // 保存更新后的角色信息
                await this.fileManager.saveCharacterProfile(
                    characterInfo.name,
                    updatedProfile
                );
                console.log('角色信息保存成功');
            }
            
            return true;
        } catch (error) {
            console.error('保存故事进展失败:', error);
            throw error;
        }
    }
    
    // 新增方法：更新角色资料，包含最新数据
    updateCharacterProfile(characterInfo) {
        if (!this.characterProfile) {
            // 如果没有角色资料，创建一个基本的
            return `# ${characterInfo.name}的角色信息
    
    ## 基本信息
    - 姓名：${characterInfo.name}
    - 性别：${characterInfo.gender}
    - 年龄：${characterInfo.age}岁
    - 境界：${characterInfo.level}
    - 真气：${characterInfo.qi}
    - 功法：${characterInfo.method}
    
    ## 背景故事
    出身平凡，立志修仙。
    
    ## 特殊能力
    尚未觉醒特殊能力。`;
        }
        
        // 从现有角色资料中提取信息，替换基本属性
        const profileLines = this.characterProfile.split('\n');
        const updatedLines = [];
        
        // 标记是否在基本信息区域
        let inBasicInfo = false;
        
        for (let i = 0; i < profileLines.length; i++) {
            const line = profileLines[i];
            
            // 检测基本信息区块
            if (line.startsWith('## 基本信息')) {
                inBasicInfo = true;
                updatedLines.push(line);
                updatedLines.push(`- 姓名：${characterInfo.name}`);
                updatedLines.push(`- 性别：${characterInfo.gender}`);
                updatedLines.push(`- 年龄：${characterInfo.age}岁`);
                updatedLines.push(`- 境界：${characterInfo.level}`);
                updatedLines.push(`- 真气：${characterInfo.qi}`);
                updatedLines.push(`- 功法：${characterInfo.method}`);
                
                // 跳过原来的基本信息行
                while (i < profileLines.length - 1 && 
                       !profileLines[i + 1].startsWith('##') && 
                       (profileLines[i + 1].startsWith('- ') || profileLines[i + 1].trim() === '')) {
                    i++;
                }
                
                inBasicInfo = false;
                continue;
            }
            
            // 其他行保持不变
            updatedLines.push(line);
        }
        
        return updatedLines.join('\n');
    }

    // 格式化故事内容
    formatStoryContent() {
        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        let content = `# ${characterInfo.name}的修真之旅\n\n`;
        
        // 添加角色信息
        if (this.characterProfile) {
            content += `## 角色信息\n${this.characterProfile}\n\n`;
        } else {
            content += `## 角色信息\n- 姓名：${characterInfo.name}\n- 性别：${characterInfo.gender}\n- 年龄：${characterInfo.age}\n- 境界：${characterInfo.level}\n\n`;
        }

        // 添加世界信息
        content += `## 世界信息\n- 时代：${worldInfo.era}\n- 当前时辰：${worldInfo.time}\n- 境界体系：${worldInfo.cultivationSystem}\n\n`;

        // 添加故事内容
        content += `## 故事内容\n`;
        this.storyContent.forEach(entry => {
            const time = new Date(entry.time).toLocaleString();
            content += `### ${time}\n${entry.content}\n\n`;
        });

        return content;
    }

    async initialize() {
        console.log('开始初始化故事管理器...');
        try {
            // 生成角色设定
            console.log('正在生成角色设定...');
            this.characterProfile = await this.aiService.generateCharacterProfile();
            
            if (this.characterProfile) {
                console.log('角色设定生成成功，长度:', this.characterProfile.length);
                this.logStory(this.characterProfile);
                
                // 保存角色信息
                console.log('正在保存角色信息...');
                const characterInfo = this.gameState.getCharacterInfo();
                
                // 创建更完整的角色信息
                const fullProfile = `# ${characterInfo.name}的角色信息

## 基本信息
- 姓名：${characterInfo.name}
- 性别：${characterInfo.gender}
- 年龄：${characterInfo.age}岁
- 境界：${characterInfo.level}
- 真气：${characterInfo.qi}
- 功法：${characterInfo.method || '基础心法'}

${this.characterProfile}`;
                
                try {
                    const savedPath = await this.fileManager.saveCharacterProfile(
                        characterInfo.name,
                        fullProfile
                    );
                    console.log('角色信息保存成功，路径:', savedPath);
                } catch (saveError) {
                    console.error('保存角色信息失败:', saveError);
                    // 尝试再次保存
                    setTimeout(async () => {
                        try {
                            const savedPath = await this.fileManager.saveCharacterProfile(
                                characterInfo.name,
                                fullProfile
                            );
                            console.log('角色信息重试保存成功，路径:', savedPath);
                        } catch (retryError) {
                            console.error('重试保存角色信息失败:', retryError);
                        }
                    }, 2000);
                }
            } else {
                console.error('角色设定生成失败');
            }
        } catch (error) {
            console.error('初始化故事管理器失败:', error);
            throw error;
        }
    }

    async generateStoryProgress() {
        const scene = await this.aiService.generateSceneDescription(
            `${this.gameState.getCurrentTime()}，${this.gameState.getCharacterInfo().name}正在修炼`,
            'environment'
        );
        
        const action = await this.aiService.generateSceneDescription(
            '修炼过程',
            'action'
        );
        
        const thoughts = await this.aiService.generateSceneDescription(
            '修炼感悟',
            'inner_thoughts'
        );
        
        const dialogue = await this.aiService.generateDialogue(
            this.gameState.getCharacterInfo().name,
            '修炼完毕的感受'
        );

        const progress = `${scene}\n${action}\n${thoughts}\n${dialogue}`;
        this.logStory(progress);
        await this.saveStory();
        return progress;
    }

    displayInitialConfig(config) {
        const timeSetting = CONFIG.TIME_SETTINGS[config.time] || '未知时代';
        const systemType = config.customSystem || CONFIG.SYSTEM_TYPES[config.systemType] || '未知系统';
        const features = config.cultivation_features
            .map(f => CONFIG.CULTIVATION_FEATURES[f])
            .filter(f => f)
            .join('、');
        const styles = config.world_style
            .map(s => CONFIG.WORLD_STYLES[s])
            .filter(s => s)
            .join('、');
        const plots = config.plot_tendency
            .map(p => CONFIG.PLOT_TENDENCIES[p])
            .filter(p => p)
            .join('、');

        const configSummary = [
            `【${this.gameState.getCurrentTimePeriod().name}】游戏初始化完成：`,
            `世界背景：${timeSetting}`,
            `系统类型：${systemType}`,
            `修炼特性：${features}`,
            `世界风格：${styles}`,
            `剧情倾向：${plots}`
        ].join('\n');

        this.uiManager.logStory(configSummary, '');
    }

    async generateAction() {
        try {
            const characterInfo = this.gameState.getCharacterInfo();
            const currentTime = this.gameState.getCurrentTimePeriod().name;
            const [currentQi, maxQi] = characterInfo.qi.split('/').map(Number);
            
            console.log('生成行动，当前状态:', {
                characterInfo,
                currentTime,
                qi: `${currentQi}/${maxQi}`
            });
            
            const result = await this.aiService.generateAction(
                characterInfo.name,
                currentTime,
                characterInfo.level,
                currentQi,
                maxQi
            );
            
            if (result) {
                // 记录行动
                this.logStory(result.action, `【${currentTime}】[${characterInfo.name}]`);
                
                // 处理修炼行为 - 增加真气
                if (result.action.includes('修炼') || result.action.includes('打坐') || 
                    result.action.includes('冥想') || result.action.includes('运转功法')) {
                    // 根据时间段获取不同的修炼效率
                    const efficiency = this.gameState.getCurrentTimePeriod().efficiency || 1.0;
                    
                    // 基础真气增长量 - 降低基础值，使修炼更加缓慢
                    const baseQiGain = 2;
                    
                    // 根据角色等级调整真气增长
                    let levelMultiplier = 1.0;
                    if (characterInfo.level.includes('二阶')) levelMultiplier = 1.2;
                    else if (characterInfo.level.includes('三阶')) levelMultiplier = 1.4;
                    else if (characterInfo.level.includes('四阶')) levelMultiplier = 1.6;
                    else if (characterInfo.level.includes('五阶')) levelMultiplier = 1.8;
                    else if (characterInfo.level.includes('六阶')) levelMultiplier = 2.0;
                    else if (characterInfo.level.includes('七阶')) levelMultiplier = 2.2;
                    else if (characterInfo.level.includes('八阶')) levelMultiplier = 2.4;
                    else if (characterInfo.level.includes('九阶')) levelMultiplier = 2.6;
                    
                    // 添加随机波动
                    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2的随机波动
                    
                    // 计算最终真气增长量
                    const qiGain = Math.floor(baseQiGain * efficiency * levelMultiplier * randomFactor);
                    
                    // 增加真气
                    this.gameState.addQi(qiGain);
                    this.logStory(`[修炼] 运转${characterInfo.method || '基础心法'}，获得${qiGain}点真气`, `【${currentTime}】`);
                    
                    // 更新角色信息显示
                    this.uiManager.updateCharacterInfo(this.gameState.getCharacterInfo());
                }
                
                // 处理随机事件
                if (result.event) {
                    this.logStory(result.event, `【${currentTime}】[事件]`);
                }
                
                // 处理NPC遇到
                if (result.npc) {
                    // 确保NPC信息完整
                    if (typeof result.npc === 'string') {
                        // 如果NPC是字符串，尝试解析
                        try {
                            const npcMatch = result.npc.match(/(.+)（(.+)）对你(.+)/);
                            if (npcMatch) {
                                const [_, name, level, attitude] = npcMatch;
                                this.logStory(`遇到了${level}修士${name}，态度：${attitude}`, `【${currentTime}】[遇到修士]`);
                            } else {
                                // 如果无法解析，直接显示
                                this.logStory(result.npc, `【${currentTime}】[遇到修士]`);
                            }
                        } catch (e) {
                            // 如果解析失败，直接显示
                            this.logStory(result.npc, `【${currentTime}】[遇到修士]`);
                        }
                    } else if (result.npc.name && result.npc.name !== '无' && result.npc.name !== 'null') {
                        // 如果是对象且有有效名字
                        const npcName = result.npc.name;
                        const npcLevel = result.npc.level || '未知境界';
                        const npcAttitude = result.npc.attitude || '中立';
                        
                        this.logStory(`遇到了${npcLevel}修士${npcName}，态度：${npcAttitude}`, `【${currentTime}】[遇到修士]`);
                    }
                }
                
                // 推进时间
                const newTime = this.gameState.advanceTime();
                this.uiManager.updateWorldInfo(this.gameState.getWorldInfo());
                
                return result;
            }
        } catch (error) {
            console.error('生成行动失败:', error);
            this.logStory(`[系统] 生成行动失败: ${error.message}`, '');
        }
    }

    startStoryLoop() {
        // 每个时间段生成一个行为
        this.storyInterval = setInterval(() => {
            const currentTime = this.gameState.getCurrentTimePeriod();
            this.generateAction();
        }, 30000); // 30秒一个时间段
    }

    stopStoryLoop() {
        if (this.storyInterval) {
            clearInterval(this.storyInterval);
            this.storyInterval = null;
        }
        // 停止故事循环时保存故事
        this.saveStory();
    }

    async generateTasks() {
        this.uiManager.updateLoadingStatus('正在生成任务...', '预计需要5-10秒');
        try {
            const tasks = await this.aiService.generateTasks();
            return tasks;
        } catch (error) {
            console.error('生成任务失败:', error);
            return CONFIG.DEFAULT_TASKS;
        }
    }

    async assignTask(task, reward) {
        try {
            const characterInfo = this.gameState.getCharacterInfo();
            const currentTime = this.gameState.getCurrentTimePeriod().name;
            
            // 记录任务
            this.logStory(`接受任务: ${task}`, `【${currentTime}】[任务]`);
            this.logStory(`预期奖励: ${reward}`, `【${currentTime}】[奖励]`);
            
            // 隐藏任务面板
            this.uiManager.hideTaskPanel();
            
            // 解析奖励中可能包含的境界提升
            if (reward.includes('境界提升') || reward.includes('突破')) {
                // 提取可能的新境界
                const levelMatch = reward.match(/突破到(.+?)境界/) || reward.match(/提升到(.+?)$/);
                if (levelMatch) {
                    const newLevel = levelMatch[1].trim();
                    if (newLevel && newLevel !== characterInfo.level) {
                        // 更新角色境界
                        this.gameState.updateCharacterLevel(newLevel);
                        this.logStory(`[突破] 恭喜突破到${newLevel}境界！`, `【${currentTime}】`);
                        
                        // 更新角色信息显示
                        this.uiManager.updateCharacterInfo(this.gameState.getCharacterInfo());
                    }
                }
            }
            
            // 解析奖励中可能包含的真气增加
            const qiMatch = reward.match(/真气\+(\d+)/);
            if (qiMatch) {
                const qiGain = parseInt(qiMatch[1]);
                if (!isNaN(qiGain) && qiGain > 0) {
                    // 增加真气
                    this.gameState.addQi(qiGain);
                    this.logStory(`[修炼] 获得${qiGain}点真气`, `【${currentTime}】`);
                    
                    // 更新角色信息显示
                    this.uiManager.updateCharacterInfo(this.gameState.getCharacterInfo());
                }
            }
            
            return true;
        } catch (error) {
            console.error('分配任务失败:', error);
            this.logStory(`[系统] 分配任务失败: ${error.message}`, '');
            return false;
        }
    }
}

export default StoryManager; 