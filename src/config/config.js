// 游戏配置常量
const CONFIG = {
    TIME_UNITS: ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'],
    DEFAULT_CULTIVATION_SYSTEM: "炼气境 → 筑基境 → 金丹境 → 元婴境 → 化神境",
    API_URL: 'https://api.siliconflow.cn/v1/chat/completions',
    
    // 时代背景映射
    TIME_SETTINGS: {
        'ancient': '上古仙侠时代',
        'xianxia': '传统修真世界',
        'modern': '现代修真社会',
        'future': '未来仙途纪元',
        'fictional': '异界仙域'
    },

    // 系统类型映射
    SYSTEM_TYPES: {
        'cultivation': '传统修炼系统',
        'artifact': '法器养成系统',
        'alchemy': '丹道系统',
        'formation': '阵法系统',
        'custom': '自定义系统'
    },

    // 修炼特性映射
    CULTIVATION_FEATURES: {
        'elemental': '五行道法',
        'sword': '剑道修炼',
        'body': '体修之道',
        'talisman': '符箓之术',
        'beast': '御兽之法',
        'medical': '丹道医术',
        'illusion': '幻术之道'
    },

    // 世界风格映射
    WORLD_STYLES: {
        'orthodox': '正统修真',
        'dark': '阴暗诡秘',
        'light': '轻松日常',
        'competitive': '争锋修道',
        'exploration': '探索神秘'
    },

    // 剧情倾向映射
    PLOT_TENDENCIES: {
        'adventure': '历练冒险',
        'politics': '宗门争斗',
        'romance': '仙缘情劫',
        'revenge': '复仇之路',
        'mystery': '探索秘境'
    },

    // 默认任务
    DEFAULT_TASKS: [
        {
            task: "外出采集灵药",
            reward: "下品灵石×2"
        },
        {
            task: "打坐修炼",
            reward: "修为增长"
        },
        {
            task: "研习功法",
            reward: "功法熟练度提升"
        }
    ],

    // 默认行为
    DEFAULT_ACTIONS: [
        "盘坐虚空，周身灵气如潮，参悟天地大道。",
        "手捏玄奥法诀，丹田内真气涌动，气息节节攀升。",
        "立于悬崖绝壁，迎着罡风修炼，体魄愈发凝实。",
        "运转功法，周身道韵流转，若隐若现。",
        "凌空而立，剑气纵横，演练无上剑道。"
    ]
};

export default CONFIG;

export const TIME_PERIODS = {
    MORNING: {
        name: '早上',
        description: '灵气充沛，最适合修炼的时候',
        bonus: 1.2 // 修炼效率提升20%
    },
    AFTERNOON: {
        name: '下午',
        description: '灵气平稳，适合外出历练',
        bonus: 1.0
    },
    NIGHT: {
        name: '晚上',
        description: '灵气内敛，适合打坐凝神',
        bonus: 0.8
    }
};

export const CULTIVATION_LEVELS = {
    QI_REFINING: {
        name: '练气期',
        stages: [
            { level: 1, name: '练气一阶', required_qi: 0 },
            { level: 2, name: '练气二阶', required_qi: 500 },
            { level: 3, name: '练气三阶', required_qi: 1500 },
            { level: 4, name: '练气四阶', required_qi: 3000 },
            { level: 5, name: '练气五阶', required_qi: 5000 },
            { level: 6, name: '练气六阶', required_qi: 8000 },
            { level: 7, name: '练气七阶', required_qi: 12000 },
            { level: 8, name: '练气八阶', required_qi: 18000 },
            { level: 9, name: '练气九阶', required_qi: 25000 }
        ]
    },
    FOUNDATION: {
        name: '筑基期',
        stages: [
            { level: 1, name: '筑基初期', required_qi: 35000 },
            { level: 2, name: '筑基中期', required_qi: 50000 },
            { level: 3, name: '筑基后期', required_qi: 70000 },
            { level: 4, name: '筑基大圆满', required_qi: 100000 }
        ]
    }
};

export const CULTIVATION_METHODS = {
    BASIC: {
        name: '基础心法',
        description: '最基础的修炼功法，稳定性强但效率较低',
        qi_per_day: 20,
        stability: 1.0,
        requirements: { level: 1 }
    },
    INTERMEDIATE: {
        name: '玄阳心法',
        description: '进阶功法，效率较高，对根骨有一定要求',
        qi_per_day: 35,
        stability: 0.9,
        requirements: { level: 3 }
    },
    ADVANCED: {
        name: '太阳真经',
        description: '高阶功法，效率极高，但对资质要求极高',
        qi_per_day: 50,
        stability: 0.8,
        requirements: { level: 6 }
    }
};

export const ITEMS = {
    PILLS: {
        BASIC_QI_PILL: {
            name: '聚气丹',
            description: '最基础的丹药，可增加50点真气',
            qi_boost: 50,
            price: 100
        },
        INTERMEDIATE_QI_PILL: {
            name: '凝气丹',
            description: '中级丹药，可增加150点真气',
            qi_boost: 150,
            price: 500
        },
        ADVANCED_QI_PILL: {
            name: '化气丹',
            description: '高级丹药，可增加300点真气',
            qi_boost: 300,
            price: 2000
        }
    }
}; 