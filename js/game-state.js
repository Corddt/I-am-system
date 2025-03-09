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
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event).add(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).delete(handler);
        }
    }

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
    }

    async initialize(config) {
        try {
            if (config.worldState) {
                this.updateWorldInfo(config.worldState);
            }
            
            if (config.characterName || config.characterGender) {
                this.updateCharacterInfo({
                    name: config.characterName,
                    gender: config.characterGender
                });
            }
            
            if (config.systemType) {
                this.systemType = config.systemType;
            }
            
            return true;
        } catch (error) {
            console.error('初始化游戏状态失败:', error);
            throw error;
        }
    }

    getCharacterInfo() {
        return { ...this.characterInfo };
    }

    getWorldInfo() {
        return { ...this.worldInfo };
    }

    updateCharacterInfo(info) {
        this.characterInfo = {
            ...this.characterInfo,
            ...info
        };
        this.emit('characterInfoUpdated', this.characterInfo);
    }

    updateWorldInfo(info) {
        this.worldInfo = {
            ...this.worldInfo,
            ...info
        };
        this.emit('worldInfoUpdated', this.worldInfo);
    }

    getCurrentTimePeriod() {
        const times = {
            '早上': { name: '清晨', next: '下午' },
            '下午': { name: '午后', next: '晚上' },
            '晚上': { name: '夜晚', next: '早上' }
        };
        return times[this.worldInfo.time] || times['早上'];
    }

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
}

export default GameState; 