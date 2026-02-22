// =============================================
// Rule Engine (New System)
// =============================================

// 全域快取規則，避免重複讀取 storage
let cachedDomainRules = [];
let rulesLoaded = false;

/**
 * 檢查網域是否匹配規則（支持萬用字元 *）
 * @param {string} currentDomain - 當前網域 (例如: www.google.com)
 * @param {string} rulePattern - 規則模式 (例如: *.google.*, www.google.*)
 * @returns {boolean} 是否匹配
 */
function matchDomain(currentDomain, rulePattern) {
    // 如果沒有萬用字元，使用簡單的 includes 匹配
    if (!rulePattern.includes('*')) {
        return currentDomain.includes(rulePattern);
    }

    // 將萬用字元模式轉換為正則表達式
    // 1. 轉義特殊字元（除了 *）
    const escapedPattern = rulePattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // 2. 將 * 轉換為 .*（匹配任意字元）
    const regexPattern = '^' + escapedPattern.replace(/\*/g, '.*') + '$';
    const regex = new RegExp(regexPattern);

    return regex.test(currentDomain);
}

async function loadDomainRules() {
    if (rulesLoaded) return cachedDomainRules;

    const result = await chrome.storage.sync.get(['domainRules']);
    cachedDomainRules = result.domainRules || [];
    rulesLoaded = true;
    console.log('[QuickLinker] Loaded domain rules:', cachedDomainRules);
    return cachedDomainRules;
}

/**
 * 根據網域提取內容（寫死邏輯，針對常見網站優化）
 * @param {string} domain - 當前網域
 * @returns {string|null} 提取的內容
 */
function extractCodeByDomain(domain) {
    console.log('[QuickLinker] Extracting code for domain:', domain);

    // JavDB - 影片番號提取
    if (domain.includes('javdb.com')) {
        // 方法1: 從URL提取 /v/ABC-123
        const urlMatch = location.pathname.match(/\/v\/([A-Z0-9]+-\d+)/i);
        if (urlMatch && urlMatch[1]) {
            console.log('[QuickLinker] JavDB URL match:', urlMatch[1]);
            return urlMatch[1];
        }

        // 方法2: 從標題提取
        const titleMatch = document.title.match(/([A-Z0-9]+-\d+)/i);
        if (titleMatch && titleMatch[1]) {
            console.log('[QuickLinker] JavDB title match:', titleMatch[1]);
            return titleMatch[1];
        }

        // 方法3: 從頁面元素提取
        const element = document.querySelector('.video-meta-panel .value');
        if (element) {
            const text = element.textContent.trim();
            console.log('[QuickLinker] JavDB element match:', text);
            return text;
        }
    }

    // JavLibrary - 影片番號提取
    if (domain.includes('javlibrary.com')) {
        const element = document.querySelector('#video_id .text');
        if (element) {
            const text = element.textContent.trim();
            console.log('[QuickLinker] JavLibrary match:', text);
            return text;
        }
    }

    // GitHub - Issue 編號提取
    if (domain.includes('github.com')) {
        const urlMatch = location.pathname.match(/\/issues\/(\d+)/);
        if (urlMatch && urlMatch[1]) {
            console.log('[QuickLinker] GitHub issue match:', urlMatch[1]);
            return urlMatch[1];
        }
    }

    // Amazon - 產品 ASIN 提取
    if (domain.includes('amazon.')) {
        const urlMatch = location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
        if (urlMatch && urlMatch[1]) {
            console.log('[QuickLinker] Amazon ASIN match:', urlMatch[1]);
            return urlMatch[1];
        }
    }

    // FC2PPVDB - FC2 編號提取
    if (domain.includes('fc2ppvdb.com')) {
        const element = document.querySelector('span.text-white.ml-2');
        if (element) {
            const text = element.textContent.trim();
            console.log('[QuickLinker] FC2PPVDB match:', text);
            return text;
        }
    }

    // 其他網站：使用通用邏輯
    console.log('[QuickLinker] No specific extractor, trying generic methods');
    return null;
}

async function extractCodeByRules() {
    const domainRules = await loadDomainRules();
    const currentDomain = location.hostname;

    console.log('[QuickLinker] Current domain:', currentDomain);

    // 找到匹配當前網域的規則（支持萬用字元）
    const matchedRule = domainRules.find(rule =>
        rule.enabled && matchDomain(currentDomain, rule.domain)
    );

    if (!matchedRule) {
        console.log('[QuickLinker] No matching rule found');
        return null;
    }

    console.log('[QuickLinker] Matched rule:', matchedRule);

    // 使用寫死的提取邏輯
    const extractedCode = extractCodeByDomain(currentDomain);

    if (extractedCode) {
        return {
            code: extractedCode,
            sites: matchedRule.sites
        };
    }

    // 如果專門的提取邏輯失敗，使用 legacy fallback
    console.log('[QuickLinker] Domain-specific extraction failed, using fallback');
    return {
        code: null,  // 將由 getCodeLegacy() 處理
        sites: matchedRule.sites
    };
}

// =============================================
// Legacy Code Extraction (Fallback)
// =============================================

function getCodeLegacy() {
    const clipboardElement = document.querySelector('.copy-to-clipboard');
    if (clipboardElement) {
        return clipboardElement.getAttribute('data-clipboard-text');
    }

    // Attempt to detect code from URL or title for specific sites like JavDB
    if (window.location.hostname.includes('javdb.com')) {
        const urlMatch = window.location.pathname.match(/\/v\/([a-zA-Z0-9-]+)/);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }
        const titleMatch = document.title.match(/([a-zA-Z0-9-]+)/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1];
        }
    }
    return null;
}

// 統一入口函數（新系統）
async function getCode() {
    const currentDomain = location.hostname;

    // 【寫死邏輯】：JavDB、JavLibrary、FC2PPVDB 自動啟用，不需要規則配置
    const hardcodedDomains = ['javdb.com', 'javlibrary.com', 'fc2ppvdb.com'];
    const isHardcodedDomain = hardcodedDomains.some(domain => currentDomain.includes(domain));

    if (isHardcodedDomain) {
        console.log('[QuickLinker] Hardcoded domain detected:', currentDomain);
        const extractedCode = extractCodeByDomain(currentDomain);
        if (extractedCode) {
            console.log('[QuickLinker] Hardcoded extraction successful:', extractedCode);
            return { code: extractedCode, sites: null }; // sites: null = 搜尋所有網站
        }
        // hardcoded 網站提取失敗時，直接結束（不 fallback 到 legacy，避免抓到頁面上無關元素）
        console.log('[QuickLinker] Hardcoded extraction failed, skipping fallback');
        return null;
    }

    // 優先使用規則提取（其他網站）
    const ruleResult = await extractCodeByRules();
    if (ruleResult) {
        // 如果規則匹配但 code 為 null（auto 模式），使用 legacy fallback
        if (ruleResult.code === null) {
            const legacyCode = getCodeLegacy();
            if (legacyCode) {
                console.log('[QuickLinker] Using auto mode with legacy extraction:', legacyCode);
                return { code: legacyCode, sites: ruleResult.sites };
            }
            // 如果 legacy 也失敗，返回 null 但保留 sites 信息
            return null;
        }

        console.log('[QuickLinker] Using rule-based extraction');
        return ruleResult;
    }

    // 備用：使用舊邏輯（無規則匹配時）
    const legacyCode = getCodeLegacy();
    if (legacyCode) {
        console.log('[QuickLinker] Using legacy extraction:', legacyCode);
        return { code: legacyCode, sites: null };
    }

    return null;
}

function extractCodeFromText(text) {
    // Regex for XXX-YYY or XXXX-YYY patterns
    const regex = /[a-zA-Z]{2,4}[- ]?\d{2,5}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        // Return the first found code, clean up potential spaces/hyphens
        return matches[0].replace(/[- ]/, '-').toUpperCase();
    }
    return null;
}

// =============================================
// Debounced MutationObserver + URL Change Detection
// =============================================

let _observerDebounceTimer = null;
let _lastCheckedUrl = location.href;
let _codeFound = false;

const observer = new MutationObserver(() => {
    if (_codeFound) return; // 已偵測到番號，不再觸發

    clearTimeout(_observerDebounceTimer);
    _observerDebounceTimer = setTimeout(async () => {
        const extractResult = await getCode();
        const container = document.querySelector('.ql-floating-container');
        if (extractResult && !container) {
            _codeFound = true;
            observer.disconnect(); // 偵測到後停止監聽 DOM，節省資源
            console.log('[QuickLinker] Code found via observer, disconnecting');
            createFloatingButton(extractResult);
        } else if (!extractResult && container) {
            container.remove();
        }
    }, 300); // 300ms debounce
});

observer.observe(document.body, { childList: true, subtree: true });

// 監聽 URL 變化（處理 SPA 頁面切換或 history pushState）
setInterval(() => {
    if (location.href !== _lastCheckedUrl) {
        console.log('[QuickLinker] URL changed:', _lastCheckedUrl, '->', location.href);
        _lastCheckedUrl = location.href;
        _codeFound = false;

        // 移除舊容器
        const container = document.querySelector('.ql-floating-container');
        if (container) container.remove();

        // 清除規則快取
        rulesLoaded = false;
        cachedDomainRules = [];

        // 重新啟動 observer
        observer.observe(document.body, { childList: true, subtree: true });

        // 立即嘗試提取
        (async () => {
            const extractResult = await getCode();
            if (extractResult) {
                _codeFound = true;
                observer.disconnect();
                createFloatingButton(extractResult);
            }
        })();
    }
}, 1000);

// =============================================
// Floating Button Creation & Smart Scan
// =============================================

// =============================================
// Floating Button Creation & Smart Scan
// =============================================

async function updateFloatingButtons(code, limitedSites = null) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer) return;

    // Clear existing buttons
    subButtonsContainer.innerHTML = '';

    console.log('[QuickLinker] Checking URLs for code:', code, 'limitedSites:', limitedSites);

    // Trigger Smart Scan with code and optional limitedSites
    const response = await chrome.runtime.sendMessage({
        action: 'checkUrls',
        code: code,
        limitedSites: limitedSites  // 新增參數
    });
    updateButtonStates(response.results);
}

async function createFloatingButton(extractResult) {
    // 支援兩種輸入格式：
    // 1. 舊格式: createFloatingButton('ABC-123')
    // 2. 新格式: createFloatingButton({ code: 'ABC-123', sites: [...] })

    let code, limitedSites;

    if (typeof extractResult === 'string') {
        // 舊格式（向下相容）
        code = extractResult;
        limitedSites = null;
        console.log('[QuickLinker] Using legacy format');
    } else if (extractResult && extractResult.code) {
        // 新格式
        code = extractResult.code;
        limitedSites = extractResult.sites;
        console.log('[QuickLinker] Using new format with limitedSites:', limitedSites);
    } else {
        console.error('[QuickLinker] Invalid extractResult format:', extractResult);
        return;
    }

    let container = document.querySelector('.ql-floating-container');
    if (container) {
        // If container already exists, just update its buttons
        await updateFloatingButtons(code, limitedSites);
        return;
    }

    // --- Create UI Elements (only if container doesn't exist) ---
    container = document.createElement('div');
    container.className = 'ql-floating-container';

    const mainButton = document.createElement('div');
    mainButton.className = 'ql-floating-button ql-main-button';
    mainButton.innerHTML = '+';

    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.className = 'ql-sub-buttons';

    // --- Append to DOM & Add Events ---
    container.appendChild(subButtonsContainer); // Append empty sub-buttons container initially
    container.appendChild(mainButton);
    document.body.appendChild(container);

    // --- O4: 從 localStorage 還原按鈕位置 ---
    const savedPos = localStorage.getItem('ql_button_pos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            // O3: clamp 到視窗範圍內，避免位置超出邊界
            const maxX = window.innerWidth - container.offsetWidth;
            const maxY = window.innerHeight - container.offsetHeight;
            const safeLeft = Math.max(0, Math.min(pos.left, maxX));
            const safeTop = Math.max(0, Math.min(pos.top, maxY));
            container.style.right = 'auto';
            container.style.bottom = 'auto';
            container.style.left = safeLeft + 'px';
            container.style.top = safeTop + 'px';
            console.log('[QuickLinker] Restored button position:', safeLeft, safeTop);
        } catch (e) {
            console.error('[QuickLinker] Failed to restore button position:', e);
        }
    }

    let isExpanded = false;
    mainButton.addEventListener('click', () => {
        isExpanded = !isExpanded;

        if (isExpanded) {
            // 計算主按鈕距離視窗上下的可用空間
            const containerRect = container.getBoundingClientRect();
            const spaceAbove = containerRect.top;
            const spaceBelow = window.innerHeight - containerRect.bottom;

            subButtonsContainer.style.display = 'flex';

            if (spaceAbove >= spaceBelow) {
                // 上方空間較多 → 往上展開
                subButtonsContainer.style.bottom = 'calc(100% + 10px)';
                subButtonsContainer.style.top = 'auto';
                subButtonsContainer.style.flexDirection = 'column-reverse'; // 第一個按鈕最靠近主按鈕
            } else {
                // 下方空間較多 → 往下展開
                subButtonsContainer.style.top = 'calc(100% + 10px)';
                subButtonsContainer.style.bottom = 'auto';
                subButtonsContainer.style.flexDirection = 'column'; // 第一個按鈕最靠近主按鈕
            }
        } else {
            subButtonsContainer.style.display = 'none';
        }

        mainButton.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    // Now populate and update the buttons
    await updateFloatingButtons(code, limitedSites);
}

function updateButtonStates(results) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer || !results) return;

    // Clear existing buttons before adding new ones
    subButtonsContainer.innerHTML = '';

    results.forEach(result => {
        const subButton = document.createElement('a');
        subButton.id = result.id; // Use the ID from background.js (siteId_versionId)
        subButton.className = 'ql-floating-button ql-sub-button';
        subButton.title = result.siteName; // Use the combined site and version name

        // Try to get favicon from the finalUrl or base URL
        let faviconUrl = '';
        try {
            const hostname = new URL(result.finalUrl || result.url).hostname;
            faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;
        } catch (e) {
            console.error('Error getting favicon hostname:', e);
        }
        if (faviconUrl) {
            subButton.style.backgroundImage = `url(${faviconUrl})`;
        }

        switch (result.status) {
            case 'available':
                subButton.classList.add('status-available');
                subButton.href = result.finalUrl; // Use the final URL after redirects

                // Set target based on closeOriginalTab setting
                chrome.storage.sync.get(['closeOriginalTab'], (setting) => {
                    if (setting.closeOriginalTab) {
                        subButton.target = '_self'; // Navigate in current tab
                    } else {
                        subButton.target = '_blank'; // Open in new tab
                    }
                });
                break;
            case 'unavailable':
                subButton.classList.add('status-unavailable');
                subButton.style.pointerEvents = 'none'; // Make it unclickable
                break;
            case 'error':
                subButton.classList.add('status-error');
                subButton.style.pointerEvents = 'none';
                subButton.title = `Error checking ${result.siteName}: ${result.error}`;
                break;
            case 'loading': // Initial state before check
            default:
                subButton.classList.add('status-loading');
                break;
        }
        subButtonsContainer.appendChild(subButton);
    });
}

// =============================================
// Styling
// =============================================

const style = document.createElement('style');
style.textContent = `
  .ql-floating-container {
    position: fixed; z-index: 9999; right: 20px; bottom: 20px;
    display: flex; flex-direction: column; align-items: center;
    cursor: move; /* 提示可拖曳 */
  }
  .ql-floating-button {
    width: 40px; height: 40px; border-radius: 50%;
    background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer; user-select: none; transition: all 0.3s ease;
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; background-size: 60%; background-position: center; background-repeat: no-repeat;
    border: 3px solid transparent;
  }
  .ql-main-button { background-color: #007bff; color: white; font-size: 28px; }
  .ql-sub-buttons {
    display: none; flex-direction: column; align-items: center;
    position: absolute; /* 脫離 flex 流，不影響主按鈕位置 */
    gap: 10px;
  }
  .ql-sub-button { background-color: #f8f9fa; cursor: pointer; }
  .ql-sub-button:hover { transform: scale(1.15); }

  /* Status Styles */
  .status-loading { border-color: #ffc107; /* Yellow */ animation: pulse 1.5s infinite; }
  .status-available { border-color: #28a745; /* Green */ }
  .status-unavailable { border-color: #dc3545; /* Red */ opacity: 0.5; }
  .status-error { border-color: #fd7e14; /* Orange */ opacity: 0.6; }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
  }
`;
document.head.appendChild(style);

// =============================================
// Initial Execution & Listeners
// =============================================

// Initial check for code on page load
(async () => {
    const extractResult = await getCode();
    if (extractResult) {
        createFloatingButton(extractResult);
    }
})();

// Listen for storage changes to rebuild
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.settings || changes.domainRules)) {
    // 清除規則快取
    rulesLoaded = false;
    cachedDomainRules = [];

    // 重新提取並創建按鈕
    const container = document.querySelector('.ql-floating-container');
    if (container) container.remove();

    (async () => {
        const extractResult = await getCode();
        if (extractResult) createFloatingButton(extractResult);
    })();
  }
});

// Listen for text selection
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        // Check if current site is one of the configured sites
        chrome.storage.sync.get(['settings'], (result) => {
            const settings = result.settings || [];
            const currentHostname = window.location.hostname;
            const isConfiguredSite = settings.some(site => {
                try {
                    const siteHostname = new URL(site.baseUrl.replace('{}', '')).hostname;
                    return currentHostname.includes(siteHostname);
                } catch (e) {
                    console.error("Error parsing site URL:", site.baseUrl, e);
                    return false;
                }
            });

            // If it's a configured site, do not trigger global detection
            if (isConfiguredSite) {
                return;
            }

            const code = extractCodeFromText(selectedText);
            if (code) {
                createFloatingButton(code);
            }
        });
    }
});

// Make the floating container draggable
document.addEventListener('mousedown', (e) => {
    const container = document.querySelector('.ql-floating-container');
    if (!container || !container.contains(e.target)) return;

    // 避免點擊子按鈕時觸發拖曳（只有主按鈕或容器可拖曳）
    if (e.target.classList.contains('ql-sub-button') || e.target.closest('.ql-sub-button')) {
        return;
    }

    e.preventDefault(); // 防止選取文字

    // 開始拖曳時移除 right 和 bottom 定位
    const rect = container.getBoundingClientRect();
    container.style.right = 'auto';
    container.style.bottom = 'auto';
    container.style.left = rect.left + 'px';
    container.style.top = rect.top + 'px';

    let shiftX = e.clientX - rect.left;
    let shiftY = e.clientY - rect.top;

    function moveAt(clientX, clientY) {
        let newLeft = clientX - shiftX;
        let newTop = clientY - shiftY;

        // 限制在視窗範圍內
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));

        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
    }

    function onMouseMove(event) {
        moveAt(event.clientX, event.clientY);
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // O4: 拖曳結束後儲存按鈕位置
        const finalRect = container.getBoundingClientRect();
        localStorage.setItem('ql_button_pos', JSON.stringify({
            left: finalRect.left,
            top: finalRect.top
        }));
        console.log('[QuickLinker] Saved button position:', finalRect.left, finalRect.top);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    container.ondragstart = function() {
        return false;
    };
});