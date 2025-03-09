import { StoryDisplay } from './components/story-display.js';
import { CharacterPanel } from './components/character-panel.js';
import { WorldPanel } from './components/world-panel.js';

class UIManager {
    constructor() {
        this.initialized = false;
        this.debugMode = true;
        
        this.storyDisplay = new StoryDisplay();
        this.characterPanel = new CharacterPanel();
        this.worldPanel = new WorldPanel();
        
        console.log('[UIManager] 构造函数被调用');
        
        this.initializeUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initElements());
        } else {
            this.initElements();
        }
        
        window.addEventListener('load', () => {
            this.initElements();
            this.dumpDOMStructure();
        });
    }
    
    setupEventListeners() {
        if (window.gameState) {
            window.gameState.on('characterInfoUpdated', info => this.characterPanel.updateInfo(info));
            window.gameState.on('worldInfoUpdated', info => this.worldPanel.updateInfo(info));
        }
    }
    
    initElements() {
        console.log('[UIManager] 初始化UI元素...');
        
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameContainer = document.getElementById('game-container');
        this.taskPanel = document.getElementById('task-panel');
        
        if (this.gameContainer) {
            this.storyDisplay.initStoryBox(this.gameContainer);
        }
        
        this.initialized = true;
        this.storyDisplay.showPendingMessages();
    }
    
    dumpDOMStructure() {
        console.log('[UIManager] 开始输出DOM结构...');
        
        if (this.gameContainer) {
            console.log('[UIManager] 游戏容器结构:', this.gameContainer.outerHTML);
        }
        
        const storyBox = document.getElementById('story-box');
        if (storyBox) {
            console.log('[UIManager] 故事框结构:', storyBox.outerHTML);
        }
    }

    updateLoadingStatus(status, detail = '') {
        const loadingStatus = document.querySelector('.loading-status');
        const loadingDetail = document.querySelector('.loading-detail');
        const progressFill = document.querySelector('.loading-progress-fill');
        
        if (loadingStatus) loadingStatus.textContent = status;
        if (loadingDetail) loadingDetail.textContent = detail;
        
        let progress = 100;
        switch(status) {
            case '正在检查配置信息...': progress = 20; break;
            case '正在生成世界设定...': progress = 50; break;
            case '正在构建游戏场景...': progress = 80; break;
        }
        if (progressFill) progressFill.style.width = `${progress}%`;
    }

    showError(error) {
        const errorHtml = `
            <div class="error-message">
                ${error.message}<br>
                <button onclick="window.location.href='story_config.html'" 
                    style="margin-top: 20px; padding: 10px 20px; background: #66c0f4; border: none; 
                    color: #fff; border-radius: 3px; cursor: pointer;">
                    返回配置页面
                </button>
            </div>
        `;
        document.querySelector('.loading-text').innerHTML = errorHtml;
    }

    logStory(text, timeStr) {
        this.storyDisplay.logStory(text, timeStr);
    }

    showGameContainer() {
        if (this.loadingScreen) this.loadingScreen.style.display = 'none';
        if (this.gameContainer) this.gameContainer.style.display = 'block';
    }

    hideGameContainer() {
        if (this.loadingScreen) this.loadingScreen.style.display = 'flex';
        if (this.gameContainer) this.gameContainer.style.display = 'none';
    }

    showTaskPanel() {
        if (this.taskPanel) this.taskPanel.style.display = 'block';
    }

    hideTaskPanel() {
        if (this.taskPanel) this.taskPanel.style.display = 'none';
    }

    showFeedback(message, type = 'info') {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback-message ${type}`;
        feedbackDiv.innerHTML = message;
        document.body.appendChild(feedbackDiv);
        
        setTimeout(() => feedbackDiv.style.opacity = '1', 10);
        setTimeout(() => {
            feedbackDiv.style.opacity = '0';
            setTimeout(() => document.body.removeChild(feedbackDiv), 300);
        }, 5000);
    }

    updateGameStatus(status) {
        const statusElement = document.createElement('div');
        statusElement.className = 'game-status';
        statusElement.textContent = status;
        
        const container = document.getElementById('game-container');
        const existingStatus = container?.querySelector('.game-status');
        
        if (container) {
            if (existingStatus) {
                container.replaceChild(statusElement, existingStatus);
            } else {
                container.insertBefore(statusElement, container.firstChild);
            }
            
            setTimeout(() => {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    if (statusElement.parentNode === container) {
                        container.removeChild(statusElement);
                    }
                }, 300);
            }, 3000);
        }
    }
}

export default UIManager;