export class ContentGenerator {
    constructor(apiKey, model, apiUrl) {
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = apiUrl;
        this.isValidated = false;
    }

    async validateApiKey() {
        if (!this.apiKey) {
            console.warn('API密钥未设置，使用备用生成方案');
            return false;
        }
    
        if (this.isValidated) {
            return true;
        }
    
        try {
            console.log('验证API密钥...');
            
            const testResponse = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{role: "user", content: "test"}],
                    max_tokens: 5
                })
            });
            
            if (!testResponse.ok) {
                console.warn(`API验证失败: ${testResponse.status}，使用备用生成方案`);
                return false;
            }
    
            this.isValidated = true;
            console.log('API密钥验证成功');
            return true;
        } catch (error) {
            console.error('API密钥验证出错:', error);
            return false;
        }
    }

    async generate(messages, useJson = false) {
        try {
            console.log('生成内容，消息数量:', messages.length, '使用JSON格式:', useJson);
            
            const isValid = await this.validateApiKey();
            if (!isValid) {
                return null;
            }
            
            let retries = 2;
            let response = null;
            
            while (retries >= 0) {
                try {
                    const options = {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: this.model,
                            messages: messages,
                            stream: false,
                            max_tokens: 1000,
                            temperature: 0.7,
                            top_p: 0.7,
                            top_k: 50,
                            frequency_penalty: 0.5,
                            n: 1,
                            response_format: useJson ? { type: "json_object" } : { type: "text" }
                        })
                    };
                    
                    response = await fetch(this.apiUrl, options);
                    
                    if (response.ok) {
                        break;
                    } else {
                        console.warn(`API请求失败: ${response.status}，剩余重试次数: ${retries}`);
                        retries--;
                        
                        if (response.status === 429) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        } else if (response.status === 403) {
                            break;
                        }
                    }
                } catch (error) {
                    console.error('API请求出错:', error);
                    retries--;
                }
            }
            
            if (!response?.ok) {
                return null;
            }
            
            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                return null;
            }
            
            const content = data.choices[0].message.content;
            
            if (useJson) {
                try {
                    JSON.parse(content);
                    return content;
                } catch (error) {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            JSON.parse(jsonMatch[0]);
                            return jsonMatch[0];
                        } catch (e) {
                            return null;
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
} 