/**
 * 游戏状态管理器 - 管理游戏核心状态
 */
import CONFIG from '../config/config.js';

class GameState {
    constructor() {
        this.worldInfo = {
            time: '早上',
            day: '一月初一',
            era: '天元历元年'
        };
        this.characterInfo = {
            name: '未定',
            gender: '未定',
            age: 16,
            level: '练气一阶',
            qi: '0/100',
            items: []
        };
        this.systemType = 'normal';
        this.eventHandlers = new Map();
        
        console.log('[GameState] 初始化游戏状态');
    }

    /**
     * 注册事件监听器
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
        return this; // 支持链式调用
    }

    /**
     * 移除事件监听器
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
        return this; // 支持链式调用
    }

    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[GameState] 事件处理出错 ${event}:`, error);
                }
            });
        }
        return this; // 支持链式调用
    }

    /**
     * 初始化游戏状态
     */
    async initialize(config) {
        console.log('[GameState] 初始化游戏状态...');
        console.log('[GameState] 接收到的参数:', config);
        
        try {
            // 更新世界状态
            if (config.worldState) {
                this.updateWorldInfo(config.worldState);
            }
            
            // 更新角色信息
            if (config.characterName || config.characterGender) {
                this.updateCharacterInfo({
                    name: config.characterName,
                    gender: config.characterGender
                });
            }
            
            // 更新系统类型
            if (config.systemType) {
                this.systemType = config.systemType;
            }
            
            console.log('[GameState] 初始化完成的游戏状态:', {
                worldState: this.worldInfo,
                characterInfo: this.characterInfo,
                systemType: this.systemType
            });
            
            return true;
        } catch (error) {
            console.error('[GameState] 初始化游戏状态失败:', error);
            throw error;
        }
    }

    /**
     * 获取角色信息
     */
    getCharacterInfo() {
        return { ...this.characterInfo };
    }

    /**
     * 获取世界信息
     */
    getWorldInfo() {
        return { ...this.worldInfo };
    }

    /**
     * 更新角色信息
     */
    updateCharacterInfo(info) {
        this.characterInfo = {
            ...this.characterInfo,
            ...info
        };
        this.emit('characterInfoUpdated', this.characterInfo);
        return this;
    }

    /**
     * 更新世界信息
     */
    updateWorldInfo(info) {
        this.worldInfo = {
            ...this.worldInfo,
            ...info
        };
        this.emit('worldInfoUpdated', this.worldInfo);
        return this;
    }

    /**
     * 获取当前时间段
     */
    getCurrentTimePeriod() {
        return CONFIG.TIME_PERIODS[this.worldInfo.time] || CONFIG.TIME_PERIODS['早上'];
    }

    /**
     * 推进游戏时间
     */
    advanceTime() {
        const currentPeriod = this.getCurrentTimePeriod();
        this.worldInfo.time = currentPeriod.next;
        
        if (currentPeriod.next === '早上') {
            // 进入新的一天
            const [month, day] = this.worldInfo.day.split('月');
            const dayNum = parseInt(day) + 1;
            this.worldInfo.day = `${month}月${dayNum}日`;
        }
        
        this.emit('worldInfoUpdated', this.worldInfo);
        return this.worldInfo;
    }

    /**
     * 增加真气值
     */
    addQi(amount) {
        const [current, max] = this.characterInfo.qi.split('/').map(Number);
        const newQi = Math.min(current + amount, max);
        this.characterInfo.qi = `${newQi}/${max}`;
        this.emit('characterInfoUpdated', this.characterInfo);
        
        // 检查是否可以突破
        if (newQi >= max) {
            return this.checkBreakthrough();
        }
        
        return false;
    }

    /**
     * 检查是否可以突破
     */
    checkBreakthrough() {
        const currentLevel = this.characterInfo.level;
        const levels = CONFIG.CULTIVATION_LEVELS;
        const currentIndex = levels.indexOf(currentLevel);
        
        if (currentIndex >= 0 && currentIndex < levels.length - 1) {
            const nextLevel = levels[currentIndex + 1];
            this.updateCharacterInfo({
                level: nextLevel,
                qi: '0/150' // 突破后真气上限提高
            });
            return true;
        }
        
        return false;
    }

    /**
     * 添加物品
     */
    addItem(item) {
        if (!item) return false;
        
        const items = this.characterInfo.items || [];
        items.push(item);
        this.updateCharacterInfo({ items });
        return true;
    }

    /**
     * 使用物品
     */
    useItem(itemIndex) {
        const items = this.characterInfo.items || [];
        if (itemIndex < 0 || itemIndex >= items.length) {
            return false;
        }
        
        const item = items[itemIndex];
        items.splice(itemIndex, 1);
        this.updateCharacterInfo({ items });
        
        // 根据物品类型产生效果
        if (item.includes('灵石')) {
            this.addQi(20);
        } else if (item.includes('丹药')) {
            this.addQi(50);
        }
        
        return true;
    }
}

export default GameState; 