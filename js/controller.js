/**
 * 故事控制器模块
 * 将所有素材库中的素材通过编号关联，组合成完整故事线
 */
const Controller = {
    // 故事阶段定义
    stages: [
        { id: '起', name: '起', icon: '🌱', desc: '故事开端，引入角色与设定' },
        { id: '承', name: '承', icon: '🌿', desc: '发展铺陈，矛盾逐渐累积' },
        { id: '转', name: '转', icon: '🔄', desc: '转折高潮，反转与爆发' },
        { id: '合', name: '合', icon: '🎯', desc: '收束结局，伏笔回收' }
    ],

    // ============ 渲染控制台 ============
    render: function() {
        const contentArea = document.getElementById('contentArea');
        const storyLines = Store.getStoryLines();

        let html = `
        <div class="dashboard-section">
            <h3>🎮 故事编排控制台</h3>
            <p style="color:var(--text-secondary);margin-bottom:16px;">
                从下方素材库中添加素材到故事线，按"起承转合"四阶段排列，系统将自动检查伏笔链路完整性。
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="Controller.openAddPanel()">+ 添加素材到故事线</button>
                <button class="btn btn-success" onclick="Controller.previewStory()">预览故事大纲</button>
                <button class="btn btn-secondary" onclick="Controller.checkForeshadowing()">检查伏笔链路</button>
                <button class="btn btn-danger" onclick="Controller.clearStoryLine()">清空故事线</button>
            </div>
        </div>
        `;

        // 故事阶段看板
        html += '<div class="controller-board">';
        for (const stage of this.stages) {
            const stageItems = storyLines.filter(item => item.stage === stage.id);
            html += `
            <div class="controller-lane" data-stage="${stage.id}">
                <div class="controller-lane-header">
                    <div class="controller-lane-title">
                        <span class="lane-icon">${stage.icon}</span>
                        ${stage.name} - ${stage.desc}
                    </div>
                    <span style="color:var(--text-light);font-size:12px;">${stageItems.length} 个素材</span>
                </div>
                <div class="controller-cards" data-stage="${stage.id}" ondrop="Controller.handleDrop(event, '${stage.id}')" ondragover="Controller.handleDragOver(event)" ondragleave="Controller.handleDragLeave(event)">
            `;

            for (let i = 0; i < stageItems.length; i++) {
                const item = stageItems[i];
                const ref = Store.findById(item.refId);
                const title = ref ? (ref.item['核心冲突点'] || ref.item['核心矛盾'] || ref.item['核心元素'] || ref.item['角色定位'] || ref.item['金句内容'] || ref.item['场景类型'] || ref.item['评论原文'] || ref.item['表层对话'] || ref.item['核心词汇'] || ref.item['核心情绪'] || ref.item['时空坐标'] || ref.item['主体动作'] || ref.item['风险类型'] || ref.item['反转类型'] || ref.item['冲突类型'] || ref.item['钩子类型'] || item.refId) : item.refId;
                html += `
                    <div class="controller-mini-card" draggable="true" ondragstart="Controller.handleDragStart(event, '${stage.id}', ${i})" onclick="Controller.viewItem('${item.refId}')">
                        <div class="mini-card-id">${item.refId}</div>
                        <div class="mini-card-title">${Controller.escape(title || '未知素材')}</div>
                        ${item.note ? `<div style="font-size:10px;color:var(--text-light);margin-top:4px;">${Controller.escape(item.note)}</div>` : ''}
                        <button class="btn btn-sm" style="margin-top:4px;padding:2px 6px;font-size:10px;color:var(--danger);background:transparent;border:none;" onclick="event.stopPropagation(); Controller.removeFromStage('${stage.id}', ${i})">✕ 移除</button>
                    </div>
                `;
            }

            html += `
                    <button class="controller-add-btn" onclick="Controller.openAddPanel('${stage.id}')">+ 添加</button>
                </div>
            </div>`;
        }
        html += '</div>';

        // 素材关联检查结果区域
        html += `<div id="checkResult" style="margin-top:20px;"></div>`;

        contentArea.innerHTML = html;
    },

    // ============ 打开添加素材面板 ============
    openAddPanel: function(stageId) {
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        // 生成库选择器
        let libOptions = '<option value="">选择素材库...</option>';
        for (const libId of SCHEMA.getLibraryIds()) {
            const lib = SCHEMA.getLibrary(libId);
            libOptions += `<option value="${libId}">${lib.icon} ${libId} (${lib.prefix})</option>`;
        }

        modalTitle.textContent = '添加素材到故事线';
        modalBody.innerHTML = `
            <div class="form-group">
                <label>故事阶段</label>
                <select id="addStage" class="filter-select" style="width:100%;padding:8px;">
                    ${this.stages.map(s => `<option value="${s.id}" ${stageId === s.id ? 'selected' : ''}>${s.icon} ${s.name} - ${s.desc}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>选择素材库</label>
                <select id="addLib" class="filter-select" style="width:100%;padding:8px;" onchange="Controller.loadLibItems()">
                    ${libOptions}
                </select>
            </div>
            <div class="form-group">
                <label>选择素材</label>
                <select id="addItem" class="filter-select" style="width:100%;padding:8px;">
                    <option value="">请先选择素材库</option>
                </select>
            </div>
            <div class="form-group">
                <label>备注（可选）</label>
                <textarea id="addNote" placeholder="此素材在故事中的作用说明..."></textarea>
            </div>
        `;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="Controller.addToStage()">添加到故事线</button>
        `;

        openModal();
    },

    // ============ 加载库条目到选择器 ============
    loadLibItems: function() {
        const libId = document.getElementById('addLib').value;
        const select = document.getElementById('addItem');
        if (!libId) {
            select.innerHTML = '<option value="">请先选择素材库</option>';
            return;
        }

        const items = Store.getItems(libId);
        const lib = SCHEMA.getLibrary(libId);
        const displayFields = lib.displayFields;

        select.innerHTML = '<option value="">选择素材...</option>';
        for (const item of items) {
            const id = item['编号'] || '';
            const title = displayFields.map(f => item[f]).filter(v => v && v !== id).join(' - ');
            select.innerHTML += `<option value="${id}">${id} | ${Controller.escape(title)}</option>`;
        }
    },

    // ============ 添加到故事阶段 ============
    addToStage: function() {
        const stage = document.getElementById('addStage').value;
        const refId = document.getElementById('addItem').value;
        const note = document.getElementById('addNote').value.trim();

        if (!stage || !refId) {
            showToast('请选择故事阶段和素材', 'error');
            return;
        }

        const lines = Store.getStoryLines();
        lines.push({ stage, refId, note, order: lines.length });
        Store.saveStoryLines(lines);

        closeModal();
        showToast('已添加到故事线', 'success');
        this.render();
    },

    // ============ 从阶段移除 ============
    removeFromStage: function(stageId, index) {
        const lines = Store.getStoryLines();
        const stageItems = lines.filter(item => item.stage === stageId);
        if (index >= 0 && index < stageItems.length) {
            const target = stageItems[index];
            const realIdx = lines.indexOf(target);
            if (realIdx >= 0) {
                lines.splice(realIdx, 1);
                Store.saveStoryLines(lines);
                this.render();
            }
        }
    },

    // ============ 拖拽相关 ============
    draggedItem: null,

    handleDragStart: function(event, stageId, index) {
        this.draggedItem = { stageId, index };
        event.target.classList.add('dragging');
    },

    handleDragOver: function(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    },

    handleDragLeave: function(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    handleDrop: function(event, targetStageId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        if (!this.draggedItem) return;

        const lines = Store.getStoryLines();
        const { stageId: fromStage, index } = this.draggedItem;

        // 找到被拖拽的条目
        const fromStageItems = lines.filter(item => item.stage === fromStage);
        if (index < 0 || index >= fromStageItems.length) return;
        const item = fromStageItems[index];
        const realIdx = lines.indexOf(item);

        // 更新阶段
        lines[realIdx].stage = targetStageId;
        Store.saveStoryLines(lines);

        this.draggedItem = null;
        this.render();
    },

    // ============ 查看素材详情 ============
    viewItem: function(refId) {
        const ref = Store.findById(refId);
        if (!ref) {
            showToast('素材不存在', 'error');
            return;
        }

        const lib = SCHEMA.getLibrary(ref.libId);
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = `${lib.icon} ${ref.libId} - ${refId}`;

        let html = '<div style="display:grid;gap:12px;">';
        for (const [field, value] of Object.entries(ref.item)) {
            if (value && value.toString().trim()) {
                html += `
                <div style="display:flex;gap:12px;padding:8px;border-bottom:1px solid var(--border-light);">
                    <div style="min-width:120px;font-weight:600;color:var(--text-secondary);font-size:13px;">${field}</div>
                    <div style="flex:1;font-size:13px;white-space:pre-wrap;word-break:break-all;">${Controller.escape(value)}</div>
                </div>`;
            }
        }
        html += '</div>';

        modalBody.innerHTML = html;
        modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">关闭</button>`;
        openModal();
    },

    // ============ 预览故事大纲 ============
    previewStory: function() {
        const lines = Store.getStoryLines();
        if (lines.length === 0) {
            showToast('故事线为空，请先添加素材', 'warning');
            return;
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '📖 故事大纲预览';

        let html = '<div class="story-preview">';
        for (const stage of this.stages) {
            const stageItems = lines.filter(item => item.stage === stage.id);
            if (stageItems.length === 0) continue;

            html += `<div class="story-section">
                <div class="story-section-title">${stage.icon} ${stage.name}</div>`;

            for (const line of stageItems) {
                const ref = Store.findById(line.refId);
                if (ref) {
                    const lib = SCHEMA.getLibrary(ref.libId);
                    const title = ref.item[lib.displayFields[1]] || ref.item[lib.displayFields[0]] || line.refId;
                    html += `<div style="margin-bottom:12px;">
                        <span class="story-ref">[${line.refId}]</span>
                        <span style="font-weight:600;">${lib.icon} ${ref.libId}:</span>
                        <span>${Controller.escape(title)}</span>
                        ${line.note ? `<div style="margin-left:20px;color:var(--text-secondary);font-size:13px;">📝 ${Controller.escape(line.note)}</div>` : ''}
                    </div>`;
                }
            }
            html += '</div>';
        }
        html += '</div>';

        modalBody.innerHTML = html;
        modalFooter.innerHTML = `<button class="btn btn-secondary" onclick="closeModal()">关闭</button>`;
        openModal();
    },

    // ============ 检查伏笔链路 ============
    checkForeshadowing: function() {
        const lines = Store.getStoryLines();
        const resultDiv = document.getElementById('checkResult');
        if (!resultDiv) return;

        if (lines.length === 0) {
            resultDiv.innerHTML = '<div class="dashboard-section"><p style="color:var(--text-secondary);">故事线为空</p></div>';
            return;
        }

        // 收集所有涉及的素材
        const allItems = [];
        for (const line of lines) {
            const ref = Store.findById(line.refId);
            if (ref) {
                allItems.push({ ...ref, stage: line.stage, note: line.note });
            }
        }

        // 检查伏笔需求与回收
        const foreshadowings = []; // 需要回收的伏笔
        const hooks = []; // 钩子
        const reversals = []; // 反转

        for (const item of allItems) {
            if (item.libId === '钩子素材库') {
                const hookItem = item.item;
                hooks.push({
                    id: hookItem['编号'],
                    type: hookItem['钩子类型'] || '',
                    trigger: hookItem['引爆章节'] || '',
                    cycle: hookItem['回收周期'] || '',
                    stage: item.stage,
                    requirement: hookItem['伏笔要求'] || ''
                });
            }
            if (item.libId === '反转素材库') {
                const revItem = item.item;
                reversals.push({
                    id: revItem['编号'],
                    type: revItem['反转类型'] || '',
                    burst: revItem['爆发章节'] || '',
                    stage: item.stage,
                    clues: revItem['铺垫线索'] || '',
                    truth: revItem['真相揭露'] || ''
                });
            }
            // 检查伏笔需求字段
            for (const [key, val] of Object.entries(item.item)) {
                if (key.includes('伏笔') && val && val.toString().trim()) {
                    foreshadowings.push({
                        lib: item.libId,
                        id: item.item['编号'],
                        field: key,
                        value: val,
                        stage: item.stage
                    });
                }
            }
        }

        // 检查编号关联
        const allIds = allItems.map(i => i.item['编号']);
        const crossRefs = [];
        for (const item of allItems) {
            for (const [key, val] of Object.entries(item.item)) {
                if (val && typeof val === 'string') {
                    const refs = val.match(/[A-Z]{2}-\d{4}-\d{3}/g);
                    if (refs) {
                        for (const ref of refs) {
                            if (ref !== item.item['编号'] && !allIds.includes(ref)) {
                                crossRefs.push({
                                    from: item.item['编号'],
                                    fromLib: item.libId,
                                    field: key,
                                    refId: ref,
                                    status: 'missing'
                                });
                            }
                        }
                    }
                }
            }
        }

        let html = '<div class="dashboard-section"><h3>🔍 伏笔链路检查报告</h3>';

        // 钩子检查
        if (hooks.length > 0) {
            html += '<h4 style="margin:12px 0 8px;color:var(--info);">🪝 钩子回收检查</h4>';
            for (const h of hooks) {
                const status = h.trigger ? '✅ 已设置引爆点' : '⚠️ 未设置引爆章节';
                html += `<div style="padding:8px;margin-bottom:4px;background:var(--bg-input);border-radius:6px;font-size:13px;">
                    <strong>${h.id}</strong> | ${h.type} | 回收周期: ${h.cycle || '未设置'} | ${status}
                    ${h.requirement ? `<br><span style="color:var(--text-secondary);">要求: ${Controller.escape(h.requirement)}</span>` : ''}
                </div>`;
            }
        }

        // 反转检查
        if (reversals.length > 0) {
            html += '<h4 style="margin:12px 0 8px;color:var(--primary);">🔄 反转逻辑检查</h4>';
            for (const r of reversals) {
                html += `<div style="padding:8px;margin-bottom:4px;background:var(--bg-input);border-radius:6px;font-size:13px;">
                    <strong>${r.id}</strong> | ${r.type} | 爆发: ${r.burst || '未设置'}
                    ${r.clues ? `<br><span style="color:var(--text-secondary);">线索: ${Controller.escape(r.clues)}</span>` : ''}
                    ${r.truth ? `<br><span style="color:var(--text-secondary);">真相: ${Controller.escape(r.truth)}</span>` : ''}
                </div>`;
            }
        }

        // 伏笔需求
        if (foreshadowings.length > 0) {
            html += '<h4 style="margin:12px 0 8px;color:var(--warning);">📌 伏笔需求清单</h4>';
            for (const f of foreshadowings) {
                html += `<div style="padding:8px;margin-bottom:4px;background:var(--bg-input);border-radius:6px;font-size:13px;">
                    <strong>${f.id}</strong> [${f.lib}] ${f.field}: ${Controller.escape(f.value)}
                </div>`;
            }
        }

        // 关联检查
        if (crossRefs.length > 0) {
            html += '<h4 style="margin:12px 0 8px;color:var(--danger);">⚠️ 未关联的编号引用</h4>';
            for (const c of crossRefs) {
                html += `<div style="padding:8px;margin-bottom:4px;background:rgba(225,112,85,0.05);border-radius:6px;font-size:13px;">
                    <strong>${c.from}</strong> [${c.fromLib}] → 引用了 <strong>${c.refId}</strong> (字段: ${c.field})，但该素材不在故事线中
                </div>`;
            }
        }

        if (hooks.length === 0 && reversals.length === 0 && foreshadowings.length === 0 && crossRefs.length === 0) {
            html += '<p style="color:var(--text-secondary);">当前故事线暂无伏笔/钩子/反转素材，或所有链路均已正常关联。</p>';
        }

        html += '</div>';
        resultDiv.innerHTML = html;
        showToast('伏笔检查完成', 'success');
    },

    // ============ 清空故事线 ============
    clearStoryLine: function() {
        if (confirm('确定要清空整个故事线吗？此操作不可撤销。')) {
            Store.saveStoryLines([]);
            showToast('故事线已清空', 'success');
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
