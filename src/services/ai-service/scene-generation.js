import { generateContent } from './content-generation.js';
import CONFIG from '../../config/config.js';

export async function generateSceneDescription(generateContent, characterProfile, gameConfig, time) {
    if (!characterProfile || !gameConfig) {
        return CONFIG.DEFAULT_SCENE;
    }

    const prompt = `请生成一个修真场景描述。

背景信息：
- 角色：${characterProfile.name}
- 时间：${CONFIG.TIME_SETTINGS[time]}
- 世界背景：${CONFIG.TIME_SETTINGS[gameConfig.time]}
- 修炼特性：${gameConfig.cultivation_features.map(f => CONFIG.CULTIVATION_FEATURES[f]).join('、')}
- 世界风格：${gameConfig.world_style.map(s => CONFIG.WORLD_STYLES[s]).join('、')}

要求：
1. 描述角色在这个时间段正在进行的具体活动
2. 活动要符合修真设定，可以是：
   - 炼丹
   - 炼器
   - 参悟功法
   - 采集灵药
   - 斩杀妖兽
   - 探索秘境
   - 交易灵石
   - 论道切磋
   - 布置阵法
3. 描述要有细节，包含环境、天气、心境等要素
4. 长度100字左右
5. 不要重复之前的描述
6. 返回格式为JSON对象，包含以下字段：
   - scene: 场景描述
   - time: 当前时辰
   - character: 角色名称`;

    try {
        const response = await generateContent([{
            role: "system",
            content: prompt,
        }], true); // 使用JSON格式

        try {
            const result = JSON.parse(response);
            if (!result.scene || !result.time || !result.character) {
                throw new Error('场景描述格式无效');
            }
            return `【${result.time}】[${result.character}] ${result.scene.trim()}`;
        } catch (error) {
            console.error('解析场景描述失败:', error);
            return CONFIG.DEFAULT_SCENE;
        }
    } catch (error) {
        console.error('生成场景描述失败:', error);
        return CONFIG.DEFAULT_SCENE;
    }
}