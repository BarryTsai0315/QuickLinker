# QuickLinker - 智慧連結聚合瀏覽器擴充功能

![Version](https://img.shields.io/badge/version-3.3.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 專案簡介

QuickLinker 是一款強大的 Chrome 瀏覽器擴充功能，專為提升搜尋效率而設計。透過智慧內容偵測和快速搜尋整合，讓您在瀏覽特定網站時能夠即時搜尋相關內容。

### 核心特色

- 🎯 **自動內容偵測**：在特定網站自動提取關鍵資訊（番號、編號等）
- 🔍 **智慧浮動按鈕**：即時顯示所有可搜尋網站，並標示連結可用性
- 🖱️ **右鍵選單整合**：選取任何文字即可快速搜尋
- ⚙️ **高度可客製化**：自訂搜尋網站、掃描模式等設定
- 🎨 **現代化介面**：漂亮的漸層設計和流暢動畫

---

## 支援的網站

以下網站已內建自動偵測（無需任何設定）：

| 網站 | 偵測內容 | 自動啟用 |
|------|----------|----------|
| **JavDB** | 影片番號 | ✅ |
| **JavLibrary** | 影片番號 | ✅ |
| **FC2PPVDB** | FC2 編號 | ✅ |

> 未來將持續新增更多網站支援

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

當您瀏覽 JavDB、JavLibrary 或 FC2PPVDB 時：

1. **自動偵測**：擴充功能會自動提取頁面中的番號或編號
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
- 不會拖出視窗範圍
- 滑鼠游標會顯示「移動」圖示

### 2. 右鍵選單搜尋

在任何網頁：

1. **選取文字**（如：ABC-123）
2. **按右鍵**
3. **點擊「使用「ABC-123」搜尋」**
4. **選擇網站**即可跳轉搜尋

### 3. 設定管理

點擊工具列上的 QuickLinker 圖示，開啟設定面板：

#### 📁 網站管理
- **新增搜尋網站**：輸入名稱和 URL（使用 `{}` 作為關鍵字佔位符）
  - 範例：`https://www.dmm.co.jp/search/={}`
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

### 情境 1：在 JavDB 快速搜尋其他網站

1. 訪問 `https://javdb.com/v/ABC-123`
2. 浮動按鈕自動出現並提取番號 `ABC-123`
3. 點擊 `+` 展開，看到 DMM、R18 等網站
4. 綠色邊框表示這些網站也有此番號
5. 點擊任一網站即可跳轉

### 情境 2：在論壇快速搜尋番號

1. 在論壇看到有人提到 `XYZ-789`
2. 選取 `XYZ-789` 文字
3. 右鍵 → 使用「XYZ-789」搜尋 → 選擇網站
4. 新分頁開啟搜尋結果

---

## 技術架構

### 核心文件

```
QuickLinker/
├── manifest.json          # 擴充功能配置
├── background.js          # Service Worker（右鍵選單、訊息處理）
├── content.js            # 內容腳本（浮動按鈕、內容偵測）
├── content.css           # 樣式表
├── popup.html            # 設定介面 HTML
├── popup.js              # 設定介面邏輯
├── rules-config.html     # 進階規則配置（暫停開發）
├── rules-config.js       # 進階規則邏輯（暫停開發）
└── icons/                # 圖示資源
```

### 內容偵測邏輯

寫死在 `content.js` 的 `extractCodeByDomain()` 函數中：

- **JavDB**：從 URL、標題、頁面元素提取
- **JavLibrary**：從 `#video_id .text` 元素提取
- **FC2PPVDB**：從 `span.text-white.ml-2` 元素提取

### 數據儲存

使用 `chrome.storage.sync`，數據會在您登入的所有 Chrome 裝置間同步：

- `settings`：搜尋網站列表
- `scanMode`：掃描模式設定
- `closeOriginalTab`：分頁管理設定

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
- ⚠️ 浮動按鈕會向您配置的網站發送 HEAD 請求檢查連結可用性
- ⚠️ 請只添加您信任的網站 URL

---

## 開發與貢獻

### 開發環境

```bash
# 安裝依賴（如果有）
npm install

# 在 Chrome 載入擴充功能後即可開發
# 修改代碼後需要在 chrome://extensions/ 點擊「重新載入」
```

### 添加新網站支援

編輯 `content.js` 的 `extractCodeByDomain()` 函數：

```javascript
// 新網站 - 編號提取
if (domain.includes('example.com')) {
    const element = document.querySelector('.your-selector');
    if (element) {
        const text = element.textContent.trim();
        console.log('[QuickLinker] Example match:', text);
        return text;
    }
}
```

然後將網域加入 `hardcodedDomains` 陣列：

```javascript
const hardcodedDomains = ['javdb.com', 'javlibrary.com', 'fc2ppvdb.com', 'example.com'];
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
> A: 請確認您正在訪問 JavDB、JavLibrary 或 FC2PPVDB，並且頁面中有可偵測的番號/編號。

**Q: 如何添加更多搜尋網站？**
> A: 點擊擴充功能圖示 → 新增頁簽 → 輸入網站名稱和 URL（使用 `{}` 作為佔位符）→ 儲存。

**Q: 可以關閉自動偵測功能嗎？**
> A: 目前 JavDB、JavLibrary、FC2PPVDB 是寫死自動啟用，無法關閉。未來版本可能會加入此選項。

**Q: 右鍵選單為什麼只有一層？**
> A: 為了提升使用體驗，我們簡化了選單結構，讓您點擊一次就能搜尋。

**Q: 浮動按鈕可以拖曳嗎？**
> A: 可以！按住浮動按鈕即可拖曳到螢幕任何位置，不會拖出視窗範圍。

---

## 授權條款

本專案採用 [MIT 授權](LICENSE)。

---

## 聯絡方式

- **問題回報**：[GitHub Issues](https://github.com/yourusername/QuickLinker/issues)
- **功能建議**：[GitHub Discussions](https://github.com/yourusername/QuickLinker/discussions)

---

## 更新日誌

### v3.3.3 (2025-11-29)
- ✨ 改進浮動視窗拖曳功能（可全屏拖曳）
- 🐛 修復拖曳後無法釋放的問題

### v3.3.2 (2025-11-29)
- ✨ 新增 FC2PPVDB 自動偵測支持

### v3.3.1 (2025-11-29)
- 🎨 簡化右鍵選單為單層結構

### v3.3.0 (2025-11-29)
- ✨ JavDB 和 JavLibrary 寫死自動啟用

### v3.2.0 (2025-11-29)
- ✨ 簡化規則系統 + 新增自動關閉原始分頁功能
- 🗑️ 移除進階規則配置入口（暫停開發）

---

**Made with ❤️ by Claude Code**
