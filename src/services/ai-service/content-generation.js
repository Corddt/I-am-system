import CONFIG from '../../config/config.js';
import { validateApiKey } from './api-key-validation.js';

export async function generateContent(apiKey, model, messages, useJson = false) {
    try {
        console.log('生成内容，消息数量:', messages.length, '使用JSON格式:', useJson);

        const isValid = await validateApiKey(apiKey);
        if (!isValid) {
            console.warn('API密钥验证失败，使用备用生成方案');
            return null;
        }

        let retries = 2;
        let response = null;

        while (retries >= 0) {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages,
                        stream: false,
                        max_tokens: 1000,
                        temperature: 0.7,
                        top_p: 0.7,
                        top_k: 50,
                        frequency_penalty: 0.5,
                        n: 1,
                        response_format: useJson ? { type: "json_object" } : { type: "text" },
                    }),
                };

                console.log('发送API请求...');
                response = await fetch(CONFIG.API_URL, options);

                if (response.ok) {
                    break;
                } else {
                    console.warn(`API请求失败: ${response.status}，剩余重试次数: ${retries}`);
                    retries--;

                    if (response.status === 429) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else if (response.status === 403) {
                        console.error('API密钥无效，不再重试');
                        break;
                    }
                }
            } catch (fetchError) {
                console.error('API请求出错:', fetchError);
                retries--;
            }
        }

        if (!response || !response.ok) {
            console.warn('API请求最终失败，使用备用生成方案');
            return null;
        }

        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) {
            console.warn('API返回格式无效，使用备用生成方案');
            return null;
        }

        const content = data.choices[0].message.content;
        console.log('API返回内容长度:', content.length);

        if (useJson) {
            try {
                JSON.parse(content);
                return content;
            } catch (jsonError) {
                console.error('API返回的JSON格式无效:', jsonError);

                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        JSON.parse(jsonMatch[0]);
                        console.log('成功修复JSON格式');
                        return jsonMatch[0];
                    } catch (e) {
                        console.error('无法修复JSON格式:', e);
                    }
                }
                return null;
            }
        }

        return content;
    } catch (error) {
        console.error('AI生成内容出错:', error);
        return null;
    }
}