/**
 * 数据存储层 - 基于 localStorage 的完整 CRUD
 */
const Store = {
    STORAGE_KEY: 'qingyu_novel_platform',
    data: null,

    // ============ 初始化 ============
    init: function() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch(e) {
                this.data = this.createEmptyData();
            }
        } else {
            // 首次启动，加载种子数据
            this.data = this.createEmptyData();
            this.loadSeedData();
        }
        this.save();
    },

    createEmptyData: function() {
        const data = {};
        // 初始化所有素材库
        for (const libId of SCHEMA.getLibraryIds()) {
            const lib = SCHEMA.getLibrary(libId);
            data[libId] = {
                name: libId,
                prefix: lib.prefix,
                headers: lib.headers,
                items: []
            };
        }
        // 初始化角色卡
        data['角色卡'] = { name: '角色卡', prefix: 'CHAR', items: [] };
        // 初始化故事控制器
        data['故事线'] = { name: '故事线', items: [] };
        // 初始化扫榜
        data['扫榜'] = { name: '扫榜', headers: ['章节','章节标题','内容提要','字数','点击','更新时间','文章名','作者','标签'], items: [] };
        // 初始化大纲
        data['大纲'] = { name: '大纲', headers: ['故事阶段','大事件','章节名称','事业线','感情线','时间','事件内容','主要人物','看点','问题','流程','伏笔','知识','写后梗概'], items: [] };
        return data;
    },

    // ============ 加载种子数据 ============
    loadSeedData: function() {
        if (typeof SEED_DATA === 'undefined') return;

        for (const libId of Object.keys(SEED_DATA)) {
            if (this.data[libId]) {
                const seed = SEED_DATA[libId];
                if (seed.items) {
                    this.data[libId].items = seed.items;
                }
                if (seed.headers && !this.data[libId].headers) {
                    this.data[libId].headers = seed.headers;
                }
                if (seed.fields) {
                    this.data[libId].fields = seed.fields;
                }
            }
        }
    },

    // ============ 保存 ============
    save: function() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    },

    // ============ 获取库数据 ============
    getLibrary: function(libId) {
        return this.data[libId] || { items: [], headers: [] };
    },

    // ============ 获取库所有条目 ============
    getItems: function(libId) {
        const lib = this.data[libId];
        return lib ? (lib.items || []) : [];
    },

    // ============ 获取所有库的编号列表（用于编号去重） ============
    getExistingIds: function(libId) {
        return this.getItems(libId).map(item => item['编号']).filter(id => id);
    },

    // ============ 添加条目 ============
    addItem: function(libId, item) {
        if (!this.data[libId]) {
            this.data[libId] = { items: [], headers: [] };
        }
        if (!this.data[libId].items) {
            this.data[libId].items = [];
        }
        // 自动生成编号
        if (!item['编号']) {
            const lib = SCHEMA.getLibrary(libId);
            if (lib) {
                item['编号'] = SCHEMA.generateId(lib.prefix, this.getExistingIds(libId));
            }
        }
        this.data[libId].items.push(item);
        this.save();
        return item;
    },

    // ============ 批量添加条目 ============
    addItems: function(libId, items) {
        if (!this.data[libId]) {
            this.data[libId] = { items: [], headers: [] };
        }
        if (!this.data[libId].items) {
            this.data[libId].items = [];
        }
        for (const item of items) {
            if (!item['编号']) {
                const lib = SCHEMA.getLibrary(libId);
                if (lib) {
                    item['编号'] = SCHEMA.generateId(lib.prefix, this.getExistingIds(libId));
                }
            }
            this.data[libId].items.push(item);
        }
        this.save();
        return items;
    },

    // ============ 更新条目 ============
    updateItem: function(libId, index, updates) {
        if (!this.data[libId] || !this.data[libId].items[index]) return null;
        Object.assign(this.data[libId].items[index], updates);
        this.save();
        return this.data[libId].items[index];
    },

    // ============ 更新条目（按编号） ============
    updateItemById: function(libId, id, updates) {
        if (!this.data[libId]) return null;
        const items = this.data[libId].items;
        for (let i = 0; i < items.length; i++) {
            if (items[i]['编号'] === id) {
                Object.assign(items[i], updates);
                this.save();
                return items[i];
            }
        }
        return null;
    },

    // ============ 删除条目 ============
    deleteItem: function(libId, index) {
        if (!this.data[libId] || !this.data[libId].items[index]) return false;
        this.data[libId].items.splice(index, 1);
        this.save();
        return true;
    },

    // ============ 删除条目（按编号） ============
    deleteItemById: function(libId, id) {
        if (!this.data[libId]) return false;
        const items = this.data[libId].items;
        for (let i = 0; i < items.length; i++) {
            if (items[i]['编号'] === id) {
                items.splice(i, 1);
                this.save();
                return true;
            }
        }
        return false;
    },

    // ============ 搜索条目 ============
    searchItems: function(libId, keyword, filters) {
        let items = this.getItems(libId);

        // 应用筛选
        if (filters) {
            for (const [field, value] of Object.entries(filters)) {
                if (value && value !== 'all') {
                    items = items.filter(item => {
                        const val = (item[field] || '').toString();
                        return val.includes(value);
                    });
                }
            }
        }

        // 应用搜索
        if (keyword) {
            const kw = keyword.toLowerCase();
            items = items.filter(item => {
                return Object.values(item).some(v => {
                    if (!v) return false;
                    return v.toString().toLowerCase().includes(kw);
                });
            });
        }

        return items;
    },

    // ============ 获取库所有条目（别名） ============
    getAll: function(libId) {
        return this.getItems(libId);
    },

    // ============ 获取统计 ============
    getStats: function() {
        const stats = {};
        let total = 0;
        for (const libId of Object.keys(this.data)) {
            const count = (this.data[libId].items || []).length;
            stats[libId] = count;
            total += count;
        }
        stats['总计'] = total;
        return stats;
    },

    // ============ 导出全部数据 ============
    exportData: function() {
        return JSON.stringify(this.data, null, 2);
    },

    // ============ 导入数据 ============
    importData: function(jsonStr) {
        try {
            const imported = JSON.parse(jsonStr);
            this.data = imported;
            this.save();
            return true;
        } catch(e) {
            return false;
        }
    },

    // ============ 跨库搜索（按编号） ============
    findById: function(id) {
        if (!id) return null;
        for (const libId of Object.keys(this.data)) {
            const items = this.data[libId].items || [];
            for (const item of items) {
                if (item['编号'] === id) {
                    return { libId, item };
                }
            }
        }
        return null;
    },

    // ============ 获取故事线数据 ============
    getStoryLines: function() {
        return (this.data['故事线'] && this.data['故事线'].items) || [];
    },

    // ============ 保存故事线 ============
    saveStoryLines: function(lines) {
        if (!this.data['故事线']) {
            this.data['故事线'] = { items: [] };
        }
        this.data['故事线'].items = lines;
        this.save();
    }
};
