import { generateContent } from './content-generation.js';

export async function generateWorldState(generateContent) {
    try {
        const content = await generateContent([{
            role: "system",
            content: "生成一个修真世界的基本状态，包括时代背景、修炼体系等信息。",
        }], true);

        if (!content) {
            // 使用备用世界状态
            return {
                time: '上古',
                systemType: '灵气复苏',
                cultivation_features: ['丹药辅助', '灵根天赋'],
                world_style: ['仙侠正统'],
                plot_tendency: ['机缘造化'],
            };
        }

        return JSON.parse(content);
    } catch (error) {
        console.log('生成世界状态失败，使用默认状态:', error);
        return {
            time: '上古',
            systemType: '灵气复苏',
            cultivation_features: ['丹药辅助', '灵根天赋'],
            world_style: ['仙侠正统'],
            plot_tendency: ['机缘造化'],
        };
    }
}

export async function generateStoryProgress(generateContent, gameState) {
    try {
        const characterInfo = gameState?.getCharacterInfo() || {};
        const worldInfo = gameState?.getWorldInfo() || {};
        const gender = characterInfo.gender === '女' ? '她' : '他';
        const genderPossessive = characterInfo.gender === '女' ? '她的' : '他的';

        const prompt = `请生成一段修真小说中的剧情发展选项。

背景信息：
- 角色名称：${characterInfo.name || '主角'}
- 角色性别：${characterInfo.gender || '男'}
- 当前境界：${characterInfo.level || '练气一阶'}
- 世界背景：${worldInfo.era || '天元历元年'}

要求：
1. 生成四个可能的剧情发展选项
2. 每个选项都要有明确的修真主题
3. 选项要有多样性，包括修炼、奇遇、冒险、交流等不同类型
4. 注意使用正确的性别代词（${gender}/${genderPossessive}）
5. 返回一个JSON对象，包含以下字段：
   - options: 包含四个选项的数组，每个选项包含id和description字段`;

        const content = await generateContent([{
            role: "system",
            content: prompt,
        }], true);

        if (!content) {
            // 使用备用选项
            return {
                options: [
                    { id: 1, description: "前往附近的灵脉修炼，提升修为" },
                    { id: 2, description: "拜访附近的修士，寻求指导" },
                    { id: 3, description: "探索山林，寻找珍稀药材" },
                    { id: 4, description: "自定义..." },
                ],
            };
        }

        try {
            const result = JSON.parse(content);
            // 确保有四个选项，最后一个是自定义
            if (result.options && Array.isArray(result.options)) {
                // 保留前三个AI生成的选项
                const aiOptions = result.options.slice(0, 3);
                // 添加自定义选项
                return {
                    options: [
                        ...aiOptions,
                        { id: 4, description: "自定义..." },
                    ],
                };
            }
            return {
                options: [
                    { id: 1, description: "前往附近的灵脉修炼，提升修为" },
                    { id: 2, description: "拜访附近的修士，寻求指导" },
                    { id: 3, description: "探索山林，寻找珍稀药材" },
                    { id: 4, description: "自定义..." },
                ],
            };
        } catch (error) {
            console.log('解析剧情选项失败，使用备用选项:', error);
            return {
                options: [
                    { id: 1, description: "前往附近的灵脉修炼，提升修为" },
                    { id: 2, description: "拜访附近的修士，寻求指导" },
                    { id: 3, description: "探索山林，寻找珍稀药材" },
                    { id: 4, description: "自定义..." },
                ],
            };
        }
    } catch (error) {
        console.log('生成剧情选项失败，使用备用选项:', error);
        return {
            options: [
                { id: 1, description: "前往附近的灵脉修炼，提升修为" },
                { id: 2, description: "拜访附近的修士，寻求指导" },
                { id: 3, description: "探索山林，寻找珍稀药材" },
                { id: 4, description: "自定义..." },
            ],
        };
    }
}