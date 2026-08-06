const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    // Elements Header & Avatar
    const userStatusText = document.getElementById('user-status-text');
    const avatarBtn = document.getElementById('avatar-btn');
    const avatarText = document.getElementById('avatar-text');
    const avatarDropdown = document.getElementById('avatar-dropdown');

    const dropdownUserAvatar = document.getElementById('dropdown-user-avatar');
    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    const dropdownConnStatus = document.getElementById('dropdown-conn-status');
    const dropdownSyncBtn = document.getElementById('dropdown-sync-btn');
    const dropdownAuthBtn = document.getElementById('dropdown-auth-btn');
    const dropdownAuthIcon = document.getElementById('dropdown-auth-icon');
    const dropdownAuthText = document.getElementById('dropdown-auth-text');

    const syncBtn = document.getElementById('sync-btn');
    const btnCreateModal = document.getElementById('btn-create-modal');
    const statusBanner = document.getElementById('status-banner');
    const statusBannerText = document.getElementById('status-banner-text');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const foldersGrid = document.getElementById('folders-grid');
    const studysetsList = document.getElementById('studysets-list');

    // Forms
    const addFolderBtn = document.getElementById('add-folder-btn');
    const formCreateFolder = document.getElementById('form-create-folder');
    const inputFolderName = document.getElementById('input-folder-name');
    const inputFolderDesc = document.getElementById('input-folder-desc');
    const btnCancelFolder = document.getElementById('btn-cancel-folder');
    const btnSaveFolder = document.getElementById('btn-save-folder');

    const addSetBtn = document.getElementById('add-set-btn');
    const formCreateSet = document.getElementById('form-create-set');
    const inputSetName = document.getElementById('input-set-name');
    const selectSetFolder = document.getElementById('select-set-folder');
    const btnCancelSet = document.getElementById('btn-cancel-set');
    const btnSaveSet = document.getElementById('btn-save-set');

    let isLoggedIn = false;
    let currentUserProfile = null;

    // ==========================================
    // 1. AVATAR DROPDOWN MENU TOGGLE
    // ==========================================
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = avatarDropdown.style.display === 'block';
        avatarDropdown.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!avatarDropdown.contains(e.target) && e.target !== avatarBtn) {
            avatarDropdown.style.display = 'none';
        }
    });

    // ==========================================
    // 2. CHUYỂN TAB
    // ==========================================
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });

    // ==========================================
    // 3. KHỞI TẠO & LOAD DỮ LIỆU CỤC BỘ / API
    // ==========================================
    async function initData() {
        // 1. Đọc ngay lập tức từ chrome.storage.local để giữ nguyên trạng thái mà không bị reset
        chrome.storage.local.get(['auth_is_logged_in', 'auth_user_profile'], async (res) => {
            if (res.auth_is_logged_in && res.auth_user_profile) {
                isLoggedIn = true;
                currentUserProfile = res.auth_user_profile;
                updateAuthUI(true, currentUserProfile);
            } else {
                updateAuthUI(false, null);
            }

            // 2. Chạy kiểm tra thực tế background
            const currentStatus = await checkAuthStatus();
            if (currentStatus !== isLoggedIn) {
                isLoggedIn = currentStatus;
                updateAuthUI(isLoggedIn, currentUserProfile);
            }

            if (isLoggedIn) {
                await autoSyncLocalToApi();
            }

            renderLocalData();
        });
    }

    function updateAuthUI(loggedIn, profile) {
        if (loggedIn) {
            userStatusText.textContent = 'Đã kết nối Web';

            const initial = (profile?.name || 'User').charAt(0).toUpperCase();
            avatarText.textContent = initial;
            avatarBtn.className = 'avatar-btn'; // Styled blue avatar like web

            dropdownUserAvatar.textContent = initial;
            dropdownUserName.textContent = profile?.name || 'Thành viên VocaLearn';
            dropdownUserEmail.textContent = profile?.email || 'Đã xác thực tài khoản';
            dropdownConnStatus.textContent = 'Đã kết nối Web Server';

            dropdownAuthIcon.textContent = '🚪';
            dropdownAuthText.textContent = 'Đăng xuất tài khoản';
            dropdownAuthBtn.className = 'dropdown-item action-item danger';
        } else {
            userStatusText.textContent = 'Chế độ cục bộ';

            avatarText.textContent = '🔑';
            avatarBtn.className = 'avatar-btn offline';

            dropdownUserAvatar.textContent = '🔑';
            dropdownUserName.textContent = 'Khách (Chế độ Cục bộ)';
            dropdownUserEmail.textContent = 'Chưa đăng nhập VocaLearn';
            dropdownConnStatus.textContent = 'Cục bộ (Chrome LocalStorage)';

            dropdownAuthIcon.textContent = '🔑';
            dropdownAuthText.textContent = 'Đăng nhập VocaLearn';
            dropdownAuthBtn.className = 'dropdown-item action-item primary';
        }
    }

    // Lắng nghe sự kiện thay đổi trạng thái auth từ background
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === "auth_status_changed") {
            chrome.storage.local.get(['auth_is_logged_in', 'auth_user_profile'], (res) => {
                isLoggedIn = !!res.auth_is_logged_in;
                currentUserProfile = res.auth_user_profile || null;
                updateAuthUI(isLoggedIn, currentUserProfile);
            });
        }
    });

    async function checkAuthStatus() {
        try {
            let token = await getWebAuthToken();

            const headers = { 'Accept': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Gọi API /api/auth/me
            const resAuth = await fetch(`${API_BASE}/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
                headers: headers
            });

            if (resAuth.ok) {
                const data = await resAuth.json();
                if (data && data.result) {
                    const u = data.result;
                    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Thành viên VocaLearn';
                    currentUserProfile = {
                        id: u.id,
                        name: fullName,
                        email: u.email || 'Đã đăng nhập'
                    };
                    return true;
                }
            }

            // Nếu Backend báo 401 hoặc 403 (do Token cũ bị hỏng signature), tiến hành clear token lỗi
            if (resAuth.status === 401 || resAuth.status === 403) {
                console.warn('⚠️ Token JWT hết hạn hoặc chữ ký không hợp lệ. Đang xóa token cũ...');
                await clearInvalidWebToken();
            }

            return false;
        } catch (e) {
            console.error('Lỗi kiểm tra đăng nhập:', e);
            return false;
        }
    }

    // Helper: Xóa Token hỏng trên các Tab Web đang mở
    async function clearInvalidWebToken() {
        try {
            const tabs = await chrome.tabs.query({ url: '*://localhost/*' });
            tabs.forEach(t => {
                if (t.id) {
                    chrome.scripting.executeScript({
                        target: { tabId: t.id },
                        func: () => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('auth_token');
                        }
                    }).catch(() => {});
                }
            });
        } catch (e) {}
    }

    // Helper: Tìm kiếm Token Đăng nhập từ Cookie hoặc LocalStorage của Web VocaLearn
    async function getWebAuthToken() {
        try {
            // Check Cookie
            if (chrome.cookies) {
                const c5173 = await chrome.cookies.get({ url: 'http://localhost:5173', name: 'auth_token' });
                const c8080 = await chrome.cookies.get({ url: 'http://localhost:8080', name: 'auth_token' });
                const cToken = await chrome.cookies.get({ url: 'http://localhost:5173', name: 'token' });
                if (c5173?.value) return c5173.value;
                if (c8080?.value) return c8080.value;
                if (cToken?.value) return cToken.value;
            }

            // Check LocalStorage trên các tab VocaLearn Web đang mở
            const tabs = await chrome.tabs.query({ url: '*://localhost/*' });
            if (tabs && tabs.length > 0) {
                for (let tab of tabs) {
                    if (tab.id) {
                        try {
                            const results = await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: () => localStorage.getItem('token') || localStorage.getItem('auth_token')
                            });
                            if (results && results[0] && results[0].result) {
                                return results[0].result;
                            }
                        } catch (err) {}
                    }
                }
            }
        } catch (e) {
            console.warn('Không thể tự đọc Web Token:', e);
        }
        return null;
    }

    dropdownAuthBtn.addEventListener('click', async () => {
        avatarDropdown.style.display = 'none';
        if (isLoggedIn) {
            // Thực hiện Đăng xuất
            try {
                await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
            } catch (e) {}

            // Xóa sạch Cookie & LocalStorage trên cả Web và Extension
            await clearInvalidWebToken();

            chrome.storage.local.set({
                auth_is_logged_in: false,
                auth_user_profile: null
            });

            isLoggedIn = false;
            currentUserProfile = null;
            updateAuthUI(false, null);
            showBanner('Đã đăng xuất tài khoản VocaLearn.', 'info');

            // Mở/Chuyển hướng trang login trên web
            window.open('http://localhost:5173/login', '_blank');
        } else {
            // Đảm bảo clear session cũ trước khi mở trang đăng nhập
            await clearInvalidWebToken();
            window.open('http://localhost:5173/login', '_blank');
        }
    });

    if (dropdownSyncBtn) {
        dropdownSyncBtn.addEventListener('click', () => {
            avatarDropdown.style.display = 'none';
            syncBtn.click();
        });
    }

    // ==========================================
    // 3. RENDER DỮ LIỆU TỪ CHROME.STORAGE.LOCAL
    // ==========================================
    function renderLocalData() {
        chrome.storage.local.get(['voca_folders', 'voca_studysets'], (result) => {
            const folders = result.voca_folders || getInitDefaultFolders();
            const studysets = result.voca_studysets || getInitDefaultSets();

            // 1. Render Folders Grid
            foldersGrid.innerHTML = '';
            if (folders.length === 0) {
                foldersGrid.innerHTML = '<div class="empty-text">Chưa có thư mục nào</div>';
            } else {
                folders.forEach(f => {
                    const card = document.createElement('div');
                    card.className = 'folder-item-card';
                    card.innerHTML = `
                        <div class="folder-icon-box">${f.icon || '📁'}</div>
                        <div class="folder-info">
                            <div class="folder-name">${escapeHtml(f.name)} ${f.synced ? '<span class="sync-tag synced">Synced</span>' : '<span class="sync-tag local">Local</span>'}</div>
                            <div class="folder-meta">${escapeHtml(f.description || 'Không có mô tả')}</div>
                        </div>
                    `;
                    foldersGrid.appendChild(card);
                });
            }

            // 2. Render StudySets List
            studysetsList.innerHTML = '';
            if (studysets.length === 0) {
                studysetsList.innerHTML = '<div class="empty-text">Chưa có bộ từ vựng nào</div>';
            } else {
                studysets.forEach(s => {
                    const count = s.vocabularies ? s.vocabularies.length : 0;
                    const card = document.createElement('div');
                    card.className = 'set-item-card';
                    card.innerHTML = `
                        <div class="set-icon-box">📚</div>
                        <div class="set-info">
                            <div class="set-title">${escapeHtml(s.titleName)} ${s.synced ? '<span class="sync-tag synced">Synced</span>' : '<span class="sync-tag local">Local</span>'}</div>
                            <div class="set-meta">${count} thuật ngữ • Thư mục: ${escapeHtml(s.folderSlug || 'Chưa phân loại')}</div>
                        </div>
                    `;

                    // Click bộ từ vựng -> Mở màn hình xem danh sách từ vựng chi tiết
                    card.addEventListener('click', () => {
                        showSetDetailView(s);
                    });

                    studysetsList.appendChild(card);
                });
            }

            // 3. Update Dropdown Select Folder khi tạo set
            selectSetFolder.innerHTML = '';
            folders.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.slug;
                opt.textContent = f.name;
                selectSetFolder.appendChild(opt);
            });
        });
    }

    function getInitDefaultFolders() {
        return [
            { id: 1, name: 'Tiếng Anh', description: 'Từ vựng tiếng Anh', slug: 'tieng-anh', icon: '🔤', synced: true },
            { id: 2, name: 'Khoa học tự nhiên', description: 'Vật lý, Hóa học', slug: 'khoa-hoc-tu-nhien', icon: '🔬', synced: true }
        ];
    }

    function getInitDefaultSets() {
        return [
            { id: 1, titleName: 'Tiếng Anh Du Lịch', folderSlug: 'tieng-anh', vocabularies: [], synced: true },
            { id: 2, titleName: 'Tiếng Anh IT', folderSlug: 'tieng-anh', vocabularies: [], synced: true }
        ];
    }

    // ==========================================
    // 4. FORM TẠO MỚI CỤC BỘ & ĐỒNG BỘ NẾU ĐÃ LOGIN
    // ==========================================
    addFolderBtn.addEventListener('click', () => {
        formCreateFolder.style.display = 'block';
    });
    btnCancelFolder.addEventListener('click', () => {
        formCreateFolder.style.display = 'none';
    });

    btnSaveFolder.addEventListener('click', async () => {
        const name = inputFolderName.value.trim();
        if (!name) return;
        const desc = inputFolderDesc.value.trim();
        const slug = toSlug(name);

        const newFolder = {
            id: Date.now(),
            name: name,
            description: desc,
            slug: slug,
            icon: '📁',
            synced: false
        };

        // Nếu đã đăng nhập -> Gọi API gửi lên Server luôn
        if (isLoggedIn) {
            try {
                const res = await fetch(`${API_BASE}/api/folders`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description: desc, icon: '📁' })
                });
                if (res.ok) {
                    newFolder.synced = true;
                    showBanner('Đã tạo thư mục và đồng bộ lên Web thành công!', 'success');
                }
            } catch (e) {
                console.warn('Lỗi khi lưu lên server:', e);
            }
        }

        // Lưu vào Local Storage
        chrome.storage.local.get(['voca_folders'], (result) => {
            const folders = result.voca_folders || getInitDefaultFolders();
            folders.unshift(newFolder);
            chrome.storage.local.set({ voca_folders: folders }, () => {
                inputFolderName.value = '';
                inputFolderDesc.value = '';
                formCreateFolder.style.display = 'none';
                renderLocalData();
            });
        });
    });

    addSetBtn.addEventListener('click', () => {
        formCreateSet.style.display = 'block';
    });
    btnCancelSet.addEventListener('click', () => {
        formCreateSet.style.display = 'none';
    });

    btnSaveSet.addEventListener('click', async () => {
        const titleName = inputSetName.value.trim();
        if (!titleName) return;
        const folderSlug = selectSetFolder.value || 'tieng-anh';
        const slug = toSlug(titleName);

        const newSet = {
            id: Date.now(),
            titleName: titleName,
            slug: slug,
            folderSlug: folderSlug,
            vocabularies: [],
            synced: false
        };

        // Nếu đã đăng nhập -> Gọi API gửi lên Server
        if (isLoggedIn) {
            try {
                const res = await fetch(`${API_BASE}/api/studyset`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titleName, folderSlug, vocabularies: [] })
                });
                if (res.ok) {
                    newSet.synced = true;
                    showBanner('Đã tạo bộ từ vựng và đồng bộ lên Web thành công!', 'success');
                }
            } catch (e) {
                console.warn('Lỗi khi lưu set lên server:', e);
            }
        }

        chrome.storage.local.get(['voca_studysets'], (result) => {
            const sets = result.voca_studysets || getInitDefaultSets();
            sets.unshift(newSet);
            chrome.storage.local.set({ voca_studysets: sets }, () => {
                inputSetName.value = '';
                formCreateSet.style.display = 'none';
                renderLocalData();
            });
        });
    });

    btnCreateModal.addEventListener('click', () => {
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        if (activeTab === 'folders') {
            formCreateFolder.style.display = 'block';
        } else {
            formCreateSet.style.display = 'block';
        }
    });

    // ==========================================
    // 5. ĐỒNG BỘ CHUẨN TỪ LOCALSTORAGE ➔ API WEB SERVER
    // ==========================================
    let isSyncingData = false;

    syncBtn.addEventListener('click', async () => {
        if (isSyncingData) return;
        isSyncingData = true;

        const syncIcon = syncBtn.querySelector('.sync-icon');
        syncIcon.style.display = 'inline-block';
        syncIcon.style.animation = 'spin 0.8s ease infinite';

        try {
            isLoggedIn = await checkAuthStatus();
            if (!isLoggedIn) {
                showBanner('Vui lòng đăng nhập để đồng bộ lên Web Server!', 'info');
                return;
            }

            await autoSyncLocalToApi();
            showBanner('Đồng bộ 2 chiều dữ liệu với Web thành công!', 'success');
            renderLocalData();
        } finally {
            syncIcon.style.animation = '';
            isSyncingData = false;
        }
    });

    async function autoSyncLocalToApi() {
        const token = await getWebAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return new Promise((resolve) => {
            chrome.storage.local.get(['voca_folders', 'voca_studysets'], async (result) => {
                const folders = result.voca_folders || getInitDefaultFolders();
                const studysets = result.voca_studysets || getInitDefaultSets();

                // 1. Đẩy Folders chưa sync lên Server API
                for (let f of folders) {
                    if (!f.synced) {
                        try {
                            const res = await fetch(`${API_BASE}/api/folders`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: headers,
                                body: JSON.stringify({ name: f.name, description: f.description, icon: f.icon || '📁' })
                            });
                            if (res.ok) f.synced = true;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

                // 2. Đẩy StudySets chưa sync lên Server API
                for (let s of studysets) {
                    if (!s.synced) {
                        try {
                            const res = await fetch(`${API_BASE}/api/studyset`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: headers,
                                body: JSON.stringify({ titleName: s.titleName, folderSlug: s.folderSlug, vocabularies: s.vocabularies || [] })
                            });
                            if (res.ok) s.synced = true;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

                // Lưu lại mảng folders & studysets đã đổi synced thành true
                chrome.storage.local.set({ voca_folders: folders, voca_studysets: studysets }, () => {
                    resolve(true);
                });
            });
        });
    }

    // ==========================================
    // 6. XEM CHI TIẾT DANH SÁCH TỪ VỰNG TRONG BỘ THẺ
    // ==========================================
    const setDetailView = document.getElementById('set-detail-view');
    const detailSetTitle = document.getElementById('detail-set-title');
    const detailSetMeta = document.getElementById('detail-set-meta');
    const detailVocabList = document.getElementById('detail-vocab-list');
    const btnBackToSets = document.getElementById('btn-back-to-sets');

    function showSetDetailView(set) {
        detailSetTitle.textContent = set.titleName || set.title;
        const vocabs = set.vocabularies || [];
        detailSetMeta.textContent = `${vocabs.length} thuật ngữ • Thư mục: ${set.folderSlug || 'Cục bộ'}`;

        detailVocabList.innerHTML = '';
        if (vocabs.length === 0) {
            detailVocabList.innerHTML = '<div class="empty-text">Bộ từ vựng này chưa có từ nào. Hãy bôi đen từ vựng trên trang web để lưu vào đây!</div>';
        } else {
            vocabs.forEach((v, index) => {
                const card = document.createElement('div');
                card.className = 'vocab-card';
                card.innerHTML = `
                    <div class="vocab-term">${index + 1}. ${escapeHtml(v.term)}</div>
                    <div class="vocab-def">${escapeHtml(v.definition || 'Chưa có định nghĩa')}</div>
                    ${v.example ? `<div class="vocab-ex">Ví dụ: ${escapeHtml(v.example)}</div>` : ''}
                `;
                detailVocabList.appendChild(card);
            });
        }

        // Ẩn tab content và tab nav, hiện detail view
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.querySelector('.tabs-nav').style.display = 'none';
        setDetailView.style.display = 'block';
    }

    btnBackToSets?.addEventListener('click', () => {
        setDetailView.style.display = 'none';
        document.querySelector('.tabs-nav').style.display = 'flex';

        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        document.getElementById(`tab-${activeTab}`).style.display = 'block';
    });

    function showBanner(text, type = 'info') {
        statusBannerText.textContent = text;
        statusBanner.className = `status-banner ${type}`;
        statusBanner.style.display = 'block';
        setTimeout(() => {
            statusBanner.style.display = 'none';
        }, 4000);
    }

    function toSlug(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Run
    initData();
});