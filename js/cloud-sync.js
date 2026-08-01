/**
 * 云端同步模块 - 基于 GitHub 仓库的跨设备数据同步
 * 原理：将 localStorage 数据上传到 GitHub 仓库的 user-data.json，
 *       其他设备打开页面时自动拉取最新数据。
 */
const CloudSync = {
    REPO_OWNER: 'a764861734-stack',
    REPO_NAME: 'novel-platform',
    FILE_PATH: 'user-data.json',
    API_BASE: 'https://api.github.com/repos/a764861734-stack/novel-platform/contents/user-data.json',

    TOKEN_KEY: 'github_sync_token',
    SYNC_INFO_KEY: 'cloud_sync_info',
    AUTO_SYNC_KEY: 'cloud_auto_sync',

    _syncing: false,
    _autoSyncTimer: null,

    // ============ 初始化 ============
    init: function() {
        // 页面加载后自动拉取云端数据（静默）
        const autoSync = localStorage.getItem(this.AUTO_SYNC_KEY);
        if (autoSync === 'true' && this.getToken()) {
            setTimeout(() => this.silentPull(), 2000);
        }
    },

    // ============ Token 管理 ============
    getToken: function() {
        return localStorage.getItem(this.TOKEN_KEY) || '';
    },

    setToken: function(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },

    removeToken: function() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.SYNC_INFO_KEY);
        localStorage.removeItem(this.AUTO_SYNC_KEY);
    },

    // ============ 同步信息 ============
    getSyncInfo: function() {
        try {
            return JSON.parse(localStorage.getItem(this.SYNC_INFO_KEY) || '{}');
        } catch(e) {
            return {};
        }
    },

    setSyncInfo: function(info) {
        localStorage.setItem(this.SYNC_INFO_KEY, JSON.stringify(info));
    },

    // ============ 打开同步设置面板 ============
    openSettings: function() {
        const token = this.getToken();
        const info = this.getSyncInfo();
        const autoSync = localStorage.getItem(this.AUTO_SYNC_KEY) === 'true';

        const lastPush = info.lastPushTime || '从未';
        const lastPull = info.lastPullTime || '从未';
        const dataCount = info.dataCount || 0;

        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = '☁️ 云端同步设置';
        modalBody.innerHTML = `
            <div style="margin-bottom:20px;">
                <h4 style="margin-bottom:8px;color:var(--primary);">📋 同步说明</h4>
                <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
                    云端同步功能将你的所有数据（素材库、角色卡、故事线等）保存到 GitHub 仓库。<br>
                    <b>手机编辑后 → 点击「上传到云端」</b><br>
                    <b>电脑打开后 → 自动下载云端数据</b><br>
                    这样不同设备之间的数据就能保持一致。
                </p>
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block;font-weight:600;margin-bottom:6px;">GitHub Personal Access Token</label>
                <input type="password" id="syncTokenInput" value="${escapeAttr(token)}" placeholder="ghp_..." 
                    style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;font-size:14px;">
                <p style="font-size:12px;color:var(--text-light);margin-top:6px;">
                    Token 只存储在当前浏览器中，不会出现在源码里。需要 repo 权限。
                </p>
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="autoSyncCheck" ${autoSync?'checked':''} style="width:18px;height:18px;">
                    <span>开启自动同步（打开页面时自动拉取云端数据）</span>
                </label>
            </div>

            <div style="background:var(--bg-secondary);border-radius:8px;padding:14px;margin-bottom:16px;">
                <div style="font-size:13px;color:var(--text-secondary);line-height:2;">
                    <b>上次上传：</b>${lastPush}<br>
                    <b>上次下载：</b>${lastPull}<br>
                    <b>云端数据条数：</b>${dataCount} 条
                </div>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="CloudSync.push()" ${token?'':'disabled style="opacity:0.5;"'}>
                    ☁️ 上传到云端
                </button>
                <button class="btn btn-success" onclick="CloudSync.pull()" ${token?'':'disabled style="opacity:0.5;"'}>
                    📥 从云端下载
                </button>
                ${token ? '<button class="btn btn-danger" onclick="CloudSync.removeToken(); closeModal(); showToast(\'已清除Token\', \'info\');">清除Token</button>' : ''}
            </div>
        `;
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="CloudSync.saveSettings()">保存设置</button>
        `;
        openModal();
    },

    saveSettings: function() {
        const token = document.getElementById('syncTokenInput').value.trim();
        const autoSync = document.getElementById('autoSyncCheck').checked;

        if (token) {
            this.setToken(token);
            localStorage.setItem(this.AUTO_SYNC_KEY, autoSync ? 'true' : 'false');
            showToast('同步设置已保存', 'success');
        } else {
            this.removeToken();
            showToast('已清除Token', 'info');
        }
        closeModal();
    },

    // ============ 上传数据到云端 ============
    push: function() {
        const token = this.getToken();
        if (!token) {
            showToast('请先设置 GitHub Token', 'warning');
            this.openSettings();
            return;
        }

        if (this._syncing) {
            showToast('正在同步中，请稍候...', 'warning');
            return;
        }

        this._syncing = true;
        showToast('正在上传数据到云端...', 'info');

        // 收集所有数据
        const allData = localStorage.getItem(Store.STORAGE_KEY);
        const hotspotData = localStorage.getItem(HotspotModule.STORAGE_KEY);

        const payload = {
            version: 2,
            uploadTime: new Date().toISOString(),
            device: navigator.userAgent.substring(0, 50),
            storeData: JSON.parse(allData || '{}'),
            hotspotData: JSON.parse(hotspotData || '[]')
        };

        // 统计数据条数
        let totalItems = 0;
        const storeObj = payload.storeData;
        for (const key of Object.keys(storeObj)) {
            if (storeObj[key] && storeObj[key].items) {
                totalItems += storeObj[key].items.length;
            }
        }

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

        // 先获取已有文件的 sha（用于更新）
        fetch(this.API_BASE, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(r => {
            if (r.status === 404) return { sha: null };
            if (!r.ok) throw new Error('GitHub API: ' + r.status);
            return r.json();
        })
        .then(existing => {
            const body = {
                message: `Cloud sync: ${new Date().toLocaleString('zh-CN')} (${totalItems} items)`,
                content: content,
                committer: { name: 'Cloud Sync', email: 'sync@novel-platform.local' }
            };
            if (existing.sha) body.sha = existing.sha;

            return fetch(this.API_BASE, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        })
        .then(r => {
            if (!r.ok) throw new Error('Upload failed: ' + r.status);
            return r.json();
        })
        .then(() => {
            this._syncing = false;
            this.setSyncInfo({
                lastPushTime: new Date().toLocaleString('zh-CN'),
                lastPullTime: this.getSyncInfo().lastPullTime || '',
                dataCount: totalItems
            });
            showToast(`上传成功！共 ${totalItems} 条数据已同步到云端`, 'success');
        })
        .catch(e => {
            this._syncing = false;
            console.error('Cloud sync push error:', e);
            let msg = '上传失败';
            if (e.message.includes('401')) msg = 'Token 无效或已过期，请重新设置';
            else if (e.message.includes('403')) msg = 'Token 权限不足或触发限流，请检查 Token 权限';
            else if (e.message.includes('404')) msg = '仓库不存在或 Token 无访问权限';
            showToast(msg, 'error');
        });
    },

    // ============ 从云端下载数据 ============
    pull: function() {
        const token = this.getToken();
        if (!token) {
            showToast('请先设置 GitHub Token', 'warning');
            this.openSettings();
            return;
        }

        if (this._syncing) {
            showToast('正在同步中，请稍候...', 'warning');
            return;
        }

        this._syncing = true;
        showToast('正在从云端下载数据...', 'info');

        fetch(this.API_BASE, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(r => {
            if (r.status === 404) throw new Error('云端暂无数据，请先上传');
            if (!r.ok) throw new Error('GitHub API: ' + r.status);
            return r.json();
        })
        .then(json => {
            const content = decodeURIComponent(escape(atob(json.content)));
            const payload = JSON.parse(content);

            // 合并策略：云端数据覆盖本地（但保留本地比云端新的热点数据）
            if (payload.storeData) {
                // 保存前先备份本地数据
                const localBackup = localStorage.getItem(Store.STORAGE_KEY);
                localStorage.setItem('cloud_sync_backup', localBackup);

                localStorage.setItem(Store.STORAGE_KEY, JSON.stringify(payload.storeData));
                Store.data = payload.storeData;
            }

            if (payload.hotspotData) {
                // 热点数据采用合并策略：本地已有 + 云端新增
                const localHotspot = JSON.parse(localStorage.getItem(HotspotModule.STORAGE_KEY) || '[]');
                const cloudHotspot = payload.hotspotData;
                const merged = [...localHotspot];
                for (const cloudItem of cloudHotspot) {
                    const exists = merged.some(m => 
                        (m.title || '') === (cloudItem.title || '') ||
                        (m.id || '') === (cloudItem.id || '')
                    );
                    if (!exists) merged.push(cloudItem);
                }
                localStorage.setItem(HotspotModule.STORAGE_KEY, JSON.stringify(merged));
                HotspotModule.data = merged;
            }

            this._syncing = false;
            this.setSyncInfo({
                lastPushTime: this.getSyncInfo().lastPushTime || '',
                lastPullTime: new Date().toLocaleString('zh-CN'),
                dataCount: payload.storeData ? 
                    Object.values(payload.storeData).reduce((s, v) => s + (v.items ? v.items.length : 0), 0) : 0
            });

            showToast('云端数据已下载到本地，页面即将刷新...', 'success');
            setTimeout(() => {
                renderNav();
                navigateTo(currentPage);
            }, 1000);
        })
        .catch(e => {
            this._syncing = false;
            console.error('Cloud sync pull error:', e);
            let msg = '下载失败';
            if (e.message.includes('401')) msg = 'Token 无效或已过期，请重新设置';
            else if (e.message.includes('404')) msg = '云端暂无数据，请先在一台设备上上传';
            else msg = e.message;
            showToast(msg, 'error');
        });
    },

    // ============ 静默拉取（页面加载时自动执行）============
    silentPull: function() {
        const token = this.getToken();
        if (!token) return;

        fetch(this.API_BASE, {
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        })
        .then(r => {
            if (!r.ok) return null;
            return r.json();
        })
        .then(json => {
            if (!json || !json.content) return;

            const content = decodeURIComponent(escape(atob(json.content)));
            const payload = JSON.parse(content);

            // 比较云端和本地的时间戳
            const cloudTime = new Date(payload.uploadTime || 0).getTime();
            const localSyncInfo = this.getSyncInfo();
            const lastPullTime = localSyncInfo.lastPullTime ? 
                new Date(localSyncInfo.lastPullTime.replace(/(\d{4})\/(\d{1,2})\/(\d{1,2})/, '$1-$2-$3')).getTime() : 0;

            // 如果云端数据比上次拉取新，则自动更新
            if (cloudTime > lastPullTime && payload.storeData) {
                // 合并热点数据（不覆盖本地已有的）
                if (payload.hotspotData) {
                    const localHotspot = JSON.parse(localStorage.getItem(HotspotModule.STORAGE_KEY) || '[]');
                    const cloudHotspot = payload.hotspotData;
                    const merged = [...localHotspot];
                    for (const cloudItem of cloudHotspot) {
                        const exists = merged.some(m => 
                            (m.title || '') === (cloudItem.title || '') ||
                            (m.id || '') === (cloudItem.id || '')
                        );
                        if (!exists) merged.push(cloudItem);
                    }
                    localStorage.setItem(HotspotModule.STORAGE_KEY, JSON.stringify(merged));
                    HotspotModule.data = merged;
                }

                // 询问用户是否更新主数据
                const confirmHtml = `
                    <div style="text-align:center;padding:20px;">
                        <div style="font-size:48px;margin-bottom:16px;">☁️</div>
                        <h3 style="margin-bottom:10px;">检测到云端有新数据</h3>
                        <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;">
                            上传时间：${new Date(payload.uploadTime).toLocaleString('zh-CN')}<br>
                            上传设备：${escapeHtml(payload.device || '未知')}<br>
                            数据条数：${Object.values(payload.storeData).reduce((s,v)=>s+(v.items?v.items.length:0),0)} 条
                        </p>
                        <div style="display:flex;gap:10px;justify-content:center;">
                            <button class="btn btn-success" onclick="CloudSync.applyCloudData()">立即同步</button>
                            <button class="btn btn-secondary" onclick="closeModal()">暂不同步</button>
                        </div>
                    </div>
                `;
                const modalBody = document.getElementById('modalBody');
                const modalTitle = document.getElementById('modalTitle');
                const modalFooter = document.getElementById('modalFooter');
                modalTitle.textContent = '云端同步';
                modalBody.innerHTML = confirmHtml;
                modalFooter.innerHTML = '';
                openModal();

                // 暂存云端数据供 applyCloudData 使用
                this._pendingCloudData = payload;
            }
        })
        .catch(e => {
            console.log('Auto sync check failed (non-critical):', e);
        });
    },

    applyCloudData: function() {
        if (!this._pendingCloudData) return;
        const payload = this._pendingCloudData;

        // 备份本地数据
        const localBackup = localStorage.getItem(Store.STORAGE_KEY);
        localStorage.setItem('cloud_sync_backup', localBackup);

        localStorage.setItem(Store.STORAGE_KEY, JSON.stringify(payload.storeData));
        Store.data = payload.storeData;

        this.setSyncInfo({
            lastPushTime: this.getSyncInfo().lastPushTime || '',
            lastPullTime: new Date().toLocaleString('zh-CN'),
            dataCount: Object.values(payload.storeData).reduce((s,v)=>s+(v.items?v.items.length:0),0)
        });

        closeModal();
        showToast('云端数据已同步到本地', 'success');
        renderNav();
        navigateTo(currentPage);
        this._pendingCloudData = null;
    },

    // ============ 标记数据已变更（用于自动上传提示）============
    markDirty: function() {
        // 数据变更后 30 秒自动上传（如果开启了自动同步）
        if (localStorage.getItem(this.AUTO_SYNC_KEY) !== 'true') return;
        if (!this.getToken()) return;

        if (this._autoSyncTimer) clearTimeout(this._autoSyncTimer);
        this._autoSyncTimer = setTimeout(() => {
            this.push();
        }, 30000);
    }
};
