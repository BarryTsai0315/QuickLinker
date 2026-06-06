# QuickLinker

**智慧連結聚合 Chrome 擴充功能** — 自動偵測頁面內容、即時檢查多個網站的連結可用性，讓你一鍵跨站搜尋。

![Version](https://img.shields.io/badge/version-3.6.2-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 目錄

- [快速上手](#快速上手)
- [使用方式](#使用方式)
- [設定說明](#設定說明)
- [技術參考](#技術參考)
- [開發指引](#開發指引)

---

## 快速上手

### 從原始碼安裝

1. 下載或 clone 此專案
2. 開啟 `chrome://extensions/`，啟用右上角「開發者模式」
3. 點擊「載入未封裝項目」，選擇 `QuickLinker` 資料夾
4. 工具列出現 QuickLinker 圖示即完成

---

## 使用方式

### 浮動按鈕（自動模式）

當你瀏覽內建支援的網站時，擴充功能會自動偵測頁面中的番號或 ID，並在右下角顯示浮動 `+` 按鈕。

1. 點擊 `+` 展開子按鈕，顯示所有已設定的搜尋網站
2. 每個按鈕以顏色即時標示連結狀態：
   - **綠色邊框** — 連結可用（HTTP 2xx）
   - **紅色邊框** — 連結不存在（HTTP 404 或 soft 404）
   - **橘色邊框** — 請求失敗（網路錯誤）
   - **黃色動畫** — 檢查中
3. 點擊任一按鈕即跳轉；若該番號已有開啟的分頁，自動聚焦該分頁而非開新分頁

**拖曳**：按住浮動按鈕可自由移動，位置會自動儲存（`localStorage`），下次開啟同域名頁面自動復原。

### 右鍵選單（手動模式）

在任何網頁選取文字後按右鍵，選擇「使用「...」搜尋」，再從子選單選擇目標網站。

---

## 設定說明

點擊工具列圖示開啟 Popup，或前往 `⚙ 選項` 進入完整設定頁面。

### 搜尋網站管理

新增網站時，在「搜尋網址」欄位用 `{}` 作為關鍵字佔位符：

```
https://javdb.com/v/{}
https://github.com/search?q={}
https://www.amazon.com/s?k={}
```

一個網站可設定多個「版本」（例如同一平台的不同語言站點），各版本在右鍵選單以「網站名稱 - 版本名稱」顯示。

### 掃描模式

| 模式 | 行為 | 適合情境 |
|------|------|----------|
| **最佳結果** | 找到第一個可用連結後立即停止 | 只想快速跳轉 |
| **完整掃描** | 平行檢查所有網站，顯示全部結果 | 需要比較哪些網站有資源 |

### 其他設定

- **搜尋後關閉原始分頁**：跳轉後自動關閉來源頁面
- **顯示浮動按鈕**：關閉後只保留右鍵選單功能
- **顯示語言**：支援繁體中文、簡體中文、日文、韓文、英文，或跟隨瀏覽器
- **深色模式**：深色 / 淺色 / 跟隨系統
- **匯入 / 匯出設定**：備份或移轉設定到另一台裝置

---

## 技術參考

### 專案結構

```
QuickLinker/
├── manifest.json               # Manifest V3 設定
├── src/
│   ├── background/
│   │   └── background.js       # Service Worker：URL 檢查、右鍵選單、分頁管理
│   ├── content/
│   │   ├── content.js          # Content Script：內容偵測、浮動按鈕 UI
│   │   └── content.css
│   └── options/
│       ├── options.html        # 完整設定頁面
│       └── options.js
├── src/popup/
│   ├── popup.html              # 工具列 Popup
│   └── popup.js
└── icons/
```

### URL 可用性判斷機制

可用性檢查由 Service Worker 執行（繞過 CORS 限制）：

```
fetch(url, { method: 'HEAD', cache: 'no-cache' })
```

判斷邏輯：
- `response.status === 404` → `unavailable`
- `new URL(response.url).pathname.startsWith('/404')` → soft 404，視為 `unavailable`
- 其餘 2xx / 3xx → `available`
- 網路錯誤（fetch throw）→ `error`

結果存入 `chrome.storage.session` 快取，TTL 30 分鐘，避免對同一 URL 重複請求。

### 分頁去重邏輯

點擊搜尋前，先掃描所有已開啟分頁：

- **完全匹配**：URL 正規化後相同（去除尾斜線、hash、統一 hostname 大小寫）
- **語意等價**：MissAV 支援 `dm2/` 路徑前綴的等價判斷

若找到匹配分頁，呼叫 `chrome.tabs.update` 聚焦該分頁，不另開新頁。

### 內容偵測（`extractCodeByDomain`）

| 網站 | 提取方式 |
|------|----------|
| `missav.ai` | URL pathname regex，同時產生有碼與無碼兩個搜尋目標 |
| `javdb.com` | URL `/v/CODE` → 頁面標題 → `.video-meta-panel .value`（依序 fallback） |
| `javlibrary.com` | `#video_id .text` |
| `fc2cmadb.com` | `span.text-white.ml-2` |
| `github.com` | URL `/issues/NUMBER` |
| `amazon.*` | URL `/dp/ASIN`（10 碼英數） |

`hardcodedDomains` 清單以外的網站不觸發自動浮動按鈕（但右鍵選單仍可用）。

### 資料儲存

| 儲存位置 | 鍵名 | 說明 |
|----------|------|------|
| `chrome.storage.sync` | `settings` | 搜尋網站清單（含版本），跨裝置同步 |
| `chrome.storage.sync` | `scanMode` | `'bestMatch'` 或 `'fullScan'` |
| `chrome.storage.sync` | `closeOriginalTab` | Boolean |
| `chrome.storage.sync` | `showFloatingButton` | Boolean |
| `chrome.storage.sync` | `language` | `'auto'` 或語言代碼 |
| `chrome.storage.session` | `uc_<url>` | URL 可用性快取（TTL 30 分鐘，不跨瀏覽器重啟） |
| `chrome.storage.local` | `searchHistory` | 最近 20 筆搜尋紀錄 |
| `localStorage` | `ql_button_pos` | 浮動按鈕位置（各域名獨立，不同步） |

### Chrome 權限

| 權限 | 用途 |
|------|------|
| `contextMenus` | 建立右鍵選單 |
| `storage` | 儲存使用者設定與快取 |
| `tabs` | 查詢既有分頁、聚焦或開新分頁 |

---

## 開發指引

### 新增支援網站

**步驟 1**：在 `src/content/content.js` 的 `extractCodeByDomain()` 加入提取邏輯：

```javascript
if (domain.includes('newsite.com')) {
    const element = document.querySelector('.product-id');
    if (element) return element.textContent.trim();
}
```

**步驟 2**：將網域加入 `getCode()` 的 `hardcodedDomains` 陣列，使頁面載入時自動觸發：

```javascript
const hardcodedDomains = ['javdb.com', 'javlibrary.com', 'fc2cmadb.com', 'missav.ai', 'newsite.com'];
```

### 除錯

啟用「開發者模式」（選項頁 → 開發人員選項）後，Service Worker 主控台會輸出詳細 log。

- **Content Script log**：在目標頁面的 DevTools Console 查看
- **Service Worker log**：`chrome://extensions/` → QuickLinker → 「Service Worker」連結

### 測試流程

1. 修改程式碼後，前往 `chrome://extensions/` 點擊重新載入
2. 在目標網站驗證浮動按鈕與番號提取結果
3. 確認 DevTools Console 中的 `[QuickLinker]` log 輸出正確
4. 測試右鍵選單與分頁去重行為

---

## 更新紀錄

### v3.6.2
- 修正 age gate 確認後更新通知未自動出現的問題

### v3.6.1
- MissAV 支援多版本搜尋，同一個番號會同時檢查正常版與無碼版
- 無碼標籤已加入多語系，會跟隨目前的語言設定顯示
- 修正右鍵選單、停用網站、浮動按鈕開關與設定資料的一致性
- 網站管理可修改預設網站
- 最近搜尋會合併大小寫相同的番號
- 新增搜尋結果快取（30 分鐘），可在設定頁面關閉
- 新增開發者模式

### v3.6.0
- 重複搜尋同番號時聚焦既有分頁，不再開新分頁

### v3.4.0
- 浮動按鈕位置記憶（拖曳後自動儲存、重開頁面自動還原）
- fullScan 模式改為平行請求，速度大幅提升
- MutationObserver 加入 debounce（300ms），偵測到番號後停止監聽
- 新增 URL 變化偵測，支援 SPA 頁面切換

### v3.3.4
- 修復浮動按鈕展開方向：自動判斷往上或往下展開，避免被視窗裁切
- 子按鈕改為絕對定位，展開時不再影響主按鈕位置

### v3.3.3
- 改進浮動視窗拖曳功能（可全屏拖曳）
- 修復拖曳後無法釋放的問題

### v3.3.2
- 擴展內容偵測支援

### v3.3.1
- 簡化右鍵選單為單層結構

### v3.3.0
- 強化自動內容偵測功能

### v3.2.0
- 簡化規則系統 + 新增自動關閉原始分頁功能
- 改進使用者介面

---

## 授權

[MIT License](LICENSE)
