/**
 * 文本智能解析器
 * 核心功能：用户粘贴一段文字 → 自动分析内容类型 → 拆分关键字段 → 填入对应素材库
 */
const Parser = {
    // ============ 内容类型识别关键词映射 ============
    typeKeywords: {
        '热梗素材库': ['热梗', '梗', '热搜', '抖音', '快手', '微博', '小红书', 'B站', '知乎', '平台热度', '甜虐', '先婚后爱', '破镜重圆', '替身', '契约婚姻', '#'],
        '冲突素材库': ['冲突', '矛盾', '对抗', '纠纷', '斗争', '商战', '职场', '利益', '权力', '压迫', '反击', '情绪曲线', '爆发场景', '解决方式'],
        '钩子素材库': ['钩子', '悬念', '伏笔', '埋设', '引爆', '回收', '暗示', '预告', '铺垫', '谜题', '暗线', '回收周期', '埋设手法'],
        '反转素材库': ['反转', '逆转', '真相', '揭露', '假戏真做', '身份反转', '动机反转', '阵营反转', '认知反转', '逻辑校验', '表面呈现', '真相揭露'],
        '人设基因库': ['人设', '角色', '性格', 'MBTI', 'INTJ', 'ENFJ', 'ESFP', 'INFP', '职业', '身份', '情感障碍', '专属物品', '标志动作', '救赎', '禁忌', '荷尔蒙', '角色定位'],
        '场景库': ['场景', '视觉', '听觉', '触觉', '嗅觉', '味觉', '五感', '光', '声音', '气味', '温度', '氛围', '环境', '办公室', '天台', '病房'],
        '法律风险库': ['法律', '风险', '违法', '侵权', '民法典', '刑法', '著作权', '隐私', '泄密', '合规', '触发条件', '后果严重性', '改编方案'],
        '词汇库': ['词汇', '词语', '通感', '感官', '修辞', '隐喻', '描写', '词', '出处', '强度'],
        '情绪库': ['情绪', '感受', '心理', '微表情', '生理反应', '行为', '对话特征', '幸存者', '愧疚', '愤怒', '恐惧', '悲伤'],
        '景色库': ['景色', '风景', '时空', '光学', '声学', '环境', '色卡', '时代', '气象', '地理', '自然'],
        '动作库': ['动作', '肢体', '手势', '姿态', '步伐', '动作分级', '节奏', '连带反应', '禁忌组合'],
        '对话库': ['对话', '台词', '潜台词', '对白', '声调', '信息密度', '权力关系', '表层', 'PUA'],
        '金句库': ['金句', '名言', '语录', '声韵', '平仄', '隐喻密度', '冲击力', '金句内容'],
        '幽默素材库': ['幽默', '笑点', '搞笑', '段子', '梗', '荒诞', '黑色幽默', '冷笑话', '笑料', '吐槽']
    },

    // ============ 字段提取模式 ============
    // 格式: "字段名：值" 或 "字段名:值" 或 "【字段名】值" 或 "[字段名]值"
    fieldPatterns: [
        // 中文冒号
        /^【?(.+?)】?\s*[：:]\s*(.+)$/,
        // 方括号
        /^【(.+?)】\s*(.+)$/,
        // 中括号
        /^\[(.+?)\]\s*(.+)$/,
        // 直接字段名
        /^(编号|类型标签|来源平台|核心冲突点|情感层次|改编方向|甜虐指数|甜虐平衡指数|适配角色关系|适用章节|道具符号|禁忌红线|多平台热度|伏笔需求|读者预期|风险提示|适用情节|冲突类型|现实原型|核心矛盾|情绪曲线|适用场景|风险等级|改编案例|爆发场景|解决方式|情绪价值|钩子类型|埋设位置|引爆章节|核心元素|埋设手法|情感导向|回收周期|关联反转|钩子密度|伏笔要求|修改方向|反转类型|铺垫线索|情感冲击|逻辑校验|表面呈现|真相揭露|伏笔设计|适用题材|风险屏障|角色定位|性格标签|标签|职业\/身份|职业|身份|情感障碍|专属物品|标志动作|感情线伏笔|隐秘关联|荷尔蒙触发点|致命性缺点|救赎开关|禁忌边界|场景类型|视觉焦点|听觉细节|触觉意象|嗅觉记忆|味觉隐喻|冲突触发点|伏笔回收点|数据参考|禁忌提示|情感强度|风险类型|法律依据|触发条件|后果严重性|预防措施|戏剧化技巧|分类|子类|核心词汇|强度|通感转化示例|关联情绪|出处|核心情绪|强度等级|生理反应|微表情编码|行为映射|对话特征|禁忌误用|案例来源|时空坐标|光学描写|声学描写|嗅觉层次|触觉反馈|动态元素|数据层|时代标签|关联色卡|动作分级|主体动作|连带反应|隐喻意义|节奏值|禁忌组合|经典案例|表层对话|潜台词|动作锚点|声调标记|信息密度|权力关系|出处章节|金句内容|声韵结构|隐喻密度|跨库冲击力|关联热梗|评论原文|核心笑点|幽默类型|可复用结构|优化建议|情绪强度|高频关键词|参考作品|创作周期|对应章节|埋梗位置|黑色幽默指数|冷笑话指数)\s*[：:]\s*(.+)$/
    ],

    // ============ 标签识别模式 (#xxx) ============
    tagPattern: /#[^\s#]+/g,

    // ============ 编号识别模式 ============
    idPattern: /[A-Z]{2}-\d{4}-\d{3}/g,

    // ============ 主解析函数 ============
    parse: function(text) {
        if (!text || !text.trim()) {
            return { results: [], detectedType: null };
        }

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const results = [];

        // 尝试结构化解析（按字段名分行）
        const structured = this.tryStructuredParse(lines);

        if (structured && structured.length > 0) {
            // 结构化解析成功
            for (const item of structured) {
                results.push(item);
            }
        } else {
            // 非结构化文本，尝试智能分类
            const detectedType = this.detectType(text);
            const item = this.extractFromFreeText(text, detectedType);
            if (item) {
                results.push(item);
            }
        }

        return { results, detectedType: results.length > 0 ? results[0].library : null };
    },

    // ============ 结构化解析（字段名:值 格式） ============
    tryStructuredParse: function(lines) {
        const results = [];
        let currentItem = null;
        let currentFields = {};
        let detectedLib = null;

        for (const line of lines) {
            const match = this.matchField(line);

            if (match) {
                const [field, value] = match;
                currentFields[field] = value;

                // 检测库类型
                if (!detectedLib) {
                    detectedLib = this.detectTypeFromFields(Object.keys(currentFields));
                }
            } else {
                // 非字段行 - 可能是分隔符或自由文本
                if (line === '---' || line === '===' || line === '') {
                    // 分隔符，保存当前条目
                    if (Object.keys(currentFields).length > 0) {
                        const lib = detectedLib || this.detectType(Object.values(currentFields).join(' '));
                        if (lib) {
                            results.push({
                                library: lib,
                                fields: { ...currentFields }
                            });
                        }
                        currentFields = {};
                        detectedLib = null;
                    }
                } else if (Object.keys(currentFields).length === 0) {
                    // 第一行非字段，可能是标题或内容
                    currentFields['_content'] = line;
                } else {
                    // 追加到上一个字段的值
                    const keys = Object.keys(currentFields);
                    const lastKey = keys[keys.length - 1];
                    if (lastKey && lastKey !== '_content') {
                        currentFields[lastKey] += '\n' + line;
                    }
                }
            }
        }

        // 保存最后一个条目
        if (Object.keys(currentFields).length > 0) {
            const lib = detectedLib || this.detectType(Object.values(currentFields).join(' '));
            if (lib) {
                results.push({
                    library: lib,
                    fields: { ...currentFields }
                });
            } else {
                // 无法确定库，默认放入热梗库
                results.push({
                    library: '热梗素材库',
                    fields: { ...currentFields }
                });
            }
        }

        return results;
    },

    // ============ 匹配字段行 ============
    matchField: function(line) {
        for (const pattern of this.fieldPatterns) {
            const match = line.match(pattern);
            if (match && match.length >= 3) {
                return [match[1].trim(), match[2].trim()];
            }
        }
        return null;
    },

    // ============ 从字段名推断库类型 ============
    detectTypeFromFields: function(fieldNames) {
        const fieldSet = new Set(fieldNames);
        let bestMatch = null;
        let bestScore = 0;

        for (const [libId, lib] of Object.entries(SCHEMA.libraries)) {
            let score = 0;
            for (const header of lib.headers) {
                if (fieldSet.has(header)) {
                    score++;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = libId;
            }
        }

        return bestScore > 0 ? bestMatch : null;
    },

    // ============ 关键词检测内容类型 ============
    detectType: function(text) {
        let bestMatch = null;
        let bestScore = 0;

        for (const [libId, keywords] of Object.entries(this.typeKeywords)) {
            let score = 0;
            for (const kw of keywords) {
                if (text.includes(kw)) {
                    score++;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = libId;
            }
        }

        return bestMatch || '热梗素材库';
    },

    // ============ 从自由文本提取字段 ============
    extractFromFreeText: function(text, detectedType) {
        if (!detectedType) return null;

        const lib = SCHEMA.getLibrary(detectedType);
        if (!lib) return null;

        const fields = {};

        // 提取标签 (#xxx)
        const tags = text.match(this.tagPattern);
        if (tags && tags.length > 0) {
            if (lib.headers.includes('类型标签')) {
                fields['类型标签'] = tags.join(' ');
            }
        }

        // 提取已有编号
        const ids = text.match(this.idPattern);
        if (ids && ids.length > 0) {
            fields['编号'] = ids[0];
        }

        // 提取来源平台
        const platforms = ['抖音', '快手', '微博', '小红书', 'B站', '知乎', 'LOFTER', '晋江', 'LOFTER'];
        for (const p of platforms) {
            if (text.includes(p)) {
                if (lib.headers.includes('来源平台')) {
                    fields['来源平台'] = p;
                }
                break;
            }
        }

        // 提取甜虐指数
        const sweetPattern = /甜(\d+)%.*?虐(\d+)%/;
        const sweetMatch = text.match(sweetPattern);
        if (sweetMatch) {
            if (lib.headers.includes('甜虐指数')) {
                fields['甜虐指数'] = `甜${sweetMatch[1]}%虐${sweetMatch[2]}%`;
            }
        }

        // 提取星等级
        const starPattern = /[★☆]+/;
        const starMatch = text.match(starPattern);
        if (starMatch) {
            for (const h of lib.headers) {
                if (h.includes('强度') || h.includes('等级') || h.includes('冲击') || h.includes('严重') || h.includes('风险')) {
                    fields[h] = starMatch[0];
                    break;
                }
            }
        }

        // 将剩余文本放入最合适的内容字段
        const contentFields = this.getContentField(detectedType);
        if (contentFields && contentFields.length > 0) {
            // 找到第一个还没值的字段
            for (const cf of contentFields) {
                if (!fields[cf]) {
                    // 去掉已提取的标签和编号
                    let cleanText = text;
                    if (tags) {
                        for (const t of tags) cleanText = cleanText.replace(t, '');
                    }
                    if (ids) {
                        for (const id of ids) cleanText = cleanText.replace(id, '');
                    }
                    cleanText = cleanText.trim();
                    if (cleanText.length > 0) {
                        fields[cf] = cleanText;
                    }
                    break;
                }
            }
        }

        return {
            library: detectedType,
            fields: fields
        };
    },

    // ============ 获取库的主要内容字段 ============
    getContentField: function(libId) {
        const fieldMap = {
            '热梗素材库': ['核心冲突点', '改编方向', '情感层次'],
            '冲突素材库': ['核心矛盾', '改编方向', '情绪曲线'],
            '钩子素材库': ['核心元素', '伏笔要求', '修改方向'],
            '反转素材库': ['真相揭露', '表面呈现', '伏笔设计'],
            '人设基因库': ['角色定位', '情感障碍', '职业/身份'],
            '场景库': ['场景类型', '视觉焦点', '情感曲线'],
            '法律风险库': ['风险类型', '改编方案', '触发条件'],
            '词汇库': ['核心词汇', '通感转化示例'],
            '情绪库': ['核心情绪', '生理反应', '行为映射'],
            '景色库': ['时空坐标', '光学描写'],
            '动作库': ['主体动作', '隐喻意义'],
            '对话库': ['表层对话', '潜台词'],
            '金句库': ['金句内容'],
            '幽默素材库': ['评论原文', '核心笑点']
        };
        return fieldMap[libId] || [];
    },

    // ============ 创建空字段对象（用于手动选择库类型） ============
    createEmptyFields: function(libId) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return {};
        const fields = {};
        for (const h of lib.headers) {
            fields[h] = '';
        }
        return fields;
    },

    // ============ 将解析结果映射到库的完整字段结构 ============
    normalizeFields: function(libId, fields) {
        const lib = SCHEMA.getLibrary(libId);
        if (!lib) return fields;

        const normalized = {};
        for (const h of lib.headers) {
            normalized[h] = fields[h] || '';
        }
        // 保留可能不在headers中的额外字段
        for (const [k, v] of Object.entries(fields)) {
            if (!normalized.hasOwnProperty(k) && k !== '_content') {
                normalized[k] = v;
            }
        }
        return normalized;
    }
};
