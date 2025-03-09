import CONFIG, { TIME_PERIODS, CULTIVATION_LEVELS, CULTIVATION_METHODS, ITEMS } from '../config/config.js';

class GameState {
    constructor() {
        this.worldState = {
            time: '早上',
            era: '天元历元年',
            day: '一月初一',
            cultivationSystem: '炼气境→筑基境→金丹境→元婴境→化神境',
            timeIndex: 0,
            dayIndex: 0
        };
        
        this.characterInfo = {
            name: '',
            gender: '男',
            age: 16,
            level: '练气一阶',
            qi: '0/100',
            method: '基础心法',
            items: []
        };
        
        this.tasks = [];
        this.events = [];
        this.relationships = [];
        this.systemType = '修仙系统';
        
        // 时间周期设置
        this.timePeriods = [
            { name: '早上', efficiency: 1.2 },
            { name: '下午', efficiency: 1.0 },
            { name: '晚上', efficiency: 0.8 }
        ];
        
        // 日期设置
        this.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        this.days = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', 
                    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    }

    initialize(worldState, characterName, characterGender, systemType) {
        console.log('初始化游戏状态...');
        console.log('接收到的参数:', { worldState, characterName, characterGender, systemType });
        
        // 设置世界状态
        if (worldState) {
            this.worldState = {
                ...this.worldState,
                era: worldState.era || this.worldState.era,
                cultivationSystem: worldState.cultivationSystem || this.worldState.cultivationSystem,
                time: this.timePeriods[0].name,
                day: `${this.months[0]}${this.days[0]}`,
                timeIndex: 0,
                dayIndex: 0
            };
        }
        
        // 设置角色信息
        this.characterInfo = {
            ...this.characterInfo,
            name: characterName || '无名修士',
            gender: characterGender || '男',
            age: worldState?.characterAge || 16,
            level: worldState?.characterLevel || '练气一阶',
            qi: '0/100',
            method: '基础心法'
        };
        
        this.systemType = systemType || '修仙系统';
        
        console.log('初始化完成的游戏状态:', {
            worldState: this.worldState,
            characterInfo: this.characterInfo,
            systemType: this.systemType
        });
    }

    getCurrentTimePeriod() {
        return this.timePeriods[this.worldState.timeIndex];
    }

    advanceTime() {
        // 更新时间
        this.worldState.timeIndex = (this.worldState.timeIndex + 1) % this.timePeriods.length;
        this.worldState.time = this.timePeriods[this.worldState.timeIndex].name;
        
        // 如果一天结束，更新日期
        if (this.worldState.timeIndex === 0) {
            this.worldState.dayIndex = (this.worldState.dayIndex + 1) % (this.months.length * this.days.length);
            const monthIndex = Math.floor(this.worldState.dayIndex / this.days.length);
            const dayIndex = this.worldState.dayIndex % this.days.length;
            this.worldState.day = `${this.months[monthIndex]}${this.days[dayIndex]}`;
        }
        
        return {
            time: this.worldState.time,
            day: this.worldState.day,
            efficiency: this.timePeriods[this.worldState.timeIndex].efficiency
        };
    }

    addTask(task) {
        console.log('添加任务:', task);
        this.tasks.push(task);
    }

    removeTask(taskIndex) {
        if (taskIndex >= 0 && taskIndex < this.tasks.length) {
            console.log('移除任务:', this.tasks[taskIndex]);
            this.tasks.splice(taskIndex, 1);
        }
    }

    getCharacterInfo() {
        console.log('获取角色信息:', this.characterInfo);
        return { ...this.characterInfo };
    }

    getWorldInfo() {
        console.log('获取世界信息:', this.worldState);
        return { 
            time: this.worldState.time,
            era: this.worldState.era,
            day: this.worldState.day,
            cultivationSystem: this.worldState.cultivationSystem
        };
    }

    updateCharacterLevel(newLevel) {
        if (newLevel && newLevel !== this.characterInfo.level) {
            console.log(`角色境界提升: ${this.characterInfo.level} -> ${newLevel}`);
            this.characterInfo.level = newLevel;
            return true;
        }
        return false;
    }

    // 修炼相关方法
    cultivate(duration = 1) { // duration in hours
        const timePeriod = this.getCurrentTimePeriod();
        const method = this.characterInfo.method;
        const baseQiGain = method.qi_per_day * (duration / 24); // 按小时计算
        const actualQiGain = Math.floor(baseQiGain * timePeriod.efficiency * method.stability);
        
        this.addQi(actualQiGain);
        return {
            qiGained: actualQiGain,
            timePeriod: timePeriod.name,
            method: method.name
        };
    }

    addQi(amount) {
        // 解析当前真气值和上限
        const [currentQi, maxQi] = this.characterInfo.qi.split('/').map(Number);
        
        // 计算新的真气值，确保使用数值计算
        let newQi = currentQi + parseInt(amount);
        
        // 限制真气不超过上限
        if (newQi > maxQi) {
            newQi = maxQi;
        }
        
        // 更新真气值
        this.characterInfo.qi = `${newQi}/${maxQi}`;
        
        console.log(`真气更新: ${currentQi} + ${amount} = ${newQi}/${maxQi}`);
        
        // 检查是否可以突破
        this.checkBreakthrough();
    }

    checkBreakthrough() {
        // 检查小境界突破
        const currentLevel = this.characterInfo.level;
        const realm = CULTIVATION_LEVELS.QI_REFINING; // 当前只实现练气期
        
        // 将当前境界转换为对象格式（如果是字符串）
        let currentStage;
        if (typeof currentLevel === 'string') {
            // 如果是字符串（如"练气一阶"），查找对应的境界对象
            currentStage = realm.stages.find(stage => stage.name === currentLevel);
            if (!currentStage) {
                console.error('当前境界无效:', currentLevel);
                // 设置为默认的练气一阶
                currentStage = realm.stages[0];
                this.characterInfo.level = currentStage.name;
                return { success: false, error: '境界数据异常，已重置为练气一阶' };
            }
        } else {
            // 已经是对象格式
            currentStage = currentLevel;
        }
        
        // 找到当前境界的下一个境界
        const currentIndex = realm.stages.findIndex(stage => 
            (typeof currentStage === 'object' && stage.level === currentStage.level) || 
            (typeof currentStage === 'string' && stage.name === currentStage));
        
        // 验证当前索引是否有效
        if (currentIndex === -1) {
            console.error('当前境界无效:', currentStage);
            // 设置为默认的练气一阶
            this.characterInfo.level = realm.stages[0].name;
            return { success: false, error: '境界数据异常，已重置为练气一阶' };
        }
        
        // 解析当前真气值
        const [currentQi, maxQi] = this.characterInfo.qi.split('/').map(Number);
        
        if (currentIndex < realm.stages.length - 1) {
            const nextStage = realm.stages[currentIndex + 1];
            
            if (currentQi >= nextStage.required_qi) {
                // 突破成功
                const oldLevel = typeof this.characterInfo.level === 'object' ? 
                    this.characterInfo.level.name : this.characterInfo.level;
                this.characterInfo.level = nextStage.name;
                this.characterInfo.qi = `${nextStage.required_qi}/${Math.floor(nextStage.required_qi * 1.2)}`;
                
                // 记录突破事件
                this.addEvent({
                    type: 'breakthrough',
                    oldLevel: oldLevel,
                    newLevel: nextStage.name,
                    description: `突破成功，从${oldLevel}晋升至${nextStage.name}`
                });
                
                return {
                    success: true,
                    oldLevel: oldLevel,
                    newLevel: nextStage.name
                };
            }
        } else if (currentIndex === realm.stages.length - 1) {
            // 当前已经是该大境界的最高小境界，可以考虑大境界突破
            // 检查是否达到筑基期的要求
            const foundationRealm = CULTIVATION_LEVELS.FOUNDATION;
            const firstFoundationStage = foundationRealm.stages[0];
            
            if (currentQi >= firstFoundationStage.required_qi) {
                // 大境界突破成功
                const oldLevel = typeof this.characterInfo.level === 'object' ? 
                    this.characterInfo.level.name : this.characterInfo.level;
                this.characterInfo.level = firstFoundationStage.name;
                this.characterInfo.qi = `${firstFoundationStage.required_qi}/${Math.floor(firstFoundationStage.required_qi * 1.2)}`;
                
                // 记录大境界突破事件
                this.addEvent({
                    type: 'major_breakthrough',
                    oldLevel: oldLevel,
                    newLevel: firstFoundationStage.name,
                    description: `大境界突破成功，从${oldLevel}晋升至${firstFoundationStage.name}`
                });
                
                return {
                    success: true,
                    oldLevel: oldLevel,
                    newLevel: firstFoundationStage.name,
                    isMajorBreakthrough: true
                };
            } else {
                console.log('已达到当前大境界最高小境界，准备进行大境界突破');
                return { 
                    success: false, 
                    message: '已达到当前大境界最高小境界',
                    currentQi: currentQi,
                    requiredQi: firstFoundationStage.required_qi,
                    progress: Math.floor((currentQi / firstFoundationStage.required_qi) * 100) + '%'
                };
            }
        }
        
        return { success: false };
    }

    // 记录事件
    addEvent(event) {
        this.events.push({
            ...event,
            time: this.worldState.time,
            day: this.worldState.day,
            timestamp: new Date()
        });
    }

    // 添加关系
    addRelationship(npcName, npcLevel, relationship) {
        this.relationships.push({
            name: npcName,
            level: npcLevel,
            relationship: relationship
        });
    }

    // 使用物品
    useItem(itemId) {
        const itemIndex = this.characterInfo.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;

        const item = this.characterInfo.items[itemIndex];
        if (item.type === 'PILL') {
            this.addQi(item.qi_boost);
            this.characterInfo.items.splice(itemIndex, 1);
            return true;
        }
        return false;
    }
}

export default GameState; 