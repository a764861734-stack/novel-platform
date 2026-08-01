/**
 * 角色卡模块
 */
const CharModule = {
    // ============ 渲染角色卡列表 ============
    render: function() {
        const items = Store.getItems('角色卡');
        const contentArea = document.getElementById('contentArea');

        let html = `
        <div class="table-toolbar">
            <div class="search-box">
                <input type="text" id="charSearch" placeholder="搜索角色姓名、定位、性格..." oninput="CharModule.filterCards()">
            </div>
            <button class="btn btn-primary" onclick="CharModule.openEditor()">+ 新建角色卡</button>
        </div>
        `;

        if (items.length === 0) {
            html += `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">还没有角色卡，点击"新建角色卡"开始创建</div>
            </div>`;
        } else {
            html += '<div class="char-card-grid" id="charGrid">';
            for (let i = 0; i < items.length; i++) {
                html += this.renderCard(items[i], i);
            }
            html += '</div>';
        }

        contentArea.innerHTML = html;
    },

    // ============ 渲染单张角色卡 ============
    renderCard: function(char, index) {
        const name = char['姓名'] || '未命名角色';
        const role = char['核心定位'] || '';
        const mbti = char['MBTI人格'] || '';
        const occupation = char['表面身份'] || char['职业/身份'] || '';
        const personality = char['表面性格'] || '';
        const id = char['编号'] || `CHAR-${String(index + 1).padStart(3, '0')}`;

        let tagsHtml = '';
        if (mbti) tagsHtml += `<span class="tag tag-purple">${mbti}</span>`;
        if (role) tagsHtml += `<span class="tag tag-blue">${role}</span>`;
        if (char['九型人格']) tagsHtml += `<span class="tag tag-green">${char['九型人格']}</span>`;

        return `
        <div class="char-card" onclick="CharModule.openEditor(${index})">
            <div class="char-card-header">
                <div class="char-id">${id}</div>
                <div class="char-name">${name}</div>
                <div class="char-role">${occupation || role || ''}</div>
            </div>
            <div class="char-card-body">
                <div class="char-info-row">
                    <span class="char-info-label">性格</span>
                    <span class="char-info-value">${personality || '—'}</span>
                </div>
                <div class="char-info-row">
                    <span class="char-info-label">障碍</span>
                    <span class="char-info-value">${char['情感障碍'] || '—'}</span>
                </div>
                <div class="char-info-row">
                    <span class="char-info-label">道具</span>
                    <span class="char-info-value">${char['专属物品'] || char['标志物品'] || '—'}</span>
                </div>
                <div class="char-info-row">
                    <span class="char-info-label">弱点</span>
                    <span class="char-info-value">${char['致命弱点'] || char['致命性缺点'] || '—'}</span>
                </div>
                <div class="char-tags">${tagsHtml}</div>
            </div>
            <div class="char-card-footer">
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); CharModule.openEditor(${index})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); CharModule.deleteCard(${index})">删除</button>
            </div>
        </div>`;
    },

    // ============ 筛选角色卡 ============
    filterCards: function() {
        const keyword = document.getElementById('charSearch').value.toLowerCase();
        const items = Store.getItems('角色卡');
        const filtered = items.filter(item => {
            if (!keyword) return true;
            return Object.values(item).some(v => {
                if (!v) return false;
                return v.toString().toLowerCase().includes(keyword);
            });
        });

        const grid = document.getElementById('charGrid');
        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-text">没有匹配的角色</div></div>';
            return;
        }

        grid.innerHTML = filtered.map((item, i) => {
            const realIndex = items.indexOf(item);
            return this.renderCard(item, realIndex);
        }).join('');
    },

    // ============ 打开编辑器 ============
    openEditor: function(index) {
        const isEdit = index !== undefined && index !== null;
        const items = Store.getItems('角色卡');
        const char = isEdit ? items[index] : {};

        // 按分类分组字段
        const categories = {};
        for (const fieldDef of CHAR_CARD_FIELDS) {
            if (!categories[fieldDef.category]) {
                categories[fieldDef.category] = [];
            }
            categories[fieldDef.category].push(fieldDef);
        }

        let formHtml = '';

        // 基本信息行
        formHtml += `
        <div class="form-row">
            <div class="form-group">
                <label>编号 <span class="field-hint">(自动生成，可手动修改)</span></label>
                <input type="text" id="char_编号" value="${char['编号'] || ''}" placeholder="自动生成">
            </div>
            <div class="form-group">
                <label>姓名 *</label>
                <input type="text" id="char_姓名" value="${this.escape(char['姓名'] || '')}" placeholder="角色姓名">
            </div>
        </div>`;

        // 按分类生成表单
        for (const [category, fields] of Object.entries(categories)) {
            formHtml += `<div class="form-section-title">${category}</div>`;
            for (const fieldDef of fields) {
                const val = char[fieldDef.field] || '';
                const hint = fieldDef.hint ? ` <span class="field-hint">(${fieldDef.hint})</span>` : '';
                if (fieldDef.type === 'textarea') {
                    formHtml += `
                    <div class="form-group">
                        <label>${fieldDef.field}${hint}</label>
                        <textarea id="char_${fieldDef.field}" placeholder="${this.escape(fieldDef.hint || '')}">${this.escape(val)}</textarea>
                    </div>`;
                } else {
                    formHtml += `
                    <div class="form-group">
                        <label>${fieldDef.field}${hint}</label>
                        <input type="text" id="char_${fieldDef.field}" value="${this.escape(val)}" placeholder="${this.escape(fieldDef.hint || '')}">
                    </div>`;
                }
            }
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = isEdit ? '编辑角色卡' : '新建角色卡';
        modalBody.innerHTML = formHtml;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="CharModule.saveCard(${index !== undefined ? index : -1})">${isEdit ? '保存修改' : '创建角色'}</button>
        `;

        openModal();
    },

    // ============ 保存角色卡 ============
    saveCard: function(index) {
        const fields = {};
        // 收集所有字段
        fields['编号'] = document.getElementById('char_编号').value.trim();
        fields['姓名'] = document.getElementById('char_姓名').value.trim();

        if (!fields['姓名']) {
            showToast('请填写角色姓名', 'error');
            return;
        }

        for (const fieldDef of CHAR_CARD_FIELDS) {
            const el = document.getElementById('char_' + fieldDef.field);
            if (el) {
                fields[fieldDef.field] = el.value.trim();
            }
        }

        // 自动生成编号
        if (!fields['编号']) {
            const existing = Store.getItems('角色卡').map(c => c['编号']).filter(id => id);
            let seq = 1;
            let id;
            do {
                id = `CHAR-${String(seq).padStart(3, '0')}`;
                seq++;
            } while (existing.includes(id));
            fields['编号'] = id;
        }

        if (index >= 0) {
            Store.updateItem('角色卡', index, fields);
            showToast('角色卡已更新', 'success');
        } else {
            Store.addItem('角色卡', fields);
            showToast('角色卡已创建', 'success');
        }

        closeModal();
        this.render();
    },

    // ============ 删除角色卡 ============
    deleteCard: function(index) {
        const items = Store.getItems('角色卡');
        const char = items[index];
        if (!char) return;

        if (confirm(`确定要删除角色 "${char['姓名'] || '未命名'}" 吗？`)) {
            Store.deleteItem('角色卡', index);
            showToast('角色卡已删除', 'success');
            this.render();
        }
    },

    // ============ HTML转义 ============
    escape: function(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};
