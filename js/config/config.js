/**
 * 游戏配置
 */
const CONFIG = {
    // API配置
    API_URL: 'https://api.deepseek.com/v1/chat/completions',
    API_KEY: '',  // 需要在运行时设置
    DEFAULT_MODEL: 'deepseek-ai/DeepSeek-R1',
    
    // 默认角色设置
    DEFAULT_CHARACTER: {
        name: '无名',
        gender: '男',
        age: 16,
        level: '练气一阶',
        qi: '0/100',
        items: []
    },
    
    // 默认世界设置
    DEFAULT_WORLD: {
        time: '早上',
        day: '一月初一',
        era: '天元历元年'
    },
    
    // 时间段设置
    TIME_PERIODS: {
        '早上': { name: '早上', next: '下午', description: '灵气最为充沛的时候' },
        '下午': { name: '下午', next: '晚上', description: '适合外出历练的时候' },
        '晚上': { name: '晚上', next: '早上', description: '适合打坐修炼的时候' }
    },
    
    // 修炼境界
    CULTIVATION_LEVELS: [
        '练气一阶', '练气二阶', '练气三阶',
        '筑基一阶', '筑基二阶', '筑基三阶',
        '金丹一阶', '金丹二阶', '金丹三阶',
        '元婴一阶', '元婴二阶', '元婴三阶',
        '化神一阶', '化神二阶', '化神三阶'
    ],
    
    // 默认场景描述
    DEFAULT_SCENE: `这里是一个充满灵气的修真世界。
青山环绕，灵气氤氲，远处有瀑布声传来。
修士们在此修炼，追求长生之道。`
};

export default CONFIG; 