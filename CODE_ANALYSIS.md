# QuickLinker 程式碼分析報告

## 【核心判斷】

✅ 這是個有價值的工具，但程式碼品味方面有多處需要改進。

## 【專案功能概述】

QuickLinker 是一個 Chrome 瀏覽器擴充功能，提供兩個核心功能：

1. **右鍵選單搜尋**：選取網頁文字後，透過右鍵選單快速在預設網站搜尋
2. **智慧浮動按鈕**：自動偵測網頁中的特定代碼（如 `XXX-YYY` 格式），並即時檢查在配置網站上的可用性

### 技術架構

- **Manifest V3** Chrome Extension
- **主要檔案**：
  - `background.js` - Service Worker，處理右鍵選單與 URL 檢查
  - `content.js` - 內容腳本，處理浮動按鈕與頁面互動
  - `popup.js/popup.html` - 設定管理介面
  - `contextMenu.js` - 舊版右鍵選單邏輯（已被 background.js 取代）

---

## 【致命問題】

### 🔴 1. **重複檔案與死代碼**

**問題**：`contextMenu.js` 與 `background.js` 功能重複

```javascript
// contextMenu.js - 46 行程式碼
// background.js - 164 行程式碼，包含完整的右鍵選單邏輯
```

**影響**：
- `contextMenu.js` 沒有在 `manifest.json` 中引用，是**死代碼**
- 維護兩份相似邏輯增加認知負擔
- 程式碼庫混亂，新手無法判斷哪個檔案有效

**Linus 會怎麼說**：
> "這是什麼鬼？你有兩個檔案在做同一件事！刪掉一個。程式碼不是用來收藏的。"

---

### 🔴 2. **數據結構設計混亂**

**問題**：網站設定的數據結構不一致

```javascript
// background.js:70-92 - 預設網站結構
{
  id: generateUniqueId(),
  name: 'Missav',
  versions: [
    { id: generateUniqueId(), name: '預設', baseUrl: 'https://...' }
  ]
}

// contextMenu.js:34-43 - 舊版結構（不支援 versions）
{
  name: site.name,
  baseUrl: site.baseUrl  // 直接掛在 site 上，沒有 versions
}

// popup.js:127-133 - 依賴複雜的選擇器查找
initSortable(versionsContainer.id || versionsContainer.className.split(' ')[0] + '[data-site-id="' + siteId + '"]', ...)
```

**影響**：
- 新舊格式混用，導致資料遷移時會崩潰
- `popup.js:127` 的選擇器邏輯極其脆弱
- 每次新增功能都要處理多種資料格式

**Linus 會怎麼說**：
> "Bad programmers worry about the code. Good programmers worry about data structures. 你的資料結構是一團糟。"

---

### 🔴 3. **過度複雜的特殊情況處理**

**問題 A**：`content.js:213-238` - 判斷是否為"配置網站"的邏輯

```javascript
// 40+ 行程式碼只為了判斷「當前網站是否在設定中」
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

  if (isConfiguredSite) {
    return; // 特殊情況：不顯示浮動按鈕
  }

  const code = extractCodeFromText(selectedText);
  if (code) {
    createFloatingButton(code);
  }
});
```

**問題 B**：`popup.js:127-133` - 動態選擇器生成

```javascript
initSortable(
  versionsContainer.id || versionsContainer.className.split(' ')[0] + '[data-site-id="' + siteId + '"]',
  (newOrder) => { ... }
);
```

**Linus 會怎麼說**：
> "如果你需要超過 3 層 if 嵌套，你就該重新設計了。這段程式碼在對抗它自己的資料結構。"

---

### 🟡 4. **非同步處理的隱患**

**問題**：`background.js:132-163` - 混用 callback 與 async/await

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkUrls') {
    (async () => {
      const { settings, scanMode } = await chrome.storage.sync.get(['settings', 'scanMode']);
      // ... 處理邏輯 ...
      sendResponse({ results });
    })();
    return true; // 保持通道開啟
  }
});
```

**影響**：
- `sendResponse` 在 async 函數內調用，時序不可控
- 如果 `bestMatch` 模式早退出，其他 URL 仍會繼續 fetch（浪費資源）
- 沒有錯誤邊界，任何 Promise rejection 都會導致無回應

**Linus 會怎麼說**：
> "這個 async wrapper 是在掩蓋什麼？重寫它，讓控制流一眼就能看清楚。"

---

### 🟡 5. **無效的 HTML 檔案**

**問題**：`options.html` 完全沒被使用

- `manifest.json` 沒有聲明 `options_page` 或 `options_ui`
- 功能已整合進 `popup.html`
- 但檔案仍保留在專案中

---

### 🟡 6. **錯誤的拖曳實現**

**問題**：`popup.js:313-354` - 拖曳排序的回調參數有誤

```javascript
function initSortable(containerId, onDropCallback) {
  const container = typeof containerId === 'string'
    ? document.getElementById(containerId)
    : containerId;

  if (!container) {
    console.error('Sortable container not found:', containerId);
    return; // 靜默失敗！
  }

  container.addEventListener('dragend', () => {
    const newOrder = Array.from(container.children).map(item => item.dataset.id);
    onDropCallback(newOrder); // 傳入 ID 陣列
  });
}

// 但在 popup.js:44-47 的調用處：
initSortable('sitesContainer', (newOrder) => {
  currentSettings = newOrder.map(id => currentSettings.find(s => s.id === id));
  // newOrder 是 ID 陣列，但這段程式碼把它當成完整物件陣列處理！
  saveSettings(currentSettings);
});
```

**影響**：
- `popup.js:44-47` 會正確工作（因為它用 `id => currentSettings.find(s => s.id === id)` 重建陣列）
- 但 `popup.js:127-133` 傳入的參數是**選擇器字串**而不是 DOM ID，完全不一致

---

## 【關鍵洞察】

### 1. **數據結構**

核心問題在於**資料格式演進過程中沒有遷移邏輯**：

```javascript
// 舊格式（contextMenu.js）
{ name: 'JavDB', baseUrl: 'https://javdb.com/v/{}' }

// 新格式（background.js）
{
  id: 'abc123',
  name: 'JavDB',
  versions: [
    { id: 'def456', name: '預設', baseUrl: 'https://javdb.com/v/{}' }
  ]
}
```

**應該做的**：
- 在 `onInstalled` 事件中檢測舊格式並自動遷移
- 廢棄 `contextMenu.js`
- 統一使用新格式

### 2. **複雜度**

`content.js:213-238` 的"配置網站判斷"邏輯可以用**一行**解決：

```javascript
// 當前：40+ 行
chrome.storage.sync.get(['settings'], (result) => {
  const isConfiguredSite = settings.some(site => { /* ... */ });
  if (isConfiguredSite) return;
  // ...
});

// 應該：1 行（在 background.js 預先計算）
const CONFIGURED_DOMAINS = new Set(['javdb.com', 'missav.ws', 'jable.tv']);
if (CONFIGURED_DOMAINS.has(location.hostname)) return;
```

### 3. **風險點**

- **資料遷移風險**：舊版用戶更新後設定會丟失
- **記憶體洩漏**：MutationObserver 沒有在 content script unload 時斷開
- **CORS 失敗無處理**：`background.js:145` 的 fetch 失敗會導致按鈕永遠卡在 loading 狀態

---

## 【Linus 式改進方案】

### 第一步：清理死代碼（5 分鐘）

```bash
git rm contextMenu.js options.html
```

### 第二步：統一數據結構（15 分鐘）

在 `background.js:63-109` 加入遷移邏輯：

```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    let settings = result.settings || [];

    // 遷移邏輯：檢測舊格式
    settings = settings.map(site => {
      if (!site.versions) {
        // 舊格式：將 baseUrl 移入 versions
        return {
          id: generateUniqueId(),
          name: site.name,
          versions: [{
            id: generateUniqueId(),
            name: '預設',
            baseUrl: site.baseUrl
          }]
        };
      }
      return site; // 已是新格式
    });

    chrome.storage.sync.set({ settings }, () => {
      createContextMenu(settings);
    });
  });
});
```

### 第三步：消除特殊情況（10 分鐘）

**移除** `content.js:213-238` 的判斷邏輯，改用簡單變數：

```javascript
// 在 content.js 頂部
let CONFIGURED_DOMAINS = new Set();

// 初始化時載入
chrome.storage.sync.get(['settings'], (result) => {
  CONFIGURED_DOMAINS = new Set(
    (result.settings || [])
      .flatMap(s => s.versions)
      .map(v => {
        try { return new URL(v.baseUrl.replace('{}', 'test')).hostname; }
        catch { return null; }
      })
      .filter(Boolean)
  );
});

// 使用時
document.addEventListener('mouseup', () => {
  if (CONFIGURED_DOMAINS.has(location.hostname)) return;
  const code = extractCodeFromText(window.getSelection().toString());
  if (code) createFloatingButton(code);
});
```

### 第四步：修復 async 問題（5 分鐘）

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkUrls') {
    checkUrlsAsync(message.code, sendResponse);
    return true; // 保持通道開啟
  }
});

async function checkUrlsAsync(code, sendResponse) {
  const { settings, scanMode } = await chrome.storage.sync.get(['settings', 'scanMode']);
  const results = [];

  for (const site of settings) {
    for (const version of site.versions) {
      const fullUrl = version.baseUrl.replace('{}', code);
      const urlInfo = {
        id: `${site.id}_${version.id}`,
        url: fullUrl,
        siteName: `${site.name} - ${version.name}`
      };

      try {
        const response = await fetch(fullUrl, { method: 'HEAD', cache: 'no-cache' });
        const status = response.status === 404 ? 'unavailable' : 'available';
        results.push({ ...urlInfo, status, finalUrl: response.url });

        if (scanMode === 'bestMatch' && status === 'available') {
          sendResponse({ results });
          return; // 早退出
        }
      } catch (error) {
        results.push({ ...urlInfo, status: 'error', error: error.message });
      }
    }
  }
  sendResponse({ results });
}
```

### 第五步：修復拖曳邏輯（5 分鐘）

```javascript
// popup.js:313 - 統一參數命名
function initSortable(containerSelector, onDropCallback) {
  let container;

  if (typeof containerSelector === 'string') {
    container = containerSelector.startsWith('[')
      ? document.querySelector(containerSelector)
      : document.getElementById(containerSelector);
  } else {
    container = containerSelector;
  }

  if (!container) {
    console.error('Sortable container not found:', containerSelector);
    return;
  }

  // ... 其餘邏輯不變
}

// popup.js:127 - 直接傳入 DOM 元素
initSortable(
  document.querySelector(`.versions-list[data-site-id="${siteId}"]`),
  (newOrder) => { /* ... */ }
);
```

---

## 【優化建議清單】

### 🔥 高優先級（影響功能正確性）

1. **刪除死代碼**：移除 `contextMenu.js` 和 `options.html`
2. **資料遷移**：實現舊格式到新格式的自動轉換
3. **修復 async**：重構 `background.js` 的訊息處理邏輯
4. **統一拖曳**：修正 `initSortable` 的參數不一致問題

### 🟡 中優先級（改善程式碼品質）

5. **消除特殊情況**：簡化 `content.js` 的配置網站判斷邏輯
6. **錯誤處理**：為所有 fetch 請求加入 timeout 和重試機制
7. **記憶體管理**：在 content script 卸載時清理 MutationObserver
8. **常數提取**：將硬編碼的網站清單移到配置檔案

### 🟢 低優先級（錦上添花）

9. **TypeScript 遷移**：加入型別定義，消除隱式型別轉換
10. **測試覆蓋**：`package.json` 有 jest 配置但沒有測試檔案
11. **UI 優化**：`popup.html` 的 CSS 內聯，應獨立成檔案
12. **國際化**：將中文字串抽離成 i18n 檔案

---

## 【程式碼品味評分】

### 整體：🟡 **湊合**

**好的部分**：
- ✅ 使用 Manifest V3（符合新標準）
- ✅ 功能模組化（background/content/popup 分離清晰）
- ✅ 支援匯入/匯出設定（用戶友善）

**糟糕的部分**：
- ❌ 重複程式碼與死代碼未清理
- ❌ 資料結構演進沒有遷移策略
- ❌ 過多的特殊情況處理（違反 Good Taste 原則）
- ❌ 非同步邏輯混亂（callback 與 async/await 混用）

---

## 【結論】

這個專案的**核心概念是好的**，但實現過程中積累了太多技術債：

1. **數據結構**需要統一（消除舊格式殘留）
2. **控制流**需要簡化（減少 if/else 分支）
3. **死代碼**需要清理（提高可維護性）

如果按照上述五步驟執行，可以在 **40 分鐘內**將程式碼品質從「湊合」提升到「良好」。

**Linus 會怎麼說**：
> "這個專案有潛力，但你需要停止堆疊 workaround，開始修復根本問題。數據結構對了，一切都會變簡單。"
