export class TaskGenerator {
    constructor(contentGenerator, gameState) {
        this.contentGenerator = contentGenerator;
        this.gameState = gameState;
    }

    async generateTasks() {
        try {
            const characterInfo = this.gameState?.getCharacterInfo() || {};
            const worldInfo = this.gameState?.getWorldInfo() || {};
            
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

            const content = await this.contentGenerator.generate([{
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
                console.error('[TaskGenerator] 解析任务失败:', error);
                return this.getDefaultTasks(characterInfo.level);
            }
        } catch (error) {
            console.error('[TaskGenerator] 生成任务失败:', error);
            return this.getDefaultTasks();
        }
    }

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