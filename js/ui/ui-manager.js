/**
 * UI管理器 - 管理游戏界面
 */
import { StoryDisplay } from './components/story-display.js';
import { CharacterPanel } from './components/character-panel.js';
import { WorldPanel } from './components/world-panel.js';

class UIManager {
    constructor() {
        this.initialized = false;
        this.debugMode = false;
        
        this.storyDisplay = new StoryDisplay();
        this.characterPanel = new CharacterPanel();
        this.worldPanel = new WorldPanel();
        
        console.log('[UIManager] 初始化UI管理器');
        
        this.initializeUI();
    }
    
    /**
     * 初始化UI
     */
    initializeUI() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initElements());
        } else {
            this.initElements();
        }
        
        window.addEventListener('load', () => {
            this.initElements();
            if (this.debugMode) {
                this.dumpDOMStructure();
            }
        });
    }
    
    /**
     * 初始化DOM元素
     */
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
    
    /**
     * 输出DOM结构（调试用）
     */
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

    /**
     * 更新加载状态
     */
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

    /**
     * 显示错误信息
     */
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

    /**
     * 记录故事
     */
    logStory(text, timeStr) {
        this.storyDisplay.logStory(text, timeStr);
    }

    /**
     * 显示游戏容器
     */
    showGameContainer() {
        if (this.loadingScreen) this.loadingScreen.style.display = 'none';
        if (this.gameContainer) this.gameContainer.style.display = 'block';
    }

    /**
     * 隐藏游戏容器
     */
    hideGameContainer() {
        if (this.loadingScreen) this.loadingScreen.style.display = 'flex';
        if (this.gameContainer) this.gameContainer.style.display = 'none';
    }

    /**
     * 显示任务面板
     */
    showTaskPanel() {
        if (this.taskPanel) this.taskPanel.style.display = 'block';
    }

    /**
     * 隐藏任务面板
     */
    hideTaskPanel() {
        if (this.taskPanel) this.taskPanel.style.display = 'none';
    }

    /**
     * 显示反馈信息
     */
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

    /**
     * 更新游戏状态
     */
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

    /**
     * 更新角色信息
     */
    updateCharacterInfo(characterInfo) {
        console.log('[UIManager] 更新角色信息:', characterInfo);
        this.characterPanel.updateInfo(characterInfo);
    }

    /**
     * 更新世界信息
     */
    updateWorldInfo(worldInfo) {
        console.log('[UIManager] 更新世界信息:', worldInfo);
        this.worldPanel.updateInfo(worldInfo);
    }
}

export default UIManager; 