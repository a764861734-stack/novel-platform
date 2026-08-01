/**
 * 素材库 Schema 定义
 * 每个库的完整字段配置，用于动态生成表格、表单和筛选器
 */
const SCHEMA = {
    // ============ 14个素材库 ============
    libraries: {
        '热梗素材库': {
            prefix: 'RG',
            icon: '🔥',
            color: 'tag-pink',
            description: '收集各大平台热门梗，转化为小说创作素材',
            headers: ['编号','类型标签','来源平台','核心冲突点','情感层次','改编方向','甜虐指数','甜虐平衡指数','适配角色关系','适用章节','道具符号','禁忌红线','多平台热度','伏笔需求','读者预期','风险提示','适用情节'],
            displayFields: ['编号','类型标签','核心冲突点','改编方向','甜虐指数','来源平台'],
            filterFields: ['类型标签','来源平台','甜虐指数','适配角色关系']
        },
        '冲突素材库': {
            prefix: 'CT',
            icon: '⚔️',
            color: 'tag-orange',
            description: '各类冲突原型与改编方案，构建故事矛盾核心',
            headers: ['编号','冲突类型','来源平台','现实原型','核心矛盾','情绪曲线','适配角色关系','适用场景','风险等级','改编方向','改编案例','爆发场景','解决方式','情绪价值','伏笔需求','适用情节'],
            displayFields: ['编号','冲突类型','核心矛盾','情绪曲线','风险等级','适用场景'],
            filterFields: ['冲突类型','风险等级','适用场景','适配角色关系']
        },
        '钩子素材库': {
            prefix: 'GZ',
            icon: '🪝',
            color: 'tag-blue',
            description: '埋设悬念钩子，控制读者期待与回收节奏',
            headers: ['编号','钩子类型','埋设位置','类型标签','引爆章节','核心元素','埋设手法','情感导向','回收周期','关联反转','钩子密度','伏笔要求','修改方向','风险提示','适用情节'],
            displayFields: ['编号','钩子类型','核心元素','引爆章节','回收周期','情感导向'],
            filterFields: ['钩子类型','埋设手法','钩子密度','情感导向']
        },
        '反转素材库': {
            prefix: 'FZ',
            icon: '🔄',
            color: 'tag-purple',
            description: '剧情反转设计，含铺垫线索与逻辑校验',
            headers: ['编号','反转类型','铺垫线索','爆发章节','情感冲击','逻辑校验','表面呈现','真相揭露','伏笔设计','改编案例','现实原型','适用题材','风险屏障','适用情节'],
            displayFields: ['编号','反转类型','爆发章节','情感冲击','真相揭露','适用题材'],
            filterFields: ['反转类型','情感冲击','适用题材']
        },
        '人设基因库': {
            prefix: 'RS',
            icon: '🧬',
            color: 'tag-green',
            description: '角色基因模板，含性格、障碍、救赎等完整人设要素',
            headers: ['编号','角色定位','性格标签','标签','职业/身份','情感障碍','专属物品','标志动作','感情线伏笔','隐秘关联','荷尔蒙触发点','致命性缺点','救赎开关','禁忌边界','适用情节'],
            displayFields: ['编号','角色定位','性格标签','职业/身份','专属物品','适用情节'],
            filterFields: ['角色定位','性格标签','标签','适用情节']
        },
        '场景库': {
            prefix: 'CJ',
            icon: '🎬',
            color: 'tag-blue',
            description: '五感场景描写模板，含视觉听觉触觉嗅觉味觉',
            headers: ['编号','场景类型','视觉焦点','听觉细节','触觉意象','嗅觉记忆','味觉隐喻','情感曲线','冲突触发点','伏笔回收点','适用情节','数据参考','禁忌提示','情感强度'],
            displayFields: ['编号','场景类型','视觉焦点','情感曲线','冲突触发点','适用情节'],
            filterFields: ['场景类型','适用情节']
        },
        '法律风险库': {
            prefix: 'FL',
            icon: '⚖️',
            color: 'tag-orange',
            description: '创作中的法律风险点及改编规避方案',
            headers: ['编号','风险类型','法律依据','触发条件','后果严重性','现实原型','改编方案','预防措施','戏剧化技巧','适用情节'],
            displayFields: ['编号','风险类型','法律依据','后果严重性','改编方案','适用情节'],
            filterFields: ['风险类型','后果严重性']
        },
        '词汇库': {
            prefix: 'CH',
            icon: '📝',
            color: 'tag-gray',
            description: '感官词汇与通感转化示例，提升文笔质感',
            headers: ['编号','分类','子类','核心词汇','强度','通感转化示例','适用题材','关联情绪','出处'],
            displayFields: ['编号','分类','子类','核心词汇','强度','通感转化示例'],
            filterFields: ['分类','子类','适用题材']
        },
        '情绪库': {
            prefix: 'QX',
            icon: '💫',
            color: 'tag-pink',
            description: '情绪刻画模板，含生理反应、微表情与行为映射',
            headers: ['编号','核心情绪','强度等级','生理反应','微表情编码','行为映射','对话特征','适用场景','禁忌误用','案例来源'],
            displayFields: ['编号','核心情绪','强度等级','生理反应','行为映射','适用场景'],
            filterFields: ['核心情绪','适用场景']
        },
        '景色库': {
            prefix: 'JS',
            icon: '🏔️',
            color: 'tag-green',
            description: '时空场景描写，光学声学嗅觉多维度呈现',
            headers: ['编号','时空坐标','光学描写','声学描写','嗅觉层次','触觉反馈','动态元素','数据层','时代标签','关联色卡'],
            displayFields: ['编号','时空坐标','光学描写','声学描写','时代标签','关联色卡'],
            filterFields: ['时代标签']
        },
        '动作库': {
            prefix: 'DZ',
            icon: '✋',
            color: 'tag-orange',
            description: '动作描写分级模板，含隐喻与节奏控制',
            headers: ['编号','场景类型','动作分级','主体动作','连带反应','隐喻意义','节奏值','禁忌组合','经典案例'],
            displayFields: ['编号','场景类型','动作分级','主体动作','隐喻意义','节奏值'],
            filterFields: ['场景类型','动作分级']
        },
        '对话库': {
            prefix: 'DH',
            icon: '💬',
            color: 'tag-purple',
            description: '对话模板，含表层对话与潜台词拆解',
            headers: ['编号','冲突类型','表层对话','潜台词','动作锚点','声调标记','信息密度','权力关系','出处章节'],
            displayFields: ['编号','冲突类型','表层对话','潜台词','权力关系','出处章节'],
            filterFields: ['冲突类型','权力关系']
        },
        '金句库': {
            prefix: 'JJ',
            icon: '✨',
            color: 'tag-pink',
            description: '金句收藏，含声韵结构与隐喻密度分析',
            headers: ['编号','金句内容','类型标签','声韵结构','隐喻密度','跨库冲击力','关联热梗','适用情节'],
            displayFields: ['编号','金句内容','类型标签','隐喻密度','适用情节'],
            filterFields: ['类型标签','隐喻密度']
        },
        '幽默素材库': {
            prefix: 'HM',
            icon: '😄',
            color: 'tag-green',
            description: '幽默桥段模板，含笑点结构与适用场景',
            headers: ['编号','评论原文','核心笑点','幽默类型','可复用结构','优化建议','情绪强度','适用场景','高频关键词','禁忌提示','参考作品','创作周期','对应章节','埋梗位置','黑色幽默指数','冷笑话指数'],
            displayFields: ['编号','评论原文','核心笑点','幽默类型','适用场景','黑色幽默指数'],
            filterFields: ['幽默类型','适用场景']
        }
    },

    // ============ 编号规则 ============
    idPattern: '{PREFIX}-2025-{SEQ}',

    // ============ 导航菜单结构 ============
    nav: [
        {
            section: '核心功能',
            items: [
                { id: 'dashboard', name: '控制台', icon: '📊' },
                { id: 'parser', name: '智能解析', icon: '🤖' },
                { id: 'characters', name: '角色卡', icon: '👤' },
                { id: 'controller', name: '故事控制器', icon: '🎮' }
            ]
        },
        {
            section: '素材库',
            items: [
                { id: '热梗素材库', name: '热梗素材库', icon: '🔥' },
                { id: '冲突素材库', name: '冲突素材库', icon: '⚔️' },
                { id: '钩子素材库', name: '钩子素材库', icon: '🪝' },
                { id: '反转素材库', name: '反转素材库', icon: '🔄' },
                { id: '人设基因库', name: '人设基因库', icon: '🧬' },
                { id: '场景库', name: '场景库', icon: '🎬' },
                { id: '法律风险库', name: '法律风险库', icon: '⚖️' },
                { id: '词汇库', name: '词汇库', icon: '📝' },
                { id: '情绪库', name: '情绪库', icon: '💫' },
                { id: '景色库', name: '景色库', icon: '🏔️' },
                { id: '动作库', name: '动作库', icon: '✋' },
                { id: '对话库', name: '对话库', icon: '💬' },
                { id: '金句库', name: '金句库', icon: '✨' },
                { id: '幽默素材库', name: '幽默素材库', icon: '😄' }
            ]
        },
        {
            section: '创作工作台',
            items: [
                { id: 'daily', name: '每日工作台', icon: '⏰' },
                { id: 'chapter-check', name: '章节质量检查', icon: '✅' },
                { id: 'analysis', name: '拆文分析', icon: '🔬' },
                { id: 'maintenance', name: '素材库维护', icon: '🔧' },
                { id: 'projects', name: '项目管理', icon: '📁' },
                { id: 'revenue', name: '收益计算器', icon: '💰' }
            ]
        },
        {
            section: '辅助工具',
            items: [
                { id: 'hotspot', name: '热点中心', icon: '🌐' },
                { id: '扫榜', name: '扫榜数据', icon: '📈' },
                { id: '大纲', name: '大纲管理', icon: '📋' }
            ]
        }
    ],

    // ============ 获取库配置 ============
    getLibrary: function(libId) {
        return this.libraries[libId];
    },

    // ============ 获取所有库ID ============
    getLibraryIds: function() {
        return Object.keys(this.libraries);
    },

    // ============ 生成编号 ============
    generateId: function(prefix, existingIds) {
        let seq = 1;
        let id;
        do {
            id = `${prefix}-2025-${String(seq).padStart(3, '0')}`;
            seq++;
        } while (existingIds && existingIds.includes(id));
        return id;
    }
};

// ============ 角色卡字段定义 ============
const CHAR_CARD_FIELDS = [
    { category: '基础档案', field: '姓名', hint: '填名字，可加外号', type: 'text' },
    { category: '基础档案', field: '性别', hint: '', type: 'text' },
    { category: '基础档案', field: '年龄', hint: '', type: 'text' },
    { category: '基础档案', field: '出生年月日', hint: '', type: 'text' },
    { category: '基础档案', field: '核心定位', hint: '主角/配角/反派/盟友', type: 'text' },
    { category: '基础档案', field: '故事功能', hint: '推动者/观察者/催化剂/牺牲者', type: 'text' },
    { category: '基础档案', field: '生理特征', hint: '身高/体重/疤痕/胎记/发色/瞳色', type: 'textarea' },
    { category: '基础档案', field: '年龄时间轴', hint: '出场年龄→主剧情年龄→结局年龄', type: 'textarea' },
    { category: '基础档案', field: '生存坐标', hint: '出生城市→上学城市→工作城市', type: 'textarea' },
    { category: '基础档案', field: '表面身份', hint: '公开职业/社会角色', type: 'text' },
    { category: '基础档案', field: '隐藏身份', hint: '秘密/第二职业', type: 'text' },
    { category: '基础档案', field: '经济状况', hint: '收入来源/负债/消费习惯', type: 'textarea' },
    { category: '基础档案', field: 'MBTI人格', hint: '', type: 'text' },
    { category: '基础档案', field: '九型人格', hint: '', type: 'text' },
    { category: '基础档案', field: '社交模式', hint: '擅长交际还是独行侠', type: 'textarea' },
    { category: '故事线索', field: '感情线', hint: '初始状态→转折事件→结局变化', type: 'textarea' },
    { category: '故事线索', field: '事业线', hint: '目标/阻碍/代价/最终成就', type: 'textarea' },
    { category: '故事线索', field: '生活线', hint: '居住环境变化/重要物品得失', type: 'textarea' },
    { category: '故事线索', field: '执念核心', hint: '贯穿全文的追求', type: 'textarea' },
    { category: '故事线索', field: '道具叙事', hint: '', type: 'textarea' },
    { category: '静态特征', field: '身高', hint: '', type: 'text' },
    { category: '静态特征', field: '体型', hint: '', type: 'text' },
    { category: '静态特征', field: '发型发色', hint: '', type: 'text' },
    { category: '静态特征', field: '瞳色', hint: '', type: 'text' },
    { category: '静态特征', field: '显著标记', hint: '', type: 'textarea' },
    { category: '静态特征', field: '穿衣风格', hint: '', type: 'textarea' },
    { category: '动态特征', field: '习惯性动作', hint: '', type: 'textarea' },
    { category: '动态特征', field: '微表情', hint: '', type: 'textarea' },
    { category: '动态特征', field: '声音特质', hint: '', type: 'textarea' },
    { category: '动态特征', field: '体态语言', hint: '', type: 'textarea' },
    { category: '动态特征', field: '味觉记忆', hint: '特定食物关联的回忆', type: 'textarea' },
    { category: '语言特征', field: '口头禅', hint: '', type: 'text' },
    { category: '语言特征', field: '修辞风格', hint: '', type: 'textarea' },
    { category: '语言特征', field: '禁忌词汇', hint: '', type: 'text' },
    { category: '语言特征', field: '谎言模式', hint: '', type: 'textarea' },
    { category: '象征系统', field: '代表颜色', hint: '', type: 'text' },
    { category: '象征系统', field: '精神动物', hint: '', type: 'text' },
    { category: '象征系统', field: '主题意象', hint: '', type: 'text' },
    { category: '象征系统', field: '专属道具', hint: '', type: 'text' },
    { category: '性格图谱', field: '表面性格', hint: '对外表现', type: 'textarea' },
    { category: '性格图谱', field: '真实性格', hint: '私下状态', type: 'textarea' },
    { category: '性格图谱', field: '性格开关', hint: '触发情绪波动的事件', type: 'textarea' },
    { category: '性格图谱', field: '矛盾行为', hint: '冲突性习惯', type: 'textarea' },
    { category: '性格图谱', field: '黑暗秘密', hint: '不可告人的过往', type: 'textarea' },
    { category: '性格图谱', field: '性格成因', hint: '家庭/童年/创伤事件影响', type: 'textarea' },
    { category: '性格图谱', field: '致命弱点', hint: '容易导致失败的性格缺陷', type: 'textarea' },
    { category: '性格图谱', field: '反差萌点', hint: '矛盾设定', type: 'textarea' },
    { category: '性格图谱', field: '救赎码', hint: '', type: 'textarea' },
    { category: '原生烙印', field: '父亲', hint: '职业/性格/对角色影响', type: 'textarea' },
    { category: '原生烙印', field: '母亲', hint: '存在状态/关键事件', type: 'textarea' },
    { category: '原生烙印', field: '家庭创伤', hint: '改变命运的事件', type: 'textarea' },
    { category: '原生烙印', field: '继承特质', hint: '从家庭获得的能力/阴影', type: 'textarea' },
    { category: '关系网络', field: '命定对手', hint: '身份/矛盾点', type: 'textarea' },
    { category: '关系网络', field: '情感锚点', hint: '治愈角色的人/物', type: 'textarea' },
    { category: '关系网络', field: '利益盟友', hint: '合作关系', type: 'textarea' },
    { category: '关系网络', field: '镜像角色', hint: '相似却对立的存在', type: 'textarea' },
    { category: '技能与秘密', field: '谋生技能', hint: '职业能力', type: 'textarea' },
    { category: '技能与秘密', field: '黑暗技能', hint: '非常规手段', type: 'textarea' },
    { category: '技能与秘密', field: '身体印记', hint: '疤痕/纹身含义', type: 'textarea' },
    { category: '技能与秘密', field: '电子痕迹', hint: '社交账号秘密', type: 'textarea' },
    { category: '物件叙事', field: '标志物品', hint: '随身携带物', type: 'textarea' },
    { category: '物件叙事', field: '味觉记忆', hint: '食物隐喻', type: 'textarea' },
    { category: '物件叙事', field: '科技依赖', hint: '现代设备作用', type: 'textarea' },
    { category: '物件叙事', field: '空间烙印', hint: '居住地细节', type: 'textarea' },
    { category: '欲望齿轮', field: '表层目标', hint: '直接动机', type: 'textarea' },
    { category: '欲望齿轮', field: '深层渴望', hint: '心理需求', type: 'textarea' },
    { category: '欲望齿轮', field: '终极恐惧', hint: '最怕揭穿的真相', type: 'textarea' },
    { category: '欲望齿轮', field: '道德盲区', hint: '越界行为', type: 'textarea' },
    { category: '时间伤痕', field: '童年烙印', hint: '7-12岁关键事件', type: 'textarea' },
    { category: '时间伤痕', field: '青春转折', hint: '15-20岁剧变', type: 'textarea' },
    { category: '时间伤痕', field: '成年阴影', hint: '持续影响的痛苦', type: 'textarea' },
    { category: '成长裂变', field: '初始状态', hint: '故事起点模样', type: 'textarea' },
    { category: '成长裂变', field: '黑化阈值', hint: '堕落转折事件', type: 'textarea' },
    { category: '成长裂变', field: '救赎密码', hint: '醒悟契机', type: 'textarea' },
    { category: '成长裂变', field: '结局残留', hint: '改变与不变', type: 'textarea' },
    { category: '现代烙印', field: '社交人格', hint: '各平台人设', type: 'textarea' },
    { category: '现代烙印', field: '经济压迫', hint: '资本枷锁', type: 'textarea' },
    { category: '现代烙印', field: '科技反噬', hint: '设备隐患', type: 'textarea' },
    { category: '隐秘维度', field: '性张力点', hint: '暧昧习惯', type: 'textarea' },
    { category: '隐秘维度', field: '感官触发器', hint: '五感记忆', type: 'textarea' },
    { category: '隐秘维度', field: '空间禁忌', hint: '抗拒的场所', type: 'textarea' }
];
