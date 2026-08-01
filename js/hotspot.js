/**
 * 热点中心模块
 * 功能：
 * 1. 展示自动抓取的热点数据（从 hot-topics.json 加载）
 * 2. 支持手动新增/编辑/删除热点
 * 3. 一键导入热点到对应素材库
 * 4. 按平台/类型/时间筛选
 * 5. 高赞评论金句导入金句库
 * 6. 批量管理和操作
 */
const HotspotModule = {
    // 本地存储的热点数据
    data: [],
    // 抓取的远程数据
    remoteData: [],
    // 筛选状态
    filters: { platform: 'all', type: 'all', keyword: '' },

    STORAGE_KEY: 'hotspot_data',

    init: function() {
        // 加载本地存储的热点
        this.data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        // 尝试加载远程抓取数据
        this.loadRemote();
    },

    // 加载自动抓取的热点数据文件
    loadRemote: function() {
        fetch('js/data/hot-topics.json')
            .then(r => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then(json => {
                if (json && json.items) {
                    this.remoteData = json.items;
                    // 合并远程数据到本地（去重）
                    this.mergeRemote(json.items, json.lastUpdate || '');
                    // 只有当前还在热点页面时才重新渲染，避免覆盖其他模块
                    if (typeof currentPage !== 'undefined' && currentPage === 'hotspot') {
                        this.render();
                    }
                }
            })
            .catch(e => {
                console.log('热点抓取数据暂未就绪，使用本地数据');
            });
    },

    // 合并远程数据（去重）
    mergeRemote: function(remoteItems, lastUpdate) {
        let newCount = 0;
        for (const item of remoteItems) {
            // 去重：标题+内容前50字相同则跳过
            const sig = (item.title || '') + (item.content || '').substring(0, 50);
            const exists = this.data.some(d => {
                const dSig = (d.title || '') + (d.content || '').substring(0, 50);
                return dSig === sig;
            });
            if (!exists) {
                item.source = 'auto';
                item.imported = false;
                item.id = item.id || ('hot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
                this.data.unshift(item);
                newCount++;
            }
        }
        if (newCount > 0) {
            this.save();
        }
        this.lastUpdate = lastUpdate;
    },

    save: function() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },

    refresh: function() {
        showToast('正在刷新热点数据...', 'info');
        this.loadRemote();
    },

    // 获取筛选后的数据
    getFiltered: function() {
        let items = this.data;
        if (this.filters.platform !== 'all') {
            items = items.filter(i => (i.platform || '') === this.filters.platform);
        }
        if (this.filters.type !== 'all') {
            items = items.filter(i => (i.category || i.type || '') === this.filters.type);
        }
        if (this.filters.keyword) {
            const kw = this.filters.keyword.toLowerCase();
            items = items.filter(i => {
                return Object.values(i).some(v => v && v.toString().toLowerCase().includes(kw));
            });
        }
        return items;
    },

    // 获取唯一平台列表
    getPlatforms: function() {
        const set = new Set();
        this.data.forEach(d => { if (d.platform) set.add(d.platform); });
        return Array.from(set);
    },

    // 获取唯一类型列表
    getTypes: function() {
        const set = new Set();
        this.data.forEach(d => {
            const t = d.category || d.type;
            if (t) set.add(t);
        });
        return Array.from(set);
    },

    render: function() {
        if (!this.data.length) this.init();
        const content = document.getElementById('contentArea');
        const platforms = this.getPlatforms();
        const types = this.getTypes();
        const items = this.getFiltered();
        const autoCount = this.data.filter(d => d.source === 'auto').length;
        const manualCount = this.data.filter(d => d.source !== 'auto').length;
        const importedCount = this.data.filter(d => d.imported).length;

        let html = `
        <div class="hotspot-module">
            <div class="hs-stats-bar">
                <div class="hs-stat">
                    <span class="hs-stat-num">${this.data.length}</span>
                    <span class="hs-stat-label">热点总数</span>
                </div>
                <div class="hs-stat">
                    <span class="hs-stat-num">${autoCount}</span>
                    <span class="hs-stat-label">自动抓取</span>
                </div>
                <div class="hs-stat">
                    <span class="hs-stat-num">${manualCount}</span>
                    <span class="hs-stat-label">手动录入</span>
                </div>
                <div class="hs-stat">
                    <span class="hs-stat-num">${importedCount}</span>
                    <span class="hs-stat-label">已入库</span>
                </div>
                ${this.lastUpdate ? `<div class="hs-stat"><span class="hs-stat-num" style="font-size:14px;">${this.lastUpdate}</span><span class="hs-stat-label">最近抓取</span></div>` : ''}
            </div>

            <div class="hs-toolbar">
                <div class="search-box">
                    <input type="text" id="hsSearch" placeholder="搜索热点内容..." value="${this.filters.keyword}" oninput="HotspotModule.filters.keyword=this.value; HotspotModule.renderList()">
                </div>
                <select class="filter-select" onchange="HotspotModule.filters.platform=this.value; HotspotModule.renderList()">
                    <option value="all">平台: 全部</option>
                    ${platforms.map(p => `<option value="${p}" ${this.filters.platform===p?'selected':''}>${p}</option>`).join('')}
                </select>
                <select class="filter-select" onchange="HotspotModule.filters.type=this.value; HotspotModule.renderList()">
                    <option value="all">类型: 全部</option>
                    ${types.map(t => `<option value="${t}" ${this.filters.type===t?'selected':''}>${t}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="HotspotModule.openEditor()">+ 手动新增</button>
                <button class="btn btn-secondary" onclick="HotspotModule.refresh()">🔄 刷新抓取</button>
                <button class="btn btn-success" onclick="HotspotModule.batchImport()">📥 批量入库</button>
            </div>

            <div id="hsList"></div>
        </div>`;

        content.innerHTML = html;
        this.renderList();
    },

    renderList: function() {
        const wrap = document.getElementById('hsList');
        if (!wrap) return;
        const items = this.getFiltered();

        if (items.length === 0) {
            wrap.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-light);">
                <div style="font-size:48px;margin-bottom:12px;">🌐</div>
                <div>暂无热点数据</div>
                <div style="font-size:13px;margin-top:8px;">自动抓取每天8:00/20:00更新，也可手动新增</div>
            </div>`;
            return;
        }

        // 分类映射到素材库
        const categoryToLib = {
            '热梗': '热梗素材库',
            '冲突': '冲突素材库',
            '钩子': '钩子素材库',
            '反转': '反转素材库',
            '人设': '人设基因库',
            '场景': '场景库',
            '金句': '金句库',
            '幽默': '幽默素材库',
            '情绪': '情绪库',
            '评论金句': '金句库'
        };

        let html = '<div class="hs-card-list">';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const realIdx = this.data.indexOf(item);
            const targetLib = categoryToLib[item.category || item.type] || '热梗素材库';
            const platformIcon = this.getPlatformIcon(item.platform);
            const heatBar = item.heat ? `<div class="hs-heat"><span class="hs-heat-label">热度</span><div class="hs-heat-bar"><div class="hs-heat-fill" style="width:${Math.min(item.heat, 100)}%"></div></div><span class="hs-heat-val">${item.heat || '—'}</span></div>` : '';

            html += `
            <div class="hs-card ${item.imported ? 'imported' : ''} ${item.source === 'auto' ? 'auto' : 'manual'}">
                <div class="hs-card-header">
                    <span class="hs-platform">${platformIcon} ${item.platform || '未知'}</span>
                    <span class="hs-category">${item.category || item.type || '未分类'}</span>
                    ${item.source === 'auto' ? '<span class="hs-source-badge">🤖 自动</span>' : '<span class="hs-source-badge manual">✍️ 手动</span>'}
                    ${item.imported ? '<span class="hs-imported-badge">✅ 已入库</span>' : ''}
                </div>
                <div class="hs-card-title">${escapeHtml(item.title || '无标题')}</div>
                <div class="hs-card-content">${escapeHtml((item.content || '').substring(0, 200))}${(item.content || '').length > 200 ? '...' : ''}</div>
                ${item.tags && item.tags.length ? `<div class="hs-card-tags">${item.tags.map(t => `<span class="hs-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                ${heatBar}
                ${item.comments && item.comments.length ? `
                <div class="hs-comments">
                    <div class="hs-comments-title">💬 高赞评论 (${item.comments.length})</div>
                    ${item.comments.slice(0, 3).map(c => `
                        <div class="hs-comment">
                            <span class="hs-comment-text">"${escapeHtml(c.text || c.content || '')}"</span>
                            <span class="hs-comment-likes">👍 ${c.likes || 0}</span>
                        </div>
                    `).join('')}
                </div>` : ''}
                <div class="hs-card-footer">
                    <span class="hs-time">${item.time || item.createdAt || ''}</span>
                    <div class="hs-actions">
                        ${!item.imported ? `<button class="btn btn-sm btn-success" onclick="HotspotModule.importToLib(${realIdx}, '${targetLib}')">📥 入库 ${targetLib}</button>` : `<button class="btn btn-sm btn-secondary" onclick="HotspotModule.importToLib(${realIdx}, '${targetLib}')">🔄 重新入库</button>`}
                        <button class="btn btn-sm btn-secondary" onclick="HotspotModule.openEditor(${realIdx})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="HotspotModule.delete(${realIdx})">删除</button>
                    </div>
                </div>
            </div>`;
        }
        html += '</div>';

        // 分页信息
        html += `<div style="text-align:center;padding:16px;color:var(--text-light);font-size:13px;">显示 ${items.length} / ${this.data.length} 条热点</div>`;

        wrap.innerHTML = html;
    },

    getPlatformIcon: function(platform) {
        const icons = {
            '微博': '🔴', '抖音': '🎵', '小红书': '📕', '知乎': '💙',
            '今日头条': '📰', 'B站': '📺', '豆瓣': '🎬', '快手': '⚡',
            '百度': '🔍', '腾讯新闻': '🐧'
        };
        return icons[platform] || '📌';
    },

    // 导入热点到素材库
    importToLib: function(idx, libId) {
        const item = this.data[idx];
        if (!item) return;

        const lib = SCHEMA.getLibrary(libId);
        if (!lib) { showToast('素材库不存在', 'error'); return; }

        // 根据库类型构建字段
        const fields = {};
        fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(libId));

        if (libId === '热梗素材库') {
            fields['类型标签'] = (item.tags || []).map(t => '#' + t).join(' ');
            fields['来源平台'] = item.platform || '';
            fields['核心冲突点'] = item.title || '';
            fields['改编方向'] = item.content || '';
            fields['多平台热度'] = (item.heat || '') + '';
        } else if (libId === '金句库') {
            fields['金句内容'] = item.title || item.content || '';
            fields['类型标签'] = (item.tags || []).map(t => '#' + t).join(' ');
            fields['关联热梗'] = item.platform || '';
        } else if (libId === '冲突素材库') {
            fields['冲突类型'] = item.category || '';
            fields['来源平台'] = item.platform || '';
            fields['核心矛盾'] = item.title || '';
            fields['现实原型'] = item.content || '';
        } else if (libId === '幽默素材库') {
            fields['评论原文'] = item.title || item.content || '';
            fields['核心笑点'] = item.content || '';
            fields['幽默类型'] = item.category || '';
            fields['高频关键词'] = (item.tags || []).join(',');
        } else {
            // 通用映射
            for (const h of lib.headers) {
                if (h === '编号') continue;
                if (h.includes('标签')) fields[h] = (item.tags || []).map(t => '#' + t).join(' ');
                else if (h.includes('平台') || h.includes('来源')) fields[h] = item.platform || '';
                else if (h.includes('内容') || h.includes('原文') || h.includes('方向')) fields[h] = item.content || '';
                else if (h.includes('类型') || h.includes('分类')) fields[h] = item.category || '';
                else fields[h] = '';
            }
        }

        Store.addItem(libId, fields);

        // 如果有高赞评论，导入到金句库
        if (item.comments && item.comments.length && libId !== '金句库') {
            for (const comment of item.comments) {
                if (comment.likes && comment.likes >= 100) {
                    const jjFields = {};
                    jjFields['编号'] = SCHEMA.generateId('JJ', Store.getExistingIds('金句库'));
                    jjFields['金句内容'] = comment.text || comment.content || '';
                    jjFields['类型标签'] = '#高赞评论 #' + (item.platform || '');
                    jjFields['关联热梗'] = item.title || '';
                    Store.addItem('金句库', jjFields);
                }
            }
        }

        // 标记为已入库
        item.imported = true;
        this.save();

        showToast(`已导入到 ${libId}${item.comments && item.comments.length ? '（含' + item.comments.filter(c => c.likes >= 100).length + '条高赞金句）' : ''}`, 'success');
        this.renderList();
        renderNav();
    },

    // 批量导入所有未入库的热点
    batchImport: function() {
        const unimported = this.data.filter(d => !d.imported);
        if (unimported.length === 0) {
            showToast('没有待入库的热点', 'info');
            return;
        }

        if (!confirm(`确定将 ${unimported.length} 条热点批量导入对应素材库吗？`)) return;

        const categoryToLib = {
            '热梗': '热梗素材库', '冲突': '冲突素材库', '钩子': '钩子素材库',
            '反转': '反转素材库', '人设': '人设基因库', '场景': '场景库',
            '金句': '金句库', '幽默': '幽默素材库', '情绪': '情绪库', '评论金句': '金句库'
        };

        let count = 0;
        for (const item of unimported) {
            const libId = categoryToLib[item.category || item.type] || '热梗素材库';
            const idx = this.data.indexOf(item);
            this.importToLib(idx, libId);
            count++;
        }

        showToast(`成功批量导入 ${count} 条热点`, 'success');
        this.render();
        renderNav();
    },

    openEditor: function(idx) {
        const isEdit = idx !== undefined && idx !== null;
        const item = isEdit ? this.data[idx] : {
            title: '', content: '', platform: '', category: '热梗',
            tags: [], heat: 50, source: 'manual', comments: []
        };

        const platforms = ['微博', '抖音', '小红书', '知乎', '今日头条', 'B站', '豆瓣', '快手', '百度', '其他'];
        const categories = ['热梗', '冲突', '钩子', '反转', '人设', '场景', '金句', '幽默', '情绪', '评论金句'];

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = isEdit ? '编辑热点' : '手动新增热点';
        modalBody.innerHTML = `
            <div class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>标题/概要</label>
                        <input type="text" id="hs-title" value="${escapeAttr(item.title || '')}" placeholder="热点标题或概要">
                    </div>
                    <div class="form-group">
                        <label>来源平台</label>
                        <select id="hs-platform">
                            ${platforms.map(p => `<option value="${p}" ${item.platform===p?'selected':''}>${p}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>分类</label>
                        <select id="hs-category">
                            ${categories.map(c => `<option value="${c}" ${item.category===c?'selected':''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>热度值 (0-100)</label>
                        <input type="number" id="hs-heat" value="${item.heat || 50}" min="0" max="100">
                    </div>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>内容详情</label>
                    <textarea id="hs-content" rows="5" placeholder="热点内容、故事梗概、改编方向等">${escapeHtml(item.content || '')}</textarea>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>标签（逗号分隔）</label>
                    <input type="text" id="hs-tags" value="${escapeAttr((item.tags || []).join(', '))}" placeholder="#重生, #复仇, #甜宠">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>高赞评论（每行一条，格式：评论内容 | 点赞数）</label>
                    <textarea id="hs-comments" rows="4" placeholder="如：这句话太绝了 | 5200&#10;每看一次都哭 | 3200">${(item.comments || []).map(c => `${c.text || c.content || ''} | ${c.likes || 0}`).join('\n')}</textarea>
                </div>
            </div>
        `;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="HotspotModule.save(${isEdit ? idx : -1})">${isEdit ? '保存' : '创建'}</button>
        `;
        openModal();
    },

    save: function(idx) {
        const title = document.getElementById('hs-title').value.trim();
        const platform = document.getElementById('hs-platform').value;
        const category = document.getElementById('hs-category').value;
        const heat = parseInt(document.getElementById('hs-heat').value) || 50;
        const content = document.getElementById('hs-content').value.trim();
        const tagsStr = document.getElementById('hs-tags').value.trim();
        const commentsStr = document.getElementById('hs-comments').value.trim();

        if (!title) { showToast('请输入标题', 'warning'); return; }

        const tags = tagsStr ? tagsStr.split(/[,，\s]+/).map(t => t.replace(/^#/, '').trim()).filter(t => t) : [];
        const comments = commentsStr ? commentsStr.split('\n').filter(l => l.trim()).map(line => {
            const parts = line.split('|').map(p => p.trim());
            return { text: parts[0] || '', likes: parseInt(parts[1]) || 0 };
        }) : [];

        const item = {
            id: idx >= 0 ? this.data[idx].id : ('hot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
            title, platform, category, heat, content, tags, comments,
            source: idx >= 0 ? this.data[idx].source : 'manual',
            imported: idx >= 0 ? this.data[idx].imported : false,
            time: idx >= 0 ? this.data[idx].time : new Date().toISOString().slice(0, 16).replace('T', ' '),
            createdAt: idx >= 0 ? this.data[idx].createdAt : new Date().toISOString()
        };

        if (idx >= 0) {
            this.data[idx] = item;
            showToast('热点已更新', 'success');
        } else {
            this.data.unshift(item);
            showToast('热点已创建', 'success');
        }

        this.save();
        closeModal();
        this.render();
        renderNav();
    },

    delete: function(idx) {
        const item = this.data[idx];
        if (!item) return;
        if (confirm(`确定删除 "${item.title}" 吗？`)) {
            this.data.splice(idx, 1);
            this.save();
            showToast('已删除', 'success');
            this.render();
            renderNav();
        }
    },

    // 批量删除已入库的热点
    clearImported: function() {
        const imported = this.data.filter(d => d.imported);
        if (imported.length === 0) { showToast('没有已入库的热点', 'info'); return; }
        if (confirm(`确定清除 ${imported.length} 条已入库热点？（不会影响已导入素材库的数据）`)) {
            this.data = this.data.filter(d => !d.imported);
            this.save();
            showToast('已清除', 'success');
            this.render();
            renderNav();
        }
    }
};
