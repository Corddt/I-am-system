import CONFIG from '../../config/config.js';

export async function validateApiKey(apiKey, isValidated) {
    if (!apiKey) {
        console.warn('API密钥未设置，使用备用生成方案');
        return false;
    }

    if (isValidated) {
        return true;
    }

    try {
        console.log('验证API密钥...');

        const testResponse = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-ai/DeepSeek-R1',
                messages: [{ role: "user", content: "test" }],
                max_tokens: 5
            })
        });

        console.log('API验证响应状态:', testResponse.status);

        if (testResponse.status === 403) {
            console.warn('API密钥无效，使用备用生成方案');
            return false;
        } else if (testResponse.status === 429) {
            console.warn('API请求过于频繁，使用备用生成方案');
            return false;
        } else if (!testResponse.ok) {
            console.warn(`服务器响应错误: ${testResponse.status}，使用备用生成方案`);
            return false;
        }

        isValidated = true;
        console.log('API密钥验证成功');
        return true;
    } catch (error) {
        console.error('API密钥验证出错:', error);
        return false;
    }
}