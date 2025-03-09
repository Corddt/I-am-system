class FileManager {
    constructor() {
        this.charactersDir = 'characters';
        this.storiesDir = 'stories';
        console.log('[FileManager] 构造函数被调用，目录设置为:', {
            characters: this.charactersDir,
            stories: this.storiesDir
        });
        this.ensureDirectoriesExist();
    }

    // 确保目录存在
    async ensureDirectoriesExist() {
        try {
            console.log('确保必要目录存在...');
            
            // 创建角色目录
            await this.ensureDirectoryExists(this.charactersDir);
            
            // 创建故事目录
            await this.ensureDirectoryExists(this.storiesDir);
            
            console.log('目录创建成功');
        } catch (error) {
            console.error('创建目录失败:', error);
        }
    }

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
                console.error('[FileManager] 创建目录失败:', result.error);
                throw new Error(`创建目录失败: ${result.error}`);
            }
            
            return result.exists;
        } catch (error) {
            console.error('[FileManager] 确保目录存在时出错:', error);
            throw error;
        }
    }

    // 生成文件名
    generateFileName(characterName, timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${characterName}_${year}${month}${day}_${hour}${minute}${second}`;
    }

    // 保存角色信息
    async saveCharacterProfile(characterName, profile) {
        console.log('[FileManager] 开始保存角色信息:', characterName);
        
        try {
            // 确保角色目录存在
            await this.ensureDirectoryExists(this.charactersDir);
            
            // 生成文件名 - 角色文件使用固定名称
            const filename = `${this.charactersDir}/${characterName}.md`;
            console.log('[FileManager] 保存角色文件:', filename);
            
            // 如果是对象，转换为Markdown格式
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
                throw new Error(result.error);
            }
            
            return { success: true, filename };
        } catch (error) {
            console.error('[FileManager] 保存角色信息失败:', error);
            throw error;
        }
    }

    // 保存故事进展
    async saveStoryProgress(characterName, story) {
        console.log('[FileManager] 开始保存故事进展:', characterName);
        
        try {
            // 确保故事目录存在
            await this.ensureDirectoryExists(this.storiesDir);
            
            // 生成文件名 - 故事文件使用时间戳
            const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
            const filename = `${this.storiesDir}/${characterName}_${timestamp}.md`;
            
            console.log('[FileManager] 保存故事文件:', filename);
            
            // 转换故事为Markdown格式
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

    // 获取所有角色文件
    async getCharacterFiles() {
        try {
            console.log('开始获取角色文件列表...');
            console.log('检查目录:', this.charactersDir);

            // 确保目录存在
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
            console.log('获取到的文件列表:', result);

            if (!result.success) {
                throw new Error(result.error || '获取文件列表失败');
            }

            // 过滤掉.gitkeep文件，只保留.md文件，并按修改时间排序
            const validFiles = (result.files || [])
                .filter(file => file !== '.gitkeep' && file.endsWith('.md'))
                .sort((a, b) => new Date(b.modified) - new Date(a.modified));

            console.log('有效的角色文件:', validFiles);
            return validFiles;
        } catch (error) {
            console.error('获取角色文件列表失败:', error);
            throw error;
        }
    }

    // 加载角色信息
    async loadCharacterProfile(filename) {
        console.log('[FileManager] 开始加载角色信息:', filename);
        
        try {
            const response = await fetch(`/api/load-file?filename=${filename}`);
            
            if (!response.ok) {
                throw new Error(`加载角色信息失败: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[FileManager] 角色加载结果:', result);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return result.content;
        } catch (error) {
            console.error('[FileManager] 加载角色信息失败:', error);
            throw error;
        }
    }

    // 加载故事进展
    async loadStoryProgress(filePath) {
        try {
            const response = await fetch('/api/load-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: filePath
                })
            });
            
            if (!response.ok) {
                throw new Error('加载故事进展失败');
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '加载故事进展失败');
            }
            
            return result.content;
        } catch (error) {
            console.error('加载故事进展失败:', error);
            throw error;
        }
    }

    async loadCharacterList() {
        console.log('[FileManager] 开始加载角色列表');
        
        try {
            // 确保角色目录存在
            await this.ensureDirectoryExists(this.charactersDir);
            
            const response = await fetch(`/api/list-files?directory=${this.charactersDir}`);
            
            if (!response.ok) {
                throw new Error(`获取角色列表失败: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('[FileManager] 角色列表结果:', result);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // 过滤并排序文件
            let files = result.files || [];
            console.log('[FileManager] 原始文件列表:', files);
            
            // 过滤掉.gitkeep文件和非.md文件
            files = files.filter(file => file !== '.gitkeep' && file.endsWith('.md'));
            console.log('[FileManager] 过滤后的文件列表:', files);
            
            // 获取文件的修改时间
            const fileDetails = await Promise.all(files.map(async (file) => {
                try {
                    const statResponse = await fetch(`/api/file-stats?filename=${this.charactersDir}/${file}`);
                    
                    if (!statResponse.ok) {
                        console.warn(`[FileManager] 获取文件 ${file} 的状态失败:`, statResponse.status);
                        return { name: file, mtime: new Date(0) };
                    }
                    
                    const statResult = await statResponse.json();
                    console.log(`[FileManager] 文件 ${file} 的状态:`, statResult);
                    
                    if (!statResult.success) {
                        console.warn(`[FileManager] 获取文件 ${file} 的状态失败:`, statResult.error);
                        return { name: file, mtime: new Date(0) };
                    }
                    
                    return {
                        name: file,
                        mtime: new Date(statResult.stats.mtime)
                    };
                } catch (error) {
                    console.error(`[FileManager] 获取文件 ${file} 的状态时出错:`, error);
                    return { name: file, mtime: new Date(0) };
                }
            }));
            
            console.log('[FileManager] 文件详情:', fileDetails);
            
            // 按修改时间排序，最新的在前面
            fileDetails.sort((a, b) => b.mtime - a.mtime);
            
            const sortedFiles = fileDetails.map(file => ({
                name: file.name,
                path: `${this.charactersDir}/${file.name}`,
                mtime: file.mtime
            }));
            
            console.log('[FileManager] 排序后的文件列表:', sortedFiles);
            return sortedFiles;
        } catch (error) {
            console.error('[FileManager] 加载角色列表失败:', error);
            throw error;
        }
    }
}

export default FileManager;