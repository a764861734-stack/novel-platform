/**
 * 灵感收纳库模块
 * 记录突发灵感、梦境片段，用起承转合四段式逐步扩写成完整故事
 */
const Inspiration = {

    // 灵感来源类型
    sourceTypes: ['突发奇想', '梦境', '现实经历', '热点衍生', '碎片拼接'],

    // 题材标签
    genreTags: ['都市', '言情', '悬疑', '治愈', '职场', '古言', '校园', '奇幻', '科幻', '现实', '纯爱', '无CP事业文'],

    // 预估篇幅
    lengthOptions: ['片段草稿', '短篇完整故事', '长篇大纲雏形'],

    // 起承转合四段定义
    stages: [
        { id: 'qi', name: '起', icon: '🌱', desc: '开端·铺垫引入', weight: 30,
          fields: [
            { key: 'background', label: '基础背景', hint: '时间、地点、主角身份', type: 'textarea' },
            { key: 'initialState', label: '初始状态', hint: '主角当下在做什么、情绪状态', type: 'textarea' },
            { key: 'trigger', label: '触发事件', hint: '打破平静的那件小事', type: 'textarea' }
          ]
        },
        { id: 'cheng', name: '承', icon: '🌿', desc: '发展·矛盾升级', weight: 20,
          fields: [
            { key: 'protagonistAction', label: '主角行动', hint: '面对开端事件的第一反应', type: 'textarea' },
            { key: 'secondaryCharacters', label: '次要人物登场', hint: '谁介入了、带来什么变数', type: 'textarea' },
            { key: 'minorConflicts', label: '小冲突小阻碍', hint: '接连出现的矛盾', type: 'textarea' },
            { key: 'emotionProgression', label: '情绪递进', hint: '从平静→疑惑→纠结→紧张', type: 'textarea' }
          ]
        },
        { id: 'zhuan', name: '转', icon: '🔄', desc: '转折·高潮突变', weight: 30,
          fields: [
            { key: 'turningPoint', label: '核心转折点', hint: '意料之外的事件', type: 'textarea' },
            { key: 'climax', label: '最高潮场面', hint: '全书/本篇最炸的画面', type: 'textarea' },
            { key: 'characterChoice', label: '人物抉择', hint: '主角被迫做出的关键选择', type: 'textarea' }
          ]
        },
        { id: 'he', name: '合', icon: '🎯', desc: '结局·收尾闭环', weight: 20,
          fields: [
            { key: 'resolution', label: '矛盾解决方式', hint: '问题怎么收场的', type: 'textarea' },
            { key: 'ending', label: '人物结局', hint: '人物最终归宿、心态变化', type: 'textarea' },
            { key: 'closingLine', label: '结尾留白/金句', hint: '最后一句点睛之笔', type: 'textarea' },
            { key: 'sequelPotential', label: '后续延伸', hint: '能拓展续集/支线吗', type: 'textarea' }
          ]
        }
    ],

    // ============ 渲染主界面 ============
    render: function() {
        const contentArea = document.getElementById('contentArea');
        const items = Store.getInspirations();

        let html = `
        <div class="dashboard-section">
            <h3>💡 灵感收纳库</h3>
            <p style="color:var(--text-secondary);margin-bottom:12px;font-size:13px;">
                脑子里突发灵光、做了个梦、走路时想到的小故事——先随手记下来，有空再用「起承转合」慢慢扩写成完整大纲。
            </p>
        </div>
        `;

        // 统计
        const totalProgress = items.length > 0 ? Math.round(items.reduce((s, i) => s + (i.progress || 0), 0) / items.length) : 0;
        const drafts = items.filter(i => (i.progress || 0) < 30).length;
        const developing = items.filter(i => (i.progress || 0) >= 30 && (i.progress || 0) < 100).length;
        const completed = items.filter(i => (i.progress || 0) >= 100).length;

        html += `
        <div class="dashboard" style="margin-bottom:20px;">
            <div class="stat-card" style="border-left-color:var(--primary);">
                <div class="stat-icon">💡</div>
                <div class="stat-value">${items.length}</div>
                <div class="stat-label">灵感总数</div>
            </div>
            <div class="stat-card" style="border-left-color:var(--text-light);">
                <div class="stat-icon">📝</div>
                <div class="stat-value">${drafts}</div>
                <div class="stat-label">纯脑洞待开发</div>
            </div>
            <div class="stat-card" style="border-left-color:var(--warning);">
                <div class="stat-icon">🔧</div>
                <div class="stat-value">${developing}</div>
                <div class="stat-label">扩写中</div>
            </div>
            <div class="stat-card" style="border-left-color:var(--success);">
                <div class="stat-icon">✅</div>
                <div class="stat-value">${completed}</div>
                <div class="stat-label">完稿定稿</div>
            </div>
            <div class="stat-card" style="border-left-color:var(--accent);">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${totalProgress}%</div>
                <div class="stat-label">平均进度</div>
            </div>
        </div>
        `;

        // 筛选和搜索
        html += `
        <div class="table-toolbar">
            <div class="search-box">
                <input type="text" id="inspSearch" placeholder="搜索灵感标题/内容..." oninput="Inspiration.filterList()">
            </div>
            <select class="filter-select" id="inspFilterSource" onchange="Inspiration.filterList()">
                <option value="">全部来源</option>
                ${this.sourceTypes.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-select" id="inspFilterProgress" onchange="Inspiration.filterList()">
                <option value="">全部进度</option>
                <option value="draft">纯脑洞 (&lt;30%)</option>
                <option value="dev">扩写中 (30-99%)</option>
                <option value="done">已完稿 (100%)</option>
            </select>
            <button class="btn btn-primary" onclick="Inspiration.openQuickAdd()">💡 快速记录灵感</button>
            <button class="btn btn-secondary" onclick="Inspiration.openDetailAdd()">📝 新建完整灵感</button>
        </div>
        `;

        // 灵感卡片列表
        html += '<div id="inspList" class="insp-list">';
        if (items.length === 0) {
            html += `
                <div style="text-align:center;padding:60px 20px;color:var(--text-light);">
                    <div style="font-size:48px;margin-bottom:12px;">💡</div>
                    <div style="font-size:16px;margin-bottom:8px;">还没有灵感记录</div>
                    <div style="font-size:13px;">做了个梦？突然想到一个好故事？点「快速记录灵感」先存下来</div>
                </div>
            `;
        } else {
            html += this.renderCardList(items);
        }
        html += '</div>';

        contentArea.innerHTML = html;
    },

    // ============ 渲染卡片列表 ============
    renderCardList: function(items) {
        let html = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const progress = item.progress || 0;
            const progressColor = progress >= 100 ? 'var(--success)' : progress >= 30 ? 'var(--warning)' : 'var(--text-light)';
            const sourceIcon = this.getSourceIcon(item.source);

            // 起承转合完成状态
            const stageStatus = this.stages.map(s => {
                const story = item.story || {};
                const section = story[s.id] || {};
                const filled = s.fields.filter(f => section[f.key] && section[f.key].trim()).length;
                return { ...s, filled, total: s.fields.length, done: filled === s.fields.length };
            });

            html += `
            <div class="insp-card" data-idx="${i}">
                <div class="insp-card-header">
                    <div class="insp-card-title-row">
                        <span class="insp-source-badge" style="background:${progress >= 100 ? 'var(--success)' : 'var(--bg-input)'};">${sourceIcon} ${item.source || '未知'}</span>
                        <span class="insp-card-title" onclick="Inspiration.openDetail(${i})">${this.escape(item.title || '未命名灵感')}</span>
                    </div>
                    <div class="insp-card-meta">
                        ${item.genre ? `<span class="tag tag-blue">${this.escape(item.genre)}</span>` : ''}
                        ${item.estimatedLength ? `<span style="font-size:11px;color:var(--text-light);">${this.escape(item.estimatedLength)}</span>` : ''}
                        <span style="font-size:11px;color:var(--text-light);">${this.escape(item.createdAt || '')}</span>
                    </div>
                </div>
                ${item.brief ? `<div class="insp-card-brief">${this.escape(item.brief)}</div>` : ''}
                <div class="insp-stage-bar">
                    ${stageStatus.map(s => `
                        <span class="insp-stage-dot ${s.done ? 'done' : (s.filled > 0 ? 'partial' : '')}" title="${s.name}: ${s.filled}/${s.total}">
                            ${s.icon}${s.name}
                        </span>
                    `).join('')}
                </div>
                <div class="insp-progress-bar">
                    <div class="insp-progress-fill" style="width:${progress}%;background:${progressColor};"></div>
                    <span class="insp-progress-text">${progress}%</span>
                </div>
                <div class="insp-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="Inspiration.openDetail(${i})">展开编辑</button>
                    <button class="btn btn-sm btn-secondary" onclick="Inspiration.duplicate(${i})">复制</button>
                    <button class="btn btn-sm btn-danger" onclick="Inspiration.delete(${i})">删除</button>
                </div>
            </div>
            `;
        }
        return html;
    },

    // ============ 来源图标 ============
    getSourceIcon: function(source) {
        const map = { '突发奇想': '✨', '梦境': '🌙', '现实经历': '📍', '热点衍生': '🔥', '碎片拼接': '🧩' };
        return map[source] || '💡';
    },

    // ============ 筛选列表 ============
    filterList: function() {
        const keyword = (document.getElementById('inspSearch')?.value || '').toLowerCase();
        const sourceFilter = document.getElementById('inspFilterSource')?.value || '';
        const progressFilter = document.getElementById('inspFilterProgress')?.value || '';

        let items = Store.getInspirations();
        if (keyword) {
            items = items.filter(i => {
                return (i.title || '').toLowerCase().includes(keyword) ||
                       (i.brief || '').toLowerCase().includes(keyword) ||
                       (i.genre || '').toLowerCase().includes(keyword);
            });
        }
        if (sourceFilter) {
            items = items.filter(i => i.source === sourceFilter);
        }
        if (progressFilter) {
            items = items.filter(i => {
                const p = i.progress || 0;
                if (progressFilter === 'draft') return p < 30;
                if (progressFilter === 'dev') return p >= 30 && p < 100;
                if (progressFilter === 'done') return p >= 100;
                return true;
            });
        }

        const listDiv = document.getElementById('inspList');
        if (!listDiv) return;
        if (items.length === 0) {
            listDiv.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);">无匹配结果</div>';
        } else {
            listDiv.innerHTML = this.renderCardList(items);
        }
    },

    // ============ 快速新增（只填标题+来源+一句话） ============
    openQuickAdd: function() {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '💡 快速记录灵感';
        modalBody.innerHTML = `
            <div class="form-group">
                <label>灵感标题 *</label>
                <input type="text" id="quickTitle" placeholder="一句话概括你的脑洞..." style="width:100%;padding:10px;font-size:15px;">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>灵感来源</label>
                    <select id="quickSource" style="width:100%;padding:8px;">
                        ${this.sourceTypes.map(s => `<option value="${s}">${this.getSourceIcon(s)} ${s}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>题材标签</label>
                    <select id="quickGenre" style="width:100%;padding:8px;">
                        <option value="">选择题材...</option>
                        ${this.genreTags.map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>简略想法</label>
                <textarea id="quickBrief" rows="4" placeholder="梦里看到了什么？突然想到什么故事？先随便写几句，不用完整..."></textarea>
            </div>
            <div style="padding:10px;background:var(--bg-input);border-radius:8px;font-size:12px;color:var(--text-secondary);">
                💡 快速记录的灵感进度为0%，先存下来防遗忘。有空了再点「展开编辑」用起承转合慢慢扩写。
            </div>
        `;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="Inspiration.saveQuickAdd()">💾 存下来</button>
        `;
        openModal();
        // 自动聚焦标题
        setTimeout(() => document.getElementById('quickTitle')?.focus(), 100);
    },

    // ============ 保存快速新增 ============
    saveQuickAdd: function() {
        const title = document.getElementById('quickTitle').value.trim();
        if (!title) {
            showToast('请至少填一个标题', 'warning');
            return;
        }

        const now = new Date();
        const ts = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');

        const item = {
            id: 'insp_' + Date.now(),
            title: title,
            source: document.getElementById('quickSource').value,
            genre: document.getElementById('quickGenre').value,
            estimatedLength: '片段草稿',
            brief: document.getElementById('quickBrief').value.trim(),
            createdAt: ts,
            updatedAt: ts,
            progress: 0,
            story: { qi: {}, cheng: {}, zhuan: {}, he: {} },
            linkedMaterials: []
        };

        const items = Store.getInspirations();
        items.unshift(item);
        Store.saveInspirations(items);

        closeModal();
        showToast('灵感已记录，有空记得回来扩写！', 'success');
        this.render();
        renderNav();
    },

    // ============ 新建完整灵感（直接进入详情编辑） ============
    openDetailAdd: function() {
        const now = new Date();
        const ts = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');

        const item = {
            id: 'insp_' + Date.now(),
            title: '',
            source: '突发奇想',
            genre: '',
            estimatedLength: '片段草稿',
            brief: '',
            createdAt: ts,
            updatedAt: ts,
            progress: 0,
            story: { qi: {}, cheng: {}, zhuan: {}, he: {} },
            linkedMaterials: []
        };

        const items = Store.getInspirations();
        items.unshift(item);
        Store.saveInspirations(items);

        this.openDetail(0, true);
    },

    // ============ 打开详情编辑（起承转合） ============
    openDetail: function(idx, isNew) {
        const items = Store.getInspirations();
        const item = items[idx];
        if (!item) return;

        const contentArea = document.getElementById('contentArea');
        const pageTitle = document.getElementById('pageTitle');
        const topActions = document.getElementById('topActions');

        pageTitle.textContent = '💡 灵感收纳库';
        topActions.innerHTML = `<button class="btn btn-secondary" onclick="Inspiration.render()">← 返回列表</button>`;

        let html = `
        <div class="insp-detail">
            <!-- 基础信息区 -->
            <div class="insp-detail-header">
                <div class="insp-detail-title-row">
                    <input type="text" id="detailTitle" value="${this.escapeAttr(item.title || '')}" placeholder="灵感标题..." style="flex:1;font-size:18px;font-weight:700;background:transparent;border:none;border-bottom:2px solid var(--border-light);padding:8px 0;outline:none;color:var(--text-primary);" oninput="Inspiration.markDirty()">
                    <button class="btn btn-sm btn-success" onclick="Inspiration.saveDetail(${idx})">💾 保存</button>
                </div>
                <div class="insp-detail-meta-row">
                    <span style="font-size:12px;color:var(--text-light);">创建: ${this.escape(item.createdAt || '')} | 更新: ${this.escape(item.updatedAt || '')}</span>
                </div>
                <div class="insp-detail-fields">
                    <div class="form-group" style="margin-bottom:8px;">
                        <label style="font-size:12px;">灵感来源</label>
                        <select id="detailSource" style="padding:6px;" onchange="Inspiration.markDirty()">
                            ${this.sourceTypes.map(s => `<option value="${s}" ${item.source === s ? 'selected' : ''}>${this.getSourceIcon(s)} ${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:8px;">
                        <label style="font-size:12px;">题材标签</label>
                        <select id="detailGenre" style="padding:6px;" onchange="Inspiration.markDirty()">
                            <option value="">选择...</option>
                            ${this.genreTags.map(g => `<option value="${g}" ${item.genre === g ? 'selected' : ''}>${g}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:8px;">
                        <label style="font-size:12px;">预估篇幅</label>
                        <select id="detailLength" style="padding:6px;" onchange="Inspiration.markDirty()">
                            ${this.lengthOptions.map(l => `<option value="${l}" ${item.estimatedLength === l ? 'selected' : ''}>${l}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label style="font-size:12px;">简略想法</label>
                    <textarea id="detailBrief" rows="2" placeholder="一句话概括这个灵感..." oninput="Inspiration.markDirty()">${this.escape(item.brief || '')}</textarea>
                </div>
            </div>

            <!-- 进度条 -->
            <div class="insp-detail-progress">
                <div class="insp-progress-bar" style="height:24px;">
                    <div class="insp-progress-fill" id="progressFill" style="width:${item.progress || 0}%;background:${(item.progress||0) >= 100 ? 'var(--success)' : 'var(--warning)'};"></div>
                    <span class="insp-progress-text" id="progressText" style="font-size:13px;font-weight:600;">${item.progress || 0}%</span>
                </div>
                <div style="font-size:11px;color:var(--text-light);margin-top:4px;">
                    起+30% | 承+20% | 转+30% | 合+20% = 100%
                </div>
            </div>
        `;

        // 起承转合四段
        const story = item.story || {};
        for (const stage of this.stages) {
            const section = story[stage.id] || {};
            const filled = stage.fields.filter(f => section[f.key] && section[f.key].trim()).length;
            const stageProgress = stage.total > 0 ? Math.round(filled / stage.fields.length * 100) : 0;

            html += `
            <div class="insp-stage-block" id="stage_${stage.id}">
                <div class="insp-stage-header" onclick="Inspiration.toggleStage('${stage.id}')">
                    <div class="insp-stage-title">
                        <span class="insp-stage-icon">${stage.icon}</span>
                        <span style="font-size:18px;font-weight:700;">${stage.name}</span>
                        <span style="font-size:13px;color:var(--text-secondary);">${stage.desc}</span>
                    </div>
                    <div class="insp-stage-right">
                        <span class="insp-stage-mini-progress">${filled}/${stage.fields.length}</span>
                        <span class="insp-stage-toggle">▼</span>
                    </div>
                </div>
                <div class="insp-stage-body" id="stage_body_${stage.id}">
            `;

            for (const field of stage.fields) {
                const val = section[field.key] || '';
                html += `
                    <div class="form-group">
                        <label>${field.label} <span style="color:var(--text-light);font-size:11px;">${field.hint}</span></label>
                        <textarea id="story_${stage.id}_${field.key}" rows="3" placeholder="${field.hint}..." oninput="Inspiration.markDirty()">${this.escape(val)}</textarea>
                    </div>
                `;
            }

            // 素材关联区
            const materials = (section.materials || []);
            html += `
                    <div class="insp-materials-section">
                        <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;">🔗 关联素材 (${materials.length})</div>
                        <div class="insp-materials-list" id="materials_${stage.id}">
            `;
            for (const mat of materials) {
                const ref = Store.findById(mat.id);
                if (ref && ref.libId && SCHEMA.getLibrary(ref.libId)) {
                    const lib = SCHEMA.getLibrary(ref.libId);
                    const displayFields = lib.displayFields || lib.headers || [];
                    const title = (displayFields[1] && ref.item[displayFields[1]]) || (displayFields[0] && ref.item[displayFields[0]]) || mat.id;
                    html += `<span class="insp-mat-tag" onclick="Controller.viewItem('${mat.id}')">${lib.icon} ${this.escape(title)} <span class="insp-mat-remove" onclick="event.stopPropagation(); Inspiration.removeMaterial(${idx}, '${stage.id}', '${mat.id}')">✕</span></span>`;
                }
            }
            html += `
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="Inspiration.openMaterialPicker(${idx}, '${stage.id}')">+ 添加素材</button>
                    </div>
                </div>
            </div>`;
        }

        // 底部操作
        html += `
            <div class="insp-detail-footer">
                <button class="btn btn-success" onclick="Inspiration.saveDetail(${idx})">💾 保存</button>
                <button class="btn btn-primary" onclick="Inspiration.previewStory(${idx})">📖 预览完整故事</button>
                <button class="btn btn-secondary" onclick="Inspiration.render()">← 返回列表</button>
                ${!isNew ? `<button class="btn btn-danger" onclick="Inspiration.delete(${idx})">🗑 删除</button>` : ''}
            </div>
        </div>`;

        contentArea.innerHTML = html;
        this._dirty = false;
    },

    // ============ 标记已修改 ============
    markDirty: function() {
        this._dirty = true;
        // 实时更新进度
        this.updateProgressDisplay();
    },

    // ============ 实时更新进度显示 ============
    updateProgressDisplay: function() {
        let total = 0;
        for (const stage of this.stages) {
            const filled = stage.fields.filter(f => {
                const el = document.getElementById(`story_${stage.id}_${f.key}`);
                return el && el.value.trim();
            }).length;
            const ratio = filled / stage.fields.length;
            total += ratio * stage.weight;

            // 更新阶段小进度
            const miniEl = document.querySelector(`#stage_${stage.id} .insp-stage-mini-progress`);
            if (miniEl) miniEl.textContent = `${filled}/${stage.fields.length}`;
        }
        total = Math.round(total);
        const fill = document.getElementById('progressFill');
        const text = document.getElementById('progressText');
        if (fill) {
            fill.style.width = total + '%';
            fill.style.background = total >= 100 ? 'var(--success)' : total >= 30 ? 'var(--warning)' : 'var(--text-light)';
        }
        if (text) text.textContent = total + '%';
    },

    // ============ 折叠/展开阶段 ============
    toggleStage: function(stageId) {
        const body = document.getElementById('stage_body_' + stageId);
        if (!body) return;
        const isCollapsed = body.style.display === 'none';
        body.style.display = isCollapsed ? '' : 'none';
        const toggle = document.querySelector(`#stage_${stageId} .insp-stage-toggle`);
        if (toggle) toggle.textContent = isCollapsed ? '▼' : '▶';
    },

    // ============ 保存详情 ============
    saveDetail: function(idx) {
        const items = Store.getInspirations();
        const item = items[idx];
        if (!item) return;

        // 收集基础信息
        item.title = document.getElementById('detailTitle').value.trim();
        item.source = document.getElementById('detailSource').value;
        item.genre = document.getElementById('detailGenre').value;
        item.estimatedLength = document.getElementById('detailLength').value;
        item.brief = document.getElementById('detailBrief').value.trim();

        // 收集起承转合
        if (!item.story) item.story = {};
        let totalProgress = 0;
        for (const stage of this.stages) {
            if (!item.story[stage.id]) item.story[stage.id] = {};
            let filled = 0;
            for (const field of stage.fields) {
                const el = document.getElementById(`story_${stage.id}_${field.key}`);
                if (el) {
                    item.story[stage.id][field.key] = el.value.trim();
                    if (el.value.trim()) filled++;
                }
            }
            const ratio = filled / stage.fields.length;
            totalProgress += ratio * stage.weight;
        }
        item.progress = Math.round(totalProgress);

        // 更新时间
        const now = new Date();
        item.updatedAt = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');

        Store.saveInspirations(items);
        this._dirty = false;
        showToast(`已保存，进度 ${item.progress}%`, 'success');
        renderNav();
    },

    // ============ 预览完整故事 ============
    previewStory: function(idx) {
        // 先保存
        this.saveDetail(idx);

        const items = Store.getInspirations();
        const item = items[idx];
        if (!item) return;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '📖 ' + (item.title || '未命名灵感');

        let html = '<div class="story-preview">';
        for (const stage of this.stages) {
            const section = (item.story || {})[stage.id] || {};
            const hasContent = stage.fields.some(f => section[f.key] && section[f.key].trim());
            if (!hasContent) continue;

            html += `<div class="story-section">
                <div class="story-section-title">${stage.icon} ${stage.name} - ${stage.desc}</div>`;

            for (const field of stage.fields) {
                const val = section[field.key];
                if (val && val.trim()) {
                    html += `<div style="margin-bottom:10px;">
                        <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:2px;">${field.label}</div>
                        <div style="font-size:14px;white-space:pre-wrap;line-height:1.7;">${this.escape(val)}</div>
                    </div>`;
                }
            }

            // 关联素材
            const materials = section.materials || [];
            if (materials.length > 0) {
                html += '<div style="margin-top:8px;font-size:12px;color:var(--text-light);">🔗 关联素材: ';
                for (const mat of materials) {
                    const ref = Store.findById(mat.id);
                    if (ref && ref.libId && SCHEMA.getLibrary(ref.libId)) {
                        const lib = SCHEMA.getLibrary(ref.libId);
                        html += `[${mat.id}] ${lib.icon} ${ref.libId} `;
                    }
                }
                html += '</div>';
            }

            html += '</div>';
        }
        html += '</div>';

        if (item.brief) {
            html = `<div style="padding:12px;background:var(--bg-input);border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--text-secondary);"><strong>简略想法：</strong>${this.escape(item.brief)}</div>` + html;
        }

        html += `<div style="margin-top:16px;padding:8px;background:var(--bg-input);border-radius:8px;text-align:center;font-size:13px;color:var(--text-secondary);">进度: ${item.progress}%</div>`;

        modalBody.innerHTML = html;
        modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">关闭</button>`;
        openModal();
    },

    // ============ 打开素材选择器 ============
    openMaterialPicker: function(idx, stageId) {
        // 先保存当前
        this.saveDetail(idx);

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '🔗 选择关联素材';

        let libOptions = '<option value="">选择素材库...</option>';
        for (const libId of SCHEMA.getLibraryIds()) {
            const lib = SCHEMA.getLibrary(libId);
            libOptions += `<option value="${libId}">${lib.icon} ${libId}</option>`;
        }

        modalBody.innerHTML = `
            <div class="form-group">
                <label>素材库</label>
                <select id="matLib" style="width:100%;padding:8px;" onchange="Inspiration.loadMatItems()">
                    ${libOptions}
                </select>
            </div>
            <div class="form-group">
                <label>素材</label>
                <select id="matItem" style="width:100%;padding:8px;">
                    <option value="">请先选择素材库</option>
                </select>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">选择素材后会自动关联到「${stageId}」阶段</div>
        `;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal(); Inspiration.openDetail(${idx})">取消</button>
            <button class="btn btn-primary" onclick="Inspiration.confirmMaterial(${idx}, '${stageId}')">添加关联</button>
        `;
        openModal();
    },

    // ============ 加载素材到选择器 ============
    loadMatItems: function() {
        const libId = document.getElementById('matLib').value;
        const select = document.getElementById('matItem');
        if (!libId) {
            select.innerHTML = '<option value="">请先选择素材库</option>';
            return;
        }
        const items = Store.getItems(libId);
        const lib = SCHEMA.getLibrary(libId);
        select.innerHTML = '<option value="">选择素材...</option>';
        for (const item of items) {
            const id = item['编号'] || '';
            const title = lib.displayFields.map(f => item[f]).filter(v => v && v !== id).join(' - ');
            select.innerHTML += `<option value="${id}">${id} | ${this.escape(title)}</option>`;
        }
    },

    // ============ 确认添加素材关联 ============
    confirmMaterial: function(idx, stageId) {
        const matId = document.getElementById('matItem').value;
        if (!matId) {
            showToast('请选择素材', 'warning');
            return;
        }

        const items = Store.getInspirations();
        const item = items[idx];
        if (!item.story) item.story = {};
        if (!item.story[stageId]) item.story[stageId] = {};
        if (!item.story[stageId].materials) item.story[stageId].materials = [];

        // 检查是否已关联
        if (item.story[stageId].materials.some(m => m.id === matId)) {
            showToast('该素材已关联', 'warning');
            return;
        }

        item.story[stageId].materials.push({ id: matId });
        Store.saveInspirations(items);
        closeModal();
        showToast('素材已关联', 'success');
        this.openDetail(idx);
    },

    // ============ 移除素材关联 ============
    removeMaterial: function(idx, stageId, matId) {
        const items = Store.getInspirations();
        const item = items[idx];
        if (!item.story || !item.story[stageId] || !item.story[stageId].materials) return;

        item.story[stageId].materials = item.story[stageId].materials.filter(m => m.id !== matId);
        Store.saveInspirations(items);
        this.openDetail(idx);
    },

    // ============ 复制灵感 ============
    duplicate: function(idx) {
        const items = Store.getInspirations();
        const item = items[idx];
        if (!item) return;

        const now = new Date();
        const ts = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0');

        const copy = JSON.parse(JSON.stringify(item));
        copy.id = 'insp_' + Date.now();
        copy.title = (item.title || '') + ' (副本)';
        copy.createdAt = ts;
        copy.updatedAt = ts;
        copy.progress = 0;
        // 清空起承转合内容，只保留结构
        copy.story = { qi: {}, cheng: {}, zhuan: {}, he: {} };

        items.splice(idx + 1, 0, copy);
        Store.saveInspirations(items);
        showToast('已复制（起承转合内容已清空，重新扩写）', 'success');
        this.render();
        renderNav();
    },

    // ============ 删除灵感 ============
    delete: function(idx) {
        const items = Store.getInspirations();
        const item = items[idx];
        if (!item) return;

        if (confirm(`确定删除「${item.title || '未命名灵感'}」吗？\n\n删除后不可恢复，起承转合内容将全部丢失。`)) {
            items.splice(idx, 1);
            Store.saveInspirations(items);
            showToast('已删除', 'success');
            this.render();
            renderNav();
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
    },

    escapeAttr: function(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
