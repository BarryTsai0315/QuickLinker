# QuickLinker

**智慧連結聚合 Chrome 擴充功能** — 自動偵測頁面內容、即時檢查多個網站的連結可用性，讓你一鍵跨站搜尋。

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-立即安裝-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/quicklinker/nlekpdjojigdbkidndldccapckfonjfb) ![Version](https://img.shields.io/badge/version-3.10.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 目錄

- [快速上手](#快速上手)
- [使用方式](#使用方式)
- [設定說明](#設定說明)
- [技術參考](#技術參考)
- [開發指引](#開發指引)

---

## 快速上手

### 從 Chrome 線上應用程式商店安裝（推薦）

前往 [Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/quicklinker/nlekpdjojigdbkidndldccapckfonjfb)，點擊「加到 Chrome」即可完成安裝，並可自動接收後續更新。

### 從原始碼安裝

1. 下載或 clone 此專案
2. 開啟 `chrome://extensions/`，啟用右上角「開發者模式」
3. 點擊「載入未封裝項目」，選擇 `QuickLinker` 資料夾
4. 工具列出現 QuickLinker 圖示即完成

---

## 使用方式

### 浮動按鈕（自動模式）

當你瀏覽內建支援的網站時，擴充功能會自動偵測頁面中的番號或 ID，並在右下角顯示浮動 `+` 按鈕。

1. 點擊 `+` 展開子按鈕，顯示已設定的搜尋網站
2. 每個按鈕以顏色標示連結狀態：
   - **綠色邊框** — 連結確認可用
   - **紅色邊框** — 連結確認不存在（不可點擊，僅「最佳結果」模式會顯示）
3. 點擊任一按鈕即跳轉；若該番號已有開啟的分頁，自動聚焦該分頁而非開新分頁

**只顯示確認過的結果**：無法確認可用性的網站（被 Cloudflare 之類的防護擋下、站台暫時故障、不支援探測方法）不會產生按鈕。你看到的每一顆按鈕，都是實際探測過的結果，不會出現點下去才發現是死連結的情況。詳見 [URL 可用性判斷機制](#url-可用性判斷機制)。

**排除目前網站**：預設不顯示指向當前所在網站的結果。例如在 JavDB 頁面上展開按鈕時，不會再出現一顆連回 JavDB 的按鈕。可在選項頁關閉此行為。

在 MissAV 影片頁面啟用排除目前網站時，浮動按鈕會顯示其他已設定站台，不顯示 MissAV 自身的兩個版本。

**拖曳**：按住浮動按鈕可自由移動，位置會自動儲存（`localStorage`），下次開啟同域名頁面自動復原。

### 右鍵選單（手動模式）

在任何網頁選取文字後按右鍵，選擇「使用「...」搜尋」，再從子選單選擇目標網站。

---

## 設定說明

點擊工具列圖示開啟 Popup，或前往 `⚙ 選項` 進入完整設定頁面。

### 搜尋網站管理

新增網站時，在「搜尋網址」欄位用 token 標示關鍵字的位置：

```
https://javdb.com/search?q={}&f=all
https://github.com/search?q={}
https://www.amazon.com/s?k={}
```

一個網站可設定多個「版本」（例如同一平台的不同語言站點），各版本在右鍵選單以「網站名稱 - 版本名稱」顯示。

#### 可用的 token

不同網站對同一個番號的寫法未必相同。除了原樣代入的 `{}` 之外，還可以選用會先做轉換再代入的 token，不需要改任何程式碼就能接上格式不同的網站：

浮動按鈕與右鍵選單產生搜尋網址時，都會套用相同的 token 轉換，代入值也會經過 URL 編碼。

| Token | 轉換方式 | `IPZZ-914` 代入後 |
|-------|----------|------------------|
| `{}` | 原樣代入 | `IPZZ-914` |
| `{lower}` | 全部轉小寫 | `ipzz-914` |
| `{upper}` | 全部轉大寫 | `IPZZ-914` |
| `{nodash}` | 移除所有非英數字元 | `IPZZ914` |
| `{dmm}` | DMM 品番格式：字母小寫，數字左補零至 5 位 | `ipzz00914` |

`{dmm}` 適用於 DMM 系的網站。例如 javtrailers 把 `PRED-820` 寫成 `pred00820`，設定成這樣即可：

```
https://javtrailers.com/video/{dmm}
```

若番號拆不出「字母段 + 數字段」（例如 `FC2PPV`），`{dmm}` 會退回輸出小寫去符號的形式（`fc2ppv`），不會產出錯誤網址。數字段本身已達 5 位以上時不補零也不截斷。

### 掃描模式

| 模式 | 行為 | 顯示的按鈕 | 適合情境 |
|------|------|------------|----------|
| **最佳結果** | 循序檢查，找到第一個可用連結後立即停止 | 可用（綠）與確認不存在（紅） | 只想快速跳轉 |
| **完整掃描** | 平行檢查所有網站 | 僅可用（綠） | 需要比較哪些網站有資源 |

### 其他設定

- **排除目前網站**：不顯示指向當前所在網站的搜尋結果（預設開啟）
- **搜尋後關閉原始分頁**：跳轉後自動關閉來源頁面
- **顯示浮動按鈕**：關閉後只保留右鍵選單功能
- **啟用搜尋快取**：快取探測結果 30 分鐘，加速重複搜尋；關閉後每次重新探測
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

可用性探測由 Service Worker 執行（繞過 CORS 限制），先發 HEAD 請求，依回應狀態分為三態：

| 探測結果 | 判定 | 說明 |
|----------|------|------|
| 2xx | `available` | 資源存在 |
| 404 / 410 | `unavailable` | 資源不存在或已永久移除 |
| 403 / 405 / 5xx / 網路錯誤 | `unknown` | 這次探測無法下結論 |

**GET 重試**：判為 `unknown` 時，以 GET 對同一網址重試一次並重新套用上表。取得狀態碼後立即取消回應主體的讀取，不會把整個頁面內容留在記憶體。重試後仍是 `unknown` 就維持該結論，同一次檢查不再發送第三個請求。

**重導終點退化**：部分網站找不到資源時不回 404，而是 302 導回首頁，跟隨重導後拿到 200。因此在判為 `available` 之前多一道檢查——若回應發生過重導、最終網址的路徑是根路徑、而原請求路徑不是根路徑，改判為 `unavailable`。

**渲染規則**：只有 `available` 與 `unavailable` 會產生按鈕，`unknown` 完全不渲染。「完整掃描」模式再進一步只保留 `available`。

**快取**：`available` 與 `unavailable` 的結果存入 `chrome.storage.session`，TTL 30 分鐘。`unknown` 不寫入快取，讓下次檢查能重新探測，避免把暫時性的阻擋固化成 30 分鐘的錯誤結論。關閉「啟用搜尋快取」設定後不讀也不寫。

### 排除當前站台

浮動按鈕與 popup 觸發搜尋時，會將當前作用中頁面的 hostname 帶入可用性檢查請求。Service Worker 組裝完整的待檢查清單後，逐一解析每個目標網址的 hostname 與之比對，命中即跳過該項目。右鍵選單由使用者明確指定搜尋站台，因此不套用此排除機制。

同站判定規則：兩邊轉小寫並去除開頭的 `www.` 之後，相等或一方以「`.` 加另一方」結尾即視為同站。

| 當前頁面 | 目標網址 hostname | 是否同站 |
|----------|-------------------|----------|
| `javdb.com` | `javdb.com` | 是 |
| `www.javdb.com` | `javdb.com` | 是 |
| `sub.missav.ai` | `missav.ai` | 是 |
| `javdb.com` | `javdbmirror.com` | 否（尾綴必須以 `.` 為界） |

目標網址解析不出 hostname 時不執行排除，該項目照常留在清單中，避免一筆壞設定連帶影響其他網站。請求未帶 hostname 時（例如 Content Script 尚未重新載入）不排除任何網站，行為與舊版一致。

由於待檢查清單可能同時包含自動產生與使用者設定的相同目標，組裝時會先依網址去重，同一個目標只會產生一顆按鈕。

### 分頁去重邏輯

點擊搜尋前，先掃描所有已開啟分頁，依序比對：

1. **完全匹配**：正規化後 URL 相同（lowercase hostname、去 hash、去尾斜線、保留 query）
2. **MissAV 語意等價**：相同番號 + 相同 variant（正常 / 無碼）+ 相同 query，不論路徑前綴（`/dm2/`、`/en-us/`、`/zh-tw/` 等任意 locale 前綴皆視為同頁）
3. **通用等價**：非 MissAV 站以 `hostname + lowercase pathname（去 locale 前綴 + 去尾斜線）+ query` 計算等價 key

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
| `chrome.storage.sync` | `excludeCurrentSite` | Boolean，排除當前站台（未設定時視為 `true`） |
| `chrome.storage.sync` | `closeOriginalTab` | Boolean |
| `chrome.storage.sync` | `showFloatingButton` | Boolean |
| `chrome.storage.sync` | `enableCache` | Boolean，可用性快取開關（未設定時視為 `true`） |
| `chrome.storage.sync` | `language` | `'auto'` 或語言代碼 |
| `chrome.storage.session` | `uc_<url>` | URL 可用性快取，值為 `{ available, finalUrl, timestamp }`（TTL 30 分鐘，不跨瀏覽器重啟，`unknown` 不寫入） |
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

先分清楚要新增哪一種，兩者的作法完全不同：

| 需求 | 作法 |
|------|------|
| 新增**搜尋目標**（把番號送去查詢的網站） | 不需要改程式碼。在選項頁新增網站，用 [token](#可用的-token) 對上該站的番號格式即可 |
| 新增**偵測來源**（會自動跳出浮動按鈕的網站） | 需要改程式碼，見下方步驟 |

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

### v3.10.0
- 修正右鍵選單未套用具名 token 的問題，並統一對樣板代入值進行 URL 編碼
- 預先算好的網址清單改為追加設定站台，不再取代完整待檢查清單
- 同站排除改為過濾所有清單來源，MissAV 頁面會顯示其他已設定站台而非自身版本
- session 快取讀寫故障時退化為無快取，不再丟棄已取得的探測結果
- popup 搜尋會帶入目前分頁 hostname，避免再次開啟同站結果

### v3.9.0
- 新增「排除目前網站」設定（預設開啟）：在 JavDB 之類的網站上展開浮動按鈕時，不再出現連回同一個網站的結果
- 收緊可用性判定，改為 available / unavailable / unknown 三態：原本只有 404 算不可用，導致 Cloudflare 擋下的 403、不支援 HEAD 的 405、站台 5xx 全被誤判為可用而顯示綠燈
- 無法確認的網址改以 GET 重試一次，仍無法確認就不顯示按鈕，也不寫入快取，避免把暫時性阻擋固化成 30 分鐘的錯誤結論
- 新增重導終點檢查：找不到資源時被導回首頁的網址改判為不可用，不再因為最終拿到 200 而顯示綠燈
- 搜尋網址新增具名 token `{lower}`、`{upper}`、`{nodash}`、`{dmm}`，使用 DMM 品番格式的網站（如 javtrailers 的 `pred00820`）可純靠設定新增，不需要改程式碼
- 修正預設網站清單中必然失效的 JavDB 樣板：`/v/` 路徑接受的是站內短碼而非番號，改為指向搜尋端點（不會覆寫既有使用者設定，需自行到選項頁調整）

### v3.8.1
- 修正完整掃描模式會把 404 / 請求失敗的連結也畫成按鈕的問題：fullScan 現在只顯示確認可用（綠色）的按鈕，最佳結果模式行為不變
- 修正 MissAV 自訂前綴來源（如 `https://missav.ai/fc2-ppv-{}`）被變體展開吃掉前綴並與標準 MissAV 來源產生重複 URL 的問題：僅 baseUrl 樣板為 `https://missav.ai/{}` 的標準來源才自動展開有碼 / 無碼變體

### v3.8.0
- 修正最近搜尋時間戳凍結問題：搜尋歷史統一改用 `chrome.storage.local`，讓浮動按鈕偵測與 popup 顯示共享同一份記錄
- 右鍵選單搜尋歷史寫入一併改用 `chrome.storage.local`
- 新增一次性遷移：擴充功能啟動時自動將舊版殘留在 `chrome.storage.sync` 的搜尋歷史合併至 local

### v3.7.0
- 修正分頁去重漏判：exact 比對改為正規化後比對，修復大小寫 / 尾斜線差異造成的重複開分頁
- MissAV 路徑等價判定支援任意 locale 前綴（`/en-us/`、`/zh-tw/` 等多段前綴不再漏判）
- 新增通用跨變體 fallback：JavDB 等非 MissAV 站的大小寫 / 尾斜線差異也能命中既有分頁

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
