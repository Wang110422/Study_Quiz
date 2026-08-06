let resultPopup = null;
let currentSelectedText = '';
let currentTranslation = ''; // Lưu bản dịch được chọn
let isLocked = false; // Trạng thái khóa/ghim tooltip
console.log("✅ Content script đã được tải và sẵn sàng!");

// ==========================================
// 1. SỰ KIỆN: Bôi đen chữ → Hiện tooltip
// ==========================================
document.addEventListener("mouseup", (e) => {
    if (resultPopup && resultPopup.contains(e.target)) return;

    setTimeout(async () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            currentSelectedText = selectedText;
            console.log("📝 Đã bôi đen:", selectedText);

            await showResultPopup(selection, selectedText);

            console.log("📤 Gửi lệnh dịch đến background...");
            chrome.runtime.sendMessage({
                action: "translate",
                text: selectedText,
                src: "auto",
                target: "en"
            });
        }
    }, 10);
});

// ==========================================
// 2. SỰ KIỆN: Click ra ngoài để ẩn tooltip
// ==========================================
document.addEventListener("mousedown", (e) => {
    if (resultPopup && !resultPopup.contains(e.target)) {
        if (isLocked) return; // Nếu đang KHÓA/GHIM -> KHÔNG ẩn tooltip
        removeResultPopup();
        currentSelectedText = '';
    }
});

// ==========================================
// 3. LẮNG NGHE KẾT QUẢ DỊCH TỪ BACKGROUND
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📥 Nhận message:", request.type);

    if (request.type === "translation-result") {
        if (!resultPopup) {
            console.warn("⚠️ Popup không tồn tại khi nhận kết quả dịch");
            return;
        }
        console.log("✅ Cập nhật kết quả dịch:", request);
        updateTranslationCard("res-google", request.google);
        updateTranslationCard("res-mymemory", request.myMemory);
        updateTranslationCard("res-papago", request.papago);
    }

    if (request.type === "translation-error") {
        if (!resultPopup) return;
        const errorMsg = "Lỗi khi dịch";
        updateTranslationCard("res-google", null, errorMsg);
        updateTranslationCard("res-mymemory", null, errorMsg);
        updateTranslationCard("res-papago", null, errorMsg);
    }
});

// ==========================================
// 4. HÀM: Cập nhật nội dung ô dịch
// ==========================================
function updateTranslationCard(elementId, result, errorMsg) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.remove("loading");

    if (result) {
        el.classList.remove("error");
        el.innerText = result;
    } else {
        el.classList.add("error");
        el.innerText = errorMsg || "Không khả dụng";
    }
}

// ==========================================
// 5. HÀM: Chuyển đổi giữa các screen
// ==========================================
function switchScreen(targetScreenId, direction) {
    const screens = resultPopup.querySelectorAll('.tooltip-screen');
    screens.forEach(s => {
        s.classList.remove('active', 'slide-right', 'slide-left');
    });

    const target = document.getElementById(targetScreenId);
    if (target) {
        target.classList.add('active');
        if (direction === 'right') target.classList.add('slide-right');
        if (direction === 'left') target.classList.add('slide-left');
    }
}

// ==========================================
// 6. HÀM: Mở Screen Preview (XEM TRƯỚC & SỬA)
// ==========================================
function openPreviewScreen(term, definition) {
    const termInput = document.getElementById('preview-term');
    const defInput = document.getElementById('preview-definition');

    if (termInput) termInput.value = term || '';
    if (defInput) defInput.value = definition || '';

    // Clear các trường khác
    const ipaInput = document.getElementById('preview-ipa');
    const typeInput = document.getElementById('preview-type');
    const exInput = document.getElementById('preview-example');
    const synInput = document.getElementById('preview-synonym');
    if (ipaInput) ipaInput.value = '';
    if (typeInput) typeInput.value = '';
    if (exInput) exInput.value = '';
    if (synInput) synInput.value = '';

    currentTranslation = definition || '';
    switchScreen('screen-preview', 'right');
}

// ==========================================
// 7. HÀM: Mở Screen Chọn Thư Mục & Bộ Từ
// ==========================================
function openChooseSetScreen() {
    chrome.storage.local.get(["voca_folders", "voca_studysets"], (result) => {
        const folders = result.voca_folders || [
            { id: 1, name: 'Tiếng Anh', slug: 'tieng-anh', icon: '🔤' },
            { id: 2, name: 'Khoa học tự nhiên', slug: 'khoa-hoc-tu-nhien', icon: '🔬' }
        ];
        const sets = result.voca_studysets || [
            { id: 1, titleName: 'Tiếng Anh Du Lịch', folderSlug: 'tieng-anh', vocabularies: [] },
            { id: 2, titleName: 'Tiếng Anh IT', folderSlug: 'tieng-anh', vocabularies: [] }
        ];

        const folderSelectEl = document.getElementById('tooltip-folder-select');
        const newSetFolderEl = document.getElementById('new-set-folder-select');
        const recentTagsEl = document.getElementById('recent-set-tags');
        const allSetsEl = document.getElementById('all-sets-list');

        if (!recentTagsEl || !allSetsEl) return;

        // 1. Populate Folders Dropdown
        if (folderSelectEl) {
            folderSelectEl.innerHTML = '<option value="all">📁 Tất cả Thư mục (' + folders.length + ')</option>';
            folders.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.slug;
                opt.textContent = `${f.icon || '📁'} ${f.name}`;
                folderSelectEl.appendChild(opt);
            });
        }

        if (newSetFolderEl) {
            newSetFolderEl.innerHTML = '';
            folders.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.slug;
                opt.textContent = `Thư mục: ${f.name}`;
                newSetFolderEl.appendChild(opt);
            });
        }

        // 2. Render function theo folder filter
        const renderSetsList = (selectedFolderSlug = 'all') => {
            recentTagsEl.innerHTML = '';
            allSetsEl.innerHTML = '';

            const filteredSets = selectedFolderSlug === 'all' 
                ? sets 
                : sets.filter(s => s.folderSlug === selectedFolderSlug);

            if (filteredSets.length === 0) {
                allSetsEl.innerHTML = '<div style="color:#64748b;font-size:12px;padding:12px;text-align:center;">Không có bộ từ vựng nào trong thư mục này. Hãy tạo bộ mới bên dưới!</div>';
                return;
            }

            // Sắp xếp theo thời gian sử dụng/lưu mới nhất
            const sortedByRecent = [...filteredSets].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));

            // Render recent tags (3 bộ gần nhất được lưu)
            const recentSets = sortedByRecent.slice(0, 3);
            recentSets.forEach(set => {
                const tag = document.createElement('div');
                tag.className = 'set-tag';
                const count = set.vocabularies ? set.vocabularies.length : 0;
                tag.innerHTML = `
                    <div class="set-tag-title">${escapeHtml(set.titleName || set.title)}</div>
                    <div class="set-tag-meta">📚 ${count} thuật ngữ</div>
                `;
                tag.addEventListener('click', () => saveToSet(set));
                recentTagsEl.appendChild(tag);
            });

            // Render all sets list
            filteredSets.forEach(set => {
                const item = document.createElement('div');
                item.className = 'set-list-item';
                const count = set.vocabularies ? set.vocabularies.length : 0;
                item.innerHTML = `
                    <div class="set-list-title">${escapeHtml(set.titleName || set.title)}</div>
                    <div class="set-list-meta">${count} từ • Thư mục: ${escapeHtml(set.folderSlug || 'Chưa phân loại')}</div>
                `;
                item.addEventListener('click', () => saveToSet(set));
                allSetsEl.appendChild(item);
            });
        };

        // Render ban đầu (tất cả)
        renderSetsList('all');

        // Sự kiện khi người dùng đổi Thư Mục
        if (folderSelectEl) {
            folderSelectEl.onchange = (e) => {
                renderSetsList(e.target.value);
            };
        }
    });

    switchScreen('screen-chooseset', 'right');
}

// ==========================================
// 8. HÀM: Lưu từ vào bộ đã chọn
// ==========================================
function saveToSet(set) {
    const term = document.getElementById('preview-term')?.value || currentSelectedText;
    const definition = document.getElementById('preview-definition')?.value || currentTranslation;
    const example = document.getElementById('preview-example')?.value || '';

    const newVocabulary = { term, definition, example };

    chrome.storage.local.get(['voca_studysets'], (result) => {
        let sets = result.voca_studysets || [];
        let targetSet = sets.find(s => s.id === set.id || s.slug === set.slug);

        if (targetSet) {
            if (!targetSet.vocabularies) targetSet.vocabularies = [];
            targetSet.vocabularies.push(newVocabulary);
            targetSet.synced = false;
            targetSet.lastUsed = Date.now(); // Lưu thời điểm dùng gần nhất
        } else {
            set.vocabularies = [newVocabulary];
            set.synced = false;
            set.lastUsed = Date.now();
            sets.push(set);
        }

        chrome.storage.local.set({ voca_studysets: sets }, () => {
            console.log(`💾 Đã lưu từ "${term}" vào bộ "${set.titleName || set.title}" trong Local Storage!`);

            // Gửi API lên Web Server nếu có kết nối
            fetch('http://localhost:8080/api/studyset', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titleName: set.titleName || set.title,
                    folderSlug: set.folderSlug || 'tieng-anh',
                    vocabularies: [newVocabulary]
                })
            }).catch(e => console.log('Lưu API server chưa kích hoạt:', e));

            alert(`✅ Đã lưu từ "${term}" vào bộ "${set.titleName || set.title}" thành công!`);
            removeResultPopup();
            currentSelectedText = '';
        });
    });
}

// ==========================================
// 9. HÀM: Hiển thị Tooltip dịch
// ==========================================
async function showResultPopup(selection, text) {
    try {
        removeResultPopup();

        if (!selection || !selection.rangeCount) {
            console.warn("⚠️ Không có selection hoặc rangeCount = 0");
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Nhúng css
        if (!document.getElementById("tooltip-style")) {
            const cssLink = document.createElement("link");
            cssLink.id = "tooltip-style";
            cssLink.rel = "stylesheet";
            cssLink.href = chrome.runtime.getURL("tooltip/tooltip.css");
            document.head.appendChild(cssLink);
        }

        // Fetch HTML
        const tooltipHtmlUrl = chrome.runtime.getURL("tooltip/tooltip.html");
        const response = await fetch(tooltipHtmlUrl);
        if (!response.ok) {
            console.error("❌ Fetch tooltip HTML thất bại:", response.status);
            return;
        }
        const tooltipHtmlText = await response.text();

        // Tạo popup
        resultPopup = document.createElement("div");
        resultPopup.className = "my-custom-popup-box";
        resultPopup.innerHTML = tooltipHtmlText;
        document.body.appendChild(resultPopup);

        const tooltipTextEl = document.getElementById("tooltip-text");
        if (tooltipTextEl) tooltipTextEl.innerText = text;

        // Tính vị trí
        const popupWidth = 340;
        const popupHeight = resultPopup.offsetHeight || 370;

        let top = rect.top - popupHeight - 12;
        let left = rect.left + (rect.width / 2) - (popupWidth / 2);

        if (top < 10) top = rect.bottom + 12;
        if (left < 10) left = 10;
        if (left + popupWidth > window.innerWidth - 10) {
            left = window.innerWidth - popupWidth - 10;
        }

        resultPopup.style.top = `${top}px`;
        resultPopup.style.left = `${left}px`;

        console.log("✅ Tooltip đã hiển thị tại:", { top, left });

        // ------------------------------------------
        // GÁN SỰ KIỆN CHO CÁC ELEMENTS
        // ------------------------------------------

        // Nút X (đóng) - tất cả các screen
        resultPopup.querySelectorAll('.tooltip-close').forEach(btn => {
            btn.addEventListener('click', () => {
                removeResultPopup();
                currentSelectedText = '';
                window.getSelection().removeAllRanges();
            });
        });

        // Nút Ổ khóa (Ghim / Bỏ ghim)
        const lockBtn = document.getElementById('lock-btn');
        if (lockBtn) {
            lockBtn.innerText = isLocked ? '🔒' : '🔓';
            if (isLocked) {
                lockBtn.classList.add('locked');
                resultPopup.classList.add('is-locked');
            }

            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isLocked = !isLocked;
                lockBtn.innerText = isLocked ? '🔒' : '🔓';
                if (isLocked) {
                    lockBtn.classList.add('locked');
                    resultPopup.classList.add('is-locked');
                    lockBtn.title = "Đã ghim (Bấm để bỏ ghim)";
                } else {
                    lockBtn.classList.remove('locked');
                    resultPopup.classList.remove('is-locked');
                    lockBtn.title = "Ghim & Di chuyển";
                }
            });
        }

        // Kéo thả di chuyển Tooltip bằng chuột
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        const handleDragStart = (e) => {
            const interactiveTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'OPTION'];
            if (interactiveTags.includes(e.target.tagName) ||
                e.target.classList.contains('tooltip-close') ||
                e.target.classList.contains('custom-input') ||
                e.target.closest('.translation-card') ||
                e.target.closest('.set-tag') ||
                e.target.closest('.set-list-item')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = resultPopup.offsetLeft;
            initialTop = resultPopup.offsetTop;

            document.addEventListener('mousemove', handleDragging);
            document.addEventListener('mouseup', handleDragEnd);
        };

        const handleDragging = (e) => {
            if (!isDragging || !resultPopup) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const maxLeft = window.innerWidth - resultPopup.offsetWidth - 10;
            const maxTop = window.innerHeight - resultPopup.offsetHeight - 10;

            newLeft = Math.max(10, Math.min(newLeft, maxLeft));
            newTop = Math.max(10, Math.min(newTop, maxTop));

            resultPopup.style.left = `${newLeft}px`;
            resultPopup.style.top = `${newTop}px`;
        };

        const handleDragEnd = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDragging);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        resultPopup.addEventListener('mousedown', handleDragStart);

        // Helper lấy text dịch sạch từ ô card
        function getCardTranslation(card) {
            const contentEl = card.querySelector('.card-content');
            if (!contentEl || contentEl.classList.contains('loading') || contentEl.classList.contains('error')) {
                return '';
            }
            const txt = contentEl.innerText.trim();
            if (txt === 'Đang dịch...' || txt === 'Lỗi khi dịch' || txt === 'Không khả dụng' || txt === 'Chưa tích hợp API') {
                return '';
            }
            return txt;
        }

        // Click vào 3 ô dịch API (MyMemory, Google, Papago) → Mở Screen 2 (XEM TRƯỚC & SỬA) với kết quả dịch
        resultPopup.querySelectorAll('.translation-card[data-engine="mymemory"], .translation-card[data-engine="google"], .translation-card[data-engine="papago"]').forEach(card => {
            card.addEventListener('click', () => {
                const translation = getCardTranslation(card);
                openPreviewScreen(currentSelectedText, translation);
            });
        });

        // Click vào ô Custom → Mở Screen 2 (XEM TRƯỚC & SỬA) với nghĩa trống (hoặc text custom nếu đã nhập)
        const customCard = resultPopup.querySelector('.translation-card[data-engine="custom"]');
        if (customCard) {
            customCard.addEventListener('click', (e) => {
                // Nếu click trực tiếp vào ô custom-input để gõ chữ thì không chuyển màn hình ngay
                if (e.target.classList.contains('custom-input')) return;
                const customInput = customCard.querySelector('.custom-input');
                const customText = customInput ? customInput.innerText.trim() : '';
                openPreviewScreen(currentSelectedText, customText);
            });
        }

        // Nút Lưu kết quả → mở Preview screen với kết quả Google
        const saveBtn = document.getElementById('tooltip-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const googleResult = document.getElementById('res-google')?.innerText || '';
                openPreviewScreen(currentSelectedText, googleResult);
            });
        }

        // Nút "Quay lại" (Screen Preview → Screen Translate)
        const backBtn = document.getElementById('btn-back-translate');
        if (backBtn) {
            backBtn.addEventListener('click', () => switchScreen('screen-translate', 'left'));
        }

        // Nút "Chọn bộ từ" (Screen Preview → Screen Choose Set)
        const gotoChooseBtn = document.getElementById('btn-goto-chooseset');
        if (gotoChooseBtn) {
            gotoChooseBtn.addEventListener('click', () => openChooseSetScreen());
        }

        // Nút "Dịch lại"
        const retranslateBtn = document.getElementById("btn-retranslate");
        if (retranslateBtn) {
            retranslateBtn.addEventListener("click", () => {
                const srcLang = document.getElementById("lang-source")?.value || "auto";
                const targetLang = document.getElementById("lang-target")?.value || "vi";
                setLoadingState();
                chrome.runtime.sendMessage({
                    action: "translate",
                    text: currentSelectedText,
                    src: srcLang,
                    target: targetLang
                });
            });
        }

        // Nút "+ Tạo bộ mới" (Screen Choose Set)
        const createNewBtn = document.getElementById('btn-create-new-set');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                const form = document.getElementById('create-set-form');
                if (form) {
                    form.style.display = 'flex';
                    createNewBtn.style.display = 'none';
                }
            });
        }

        // Nút "Hủy" (form tạo mới)
        const cancelCreateBtn = document.getElementById('btn-cancel-create');
        if (cancelCreateBtn) {
            cancelCreateBtn.addEventListener('click', () => {
                const form = document.getElementById('create-set-form');
                const createBtn = document.getElementById('btn-create-new-set');
                if (form) form.style.display = 'none';
                if (createBtn) createBtn.style.display = 'block';
            });
        }

        // Nút "Tạo & Thêm"
        const confirmCreateBtn = document.getElementById('btn-confirm-create');
        if (confirmCreateBtn) {
            confirmCreateBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('new-set-name');
                const name = nameInput?.value.trim();
                if (!name) {
                    nameInput.style.borderColor = '#ff6b6b';
                    return;
                }

                const folderSelect = document.getElementById('new-set-folder-select');
                const folderSlug = folderSelect?.value || 'tieng-anh';

                const newSet = {
                    id: Date.now(),
                    titleName: name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    folderSlug: folderSlug,
                    vocabularies: [],
                    synced: false
                };

                saveToSet(newSet);
            });
        }

        // Tìm kiếm bộ từ
        const searchInput = document.getElementById('search-set-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                const items = document.querySelectorAll('.set-list-item');
                items.forEach(item => {
                    const title = item.querySelector('.set-list-title')?.innerText.toLowerCase() || '';
                    item.style.display = title.includes(query) ? '' : 'none';
                });
            });
        }

    } catch (error) {
        console.error("❌ Lỗi khi tạo tooltip:", error);
    }
}

// ==========================================
// 10. HÀM: Đặt trạng thái loading
// ==========================================
function setLoadingState() {
    const ids = ["res-google", "res-mymemory", "res-papago"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add("loading");
            el.classList.remove("error");
            el.innerText = "Đang dịch...";
        }
    });
}

// ==========================================
// 11. HÀM: Xoá tooltip
// ==========================================
function removeResultPopup() {
    if (resultPopup) {
        resultPopup.remove();
        resultPopup = null;
        isLocked = false; // Reset trạng thái ghim khi đóng
    }
}

// ==========================================
// 12. UTILS
// ==========================================
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}