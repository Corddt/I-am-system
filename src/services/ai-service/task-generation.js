import { generateContent } from './content-generation.js';

export async function generateTasks(generateContent, gameState) {
    try {
        const characterInfo = gameState?.getCharacterInfo() || {};
        const worldInfo = gameState?.getWorldInfo() || {};
        const gender = characterInfo.gender === '女' ? '她' : '他';

        const prompt = `请为修真小说中的主角生成一系列可选任务。

背景信息：
- 角色名称：${characterInfo.name || '主角'}
- 角色性别：${characterInfo.gender || '男'}
- 当前境界：${characterInfo.level || '练气一阶'}
- 世界背景：${worldInfo.era || '天元历元年'}

要求：
1. 生成5个适合当前境界的任务
2. 每个任务都要有对应的奖励
3. 任务类型要多样化（修炼、探索、交流、战斗等）
4. 奖励要合理且有吸引力，包括道具、境界提升、特殊技能等
5. 注意使用正确的性别代词（${gender}）
6. 返回格式为JSON数组，每个任务包含以下字段：
   - task: 任务描述
   - reward: 任务奖励

示例格式：
[
  {"task": "探索山洞寻找灵草", "reward": "获得3株灵草，真气+10"},
  {"task": "帮助村民解决妖兽困扰", "reward": "获得村民感谢，声望+5"}
]`;

        const content = await generateContent([{
            role: "system",
            content: prompt,
        }], true);

        if (!content) {
            // 使用备用任务
            return [
                { task: "前往灵脉深处修炼，突破瓶颈", reward: "境界提升至练气二阶，获得灵脉精华丹一颗" },
                { task: "探索神秘遗迹，揭开古老秘密", reward: "获得上古功法残页，真气+20" },
                { task: "参加修真论道大会，与高手交流", reward: "获得论道心得，悟性+3，声望+10" },
                { task: "挑战山中强大妖兽，证明实力", reward: "获得妖兽内丹，战斗技能提升，声望+15" },
                { task: "协助门派炼制高级丹药", reward: "获得炼丹师称号，炼丹经验+30，特殊丹药配方一份" },
            ];
        }

        try {
            // 尝试解析JSON
            const result = JSON.parse(content);
            if (Array.isArray(result) && result.length > 0) {
                // 确保每个任务都有task和reward字段
                return result.filter(item => item.task && item.reward).slice(0, 5);
            }
            throw new Error('任务格式不正确');
        } catch (error) {
            console.log('解析任务失败，尝试使用正则表达式提取:', error);

            // 尝试使用正则表达式提取JSON数组
            const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
                try {
                    const extractedJson = jsonMatch[0];
                    const tasks = JSON.parse(extractedJson);
                    if (Array.isArray(tasks) && tasks.length > 0) {
                        return tasks.filter(item => item.task && item.reward).slice(0, 5);
                    }
                } catch (e) {
                    console.log('提取的JSON解析失败:', e);
                }
            }

            // 使用备用任务
            return [
                { task: "前往灵脉深处修炼，突破瓶颈", reward: "境界提升至练气二阶，获得灵脉精华丹一颗" },
                { task: "探索神秘遗迹，揭开古老秘密", reward: "获得上古功法残页，真气+20" },
                { task: "参加修真论道大会，与高手交流", reward: "获得论道心得，悟性+3，声望+10" },
                { task: "挑战山中强大妖兽，证明实力", reward: "获得妖兽内丹，战斗技能提升，声望+15" },
                { task: "协助门派炼制高级丹药", reward: "获得炼丹师称号，炼丹经验+30，特殊丹药配方一份" },
            ];
        }
    } catch (error) {
        console.log('生成任务失败，使用备用任务:', error);
        return [
            { task: "前往灵脉深处修炼，突破瓶颈", reward: "境界提升至练气二阶，获得灵脉精华丹一颗" },
            { task: "探索神秘遗迹，揭开古老秘密", reward: "获得上古功法残页，真气+20" },
            { task: "参加修真论道大会，与高手交流", reward: "获得论道心得，悟性+3，声望+10" },
            { task: "挑战山中强大妖兽，证明实力", reward: "获得妖兽内丹，战斗技能提升，声望+15" },
            { task: "协助门派炼制高级丹药", reward: "获得炼丹师称号，炼丹经验+30，特殊丹药配方一份" },
        ];
    }
}