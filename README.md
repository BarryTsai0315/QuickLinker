# QuickLinker - 智慧連結聚合瀏覽器擴充功能

![Version](https://img.shields.io/badge/version-3.4.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 專案簡介

QuickLinker 是一款強大的 Chrome 瀏覽器擴充功能，專為提升搜尋效率而設計。透過智慧內容偵測和快速搜尋整合，讓您在瀏覽網站時能夠即時在多個平台搜尋相關內容。

### 核心特色

- 🎯 **智慧內容偵測**：自動提取網頁中的關鍵資訊（編號、代碼、ID 等）
- 🔍 **即時多站搜尋**：一鍵在多個網站同時搜尋，即時顯示連結可用性
- 🖱️ **右鍵選單整合**：選取任何文字即可快速搜尋
- ⚙️ **高度可客製化**：自訂搜尋網站、掃描模式等設定
- 🎨 **現代化介面**：漂亮的漸層設計和流暢動畫
- 🔒 **隱私優先**：所有數據本地儲存，不上傳任何資訊

---

## 適用場景

QuickLinker 適合任何需要頻繁跨網站搜尋內容的使用者：

- 📚 **開發者**：在 GitHub、Stack Overflow、文檔網站間快速查找 Issue、錯誤訊息
- 🛒 **電商比價**：在 Amazon、eBay、其他購物網站比較商品
- 📖 **研究人員**：在多個學術資料庫、論文網站搜尋相關文獻
- 🎬 **媒體愛好者**：在各個內容平台搜尋影片、音樂、書籍
- 🔍 **資訊搜集**：快速在多個搜尋引擎、資料庫查找資訊

---

## 安裝方式

### 從原始碼安裝

1. **下載專案**
   ```bash
   git clone https://github.com/yourusername/QuickLinker.git
   ```

2. **開啟 Chrome 擴充功能頁面**
   - 在網址列輸入 `chrome://extensions/`
   - 或點擊選單 → 更多工具 → 擴充功能

3. **啟用開發者模式**
   - 點擊右上角的「開發者模式」開關

4. **載入擴充功能**
   - 點擊「載入未封裝項目」
   - 選擇 QuickLinker 資料夾

5. **完成！**
   - QuickLinker 圖示會出現在工具列

---

## 功能說明

### 1. 智慧浮動按鈕

當您訪問配置的網站時：

1. **自動偵測**：擴充功能會自動提取頁面中的關鍵資訊（ID、編號、代碼等）
2. **浮動按鈕出現**：右下角會出現藍色 `+` 按鈕
3. **展開查看網站**：點擊 `+` 展開所有可搜尋網站
4. **顏色標示狀態**：
   - 🟢 **綠色邊框**：連結可用
   - 🔴 **紅色邊框**：連結不存在 (404)
   - 🟠 **橘色邊框**：檢查時發生錯誤
   - 🟡 **黃色邊框**：檢查中（動畫）
5. **點擊搜尋**：點擊任一網站按鈕即可跳轉

**拖曳功能**：
- 按住浮動按鈕可以拖曳到螢幕任何位置
- 不會拖出視窗範圍（自動 clamp 邊界）
- 💾 **位置自動記憶**：拖曳後位置會自動儲存，重新開啟頁面時按鈕會復原到上次的位置
- 展開方向自動判斷：按鈕靠近視窗上半則往下展開，靠近下半則往上展開

### 2. 右鍵選單搜尋

在任何網頁：

1. **選取文字**（如：PROD-12345）
2. **按右鍵**
3. **點擊「使用「...」搜尋」**
4. **選擇網站**即可跳轉搜尋

### 3. 設定管理

點擊工具列上的 QuickLinker 圖示，開啟設定面板：

#### 📁 網站管理
- **新增搜尋網站**：輸入名稱和 URL（使用 `{}` 作為關鍵字佔位符）
  - 範例：`https://github.com/search?q={}`
  - 範例：`https://stackoverflow.com/search?q={}`
  - 範例：`https://www.amazon.com/s?k={}`
- **編輯/刪除網站**：點擊網站卡片上的按鈕
- **拖曳排序**：拖動網站卡片調整順序
- **匯入/匯出設定**：備份或分享您的設定

#### ⚙️ 掃描設定
- **最佳結果模式**：找到第一個可用連結後停止（速度快）
- **完整掃描模式**：檢查所有網站連結（完整資訊）

#### 📑 分頁管理
- **開啟搜尋後關閉原始分頁**：勾選後點擊搜尋會直接在當前分頁跳轉
- 不勾選：在新分頁開啟搜尋結果

---

## 使用範例

### 情境 1：開發者查找 GitHub Issue

1. 在 GitHub Issue 頁面 `https://github.com/microsoft/vscode/issues/12345`
2. 浮動按鈕自動出現並提取 Issue 號 `12345`
3. 點擊 `+` 展開，看到 Stack Overflow、Reddit、Google 等搜尋選項
4. 綠色邊框表示這些網站有相關討論
5. 點擊任一網站即可跳轉搜尋

### 情境 2：電商比價

1. 在 Amazon 商品頁面瀏覽商品
2. 自動提取商品 ID 或 ASIN
3. 浮動按鈕顯示 eBay、淘寶等購物網站
4. 一鍵比價，找到最便宜的選項

### 情境 3：論壇快速搜尋

1. 在論壇看到有人提到 `ERR-12345`
2. 選取 `ERR-12345` 文字
3. 右鍵 → 使用「ERR-12345」搜尋 → 選擇搜尋引擎
4. 新分頁開啟搜尋結果

---

## 技術架構

### 核心文件

```
QuickLinker/
├── manifest.json               # 擴充功能配置（Manifest V3）
├── README.md
├── CLAUDE.md
├── LICENSE
├── icons/                      # 圖示資源（16/64/128/256/512px）
├── src/
│   ├── background/
│   │   └── background.js       # Service Worker（右鍵選單、訊息處理）
│   ├── content/
│   │   ├── content.js          # 內容腳本（浮動按鈕、內容偵測）
│   │   └── content.css         # 樣式表
│   └── popup/
│       ├── popup.html          # 設定介面 HTML
│       └── popup.js            # 設定介面邏輯
├── paused/                     # 開發暫停中的功能
│   ├── rules-config.html
│   └── rules-config.js
└── docs/                       # 文件與展示頁
    ├── USER_GUIDE.md
    ├── STORE_DESC.md
    ├── FILE_STRUCTURE.md
    └── index.html
```

### 內容偵測邏輯

QuickLinker 支援多種內容偵測方式：

- **從 URL 提取**：自動識別 URL 中的 ID、編號等模式
- **從頁面元素提取**：使用 CSS 選擇器提取特定元素內容
- **從標題提取**：分析頁面標題中的關鍵資訊
- **通用模式匹配**：支援自訂正則表達式匹配

### 數據儲存

使用 `chrome.storage.sync`，數據會在您登入的所有 Chrome 裝置間同步：

- `settings`：搜尋網站列表
- `scanMode`：掃描模式設定
- `closeOriginalTab`：分頁管理設定
- `localStorage`（本機）：浮動按鈕位置（不同步，各裝置獨立記憶）

---

## 隱私與安全

### 權限說明

- `contextMenus`：創建右鍵選單
- `storage`：儲存您的設定
- `activeTab`：在當前分頁執行內容腳本
- `scripting`：注入浮動按鈕

### 資料處理

- ✅ 所有設定僅儲存在本地瀏覽器
- ✅ 不收集任何個人資訊
- ✅ 不傳送數據到外部伺服器
- ✅ 開源代碼，可審查
- ⚠️ 浮動按鈕會向您配置的網站發送 HEAD 請求檢查連結可用性
- ⚠️ 請只添加您信任的網站 URL

---

## 開發與貢獻

### 開發環境

```bash
# 克隆專案
git clone https://github.com/yourusername/QuickLinker.git

# 在 Chrome 載入擴充功能後即可開發
# 修改代碼後需要在 chrome://extensions/ 點擊「重新載入」
```

### 自訂內容偵測

QuickLinker 採用模組化設計，您可以輕鬆為特定網站添加內容偵測邏輯。

編輯 `content.js` 的 `extractCodeByDomain()` 函數：

```javascript
// 新網站 - 內容提取
if (domain.includes('yoursite.com')) {
    const element = document.querySelector('.product-id');
    if (element) {
        const text = element.textContent.trim();
        console.log('[QuickLinker] YourSite match:', text);
        return text;
    }
}
```

然後將網域加入自動啟用列表：

```javascript
const hardcodedDomains = ['site1.com', 'site2.com', 'yoursite.com'];
```

### 提交貢獻

1. Fork 本專案
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 常見問題

**Q: 為什麼浮動按鈕沒有出現？**
> A: 請確認您正在訪問已配置內容偵測的網站，或使用右鍵選單功能選取文字搜尋。

**Q: 如何添加更多搜尋網站？**
> A: 點擊擴充功能圖示 → 新增頁簽 → 輸入網站名稱和 URL（使用 `{}` 作為佔位符）→ 儲存。

**Q: 可以同時搜尋多個網站嗎？**
> A: 可以！在設定中添加多個搜尋網站，浮動按鈕會同時顯示所有網站，並即時檢查每個連結的可用性。

**Q: 右鍵選單為什麼只有一層？**
> A: 為了提升使用體驗，我們簡化了選單結構，讓您點擊一次就能搜尋。

**Q: 浮動按鈕可以拖曳嗎？**
> A: 可以！按住浮動按鈕即可拖曳到螢幕任何位置，不會拖出視窗範圍。拖曳後位置會自動儲存，下次開啟頁面時按鈕會出現在上次相同的位置。

**Q: 會支援哪些網站的自動偵測？**
> A: QuickLinker 採用開放架構，支援為任何網站添加自動偵測規則。您可以透過修改代碼或提交 Pull Request 來添加新網站支援。

**Q: 資料會被上傳到雲端嗎？**
> A: 不會。所有設定都儲存在您的本地瀏覽器中，使用 Chrome 的同步儲存 API（如果您登入 Chrome 帳號，會在您的裝置間同步）。QuickLinker 不會將任何資料傳送到外部伺服器。

---

## 授權條款

本專案採用 [MIT 授權](LICENSE)。

---

## 聯絡方式

- **問題回報**：[GitHub Issues](https://github.com/yourusername/QuickLinker/issues)
- **功能建議**：[GitHub Discussions](https://github.com/yourusername/QuickLinker/discussions)

---

## 更新日誌

### v3.4.0 (2026-02-22)
- ✨ 新增浮動按鈕位置記憶功能：拖曳後自動儲存位置，重新開啟頁面時自動還原
- 🚀 fullScan 模式平行化檢查所有網站，速度大幅提升
- ⚡ MutationObserver 加入 debounce（300ms），偵測到番號後自動停止監聽，節省資源
- 🔄 新增 URL 變化偵測，支援 SPA 頁面切換自動重新提取
- 🛡️ 按鈕位置邊界保護：視窗縮小時自動 clamp 到有效範圍內

### v3.3.4 (2026-02-22)
- 🐛 修復浮動按鈕展開方向問題：自動偵測按鈕位於視窗上/下方，動態決定往上或往下展開，避免子按鈕被裁切
- 🎨 子按鈕改為絕對定位，展開時不再影響主按鈕位置

### v3.3.3 (2025-11-29)
- ✨ 改進浮動視窗拖曳功能（可全屏拖曳）
- 🐛 修復拖曳後無法釋放的問題
- 📝 優化文檔，改善使用說明

### v3.3.2 (2025-11-29)
- ✨ 擴展內容偵測支援

### v3.3.1 (2025-11-29)
- 🎨 簡化右鍵選單為單層結構

### v3.3.0 (2025-11-29)
- ✨ 強化自動內容偵測功能

### v3.2.0 (2025-11-29)
- ✨ 簡化規則系統 + 新增自動關閉原始分頁功能
- 🎨 改進使用者介面

---

**Made with ❤️ by the QuickLinker Team**
