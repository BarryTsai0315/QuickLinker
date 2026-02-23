# 📁 QuickLinker 檔案結構說明

## 目錄結構

```
QuickLinker/
├── 📄 manifest.json          # Chrome 擴充功能配置檔（必須在根目錄）
│
├── 🎨 前端介面檔案
│   ├── popup.html            # 設定面板的 HTML
│   ├── popup.js              # 設定面板的邏輯
│   ├── rules-config.html     # 規則配置頁面的 HTML
│   ├── rules-config.js       # 規則配置頁面的邏輯
│   ├── index.html            # 首頁（如果有）
│   ├── content.css           # 網頁內容樣式（浮動按鈕等）
│   └── content.js            # 網頁內容腳本（頁面偵測邏輯）
│
├── ⚙️ 背景服務
│   └── background.js         # 背景服務 Worker（右鍵選單、核心邏輯）
│
├── 🖼️ 圖示資源
│   └── icons/
│       ├── icon16.png        # 16x16 圖示
│       ├── icon64.png        # 64x64 圖示
│       ├── icon128.png       # 128x128 圖示
│       ├── icon256.png       # 256x256 圖示
│       └── icon512.png       # 512x512 圖示
│
└── 📚 說明文件
    ├── README.md             # 專案說明（給開發者看）
    ├── USER_GUIDE.md         # 使用手冊（給一般用戶看）
    ├── CLAUDE.md             # 開發筆記
    └── LICENSE               # 授權條款
```

---

## 📝 檔案說明

### 核心配置
- **manifest.json**: Chrome 擴充功能的設定檔，定義擴充功能的名稱、版本、權限、圖示等資訊

### 使用者介面
- **popup.html / popup.js**: 點擊工具列圖示時彈出的設定面板
- **rules-config.html / rules-config.js**: 進階規則配置頁面
- **content.css / content.js**: 注入到網頁中的樣式和腳本（浮動按鈕功能）

### 背景邏輯
- **background.js**: 背景服務 Worker，處理右鍵選單、連結檢查等核心功能

### 資源檔案
- **icons/**: 存放不同尺寸的擴充功能圖示

### 文件檔案
- **README.md**: 技術文件，給開發者看的專案說明
- **USER_GUIDE.md**: 使用手冊，給一般用戶看的簡易教學
- **LICENSE**: 開源授權條款

---

## 🎯 建議的檔案組織方式

### 目前結構
✅ **優點**：
- 結構簡單，適合小型專案
- manifest.json 在根目錄（Chrome 要求）
- 所有檔案易於查找

⚠️ **可改進**：
- HTML/JS/CSS 檔案混在一起
- 缺少明確的資料夾分類

### 建議的改進結構（可選）

```
QuickLinker/
├── manifest.json
├── background.js              # 背景服務必須在根目錄或單獨資料夾
│
├── popup/                     # 設定面板相關
│   ├── popup.html
│   └── popup.js
│
├── rules/                     # 規則配置相關
│   ├── rules-config.html
│   └── rules-config.js
│
├── content/                   # 內容腳本相關
│   ├── content.css
│   └── content.js
│
├── icons/                     # 圖示資源
│   └── ...
│
└── docs/                      # 文件資料夾
    ├── README.md
    ├── USER_GUIDE.md
    ├── CLAUDE.md
    └── LICENSE
```

⚠️ **注意**：如果要改用這個結構，需要同步修改 `manifest.json` 中的檔案路徑！

---

## 🔧 如何維護檔案結構

### 新增功能時
1. **新的頁面** → 考慮創建對應的資料夾
2. **新的樣式** → 放在對應的 CSS 檔案或創建新的
3. **新的圖示** → 統一放在 `icons/` 資料夾

### 刪除功能時
1. 刪除對應的 HTML/JS/CSS 檔案
2. 更新 `manifest.json` 移除不需要的引用
3. 檢查其他檔案是否有引用到被刪除的檔案

### 重新命名時
1. 更新 `manifest.json` 中的路徑
2. 檢查其他 JS 檔案中的 `import` 或連結
3. 測試擴充功能是否正常運作

---

**檔案結構整理完成！** ✨
