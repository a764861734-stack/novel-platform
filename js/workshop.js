/**
 * 创作工作台模块集
 * 包含：每日工作台、章节质量检查、拆文分析、素材库维护、项目管理、收益计算器
 */

// ============ 每日工作台 ============
const DailyModule = {
    mode: 'creation', // 'creation' or 'operation'

    schedule: {
        creation: [
            { time: '07:00-07:30', task: '信息扫描', details: '1.晋江金榜前10章标题 2.新签约榜TOP10标签组合 3.新书榜前10热梗 4.微博文娱热搜TOP3', libAction: '热梗：速刷金榜段评记录点赞>100的梗；热梗改造(三要素变形)；冲突挖掘(裁判文书网)', libs: ['热梗素材库','冲突素材库'] },
            { time: '07:30-09:30', task: '核心创作时段1（主线剧情）', details: '语音输入法狂写4000字初稿(不纠错)，保底9000字拆3章。雪花写作法推进3000字主线', libAction: '每章必须包含1个钩子(伏笔/反转)', libs: ['钩子素材库','反转素材库'] },
            { time: '10:00-12:00', task: '核心创作时段2（填坑与埋伏笔）', details: '精修上午4000字，植入3个钩子。开篇3章须300字内强冲突+章末身份悬念', libAction: '插入1个热点梗(参考微博热搜)；每1500字插入1个热点梗', libs: ['热梗素材库','钩子素材库'] },
            { time: '12:00-13:00', task: '午餐+剧情脑暴', details: '手机录音记录新剧情灵感，观看同题材影视剧分析节奏', libAction: '整理读者反馈中的爽点/毒点', libs: [] },
            { time: '13:00-14:00', task: '数据运营与读者互动', details: '分析昨日VIP订阅率(低于15%需调整)，回复打赏≥100元读者私信', libAction: '每周分析百度指数趋势、读者评论情感曲线', libs: [] },
            { time: '14:00-15:30', task: '核心创作时段3（支线剧情）', details: '场景模板库快速写3000字支线，配角剧情补充世界观', libAction: '用配角剧情暗示主线危机；插入热点梗', libs: ['场景库','热梗素材库'] },
            { time: '16:00-17:30', task: '多平台引流', details: '小红书人设九宫格、微博投票、QQ群删减版片段引导', libAction: '制作人设图、宣传语', libs: [] },
            { time: '17:30-18:30', task: '碎片学习', details: '晋江头部作者写作课(2倍速)、影视IP分析播客', libAction: '记录改编要点', libs: [] },
            { time: '18:30-20:00', task: '爆款章节精修', details: '删减形容词强化动词，确保每章2个情绪爆点，形容词占比<20%', libAction: '情绪值检测：AI分析章节情绪曲线；黑马校对过滤敏感词', libs: ['情绪库','法律风险库'] },
            { time: '20:00-21:00', task: '读者社群维护', details: '粉丝群加更挑战、订阅打卡表(连续7天换番外)', libAction: '', libs: [] },
            { time: '21:00-22:00', task: '商业对接与版权筹备', details: '给编辑发邮件附数据+改编建议，更新IP提案包', libAction: '', libs: [] },
            { time: '22:00-22:30', task: '次日大纲制定', details: '三幕式表格规划每章核心冲突，标注必须出现的金句', libAction: '', libs: ['金句库'] },
            { time: '22:30-23:00', task: '脱敏准备睡眠', details: '床头便签记录灵感，备录音笔', libAction: '', libs: [] }
        ],
        operation: [
            { time: '06:30-07:00', task: '数据监控', details: '查看昨日订阅率/新增收藏，检查章节流失率(>20%需修改)，分析完读率(<70%重写前300字)', libAction: '记录到Excel预测模型', libs: [] },
            { time: '07:00-08:30', task: '存稿微调', details: '根据热点修改存稿，章节末添加订阅话术', libAction: '', libs: ['热梗素材库'] },
            { time: '08:30-09:00', task: '平台互动', details: '回复晋江评论区(优先打赏用户)，发布微博话题', libAction: '', libs: [] },
            { time: '09:00-12:00', task: '爆更发布', details: '分3次更新(9:00/12:00/18:00)每次2章，免费章末设卡点剧情倒逼VIP', libAction: '', libs: [] },
            { time: '12:00-13:30', task: '午餐+行业社交', details: '加入签约作者群交换推荐位资源', libAction: '', libs: [] },
            { time: '13:30-15:00', task: '版权推进', details: '向编辑提交IP提案包，联系版权经纪公司', libAction: '', libs: [] },
            { time: '15:00-16:30', task: '多平台引流', details: '小红书删减片段引导晋江，B站伪预告片', libAction: '', libs: [] },
            { time: '16:30-18:00', task: '读者运营', details: 'QQ群打赏冲榜活动，给TOP10打赏读者寄手写信', libAction: '', libs: [] },
            { time: '18:00-19:30', task: '晚餐+竞品分析', details: '拆解当日金榜作品开篇(钩子密度/节奏)', libAction: '记录钩子设置', libs: ['钩子素材库'] },
            { time: '19:30-21:00', task: '收益强化', details: '修改前10章定价(关键转折章千字5分)，申请全勤奖', libAction: '', libs: [] },
            { time: '21:00-22:00', task: '风险管控', details: '盗文雷达扫描盗版网站批量举报，备份全文至加密云盘', libAction: '', libs: ['法律风险库'] }
        ]
    },

    getCheckinKey: function() {
        const today = new Date().toISOString().slice(0, 10);
        return `daily_checkin_${this.mode}_${today}`;
    },

    getCheckinData: function() {
        return JSON.parse(localStorage.getItem(this.getCheckinKey()) || '[]');
    },

    toggleCheckin: function(idx) {
        const data = this.getCheckinData();
        const pos = data.indexOf(idx);
        if (pos >= 0) data.splice(pos, 1);
        else data.push(idx);
        localStorage.setItem(this.getCheckinKey(), JSON.stringify(data));
        this.render();
    },

    switchMode: function(mode) {
        this.mode = mode;
        this.render();
    },

    render: function() {
        const content = document.getElementById('contentArea');
        const tasks = this.schedule[this.mode];
        const checkinData = this.getCheckinData();
        const completed = checkinData.length;
        const total = tasks.length;
        const progress = Math.round(completed / total * 100);

        let html = `
        <div class="daily-workbench">
            <div class="wb-mode-switch">
                <button class="wb-mode-btn ${this.mode === 'creation' ? 'active' : ''}" onclick="DailyModule.switchMode('creation')">✍️ 创作期（完本阶段）</button>
                <button class="wb-mode-btn ${this.mode === 'operation' ? 'active' : ''}" onclick="DailyModule.switchMode('operation')">🚀 运营期（签约后）</button>
            </div>
            <div class="wb-progress-bar">
                <div class="wb-progress-fill" style="width:${progress}%"></div>
                <span class="wb-progress-text">今日完成 ${completed}/${total} (${progress}%)</span>
            </div>
            <div class="wb-timeline">`;

        tasks.forEach((task, idx) => {
            const checked = checkinData.includes(idx);
            html += `
                <div class="wb-task-card ${checked ? 'done' : ''}">
                    <div class="wb-task-time">${task.time}</div>
                    <div class="wb-task-body">
                        <div class="wb-task-header">
                            <span class="wb-task-name">${task.task}</span>
                            <label class="wb-checkbox">
                                <input type="checkbox" ${checked ? 'checked' : ''} onchange="DailyModule.toggleCheckin(${idx})">
                                <span></span>
                            </label>
                        </div>
                        <div class="wb-task-details">${task.details}</div>
                        ${task.libAction ? `<div class="wb-lib-action">📦 ${task.libAction}</div>` : ''}
                        ${task.libs && task.libs.length ? `<div class="wb-lib-tags">${task.libs.map(l => `<span class="wb-lib-tag" onclick="navigateTo('${l}')">${l}</span>`).join('')}</div>` : ''}
                    </div>
                </div>`;
        });

        html += '</div></div>';
        content.innerHTML = html;
    }
};

// ============ 章节质量检查 ============
const ChapterCheckModule = {
    // 基础配比公式
    baseFormula: { 热梗: 1.2, 冲突: 1.5, 钩子: 2.0, 反转: 0.3 },

    // 章节类型模型
    chapterTypes: {
        '铺垫章': { desc: '世界观搭建', 热梗: '1背景+0.5道具', 冲突: '1外部+0.5人设', 钩子: '1显性+1五感', 反转: '0.1认知铺垫' },
        '发展章': { desc: '冲突升级', 热梗: '1互动+0.5悬念', 冲突: '1行业+1情感', 钩子: '1动作+1台词', 反转: '0.5物品/情感' },
        '高潮章': { desc: '爆点释放', 热梗: '2高概念融合', 冲突: '2.5层立体对抗', 钩子: '3跨媒介连环', 反转: '1认知核爆' },
        '缓冲章': { desc: '情感沉淀', 热梗: '0.5怀旧', 冲突: '0.8隐性', 钩子: '1镜像', 反转: '0.1情感伏笔' }
    },

    // 情绪类型
    emotionTypes: ['甜', '虐', '燃', '丧', '惊'],

    getFormData: function() {
        const getData = (id) => document.getElementById(id)?.value || '';
        return {
            chapterTitle: getData('cc-title'),
            chapterType: getData('cc-type'),
            wordCount: parseInt(getData('cc-words')) || 3000,
            mainEmotion: getData('cc-main-emo'),
            subEmotion: getData('cc-sub-emo'),
            subEmotionRatio: parseInt(getData('cc-sub-ratio')) || 30,
            prevResidual: parseInt(getData('cc-residual')) || 0,
            hotCount: parseFloat(getData('cc-hot')) || 0,
            conflictLayers: parseFloat(getData('cc-conflict')) || 0,
            hookCount: parseFloat(getData('cc-hook')) || 0,
            reversalCount: parseFloat(getData('cc-reversal')) || 0,
            painWords: parseInt(getData('cc-pain-words')) || 0,
            suppressTime: parseInt(getData('cc-suppress')) || 0,
            lossEvents: parseInt(getData('cc-loss')) || 0,
            sweetPoints: parseInt(getData('cc-sweet')) || 0,
            burnPoints: parseInt(getData('cc-burn')) || 0,
            painPoints: parseInt(getData('cc-pain-pts')) || 0,
            sadPoints: parseInt(getData('cc-sad')) || 0,
            visualSymbol: getData('cc-visual'),
            auditoryWeapon: getData('cc-audio'),
            olfactoryMemory: getData('cc-olfactory'),
            propCoding: getData('cc-prop'),
            actionMapping: getData('cc-action'),
            hookImmediate: getData('cc-hook-imm'),
            hookLongTerm: getData('cc-hook-long'),
            cliffCheck: getData('cc-cliff') === 'on'
        };
    },

    calcAbuseDegree: function(d) {
        // 虐度 = (压抑时长×1.3 + 痛感描写数×0.7 + 失去感事件数×2) ÷ 章节字数 × 100
        const val = ((d.suppressTime * 1.3 + d.painWords * 0.7 + d.lossEvents * 2) / d.wordCount * 100).toFixed(1);
        return parseFloat(val);
    },

    calcEmotionScore: function(d) {
        // 情绪价值分 = (爽点×1.5 + 甜点×1.2 + 燃点×1) - (虐点×0.8 + 丧点×1)
        const val = (d.burnPoints * 1.5 + d.sweetPoints * 1.2 + d.burnPoints * 1) - (d.painPoints * 0.8 + d.sadPoints * 1);
        return val.toFixed(1);
    },

    calcQualityScore: function(d) {
        // score = (hot/1.2)*30 + (conflict/1.5)*30 + (hook/2)*25 + (reversal/0.3)*15
        const score = (d.hotCount / 1.2) * 30 + (d.conflictLayers / 1.5) * 30 + (d.hookCount / 2.0) * 25 + (d.reversalCount / 0.3) * 15;
        return Math.round(score);
    },

    getGrade: function(score) {
        if (score >= 90) return { grade: 'S', label: 'S级爆款预备', color: '#ff4444' };
        if (score >= 75) return { grade: 'A', label: 'A级优质章节', color: '#ff8800' };
        if (score >= 60) return { grade: 'B', label: 'B级合格线', color: '#00aa00' };
        return { grade: 'C', label: 'C级需修改', color: '#888888' };
    },

    runCheck: function() {
        const d = this.getFormData();
        const abuse = this.calcAbuseDegree(d);
        const emoScore = this.calcEmotionScore(d);
        const qualityScore = this.calcQualityScore(d);
        const gradeInfo = this.getGrade(qualityScore);

        // 检查各项达标情况
        const checks = [
            { name: '热梗植入', target: '1.2个/章', actual: d.hotCount + '个', pass: d.hotCount >= 1.2 },
            { name: '冲突构建', target: '1.5层/章', actual: d.conflictLayers + '层', pass: d.conflictLayers >= 1.5 },
            { name: '钩子埋设', target: '2个/章', actual: d.hookCount + '个', pass: d.hookCount >= 2 },
            { name: '反转铺垫', target: '0.3个/章', actual: d.reversalCount + '个', pass: d.reversalCount >= 0.3 },
            { name: '虐度安全', target: '≤82', actual: abuse.toString(), pass: abuse <= 82 },
            { name: '情绪价值', target: '≥15分', actual: emoScore + '分', pass: parseFloat(emoScore) >= 15 },
            { name: '副情绪占比', target: '≤30%', actual: d.subEmotionRatio + '%', pass: d.subEmotionRatio <= 30 },
            { name: '章末悬崖', target: '必须有钩', actual: d.cliffCheck ? '已设置' : '未设置', pass: d.cliffCheck }
        ];

        let html = `
        <div class="cc-result">
            <div class="cc-grade-card" style="border-color:${gradeInfo.color}">
                <div class="cc-grade-letter" style="color:${gradeInfo.color}">${gradeInfo.grade}</div>
                <div class="cc-grade-label">${gradeInfo.label}</div>
                <div class="cc-grade-score">综合评分：${qualityScore}</div>
            </div>
            <div class="cc-metrics">
                <div class="cc-metric ${abuse <= 82 ? 'pass' : 'fail'}">
                    <span class="cc-metric-label">虐度值</span>
                    <span class="cc-metric-value">${abuse}</span>
                    <span class="cc-metric-target">安全阈值≤82</span>
                </div>
                <div class="cc-metric ${parseFloat(emoScore) >= 15 ? 'pass' : 'fail'}">
                    <span class="cc-metric-label">情绪价值分</span>
                    <span class="cc-metric-value">${emoScore}</span>
                    <span class="cc-metric-target">优质≥15</span>
                </div>
            </div>
            <table class="cc-check-table">
                <thead><tr><th>检查项</th><th>目标值</th><th>实际值</th><th>状态</th></tr></thead>
                <tbody>`;

        checks.forEach(c => {
            html += `<tr class="${c.pass ? 'row-pass' : 'row-fail'}">
                <td>${c.name}</td><td>${c.target}</td><td>${c.actual}</td>
                <td>${c.pass ? '✅ 达标' : '❌ 未达标'}</td>
            </tr>`;
        });

        html += `</tbody></table>`;

        // 章节类型建议
        if (d.chapterType && this.chapterTypes[d.chapterType]) {
            const ct = this.chapterTypes[d.chapterType];
            html += `
            <div class="cc-type-guide">
                <h4>📋 ${d.chapterType}（${ct.desc}）配置方案</h4>
                <div class="cc-type-grid">
                    <div><strong>热梗：</strong>${ct.热梗}</div>
                    <div><strong>冲突：</strong>${ct.冲突}</div>
                    <div><strong>钩子：</strong>${ct.钩子}</div>
                    <div><strong>反转：</strong>${ct.反转}</div>
                </div>
            </div>`;
        }

        // 情绪急救包
        if (abuse > 82) {
            html += `
            <div class="cc-emergency">
                <h4>🆘 虐度过载急救方案</h4>
                <ol>
                    <li>插入RS标志性动作（分散注意力）</li>
                    <li>让道具突然播放童年儿歌（情感净化）</li>
                    <li>用雨天松香覆盖消毒水味（嗅觉疗愈）</li>
                    <li>增加CJ类缓冲场景</li>
                </ol>
            </div>`;
        }

        // 章末三秒法则检查
        if (!d.cliffCheck) {
            html += `<div class="cc-warning">⚠️ 章末三秒法则：最后3行必留钩！</div>`;
        }

        html += '</div>';
        document.getElementById('cc-result-area').innerHTML = html;
    },

    render: function() {
        const content = document.getElementById('contentArea');
        let html = `
        <div class="chapter-checker">
            <div class="cc-form-section">
                <h3>📝 章节基本信息</h3>
                <div class="cc-form-grid">
                    <div class="cc-field"><label>章节标题</label><input type="text" id="cc-title" placeholder="如：第7章 琥珀警报"></div>
                    <div class="cc-field"><label>章节类型</label>
                        <select id="cc-type">
                            <option value="">请选择</option>
                            <option value="铺垫章">铺垫章（世界观搭建）</option>
                            <option value="发展章">发展章（冲突升级）</option>
                            <option value="高潮章">高潮章（爆点释放）</option>
                            <option value="缓冲章">缓冲章（情感沉淀）</option>
                        </select>
                    </div>
                    <div class="cc-field"><label>字数</label><input type="number" id="cc-words" value="3000"></div>
                    <div class="cc-field"><label>主情绪</label>
                        <select id="cc-main-emo">${this.emotionTypes.map(e => `<option value="${e}">${e}</option>`).join('')}</select>
                    </div>
                    <div class="cc-field"><label>副情绪</label>
                        <select id="cc-sub-emo"><option value="">无</option>${this.emotionTypes.map(e => `<option value="${e}">${e}</option>`).join('')}</select>
                    </div>
                    <div class="cc-field"><label>副情绪占比(%)</label><input type="number" id="cc-sub-ratio" value="30" max="100"></div>
                    <div class="cc-field"><label>上章情绪残留值(%)</label><input type="number" id="cc-residual" value="0" max="100"></div>
                </div>
            </div>

            <div class="cc-form-section">
                <h3>📊 元素配置（基础公式：热梗1.2 / 冲突1.5 / 钩子2 / 反转0.3）</h3>
                <div class="cc-form-grid">
                    <div class="cc-field"><label>热梗数量</label><input type="number" id="cc-hot" step="0.1" value="1.2"></div>
                    <div class="cc-field"><label>冲突层级</label><input type="number" id="cc-conflict" step="0.1" value="1.5"></div>
                    <div class="cc-field"><label>钩子数量</label><input type="number" id="cc-hook" step="0.1" value="2"></div>
                    <div class="cc-field"><label>反转数量</label><input type="number" id="cc-reversal" step="0.1" value="0.3"></div>
                </div>
            </div>

            <div class="cc-form-section">
                <h3>😢 虐度计算参数</h3>
                <div class="cc-form-grid">
                    <div class="cc-field"><label>压抑时长(字)</label><input type="number" id="cc-suppress" value="0"></div>
                    <div class="cc-field"><label>痛感描写数</label><input type="number" id="cc-pain-words" value="0"></div>
                    <div class="cc-field"><label>失去感事件数</label><input type="number" id="cc-loss" value="0"></div>
                </div>
                <p class="cc-formula">公式：虐度 = (压抑时长×1.3 + 痛感描写数×0.7 + 失去感事件数×2) ÷ 字数 × 100 | 安全阈值≤82</p>
            </div>

            <div class="cc-form-section">
                <h3>💖 情绪价值分参数</h3>
                <div class="cc-form-grid">
                    <div class="cc-field"><label>爽点数</label><input type="number" id="cc-burn" value="0"></div>
                    <div class="cc-field"><label>甜点数</label><input type="number" id="cc-sweet" value="0"></div>
                    <div class="cc-field"><label>燃点数</label><input type="number" id="cc-burn" value="0"></div>
                    <div class="cc-field"><label>虐点数</label><input type="number" id="cc-pain-pts" value="0"></div>
                    <div class="cc-field"><label>丧点数</label><input type="number" id="cc-sad" value="0"></div>
                </div>
                <p class="cc-formula">公式：(爽×1.5 + 甜×1.2 + 燃×1) - (虐×0.8 + 丧×1) | 优质章≥15分</p>
            </div>

            <div class="cc-form-section">
                <h3>🎭 五感情绪触发器</h3>
                <div class="cc-form-grid">
                    <div class="cc-field"><label>视觉符号</label><input type="text" id="cc-visual" placeholder="如：咖啡渍晕染形状"></div>
                    <div class="cc-field"><label>听觉武器</label><input type="text" id="cc-audio" placeholder="如：异常雨声频率"></div>
                    <div class="cc-field"><label>嗅觉记忆</label><input type="text" id="cc-olfactory" placeholder="如：松木香浓度变化"></div>
                    <div class="cc-field"><label>道具情绪编码</label><input type="text" id="cc-prop" placeholder="如：项链甜时37℃虐时冷热"></div>
                    <div class="cc-field"><label>动作情绪映射</label><input type="text" id="cc-action" placeholder="如：撕纸速度映射焦虑值"></div>
                    <div class="cc-field"><label>即时钩(3章内回收)</label><input type="text" id="cc-hook-imm" placeholder="如：实验室植物疯长"></div>
                    <div class="cc-field"><label>长线钩(跨5章+)</label><input type="text" id="cc-hook-long" placeholder="如：量子沙漏倒流"></div>
                    <div class="cc-field"><label>章末悬崖效应</label><select id="cc-cliff"><option value="off">未设置</option><option value="on">已设置</option></select></div>
                </div>
            </div>

            <div class="cc-actions">
                <button class="btn btn-primary btn-lg" onclick="ChapterCheckModule.runCheck()">🔍 运行质量检查</button>
            </div>
            <div id="cc-result-area"></div>
        </div>`;
        content.innerHTML = html;
    }
};

// ============ 拆文分析 ============
const AnalysisModule = {
    structureData: {
        '起': {
            range: '1-20%',
            goal: '建立矛盾基础',
            emotion: '初印象→隔阂/吸引',
            plot: ['主角相遇或重逢', '家庭/身世伏笔', '突发事件引发关联'],
            hooks: ['悬念（隐藏身世）', '反转（替身真相）']
        },
        '承': {
            range: '20%-60%',
            goal: '深化冲突',
            emotion: '信任危机→自我怀疑',
            plot: ['外部阻碍（家庭反对/反派打压）', '内部拉扯（价值观冲突/自卑）', '共同经历强化羁绊'],
            hooks: ['危机（绑架/分手）', '反转（反派真实目的）']
        },
        '转': {
            range: '60%-90%',
            goal: '角色觉醒',
            emotion: '低谷→觉醒→行动',
            plot: ['揭露核心真相（血仇/身世）', '角色反抗', '重大事件推动转折'],
            hooks: ['抉择（站队或牺牲）', '回忆杀（关键往事）']
        },
        '合': {
            range: '90%-100%',
            goal: '双重和解',
            emotion: '信任重建→圆满',
            plot: ['家庭线和解', '情感线撒糖', '反派伏诛或救赎'],
            hooks: ['爽点（打脸反派）', '伏笔回收（白月光真相）']
        }
    },

    emotionLines: [
        { stage: '相识', goal: '绑定关系', plot: '重逢/替身协议/共同任务', emotion: '下行(误会)→上行(吸引)' },
        { stage: '熟悉', goal: '发现真实自我', plot: '照顾伤病/揭露脆弱/互赠信物', emotion: '平缓→波动(自卑暴露)' },
        { stage: '危机', goal: '内外阻碍叠加', plot: '家庭反对/反派打压/自我怀疑', emotion: '低谷(分手/绑架)' },
        { stage: '觉醒', goal: '角色主动破局', plot: '女主反抗/男主维护/共同抗敌', emotion: '上行(打脸反派)' },
        { stage: '和解', goal: '情感升华', plot: '家庭接受/求婚婚礼/反派伏诛', emotion: '峰值(圆满撒糖)' }
    ],

    techniques: [
        { title: '钩子设计', items: ['章节结尾设悬念/反转/危机', '长线伏笔逐步揭露增强粘性', '每章末3行用五感+动作组合钩'] },
        { title: '情感转折', items: ['通过具体事件细化内心变化', '避免生硬：用共同经历自然推动感情升温', '用道具触发回忆闪回'] },
        { title: '阻碍层次化', items: ['外部：家庭仇恨/职场打压', '内部：自卑/替身阴影', '阻碍交替出现保持情绪起伏'] },
        { title: '重复章节优化', items: ['合并回忆杀为一次关键回忆', '精简和解桥段合并为一次高光对话', '删除低票情节强化高光段落'] }
    ],

    savedAnalyses: [],

    init: function() {
        this.savedAnalyses = JSON.parse(localStorage.getItem('analysis_data') || '[]');
    },

    saveAnalysis: function() {
        const title = document.getElementById('ana-title')?.value || '未命名分析';
        const content = document.getElementById('ana-content')?.value || '';
        const structure = document.getElementById('ana-structure')?.value || '';

        if (!content.trim()) { showToast('请输入小说文本'); return; }

        const analysis = {
            id: Date.now(),
            title,
            content,
            structure,
            createdAt: new Date().toISOString()
        };
        this.savedAnalyses.unshift(analysis);
        localStorage.setItem('analysis_data', JSON.stringify(this.savedAnalyses));
        showToast('分析已保存');
        this.render();
    },

    deleteAnalysis: function(id) {
        this.savedAnalyses = this.savedAnalyses.filter(a => a.id !== id);
        localStorage.setItem('analysis_data', JSON.stringify(this.savedAnalyses));
        this.render();
    },

    render: function() {
        if (!this.savedAnalyses.length) this.init();
        const content = document.getElementById('contentArea');

        let html = `
        <div class="analysis-module">
            <div class="ana-layout">
                <div class="ana-left">
                    <div class="ana-input-section">
                        <h3>📖 拆文输入</h3>
                        <input type="text" id="ana-title" class="ana-title-input" placeholder="小说/章节标题">
                        <select id="ana-structure" class="ana-structure-select">
                            <option value="">选择结构阶段</option>
                            <option value="起">起（1-20%）铺垫世界观</option>
                            <option value="承">承（20-60%）深化矛盾</option>
                            <option value="转">转（60-90%）矛盾爆发</option>
                            <option value="合">合（90-100%）冲突解决</option>
                        </select>
                        <textarea id="ana-content" class="ana-content-input" placeholder="粘贴小说文本进行拆文分析..."></textarea>
                        <button class="btn btn-primary" onclick="AnalysisModule.saveAnalysis()">💾 保存分析</button>
                    </div>

                    <div class="ana-structure-guide">
                        <h3>📐 起承转合四幕结构</h3>`;

        for (const [phase, data] of Object.entries(this.structureData)) {
            html += `
            <div class="ana-structure-card" onclick="AnalysisModule.showStructureDetail('${phase}')">
                <div class="ana-phase-header">
                    <span class="ana-phase-char">${phase}</span>
                    <span class="ana-phase-range">${data.range}</span>
                </div>
                <div class="ana-phase-goal">${data.goal}</div>
                <div class="ana-phase-emo">情绪：${data.emotion}</div>
            </div>`;
        }

        html += '</div></div>';

        // 右侧：情感线 + 技巧 + 已保存分析
        html += `
        <div class="ana-right">
            <div class="ana-emotion-section">
                <h3>💔 情感线细化模板</h3>
                <table class="ana-table">
                    <thead><tr><th>阶段</th><th>目标</th><th>典型情节</th><th>情绪起伏</th></tr></thead>
                    <tbody>`;
        this.emotionLines.forEach(e => {
            html += `<tr><td>${e.stage}</td><td>${e.goal}</td><td>${e.plot}</td><td>${e.emotion}</td></tr>`;
        });
        html += '</tbody></table></div>';

        html += '<div class="ana-tech-section"><h3>🛠️ 优化与创新技巧</h3>';
        this.techniques.forEach(t => {
            html += `<div class="ana-tech-card"><h4>${t.title}</h4><ul>`;
            t.items.forEach(i => html += `<li>${i}</li>`);
            html += '</ul></div>';
        });
        html += '</div>';

        // 已保存分析
        if (this.savedAnalyses.length) {
            html += '<div class="ana-saved-section"><h3>📂 已保存分析</h3>';
            this.savedAnalyses.forEach(a => {
                html += `
                <div class="ana-saved-item">
                    <div class="ana-saved-header">
                        <strong>${a.title}</strong>
                        ${a.structure ? `<span class="ana-saved-tag">${a.structure}</span>` : ''}
                        <span class="ana-saved-date">${new Date(a.createdAt).toLocaleDateString()}</span>
                        <button class="btn-del-sm" onclick="AnalysisModule.deleteAnalysis(${a.id})">删除</button>
                    </div>
                    <div class="ana-saved-preview">${a.content.slice(0, 200)}${a.content.length > 200 ? '...' : ''}</div>
                </div>`;
            });
            html += '</div>';
        }

        html += '</div></div></div>';
        content.innerHTML = html;
    },

    showStructureDetail: function(phase) {
        const d = this.structureData[phase];
        const modal = document.getElementById('modalOverlay');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = `「${phase}」阶段详解 (${d.range})`;
        modalBody.innerHTML = `
            <div class="ana-detail">
                <p><strong>阶段目标：</strong>${d.goal}</p>
                <p><strong>情感变化：</strong>${d.emotion}</p>
                <p><strong>关键情节设计：</strong></p>
                <ul>${d.plot.map(p => `<li>${p}</li>`).join('')}</ul>
                <p><strong>钩子类型：</strong></p>
                <ul>${d.hooks.map(h => `<li>${h}</li>`).join('')}</ul>
            </div>`;
        modal.classList.add('active');
    }
};

// ============ 素材库维护中心 ============
const MaintenanceModule = {
    tasks: {
        daily: [
            { time: '07:00-07:30', task: '浏览晋江金榜/微博文娱热搜', action: '摘录3个热梗', lib: '热梗素材库' },
            { time: '21:00-21:30', task: '为今日素材添加情绪值标签', action: '如HG-002标记"高虐慎用"', lib: '全部素材库' }
        ],
        weekly: [
            { day: '周一', task: '清理使用率<2次的素材', action: '入库30天未调用的素材归档', lib: '全部素材库' },
            { day: '周五', task: '交叉验证钩子与反转逻辑链', action: '如HZ-001→FZ-005是否需增加伏笔', lib: '钩子/反转库' }
        ],
        monthly: [
            { task: '制作热点趋势报告', action: '分析当月抖音/小红书TOP20话题可改编性', lib: '热梗素材库' },
            { task: '更新法律库', action: '同步晋江最新公告(如禁用"缅北"相关描写)', lib: '法律风险库' }
        ]
    },

    pitfalls: [
        { level: 'warning', title: '信息过载', desc: '单章最多使用1个主钩+2个副钩' },
        { level: 'warning', title: '逻辑漏洞', desc: '重大反转需提交"伏笔清单"给beta读者验证' },
        { level: 'warning', title: '情感疲劳', desc: '连续高虐不超过3章，用职场线/支线剧情缓冲' }
    ],

    advancedTips: [
        { title: '多库联动法', desc: '选中人设RS-001 → 自动推送关联场景CJ-001 + 冲突CT-002', action: 'multiLink' },
        { title: '情绪值计算', desc: '甜虐比 = 甜点字数 / 总字数，目标区间40%-60%（超出则用冲突章节调节）', action: 'emotionCalc' },
        { title: '读者预期管理', desc: '在"作者有话说"埋伪钩子（如"下章要虐了"实则发糖）', action: null }
    ],

    getTaskKey: function(type, idx) {
        const today = new Date().toISOString().slice(0, 10);
        return `maint_task_${type}_${idx}_${today}`;
    },

    isTaskDone: function(type, idx) {
        return localStorage.getItem(this.getTaskKey(type, idx)) === '1';
    },

    toggleTask: function(type, idx) {
        const key = this.getTaskKey(type, idx);
        if (localStorage.getItem(key) === '1') localStorage.removeItem(key);
        else localStorage.setItem(key, '1');
        this.render();
    },

    calcSweetAbuse: function() {
        const sweet = parseInt(document.getElementById('ma-sweet-words')?.value) || 0;
        const total = parseInt(document.getElementById('ma-total-words')?.value) || 1;
        const ratio = (sweet / total * 100).toFixed(1);
        const status = ratio >= 40 && ratio <= 60 ? '理想区间' : (ratio < 40 ? '甜度不足，需增加甜点' : '甜度过高，需用冲突调节');

        document.getElementById('ma-ratio-result').innerHTML = `
            <div class="ma-ratio-value">${ratio}%</div>
            <div class="ma-ratio-status ${ratio >= 40 && ratio <= 60 ? 'good' : 'bad'}">${status}</div>
            <div class="ma-ratio-target">目标区间：40%-60%</div>`;
    },

    multiLink: function() {
        const charId = document.getElementById('ma-link-char')?.value;
        if (!charId) { showToast('请输入人设编号'); return; }

        // 从人设库查找
        const charLib = Store.getAll('人设基因库');
        const char = charLib.find(c => c['编号'] === charId);
        if (!char) { showToast('未找到该人设编号'); return; }

        // 搜索关联场景和冲突
        const keyword = (char['职业/身份'] || '') + (char['性格标签'] || '');
        const scenes = Store.getAll('场景库').filter(s => {
            const text = Object.values(s).join(' ');
            return keyword.split(/[,，\s]+/).some(k => k && text.includes(k));
        }).slice(0, 3);

        const conflicts = Store.getAll('冲突素材库').filter(c => {
            const text = Object.values(c).join(' ');
            return keyword.split(/[,，\s]+/).some(k => k && text.includes(k));
        }).slice(0, 3);

        let html = `<div class="ma-link-result"><h4>🔗 ${charId} 联动推荐</h4>`;
        html += `<div class="ma-link-char"><strong>${char['角色定位'] || ''}</strong> - ${char['性格标签'] || ''} - ${char['职业/身份'] || ''}</div>`;

        html += '<div class="ma-link-section"><h5>推荐场景</h5>';
        if (scenes.length) scenes.forEach(s => html += `<div class="ma-link-item" onclick="navigateTo('场景库')">${s['编号']} - ${s['场景类型']} ${s['视觉焦点']?.slice(0, 30) || ''}</div>`);
        else html += '<p>暂无匹配场景</p>';
        html += '</div>';

        html += '<div class="ma-link-section"><h5>推荐冲突</h5>';
        if (conflicts.length) conflicts.forEach(c => html += `<div class="ma-link-item" onclick="navigateTo('冲突素材库')">${c['编号']} - ${c['冲突类型']} ${c['核心矛盾']?.slice(0, 30) || ''}</div>`);
        else html += '<p>暂无匹配冲突</p>';
        html += '</div></div>';

        document.getElementById('ma-link-result').innerHTML = html;
    },

    // ====== 快速录入素材表单 ======
    renderQuickForm: function() {
        const libId = document.getElementById('ma-quick-lib')?.value;
        const formWrap = document.getElementById('ma-quick-form');
        if (!libId || !formWrap) { if (formWrap) formWrap.innerHTML = ''; return; }

        const lib = SCHEMA.getLibrary(libId);
        let html = '<div class="ma-quick-form-grid">';
        for (const field of lib.headers) {
            const isLong = field.includes('方向') || field.includes('伏笔') || field.includes('设计') || field.includes('内容') || field.includes('案例') || field.includes('原文');
            html += `<div class="ma-quick-field">
                <label>${field}</label>
                ${isLong ?
                    `<textarea id="ma-qf-${field}" rows="2"></textarea>` :
                    `<input type="text" id="ma-qf-${field}">`
                }
            </div>`;
        }
        html += '</div>';
        html += `<div style="margin-top:12px;text-align:right;">
            <button class="btn btn-primary" onclick="MaintenanceModule.quickSave('${libId}')">💾 保存到 ${libId}</button>
        </div>`;
        formWrap.innerHTML = html;
    },

    quickSave: function(libId) {
        const lib = SCHEMA.getLibrary(libId);
        const fields = {};
        let hasData = false;
        for (const field of lib.headers) {
            const el = document.getElementById('ma-qf-' + field);
            if (el) {
                fields[field] = el.value.trim();
                if (el.value.trim()) hasData = true;
            }
        }
        if (!hasData) { showToast('请至少填写一个字段', 'warning'); return; }

        if (!fields['编号']) {
            fields['编号'] = SCHEMA.generateId(lib.prefix, Store.getExistingIds(libId));
        }

        Store.addItem(libId, fields);
        showToast(`已保存到 ${libId}：${fields['编号']}`, 'success');

        for (const field of lib.headers) {
            const el = document.getElementById('ma-qf-' + field);
            if (el) el.value = '';
        }
        this.renderRecent();
        renderNav();
    },

    // ====== 最近录入素材列表 ======
    renderRecent: function() {
        const wrap = document.getElementById('ma-recent-list');
        const countEl = document.getElementById('ma-recent-count');
        if (!wrap) return;

        const filterLib = document.getElementById('ma-recent-lib-filter')?.value || 'all';
        let allItems = [];

        for (const libId of SCHEMA.getLibraryIds()) {
            if (filterLib !== 'all' && libId !== filterLib) continue;
            const items = Store.getItems(libId);
            items.forEach((item, idx) => {
                allItems.push({ libId, idx, item, seq: parseInt((item['编号'] || '').match(/\d+$/)?.[0] || '0') });
            });
        }

        allItems.sort((a, b) => b.seq - a.seq);
        const recent = allItems.slice(0, 30);

        if (countEl) countEl.textContent = `显示最近 ${recent.length} / ${allItems.length} 条`;

        if (recent.length === 0) {
            wrap.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-light);">暂无素材</div>';
            return;
        }

        let html = '<table class="data-table"><thead><tr>';
        html += '<th style="width:30px;"><input type="checkbox" id="ma-select-all" onchange="MaintenanceModule.toggleAll(this)"></th>';
        html += '<th>编号</th><th>素材库</th><th>内容概要</th><th>操作</th>';
        html += '</tr></thead><tbody>';

        for (const r of recent) {
            const lib = SCHEMA.getLibrary(r.libId);
            const summary = r.item[lib.displayFields?.[1] || lib.headers[1]] || r.item[lib.headers[1]] || '—';
            html += `<tr>
                <td><input type="checkbox" class="ma-check" data-lib="${r.libId}" data-idx="${r.idx}"></td>
                <td class="id-cell">${escapeHtml(r.item['编号'] || '')}</td>
                <td><span class="tag ${lib.color}">${r.libId}</span></td>
                <td title="${escapeAttr(summary)}">${escapeHtml(summary.toString().substring(0, 60))}${summary.toString().length > 60 ? '...' : ''}</td>
                <td class="actions-cell">
                    <button class="btn-edit" onclick="MaintenanceModule.editItem('${r.libId}', ${r.idx})">编辑</button>
                    <button class="btn-delete" onclick="MaintenanceModule.deleteItem('${r.libId}', ${r.idx})">删除</button>
                </td>
            </tr>`;
        }

        html += '</tbody></table>';
        wrap.innerHTML = html;
    },

    toggleAll: function(master) {
        document.querySelectorAll('.ma-check').forEach(cb => cb.checked = master.checked);
    },

    batchDelete: function() {
        const checked = document.querySelectorAll('.ma-check:checked');
        if (checked.length === 0) { showToast('请先勾选要删除的素材', 'warning'); return; }
        if (!confirm(`确定删除选中的 ${checked.length} 条素材吗？此操作不可撤销！`)) return;

        const toDelete = [];
        checked.forEach(cb => {
            toDelete.push({ lib: cb.dataset.lib, idx: parseInt(cb.dataset.idx) });
        });
        const byLib = {};
        toDelete.forEach(d => {
            if (!byLib[d.lib]) byLib[d.lib] = [];
            byLib[d.lib].push(d.idx);
        });
        for (const lib in byLib) {
            byLib[lib].sort((a, b) => b - a).forEach(idx => {
                Store.deleteItem(lib, idx);
            });
        }

        showToast(`已删除 ${checked.length} 条素材`, 'success');
        this.renderRecent();
        renderNav();
    },

    editItem: function(libId, idx) {
        openItemEditor(libId, idx);
    },

    deleteItem: function(libId, idx) {
        const items = Store.getItems(libId);
        const item = items[idx];
        if (!item) return;
        if (confirm(`确定删除 "${item['编号']}" 吗？`)) {
            Store.deleteItem(libId, idx);
            showToast('已删除', 'success');
            this.renderRecent();
            renderNav();
        }
    },

    render: function() {
        const content = document.getElementById('contentArea');
        let html = '<div class="maintenance-module">';

        // ====== 快速录入素材 ======
        html += '<div class="ma-quick-add-section"><h3>✏️ 素材快速录入</h3>';
        html += '<div class="ma-quick-add-bar">';
        html += '<select id="ma-quick-lib" class="filter-select" onchange="MaintenanceModule.renderQuickForm()">';
        html += '<option value="">选择目标库...</option>';
        for (const libId of SCHEMA.getLibraryIds()) {
            const lib = SCHEMA.getLibrary(libId);
            html += `<option value="${libId}">${lib.icon} ${libId}</option>`;
        }
        html += '</select>';
        html += '</div>';
        html += '<div id="ma-quick-form"></div>';
        html += '</div>';

        // ====== 最近录入的素材（批量管理） ======
        html += '<div class="ma-recent-section"><h3>📋 最近录入素材（跨库管理）</h3>';
        html += '<div class="ma-recent-toolbar">';
        html += '<select id="ma-recent-lib-filter" class="filter-select" onchange="MaintenanceModule.renderRecent()">';
        html += '<option value="all">全部库</option>';
        for (const libId of SCHEMA.getLibraryIds()) {
            html += `<option value="${libId}">${libId}</option>`;
        }
        html += '</select>';
        html += '<button class="btn btn-sm btn-danger" onclick="MaintenanceModule.batchDelete()">🗑 批量删除选中</button>';
        html += '<span style="font-size:12px;color:var(--text-light);margin-left:auto;" id="ma-recent-count"></span>';
        html += '</div>';
        html += '<div id="ma-recent-list"></div>';
        html += '</div>';

        // ====== 任务清单 ======
        html += '<div class="ma-tasks-section"><h3>📋 维护任务清单</h3>';

        // 每日任务
        html += '<div class="ma-task-group"><h4>🌅 每日任务</h4>';
        this.tasks.daily.forEach((t, idx) => {
            const done = this.isTaskDone('daily', idx);
            html += `
            <div class="ma-task-row ${done ? 'done' : ''}">
                <label><input type="checkbox" ${done ? 'checked' : ''} onchange="MaintenanceModule.toggleTask('daily',${idx})"></label>
                <span class="ma-task-time">${t.time}</span>
                <span class="ma-task-name">${t.task}</span>
                <span class="ma-task-action">${t.action}</span>
                <span class="ma-task-lib" onclick="navigateTo('${t.lib}')">${t.lib}</span>
            </div>`;
        });
        html += '</div>';

        // 每周任务
        html += '<div class="ma-task-group"><h4>📅 每周任务</h4>';
        this.tasks.weekly.forEach((t, idx) => {
            const done = this.isTaskDone('weekly', idx);
            html += `
            <div class="ma-task-row ${done ? 'done' : ''}">
                <label><input type="checkbox" ${done ? 'checked' : ''} onchange="MaintenanceModule.toggleTask('weekly',${idx})"></label>
                <span class="ma-task-day">${t.day}</span>
                <span class="ma-task-name">${t.task}</span>
                <span class="ma-task-action">${t.action}</span>
                <span class="ma-task-lib" onclick="navigateTo('${t.lib}')">${t.lib}</span>
            </div>`;
        });
        html += '</div>';

        // 每月任务
        html += '<div class="ma-task-group"><h4>📆 每月任务</h4>';
        this.tasks.monthly.forEach((t, idx) => {
            const done = this.isTaskDone('monthly', idx);
            html += `
            <div class="ma-task-row ${done ? 'done' : ''}">
                <label><input type="checkbox" ${done ? 'checked' : ''} onchange="MaintenanceModule.toggleTask('monthly',${idx})"></label>
                <span class="ma-task-name">${t.task}</span>
                <span class="ma-task-action">${t.action}</span>
                <span class="ma-task-lib" onclick="navigateTo('${t.lib}')">${t.lib}</span>
            </div>`;
        });
        html += '</div></div>';

        // 高级应用技巧
        html += '<div class="ma-tips-section"><h3>⚡ 高级应用技巧</h3>';

        // 多库联动
        html += `
        <div class="ma-tip-card">
            <h4>🔗 多库联动法</h4>
            <p>选中人设RS编号 → 自动推送关联场景CJ + 冲突CT</p>
            <div class="ma-link-input">
                <input type="text" id="ma-link-char" placeholder="输入人设编号(如RS-2025-001)" list="char-id-list">
                <datalist id="char-id-list">
                    ${Store.getAll('人设基因库').map(c => `<option value="${c['编号']}">${c['编号']} - ${c['角色定位'] || ''}</option>`).join('')}
                </datalist>
                <button class="btn btn-primary" onclick="MaintenanceModule.multiLink()">🔍 联动查找</button>
            </div>
            <div id="ma-link-result"></div>
        </div>`;

        // 情绪值计算
        html += `
        <div class="ma-tip-card">
            <h4>📊 甜虐比计算</h4>
            <p>甜虐比 = 甜点字数 / 总字数，目标区间40%-60%</p>
            <div class="ma-calc-input">
                <input type="number" id="ma-sweet-words" placeholder="甜点字数">
                <input type="number" id="ma-total-words" placeholder="总字数" value="3000">
                <button class="btn btn-primary" onclick="MaintenanceModule.calcSweetAbuse()">计算</button>
            </div>
            <div id="ma-ratio-result"></div>
        </div>`;

        // 读者预期管理
        html += `
        <div class="ma-tip-card">
            <h4>🎭 读者预期管理</h4>
            <p>在"作者有话说"埋伪钩子（如"下章要虐了"实则发糖）</p>
        </div>`;

        html += '</div>';

        // 避坑指南
        html += '<div class="ma-pitfalls-section"><h3>⚠️ 避坑指南</h3>';
        this.pitfalls.forEach(p => {
            html += `<div class="ma-pitfall-card"><strong>${p.title}</strong>：${p.desc}</div>`;
        });
        html += '</div>';

        html += '</div>';
        content.innerHTML = html;
        this.renderRecent();
    }
};

// ============ 项目管理与伏笔追踪 ============
const ProjectModule = {
    projects: [],

    init: function() {
        this.projects = JSON.parse(localStorage.getItem('projects_data') || '[]');
        if (this.projects.length === 0) {
            // 初始化默认项目
            this.projects = [{
                id: Date.now(),
                title: '嘴硬王者',
                genre: '现代言情',
                status: '创作中',
                characters: [
                    { name: '明舒', role: '女主', arc: '用完美主义当盔甲→接受"被爱不需要优秀"' },
                    { name: '沈确', role: '男主', arc: '沉默的守护者→学会用专业领域说情话' },
                    { name: '司恬', role: '女三', arc: '职场铁娘子→把混凝土配比写成情书' },
                    { name: '关笑', role: '男二', arc: '发小/调解者' }
                ],
                foreshadowing: [
                    { item: '野猫抓伤事件', plant: '12岁回忆', payoff: 'KTV沈确摩挲腰侧伤疤', impact: '"我要覆盖所有让你疼的记忆"', status: 'pending' },
                    { item: '玻璃弹珠光路公式', plant: '初中密码', payoff: '婚戒内刻方程式', impact: '童年创伤变爱情密码', status: 'pending' },
                    { item: '沈确袖口金丝刺绣', plant: '电梯重逢', payoff: '十八岁礼物成为守护图腾', impact: '', status: 'pending' },
                    { item: 'B25螺纹钢损耗费', plant: '职场线', payoff: '关笑举报信编码', impact: '把暗恋写成建材行业黑话', status: 'pending' }
                ],
                props: [
                    { name: '女主旧DV', initial: '记录虚假安全', final: '拍下父亲退休后首张全家福' },
                    { name: '男主玻璃弹珠', initial: '传递密码', final: '镶嵌在婚礼捧花中心' },
                    { name: '工牌挂绳(平安结)', initial: '沈确高中毕业礼', final: '十年未换的执念' }
                ],
                chapters: [
                    { title: '第一章：玻璃珠与加密云盘', status: 'drafting', summary: '电梯重逢/屏保视频/新冠秘密/少年闪回' },
                    { title: '第二章：篝火余温与直球破冰', status: 'planning', summary: '暴雨验货/KTV反杀/篝火回溯/暴雨失约' },
                    { title: '第三章：余生验算与终章', status: 'planning', summary: '视频坦白/台风求婚/终章彩蛋' }
                ],
                createdAt: new Date().toISOString()
            }];
            this.save();
        }
    },

    save: function() {
        localStorage.setItem('projects_data', JSON.stringify(this.projects));
    },

    currentProject: null,

    openProject: function(id) {
        this.currentProject = this.projects.find(p => p.id === id);
        this.renderDetail();
    },

    addForeshadowing: function() {
        if (!this.currentProject) return;
        const item = document.getElementById('pf-item')?.value;
        const plant = document.getElementById('pf-plant')?.value;
        const payoff = document.getElementById('pf-payoff')?.value;
        const impact = document.getElementById('pf-impact')?.value;
        if (!item) { showToast('请输入伏笔内容'); return; }
        this.currentProject.foreshadowing.push({ item, plant, payoff, impact, status: 'pending' });
        this.save();
        this.renderDetail();
    },

    toggleForeshadowing: function(idx) {
        this.currentProject.foreshadowing[idx].status = this.currentProject.foreshadowing[idx].status === 'resolved' ? 'pending' : 'resolved';
        this.save();
        this.renderDetail();
    },

    deleteForeshadowing: function(idx) {
        this.currentProject.foreshadowing.splice(idx, 1);
        this.save();
        this.renderDetail();
    },

    addCharacter: function() {
        if (!this.currentProject) return;
        const name = document.getElementById('pc-name')?.value;
        const role = document.getElementById('pc-role')?.value;
        const arc = document.getElementById('pc-arc')?.value;
        if (!name) { showToast('请输入角色名'); return; }
        this.currentProject.characters.push({ name, role, arc });
        this.save();
        this.renderDetail();
    },

    addChapter: function() {
        if (!this.currentProject) return;
        const title = document.getElementById('ch-title')?.value;
        const summary = document.getElementById('ch-summary')?.value;
        if (!title) { showToast('请输入章节标题'); return; }
        this.currentProject.chapters.push({ title, status: 'planning', summary });
        this.save();
        this.renderDetail();
    },

    updateChapterStatus: function(idx, status) {
        this.currentProject.chapters[idx].status = status;
        this.save();
        this.renderDetail();
    },

    addProp: function() {
        if (!this.currentProject) return;
        const name = document.getElementById('pr-name')?.value;
        const initial = document.getElementById('pr-initial')?.value;
        const final = document.getElementById('pr-final')?.value;
        if (!name) { showToast('请输入道具名'); return; }
        this.currentProject.props.push({ name, initial, final });
        this.save();
        this.renderDetail();
    },

    createProject: function() {
        const title = document.getElementById('np-title')?.value;
        if (!title) { showToast('请输入小说标题'); return; }
        const project = {
            id: Date.now(),
            title,
            genre: document.getElementById('np-genre')?.value || '',
            status: '创作中',
            characters: [],
            foreshadowing: [],
            props: [],
            chapters: [],
            createdAt: new Date().toISOString()
        };
        this.projects.push(project);
        this.save();
        closeModal();
        this.render();
    },

    deleteProject: function(id) {
        if (!confirm('确定删除该项目？')) return;
        this.projects = this.projects.filter(p => p.id !== id);
        this.save();
        this.render();
    },

    render: function() {
        if (!this.projects.length) this.init();
        const content = document.getElementById('contentArea');

        let html = `
        <div class="projects-module">
            <div class="pj-header">
                <button class="btn btn-primary" onclick="ProjectModule.showCreateDialog()">+ 新建小说项目</button>
            </div>
            <div class="pj-grid">`;

        this.projects.forEach(p => {
            const charCount = p.characters?.length || 0;
            const chCount = p.chapters?.length || 0;
            const pfCount = p.foreshadowing?.length || 0;
            const pfResolved = p.foreshadowing?.filter(f => f.status === 'resolved').length || 0;

            html += `
            <div class="pj-card" onclick="ProjectModule.openProject(${p.id})">
                <div class="pj-card-header">
                    <h3>${p.title}</h3>
                    <span class="pj-status">${p.status}</span>
                </div>
                <div class="pj-card-genre">${p.genre || '未分类'}</div>
                <div class="pj-card-stats">
                    <span>👤 ${charCount} 角色</span>
                    <span>📖 ${chCount} 章节</span>
                    <span>🔮 ${pfResolved}/${pfCount} 伏笔</span>
                </div>
            </div>`;
        });

        html += '</div></div>';
        content.innerHTML = html;
    },

    renderDetail: function() {
        const p = this.currentProject;
        if (!p) { this.render(); return; }
        const content = document.getElementById('contentArea');

        const statusMap = { planning: '规划中', drafting: '撰写中', revising: '修改中', done: '已完成' };
        const statusColors = { planning: '#888', drafting: '#ff8800', revising: '#0066cc', done: '#00aa00' };

        let html = `
        <div class="pj-detail">
            <div class="pj-detail-header">
                <button class="btn-back" onclick="ProjectModule.currentProject=null;ProjectModule.render()">← 返回列表</button>
                <h2>${p.title}</h2>
                <span class="pj-genre">${p.genre}</span>
                <button class="btn-del-sm" onclick="ProjectModule.deleteProject(${p.id})">删除项目</button>
            </div>

            <div class="pj-tabs">
                <div class="pj-tab-area active" id="tab-characters">
                    <h3>👤 角色成长弧光</h3>
                    <div class="pj-add-form">
                        <input type="text" id="pc-name" placeholder="角色名">
                        <input type="text" id="pc-role" placeholder="定位(女主/男主/配角)">
                        <input type="text" id="pc-arc" placeholder="成长弧光(初始→终极)">
                        <button class="btn btn-sm btn-primary" onclick="ProjectModule.addCharacter()">+ 添加</button>
                    </div>
                    <div class="pj-char-grid">`;

        p.characters.forEach((c, idx) => {
            html += `<div class="pj-char-card">
                <div class="pj-char-name">${c.name}</div>
                <div class="pj-char-role">${c.role}</div>
                <div class="pj-char-arc">${c.arc}</div>
            </div>`;
        });

        html += `</div>
                </div>

                <div class="pj-tab-area" id="tab-foreshadowing">
                    <h3>🔮 伏笔回收追踪表</h3>
                    <div class="pj-add-form">
                        <input type="text" id="pf-item" placeholder="伏笔内容">
                        <input type="text" id="pf-plant" placeholder="埋设节点">
                        <input type="text" id="pf-payoff" placeholder="回收节点">
                        <input type="text" id="pf-impact" placeholder="情感冲击点">
                        <button class="btn btn-sm btn-primary" onclick="ProjectModule.addForeshadowing()">+ 添加</button>
                    </div>
                    <table class="pj-table">
                        <thead><tr><th>伏笔</th><th>埋设</th><th>回收</th><th>冲击点</th><th>状态</th><th>操作</th></tr></thead>
                        <tbody>`;

        p.foreshadowing.forEach((f, idx) => {
            html += `<tr class="${f.status === 'resolved' ? 'row-pass' : ''}">
                <td>${f.item}</td><td>${f.plant}</td><td>${f.payoff}</td><td>${f.impact}</td>
                <td><span class="pf-status ${f.status}" onclick="ProjectModule.toggleForeshadowing(${idx})">${f.status === 'resolved' ? '✅ 已回收' : '⏳ 待回收'}</span></td>
                <td><button class="btn-del-sm" onclick="ProjectModule.deleteForeshadowing(${idx})">删除</button></td>
            </tr>`;
        });

        html += `</tbody></table>
                </div>

                <div class="pj-tab-area" id="tab-chapters">
                    <h3>📖 章节管理</h3>
                    <div class="pj-add-form">
                        <input type="text" id="ch-title" placeholder="章节标题">
                        <input type="text" id="ch-summary" placeholder="章节摘要">
                        <button class="btn btn-sm btn-primary" onclick="ProjectModule.addChapter()">+ 添加</button>
                    </div>
                    <div class="pj-ch-list">`;

        p.chapters.forEach((ch, idx) => {
            html += `<div class="pj-ch-item">
                <span class="pj-ch-status" style="color:${statusColors[ch.status]}" onclick="ProjectModule.cycleChapterStatus(${idx})">${statusMap[ch.status]}</span>
                <strong>${ch.title}</strong>
                <p>${ch.summary}</p>
            </div>`;
        });

        html += `</div>
                </div>

                <div class="pj-tab-area" id="tab-props">
                    <h3>🎪 道具闭环系统</h3>
                    <div class="pj-add-form">
                        <input type="text" id="pr-name" placeholder="道具名">
                        <input type="text" id="pr-initial" placeholder="初始作用">
                        <input type="text" id="pr-final" placeholder="终局意义">
                        <button class="btn btn-sm btn-primary" onclick="ProjectModule.addProp()">+ 添加</button>
                    </div>
                    <table class="pj-table">
                        <thead><tr><th>道具</th><th>初始作用</th><th>终局意义</th></tr></thead>
                        <tbody>`;

        p.props.forEach(pr => {
            html += `<tr><td><strong>${pr.name}</strong></td><td>${pr.initial}</td><td>${pr.final}</td></tr>`;
        });

        html += '</tbody></table></div></div></div>';
        content.innerHTML = html;
    },

    cycleChapterStatus: function(idx) {
        const statuses = ['planning', 'drafting', 'revising', 'done'];
        const cur = this.currentProject.chapters[idx].status;
        const next = statuses[(statuses.indexOf(cur) + 1) % statuses.length];
        this.currentProject.chapters[idx].status = next;
        this.save();
        this.renderDetail();
    },

    showCreateDialog: function() {
        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalTitle').textContent = '新建小说项目';
        document.getElementById('modalBody').innerHTML = `
            <div class="modal-form">
                <div class="form-field"><label>小说标题</label><input type="text" id="np-title"></div>
                <div class="form-field"><label>题材类型</label>
                    <select id="np-genre">
                        <option value="现代言情">现代言情</option>
                        <option value="古代言情">古代言情</option>
                        <option value="幻想言情">幻想言情</option>
                        <option value="悬疑推理">悬疑推理</option>
                        <option value="都市职场">都市职场</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
            </div>`;
        document.getElementById('modalFooter').innerHTML = `<button class="btn btn-primary" onclick="ProjectModule.createProject()">创建</button><button class="btn" onclick="closeModal()">取消</button>`;
        modal.classList.add('active');
    }
};

// ============ 收益计算器 ============
const RevenueModule = {
    calcRevenue: function() {
        const get = (id) => parseFloat(document.getElementById(id)?.value) || 0;

        const avgSub = get('rev-avg-sub');           // 均订人数
        const pricePerK = get('rev-price');            // 千字定价(分)
        const dailyWords = get('rev-daily-words');     // 日更字数
        const dailyTips = get('rev-daily-tips');       // 日均打赏
        const monthlyWords = get('rev-monthly-words'); // 月更字数
        const subRate = get('rev-sub-rate') / 100;     // 订阅分成比例
        const fullAttendBonus = get('rev-full-attend'); // 全勤奖
        const copyright = get('rev-copyright');         // 版权收入
        const bookSales = get('rev-book');              // 实体书收入
        const derivative = get('rev-derivative');       // 衍生品收入

        // 月订阅收入 = 均订 × 千字定价(转元) × 日更字数/1000 × 30 × 分成比例
        const monthlySub = avgSub * (pricePerK / 100) * (dailyWords / 1000) * 30 * subRate;
        const monthlyTips = dailyTips * 30;
        const monthlyTotal = monthlySub + monthlyTips + fullAttendBonus;
        const yearlyTotal = monthlyTotal * 12 + copyright + bookSales + derivative;

        // 展示结果
        document.getElementById('rev-result').innerHTML = `
            <div class="rev-result-grid">
                <div class="rev-result-card">
                    <div class="rev-result-label">月订阅收入</div>
                    <div class="rev-result-value">¥${monthlySub.toFixed(0)}</div>
                    <div class="rev-result-detail">均订${avgSub} × ${pricePerK}分/千字 × ${dailyWords}字/天 × 30天 × ${subRate*100}%分成</div>
                </div>
                <div class="rev-result-card">
                    <div class="rev-result-label">月打赏收入</div>
                    <div class="rev-result-value">¥${monthlyTips.toFixed(0)}</div>
                    <div class="rev-result-detail">日均¥${dailyTips} × 30天</div>
                </div>
                <div class="rev-result-card highlight">
                    <div class="rev-result-label">月总收入</div>
                    <div class="rev-result-value">¥${monthlyTotal.toFixed(0)}</div>
                    <div class="rev-result-detail">订阅+打赏+全勤奖¥${fullAttendBonus}</div>
                </div>
                <div class="rev-result-card highlight">
                    <div class="rev-result-label">预计年总收入</div>
                    <div class="rev-result-value">¥${yearlyTotal.toFixed(0)}</div>
                    <div class="rev-result-detail">月收入×12 + 版权¥${copyright} + 实体书¥${bookSales} + 衍生¥${derivative}</div>
                </div>
            </div>
            <div class="rev-milestone">
                <h4>🎯 里程碑达成情况</h4>
                <div class="rev-milestone-list">
                    <div class="rev-milestone-item ${monthlyTotal >= 30000 ? 'achieved' : ''}">月入3万 ${monthlyTotal >= 30000 ? '✅' : `(${(monthlyTotal/30000*100).toFixed(0)}%)`}</div>
                    <div class="rev-milestone-item ${monthlyTotal >= 100000 ? 'achieved' : ''}">月入10万 ${monthlyTotal >= 100000 ? '✅' : `(${(monthlyTotal/100000*100).toFixed(0)}%)`}</div>
                    <div class="rev-milestone-item ${monthlyTotal >= 200000 ? 'achieved' : ''}">月入20万 ${monthlyTotal >= 200000 ? '✅' : `(${(monthlyTotal/200000*100).toFixed(0)}%)`}</div>
                    <div class="rev-milestone-item ${yearlyTotal >= 3000000 ? 'achieved' : ''}">两年300万 ${yearlyTotal >= 3000000 ? '✅' : `(${(yearlyTotal/3000000*100).toFixed(0)}%)`}</div>
                </div>
            </div>`;
    },

    render: function() {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
        <div class="revenue-module">
            <div class="rev-form-section">
                <h3>📊 订阅参数</h3>
                <div class="rev-form-grid">
                    <div class="rev-field"><label>均订人数</label><input type="number" id="rev-avg-sub" value="5000" placeholder="如5000"></div>
                    <div class="rev-field"><label>千字定价(分)</label><input type="number" id="rev-price" value="3" placeholder="如3(=千字3分)"></div>
                    <div class="rev-field"><label>日更字数</label><input type="number" id="rev-daily-words" value="9000" placeholder="如9000"></div>
                    <div class="rev-field"><label>月更字数</label><input type="number" id="rev-monthly-words" value="270000" placeholder="如270000"></div>
                    <div class="rev-field"><label>订阅分成比例(%)</label><input type="number" id="rev-sub-rate" value="60" placeholder="如60"></div>
                </div>
            </div>
            <div class="rev-form-section">
                <h3>💰 其他收入</h3>
                <div class="rev-form-grid">
                    <div class="rev-field"><label>日均打赏(元)</label><input type="number" id="rev-daily-tips" value="300" placeholder="如300"></div>
                    <div class="rev-field"><label>月全勤奖(元)</label><input type="number" id="rev-full-attend" value="1500" placeholder="如1500"></div>
                    <div class="rev-field"><label>版权收入(年/元)</label><input type="number" id="rev-copyright" value="1000000" placeholder="如1000000"></div>
                    <div class="rev-field"><label>实体书收入(年/元)</label><input type="number" id="rev-book" value="150000" placeholder="如150000"></div>
                    <div class="rev-field"><label>衍生品收入(年/元)</label><input type="number" id="rev-derivative" value="0" placeholder="如0"></div>
                </div>
            </div>
            <div class="rev-actions">
                <button class="btn btn-primary btn-lg" onclick="RevenueModule.calcRevenue()">🧮 计算收益</button>
            </div>
            <div id="rev-result"></div>

            <div class="rev-stages">
                <h3>📈 阶段目标拆解（两年24个月）</h3>
                <table class="rev-stage-table">
                    <thead><tr><th>阶段</th><th>时间</th><th>核心目标</th><th>收入里程碑</th></tr></thead>
                    <tbody>
                        <tr><td>启动期</td><td>第1-3月</td><td>完结首部50万字作品，积累1000+付费读者</td><td>月均3-5万</td></tr>
                        <tr><td>爆发期</td><td>第4-12月</td><td>产出2部百万字爆款，登上频道金榜</td><td>月均15万+</td></tr>
                        <tr><td>衍生期</td><td>第13-18月</td><td>推动1部作品进入影视改编流程</td><td>单笔版权50-100万</td></tr>
                        <tr><td>收割期</td><td>第19-24月</td><td>实体书出版+跨平台分发，启动新书预收</td><td>月均20万+</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="rev-tips">
                <h3>💡 收益加速器</h3>
                <div class="rev-tip-card"><strong>倒逼编辑重视</strong>：签约时声明"已完本80万字"，要求添加"全文存稿"标签</div>
                <div class="rev-tip-card"><strong>预售造势</strong>：开VIP前一周微博发起"解锁角色档案"活动</div>
                <div class="rev-tip-card"><strong>跨界捆绑</strong>：联系中小品牌定制"小说联名款"分佣15%</div>
                <div class="rev-tip-card"><strong>收益再投资</strong>：将第一本书收入20%用于购买第二本「黄金推荐位」</div>
            </div>
        </div>`;
    }
};
