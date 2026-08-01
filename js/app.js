/**
 * 主应用 - 路由、渲染、交互
 */
let currentPage = 'dashboard';
let currentLib = null;
let tableState = {
    page: 1,
    pageSize: 20,
    sortField: '编号',
    sortDir: 'asc',
    keyword: '',
    filters: {}
};

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', function() {
    // 加载种子数据（内联方式，避免跨域问题）
    loadSeedDataInline();
    Store.init();
    renderNav();
    navigateTo('dashboard');
    // 初始化云端同步
    CloudSync.init();
});

// ============ 内联加载种子数据 ============
function loadSeedDataInline() {
    if (typeof SEED_DATA !== 'undefined') return;

    // 尝试通过 fetch 加载
    fetch('js/data/seed-data.json')
        .then(r => r.text())
        .then(text => {
            window.SEED_DATA = JSON.parse(text);
            Store.data = null; // 重置以重新加载
            Store.init();
            renderNav();
            navigateTo(currentPage);
        })
        .catch(e => {
            console.log('种子数据加载失败，使用空数据启动');
            Store.init();
            renderNav();
            navigateTo(currentPage);
        });
}

// ============ 渲染侧边导航 ============
function renderNav() {
    const navMenu = document.getElementById('navMenu');
    const stats = Store.getStats();

    let html = '';
    for (const section of SCHEMA.nav) {
        html += `<div class="nav-section">`;
        html += `<div class="nav-section-title">${section.section}</div>`;
        for (const item of section.items) {
            const count = stats[item.id] || 0;
            const countBadge = count > 0 ? `<span class="nav-badge">${count}</span>` : '';
            const customBadge = item.badge ? `<span class="nav-badge nav-badge-custom">${item.badge}</span>` : '';
            const badge = customBadge || countBadge;
            const active = currentPage === item.id ? 'active' : '';
            html += `<div class="nav-item ${active}" onclick="navigateTo('${item.id}')">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.name}</span>
                ${badge}
            </div>`;
        }
        html += `</div>`;
    }
    navMenu.innerHTML = html;
    
    // 滚动提示
    setTimeout(() => {
        const menu = document.getElementById('navMenu');
        if (!menu) return;
        const hasScroll = menu.scrollHeight > menu.clientHeight;
        if (hasScroll && !menu.querySelector('.nav-scroll-hint')) {
            menu.classList.add('can-scroll');
            const hint = document.createElement('div');
            hint.className = 'nav-scroll-hint';
            hint.innerHTML = '↓ 向下滚动查看更多';
            menu.appendChild(hint);
        }
    }, 50);
}

// ============ 页面路由 ============
function navigateTo(pageId) {
    currentPage = pageId;
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    const topActions = document.getElementById('topActions');

    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    for (const item of navItems) {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${pageId}'`)) {
            item.classList.add('active');
        }
    }

    // 重置表格状态
    tableState = { page: 1, pageSize: 20, sortField: '编号', sortDir: 'asc', keyword: '', filters: {} };

    // 路由
    if (pageId === 'dashboard') {
        pageTitle.textContent = '控制台';
        topActions.innerHTML = '';
        renderDashboard();
    } else if (pageId === 'parser') {
        pageTitle.textContent = '智能解析';
        topActions.innerHTML = '';
        renderParser();
    } else if (pageId === 'characters') {
        pageTitle.textContent = '角色卡';
        topActions.innerHTML = '<button class="btn btn-primary" onclick="CharModule.openEditor()">+ 新建角色卡</button>';
        CharModule.render();
    } else if (pageId === 'controller') {
        pageTitle.textContent = '故事控制器';
        topActions.innerHTML = '';
        Controller.render();
    } else if (pageId === 'inspiration') {
        pageTitle.textContent = '💡 灵感收纳库';
        topActions.innerHTML = `<button class="btn btn-primary" onclick="Inspiration.openQuickAdd()">💡 快速记录</button><button class="btn btn-secondary" onclick="Inspiration.openDetailAdd()">📝 新建完整</button>`;
        Inspiration.render();
    } else if (SCHEMA.libraries[pageId]) {
        const lib = SCHEMA.getLibrary(pageId);
        pageTitle.textContent = `${lib.icon} ${pageId}`;
        topActions.innerHTML = `<button class="btn btn-primary" onclick="openItemEditor('${pageId}')">+ 新增条目</button>`;
        currentLib = pageId;
        renderLibraryTable(pageId);
    } else if (pageId === 'daily') {
        pageTitle.textContent = '⏰ 每日工作台';
        topActions.innerHTML = '';
        DailyModule.render();
    } else if (pageId === 'chapter-check') {
        pageTitle.textContent = '✅ 章节质量检查';
        topActions.innerHTML = '';
        ChapterCheckModule.render();
    } else if (pageId === 'analysis') {
        pageTitle.textContent = '🔬 拆文分析';
        topActions.innerHTML = '';
        AnalysisModule.render();
    } else if (pageId === 'maintenance') {
        pageTitle.textContent = '🔧 素材库维护';
        topActions.innerHTML = '';
        MaintenanceModule.render();
    } else if (pageId === 'projects') {
        pageTitle.textContent = '📁 项目管理';
        topActions.innerHTML = '';
        ProjectModule.render();
    } else if (pageId === 'revenue') {
        pageTitle.textContent = '💰 收益计算器';
        topActions.innerHTML = '';
        RevenueModule.render();
    } else if (pageId === 'hotspot') {
        pageTitle.textContent = '🌐 热点中心';
        topActions.innerHTML = `<button class="btn btn-primary" onclick="HotspotModule.openEditor()">+ 手动新增热点</button><button class="btn btn-secondary" onclick="HotspotModule.refresh()" ${HotspotModule._loading?'disabled':''}>🔄 刷新热点数据</button>`;
        HotspotModule.render();
    } else if (pageId === '扫榜') {
        pageTitle.textContent = '📈 扫榜数据';
        topActions.innerHTML = `<button class="btn btn-primary" onclick="openScanEditor()">+ 新增扫榜记录</button><button class="btn btn-secondary" onclick="batchImportScan()">批量导入</button>`;
        renderScanTable();
    } else if (pageId === '大纲') {
        pageTitle.textContent = '📋 大纲管理';
        topActions.innerHTML = `<button class="btn btn-primary" onclick="openOutlineEditor()">+ 新增大纲条目</button>`;
        renderOutlineTable();
    }

    // 关闭移动端侧边栏
    document.querySelector('.sidebar').classList.remove('open');
}

// ============ 渲染控制台 ============
function renderDashboard() {
    const contentArea = document.getElementById('contentArea');
    const stats = Store.getStats();

    let html = `
    <div class="dashboard">
        <div class="stat-card" style="border-left-color:var(--primary);" onclick="navigateTo('parser')">
            <div class="stat-icon">🤖</div>
            <div class="stat-value">智能解析</div>
            <div class="stat-label">粘贴文字自动入库</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--accent);" onclick="navigateTo('characters')">
            <div class="stat-icon">👤</div>
            <div class="stat-value">${stats['角色卡'] || 0}</div>
            <div class="stat-label">角色卡</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--success);" onclick="navigateTo('controller')">
            <div class="stat-icon">🎮</div>
            <div class="stat-value">${(Store.getStoryLines() || []).length}</div>
            <div class="stat-label">故事线素材</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--accent);" onclick="navigateTo('inspiration')">
            <div class="stat-icon">💡</div>
            <div class="stat-value">${(Store.getInspirations() || []).length}</div>
            <div class="stat-label">灵感收纳</div>
        </div>
        <div class="stat-card" style="border-left-color:var(--info);">
            <div class="stat-icon">📚</div>
            <div class="stat-value">${stats['总计'] || 0}</div>
            <div class="stat-label">素材总量</div>
        </div>
    </div>
    `;

    // 各库统计卡片
    html += '<div class="dashboard-section"><h3>📚 素材库概览</h3><div class="dashboard">';
    for (const libId of SCHEMA.getLibraryIds()) {
        const lib = SCHEMA.getLibrary(libId);
        const count = stats[libId] || 0;
        html += `<div class="stat-card" onclick="navigateTo('${libId}')">
            <div class="stat-icon">${lib.icon}</div>
            <div class="stat-value">${count}</div>
            <div class="stat-label">${libId}</div>
        </div>`;
    }
    html += '</div></div>';

    // 最近添加
    html += '<div class="dashboard-section"><h3>⏰ 快捷操作</h3>';
    html += '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
    html += '<button class="btn btn-primary btn-lg" onclick="navigateTo(\'parser\')">🤖 智能解析入库</button>';
    html += '<button class="btn btn-success btn-lg" onclick="navigateTo(\'characters\')">👤 创建角色卡</button>';
    html += '<button class="btn btn-secondary btn-lg" onclick="navigateTo(\'controller\')">🎮 故事编排</button>';
    html += '</div>';
    html += '</div>';

    // 创作工作台快捷入口
    html += '<div class="dashboard-section"><h3>🛠️ 创作工作台</h3><div class="dashboard">';
    html += '<div class="stat-card" style="border-left-color:var(--warning);" onclick="navigateTo(\'daily\')"><div class="stat-icon">⏰</div><div class="stat-value">每日工作台</div><div class="stat-label">时间轴打卡</div></div>';
    html += '<div class="stat-card" style="border-left-color:var(--danger);" onclick="navigateTo(\'chapter-check\')"><div class="stat-icon">✅</div><div class="stat-value">章节质检</div><div class="stat-label">情绪/元素检查</div></div>';
    html += '<div class="stat-card" style="border-left-color:var(--info);" onclick="navigateTo(\'analysis\')"><div class="stat-icon">🔬</div><div class="stat-value">拆文分析</div><div class="stat-label">起承转合拆解</div></div>';
    html += '<div class="stat-card" style="border-left-color:var(--success);" onclick="navigateTo(\'maintenance\')"><div class="stat-icon">🔧</div><div class="stat-value">素材库维护</div><div class="stat-label">日/周/月任务</div></div>';
    html += '<div class="stat-card" style="border-left-color:var(--accent);" onclick="navigateTo(\'projects\')"><div class="stat-icon">📁</div><div class="stat-value">项目管理</div><div class="stat-label">伏笔/角色追踪</div></div>';
    html += '<div class="stat-card" style="border-left-color:var(--primary-dark);" onclick="navigateTo(\'revenue\')"><div class="stat-icon">💰</div><div class="stat-value">收益计算</div><div class="stat-label">收入预测</div></div>';
    html += '</div></div>';

    contentArea.innerHTML = html;
}

// ============ 渲染素材库表格 ============
function renderLibraryTable(libId) {
    const lib = SCHEMA.getLibrary(libId);
    const contentArea = document.getElementById('contentArea');

    let html = '<div class="table-toolbar">';

    // 搜索框
    html += `<div class="search-box">
        <input type="text" id="tableSearch" placeholder="搜索${libId}..." value="${tableState.keyword}" oninput="tableState.keyword=this.value; tableState.page=1; renderTableBody('${libId}')">
    </div>`;

    // 筛选器
    for (const filterField of (lib.filterFields || [])) {
        const values = getUniqueValues(libId, filterField);
        if (values.length > 1) {
            html += `<select class="filter-select" onchange="tableState.filters['${filterField}']=this.value; tableState.page=1; renderTableBody('${libId}')">
                <option value="all">${filterField}: 全部</option>`;
            for (const v of values) {
                html += `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`;
            }
            html += `</select>`;
        }
    }

    html += `<button class="btn btn-primary" onclick="openItemEditor('${libId}')">+ 新增</button>`;
    html += '</div>';

    // 表格容器
    html += `<div class="data-table-wrap" id="tableWrap"></div>`;

    contentArea.innerHTML = html;
    renderTableBody(libId);
}

// ============ 渲染表格内容 ============
function renderTableBody(libId) {
    const lib = SCHEMA.getLibrary(libId);
    const wrap = document.getElementById('tableWrap');
    if (!wrap) return;

    // 获取筛选后的数据
    const filters = {};
    for (const [k, v] of Object.entries(tableState.filters)) {
        if (v && v !== 'all') filters[k] = v;
    }

    let items = Store.searchItems(libId, tableState.keyword, filters);

    // 排序
    const sortField = tableState.sortField;
    items.sort((a, b) => {
        const av = (a[sortField] || '').toString();
        const bv = (b[sortField] || '').toString();
        if (tableState.sortDir === 'asc') {
            return av.localeCompare(bv, 'zh');
        }
        return bv.localeCompare(av, 'zh');
    });

    const displayFields = lib.displayFields || lib.headers;
    const total = items.length;
    const totalPages = Math.ceil(total / tableState.pageSize);
    const start = (tableState.page - 1) * tableState.pageSize;
    const pageItems = items.slice(start, start + tableState.pageSize);

    let html = '<table class="data-table"><thead><tr>';
    // 编号列
    html += `<th onclick="setSort('${libId}','编号')" class="${tableState.sortField==='编号'?'sorted':''}">
        编号 <span class="sort-icon">${tableState.sortField==='编号'?(tableState.sortDir==='asc'?'↑':'↓'):'↕'}</span>
    </th>`;
    // 显示字段
    for (const field of displayFields) {
        if (field === '编号') continue;
        html += `<th onclick="setSort('${libId}','${field}')" class="${tableState.sortField===field?'sorted':''}">
            ${field} <span class="sort-icon">${tableState.sortField===field?(tableState.sortDir==='asc'?'↑':'↓'):'↕'}</span>
        </th>`;
    }
    html += '<th>操作</th></tr></thead><tbody>';

    if (pageItems.length === 0) {
        html += `<tr><td colspan="${displayFields.length + 2}" style="text-align:center;padding:40px;color:var(--text-light);">暂无数据</td></tr>`;
    } else {
        for (let i = 0; i < pageItems.length; i++) {
            const item = pageItems[i];
            const realIndex = Store.getItems(libId).indexOf(item);
            html += '<tr>';
            html += `<td class="id-cell">${escapeHtml(item['编号'] || '')}</td>`;
            for (const field of displayFields) {
                if (field === '编号') continue;
                let val = item[field] || '';
                if (val.length > 60) val = val.substring(0, 60) + '...';
                // 标签特殊处理
                if (field.includes('标签') && val) {
                    const tags = val.split(/[#\s]+/).filter(t => t);
                    val = tags.map(t => `<span class="tag ${lib.color}">${escapeHtml(t)}</span>`).join('');
                }
                html += `<td title="${escapeAttr(item[field] || '')}">${typeof val === 'string' && val.includes('<span') ? val : escapeHtml(val)}</td>`;
            }
            html += `<td class="actions-cell">
                <button class="btn-edit" onclick="openItemEditor('${libId}', ${realIndex})">编辑</button>
                <button class="btn-delete" onclick="deleteItem('${libId}', ${realIndex})">删除</button>
            </td>`;
            html += '</tr>';
        }
    }

    html += '</tbody></table>';

    // 分页
    html += `<div class="table-footer">
        <span>共 ${total} 条，第 ${tableState.page}/${Math.max(totalPages,1)} 页</span>
        <div class="pagination">
            <button ${tableState.page<=1?'disabled':''} onclick="tableState.page=1; renderTableBody('${libId}')">首页</button>
            <button ${tableState.page<=1?'disabled':''} onclick="tableState.page--; renderTableBody('${libId}')">上一页</button>
            <button ${tableState.page>=totalPages?'disabled':''} onclick="tableState.page++; renderTableBody('${libId}')">下一页</button>
            <button ${tableState.page>=totalPages?'disabled':''} onclick="tableState.page=totalPages; renderTableBody('${libId}')">末页</button>
        </div>
    </div>`;

    wrap.innerHTML = html;
}

// ============ 设置排序 ============
function setSort(libId, field) {
    if (tableState.sortField === field) {
        tableState.sortDir = tableState.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
        tableState.sortField = field;
        tableState.sortDir = 'asc';
    }
    renderTableBody(libId);
}

// ============ 获取唯一值（用于筛选器） ============
function getUniqueValues(libId, field) {
    const items = Store.getItems(libId);
    const values = new Set();
    for (const item of items) {
        const val = item[field];
        if (val && val.toString().trim()) {
            // 对于标签字段，按#分割
            if (field.includes('标签') && val.includes('#')) {
                val.split('#').forEach(v => {
                    v = v.trim();
                    if (v) values.add(v);
                });
            } else {
                values.add(val.toString().trim());
            }
        }
    }
    return Array.from(values).sort();
}

// ============ 打开条目编辑器 ============
function openItemEditor(libId, index) {
    const lib = SCHEMA.getLibrary(libId);
    const isEdit = index !== undefined && index !== null;
    const items = Store.getItems(libId);
    const item = isEdit ? items[index] : {};

    let formHtml = '';

    // 按2列布局生成表单
    const headers = lib.headers;
    for (let i = 0; i < headers.length; i++) {
        const field = headers[i];
        const val = item[field] || '';

        if (i % 2 === 0 && i + 1 < headers.length) {
            // 开始新行
            formHtml += '<div class="form-row">';
            formHtml += renderField(field, val);
            formHtml += renderField(headers[i + 1], item[headers[i + 1]] || '');
            formHtml += '</div>';
            i++; // 跳过下一个
        } else {
            formHtml += renderField(field, val, true);
        }
    }

    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = `${lib.icon} ${isEdit ? '编辑' : '新增'} - ${libId}`;
    modalBody.innerHTML = formHtml;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveItem('${libId}', ${index !== undefined ? index : -1})">${isEdit ? '保存' : '创建'}</button>
    `;

    openModal();
}

function renderField(field, val, fullwidth) {
    const isLong = val && val.length > 50;
    const isTextarea = isLong || field.includes('方向') || field.includes('伏笔') || field.includes('设计') || field.includes('案例') || field.includes('内容') || field.includes('原文') || field.includes('对话') || field.includes('要求');
    const width = fullwidth ? '' : '';
    return `<div class="form-group" ${fullwidth ? 'style="grid-column:1/-1;"' : ''}>
        <label>${field}</label>
        ${isTextarea ?
            `<textarea id="field_${field}">${escapeHtml(val)}</textarea>` :
            `<input type="text" id="field_${field}" value="${escapeAttr(val)}">`
        }
    </div>`;
}

// ============ 保存条目 ============
function saveItem(libId, index) {
    const lib = SCHEMA.getLibrary(libId);
    const fields = {};

    for (const header of lib.headers) {
        const el = document.getElementById('field_' + header);
        if (el) {
            fields[header] = el.value.trim();
        }
    }

    // 编号处理
    if (!fields['编号']) {
        fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(libId));
    }

    if (index >= 0) {
        Store.updateItem(libId, index, fields);
        showToast('已更新', 'success');
    } else {
        Store.addItem(libId, fields);
        showToast('已创建', 'success');
    }

    closeModal();
    renderTableBody(libId);
    renderNav(); // 更新计数
}

// ============ 删除条目 ============
function deleteItem(libId, index) {
    const items = Store.getItems(libId);
    const item = items[index];
    if (!item) return;

    if (confirm(`确定要删除 "${item['编号']}" 吗？`)) {
        Store.deleteItem(libId, index);
        showToast('已删除', 'success');
        renderTableBody(libId);
        renderNav();
    }
}

// ============================================
// 智能解析器 UI
// ============================================
function renderParser() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <div class="dashboard-section" style="margin-bottom:16px;">
        <h3>🤖 智能文本解析</h3>
        <p style="color:var(--text-secondary);font-size:13px;">
            粘贴一段文字（素材描述、分析笔记等），系统会自动识别内容类型并拆分字段，填入对应的素材库。
            <br>支持格式：<code>字段名：值</code>（每行一个字段），也支持自由文本（系统自动推断）。
        </p>
    </div>
    <div class="parser-container">
        <div class="parser-input-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <label style="font-weight:600;font-size:14px;">输入文本</label>
                <div style="display:flex;gap:8px;">
                    <select id="manualLibSelect" class="filter-select" style="font-size:12px;">
                        <option value="">自动识别</option>
                        ${SCHEMA.getLibraryIds().map(id => {
                            const lib = SCHEMA.getLibrary(id);
                            return `<option value="${id}">${lib.icon} ${id}</option>`;
                        }).join('')}
                    </select>
                </div>
            </div>
            <textarea class="parser-textarea" id="parserInput" placeholder="在此粘贴文字...&#10;&#10;支持两种格式：&#10;&#10;1. 结构化格式（推荐）：&#10;类型标签：#契约婚姻 #非遗传承&#10;来源平台：抖音/快手&#10;核心冲突点：协议婚姻暴露引发继承危机&#10;改编方向：女主为守护古琴工坊与传承人假结婚&#10;甜虐指数：甜60%虐40%&#10;&#10;2. 自由文本格式：&#10;直接粘贴素材内容，系统会自动识别类型并提取关键字段"></textarea>
            <div class="parser-controls">
                <button class="btn btn-primary" onclick="runParser()">🔍 解析文本</button>
                <button class="btn btn-secondary" onclick="document.getElementById('parserInput').value=''; document.getElementById('parserOutput').innerHTML=getParserEmptyHtml();">清空</button>
                <span style="font-size:12px;color:var(--text-light);margin-left:auto;" id="parseStatus"></span>
            </div>
        </div>
        <div class="parser-output-section" id="parserOutput">
            ${getParserEmptyHtml()}
        </div>
    </div>
    `;
}

function getParserEmptyHtml() {
    return `<div class="parser-empty">
        <div class="empty-icon">📋</div>
        <div>解析结果将显示在这里</div>
        <div style="font-size:12px;margin-top:8px;">粘贴文字后点击"解析文本"</div>
    </div>`;
}

// ============ 执行解析 ============
function runParser() {
    const text = document.getElementById('parserInput').value;
    const manualLib = document.getElementById('manualLibSelect').value;
    const output = document.getElementById('parserOutput');
    const status = document.getElementById('parseStatus');

    if (!text.trim()) {
        showToast('请先粘贴文字', 'warning');
        return;
    }

    status.textContent = '解析中...';

    let results;

    if (manualLib) {
        // 手动指定库类型
        const parsed = Parser.parse(text);
        if (parsed.results.length > 0) {
            results = parsed.results.map(r => ({
                library: manualLib,
                fields: Parser.normalizeFields(manualLib, r.fields)
            }));
        } else {
            results = [{
                library: manualLib,
                fields: Parser.normalizeFields(manualLib, Parser.extractFromFreeText(text, manualLib)?.fields || {})
            }];
        }
    } else {
        // 自动识别
        const parsed = Parser.parse(text);
        results = parsed.results.map(r => ({
            library: r.library,
            fields: Parser.normalizeFields(r.library, r.fields)
        }));
    }

    if (results.length === 0) {
        output.innerHTML = `<div class="parser-empty"><div class="empty-icon">❓</div><div>无法识别内容类型，请尝试手动选择素材库</div></div>`;
        status.textContent = '';
        return;
    }

    status.textContent = `识别到 ${results.length} 条素材`;

    // 渲染解析结果
    let html = '';
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const lib = SCHEMA.getLibrary(result.library);

        html += `<div class="parser-result-card">
            <div class="result-header">
                <span class="result-type">${lib.icon} ${result.library}</span>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-sm btn-secondary" onclick="editParseResult(${i})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="removeParseResult(${i})">移除</button>
                </div>
            </div>
            <div class="result-fields" id="parseResult_${i}">
                <input type="hidden" id="result_lib_${i}" value="${result.library}">`;

        // 渲染每个字段
        for (const field of lib.headers) {
            const val = result.fields[field] || '';
            const isLong = val.length > 40 || field.includes('方向') || field.includes('伏笔') || field.includes('设计') || field.includes('内容') || field.includes('原文');
            html += `<div class="result-field">
                <div class="result-field-label">${field}</div>
                <div class="result-field-value">
                    ${isLong ?
                        `<textarea id="result_${i}_${field}" rows="2">${escapeHtml(val)}</textarea>` :
                        `<input type="text" id="result_${i}_${field}" value="${escapeAttr(val)}">`
                    }
                </div>
            </div>`;
        }

        html += `</div></div>`;
    }

    // 保存按钮
    html += `<div style="margin-top:16px;text-align:center;">
        <button class="btn btn-primary btn-lg" onclick="saveParsedResults()">💾 全部保存入库</button>
    </div>`;

    output.innerHTML = html;

    // 存储当前解析结果
    window._parsedResults = results;
}

// ============ 编辑解析结果（切换库类型） ============
function editParseResult(index) {
    const currentLib = document.getElementById('result_lib_' + index).value;
    const newLib = prompt('选择素材库（输入库名）：\n' + SCHEMA.getLibraryIds().join('\n'), currentLib);
    if (!newLib || newLib === currentLib) return;

    if (!SCHEMA.libraries[newLib]) {
        showToast('无效的库名', 'error');
        return;
    }

    // 收集当前值
    const oldLib = SCHEMA.getLibrary(currentLib);
    const oldFields = {};
    for (const h of oldLib.headers) {
        const el = document.getElementById('result_' + index + '_' + h);
        if (el) oldFields[h] = el.value;
    }

    // 转换到新库
    const newFields = Parser.normalizeFields(newLib, oldFields);
    window._parsedResults[index] = { library: newLib, fields: newFields };

    // 重新渲染该卡片
    rerenderParseResults();
}

// ============ 移除解析结果 ============
function removeParseResult(index) {
    if (!window._parsedResults) return;
    window._parsedResults.splice(index, 1);
    rerenderParseResults();
}

// ============ 重新渲染解析结果 ============
function rerenderParseResults() {
    const output = document.getElementById('parserOutput');
    const results = window._parsedResults || [];

    if (results.length === 0) {
        output.innerHTML = getParserEmptyHtml();
        document.getElementById('parseStatus').textContent = '';
        return;
    }

    document.getElementById('parseStatus').textContent = `识别到 ${results.length} 条素材`;

    let html = '';
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const lib = SCHEMA.getLibrary(result.library);

        html += `<div class="parser-result-card">
            <div class="result-header">
                <span class="result-type">${lib.icon} ${result.library}</span>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-sm btn-secondary" onclick="editParseResult(${i})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="removeParseResult(${i})">移除</button>
                </div>
            </div>
            <div class="result-fields" id="parseResult_${i}">
                <input type="hidden" id="result_lib_${i}" value="${result.library}">`;

        for (const field of lib.headers) {
            const val = result.fields[field] || '';
            const isLong = val.length > 40 || field.includes('方向') || field.includes('伏笔') || field.includes('设计') || field.includes('内容') || field.includes('原文');
            html += `<div class="result-field">
                <div class="result-field-label">${field}</div>
                <div class="result-field-value">
                    ${isLong ?
                        `<textarea id="result_${i}_${field}" rows="2" onchange="updateParsedField(${i},'${field}',this.value)">${escapeHtml(val)}</textarea>` :
                        `<input type="text" id="result_${i}_${field}" value="${escapeAttr(val)}" onchange="updateParsedField(${i},'${field}',this.value)">`
                    }
                </div>
            </div>`;
        }

        html += `</div></div>`;
    }

    html += `<div style="margin-top:16px;text-align:center;">
        <button class="btn btn-primary btn-lg" onclick="saveParsedResults()">💾 全部保存入库</button>
    </div>`;

    output.innerHTML = html;
}

// ============ 更新解析结果字段 ============
function updateParsedField(index, field, value) {
    if (window._parsedResults && window._parsedResults[index]) {
        window._parsedResults[index].fields[field] = value;
    }
}

// ============ 保存解析结果到库 ============
function saveParsedResults() {
    if (!window._parsedResults || window._parsedResults.length === 0) {
        showToast('没有可保存的结果', 'warning');
        return;
    }

    // 从DOM收集最新值
    for (let i = 0; i < window._parsedResults.length; i++) {
        const result = window._parsedResults[i];
        const lib = SCHEMA.getLibrary(result.library);
        for (const field of lib.headers) {
            const el = document.getElementById('result_' + i + '_' + field);
            if (el) {
                result.fields[field] = el.value.trim();
            }
        }

        // 自动生成编号
        if (!result.fields['编号']) {
            result.fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(result.library));
        }

        Store.addItem(result.library, result.fields);
    }

    showToast(`成功保存 ${window._parsedResults.length} 条素材`, 'success');
    window._parsedResults = [];
    document.getElementById('parserInput').value = '';
    document.getElementById('parserOutput').innerHTML = getParserEmptyHtml();
    document.getElementById('parseStatus').textContent = '';
    renderNav();
}

// ============================================
// 扫榜数据表格
// ============================================
function renderScanTable() {
    const contentArea = document.getElementById('contentArea');
    const lib = Store.getLibrary('扫榜');
    const items = lib.items || [];
    const headers = lib.headers || ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'];

    let html = '<div class="table-toolbar">';
    html += `<div class="search-box"><input type="text" id="scanSearch" placeholder="搜索扫榜数据..." oninput="filterScanTable(this.value)"></div>`;
    html += `<span style="font-size:13px;color:var(--text-secondary);">共 ${items.length} 条记录</span>`;
    html += `<button class="btn btn-primary" onclick="openScanEditor()">+ 新增</button>`;
    html += `<button class="btn btn-secondary" onclick="batchImportScan()">📋 批量导入</button>`;
    html += '</div>';

    html += '<div class="data-table-wrap"><table class="data-table"><thead><tr>';
    for (const h of headers) {
        html += `<th>${h}</th>`;
    }
    html += '<th>操作</th>';
    html += '</tr></thead><tbody id="scanTableBody">';

    if (items.length === 0) {
        html += `<tr><td colspan="${headers.length + 1}" style="text-align:center;padding:40px;color:var(--text-light);">暂无扫榜数据，点击"新增"添加记录</td></tr>`;
    } else {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            html += '<tr>';
            for (const h of headers) {
                let val = item[h] || '';
                if (val.length > 50) val = val.substring(0, 50) + '...';
                html += `<td title="${escapeAttr(item[h] || '')}">${escapeHtml(val)}</td>`;
            }
            html += `<td class="actions-cell">
                <button class="btn-edit" onclick="openScanEditor(${i})">编辑</button>
                <button class="btn-delete" onclick="deleteScan(${i})">删除</button>
            </td>`;
            html += '</tr>';
        }
    }

    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

function filterScanTable(keyword) {
    const tbody = document.getElementById('scanTableBody');
    if (!tbody) return;
    const lib = Store.getLibrary('扫榜');
    const items = lib.items || [];
    const headers = lib.headers || ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'];

    const filtered = keyword ? items.filter(item => {
        return Object.values(item).some(v => v && v.toString().toLowerCase().includes(keyword.toLowerCase()));
    }) : items;

    let html = '';
    if (filtered.length === 0) {
        html = `<tr><td colspan="${headers.length + 1}" style="text-align:center;padding:40px;color:var(--text-light);">无匹配结果</td></tr>`;
    } else {
        for (let i = 0; i < filtered.length; i++) {
            const item = filtered[i];
            const realIdx = items.indexOf(item);
            html += '<tr>';
            for (const h of headers) {
                let val = item[h] || '';
                if (val.length > 50) val = val.substring(0, 50) + '...';
                html += `<td title="${escapeAttr(item[h] || '')}">${escapeHtml(val)}</td>`;
            }
            html += `<td class="actions-cell">
                <button class="btn-edit" onclick="openScanEditor(${realIdx})">编辑</button>
                <button class="btn-delete" onclick="deleteScan(${realIdx})">删除</button>
            </td>`;
            html += '</tr>';
        }
    }
    tbody.innerHTML = html;
}

function openScanEditor(index) {
    const lib = Store.getLibrary('扫榜');
    const headers = lib.headers || ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'];
    const isEdit = index !== undefined && index !== null;
    const items = lib.items || [];
    const item = isEdit ? items[index] : {};

    let formHtml = '';
    for (let i = 0; i < headers.length; i++) {
        const field = headers[i];
        const val = item[field] || '';
        if (i % 2 === 0 && i + 1 < headers.length) {
            formHtml += '<div class="form-row">';
            formHtml += renderField(field, val);
            formHtml += renderField(headers[i + 1], item[headers[i + 1]] || '');
            formHtml += '</div>';
            i++;
        } else {
            formHtml += renderField(field, val, true);
        }
    }

    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = isEdit ? '编辑扫榜记录' : '新增扫榜记录';
    modalBody.innerHTML = formHtml;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveScan(${index !== undefined ? index : -1})">${isEdit ? '保存' : '创建'}</button>
    `;
    openModal();
}

function saveScan(index) {
    const lib = Store.getLibrary('扫榜');
    const headers = lib.headers || ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'];
    const fields = {};
    for (const h of headers) {
        const el = document.getElementById('field_' + h);
        if (el) fields[h] = el.value.trim();
    }

    if (index >= 0) {
        Store.updateItem('扫榜', index, fields);
        showToast('扫榜记录已更新', 'success');
    } else {
        Store.addItem('扫榜', fields);
        showToast('扫榜记录已创建', 'success');
    }
    closeModal();
    renderScanTable();
    renderNav();
}

function deleteScan(index) {
    const items = Store.getItems('扫榜');
    const item = items[index];
    if (!item) return;
    if (confirm(`确定删除 "${item['章节标题'] || item['文章名'] || '该记录'}" 吗？`)) {
        Store.deleteItem('扫榜', index);
        showToast('已删除', 'success');
        renderScanTable();
        renderNav();
    }
}

function batchImportScan() {
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = '📋 批量导入扫榜数据';
    modalBody.innerHTML = `
        <div class="batch-import-guide">
            <p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">
                每行一条记录，字段间用 <code>|</code> 或 <code>Tab</code> 分隔。<br>
                字段顺序：章节 | 章节标题 | 内容提要 | 字数 | 点击 | 更新时间 | 文章名 | 作者 | 标签
            </p>
            <textarea id="batchScanInput" rows="12" style="width:100%;font-size:13px;" placeholder="示例：&#10;第1章 | 重生归来 | 女主重生回到十八岁... | 3200 | 12.5万 | 2025-07-01 | 重生之凤还巢 | 某某作者 | #重生 #复仇&#10;第2章 | 暗夜交锋 | 男主身份初次揭露... | 3500 | 15.2万 | 2025-07-02 | 重生之凤还巢 | 某某作者 | #重生 #悬疑"></textarea>
        </div>
    `;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="processBatchScan()">导入</button>
    `;
    openModal();
}

function processBatchScan() {
    const text = document.getElementById('batchScanInput').value;
    if (!text.trim()) { showToast('请输入数据', 'warning'); return; }

    const headers = ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'];
    const lines = text.trim().split('\n');
    let count = 0;

    for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(/\s*[|\t]\s*/).map(p => p.trim());
        if (parts.length < 2) continue;

        const item = {};
        for (let i = 0; i < headers.length; i++) {
            item[headers[i]] = parts[i] || '';
        }
        Store.addItem('扫榜', item);
        count++;
    }

    showToast(`成功导入 ${count} 条扫榜记录`, 'success');
    closeModal();
    renderScanTable();
    renderNav();
}

// ============================================
// 大纲管理
// ============================================
function renderOutlineTable() {
    const contentArea = document.getElementById('contentArea');
    const lib = Store.getLibrary('大纲');
    const items = lib.items || [];
    const headers = lib.headers || ['故事阶段','大事件','章节名称','事业线','感情线','时间','事件内容','主要人物','看点','问题','流程','伏笔','知识','写后梗概'];

    let html = '<div class="table-toolbar">';
    html += `<span style="font-size:13px;color:var(--text-secondary);">共 ${items.length} 条大纲</span>`;
    html += '</div>';

    html += '<div class="data-table-wrap"><table class="data-table"><thead><tr>';
    for (const h of headers) {
        html += `<th>${h}</th>`;
    }
    html += '<th>操作</th>';
    html += '</tr></thead><tbody>';

    if (items.length === 0) {
        html += `<tr><td colspan="${headers.length + 1}" style="text-align:center;padding:40px;color:var(--text-light);">暂无大纲数据</td></tr>`;
    } else {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            html += '<tr>';
            for (const h of headers) {
                let val = item[h] || '';
                if (val.length > 40) val = val.substring(0, 40) + '...';
                html += `<td title="${escapeAttr(item[h] || '')}">${escapeHtml(val)}</td>`;
            }
            html += `<td class="actions-cell">
                <button class="btn-edit" onclick="openOutlineEditor(${i})">编辑</button>
                <button class="btn-delete" onclick="deleteOutline(${i})">删除</button>
            </td>`;
            html += '</tr>';
        }
    }

    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

function openOutlineEditor(index) {
    const lib = Store.getLibrary('大纲');
    const headers = lib.headers || ['故事阶段','大事件','章节名称','事业线','感情线','时间','事件内容','主要人物','看点','问题','流程','伏笔','知识','写后梗概'];
    const isEdit = index !== undefined && index !== null;
    const items = lib.items || [];
    const item = isEdit ? items[index] : {};

    let formHtml = '';
    for (let i = 0; i < headers.length; i++) {
        const field = headers[i];
        const val = item[field] || '';
        if (i % 2 === 0 && i + 1 < headers.length) {
            formHtml += '<div class="form-row">';
            formHtml += renderField(field, val);
            formHtml += renderField(headers[i + 1], item[headers[i + 1]] || '');
            formHtml += '</div>';
            i++;
        } else {
            formHtml += renderField(field, val, true);
        }
    }

    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = isEdit ? '编辑大纲' : '新增大纲';
    modalBody.innerHTML = formHtml;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="saveOutline(${index !== undefined ? index : -1})">${isEdit ? '保存' : '创建'}</button>
    `;
    openModal();
}

function saveOutline(index) {
    const lib = Store.getLibrary('大纲');
    const headers = lib.headers || [];
    const fields = {};
    for (const h of headers) {
        const el = document.getElementById('field_' + h);
        if (el) fields[h] = el.value.trim();
    }
    if (index >= 0) {
        Store.updateItem('大纲', index, fields);
        showToast('大纲已更新', 'success');
    } else {
        Store.addItem('大纲', fields);
        showToast('大纲已创建', 'success');
    }
    closeModal();
    renderOutlineTable();
    renderNav();
}

function deleteOutline(index) {
    if (confirm('确定删除这条大纲吗？')) {
        Store.deleteItem('大纲', index);
        showToast('已删除', 'success');
        renderOutlineTable();
        renderNav();
    }
}

// ============================================
// 通用工具函数
// ============================================
function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// 点击遮罩关闭
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

function showToast(msg, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// 导入导出
// ============================================
function exportAllData() {
    const data = Store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `章屿の渡星屿_数据备份_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出', 'success');
}

function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        if (Store.importData(e.target.result)) {
            showToast('数据导入成功', 'success');
            renderNav();
            navigateTo(currentPage);
        } else {
            showToast('数据格式错误', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
