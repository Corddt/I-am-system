/**
 * 故事显示组件 - 负责显示游戏故事内容
 */
export class StoryDisplay {
    constructor() {
        this.storyBox = null;
        this.pendingMessages = [];
        console.log('[StoryDisplay] 初始化故事显示组件');
    }

    /**
     * 初始化故事框
     */
    initStoryBox(container) {
        if (!this.storyBox) {
            console.log('[StoryDisplay] 创建新的故事框');
            this.storyBox = document.createElement('div');
            this.storyBox.id = 'story-box';
            this.storyBox.style.cssText = `
                height: 400px;
                overflow-y: auto;
                padding: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                font-size: 14px;
                line-height: 1.6;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #66c0f4;
            `;
            
            if (container) {
                const panels = container.querySelector('.panels');
                if (panels) {
                    container.insertBefore(this.storyBox, panels.nextSibling);
                } else {
                    container.appendChild(this.storyBox);
                }
            } else {
                document.body.appendChild(this.storyBox);
            }
        }
        return this.storyBox;
    }

    /**
     * 记录故事
     */
    logStory(text, timeStr) {
        if (!this.storyBox) {
            this.pendingMessages.push({ text, timeStr });
            return;
        }
        
        const entry = document.createElement('div');
        entry.className = 'story-entry';
        entry.style.cssText = `
            margin-bottom: 10px;
            line-height: 1.6;
            transition: opacity 0.3s;
            opacity: 0;
            padding: 8px;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        `;
        
        if (text.includes('[系统]')) {
            entry.style.backgroundColor = 'rgba(164, 208, 7, 0.2)';
            entry.innerHTML = `<span style="color: #66c0f4; font-size: 12px;">${timeStr}</span> <span style="color: #a4d007; font-weight: bold;">${text}</span>`;
        } else if (text.includes('[场景]')) {
            entry.style.backgroundColor = 'rgba(198, 212, 239, 0.2)';
            entry.innerHTML = `<span style="color: #66c0f4; font-size: 12px;">${timeStr}</span> <span style="color: #c6d4df;">${text}</span>`;
        } else if (text.includes('[行动]')) {
            entry.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
            entry.innerHTML = `<span style="color: #66c0f4; font-size: 12px;">${timeStr}</span> <span style="color: #ffcc00;">${text}</span>`;
        } else if (text.match(/\[.*?\]/)) {
            entry.style.backgroundColor = 'rgba(255, 153, 0, 0.2)';
            entry.innerHTML = `<span style="color: #66c0f4; font-size: 12px;">${timeStr}</span> <span style="color: #ff9900; font-weight: bold;">${text}</span>`;
        } else {
            entry.innerHTML = `<span style="color: #66c0f4; font-size: 12px;">${timeStr}</span> ${text}`;
        }
        
        this.storyBox.appendChild(entry);
        requestAnimationFrame(() => entry.style.opacity = '1');
        this.storyBox.scrollTop = this.storyBox.scrollHeight;
    }

    /**
     * 显示待处理的消息
     */
    showPendingMessages() {
        if (this.storyBox && this.pendingMessages.length > 0) {
            this.pendingMessages.forEach(msg => this.logStory(msg.text, msg.timeStr));
            this.pendingMessages = [];
        }
    }
} 