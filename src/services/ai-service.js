import CONFIG from '../config/config.js';
import { ContentGenerator } from './ai/content-generator.js';
import { CharacterGenerator } from './ai/character-generator.js';
import { TaskGenerator } from './ai/task-generator.js';

class AIService {
    constructor(apiKey, model) {
        this.contentGenerator = new ContentGenerator(apiKey, model, CONFIG.API_URL);
        this.characterGenerator = new CharacterGenerator(this.contentGenerator);
        this.taskGenerator = null;
        this.gameConfig = null;
    }

    setGameConfig(config) {
        this.gameConfig = config;
    }

    setGameState(gameState) {
        this.taskGenerator = new TaskGenerator(this.contentGenerator, gameState);
    }

    async generateCharacterName() {
        return this.characterGenerator.generateName();
    }

    async generateCharacterProfile() {
        return this.characterGenerator.generateProfile();
    }

    async generateWorldState() {
        const content = await this.contentGenerator.generate([{
            role: "system",
            content: "生成一个修真世界的基本状态，包括时代背景、修炼体系等信息。"
        }], true);
        
        if (!content) {
            return {
                time: '上古',
                systemType: '灵气复苏',
                cultivation_features: ['丹药辅助', '灵根天赋'],
                world_style: ['仙侠正统'],
                plot_tendency: ['机缘造化']
            };
        }
        
        try {
            return JSON.parse(content);
        } catch (error) {
            console.error('解析世界状态失败，使用默认状态:', error);
            return {
                time: '上古',
                systemType: '灵气复苏',
                cultivation_features: ['丹药辅助', '灵根天赋'],
                world_style: ['仙侠正统'],
                plot_tendency: ['机缘造化']
            };
        }
    }

    async generateTasks() {
        if (!this.taskGenerator) {
            throw new Error('TaskGenerator not initialized. Call setGameState first.');
        }
        return this.taskGenerator.generateTasks();
    }

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

        const content = await this.contentGenerator.generate([{
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
}

export default AIService;