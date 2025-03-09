/**
 * AI服务 - 处理所有AI生成内容
 */
import CONFIG from '../config/config.js';

class AIService {
    constructor(apiKey, model = CONFIG.DEFAULT_MODEL) {
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = CONFIG.API_URL;
        this.isValidated = false;
        this.gameState = null;
    }

    /**
     * 设置游戏状态
     */
    setGameState(gameState) {
        this.gameState = gameState;
    }

    /**
     * 验证API密钥
     */
    async validateApiKey() {
        if (!this.apiKey) {
            console.warn('[AIService] API密钥未设置，使用备用生成方案');
            return false;
        }
    
        if (this.isValidated) {
            return true;
        }
    
        try {
            console.log('[AIService] 验证API密钥...');
            
            const testResponse = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{role: "user", content: "test"}],
                    max_tokens: 5
                })
            });
            
            if (!testResponse.ok) {
                console.warn(`[AIService] API验证失败: ${testResponse.status}，使用备用生成方案`);
                return false;
            }
    
            this.isValidated = true;
            console.log('[AIService] API密钥验证成功');
            return true;
        } catch (error) {
            console.error('[AIService] API密钥验证出错:', error);
            return false;
        }
    }

    /**
     * 生成内容
     */
    async generateContent(messages, useJson = false) {
        try {
            console.log('[AIService] 生成内容，消息数量:', messages.length, '使用JSON格式:', useJson);
            
            const isValid = await this.validateApiKey();
            if (!isValid) {
                return null;
            }
            
            let retries = 2;
            let response = null;
            
            while (retries >= 0) {
                try {
                    const options = {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: this.model,
                            messages: messages,
                            stream: false,
                            max_tokens: 1000,
                            temperature: 0.7,
                            top_p: 0.7,
                            top_k: 50,
                            frequency_penalty: 0.5,
                            n: 1,
                            response_format: useJson ? { type: "json_object" } : { type: "text" }
                        })
                    };
                    
                    response = await fetch(this.apiUrl, options);
                    
                    if (response.ok) {
                        break;
                    } else {
                        console.warn(`[AIService] API请求失败: ${response.status}，剩余重试次数: ${retries}`);
                        retries--;
                        
                        if (response.status === 429) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        } else if (response.status === 403) {
                            break;
                        }
                    }
                } catch (error) {
                    console.error('[AIService] API请求出错:', error);
                    retries--;
                }
            }
            
            if (!response?.ok) {
                return null;
            }
            
            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                return null;
            }
            
            const content = data.choices[0].message.content;
            
            if (useJson) {
                try {
                    JSON.parse(content);
                    return content;
                } catch (error) {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            JSON.parse(jsonMatch[0]);
                            return jsonMatch[0];
                        } catch (e) {
                            return null;
                        }
                    }
                    return null;
                }
            }
            
            return content;
        } catch (error) {
            console.error('[AIService] AI生成内容出错:', error);
            return null;
        }
    }

    /**
     * 生成角色名称
     */
    async generateCharacterName() {
        const content = await this.generateContent([{
            role: "system",
            content: `你是一位修真小说角色命名专家。请生成一个符合修真世界特色的角色名字。
            
要求：
1. 名字必须是2-3个汉字
2. 名字要有修真韵味，适合修真小说背景
3. 名字应当独特且不重复
4. 不要带有任何解释或额外文字

请直接输出一个JSON对象，格式如下：
{
  "name": "你生成的名字"
}`
        }], true);
        
        if (!content) {
            const defaultNames = ['李青云', '张玄风', '王道心', '陈星河', '林清虚'];
            return defaultNames[Math.floor(Math.random() * defaultNames.length)];
        }
        
        try {
            const result = JSON.parse(content);
            return result.name || '李青云';
        } catch (error) {
            console.error('[AIService] 名字格式解析失败，使用默认名字:', error);
            return '李青云';
        }
    }

    /**
     * 生成角色资料
     */
    async generateCharacterProfile() {
        const content = await this.generateContent([{
            role: "system",
            content: `请生成一个修真小说角色的详细背景设定。要求：
1. 角色信息要完整
2. 要符合修真小说的风格
3. 返回格式为JSON对象，包含以下字段：
   - basic_info: {
       name: 姓名（2-3个汉字）,
       gender: 性别（男/女）,
       age: 年龄（16-30之间）,
       level: 境界（从练气一阶开始）,
       appearance: 相貌描述
   }
   - personality: 性格特征
   - background: 背景故事
   - abilities: 特殊能力或天赋
   - cultivation: {
       method: 修炼功法,
       progress: 修炼进度,
       special: 特殊天赋
   }`
        }], true);
        
        if (!content) {
            return this.getDefaultProfile();
        }
        
        try {
            const profile = JSON.parse(content);
            return this.formatProfile(profile);
        } catch (error) {
            console.error('[AIService] 解析角色设定失败，使用默认设定:', error);
            return this.getDefaultProfile();
        }
    }

    /**
     * 获取默认角色资料
     */
    getDefaultProfile() {
        return this.formatProfile({
            basic_info: {
                name: '李青云',
                gender: '男',
                age: 16,
                level: '练气一阶',
                appearance: '面容清秀，眉目如画'
            },
            personality: '性格坚韧，处事沉稳',
            background: '出身山村，偶得传承，立志修仙',
            abilities: '木灵根，擅长木系法术',
            cultivation: {
                method: '玄阳心经',
                progress: '初窥门径',
                special: '木灵根天赋'
            }
        });
    }

    /**
     * 格式化角色资料
     */
    formatProfile(profile) {
        return `# ${profile.basic_info.name}的修真之路

## 基本信息
- 姓名：${profile.basic_info.name}
- 性别：${profile.basic_info.gender}
- 年龄：${profile.basic_info.age}岁
- 境界：${profile.basic_info.level}
- 相貌：${profile.basic_info.appearance}

## 性格特征
${profile.personality}

## 背景故事
${profile.background}

## 特殊能力
${profile.abilities}

## 修炼功法
- 功法：${profile.cultivation.method}
- 进度：${profile.cultivation.progress}
- 特殊天赋：${profile.cultivation.special}`;
    }

    /**
     * 生成行动
     */
    async generateAction(characterName, currentTime, characterLevel, currentQi, maxQi) {
        const prompt = `你是一位修真小说的行动生成器。请根据以下信息生成一个修真角色的行动描述。

角色信息：
- 名字：${characterName}
- 当前时间：${currentTime}
- 境界：${characterLevel}
- 当前真气：${currentQi}/${maxQi}

要求：
1. 生成一个简短的行动描述，描述角色在当前时间可能进行的修炼活动
2. 行动要符合修真小说的风格和特点
3. 考虑角色的境界和真气状态
4. 可能包含修炼、采药、历练等活动

返回格式（JSON）：
{
    "action": "角色的具体行动描述",
    "event": "可能发生的事件或奇遇",
    "npc": "可能遇到的NPC描述"
}`;

        const content = await this.generateContent([{
            role: "system",
            content: prompt
        }], true);

        if (!content) {
            return this.getDefaultAction(characterName, currentTime);
        }

        try {
            const result = JSON.parse(content);
            return {
                action: result.action || this.getDefaultAction(characterName, currentTime).action,
                event: result.event || "",
                npc: result.npc || ""
            };
        } catch (error) {
            return this.getDefaultAction(characterName, currentTime);
        }
    }

    /**
     * 获取默认行动
     */
    getDefaultAction(characterName, currentTime) {
        const actions = {
            '早上': [
                `${characterName}在晨光中打坐修炼，吸收着清晨最为纯净的灵气。`,
                `${characterName}在山涧旁冥想，感受着自然的力量融入体内。`,
                `${characterName}练习基础剑法，剑光在晨曦中闪烁。`
            ],
            '下午': [
                `${characterName}在山林间寻找灵药，仔细辨别各种草药的特性。`,
                `${characterName}在瀑布下冲刷身体，借水流之力锤炼体魄。`,
                `${characterName}与同门切磋修为，互相印证修炼心得。`
            ],
            '晚上': [
                `${characterName}在月光下打坐，吸收着月华精华。`,
                `${characterName}在静室内研读古籍，寻找修炼的奥秘。`,
                `${characterName}闭目调息，梳理经脉中的真气流动。`
            ]
        };
        
        const timeActions = actions[currentTime] || actions['早上'];
        const randomAction = timeActions[Math.floor(Math.random() * timeActions.length)];
        
        return {
            action: randomAction,
            event: "",
            npc: ""
        };
    }

    /**
     * 生成任务
     */
    async generateTasks() {
        if (!this.gameState) {
            throw new Error('[AIService] GameState未初始化，请先调用setGameState');
        }

        const characterInfo = this.gameState.getCharacterInfo();
        const worldInfo = this.gameState.getWorldInfo();
        
        const prompt = `生成修真小说中的具体任务。

背景信息：
- 角色名称：${characterInfo.name || '主角'}
- 当前境界：${characterInfo.level || '练气一阶'}
- 当前时间：${worldInfo.time || '早上'}

要求：
1. 生成5个具体的修真任务
2. 每个任务必须包含：
   - 具体的地点
   - 明确的目标
   - 具体的物品奖励（灵石、丹药、法器等）
3. 任务难度要适合当前境界
4. 返回格式为JSON数组：
[
  {
    "task": "前往青木峰寻找一株百年灵芝",
    "location": "青木峰山腰",
    "difficulty": "简单",
    "rewards": {
      "items": ["百年灵芝", "低级灵石x2"],
      "exp": 100
    }
  }
]`;

        const content = await this.generateContent([{
            role: "system",
            content: prompt
        }], true);
        
        if (!content) {
            return this.getDefaultTasks(characterInfo.level);
        }
        
        try {
            const tasks = JSON.parse(content);
            if (Array.isArray(tasks) && tasks.length > 0) {
                return tasks.slice(0, 5);
            }
            return this.getDefaultTasks(characterInfo.level);
        } catch (error) {
            console.error('[AIService] 解析任务失败:', error);
            return this.getDefaultTasks(characterInfo.level);
        }
    }

    /**
     * 获取默认任务
     */
    getDefaultTasks(level = '练气一阶') {
        const tasks = {
            '练气一阶': [
                {
                    task: "在落叶谷采集五行灵草",
                    location: "落叶谷东部",
                    difficulty: "简单",
                    rewards: {
                        items: ["一阶灵草x3", "低级灵石x2"],
                        exp: 50
                    }
                },
                {
                    task: "清理青木镇附近的妖兽",
                    location: "青木镇外围",
                    difficulty: "中等",
                    rewards: {
                        items: ["妖兽内丹x1", "兽皮x2"],
                        exp: 100
                    }
                },
                {
                    task: "为王婆婆寻找治病的药材",
                    location: "药王谷",
                    difficulty: "简单",
                    rewards: {
                        items: ["初级回气丹x2", "药方x1"],
                        exp: 80
                    }
                },
                {
                    task: "探索废弃的炼丹房",
                    location: "青木镇西郊",
                    difficulty: "中等",
                    rewards: {
                        items: ["残破的丹方x1", "炼丹炉碎片x3"],
                        exp: 120
                    }
                },
                {
                    task: "收集凝气草",
                    location: "清风涧",
                    difficulty: "简单",
                    rewards: {
                        items: ["凝气草x5", "低级聚气符x1"],
                        exp: 60
                    }
                }
            ]
        };
        
        return tasks[level] || tasks['练气一阶'];
    }
}

export default AIService; 