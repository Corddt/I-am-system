import { generateContent } from './content-generation.js';

export async function generateDialogue(generateContent, gameConfig, characterName, context, mood = 'normal') {
    if (!gameConfig) return null;

    const prompt = `请生成一个修士的对话内容。

背景信息：
- 角色名称：${characterName}
- 当前场景：${context}
- 情绪状态：${mood}

要求：
1. 对话要符合角色性格
2. 要有角色特色的语气词
3. 要符合当前场景和情绪
4. 对话内容不超过20字
5. 返回格式为JSON对象，包含以下字段：
   - dialogue: 对话内容`;

    try {
        const response = await generateContent([{
            role: "system",
            content: prompt,
        }], true); // 使用JSON格式

        try {
            const result = JSON.parse(response);
            if (!result.dialogue) {
                throw new Error('未找到对话内容');
            }
            return result.dialogue;
        } catch (error) {
            console.error('解析对话内容失败:', error);
            return null;
        }
    } catch (error) {
        console.error('生成对话失败:', error);
        return null;
    }
}