// background.js

// ==========================================
// 1. CÁC HÀM GỌI API DỊCH
// ==========================================

async function fetchGoogleTranslate(queryText, src, target) {
    const langPairSrc = src === 'auto' ? 'vi' : src;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${langPairSrc}&tl=${target}&dt=t&q=${encodeURIComponent(queryText)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0] && data[0][0]) {
            return data[0].map(item => item[0]).join('');
        }
        return "Không có kết quả";
    } catch (error) {
        console.error('Lỗi khi gọi Google Translate:', error);
        return null;
    }
}

async function fetchMyMemoryTranslate(queryText, src, target) {
    const langPairSrc = src === 'auto' ? 'vi' : src;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=${langPairSrc}|${target}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        return "Không có kết quả";
    } catch (error) {
        console.error('Lỗi khi gọi MyMemory Translate:', error);
        return null;
    }
}

async function fetchPapagoTranslate(queryText, src, target) {
    const papagoSrc = src === 'auto' ? 'vi' : src;
    const url = `https://papago.naver.com/api/text/translation`;
    const body = new URLSearchParams({
        source: papagoSrc,
        target: target,
        text: queryText
    });
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: body.toString()
        });
        const data = await res.json();
        if (data && data.translatedText) {
            return data.translatedText;
        }
        return "Không có kết quả";
    } catch (error) {
        console.error('Lỗi khi gọi Papago Translate:', error);
        return null;
    }
}

// ==========================================
// 2. LẮNG NGHE LỆNH DỊCH TỪ CONTENT.JS
// ==========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "translate" && request.text && sender.tab) {
        const tabId = sender.tab.id;
        const text = request.text.trim();
        const src = request.src || 'auto';
        const target = request.target || 'vi';

        console.log("📥 Background nhận lệnh dịch:", text, "| src:", src, "| target:", target);

        // Gọi 3 API song song
        Promise.allSettled([
            fetchGoogleTranslate(text, src, target),
            fetchMyMemoryTranslate(text, src, target),
            fetchPapagoTranslate(text, src, target)
        ]).then(([googleResult, myMemoryResult, papagoResult]) => {
            const response = {
                type: "translation-result",
                original: text,
                google: googleResult.status === 'fulfilled' ? googleResult.value : null,
                myMemory: myMemoryResult.status === 'fulfilled' ? myMemoryResult.value : null,
                papago: papagoResult.status === 'fulfilled' ? papagoResult.value : null
            };

            console.log("📤 Background gửi kết quả dịch:", response);

            chrome.tabs.sendMessage(tabId, response)
                .catch(err => console.log("❌ Không thể gửi kết quả dịch:", err));
        });
    }
});

// ==========================================
// 3. CẤU HÌNH SIDE PANEL
// ==========================================

// Thiết lập hành vi: Mở side panel khi click vào icon extension
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Lỗi cấu hình Side Panel:", error));

// Lắng nghe sự kiện cài đặt hoặc cập nhật extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Side Panel đã được cài đặt sẵn sàng!");
    syncAuthProfileFromWeb();
});

// Lắng nghe khi tab Web localhost được cập nhật (ví dụ: người dùng vừa bấm đăng nhập trên web)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('localhost')) {
        syncAuthProfileFromWeb();
    }
});

// Hàm đồng bộ thông tin Auth từ Web vào chrome.storage.local
async function syncAuthProfileFromWeb() {
    try {
        const API_BASE = 'http://localhost:8080';
        let token = null;

        // Check Cookies
        if (chrome.cookies) {
            const c5173 = await chrome.cookies.get({ url: 'http://localhost:5173', name: 'auth_token' });
            const c8080 = await chrome.cookies.get({ url: 'http://localhost:8080', name: 'auth_token' });
            const cToken = await chrome.cookies.get({ url: 'http://localhost:5173', name: 'token' });
            token = c5173?.value || c8080?.value || cToken?.value || null;
        }

        // Check Tab Web
        if (!token) {
            const tabs = await chrome.tabs.query({ url: '*://localhost/*' });
            if (tabs && tabs.length > 0) {
                for (let tab of tabs) {
                    if (tab.id) {
                        try {
                            const results = await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: () => {
                                    if (window.location.pathname === '/login') return '__LOGOUT__';
                                    return localStorage.getItem('token') || localStorage.getItem('auth_token');
                                }
                            });
                            if (results && results[0] && results[0].result) {
                                const resVal = results[0].result;
                                if (resVal === '__LOGOUT__') {
                                    token = null;
                                    break;
                                }
                                token = resVal;
                                break;
                            }
                        } catch (err) {}
                    }
                }
            }
        }

        if (!token) {
            clearAllAuthCookies();
            chrome.storage.local.set({
                auth_is_logged_in: false,
                auth_user_profile: null
            }, () => {
                chrome.runtime.sendMessage({ action: "auth_status_changed" }).catch(() => {});
            });
            return;
        }

        const headers = { 'Accept': 'application/json' };
        headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: headers
        });

        if (res.ok) {
            const data = await res.json();
            if (data && data.result) {
                const u = data.result;
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Thành viên VocaLearn';
                const profile = {
                    id: u.id,
                    name: fullName,
                    email: u.email || 'Đã đăng nhập'
                };
                chrome.storage.local.set({
                    auth_is_logged_in: true,
                    auth_user_profile: profile
                }, () => {
                    chrome.runtime.sendMessage({ action: "auth_status_changed" }).catch(() => {});
                });
                return;
            }
        }

        // Chưa đăng nhập hoặc token lỗi -> clear cookies
        clearAllAuthCookies();
        chrome.storage.local.set({
            auth_is_logged_in: false,
            auth_user_profile: null
        }, () => {
            chrome.runtime.sendMessage({ action: "auth_status_changed" }).catch(() => {});
        });
    } catch (e) {
        console.warn("Background sync auth status error:", e);
    }
}

function clearAllAuthCookies() {
    if (chrome.cookies) {
        chrome.cookies.remove({ url: 'http://localhost:5173', name: 'auth_token' }).catch(() => {});
        chrome.cookies.remove({ url: 'http://localhost:8080', name: 'auth_token' }).catch(() => {});
        chrome.cookies.remove({ url: 'http://localhost:5173', name: 'JSESSIONID' }).catch(() => {});
        chrome.cookies.remove({ url: 'http://localhost:8080', name: 'JSESSIONID' }).catch(() => {});
        chrome.cookies.remove({ url: 'http://localhost:5173', name: 'token' }).catch(() => {});
    }
}

// ==========================================
// 4. KHỞI TẠO DỮ LIỆU MẶC ĐỊNH
// ==========================================

// Khởi tạo dữ liệu mặc định nếu bộ nhớ của Extension đang trống
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["myStudysets"], (result) => {
        if (!result.myStudysets) {
            const defaultDatabase = {
                pinned: [
                    {
                        "id": "set_001",
                        "slug": "du-lich",
                        "title": "Du lịch",
                        "icon": "✈️",
                        "badge": "30 từ vựng",
                        "words": [
                            { "vocab": "Airplane", "ipa": "/ˈeə.pleɪn/", "mean": "Máy bay", "ex": "I go by airplane." },
                            { "vocab": "Passport", "ipa": "/ˈpɑːs.pɔːt/", "mean": "Hộ chiếu", "ex": "Check your passport." },
                            { "vocab": "Luggage", "ipa": "/ˈlʌɡ.ɪdʒ/", "mean": "Hành lý", "ex": "Pack your luggage." }
                        ]
                    },
                    {
                        "id": "set_002",
                        "slug": "nha-hang",
                        "title": "Nhà Hàng",
                        "icon": "🍴",
                        "badge": "15 từ vựng",
                        "words": [
                            { "vocab": "Menu", "ipa": "/ˈmen.juː/", "mean": "Thực đơn", "ex": "Read the menu." },
                            { "vocab": "Bill", "ipa": "/bɪl/", "mean": "Hóa đơn", "ex": "Pay the bill." }
                        ]
                    },
                    {
                        "id": "set_003",
                        "slug": "hoc-tap",
                        "title": "Học tập",
                        "icon": "📖",
                        "badge": "20 từ vựng",
                        "words": [
                            { "vocab": "Study", "ipa": "/ˈstʌd.i/", "mean": "Học", "ex": "I study every day." },
                            { "vocab": "Exam", "ipa": "/ɪɡˈzæm/", "mean": "Bài thi", "ex": "The exam is tomorrow." }
                        ]
                    },
                    {
                        "id": "set_004",
                        "slug": "khach-san",
                        "title": "Khách sạn",
                        "icon": "🏨",
                        "badge": "25 từ vựng",
                        "words": [
                            { "vocab": "Reception", "ipa": "/rɪˈsep.ʃən/", "mean": "Lễ tân", "ex": "Go to the reception." },
                            { "vocab": "Room", "ipa": "/ruːm/", "mean": "Phòng", "ex": "Book a room." }
                        ]
                    }
                ],
                recent: [
                    {
                        "id": "set_005",
                        "title": "Ngữ pháp A1 tiếng Anh",
                        "badge": "2 từ",
                        "time": ""
                    },
                    {
                        "id": "set_006",
                        "title": "Physics Terms - Exam 1",
                        "badge": "52 terms",
                        "time": "2h ago"
                    },
                    {
                        "id": "set_007",
                        "title": "Spanish Verb Conjugations",
                        "badge": "75 terms",
                        "time": "Yesterday"
                    },
                    {
                        "id": "set_008",
                        "title": "ABC",
                        "badge": "1 từ",
                        "time": ""
                    }
                ]
            };
            chrome.storage.local.set({ myStudysets: defaultDatabase });
        }
    });
});