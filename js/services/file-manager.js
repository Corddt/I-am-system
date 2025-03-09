/**
 * 文件管理器 - 处理文件读写操作
 */
class FileManager {
    constructor() {
        this.charactersDir = 'characters';
        this.storiesDir = 'stories';
        console.log('[FileManager] 初始化，目录设置为:', {
            characters: this.charactersDir,
            stories: this.storiesDir
        });
        this.ensureDirectoriesExist();
    }

    /**
     * 确保必要目录存在
     */
    async ensureDirectoriesExist() {
        try {
            console.log('[FileManager] 确保必要目录存在...');
            await this.ensureDirectoryExists(this.charactersDir);
            await this.ensureDirectoryExists(this.storiesDir);
            console.log('[FileManager] 目录创建成功');
        } catch (error) {
            console.error('[FileManager] 创建目录失败:', error);
        }
    }

    /**
     * 确保指定目录存在
     */
    async ensureDirectoryExists(directory) {
        console.log('[FileManager] 确保目录存在:', directory);
        
        try {
            const response = await fetch('/api/ensure-directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory })
            });
            
            const result = await response.json();
            console.log('[FileManager] 目录检查结果:', result);
            
            if (!result.success) {
                throw new Error(`创建目录失败: ${result.error}`);
            }
            
            return result.exists;
        } catch (error) {
            console.error('[FileManager] 确保目录存在时出错:', error);
            throw error;
        }
    }

    /**
     * 保存角色信息
     */
    async saveCharacterProfile(characterName, profile) {
        console.log('[FileManager] 开始保存角色信息:', characterName);
        
        try {
            await this.ensureDirectoryExists(this.charactersDir);
            
            const filename = `${this.charactersDir}/${characterName}.md`;
            console.log('[FileManager] 保存角色文件:', filename);
            
            let content = profile;
            if (typeof profile === 'object') {
                content = this.convertCharacterToMarkdown(profile);
            }
            
            const response = await fetch('/api/save-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename,
                    content
                })
            });
            
            if (!response.ok) {
                throw new Error(`保存角色信息失败: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[FileManager] 角色保存结果:', result);
            
            if (!result.success) {
                throw new Error(result.error || '保存失败');
            }
            
            return { success: true, path: filename };
        } catch (error) {
            console.error('[FileManager] 保存角色信息失败:', error);
            // 重试一次
            try {
                console.log('[FileManager] 尝试重新保存...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await this.saveCharacterProfile(characterName, profile);
            } catch (retryError) {
                console.error('[FileManager] 重试保存失败:', retryError);
                throw retryError;
            }
        }
    }

    /**
     * 保存故事进展
     */
    async saveStoryProgress(characterName, story) {
        console.log('[FileManager] 开始保存故事进展:', characterName);
        
        try {
            await this.ensureDirectoryExists(this.storiesDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
            const filename = `${this.storiesDir}/${characterName}_${timestamp}.md`;
            
            const content = this.convertStoryToMarkdown(story, characterName);
            
            const response = await fetch('/api/save-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename,
                    content
                })
            });
            
            if (!response.ok) {
                throw new Error(`保存故事失败: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[FileManager] 故事保存结果:', result);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { success: true, filename };
        } catch (error) {
            console.error('[FileManager] 保存故事进展失败:', error);
            throw error;
        }
    }

    /**
     * 获取角色文件列表
     */
    async getCharacterFiles() {
        try {
            console.log('[FileManager] 开始获取角色文件列表...');
            
            // 确保目录存在
            await this.ensureDirectoryExists(this.charactersDir);
            
            // 创建一个.gitkeep文件确保目录存在
            await fetch('/api/save-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: `${this.charactersDir}/.gitkeep`,
                    content: ''
                })
            });
            
            const response = await fetch('/api/list-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    directory: this.charactersDir
                })
            });
            
            if (!response.ok) {
                throw new Error(`获取角色文件列表失败: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '获取文件列表失败');
            }
            
            // 过滤掉.gitkeep文件，只保留.md文件
            const validFiles = (result.files || [])
                .filter(file => file.name !== '.gitkeep' && file.name.endsWith('.md'));
            
            console.log('[FileManager] 有效的角色文件:', validFiles);
            return validFiles;
        } catch (error) {
            console.error('[FileManager] 获取角色文件列表失败:', error);
            throw error;
        }
    }

    /**
     * 加载角色信息
     */
    async loadCharacterProfile(filename) {
        try {
            console.log('[FileManager] 加载角色信息:', filename);
            
            const response = await fetch('/api/load-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename
                })
            });
            
            if (!response.ok) {
                throw new Error(`加载角色信息失败: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '加载角色信息失败');
            }
            
            return result.content;
        } catch (error) {
            console.error('[FileManager] 加载角色信息失败:', error);
            throw error;
        }
    }

    /**
     * 将角色信息转换为Markdown格式
     */
    convertCharacterToMarkdown(profile) {
        return `# ${profile.name || '未知角色'}的修真之路

## 基本信息
- 姓名：${profile.name || '未知'}
- 性别：${profile.gender || '未知'}
- 年龄：${profile.age || '未知'}岁
- 境界：${profile.level || '练气一阶'}
- 真气：${profile.qi || '0/100'}
- 物品：${profile.items?.join(', ') || '无'}

## 修炼属性
- 功法：${profile.cultivation?.method || '未知'}
- 进度：${profile.cultivation?.progress || '初学'}
- 特殊天赋：${profile.cultivation?.special || '无'}

## 背景故事
${profile.background || '暂无记载'}

## 最后更新
${new Date().toLocaleString()}`;
    }

    /**
     * 将故事转换为Markdown格式
     */
    convertStoryToMarkdown(story, characterName) {
        return `# ${characterName}的修炼记录

## 时间
${story.time || new Date().toLocaleString()}

## 场景
${story.scene || ''}

## 行动
${story.action || ''}

${story.dialogue ? `## 对话\n${story.dialogue}` : ''}

## 效果
${story.effect || ''}

## 记录时间
${new Date().toLocaleString()}`;
    }
}

export default FileManager; 