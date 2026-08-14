# 📁 QuickLinker 檔案結構說明

## 目錄結構

```
QuickLinker/
├── 📄 manifest.json              # Chrome 擴充功能配置檔（必須在根目錄）
├── 📄 README.md                  # 專案說明（給開發者看）
├── 📄 LICENSE                    # MIT 授權條款
│
├── 📦 src/                       # 擴充功能原始碼
│   ├── background/
│   │   └── background.js         # Service Worker（右鍵選單、連結檢查、分頁去重）
│   ├── content/
│   │   ├── content.js            # 內容腳本（頁面偵測、浮動按鈕）
│   │   └── content.css           # 浮動按鈕樣式
│   ├── popup/
│   │   ├── popup.html            # 工具列彈出面板
│   │   └── popup.js              # 彈出面板邏輯（含 I18N 字典與主題切換）
│   └── options/
│       ├── options.html          # 選項頁
│       └── options.js            # 選項頁邏輯（含 I18N 字典與主題切換）
│
├── 🖼️ icons/                     # 擴充功能圖示（manifest.json 引用）
│   ├── icon16.png
│   ├── icon64.png
│   ├── icon128.png
│   ├── icon256.png
│   └── icon512.png
│
└── 🌐 docs/                      # 官方網站 + 文件（GitHub Pages 發布來源）
    ├── index.html                # 官網頁面（semantic markup + data-i18n 標記）
    ├── styles.css                # 官網樣式（design token + 雙主題）
    ├── main.js                   # 官網腳本（主題、i18n、進場動畫、捲動效果）
    ├── i18n/                     # 官網翻譯字典
    │   ├── zh-TW.json            # 繁體中文（原文基準）
    │   ├── en.json               # 英文
    │   ├── ja.json               # 日文
    │   └── ko.json               # 韓文
    ├── icons/                    # 官網用圖示（必須放在 docs/ 內才會被發布）
    │   ├── icon64.png
    │   ├── icon128.png
    │   └── icon256.png
    ├── demo.mp4                  # 官網 hero 區示範影片
    ├── FILE_STRUCTURE.md         # 本文件
    ├── USER_GUIDE.md             # 使用手冊（給一般用戶看）
    └── STORE_DESC.md             # Chrome 商店描述文案
```

---

## 🌐 官方網站

網址：<https://barrytsai0315.github.io/QuickLinker/>

### 部署方式

GitHub Pages 直接以 **`master` 分支的 `/docs` 目錄**作為發布來源（legacy build，無 GitHub Actions workflow）。
**把 `docs/` 的變更 merge 進 `master` 並 push，即自動發布**，不需要任何建置步驟。

⚠️ **只有 `docs/` 內的檔案會被發布。** 根目錄的 `icons/` 不在發布範圍內，
所以官網用到的圖示必須另外複製一份到 `docs/icons/`——這正是先前 logo 與 favicon
在線上回 404 的原因。

### 本機預覽

官網會以 `fetch` 載入 `i18n/*.json`，用 `file://` 直接開啟會被 CORS 擋住
（此時頁面會退回顯示 HTML 內建的繁體中文）。預覽請起一個本機 server：

```bash
cd docs && python3 -m http.server 8000
# 然後開啟 http://localhost:8000/
# 指定語言：http://localhost:8000/?lang=ja
```

### 維護須知

- **零建置**：官網刻意不使用 package.json、bundler 或任何 CDN 依賴，所有 CSS/JS 皆為本機靜態檔。
- **改文案時要同步四支 JSON**：`docs/i18n/` 下四個語言檔的 key 必須完全一致，
  且 `zh-TW.json` 的內容需與 `index.html` 內文逐字相同（HTML 內文是 JSON 載入失敗時的 fallback）。
- **主題 token 對齊擴充功能**：`docs/styles.css` 的 `--bg / --surface / --text / --muted /
  --border / --accent` 命名刻意與 `src/options/options.html` 一致，兩邊視為同一套設計語言。

---

## 📝 檔案說明

### 核心配置
- **manifest.json**：Chrome 擴充功能設定檔，定義名稱、版本、權限、圖示與各腳本路徑

### 擴充功能
- **src/popup/**：點擊工具列圖示時彈出的面板
- **src/options/**：擴充功能選項頁（搜尋網站、掃描模式、主題、語言等設定）
- **src/content/**：注入到網頁中的樣式與腳本（頁面偵測、浮動按鈕）
- **src/background/**：Service Worker，處理右鍵選單、連結可用性檢查等核心邏輯

### 資源
- **icons/**：擴充功能圖示（由 manifest.json 引用）
- **docs/icons/**：官網圖示（由 `docs/index.html` 引用，需與上者分開維護）

### 文件
- **README.md**：技術文件，給開發者看的專案說明
- **docs/USER_GUIDE.md**：使用手冊，給一般用戶看的簡易教學
- **docs/STORE_DESC.md**：Chrome 線上應用程式商店的上架描述文案
- **LICENSE**：MIT 開源授權條款

---

## 🔧 如何維護檔案結構

### 新增功能時
1. **新的頁面** → 在 `src/` 下建立對應資料夾，並更新 `manifest.json` 路徑
2. **新的圖示** → 統一放在 `icons/`；官網若要用，另外複製到 `docs/icons/`
3. **官網新增文案** → 同步新增 `data-i18n` key 到四支 JSON

### 刪除功能時
1. 刪除對應的 HTML/JS/CSS 檔案
2. 更新 `manifest.json` 移除不需要的引用
3. 檢查其他檔案是否有引用到被刪除的檔案

### 重新命名時
1. 更新 `manifest.json` 中的路徑
2. 檢查其他 JS 檔案中的引用或連結
3. 重新載入擴充功能並實際測試
