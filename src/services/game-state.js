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
        this.eventHandlers = {};
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[GameState] 事件处理出错 ${event}:`, error);
                }
            });
        }
    }

    async initialize(config) {
        console.log('初始化游戏状态...');
        console.log('接收到的参数:', config);
        
        try {
            // 更新世界状态
            if (config.worldState) {
                this.worldInfo = {
                    ...this.worldInfo,
                    ...config.worldState
                };
            }
            
            // 更新角色信息
            if (config.characterName) {
                this.characterInfo.name = config.characterName;
            }
            if (config.characterGender) {
                this.characterInfo.gender = config.characterGender;
            }
            
            // 更新系统类型
            if (config.systemType) {
                this.systemType = config.systemType;
            }
            
            // 触发更新事件
            this.emit('characterInfoUpdated', this.characterInfo);
            this.emit('worldInfoUpdated', this.worldInfo);
            
            console.log('初始化完成的游戏状态:', {
                worldState: this.worldInfo,
                characterInfo: this.characterInfo,
                systemType: this.systemType
            });
            
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
}

export default GameState; 