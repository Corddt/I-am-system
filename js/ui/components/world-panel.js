/**
 * 世界面板组件 - 负责显示世界信息
 */
export class WorldPanel {
    constructor() {
        this.elements = null;
        console.log('[WorldPanel] 初始化世界面板组件');
    }

    /**
     * 初始化元素
     */
    initElements() {
        this.elements = {
            time: document.getElementById('world-time'),
            day: document.getElementById('world-day'),
            era: document.getElementById('world-era'),
            cultivationSystem: document.getElementById('cultivation-system')
        };
        
        console.log('[WorldPanel] 元素初始化状态:', {
            time: !!this.elements.time,
            day: !!this.elements.day,
            era: !!this.elements.era,
            cultivationSystem: !!this.elements.cultivationSystem
        });
    }

    /**
     * 更新世界信息
     */
    updateInfo(worldInfo) {
        console.log('[WorldPanel] 更新世界信息:', worldInfo);
        
        if (!this.elements) {
            this.initElements();
        }
        
        try {
            if (this.elements.time) this.elements.time.textContent = worldInfo.time || '早上';
            if (this.elements.day) this.elements.day.textContent = worldInfo.day || '一月初一';
            if (this.elements.era) this.elements.era.textContent = worldInfo.era || '天元历元年';
            if (this.elements.cultivationSystem) {
                this.elements.cultivationSystem.innerHTML = worldInfo.cultivationSystem || 
                    '<span>炼气境</span> → <span>筑基境</span> → <span>金丹境</span> → <span>元婴境</span> → <span>化神境</span>';
            }
        } catch (error) {
            console.error('[WorldPanel] 更新世界信息时出错:', error);
        }
    }
} 