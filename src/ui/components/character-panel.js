export class CharacterPanel {
    constructor() {
        this.elements = {
            name: document.getElementById('mc-name'),
            gender: document.getElementById('mc-gender'),
            age: document.getElementById('mc-age'),
            level: document.getElementById('mc-level'),
            qi: document.getElementById('mc-qi'),
            items: document.getElementById('mc-items')
        };
    }

    updateInfo(characterInfo) {
        console.log('[CharacterPanel] 更新角色信息:', characterInfo);
        
        try {
            if (this.elements.name) this.elements.name.textContent = characterInfo.name || '未定';
            if (this.elements.gender) this.elements.gender.textContent = characterInfo.gender || '未定';
            if (this.elements.age) this.elements.age.textContent = characterInfo.age || '18';
            if (this.elements.level) this.elements.level.textContent = characterInfo.level || '练气一阶';
            if (this.elements.qi) this.elements.qi.textContent = characterInfo.qi || '0/100';
            if (this.elements.items) this.elements.items.textContent = characterInfo.items?.join(', ') || '无';
        } catch (error) {
            console.error('[CharacterPanel] 更新角色信息时出错:', error);
        }
    }
} 