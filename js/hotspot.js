/**
 * 热点中心模块
 * 功能：
 * 1. 展示自动抓取的热点数据（从 hot-topics.json 加载）
 * 2. 支持手动新增/编辑/删除热点
 * 3. 智能多维度分析：一个热点可同时映射到多个素材库角度
 * 4. 手动校正入口：用户可勾选/编辑要入库的素材库
 * 5. 一键/批量导入热点到对应素材库
 * 6. 按平台/类型/时间筛选
 * 7. 高赞评论金句导入金句库
 * 8. 批量管理和操作
 */
const HotspotModule = {
    // 本地存储的热点数据
    data: [],
    // 抓取的远程数据
    remoteData: [],
    // 筛选状态
    filters: { platform: 'all', type: 'all', keyword: '' },

    STORAGE_KEY: 'hotspot_data',

    // 素材库ID映射
    LIB_MAP: {
        '热梗素材库': '热梗素材库',
        '冲突素材库': '冲突素材库',
        '钩子素材库': '钩子素材库',
        '反转素材库': '反转素材库',
        '人设基因库': '人设基因库',
        '场景库': '场景库',
        '金句库': '金句库',
        '幽默素材库': '幽默素材库',
        '情绪库': '情绪库',
        '法律风险库': '法律风险库',
        '词汇库': '词汇库',
        '景色库': '景色库',
        '动作库': '动作库',
        '对话库': '对话库'
    },

    // 多维度分类规则（置信度阈值默认40）
    CLASSIFIER_RULES: {
        '热梗素材库': {
            core: ['热梗', '爆款', '出圈', '文化自信', '文化输出', '国潮', '国产', '国漫', '国货', '崛起', '现象级', '刷屏', ' viral ', ' trending'],
            assist: ['热点', '讨论', '全网', '关注度', '热议'],
            reason: '具备爆款传播潜质或文化符号属性'
        },
        '冲突素材库': {
            core: ['争议', '批评', '指责', '质疑', '对立', '矛盾', '冲突', '竞争', '排名', '票房战', '口水战', '论战', '翻车', '曝光', '潜规则'],
            assist: ['对比', '差距', '数据', '市场', '结构变化', '教授指出', '专家指出'],
            reason: '存在现实矛盾、争议或对比张力'
        },
        '钩子素材库': {
            core: ['悬念', '揭秘', '预测', '黑马', '爆款预定', '未解', '谜团', '伏笔', '会引发', '拭目以待'],
            assist: ['引发', '期待', '好奇', '关注'],
            reason: '适合埋设悬念或引发持续关注'
        },
        '反转素材库': {
            core: ['反转', '逆袭', '原来', '竟然', '没想到', '意外', '突变', '转折', '由弱到强', '后来居上', '从', '逆袭'],
            assist: ['改写', '变化', '突破', '转折'],
            reason: '含剧情反转或逆袭结构'
        },
        '人设基因库': {
            core: ['人物', '角色', '主人公', '主角', '人设', '性格', '主播', '博主', '演员', '导演'],
            assist: ['形象', '标签', '个性'],
            reason: '可提炼为角色原型或性格标签'
        },
        '场景库': {
            core: ['取景地', '拍摄地', '场景', '地标', '古街', '古镇', '建筑', '城市', '地点', '空间'],
            assist: ['南京', '北京', '西安', '杭州', '苏州', '成都', '重庆'],
            reason: '含可视觉化的地点或空间场景',
            // 降低误判：若上下文是电影/票房/国漫，地名大概率是电影名
            suppress: ['电影', '影片', '国漫', '票房', '上映', '档', '总票房']
        },
        '情绪库': {
            core: ['感动', '泪目', '破防', '愤怒', '热血', '自豪', '骄傲', '治愈', 'emo', '焦虑', '共鸣', '情绪'],
            assist: ['打动', '震撼', '戳中', '心疼'],
            reason: '携带强情绪触发点'
        },
        '幽默素材库': {
            core: ['搞笑', '吐槽', '段子', '喜剧', '幽默', '可爱', '笑死', '谐音梗', '错别字', '较真'],
            assist: ['笑', '萌', '趣', '梗'],
            reason: '含幽默、吐槽或谐音梗元素'
        },
        '金句库': {
            core: ['语录', '台词', '金句', '名言', '高赞评论', '评论区'],
            assist: ['一句话', '破防', '扎心'],
            reason: '高赞评论或文案可直接提炼为金句'
        },
        '法律风险库': {
            core: ['侵权', '抄袭', '版权', '法律', '起诉', '被告', '纠纷', '判罚', '合规', '避雷'],
            assist: ['风险', '诉讼', '维权'],
            reason: '涉及创作法律风险或版权争议'
        }
    },

    init: function() {
        // 加载本地存储的热点
        this.data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        // 给旧数据补齐 targetLibs
        for (const item of this.data) {
            if (!item.targetLibs || !item.targetLibs.length) {
                item.targetLibs = this.analyzeTargetLibs(item);
            }
        }
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
                // 自动多维度分析
                item.targetLibs = this.analyzeTargetLibs(item);
                this.data.unshift(item);
                newCount++;
            }
        }
        if (newCount > 0) {
            this.save();
        }
        this.lastUpdate = lastUpdate;
    },

    // 多维度分类分析：返回 [{libId, confidence, reason, checked}]
    analyzeTargetLibs: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
        const commentsText = (item.comments || []).map(c => (c.text || c.content || '')).join(' ').toLowerCase();
        const fullText = text + ' ' + commentsText;

        const results = [];
        for (const [libId, rule] of Object.entries(this.CLASSIFIER_RULES)) {
            let score = 0;
            let matched = [];

            // 核心关键词
            for (const kw of rule.core || []) {
                if (fullText.includes(kw.toLowerCase())) {
                    score += 30;
                    matched.push(kw);
                }
            }
            // 辅助关键词
            for (const kw of rule.assist || []) {
                if (fullText.includes(kw.toLowerCase())) {
                    score += 15;
                    matched.push(kw);
                }
            }

            // 抑制规则（降低误判）
            if (rule.suppress) {
                const hasSuppress = rule.suppress.some(kw => fullText.includes(kw.toLowerCase()));
                if (hasSuppress) {
                    score -= 30;
                }
            }

            // 评论对金句/幽默/情绪有加成
            if ((libId === '金句库' || libId === '幽默素材库' || libId === '情绪库') && (item.comments || []).length > 0) {
                const highLikes = item.comments.some(c => (c.likes || 0) >= 100);
                if (highLikes) score += 15;
                else score += 5;
            }

            // 标签命中额外加成
            if (item.tags && item.tags.length) {
                const tagText = item.tags.join(' ').toLowerCase();
                for (const kw of [...(rule.core || []), ...(rule.assist || [])]) {
                    if (tagText.includes(kw.toLowerCase())) {
                        score += 10;
                    }
                }
            }

            // 默认兜底：保持原有 category 的映射
            const oldMap = {
                '热梗': '热梗素材库', '冲突': '冲突素材库', '钩子': '钩子素材库',
                '反转': '反转素材库', '人设': '人设基因库', '场景': '场景库',
                '金句': '金句库', '幽默': '幽默素材库', '情绪': '情绪库',
                '评论金句': '金句库'
            };
            if (oldMap[item.category || item.type] === libId) {
                score += 20;
            }

            score = Math.max(0, Math.min(100, score));
            if (score >= 35) {
                results.push({
                    libId,
                    confidence: score,
                    reason: rule.reason + (matched.length ? '（命中：' + matched.slice(0, 3).join('、') + '）' : ''),
                    checked: score >= 55  // 默认勾选高置信度
                });
            }
        }

        // 按置信度排序
        results.sort((a, b) => b.confidence - a.confidence);

        // 若结果为空，按原 category 兜底
        if (results.length === 0) {
            const oldMap = {
                '热梗': '热梗素材库', '冲突': '冲突素材库', '钩子': '钩子素材库',
                '反转': '反转素材库', '人设': '人设基因库', '场景': '场景库',
                '金句': '金句库', '幽默': '幽默素材库', '情绪': '情绪库',
                '评论金句': '金句库'
            };
            const fallback = oldMap[item.category || item.type] || '热梗素材库';
            results.push({ libId: fallback, confidence: 50, reason: '按原单分类兜底', checked: true });
        }

        return results;
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
            items = items.filter(i => {
                const libs = (i.targetLibs || []).map(t => t.libId);
                const category = i.category || i.type || '';
                return libs.includes(this.filters.type) || category === this.filters.type;
            });
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

    // 获取唯一类型列表（包含所有素材库ID）
    getTypes: function() {
        const set = new Set();
        this.data.forEach(d => {
            const category = d.category || d.type;
            if (category) set.add(category);
            (d.targetLibs || []).forEach(t => set.add(t.libId));
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
                    <option value="all">素材库: 全部</option>
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

        let html = '<div class="hs-card-list">';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const realIdx = this.data.indexOf(item);
            const platformIcon = this.getPlatformIcon(item.platform);
            const heatBar = item.heat ? `<div class="hs-heat"><span class="hs-heat-label">热度</span><div class="hs-heat-bar"><div class="hs-heat-fill" style="width:${Math.min(item.heat, 100)}%"></div></div><span class="hs-heat-val">${item.heat || '—'}</span></div>` : '';

            // 多库标签展示
            const targetLibs = item.targetLibs || [];
            const libTags = targetLibs.map(t => {
                const lib = SCHEMA.getLibrary(t.libId);
                const icon = lib ? lib.icon : '📌';
                return `<span class="hs-lib-tag ${t.checked ? 'checked' : ''}" title="${escapeAttr(t.reason || '')} 置信度:${t.confidence}">${icon} ${t.libId} <small>${t.confidence}</small></span>`;
            }).join('');

            // 主要推荐库
            const primaryLib = targetLibs.find(t => t.checked) || targetLibs[0];
            const primaryBtn = primaryLib ? `📥 入 ${primaryLib.libId}` : '📥 入库';

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
                ${libTags ? `<div class="hs-lib-tags"><span class="hs-lib-tags-label">可入库角度：</span>${libTags}</div>` : ''}
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
                        <button class="btn btn-sm btn-success" onclick="HotspotModule.openMultiImport(${realIdx})">${primaryBtn}</button>
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

    // 打开多库入库/校正弹窗
    openMultiImport: function(idx) {
        const item = this.data[idx];
        if (!item) return;

        // 确保有分析结果
        if (!item.targetLibs || !item.targetLibs.length) {
            item.targetLibs = this.analyzeTargetLibs(item);
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '多库入库校正';

        // 生成各库预览
        const rows = item.targetLibs.map((t, i) => {
            const lib = SCHEMA.getLibrary(t.libId);
            const preview = this.buildFieldsPreview(item, t.libId);
            return `
            <div class="hs-mi-row ${t.checked ? 'checked' : ''}" data-idx="${i}" onclick="HotspotModule.toggleMiCheck(${i})">
                <div class="hs-mi-check">
                    <input type="checkbox" id="mi-check-${i}" ${t.checked ? 'checked' : ''} onchange="HotspotModule.toggleMiCheck(${i})">
                </div>
                <div class="hs-mi-info">
                    <div class="hs-mi-title">
                        <span class="hs-mi-icon">${lib ? lib.icon : '📌'}</span>
                        <span>${t.libId}</span>
                        <span class="hs-mi-confidence" title="置信度">${t.confidence}%</span>
                    </div>
                    <div class="hs-mi-reason">${escapeHtml(t.reason || '')}</div>
                    <div class="hs-mi-preview">
                        ${Object.entries(preview).map(([k, v]) => `<div class="hs-mi-preview-line"><b>${k}：</b>${escapeHtml((v || '').toString().substring(0, 80))}${(v || '').toString().length > 80 ? '...' : ''}</div>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');

        // 未命中但用户可手动添加的库
        const allLibIds = Object.keys(this.LIB_MAP);
        const existingIds = new Set(item.targetLibs.map(t => t.libId));
        const extraOptions = allLibIds.filter(id => !existingIds.has(id)).map(id => {
            const lib = SCHEMA.getLibrary(id);
            return `<option value="${id}">${lib ? lib.icon : '📌'} ${id}</option>`;
        }).join('');

        modalBody.innerHTML = `
            <div class="hs-mi-header">
                <div class="hs-mi-source-title">${escapeHtml(item.title || '')}</div>
                <div class="hs-mi-source-meta">${item.platform || ''} · 热度 ${item.heat || '—'}</div>
            </div>
            <div class="hs-mi-list">
                ${rows || '<div style="padding:20px;text-align:center;color:var(--text-light);">暂无推荐入库角度</div>'}
            </div>
            <div class="hs-mi-add">
                <label>手动添加其他素材库：</label>
                <select id="mi-add-lib">
                    <option value="">选择素材库...</option>
                    ${extraOptions}
                </select>
                <button class="btn btn-sm btn-secondary" onclick="HotspotModule.addManualLib(${idx})">添加</button>
            </div>
            <div class="hs-mi-tip">💡 点击列表项可切换是否入库；入库时会为每个勾选的库生成一条素材。</div>
        `;

        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="HotspotModule.confirmMultiImport(${idx})">确认入库</button>
        `;
        openModal();
    },

    toggleMiCheck: function(i) {
        // 防止事件冒泡导致重复触发
        const row = document.querySelector(`.hs-mi-row[data-idx="${i}"]`);
        if (!row) return;
        const cb = document.getElementById(`mi-check-${i}`);
        // 如果点击的是checkbox本身，状态已经改变；否则需要切换
        if (event && event.target !== cb) {
            cb.checked = !cb.checked;
        }
        row.classList.toggle('checked', cb.checked);
    },

    addManualLib: function(idx) {
        const item = this.data[idx];
        const select = document.getElementById('mi-add-lib');
        const libId = select.value;
        if (!libId) return;
        if (!item.targetLibs) item.targetLibs = [];
        if (item.targetLibs.some(t => t.libId === libId)) {
            showToast('该库已在列表中', 'warning');
            return;
        }
        item.targetLibs.push({
            libId,
            confidence: 60,
            reason: '手动添加',
            checked: true
        });
        this.save();
        this.openMultiImport(idx); // 重新渲染弹窗
    },

    confirmMultiImport: function(idx) {
        const item = this.data[idx];
        if (!item || !item.targetLibs) return;

        // 收集勾选状态
        item.targetLibs.forEach((t, i) => {
            const cb = document.getElementById(`mi-check-${i}`);
            if (cb) t.checked = cb.checked;
        });

        const selected = item.targetLibs.filter(t => t.checked);
        if (selected.length === 0) {
            showToast('请至少选择一个素材库', 'warning');
            return;
        }

        let importedCount = 0;
        let goldenCount = 0;
        for (const t of selected) {
            const result = this.importSingleToLib(item, t.libId);
            if (result) importedCount++;
        }

        // 高赞评论导入金句库（如果金句库不在选中项中）
        if (!selected.some(t => t.libId === '金句库') && item.comments && item.comments.length) {
            for (const comment of item.comments) {
                if (comment.likes && comment.likes >= 100) {
                    const jjFields = {};
                    jjFields['编号'] = SCHEMA.generateId('JJ', Store.getExistingIds('金句库'));
                    jjFields['金句内容'] = comment.text || comment.content || '';
                    jjFields['类型标签'] = '#高赞评论 #' + (item.platform || '');
                    jjFields['关联热梗'] = item.title || '';
                    Store.addItem('金句库', jjFields);
                    goldenCount++;
                }
            }
        }

        item.imported = true;
        this.save();
        closeModal();
        showToast(`已入库 ${importedCount} 个素材库${goldenCount ? '（含' + goldenCount + '条高赞金句）' : ''}`, 'success');
        this.renderList();
        renderNav();
    },

    // 导入单个热点到单个素材库（返回是否成功）
    importSingleToLib: function(item, libId) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return false;

        const fields = this.buildFieldsForLib(item, libId);
        Store.addItem(libId, fields);
        return true;
    },

    // 构建某个库的字段映射（返回字段对象）
    buildFieldsForLib: function(item, libId) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return {};

        const fields = {};
        fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(libId));

        if (libId === '热梗素材库') {
            fields['类型标签'] = (item.tags || []).map(t => '#' + t).join(' ');
            fields['来源平台'] = item.platform || '';
            fields['核心冲突点'] = item.title || '';
            fields['改编方向'] = item.content || '';
            fields['多平台热度'] = (item.heat || '') + '';
            fields['适用情节'] = this.extractStoryAngle(item, '热梗');
        } else if (libId === '冲突素材库') {
            fields['冲突类型'] = item.category || '社会冲突';
            fields['来源平台'] = item.platform || '';
            fields['核心矛盾'] = item.title || '';
            fields['现实原型'] = item.content || '';
            fields['情绪曲线'] = this.extractEmotionCurve(item);
            fields['适用情节'] = this.extractStoryAngle(item, '冲突');
        } else if (libId === '钩子素材库') {
            fields['钩子类型'] = '热点型钩子';
            fields['埋设位置'] = '章节开头/社交媒体';
            fields['核心元素'] = item.title || '';
            fields['埋设手法'] = item.content ? '由新闻事件引出：' + item.content.substring(0, 50) : '';
            fields['情感导向'] = this.extractEmotionCurve(item);
        } else if (libId === '反转素材库') {
            fields['反转类型'] = '预期颠覆';
            fields['表面呈现'] = item.title || '';
            fields['真相揭露'] = item.content || '';
            fields['情感冲击'] = this.extractEmotionCurve(item);
            fields['现实原型'] = item.platform || '';
        } else if (libId === '人设基因库') {
            fields['角色定位'] = '热点原型';
            fields['性格标签'] = (item.tags || []).join('、');
            fields['职业/身份'] = this.extractRoleIdentity(item);
            fields['适用情节'] = item.title || '';
        } else if (libId === '场景库') {
            fields['场景类型'] = '现实场景';
            fields['视觉焦点'] = item.title || '';
            fields['情感曲线'] = this.extractEmotionCurve(item);
            fields['冲突触发点'] = item.content ? item.content.substring(0, 60) : '';
            fields['适用情节'] = this.extractStoryAngle(item, '场景');
        } else if (libId === '情绪库') {
            fields['核心情绪'] = this.extractPrimaryEmotion(item);
            fields['强度等级'] = item.heat ? Math.ceil(item.heat / 20) : 3;
            fields['行为映射'] = item.content ? item.content.substring(0, 80) : '';
            fields['适用场景'] = item.title || '';
        } else if (libId === '金句库') {
            fields['金句内容'] = item.title || item.content || '';
            fields['类型标签'] = (item.tags || []).map(t => '#' + t).join(' ');
            fields['关联热梗'] = item.platform || '';
            fields['适用情节'] = this.extractStoryAngle(item, '金句');
        } else if (libId === '幽默素材库') {
            fields['评论原文'] = item.title || item.content || '';
            fields['核心笑点'] = item.content || '';
            fields['幽默类型'] = item.category || '谐音梗/吐槽';
            fields['高频关键词'] = (item.tags || []).join(',');
        } else {
            // 通用映射
            for (const h of lib.headers) {
                if (h === '编号') continue;
                if (h.includes('标签')) fields[h] = (item.tags || []).map(t => '#' + t).join(' ');
                else if (h.includes('平台') || h.includes('来源')) fields[h] = item.platform || '';
                else if (h.includes('内容') || h.includes('原文') || h.includes('方向')) fields[h] = item.content || '';
                else if (h.includes('类型') || h.includes('分类')) fields[h] = item.category || '';
                else if (h.includes('情绪') || h.includes('情感')) fields[h] = this.extractEmotionCurve(item);
                else fields[h] = '';
            }
        }

        return fields;
    },

    // 字段预览（用于弹窗展示）
    buildFieldsPreview: function(item, libId) {
        const fields = this.buildFieldsForLib(item, libId);
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return fields;
        // 只展示 displayFields 中的关键字段
        const preview = {};
        for (const key of lib.displayFields || Object.keys(fields)) {
            if (fields[key]) preview[key] = fields[key];
        }
        return preview;
    },

    // 提取主要情绪关键词
    extractPrimaryEmotion: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '')).toLowerCase();
        const emotions = {
            '感动': ['感动', '泪目', '破防', '温暖', '治愈'],
            '愤怒': ['愤怒', '气愤', ' outrage', '不公', '欺负'],
            '自豪': ['自豪', '骄傲', '文化自信', '热血', '振奋'],
            '焦虑': ['焦虑', '担忧', '压力', '迷茫', '内卷'],
            '喜悦': ['喜悦', '开心', '欢乐', '搞笑', '可爱'],
            '反转': ['意外', '震惊', '没想到', '竟然']
        };
        for (const [emotion, kws] of Object.entries(emotions)) {
            if (kws.some(kw => text.includes(kw))) return emotion;
        }
        return '共鸣';
    },

    // 提取情绪曲线描述
    extractEmotionCurve: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '')).toLowerCase();
        if (text.includes('反转') || text.includes('意外')) return '意外→释然/震惊';
        if (text.includes('争议') || text.includes('批评')) return '关注→愤怒→反思';
        if (text.includes('感动') || text.includes('泪目')) return '平静→感动→回味';
        if (text.includes('搞笑') || text.includes('可爱')) return '平淡→发笑→共鸣';
        if (text.includes('崛起') || text.includes('逆袭')) return '压抑→燃→自豪';
        return '关注→共鸣→讨论';
    },

    // 提取故事角度
    extractStoryAngle: function(item, angle) {
        const content = item.content || item.title || '';
        if (angle === '热梗') return '借用热点事件作为故事引子，引发读者共鸣';
        if (angle === '冲突') return '将事件中的矛盾提炼为人物冲突原型';
        if (angle === '场景') return '提取事件中的视觉化场景作为故事背景';
        if (angle === '金句') return '将核心文案作为章节点睛句';
        return content.substring(0, 40);
    },

    // 提取角色身份
    extractRoleIdentity: function(item) {
        const text = (item.title || '') + ' ' + (item.content || '');
        if (text.includes('教授')) return '学者/评论者';
        if (text.includes('导演')) return '电影创作者';
        if (text.includes('演员')) return '演员/公众人物';
        if (text.includes('博主')) return '自媒体博主';
        if (text.includes('网友')) return '网民/围观者';
        return '热点事件参与者';
    },

    // 导入热点到素材库（兼容旧版单库入口）
    importToLib: function(idx, libId) {
        this.openMultiImport(idx);
    },

    // 批量导入所有未入库的热点
    batchImport: function() {
        const unimported = this.data.filter(d => !d.imported);
        if (unimported.length === 0) {
            showToast('没有待入库的热点', 'info');
            return;
        }

        // 先确保所有未入库热点都有分析结果
        for (const item of unimported) {
            if (!item.targetLibs || !item.targetLibs.length) {
                item.targetLibs = this.analyzeTargetLibs(item);
            }
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '批量入库确认';

        // 统计每个库将要入库的数量
        const stats = {};
        for (const item of unimported) {
            for (const t of (item.targetLibs || [])) {
                if (t.checked) {
                    stats[t.libId] = (stats[t.libId] || 0) + 1;
                }
            }
        }

        const statRows = Object.entries(stats).map(([libId, count]) => {
            const lib = SCHEMA.getLibrary(libId);
            return `<div class="hs-batch-stat"><span>${lib ? lib.icon : '📌'} ${libId}</span><span class="hs-batch-num">${count} 条</span></div>`;
        }).join('');

        modalBody.innerHTML = `
            <div class="hs-batch-summary">
                <div class="hs-batch-count">共 ${unimported.length} 条热点待入库</div>
                <div class="hs-batch-tip">系统将按每条热点分析出的"可入库角度"分别生成素材。已勾选的库才会入库。</div>
                <div class="hs-batch-stats">
                    ${statRows || '<div style="color:var(--text-light)">暂无推荐入库角度，请先到单条热点中校正。</div>'}
                </div>
            </div>
            <div class="hs-batch-list">
                ${unimported.map((item, i) => {
                    const libs = (item.targetLibs || []).filter(t => t.checked).map(t => t.libId).join('、') || '无';
                    return `<div class="hs-batch-item"><b>${escapeHtml(item.title || '无标题')}</b><span>→ ${libs}</span></div>`;
                }).join('')}
            </div>
        `;

        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="HotspotModule.confirmBatchImport()">确认批量入库</button>
        `;
        openModal();
    },

    confirmBatchImport: function() {
        const unimported = this.data.filter(d => !d.imported);
        if (unimported.length === 0) return;

        let totalImported = 0;
        let totalGolden = 0;
        for (const item of unimported) {
            if (!item.targetLibs || !item.targetLibs.length) continue;
            const selected = item.targetLibs.filter(t => t.checked);
            for (const t of selected) {
                if (this.importSingleToLib(item, t.libId)) totalImported++;
            }
            // 评论金句
            if (!selected.some(t => t.libId === '金句库') && item.comments && item.comments.length) {
                for (const comment of item.comments) {
                    if (comment.likes && comment.likes >= 100) {
                        const jjFields = {};
                        jjFields['编号'] = SCHEMA.generateId('JJ', Store.getExistingIds('金句库'));
                        jjFields['金句内容'] = comment.text || comment.content || '';
                        jjFields['类型标签'] = '#高赞评论 #' + (item.platform || '');
                        jjFields['关联热梗'] = item.title || '';
                        Store.addItem('金句库', jjFields);
                        totalGolden++;
                    }
                }
            }
            item.imported = true;
        }

        this.save();
        closeModal();
        showToast(`批量入库完成：${totalImported} 条素材${totalGolden ? '（含' + totalGolden + '条高赞金句）' : ''}`, 'success');
        this.render();
        renderNav();
    },

    openEditor: function(idx) {
        const isEdit = idx !== undefined && idx !== null;
        const item = isEdit ? this.data[idx] : {
            title: '', content: '', platform: '', category: '热梗',
            tags: [], heat: 50, source: 'manual', comments: [], targetLibs: []
        };

        // 确保编辑时有分析结果
        if (isEdit && (!item.targetLibs || !item.targetLibs.length)) {
            item.targetLibs = this.analyzeTargetLibs(item);
        }

        const platforms = ['微博', '抖音', '小红书', '知乎', '今日头条', 'B站', '豆瓣', '快手', '百度', '其他'];
        const categories = ['热梗', '冲突', '钩子', '反转', '人设', '场景', '金句', '幽默', '情绪', '评论金句'];

        // 可入库角度编辑
        const libOptions = Object.keys(this.LIB_MAP).map(libId => {
            const lib = SCHEMA.getLibrary(libId);
            const exists = (item.targetLibs || []).some(t => t.libId === libId);
            const checked = exists && (item.targetLibs || []).find(t => t.libId === libId).checked;
            return `<label class="hs-editor-lib ${checked ? 'checked' : ''}">
                <input type="checkbox" value="${libId}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('checked', this.checked)">
                <span>${lib ? lib.icon : '📌'} ${libId}</span>
            </label>`;
        }).join('');

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
                    <label>可入库角度（可多选，保存后会按勾选库生成素材）</label>
                    <div class="hs-editor-libs">
                        ${libOptions}
                    </div>
                    <div style="font-size:12px;color:var(--text-light);margin-top:6px;">💡 若留空，保存时会自动分析推荐</div>
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

        // 收集手动勾选的库
        const checkedLibs = Array.from(document.querySelectorAll('.hs-editor-lib input:checked')).map(cb => cb.value);

        const isEdit = idx >= 0;
        const baseItem = isEdit ? this.data[idx] : {};

        const item = {
            id: isEdit ? baseItem.id : ('hot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
            title, platform, category, heat, content, tags, comments,
            source: isEdit ? baseItem.source : 'manual',
            imported: isEdit ? baseItem.imported : false,
            time: isEdit ? baseItem.time : new Date().toISOString().slice(0, 16).replace('T', ' '),
            createdAt: isEdit ? baseItem.createdAt : new Date().toISOString()
        };

        // 如果有手动勾选，生成 targetLibs；否则自动分析
        if (checkedLibs.length) {
            item.targetLibs = checkedLibs.map(libId => ({
                libId,
                confidence: 70,
                reason: '手动指定',
                checked: true
            }));
        } else {
            item.targetLibs = this.analyzeTargetLibs(item);
        }

        if (isEdit) {
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
