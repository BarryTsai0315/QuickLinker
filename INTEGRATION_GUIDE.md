# QuickLinker 規則系統整合指南

## 概述

本指南說明如何將「規則配置系統」整合到現有的 QuickLinker 擴充功能中。

---

## 整合步驟

### Step 1: 新增檔案

已新增以下檔案：
- ✅ `rules-config.html` - 規則配置介面
- ✅ `rules-config.js` - 規則管理邏輯
- ✅ `FEATURE_SPEC.md` - 功能規格文件

### Step 2: 修改 popup.html 入口

已完成：在「網站管理」頁籤新增「進階規則配置」按鈕

### Step 3: 修改 popup.js 監聽器

已完成：新增開啟規則配置頁面的事件監聽器

### Step 4: 修改 content.js（待完成）

需要將硬編碼的提取邏輯改為規則驅動。

#### 修改位置：content.js:5-23

**原始程式碼**：
```javascript
function getCode() {
    const clipboardElement = document.querySelector('.copy-to-clipboard');
    if (clipboardElement) {
        return clipboardElement.getAttribute('data-clipboard-text');
    }

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
```

**新程式碼**：
```javascript
// 全域快取規則，避免重複讀取 storage
let cachedDomainRules = [];
let rulesLoaded = false;

async function loadDomainRules() {
    if (rulesLoaded) return cachedDomainRules;

    const result = await chrome.storage.sync.get(['domainRules']);
    cachedDomainRules = result.domainRules || [];
    rulesLoaded = true;
    return cachedDomainRules;
}

async function extractCodeByRules() {
    const domainRules = await loadDomainRules();
    const currentDomain = location.hostname;

    // 找到匹配當前網域的規則
    const matchedRule = domainRules.find(rule =>
        rule.enabled && currentDomain.includes(rule.domain)
    );

    if (!matchedRule) return null;

    // 按順序執行提取規則
    for (const extractor of matchedRule.extractors) {
        let result = null;

        try {
            switch (extractor.type) {
                case 'selector':
                    const element = document.querySelector(extractor.pattern);
                    if (element) {
                        switch (extractor.transform) {
                            case 'text':
                                result = element.textContent.trim();
                                break;
                            case 'href':
                                result = element.href;
                                break;
                            default:
                                // data-* 或其他屬性
                                result = element.getAttribute(extractor.transform);
                        }
                    }
                    break;

                case 'regex':
                    const textContent = document.body.textContent;
                    const match = textContent.match(new RegExp(extractor.pattern));
                    if (match) {
                        // transform 格式: match_1, match_2 等
                        const matchIndex = parseInt(extractor.transform.replace('match_', '')) || 0;
                        result = match[matchIndex];
                    }
                    break;

                case 'clipboard':
                    try {
                        result = await navigator.clipboard.readText();
                    } catch (e) {
                        console.warn('Cannot read clipboard:', e);
                    }
                    break;

                case 'url':
                    result = location.href;
                    break;
            }

            if (result) {
                return {
                    code: result,
                    sites: matchedRule.sites  // 只檢查規則指定的網站
                };
            }
        } catch (error) {
            console.error('Extractor error:', error);
        }
    }

    return null;
}

// 保留舊函數作為備用（當沒有規則時使用）
function getCodeLegacy() {
    const clipboardElement = document.querySelector('.copy-to-clipboard');
    if (clipboardElement) {
        return clipboardElement.getAttribute('data-clipboard-text');
    }

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

// 統一入口函數
async function getCode() {
    // 優先使用規則提取
    const ruleResult = await extractCodeByRules();
    if (ruleResult) return ruleResult;

    // 備用：使用舊邏輯
    const legacyCode = getCodeLegacy();
    return legacyCode ? { code: legacyCode, sites: null } : null;
}
```

#### 修改位置：content.js:68-101 (createFloatingButton)

**原始程式碼**：
```javascript
async function createFloatingButton(code) {
    // ...
    await updateFloatingButtons(code);
}
```

**新程式碼**：
```javascript
async function createFloatingButton(extractResult) {
    // 支援兩種輸入格式：
    // 1. 舊格式: createFloatingButton('ABC-123')
    // 2. 新格式: createFloatingButton({ code: 'ABC-123', sites: [...] })

    let code, limitedSites;

    if (typeof extractResult === 'string') {
        // 舊格式
        code = extractResult;
        limitedSites = null;
    } else {
        // 新格式
        code = extractResult.code;
        limitedSites = extractResult.sites;
    }

    let container = document.querySelector('.ql-floating-container');
    if (container) {
        await updateFloatingButtons(code, limitedSites);
        return;
    }

    // ... 原有 UI 創建邏輯 ...

    await updateFloatingButtons(code, limitedSites);
}
```

#### 修改位置：content.js:56-66 (updateFloatingButtons)

**原始程式碼**：
```javascript
async function updateFloatingButtons(code) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer) return;

    subButtonsContainer.innerHTML = '';

    const response = await chrome.runtime.sendMessage({ action: 'checkUrls', code: code });
    updateButtonStates(response.results);
}
```

**新程式碼**：
```javascript
async function updateFloatingButtons(code, limitedSites = null) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer) return;

    subButtonsContainer.innerHTML = '';

    // 傳遞限定網站清單到 background.js
    const response = await chrome.runtime.sendMessage({
        action: 'checkUrls',
        code: code,
        limitedSites: limitedSites  // 新增參數
    });

    updateButtonStates(response.results);
}
```

#### 修改位置：content.js:194-197 (初始化)

**原始程式碼**：
```javascript
const initialCode = getCode();
if (initialCode) {
    createFloatingButton(initialCode);
}
```

**新程式碼**：
```javascript
(async () => {
    const extractResult = await getCode();
    if (extractResult) {
        createFloatingButton(extractResult);
    }
})();
```

#### 修改位置：content.js:200-207 (storage 監聽)

**原始程式碼**：
```javascript
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const container = document.querySelector('.ql-floating-container');
    if (container) container.remove();
    const code = getCode();
    if (code) createFloatingButton(code);
  }
});
```

**新程式碼**：
```javascript
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
```

---

### Step 5: 修改 background.js（待完成）

需要支援規則指定的網站過濾。

#### 修改位置：background.js:132-163

**原始程式碼**：
```javascript
if (message.action === 'checkUrls') {
    (async () => {
      const { settings, scanMode } = await chrome.storage.sync.get(['settings', 'scanMode']);
      const code = message.code;

      const results = [];

      for (const site of settings) {
        for (const version of site.versions) {
          // ... 檢查所有網站
        }
      }
      sendResponse({ results });
    })();
    return true;
  }
```

**新程式碼**：
```javascript
if (message.action === 'checkUrls') {
    (async () => {
      const { settings, scanMode } = await chrome.storage.sync.get(['settings', 'scanMode']);
      const code = message.code;
      const limitedSites = message.limitedSites;  // 新增參數

      const results = [];

      for (const site of settings) {
        for (const version of site.versions) {
          const siteVersionId = `${site.id}_${version.id}`;

          // 如果有限定網站清單，只檢查清單內的網站
          if (limitedSites && !limitedSites.includes(siteVersionId)) {
            continue;
          }

          const fullUrl = version.baseUrl.replace('{}', code);
          const urlInfo = { id: siteVersionId, url: fullUrl, siteName: `${site.name} - ${version.name}` };

          try {
            const response = await fetch(fullUrl, { method: 'HEAD', cache: 'no-cache' });
            if (response.status === 404) {
              results.push({ ...urlInfo, status: 'unavailable' });
            } else {
              results.push({ ...urlInfo, status: 'available', finalUrl: response.url });
              if (scanMode === 'bestMatch') {
                sendResponse({ results });
                return;
              }
            }
          } catch (error) {
            results.push({ ...urlInfo, status: 'error', error: error.message });
          }
        }
      }
      sendResponse({ results });
    })();
    return true;
  }
```

---

## 測試計畫

### 測試案例 1: GitHub Issue 檢索

**前置條件**：
1. 在規則配置頁面新增規則：
   - 網域: `github.com`
   - 提取類型: `正則表達式`
   - 提取規則: `#(\d+)`
   - 轉換方式: `match_1`
   - 關聯網站: 選擇 GitHub、Stack Overflow

**測試步驟**：
1. 開啟 `https://github.com/microsoft/vscode/issues/12345`
2. 觀察是否出現浮動按鈕
3. 點擊浮動按鈕展開
4. 確認只顯示 GitHub 和 Stack Overflow 兩個按鈕
5. 確認 URL 包含 `12345`

**預期結果**：
- ✅ 浮動按鈕自動出現
- ✅ 只顯示規則指定的兩個網站
- ✅ 點擊按鈕開啟正確 URL

### 測試案例 2: Amazon 商品提取

**前置條件**：
1. 新增規則：
   - 網域: `amazon.com`
   - 提取類型: `CSS 選擇器`
   - 提取規則: `#productTitle`
   - 轉換方式: `text`
   - 關聯網站: 選擇 Amazon JP、淘寶

**測試步驟**：
1. 開啟任意 Amazon 商品頁
2. 觀察浮動按鈕
3. 展開後確認網站列表

**預期結果**：
- ✅ 提取商品標題成功
- ✅ 只顯示 Amazon JP 和淘寶

### 測試案例 3: 備用邏輯測試

**前置條件**：
- 刪除所有規則

**測試步驟**：
1. 開啟 `javdb.com` 網站
2. 觀察是否使用舊邏輯提取代碼

**預期結果**：
- ✅ 舊邏輯正常運作（向下相容）

---

## 部署檢查清單

### 程式碼修改
- [x] 新增 `rules-config.html`
- [x] 新增 `rules-config.js`
- [x] 修改 `popup.html` 新增按鈕
- [x] 修改 `popup.js` 新增事件監聽
- [ ] 修改 `content.js` 提取邏輯
- [ ] 修改 `background.js` 過濾邏輯

### 測試
- [ ] 單元測試：規則匹配邏輯
- [ ] 整合測試：三個測試案例
- [ ] 效能測試：50 條規則下的渲染速度
- [ ] 相容性測試：Chrome、Edge

### 文檔
- [x] 功能規格書 (`FEATURE_SPEC.md`)
- [x] 整合指南 (`INTEGRATION_GUIDE.md`)
- [ ] 使用者手冊更新
- [ ] README 更新

---

## 注意事項

### 1. 向下相容
- 保留 `getCodeLegacy()` 函數，當沒有規則時使用舊邏輯
- 支援兩種輸入格式（字串和物件）

### 2. 效能優化
- 規則快取在 `content.js` 初始化時載入
- 只在 storage 變更時清除快取

### 3. 錯誤處理
- 正則表達式錯誤需 try-catch
- 剪貼簿權限可能被拒絕
- CSS 選擇器可能找不到元素

### 4. 安全性
- 使用 `escapeHtml()` 防止 XSS
- 正則表達式需驗證（防止 ReDoS）

---

## 下一步

完成整合後，建議繼續開發以下功能：

1. **規則測試模式**
   - 在配置頁面新增「測試」按鈕
   - 輸入測試 HTML，預覽提取結果

2. **規則範本庫**
   - 內建常用網站規則（GitHub、Amazon、淘寶）
   - 一鍵匯入

3. **規則分組**
   - 支援規則分類（開發工具、電商、學術）
   - 批量啟用/停用

4. **錯誤日誌**
   - 記錄提取失敗的規則
   - 幫助使用者除錯

---

**最後更新**: 2025-11-27
