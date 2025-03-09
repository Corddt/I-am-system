import { generateContent } from './content-generation.js';

export async function generateCharacterName(generateContent) {
    try {
        const content = await generateContent([{
            role: "system",
            content: `你是一位修真小说角色命名专家。请生成一个符合修真世界特色的角色名字。

要求：
1. 名字必须是2-3个汉字
2. 名字要有修真韵味，适合修真小说背景
3. 名字应当独特且不重复
4. 不要带有任何解释或额外文字

请直接输出一个JSON对象，格式如下：
{
  "name": "你生成的名字"
}`,
        }], true); // 启用JSON格式

        if (!content) {
            // 使用备用名字生成方案
            const defaultNames = ['李青云', '张玄风', '王道心', '陈星河', '林清虚'];
            return defaultNames[Math.floor(Math.random() * defaultNames.length)];
        }

        try {
            const result = JSON.parse(content);
            if (!result.name || typeof result.name !== 'string' ||
                result.name.length < 2 || result.name.length > 3 ||
                !/^[\u4e00-\u9fa5]{2,3}$/.test(result.name)) {
                throw new Error('生成的名字不符合要求');
            }
            return result.name;
        } catch (parseError) {
            console.log('名字格式解析失败，使用默认名字:', parseError);
            return '李青云';
        }
    } catch (error) {
        console.log('生成角色名字失败，使用默认名字:', error);
        return '李青云';
    }
}

export async function generateCharacterProfile(generateContent) {
    try {
        const content = await generateContent([{
            role: "system",
            content: `请生成一个修真小说角色的详细背景设定。要求：
1. 角色信息要完整
2. 要符合修真小说的风格
3. 返回格式为JSON对象，包含以下字段：
   - basic_info: {
       name: 姓名（2-3个汉字）,
       gender: 性别（男/女）,
       age: 年龄（16-30之间）,
       level: 境界（从练气一阶开始）,
       appearance: 相貌描述
   }
   - personality: 性格特征
   - background: 背景故事
   - abilities: 特殊能力或天赋
   - cultivation: {
       method: 修炼功法,
       progress: 修炼进度,
       special: 特殊天赋
   }`,
        }], true); // 设置为true启用JSON格式

        if (!content) {
            // 使用备用角色设定
            return {
                basic_info: {
                    name: '李青云',
                    gender: '男',
                    age: 16,
                    level: '练气一阶',
                    appearance: '面容清秀，眉目如画',
                },
                personality: '性格坚韧，处事沉稳',
                background: '出身山村，偶得传承，立志修仙',
                abilities: '木灵根，擅长木系法术',
                cultivation: {
                    method: '玄阳心经',
                    progress: '初窥门径',
                    special: '木灵根天赋',
                },
            };
        }

        try {
            const profile = JSON.parse(content);
            // 验证必要字段
            const requiredFields = ['basic_info', 'personality', 'background', 'abilities', 'cultivation'];
            const missingFields = requiredFields.filter(field => !profile[field]);

            if (missingFields.length > 0) {
                throw new Error('生成的角色设定不完整，缺少: ' + missingFields.join(', '));
            }

            // 将JSON格式转换为易读的文本格式
            return `# ${profile.basic_info.name}的修真之路

## 基本信息
- 姓名：${profile.basic_info.name}
- 性别：${profile.basic_info.gender}
- 年龄：${profile.basic_info.age}岁
- 境界：${profile.basic_info.level}
- 相貌：${profile.basic_info.appearance}

## 性格特征
${profile.personality}

## 背景故事
${profile.background}

## 特殊能力
${profile.abilities}

## 修炼功法
- 功法：${profile.cultivation.method}
- 进度：${profile.cultivation.progress}
- 特殊天赋：${profile.cultivation.special}`;
        } catch (error) {
            console.log('解析角色设定失败，使用默认设定:', error);
            return `# 李青云的修真之路

## 基本信息
- 姓名：李青云
- 性别：男
- 年龄：16岁
- 境界：练气一阶
- 相貌：面容清秀，眉目如画

## 性格特征
性格坚韧，处事沉稳

## 背景故事
出身山村，偶得传承，立志修仙

## 特殊能力
木灵根，擅长木系法术

## 修炼功法
- 功法：玄阳心经
- 进度：初窥门径
- 特殊天赋：木灵根天赋`;
        }
    } catch (error) {
        console.log('生成角色设定失败，使用默认设定:', error);
        return `# 李青云的修真之路

## 基本信息
- 姓名：李青云
- 性别：男
- 年龄：16岁
- 境界：练气一阶
- 相貌：面容清秀，眉目如画

## 性格特征
性格坚韧，处事沉稳

## 背景故事
出身山村，偶得传承，立志修仙

## 特殊能力
木灵根，擅长木系法术

## 修炼功法
- 功法：玄阳心经
- 进度：初窥门径
- 特殊天赋：木灵根天赋`;
    }
}