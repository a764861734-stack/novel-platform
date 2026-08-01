/**
 * 热点中心模块 v3
 * 功能：
 * 1. 展示自动抓取的热点数据（从 hot-topics.json 加载，无条数限制）
 * 2. 分页系统（默认80条/页，可选30/50/80/100）
 * 3. 晋江全维度标签体系（6大类：赛道/人设/剧情/情绪/晋江风格/时效性）
 * 4. 自动打标引擎 + 手动校正入口
 * 5. 标签筛选 + 关键词全局检索
 * 6. 批量标签编辑 + 批量删除 + 重复检测
 * 7. 多维度入库（一个热点可入多个素材库）
 * 8. 原文链接展示
 * 9. 高赞评论导入金句库
 */
const HotspotModule = {
    data: [],
    remoteData: [],
    filters: { platform: 'all', type: 'all', keyword: '', jjTag: { cat: 'all', tag: 'all' } },
    selected: new Set(),
    _initialized: false,
    pageSize: 80,
    currentPage: 1,

    STORAGE_KEY: 'hotspot_data',

    // 素材库ID映射
    LIB_MAP: {
        '热梗素材库':'热梗素材库','冲突素材库':'冲突素材库','钩子素材库':'钩子素材库',
        '反转素材库':'反转素材库','人设基因库':'人设基因库','场景库':'场景库',
        '金句库':'金句库','幽默素材库':'幽默素材库','情绪库':'情绪库',
        '法律风险库':'法律风险库','词汇库':'词汇库','景色库':'景色库',
        '动作库':'动作库','对话库':'对话库'
    },

    // ====== 晋江全维度标签体系 ======
    JJ_TAG_SYSTEM: {
        track: {
            label: '题材赛道',
            icon: '📚',
            tags: {
                '现代言情': { keywords: ['都市','职场','婚恋','日常','年代文','娱乐圈','现实','都市'] },
                '古言': { keywords: ['朝堂','宅斗','种田','江湖','武侠','宫廷','穿越','穿书','修仙','仙侠','古风','科举'] },
                '纯爱': { keywords: ['搭档','强强','破镜重圆','电竞','刑侦','校园纯爱'] },
                '无CP事业文': { keywords: ['搞事业','自我成长','基建','升职','重启','事业','女主搞事业'] },
                '现实治愈': { keywords: ['治愈','温暖','日常','小确幸','现实向'] }
            }
        },
        character: {
            label: '核心人设',
            icon: '👤',
            tags: {
                '大龄追梦': { keywords: ['考研','50岁','大龄','中年','退休','高龄','阿姨','追梦'] },
                '坚韧女主': { keywords: ['坚持','不放弃','独立','清醒','坚韧','自强'] },
                '逆袭重生': { keywords: ['逆袭','重生','翻盘','重来','重新开始'] },
                '美强惨': { keywords: ['美强惨','惨','虐','命运'] },
                '白切黑': { keywords: ['白切黑','腹黑','伪装'] },
                '温柔强者': { keywords: ['温柔','强者','温和'] },
                '外冷内热': { keywords: ['外冷内热','冷漠','冰山'] },
                '恋爱脑': { keywords: ['恋爱脑','恋爱至上','恋爱大过天'] },
                '原生拖累': { keywords: ['原生家庭','扶弟魔','凤凰男','父母','重男轻女'] },
                '人间清醒': { keywords: ['人间清醒','清醒','独立','理性'] },
                '平凡高光': { keywords: ['普通人','平凡','小人物','高光'] },
                '大器晚成': { keywords: ['大器晚成','迟来','半路'] },
                '反差学霸': { keywords: ['学霸','反差','成绩'] },
                '跨界转行': { keywords: ['转行','跨界','换赛道'] }
            }
        },
        plot: {
            label: '剧情梗',
            icon: '🎬',
            tags: {
                '逆袭打脸': { keywords: ['逆袭','打脸','翻盘','低估','瞧不起'] },
                '人生重启': { keywords: ['重启','重新开始','重来','人生重来'] },
                '破局翻盘': { keywords: ['破局','翻盘','扭转','逆风'] },
                '双向治愈': { keywords: ['双向','治愈','互相','彼此'] },
                '自我救赎': { keywords: ['救赎','自我','和解','释然'] },
                '冲破偏见': { keywords: ['偏见','年龄','歧视','刻板','打破'] },
                '家人阻拦': { keywords: ['反对','阻拦','不同意','家人','父母反对'] },
                '异地奔赴': { keywords: ['异地','奔赴','距离','分开'] },
                '圆梦时刻': { keywords: ['圆梦','上岸','成功','实现'] },
                '外界质疑': { keywords: ['质疑','不看','嘲笑','嘲讽'] },
                '破镜重圆': { keywords: ['破镜重圆','复合','重逢','再续'] },
                '职场逆袭': { keywords: ['升职','加薪','事业','职场','逆袭'] }
            }
        },
        emotion: {
            label: '情绪氛围',
            icon: '💭',
            tags: {
                '热血励志': { keywords: ['热血','励志','拼搏','奋斗','努力'] },
                '治愈暖心': { keywords: ['治愈','暖心','温暖','感动','温柔'] },
                '感动破防': { keywords: ['破防','泪目','哭','感动','泪'] },
                '心生向往': { keywords: ['向往','羡慕','憧憬','梦想'] },
                '释然释怀': { keywords: ['释然','释怀','放下','和解'] },
                '唏嘘感慨': { keywords: ['唏嘘','感慨','无奈','遗憾'] },
                '破除焦虑': { keywords: ['焦虑','内耗','压力','解压','缓解'] },
                '无力迷茫': { keywords: ['无力','迷茫','困惑','不知所措'] },
                '委屈心酸': { keywords: ['委屈','心酸','苦','辛酸'] },
                '爽感打脸': { keywords: ['爽','痛快','解气','打脸'] }
            }
        },
        jjStyle: {
            label: '晋江风格',
            icon: '✨',
            tags: {
                'HE': { keywords: ['圆满','好结局','在一起'] },
                '成长型主角': { keywords: ['成长','蜕变','进步','改变'] },
                '爽点密集': { keywords: ['爽','痛快','解气','打脸'] },
                '慢热治愈': { keywords: ['慢热','日常','细腻','治愈'] },
                '现实向': { keywords: ['现实','真实','接地气'] },
                '拒绝内耗': { keywords: ['内耗','拒绝','清醒','不纠结'] },
                '打破刻板': { keywords: ['刻板','偏见','打破','颠覆'] },
                '人生不设限': { keywords: ['不设限','无限','可能','突破'] }
            }
        },
        timeType: {
            label: '时效性',
            icon: '⏰',
            tags: {
                '短期流量梗': { keywords: ['热搜','爆','刷屏','出圈','热搜第一'] },
                '长效现实素材': { keywords: ['人生','故事','真实','现实','经历','事件'] },
                '本周热点': { keywords: [], auto: true },
                '当月爆款': { keywords: [], auto: true }
            }
        }
    },

    // 多维度分类规则（置信度阈值默认40）
    CLASSIFIER_RULES: {
        '热梗素材库': {
            core: ['热梗','爆款','出圈','文化自信','文化输出','国潮','国产','国漫','国货','崛起','现象级','刷屏'],
            assist: ['热点','讨论','全网','关注度','热议'],
            reason: '具备爆款传播潜质或文化符号属性'
        },
        '冲突素材库': {
            core: ['争议','批评','指责','质疑','对立','矛盾','冲突','竞争','排名','票房战','翻车','曝光','潜规则'],
            assist: ['对比','差距','数据','市场','教授指出','专家指出'],
            reason: '存在现实矛盾、争议或对比张力'
        },
        '钩子素材库': {
            core: ['悬念','揭秘','预测','黑马','爆款预定','未解','谜团','伏笔','拭目以待'],
            assist: ['引发','期待','好奇','关注'],
            reason: '适合埋设悬念或引发持续关注'
        },
        '反转素材库': {
            core: ['反转','逆袭','原来','竟然','没想到','意外','突变','转折','后来居上'],
            assist: ['改写','变化','突破','转折'],
            reason: '含剧情反转或逆袭结构'
        },
        '人设基因库': {
            core: ['人物','角色','主人公','主角','人设','性格','主播','博主','演员','导演'],
            assist: ['形象','标签','个性'],
            reason: '可提炼为角色原型或性格标签'
        },
        '场景库': {
            core: ['取景地','拍摄地','场景','地标','古街','古镇','建筑','城市','地点','空间'],
            assist: ['南京','北京','西安','杭州','苏州','成都','重庆'],
            reason: '含可视觉化的地点或空间场景',
            suppress: ['电影','影片','国漫','票房','上映','档','总票房']
        },
        '情绪库': {
            core: ['感动','泪目','破防','愤怒','热血','自豪','骄傲','治愈','emo','焦虑','共鸣','情绪'],
            assist: ['打动','震撼','戳中','心疼'],
            reason: '携带强情绪触发点'
        },
        '幽默素材库': {
            core: ['搞笑','吐槽','段子','喜剧','幽默','可爱','笑死','谐音梗','错别字','较真'],
            assist: ['笑','萌','趣','梗'],
            reason: '含幽默、吐槽或谐音梗元素'
        },
        '金句库': {
            core: ['语录','台词','金句','名言','高赞评论','评论区'],
            assist: ['一句话','破防','扎心'],
            reason: '高赞评论或文案可直接提炼为金句'
        },
        '法律风险库': {
            core: ['侵权','抄袭','版权','法律','起诉','被告','纠纷','判罚','合规','避雷'],
            assist: ['风险','诉讼','维权'],
            reason: '涉及创作法律风险或版权争议'
        }
    },

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        this.data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        for (const item of this.data) {
            if (!item.targetLibs || !item.targetLibs.length) {
                item.targetLibs = this.analyzeTargetLibs(item);
            }
            // 自动补齐晋江标签
            if (!item.jjTags) {
                item.jjTags = this.autoTagJJ(item);
            }
        }
        this.loadRemote();
    },

    loadRemote: function() {
        fetch('js/data/hot-topics.json?t=' + Date.now())
            .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
            .then(json => {
                if (json && json.items) {
                    this.remoteData = json.items;
                    this.lastUpdate = json.lastUpdate || '';
                    this.mergeRemote(json.items, json.lastUpdate || '');
                    if (typeof currentPage !== 'undefined' && currentPage === 'hotspot') {
                        this.render();
                    }
                }
            })
            .catch(e => { console.log('热点抓取数据暂未就绪，使用本地数据'); });
    },

    mergeRemote: function(remoteItems, lastUpdate) {
        let newCount = 0;
        for (const item of remoteItems) {
            const sig = (item.title || '') + (item.content || '').substring(0, 50);
            const exists = this.data.some(d => {
                const dSig = (d.title || '') + (d.content || '').substring(0, 50);
                return dSig === sig;
            });
            if (!exists) {
                item.source = 'auto';
                item.imported = false;
                item.id = item.id || ('hot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
                item.targetLibs = this.analyzeTargetLibs(item);
                // 自动打晋江标签
                if (!item.jjTags) {
                    item.jjTags = this.autoTagJJ(item);
                }
                this.data.unshift(item);
                newCount++;
            }
        }
        if (newCount > 0) {
            this.save();
        }
        this.lastUpdate = lastUpdate;
    },

    // ====== 晋江标签自动打标引擎 ======
    autoTagJJ: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
        const commentsText = (item.comments || []).map(c => (c.text || c.content || '')).join(' ').toLowerCase();
        const fullText = text + ' ' + commentsText;

        const result = {};
        for (const [catKey, cat] of Object.entries(this.JJ_TAG_SYSTEM)) {
            result[catKey] = [];
            for (const [tagName, tagDef] of Object.entries(cat.tags)) {
                if (tagDef.keywords && tagDef.keywords.length > 0) {
                    if (tagDef.keywords.some(kw => fullText.includes(kw.toLowerCase()))) {
                        result[catKey].push(tagName);
                    }
                }
            }
        }

        // 时效性自动判断
        if (result.timeType.length === 0) {
            // 默认根据热度判断
            if (item.heat && item.heat >= 80) {
                result.timeType.push('短期流量梗');
            } else {
                result.timeType.push('长效现实素材');
            }
        }

        // 如果赛道为空，根据内容兜底
        if (result.track.length === 0) {
            if (fullText.includes('古') || fullText.includes('穿越') || fullText.includes('仙')) {
                result.track.push('古言');
            } else if (fullText.includes('事业') || fullText.includes('职场')) {
                result.track.push('无CP事业文');
            } else {
                result.track.push('现代言情');
            }
        }

        // 如果情绪为空
        if (result.emotion.length === 0) {
            result.emotion.push('热血励志');
        }

        // 如果人设为空
        if (result.character.length === 0) {
            if (fullText.includes('普通人') || fullText.includes('平凡')) {
                result.character.push('平凡高光');
            }
        }

        return result;
    },

    // 获取所有出现过的晋江标签（用于筛选下拉）
    getJJTagOptions: function() {
        const result = {};
        for (const catKey of Object.keys(this.JJ_TAG_SYSTEM)) {
            result[catKey] = new Set();
        }
        for (const item of this.data) {
            if (item.jjTags) {
                for (const [catKey, tags] of Object.entries(item.jjTags)) {
                    if (Array.isArray(tags)) {
                        tags.forEach(t => result[catKey] && result[catKey].add(t));
                    }
                }
            }
        }
        // 转为数组
        for (const catKey of Object.keys(result)) {
            result[catKey] = Array.from(result[catKey]).sort();
        }
        return result;
    },

    analyzeTargetLibs: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '') + ' ' + (item.tags || []).join(' ')).toLowerCase();
        const commentsText = (item.comments || []).map(c => (c.text || c.content || '')).join(' ').toLowerCase();
        const fullText = text + ' ' + commentsText;

        const results = [];
        for (const [libId, rule] of Object.entries(this.CLASSIFIER_RULES)) {
            let score = 0;
            let matched = [];
            for (const kw of rule.core || []) {
                if (fullText.includes(kw.toLowerCase())) { score += 30; matched.push(kw); }
            }
            for (const kw of rule.assist || []) {
                if (fullText.includes(kw.toLowerCase())) { score += 15; matched.push(kw); }
            }
            if (rule.suppress) {
                const hasSuppress = rule.suppress.some(kw => fullText.includes(kw.toLowerCase()));
                if (hasSuppress) score -= 30;
            }
            if ((libId === '金句库' || libId === '幽默素材库' || libId === '情绪库') && (item.comments || []).length > 0) {
                const highLikes = item.comments.some(c => (c.likes || 0) >= 100);
                if (highLikes) score += 15; else score += 5;
            }
            if (item.tags && item.tags.length) {
                const tagText = item.tags.join(' ').toLowerCase();
                for (const kw of [...(rule.core || []), ...(rule.assist || [])]) {
                    if (tagText.includes(kw.toLowerCase())) score += 10;
                }
            }
            const oldMap = {'热梗':'热梗素材库','冲突':'冲突素材库','钩子':'钩子素材库','反转':'反转素材库','人设':'人设基因库','场景':'场景库','金句':'金句库','幽默':'幽默素材库','情绪':'情绪库','评论金句':'金句库'};
            if (oldMap[item.category || item.type] === libId) score += 20;

            score = Math.max(0, Math.min(100, score));
            if (score >= 35) {
                results.push({ libId, confidence: score, reason: rule.reason + (matched.length ? '（命中：' + matched.slice(0, 3).join('、') + '）' : ''), checked: score >= 55 });
            }
        }
        results.sort((a, b) => b.confidence - a.confidence);
        if (results.length === 0) {
            const oldMap = {'热梗':'热梗素材库','冲突':'冲突素材库','钩子':'钩子素材库','反转':'反转素材库','人设':'人设基因库','场景':'场景库','金句':'金句库','幽默':'幽默素材库','情绪':'情绪库','评论金句':'金句库'};
            const fallback = oldMap[item.category || item.type] || '热梗素材库';
            results.push({ libId: fallback, confidence: 50, reason: '按原单分类兜底', checked: true });
        }
        return results;
    },

    save: function() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },

    refresh: function() {
        showToast('正在重新加载热点数据...', 'info');
        this._initialized = false;
        this.data = [];
        this.selected.clear();
        this.currentPage = 1;
        this.init();
    },

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
        // 晋江标签筛选
        if (this.filters.jjTag.cat !== 'all' && this.filters.jjTag.tag !== 'all') {
            const cat = this.filters.jjTag.cat;
            const tag = this.filters.jjTag.tag;
            items = items.filter(i => {
                return i.jjTags && i.jjTags[cat] && i.jjTags[cat].includes(tag);
            });
        }
        if (this.filters.keyword) {
            const kw = this.filters.keyword.toLowerCase();
            items = items.filter(i => {
                // 搜索标题、内容、标签、晋江标签
                const searchText = [
                    i.title, i.content, (i.tags || []).join(' '),
                    i.platform, i.category
                ].join(' ').toLowerCase();
                // 也搜索晋江标签
                const jjSearch = i.jjTags ? Object.values(i.jjTags).flat().join(' ').toLowerCase() : '';
                return searchText.includes(kw) || jjSearch.includes(kw);
            });
        }
        return items;
    },

    getPlatforms: function() {
        const set = new Set();
        this.data.forEach(d => { if (d.platform) set.add(d.platform); });
        return Array.from(set);
    },

    getTypes: function() {
        const set = new Set();
        this.data.forEach(d => {
            const category = d.category || d.type;
            if (category) set.add(category);
            (d.targetLibs || []).forEach(t => set.add(t.libId));
        });
        return Array.from(set);
    },

    findDuplicates: function() {
        const groups = {};
        for (let i = 0; i < this.data.length; i++) {
            const title = (this.data[i].title || '').trim();
            if (!title) continue;
            const key = title.substring(0, 15);
            if (!groups[key]) groups[key] = [];
            groups[key].push(i);
        }
        const dupIndices = new Set();
        for (const key in groups) {
            if (groups[key].length > 1) {
                groups[key].forEach(idx => dupIndices.add(idx));
            }
        }
        return dupIndices;
    },

    render: function() {
        if (!this._initialized) this.init();
        const content = document.getElementById('contentArea');
        const platforms = this.getPlatforms();
        const types = this.getTypes();
        const jjTagOptions = this.getJJTagOptions();
        const items = this.getFiltered();
        const autoCount = this.data.filter(d => d.source === 'auto').length;
        const manualCount = this.data.filter(d => d.source !== 'auto').length;
        const importedCount = this.data.filter(d => d.imported).length;
        const dupIndices = this.findDuplicates();
        const selectedCount = this.selected.size;

        let html = `
        <div class="hotspot-module">
            <div class="hs-stats-bar">
                <div class="hs-stat"><span class="hs-stat-num">${this.data.length}</span><span class="hs-stat-label">热点总数</span></div>
                <div class="hs-stat"><span class="hs-stat-num">${autoCount}</span><span class="hs-stat-label">自动抓取</span></div>
                <div class="hs-stat"><span class="hs-stat-num">${manualCount}</span><span class="hs-stat-label">手动录入</span></div>
                <div class="hs-stat"><span class="hs-stat-num">${importedCount}</span><span class="hs-stat-label">已入库</span></div>
                ${dupIndices.size > 0 ? `<div class="hs-stat" style="background:#fff3cd;"><span class="hs-stat-num" style="color:#856404;">${dupIndices.size}</span><span class="hs-stat-label">疑似重复</span></div>` : ''}
                ${this.lastUpdate ? `<div class="hs-stat"><span class="hs-stat-num" style="font-size:14px;">${this.lastUpdate}</span><span class="hs-stat-label">最近抓取</span></div>` : ''}
            </div>

            <div class="hs-info-bar">
                <span class="hs-info-icon">ℹ️</span>
                <span>数据来源：自动抓取任务每天 8:00 / 20:00 执行，写入 hot-topics.json 后自动合并到本地。<b>打开页面不会重新抓取</b>，只加载已有数据。单次抓取量 50-80 条，无前端展示上限。</span>
            </div>

            <div class="hs-toolbar">
                <div class="search-box">
                    <input type="text" id="hsSearch" placeholder="搜索标题/内容/标签/晋江标签..." value="${this.filters.keyword}" oninput="HotspotModule.filters.keyword=this.value; HotspotModule.currentPage=1; HotspotModule.renderList()">
                </div>
                <select class="filter-select" onchange="HotspotModule.filters.platform=this.value; HotspotModule.currentPage=1; HotspotModule.renderList()">
                    <option value="all">平台: 全部</option>
                    ${platforms.map(p => `<option value="${p}" ${this.filters.platform===p?'selected':''}>${p}</option>`).join('')}
                </select>
                <select class="filter-select" onchange="HotspotModule.filters.type=this.value; HotspotModule.currentPage=1; HotspotModule.renderList()">
                    <option value="all">素材库: 全部</option>
                    ${types.map(t => `<option value="${t}" ${this.filters.type===t?'selected':''}>${t}</option>`).join('')}
                </select>
                <select class="filter-select" id="hsJJCatSel" onchange="HotspotModule.onJJCatChange(this.value)">
                    <option value="all">晋江标签: 全部</option>
                    ${Object.entries(this.JJ_TAG_SYSTEM).map(([k,v]) => `<option value="${k}" ${this.filters.jjTag.cat===k?'selected':''}>${v.icon} ${v.label}</option>`).join('')}
                </select>
                <select class="filter-select" id="hsJJTagSel" onchange="HotspotModule.filters.jjTag.tag=this.value; HotspotModule.currentPage=1; HotspotModule.renderList()" ${this.filters.jjTag.cat==='all'?'disabled':''}>
                    <option value="all">标签: 全部</option>
                    ${this.filters.jjTag.cat !== 'all' ? (jjTagOptions[this.filters.jjTag.cat] || []).map(t => `<option value="${t}" ${this.filters.jjTag.tag===t?'selected':''}>${t}</option>`).join('') : ''}
                </select>
                <button class="btn btn-primary" onclick="HotspotModule.openEditor()">+ 手动新增</button>
                <button class="btn btn-secondary" onclick="HotspotModule.refresh()">🔄 刷新数据</button>
                <button class="btn btn-success" onclick="HotspotModule.batchImport()">📥 批量入库</button>
                ${selectedCount > 0 ? `<button class="btn btn-accent" onclick="HotspotModule.openBatchTagEditor()">🏷️ 批量打标签(${selectedCount})</button>` : ''}
                ${selectedCount > 0 ? `<button class="btn btn-danger" onclick="HotspotModule.batchDeleteSelected()">🗑️ 删除选中(${selectedCount})</button>` : ''}
                ${dupIndices.size > 0 ? `<button class="btn btn-warning" onclick="HotspotModule.selectDuplicates()">⚠️ 选中${dupIndices.size}条重复</button>` : ''}
            </div>

            <div class="hs-page-size-bar">
                <span class="hs-page-size-label">每页显示：</span>
                <select class="filter-select hs-page-size-select" onchange="HotspotModule.pageSize=parseInt(this.value); HotspotModule.currentPage=1; HotspotModule.renderList()">
                    <option value="30" ${this.pageSize===30?'selected':''}>30 条</option>
                    <option value="50" ${this.pageSize===50?'selected':''}>50 条</option>
                    <option value="80" ${this.pageSize===80?'selected':''}>80 条（推荐）</option>
                    <option value="100" ${this.pageSize===100?'selected':''}>100 条</option>
                </select>
                <span class="hs-page-info" id="hsPageInfo"></span>
            </div>

            <div id="hsList"></div>
        </div>`;

        content.innerHTML = html;
        this.renderList();
    },

    onJJCatChange: function(cat) {
        this.filters.jjTag.cat = cat;
        this.filters.jjTag.tag = 'all';
        this.currentPage = 1;
        // 更新标签下拉
        const tagSel = document.getElementById('hsJJTagSel');
        if (cat === 'all') {
            tagSel.disabled = true;
            tagSel.innerHTML = '<option value="all">标签: 全部</option>';
        } else {
            tagSel.disabled = false;
            const options = this.getJJTagOptions()[cat] || [];
            tagSel.innerHTML = '<option value="all">标签: 全部</option>' + options.map(t => `<option value="${t}">${t}</option>`).join('');
        }
        this.renderList();
    },

    renderList: function() {
        const wrap = document.getElementById('hsList');
        if (!wrap) return;
        const items = this.getFiltered();
        const dupIndices = this.findDuplicates();
        const totalPages = Math.max(1, Math.ceil(items.length / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = 1;
        const start = (this.currentPage - 1) * this.pageSize;
        const end = Math.min(start + this.pageSize, items.length);
        const pageItems = items.slice(start, end);

        // 更新分页信息
        const pageInfo = document.getElementById('hsPageInfo');
        if (pageInfo) {
            pageInfo.textContent = `第 ${this.currentPage} / ${totalPages} 页 · 共 ${items.length} 条`;
        }

        if (items.length === 0) {
            wrap.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-light);">
                <div style="font-size:48px;margin-bottom:12px;">🌐</div>
                <div>暂无热点数据</div>
                <div style="font-size:13px;margin-top:8px;">自动抓取每天8:00/20:00更新，也可手动新增</div>
            </div>`;
            return;
        }

        // 全选 checkbox（当前页全选）
        let html = '<div class="hs-batch-header">';
        html += `<label class="hs-select-all"><input type="checkbox" onchange="HotspotModule.toggleSelectAll(this.checked)" ${this.selected.size === pageItems.length && pageItems.length > 0 ? 'checked' : ''}> 全选本页</label>`;
        html += `<span style="color:var(--text-light);font-size:13px;">显示 ${start + 1}-${end} / ${items.length} 条${items.length > this.pageSize ? '（分页中）' : ''}</span>`;
        html += '</div>';

        html += '<div class="hs-card-list">';
        for (let i = 0; i < pageItems.length; i++) {
            const item = pageItems[i];
            const realIdx = this.data.indexOf(item);
            const platformIcon = this.getPlatformIcon(item.platform);
            const heatBar = item.heat ? `<div class="hs-heat"><span class="hs-heat-label">热度</span><div class="hs-heat-bar"><div class="hs-heat-fill" style="width:${Math.min(item.heat, 100)}%"></div></div><span class="hs-heat-val">${item.heat || '—'}</span></div>` : '';
            const isDup = dupIndices.has(realIdx);
            const isSelected = this.selected.has(realIdx);

            // 多库标签展示
            const targetLibs = item.targetLibs || [];
            const libTags = targetLibs.map(t => {
                const lib = SCHEMA.getLibrary(t.libId);
                const icon = lib ? lib.icon : '📌';
                return `<span class="hs-lib-tag ${t.checked ? 'checked' : ''}" title="${escapeAttr(t.reason || '')} 置信度:${t.confidence}">${icon} ${t.libId} <small>${t.confidence}</small></span>`;
            }).join('');

            // 晋江标签展示
            const jjTagsHtml = this.renderJJTagsHtml(item.jjTags);

            const primaryLib = targetLibs.find(t => t.checked) || targetLibs[0];
            const primaryBtn = item.imported
                ? `<button class="btn btn-sm btn-secondary" disabled>✅ 已入库</button>`
                : (primaryLib ? `<button class="btn btn-sm btn-success" onclick="HotspotModule.openMultiImport(${realIdx})">📥 入 ${primaryLib.libId}</button>` : '📥 入库');

            const urlLink = item.url
                ? `<a href="${escapeAttr(item.url)}" target="_blank" class="hs-source-link" title="查看原文">🔗 原文链接</a>`
                : (item.sourceUrl
                    ? `<a href="${escapeAttr(item.sourceUrl)}" target="_blank" class="hs-source-link" title="查看原文">🔗 原文链接</a>`
                    : '');

            html += `
            <div class="hs-card ${item.imported ? 'imported' : ''} ${item.source === 'auto' ? 'auto' : 'manual'} ${isDup ? 'duplicate' : ''} ${isSelected ? 'selected' : ''}">
                <div class="hs-card-select">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="HotspotModule.toggleSelect(${realIdx}, this.checked)">
                </div>
                <div class="hs-card-body">
                    <div class="hs-card-header">
                        <span class="hs-platform">${platformIcon} ${item.platform || '未知'}</span>
                        <span class="hs-category">${item.category || item.type || '未分类'}</span>
                        ${item.source === 'auto' ? '<span class="hs-source-badge">🤖 自动</span>' : '<span class="hs-source-badge manual">✍️ 手动</span>'}
                        ${item.imported ? '<span class="hs-imported-badge">✅ 已入库</span>' : ''}
                        ${isDup ? '<span class="hs-dup-badge">⚠️ 疑似重复</span>' : ''}
                    </div>
                    <div class="hs-card-title">${escapeHtml(item.title || '无标题')}</div>
                    <div class="hs-card-content">${escapeHtml((item.content || '').substring(0, 200))}${(item.content || '').length > 200 ? '...' : ''}</div>
                    ${urlLink}
                    ${jjTagsHtml}
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
                            <button class="btn btn-sm btn-success" onclick="HotspotModule.openMultiImport(${realIdx})">${item.imported ? '🔄 重新入库' : (primaryLib ? '📥 入 ' + primaryLib.libId : '📥 入库')}</button>
                            <button class="btn btn-sm btn-accent" onclick="HotspotModule.openTagEditor(${realIdx})">🏷️ 标签</button>
                            <button class="btn btn-sm btn-secondary" onclick="HotspotModule.openEditor(${realIdx})">编辑</button>
                            <button class="btn btn-sm btn-danger" onclick="HotspotModule.delete(${realIdx})">删除</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        html += '</div>';

        // 分页控件
        html += this.renderPagination(totalPages);

        wrap.innerHTML = html;
    },

    // 渲染晋江标签HTML（卡片上的紧凑展示）
    renderJJTagsHtml: function(jjTags) {
        if (!jjTags) return '';
        let html = '<div class="hs-jj-tags">';
        for (const [catKey, cat] of Object.entries(this.JJ_TAG_SYSTEM)) {
            const tags = jjTags[catKey];
            if (tags && tags.length) {
                html += `<span class="hs-jj-cat">${cat.icon} ${cat.label}：</span>`;
                for (const t of tags) {
                    html += `<span class="hs-jj-tag hs-jj-${catKey}" onclick="HotspotModule.filterByJJTag('${catKey}','${escapeAttr(t)}')">${t}</span>`;
                }
            }
        }
        html += '</div>';
        return html;
    },

    // 点击晋江标签快速筛选
    filterByJJTag: function(cat, tag) {
        this.filters.jjTag.cat = cat;
        this.filters.jjTag.tag = tag;
        this.currentPage = 1;
        // 更新下拉
        const catSel = document.getElementById('hsJJCatSel');
        const tagSel = document.getElementById('hsJJTagSel');
        if (catSel) catSel.value = cat;
        if (tagSel) {
            tagSel.disabled = false;
            const options = this.getJJTagOptions()[cat] || [];
            tagSel.innerHTML = '<option value="all">标签: 全部</option>' + options.map(t => `<option value="${t}" ${t===tag?'selected':''}>${t}</option>`).join('');
        }
        this.renderList();
    },

    // 渲染分页控件
    renderPagination: function(totalPages) {
        if (totalPages <= 1) return '';

        let html = '<div class="hs-pagination">';
        // 上一页
        html += `<button class="hs-page-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="HotspotModule.goToPage(${this.currentPage - 1})">‹ 上一页</button>`;

        // 页码（最多显示7个）
        const maxBtns = 7;
        let startPage = Math.max(1, this.currentPage - 3);
        let endPage = Math.min(totalPages, startPage + maxBtns - 1);
        if (endPage - startPage < maxBtns - 1) {
            startPage = Math.max(1, endPage - maxBtns + 1);
        }

        if (startPage > 1) {
            html += `<button class="hs-page-btn" onclick="HotspotModule.goToPage(1)">1</button>`;
            if (startPage > 2) html += '<span class="hs-page-ellipsis">...</span>';
        }
        for (let p = startPage; p <= endPage; p++) {
            html += `<button class="hs-page-btn ${p === this.currentPage ? 'active' : ''}" onclick="HotspotModule.goToPage(${p})">${p}</button>`;
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += '<span class="hs-page-ellipsis">...</span>';
            html += `<button class="hs-page-btn" onclick="HotspotModule.goToPage(${totalPages})">${totalPages}</button>`;
        }

        // 下一页
        html += `<button class="hs-page-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="HotspotModule.goToPage(${this.currentPage + 1})">下一页 ›</button>`;

        // 跳转
        html += `<span class="hs-page-jump">第 <input type="number" min="1" max="${totalPages}" value="${this.currentPage}" style="width:50px;" onchange="HotspotModule.goToPage(parseInt(this.value))"> 页</span>`;
        html += '</div>';
        return html;
    },

    goToPage: function(page) {
        const items = this.getFiltered();
        const totalPages = Math.max(1, Math.ceil(items.length / this.pageSize));
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        this.currentPage = page;
        this.renderList();
        // 滚动到列表顶部
        const wrap = document.getElementById('hsList');
        if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    toggleSelect: function(idx, checked) {
        if (checked) { this.selected.add(idx); } else { this.selected.delete(idx); }
        this.updateSelectionUI();
    },

    toggleSelectAll: function(checked) {
        const items = this.getFiltered();
        const start = (this.currentPage - 1) * this.pageSize;
        const end = Math.min(start + this.pageSize, items.length);
        const pageItems = items.slice(start, end);
        if (checked) {
            for (const item of pageItems) {
                const realIdx = this.data.indexOf(item);
                this.selected.add(realIdx);
            }
        } else {
            for (const item of pageItems) {
                const realIdx = this.data.indexOf(item);
                this.selected.delete(realIdx);
            }
        }
        this.renderList();
    },

    selectDuplicates: function() {
        const dupIndices = this.findDuplicates();
        const groups = {};
        const indices = Array.from(dupIndices).sort((a, b) => a - b);
        for (const idx of indices) {
            const title = (this.data[idx].title || '').trim().substring(0, 15);
            if (!groups[title]) groups[title] = [];
            groups[title].push(idx);
        }
        for (const title in groups) {
            for (let i = 1; i < groups[title].length; i++) {
                this.selected.add(groups[title][i]);
            }
        }
        showToast(`已选中 ${this.selected.size} 条重复热点（每组保留最早一条）`, 'info');
        this.render();
    },

    updateSelectionUI: function() {
        const selectAllCb = document.querySelector('.hs-select-all input');
        if (selectAllCb) {
            const items = this.getFiltered();
            const start = (this.currentPage - 1) * this.pageSize;
            const end = Math.min(start + this.pageSize, items.length);
            const pageItems = items.slice(start, end);
            const allSelected = pageItems.length > 0 && pageItems.every(item => this.selected.has(this.data.indexOf(item)));
            selectAllCb.checked = allSelected;
        }
    },

    batchDeleteSelected: function() {
        if (this.selected.size === 0) { showToast('请先选择要删除的热点', 'info'); return; }
        const count = this.selected.size;
        if (!confirm(`确定删除选中的 ${count} 条热点吗？此操作不可撤销。`)) return;
        const indices = Array.from(this.selected).sort((a, b) => b - a);
        for (const idx of indices) { this.data.splice(idx, 1); }
        this.selected.clear();
        this.save();
        showToast(`已删除 ${count} 条热点`, 'success');
        this.render();
        renderNav();
    },

    // ====== 单条标签编辑器 ======
    openTagEditor: function(idx) {
        const item = this.data[idx];
        if (!item) return;
        if (!item.jjTags) item.jjTags = this.autoTagJJ(item);

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');
        modalTitle.textContent = '编辑晋江标签';

        let html = `<div class="hs-tag-editor">
            <div class="hs-tag-editor-header">
                <div class="hs-tag-editor-title">${escapeHtml(item.title || '')}</div>
                <div class="hs-tag-editor-meta">${item.platform || ''} · ${item.category || ''}</div>
            </div>`;

        for (const [catKey, cat] of Object.entries(this.JJ_TAG_SYSTEM)) {
            const currentTags = item.jjTags[catKey] || [];
            // 所有可选标签 + 当前已有但不在系统中的
            const allTags = Object.keys(cat.tags);
            const extra = currentTags.filter(t => !allTags.includes(t));
            const displayTags = [...allTags, ...extra];

            html += `<div class="hs-tag-cat">
                <div class="hs-tag-cat-header">${cat.icon} ${cat.label}</div>
                <div class="hs-tag-cat-tags">`;
            for (const tag of displayTags) {
                const checked = currentTags.includes(tag);
                html += `<label class="hs-tag-chip ${checked ? 'checked' : ''}">
                    <input type="checkbox" value="${escapeAttr(tag)}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('checked', this.checked)">
                    ${tag}
                </label>`;
            }
            // 添加自定义标签
            html += `<input type="text" class="hs-tag-add-input" placeholder="+ 自定义${cat.label}标签" onkeydown="if(event.key==='Enter'){HotspotModule.addCustomTag(this, '${catKey}')}">`;
            html += `</div></div>`;
        }

        html += `<div class="hs-tag-editor-actions">
            <button class="btn btn-sm btn-secondary" onclick="HotspotModule.reAutoTag(${idx})">🔄 重新自动打标</button>
        </div></div>`;

        modalBody.innerHTML = html;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="HotspotModule.saveTags(${idx})">保存标签</button>
        `;
        openModal();
    },

    addCustomTag: function(input, catKey) {
        const val = input.value.trim();
        if (!val) return;
        // 创建新chip
        const container = input.parentElement;
        const label = document.createElement('label');
        label.className = 'hs-tag-chip checked';
        label.innerHTML = `<input type="checkbox" value="${escapeAttr(val)}" checked onchange="this.parentElement.classList.toggle('checked', this.checked)">${val}`;
        container.insertBefore(label, input);
        input.value = '';
    },

    reAutoTag: function(idx) {
        const item = this.data[idx];
        if (!item) return;
        item.jjTags = this.autoTagJJ(item);
        showToast('已重新自动打标', 'info');
        this.openTagEditor(idx);
    },

    saveTags: function(idx) {
        const item = this.data[idx];
        if (!item) return;
        const allNew = {};
        const catDivs = document.querySelectorAll('.hs-tag-cat');
        catDivs.forEach((div, i) => {
            const catKey = Object.keys(this.JJ_TAG_SYSTEM)[i];
            const checked = Array.from(div.querySelectorAll('.hs-tag-chip input:checked')).map(cb => cb.value);
            allNew[catKey] = checked;
        });
        item.jjTags = allNew;
        this.save();
        closeModal();
        showToast('标签已保存', 'success');
        this.renderList();
    },

    // ====== 批量标签编辑器 ======
    openBatchTagEditor: function() {
        if (this.selected.size === 0) { showToast('请先选择热点', 'info'); return; }
        const indices = Array.from(this.selected);
        // 汇总当前选中项已有的标签
        const existing = {};
        for (const catKey of Object.keys(this.JJ_TAG_SYSTEM)) {
            existing[catKey] = {};
        }
        for (const idx of indices) {
            const item = this.data[idx];
            if (item.jjTags) {
                for (const [catKey, tags] of Object.entries(item.jjTags)) {
                    if (Array.isArray(tags)) {
                        for (const t of tags) {
                            if (!existing[catKey][t]) existing[catKey][t] = 0;
                            existing[catKey][t]++;
                        }
                    }
                }
            }
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');
        modalTitle.textContent = `批量编辑标签（${indices.length} 条）`;

        let html = '<div class="hs-tag-editor"><div class="hs-batch-tag-tip">💡 勾选的标签将<b>追加</b>到所有选中热点上，不会清除已有标签。取消勾选不会移除。</div>';

        for (const [catKey, cat] of Object.entries(this.JJ_TAG_SYSTEM)) {
            const allTags = Object.keys(cat.tags);
            // 加上已有的额外标签
            const extra = Object.keys(existing[catKey]).filter(t => !allTags.includes(t));
            const displayTags = [...allTags, ...extra];

            html += `<div class="hs-tag-cat">
                <div class="hs-tag-cat-header">${cat.icon} ${cat.label}</div>
                <div class="hs-tag-cat-tags">`;
            for (const tag of displayTags) {
                const count = existing[catKey][tag] || 0;
                const hint = count > 0 ? `（${count}/${indices.length}已有）` : '';
                html += `<label class="hs-tag-chip">
                    <input type="checkbox" value="${escapeAttr(tag)}" onchange="this.parentElement.classList.toggle('checked', this.checked)">
                    ${tag}${hint}
                </label>`;
            }
            html += `<input type="text" class="hs-tag-add-input" placeholder="+ 自定义${cat.label}标签" onkeydown="if(event.key==='Enter'){HotspotModule.addCustomTag(this, '${catKey}')}">`;
            html += `</div></div>`;
        }
        html += '</div>';

        modalBody.innerHTML = html;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="HotspotModule.confirmBatchTags()">追加标签到选中项</button>
        `;
        openModal();
    },

    confirmBatchTags: function() {
        const indices = Array.from(this.selected);
        const catDivs = document.querySelectorAll('.hs-tag-cat');
        const tagsToAdd = {};
        catDivs.forEach((div, i) => {
            const catKey = Object.keys(this.JJ_TAG_SYSTEM)[i];
            const checked = Array.from(div.querySelectorAll('.hs-tag-chip input:checked')).map(cb => cb.value);
            tagsToAdd[catKey] = checked;
        });

        let updated = 0;
        for (const idx of indices) {
            const item = this.data[idx];
            if (!item.jjTags) item.jjTags = this.autoTagJJ(item);
            for (const [catKey, tags] of Object.entries(tagsToAdd)) {
                if (!item.jjTags[catKey]) item.jjTags[catKey] = [];
                for (const t of tags) {
                    if (!item.jjTags[catKey].includes(t)) {
                        item.jjTags[catKey].push(t);
                    }
                }
            }
            updated++;
        }
        this.save();
        closeModal();
        showToast(`已为 ${updated} 条热点追加标签`, 'success');
        this.renderList();
    },

    getPlatformIcon: function(platform) {
        const icons = {
            '微博':'🔴','抖音':'🎵','小红书':'📕','知乎':'💙',
            '今日头条':'📰','B站':'📺','豆瓣':'🎬','快手':'⚡',
            '百度':'🔍','腾讯新闻':'🐧'
        };
        return icons[platform] || '📌';
    },

    openMultiImport: function(idx) {
        const item = this.data[idx];
        if (!item) return;
        if (item.imported) {
            if (!confirm('该热点已入库，确定要再次入库吗？这会在素材库中创建重复条目。')) return;
        }
        if (!item.targetLibs || !item.targetLibs.length) {
            item.targetLibs = this.analyzeTargetLibs(item);
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');
        modalTitle.textContent = '多库入库校正';

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

        const allLibIds = Object.keys(this.LIB_MAP);
        const existingIds = new Set(item.targetLibs.map(t => t.libId));
        const extraOptions = allLibIds.filter(id => !existingIds.has(id)).map(id => {
            const lib = SCHEMA.getLibrary(id);
            return `<option value="${id}">${lib ? lib.icon : '📌'} ${id}</option>`;
        }).join('');

        modalBody.innerHTML = `
            <div class="hs-mi-header">
                <div class="hs-mi-source-title">${escapeHtml(item.title || '')}</div>
                <div class="hs-mi-source-meta">${item.platform || ''} · 热度 ${item.heat || '—'}${item.imported ? ' · ⚠️ 已入库过' : ''}</div>
                ${item.url || item.sourceUrl ? `<a href="${escapeAttr(item.url || item.sourceUrl)}" target="_blank" class="hs-source-link">🔗 查看原文</a>` : ''}
            </div>
            <div class="hs-mi-list">${rows || '<div style="padding:20px;text-align:center;color:var(--text-light);">暂无推荐入库角度</div>'}</div>
            <div class="hs-mi-add">
                <label>手动添加其他素材库：</label>
                <select id="mi-add-lib"><option value="">选择素材库...</option>${extraOptions}</select>
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
        const row = document.querySelector(`.hs-mi-row[data-idx="${i}"]`);
        if (!row) return;
        const cb = document.getElementById(`mi-check-${i}`);
        if (event && event.target !== cb) { cb.checked = !cb.checked; }
        row.classList.toggle('checked', cb.checked);
    },

    addManualLib: function(idx) {
        const item = this.data[idx];
        const select = document.getElementById('mi-add-lib');
        const libId = select.value;
        if (!libId) return;
        if (!item.targetLibs) item.targetLibs = [];
        if (item.targetLibs.some(t => t.libId === libId)) { showToast('该库已在列表中', 'warning'); return; }
        item.targetLibs.push({ libId, confidence: 60, reason: '手动添加', checked: true });
        this.save();
        this.openMultiImport(idx);
    },

    confirmMultiImport: function(idx) {
        const item = this.data[idx];
        if (!item || !item.targetLibs) return;
        item.targetLibs.forEach((t, i) => {
            const cb = document.getElementById(`mi-check-${i}`);
            if (cb) t.checked = cb.checked;
        });
        const selected = item.targetLibs.filter(t => t.checked);
        if (selected.length === 0) { showToast('请至少选择一个素材库', 'warning'); return; }

        let importedCount = 0;
        let goldenCount = 0;
        for (const t of selected) {
            if (this.importSingleToLib(item, t.libId)) importedCount++;
        }
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

    importSingleToLib: function(item, libId) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return false;
        const fields = this.buildFieldsForLib(item, libId);
        Store.addItem(libId, fields);
        return true;
    },

    buildFieldsForLib: function(item, libId) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return {};
        const fields = {};
        fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(libId));
        // 晋江标签拼入类型标签
        const jjTagStr = item.jjTags ? Object.values(item.jjTags).flat().join('、') : '';

        if (libId === '热梗素材库') {
            fields['类型标签'] = (item.tags || []).map(t => '#' + t).join(' ') + (jjTagStr ? ' #' + jjTagStr.replace(/、/g, ' #') : '');
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
            fields['性格标签'] = (item.tags || []).join('、') + (jjTagStr ? '、' + jjTagStr : '');
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
            for (const h of lib.headers) {
                if (h === '编号') continue;
                if (h.includes('标签')) fields[h] = (item.tags || []).map(t => '#' + t).join(' ') + (jjTagStr ? ' #' + jjTagStr.replace(/、/g, ' #') : '');
                else if (h.includes('平台') || h.includes('来源')) fields[h] = item.platform || '';
                else if (h.includes('内容') || h.includes('原文') || h.includes('方向')) fields[h] = item.content || '';
                else if (h.includes('类型') || h.includes('分类')) fields[h] = item.category || '';
                else if (h.includes('情绪') || h.includes('情感')) fields[h] = this.extractEmotionCurve(item);
                else fields[h] = '';
            }
        }
        return fields;
    },

    buildFieldsPreview: function(item, libId) {
        const fields = this.buildFieldsForLib(item, libId);
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return fields;
        const preview = {};
        for (const key of lib.displayFields || Object.keys(fields)) {
            if (fields[key]) preview[key] = fields[key];
        }
        return preview;
    },

    extractPrimaryEmotion: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '')).toLowerCase();
        const emotions = {
            '感动': ['感动','泪目','破防','温暖','治愈'],
            '愤怒': ['愤怒','气愤','不公','欺负'],
            '自豪': ['自豪','骄傲','文化自信','热血','振奋'],
            '焦虑': ['焦虑','担忧','压力','迷茫','内卷'],
            '喜悦': ['喜悦','开心','欢乐','搞笑','可爱'],
            '反转': ['意外','震惊','没想到','竟然']
        };
        for (const [emotion, kws] of Object.entries(emotions)) {
            if (kws.some(kw => text.includes(kw))) return emotion;
        }
        return '共鸣';
    },

    extractEmotionCurve: function(item) {
        const text = ((item.title || '') + ' ' + (item.content || '')).toLowerCase();
        if (text.includes('反转') || text.includes('意外')) return '意外→释然/震惊';
        if (text.includes('争议') || text.includes('批评')) return '关注→愤怒→反思';
        if (text.includes('感动') || text.includes('泪目')) return '平静→感动→回味';
        if (text.includes('搞笑') || text.includes('可爱')) return '平淡→发笑→共鸣';
        if (text.includes('崛起') || text.includes('逆袭')) return '压抑→燃→自豪';
        return '关注→共鸣→讨论';
    },

    extractStoryAngle: function(item, angle) {
        const content = item.content || item.title || '';
        if (angle === '热梗') return '借用热点事件作为故事引子，引发读者共鸣';
        if (angle === '冲突') return '将事件中的矛盾提炼为人物冲突原型';
        if (angle === '场景') return '提取事件中的视觉化场景作为故事背景';
        if (angle === '金句') return '将核心文案作为章节点睛句';
        return content.substring(0, 40);
    },

    extractRoleIdentity: function(item) {
        const text = (item.title || '') + ' ' + (item.content || '');
        if (text.includes('教授')) return '学者/评论者';
        if (text.includes('导演')) return '电影创作者';
        if (text.includes('演员')) return '演员/公众人物';
        if (text.includes('博主')) return '自媒体博主';
        if (text.includes('网友')) return '网民/围观者';
        return '热点事件参与者';
    },

    importToLib: function(idx, libId) { this.openMultiImport(idx); },

    batchImport: function() {
        const unimported = this.data.filter(d => !d.imported);
        if (unimported.length === 0) { showToast('没有待入库的热点', 'info'); return; }
        for (const item of unimported) {
            if (!item.targetLibs || !item.targetLibs.length) item.targetLibs = this.analyzeTargetLibs(item);
        }

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');
        modalTitle.textContent = '批量入库确认';

        const stats = {};
        for (const item of unimported) {
            for (const t of (item.targetLibs || [])) {
                if (t.checked) stats[t.libId] = (stats[t.libId] || 0) + 1;
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
                <div class="hs-batch-stats">${statRows || '<div style="color:var(--text-light)">暂无推荐入库角度，请先到单条热点中校正。</div>'}</div>
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
            tags: [], heat: 50, source: 'manual', comments: [], targetLibs: [], url: '', jjTags: {}
        };
        if (isEdit && (!item.targetLibs || !item.targetLibs.length)) item.targetLibs = this.analyzeTargetLibs(item);
        if (isEdit && !item.jjTags) item.jjTags = this.autoTagJJ(item);
        if (!isEdit) item.jjTags = this.autoTagJJ(item);

        const platforms = ['微博','抖音','小红书','知乎','今日头条','B站','豆瓣','快手','百度','其他'];
        const categories = ['热梗','冲突','钩子','反转','人设','场景','金句','幽默','情绪','评论金句'];

        const libOptions = Object.keys(this.LIB_MAP).map(libId => {
            const lib = SCHEMA.getLibrary(libId);
            const exists = (item.targetLibs || []).some(t => t.libId === libId);
            const checked = exists && (item.targetLibs || []).find(t => t.libId === libId).checked;
            return `<label class="hs-editor-lib ${checked ? 'checked' : ''}">
                <input type="checkbox" value="${libId}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('checked', this.checked)">
                <span>${lib ? lib.icon : '📌'} ${libId}</span>
            </label>`;
        }).join('');

        // 晋江标签编辑区
        let jjTagsHtml = '';
        for (const [catKey, cat] of Object.entries(this.JJ_TAG_SYSTEM)) {
            const currentTags = (item.jjTags && item.jjTags[catKey]) || [];
            const allTags = Object.keys(cat.tags);
            const extra = currentTags.filter(t => !allTags.includes(t));
            const displayTags = [...allTags, ...extra];
            jjTagsHtml += `<div class="hs-editor-jj-cat">
                <div class="hs-editor-jj-cat-header">${cat.icon} ${cat.label}</div>
                <div class="hs-editor-jj-cat-tags">`;
            for (const tag of displayTags) {
                const checked = currentTags.includes(tag);
                jjTagsHtml += `<label class="hs-tag-chip ${checked ? 'checked' : ''}">
                    <input type="checkbox" class="jj-tag-cb" data-cat="${catKey}" value="${escapeAttr(tag)}" ${checked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('checked', this.checked)">
                    ${tag}
                </label>`;
            }
            jjTagsHtml += `</div></div>`;
        }

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
                        <select id="hs-platform">${platforms.map(p => `<option value="${p}" ${item.platform===p?'selected':''}>${p}</option>`).join('')}</select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>分类</label>
                        <select id="hs-category">${categories.map(c => `<option value="${c}" ${item.category===c?'selected':''}>${c}</option>`).join('')}</select>
                    </div>
                    <div class="form-group">
                        <label>热度值 (0-100)</label>
                        <input type="number" id="hs-heat" value="${item.heat || 50}" min="0" max="100">
                    </div>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>原文链接 URL</label>
                    <input type="text" id="hs-url" value="${escapeAttr(item.url || item.sourceUrl || '')}" placeholder="https://...  （方便回溯原文）">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>内容详情</label>
                    <textarea id="hs-content" rows="5" placeholder="热点内容、故事梗概、改编方向等">${escapeHtml(item.content || '')}</textarea>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>标签（逗号分隔）</label>
                    <input type="text" id="hs-tags" value="${escapeAttr((item.tags || []).join(', '))}" placeholder="重生, 复仇, 甜宠">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>晋江全维度标签（点击切换，保存即生效）</label>
                    <div class="hs-editor-jj-tags">${jjTagsHtml}</div>
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                    <label>可入库角度（可多选，保存后按勾选库生成素材）</label>
                    <div class="hs-editor-libs">${libOptions}</div>
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
        const url = document.getElementById('hs-url').value.trim();

        if (!title) { showToast('请输入标题', 'warning'); return; }

        const tags = tagsStr ? tagsStr.split(/[,，\s]+/).map(t => t.replace(/^#/, '').trim()).filter(t => t) : [];
        const comments = commentsStr ? commentsStr.split('\n').filter(l => l.trim()).map(line => {
            const parts = line.split('|').map(p => p.trim());
            return { text: parts[0] || '', likes: parseInt(parts[1]) || 0 };
        }) : [];

        const checkedLibs = Array.from(document.querySelectorAll('.hs-editor-lib input:checked')).map(cb => cb.value);

        // 收集晋江标签
        const jjTags = {};
        for (const catKey of Object.keys(this.JJ_TAG_SYSTEM)) {
            const checked = Array.from(document.querySelectorAll(`.jj-tag-cb[data-cat="${catKey}"]:checked`)).map(cb => cb.value);
            jjTags[catKey] = checked;
        }

        const isEdit = idx >= 0;
        const baseItem = isEdit ? this.data[idx] : {};
        const item = {
            id: isEdit ? baseItem.id : ('hot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
            title, platform, category, heat, content, tags, comments, url, jjTags,
            source: isEdit ? baseItem.source : 'manual',
            imported: isEdit ? baseItem.imported : false,
            time: isEdit ? baseItem.time : new Date().toISOString().slice(0, 16).replace('T', ' '),
            createdAt: isEdit ? baseItem.createdAt : new Date().toISOString()
        };

        if (checkedLibs.length) {
            item.targetLibs = checkedLibs.map(libId => ({ libId, confidence: 70, reason: '手动指定', checked: true }));
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
            this.selected.delete(idx);
            const newSelected = new Set();
            for (const selIdx of this.selected) {
                if (selIdx > idx) newSelected.add(selIdx - 1);
                else newSelected.add(selIdx);
            }
            this.selected = newSelected;
            this.save();
            showToast('已删除', 'success');
            this.render();
            renderNav();
        }
    },

    clearImported: function() {
        const imported = this.data.filter(d => d.imported);
        if (imported.length === 0) { showToast('没有已入库的热点', 'info'); return; }
        if (confirm(`确定清除 ${imported.length} 条已入库热点？（不会影响已导入素材库的数据）`)) {
            this.data = this.data.filter(d => !d.imported);
            this.selected.clear();
            this.save();
            showToast('已清除', 'success');
            this.render();
            renderNav();
        }
    }
};
