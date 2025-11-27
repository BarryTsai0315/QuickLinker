# QuickLinker 專案現狀與未來規劃

**最後更新**: 2025-11-27
**專案版本**: v2.0.1 → v3.0.0（規劃中）

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [當前狀態](#當前狀態)
3. [已完成工作](#已完成工作)
4. [待整合功能](#待整合功能)
5. [未來規劃](#未來規劃)
6. [技術債務](#技術債務)
7. [優先級路線圖](#優先級路線圖)
8. [相關文件索引](#相關文件索引)

---

## 專案概述

### 原始定位
- **當前**：成人影片番號檢索工具
- **目標**：通用跨平台智慧連結聚合工具

### 核心功能
1. **右鍵選單搜尋**：選取文字後快速在多個網站搜尋
2. **智慧浮動按鈕**：自動偵測代碼，即時檢查網站可用性
3. **規則配置系統**（新功能）：動態設定觸發條件與提取規則

### 技術架構
- **平台**：Chrome Extension (Manifest V3)
- **語言**：HTML5, CSS3, JavaScript (ES6+)
- **儲存**：chrome.storage.sync
- **通訊**：chrome.runtime.sendMessage

---

## 當前狀態

### ✅ 運作中的功能
- [x] 右鍵選單搜尋（支援多網站、多版本）
- [x] 浮動按鈕（JavDB 等網站硬編碼觸發）
- [x] 網站管理介面（新增、編輯、刪除、排序）
- [x] 掃描模式設定（最佳結果 / 完整掃描）
- [x] 匯入/匯出設定
- [x] 即時可用性檢查（HEAD 請求）

### ⚠️ 已知問題
1. **死代碼**：`contextMenu.js`、`options.html` 未使用（參考 `CODE_ANALYSIS.md`）
2. **數據結構混亂**：舊格式與新格式共存，無遷移邏輯
3. **硬編碼邏輯**：浮動按鈕觸發條件寫死在 `content.js:12-22`
4. **async 處理**：`background.js:132-163` 混用 callback 與 async/await
5. **拖曳 bug**：`popup.js:127` 選擇器參數不一致

### 📁 檔案結構
```
QuickLinker/
├── manifest.json           # 擴充功能配置
├── background.js           # Service Worker (右鍵選單、URL 檢查)
├── content.js              # 內容腳本 (浮動按鈕)
├── content.css             # 浮動按鈕樣式
├── popup.html/js           # 設定介面
├── contextMenu.js          # ⚠️ 死代碼（待刪除）
├── options.html            # ⚠️ 死代碼（待刪除）
├── rules-config.html/js    # ✨ 新增：規則配置系統
├── icons/                  # 圖示資源
└── docs/
    ├── README.md           # 專案說明
    ├── CODE_ANALYSIS.md    # 程式碼分析報告
    ├── REFACTORING_PLAN.md # 泛化重構方案
    ├── FEATURE_SPEC.md     # 規則系統功能規格
    ├── INTEGRATION_GUIDE.md # 整合指南
    └── PROJECT_STATUS.md   # 本檔案
```

---

## 已完成工作

### Phase 1: 程式碼分析（2025-11-27）

**產出文件**：
- ✅ `CODE_ANALYSIS.md` - 完整程式碼審查報告

**關鍵發現**：
- 識別出 6 個主要問題（死代碼、數據結構、複雜度、async、無效檔案、拖曳 bug）
- 提出 5 步驟改進方案（40 分鐘可完成核心重構）
- 評分：🟡 湊合 → 目標：🟢 良好

### Phase 2: 泛化策略（2025-11-27）

**產出文件**：
- ✅ `REFACTORING_PLAN.md` - 三層次泛化方案

**核心策略**：
1. **Level 1**：重新命名與包裝（1 小時）
   - 修改預設網站清單為合法範例（GitHub、Stack Overflow、Amazon、NPM）
   - 重寫 README 使用場景
   - 修改 manifest.json 描述

2. **Level 2**：動態配置系統（4 小時）
   - 引入「網域規則」資料結構
   - 實作規則管理 UI
   - 重構提取邏輯為規則引擎

3. **Level 3**：商業化包裝（2 小時）
   - 建立預設配置模板（開發者、電商、學術）
   - 製作展示腳本
   - 準備面試 Demo

### Phase 3: 規則配置系統設計（2025-11-27）

**產出檔案**：
- ✅ `rules-config.html` - 全頁面配置介面（700+ 行）
- ✅ `rules-config.js` - 規則管理邏輯（600+ 行）
- ✅ `FEATURE_SPEC.md` - 完整功能規格書
- ✅ `INTEGRATION_GUIDE.md` - 整合步驟指南

**已實作功能**：
- [x] 規則 CRUD（新增、編輯、刪除）
- [x] 啟用/停用 Toggle
- [x] 動態提取規則編輯器（支援 CSS 選擇器、正則、剪貼簿、URL）
- [x] 多選網站下拉框
- [x] JSON 即時預覽
- [x] 匯入/匯出規則
- [x] 表單驗證
- [x] 響應式 UI 設計

**已修改檔案**：
- [x] `popup.html` - 新增「進階規則配置」按鈕
- [x] `popup.js` - 新增開啟規則頁面的事件監聽器

---

## 待整合功能

### 🔧 核心整合（必須完成）

#### 1. 修改 `content.js` 提取邏輯

**位置**：`content.js:5-23`

**狀態**：❌ 未開始

**工作內容**：
- 新增 `loadDomainRules()` - 載入並快取規則
- 新增 `extractCodeByRules()` - 規則驅動的提取引擎
- 保留 `getCodeLegacy()` - 向下相容
- 修改 `getCode()` - 統一入口
- 修改 `createFloatingButton()` - 支援新格式
- 修改 `updateFloatingButtons()` - 傳遞 limitedSites 參數

**詳細程式碼**：參考 `INTEGRATION_GUIDE.md` 第 4 步

**預估時間**：2 小時

---

#### 2. 修改 `background.js` 過濾邏輯

**位置**：`background.js:132-163`

**狀態**：❌ 未開始

**工作內容**：
- 接收 `message.limitedSites` 參數
- 過濾只檢查規則指定的網站
- 優化效能（避免無效請求）

**程式碼範例**：
```javascript
if (message.action === 'checkUrls') {
  const { code, limitedSites } = message;

  for (const site of settings) {
    for (const version of site.versions) {
      const siteVersionId = `${site.id}_${version.id}`;

      // 只檢查規則指定的網站
      if (limitedSites && !limitedSites.includes(siteVersionId)) {
        continue;
      }

      // ... 檢查邏輯
    }
  }
}
```

**預估時間**：30 分鐘

---

### 🧹 程式碼清理（建議完成）

#### 3. 刪除死代碼

**狀態**：❌ 未開始

**檔案清單**：
- `contextMenu.js` - 已被 `background.js` 取代
- `options.html` - 未在 manifest.json 聲明

**命令**：
```bash
git rm contextMenu.js options.html
git commit -m "chore: remove dead code"
```

**預估時間**：5 分鐘

---

#### 4. 資料遷移邏輯

**位置**：`background.js:63-109`

**狀態**：❌ 未開始

**工作內容**：
在 `chrome.runtime.onInstalled` 中新增：
```javascript
settings = settings.map(site => {
  if (!site.versions) {
    // 舊格式：{ name: 'JavDB', baseUrl: '...' }
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
```

**預估時間**：15 分鐘

---

### 📝 文檔更新（需要完成）

#### 5. 更新 README.md

**狀態**：❌ 未開始

**修改內容**：
- 重寫「核心功能」章節（強調規則配置）
- 新增「使用場景」（開發者、電商、學術）
- 更新截圖（包含規則配置頁面）
- 修改專案描述為「智慧連結聚合工具」

**參考**：`REFACTORING_PLAN.md` Level 1

**預估時間**：1 小時

---

#### 6. 更新 manifest.json

**狀態**：❌ 未開始

**修改內容**：
```json
{
  "name": "QuickLinker - Smart Link Aggregator",
  "description": "Intelligent cross-platform link aggregation tool for developers, researchers, and online shoppers.",
  "version": "3.0.0"
}
```

**預估時間**：5 分鐘

---

## 未來規劃

### Version 3.0.0（下一個版本）

**目標**：規則系統上線 + 泛化完成

**里程碑**：
- [x] 規則配置介面設計
- [x] 規則管理邏輯實作
- [ ] 整合到現有系統
- [ ] 預設規則範本
- [ ] 文檔更新
- [ ] 測試與除錯

**預估時間**：總計 8 小時

---

### Version 3.1.0（進階功能）

#### 功能 1: 規則測試模式

**需求**：在配置頁面直接測試提取規則

**UI 設計**：
```
┌─────────────────────────────────┐
│ 測試提取規則                     │
├─────────────────────────────────┤
│ 輸入測試 HTML:                   │
│ ┌─────────────────────────────┐ │
│ │ <div class="title">ABC-123</div>│ │
│ └─────────────────────────────┘ │
│                                  │
│ 提取規則: .title                 │
│ 轉換方式: text                   │
│                                  │
│ [執行測試]                       │
│                                  │
│ 結果: ABC-123 ✅                │
└─────────────────────────────────┘
```

**預估時間**：3 小時

---

#### 功能 2: 規則範本庫

**需求**：內建常用網站規則，一鍵匯入

**預設範本**：
1. **GitHub Issue** - `#(\d+)` 正則提取
2. **Amazon ASIN** - `[A-Z0-9]{10}` 正則提取
3. **淘寶商品** - `.tb-main-title` 選擇器提取
4. **Stack Overflow** - `.question-hyperlink` 選擇器提取
5. **NPM Package** - URL 路徑提取

**實作方式**：
- 建立 `templates/presets.json`
- 在規則配置頁面新增「範本庫」按鈕
- 彈出範本選擇對話框
- 點擊匯入自動填充表單

**預估時間**：2 小時

---

#### 功能 3: 規則優先級與分組

**需求**：
- 多條規則匹配同一網域時，按優先級執行
- 規則分組（開發工具、電商、學術）

**資料結構擴展**：
```javascript
{
  "id": "rule_001",
  "domain": "github.com",
  "priority": 10,          // 新增：優先級（數字越大越優先）
  "group": "development",  // 新增：分組
  "enabled": true,
  // ...
}
```

**UI 改動**：
- 規則卡片新增優先級標籤
- 新增「分組檢視」切換
- 支援拖曳調整優先級

**預估時間**：4 小時

---

### Version 3.2.0（商業化準備）

#### 功能 1: Chrome Web Store 上架

**準備工作**：
- [ ] 準備行銷圖片（1280x800, 640x400, 440x280）
- [ ] 撰寫商店描述（英文 + 繁體中文）
- [ ] 錄製 Demo 影片（YouTube）
- [ ] 準備隱私權政策頁面
- [ ] 開發者帳號註冊（$5 一次性費用）

**上架檢查清單**：
- [ ] 移除所有成人網站相關內容
- [ ] 檢查權限聲明合理性
- [ ] 安全性審查（CSP、XSS 防護）
- [ ] 效能優化（載入時間 < 1 秒）

**預估時間**：16 小時

---

#### 功能 2: 多語言支援（i18n）

**目標語言**：
- 繁體中文（zh-TW）
- 英文（en）
- 日文（ja）

**實作方式**：
- 使用 `chrome.i18n` API
- 建立 `_locales/` 目錄結構
- 提取所有 UI 文字到 `messages.json`

**預估時間**：6 小時

---

### Version 4.0.0（長期願景）

#### 功能 1: AI 輔助規則生成

**概念**：使用者輸入範例頁面 URL，AI 自動生成提取規則

**技術方案**：
- 整合 Claude API 或 GPT-4
- 使用者提供目標網頁和期望提取內容
- AI 分析 DOM 結構，生成 CSS 選擇器或正則

**範例對話**：
```
使用者: 我想從 GitHub Issue 頁面提取 Issue 號碼
AI: 分析中...
    建議規則:
    - 類型: 正則表達式
    - 規則: #(\d+)
    - 轉換: match_1
    [套用規則]
```

**預估時間**：20 小時

---

#### 功能 2: 規則市場（社群分享）

**概念**：使用者可以上傳/下載社群貢獻的規則

**技術架構**：
- 後端：Firebase / Supabase
- 前端：規則瀏覽頁面
- 功能：上傳、下載、評分、評論

**預估時間**：40 小時

---

## 技術債務

### 🔴 高優先級（影響功能）

| 問題 | 位置 | 影響 | 解決方案 | 預估時間 |
|------|------|------|----------|----------|
| 死代碼未清理 | `contextMenu.js`, `options.html` | 增加維護負擔 | `git rm` | 5 分鐘 |
| 資料格式不一致 | `background.js:70-92` | 舊用戶升級會崩潰 | 新增遷移邏輯 | 15 分鐘 |
| async 混用 | `background.js:132-163` | 潛在競態條件 | 統一使用 async/await | 30 分鐘 |

### 🟡 中優先級（影響品質）

| 問題 | 位置 | 影響 | 解決方案 | 預估時間 |
|------|------|------|----------|----------|
| 硬編碼邏輯 | `content.js:12-22` | 難以擴展 | 改用規則引擎 | 2 小時 |
| 拖曳 bug | `popup.js:127` | 拖曳版本可能失敗 | 統一選擇器邏輯 | 30 分鐘 |
| 無錯誤處理 | `background.js:145` | fetch 失敗無提示 | 加入 timeout 和重試 | 1 小時 |

### 🟢 低優先級（錦上添花）

| 問題 | 位置 | 影響 | 解決方案 | 預估時間 |
|------|------|------|----------|----------|
| 無測試覆蓋 | 全專案 | 難以驗證改動 | 加入 Jest 測試 | 8 小時 |
| CSS 內聯 | `popup.html` | 難以維護 | 獨立成 CSS 檔案 | 30 分鐘 |
| 無 TypeScript | 全專案 | 缺乏型別安全 | 遷移到 TS | 16 小時 |

---

## 優先級路線圖

### 🚀 明天優先工作（2025-11-28）

**目標**：完成規則系統整合，讓功能可用

#### Session 1: 核心整合（3 小時）
1. ✅ 閱讀本檔案，回顧現狀
2. ⬜ 修改 `content.js` 提取邏輯（2 小時）
   - 實作 `extractCodeByRules()`
   - 修改 `getCode()` 統一入口
   - 修改 `createFloatingButton()` 支援新格式
3. ⬜ 修改 `background.js` 過濾邏輯（30 分鐘）
4. ⬜ 測試基本功能（30 分鐘）

#### Session 2: 清理與文檔（2 小時）
5. ⬜ 刪除死代碼（5 分鐘）
6. ⬜ 新增資料遷移邏輯（15 分鐘）
7. ⬜ 更新 `manifest.json`（5 分鐘）
8. ⬜ 更新 `README.md`（1 小時）
9. ⬜ 建立測試規則（GitHub、Amazon）（30 分鐘）

---

### 📅 本週計畫（2025-11-28 ~ 2025-12-04）

**週一**：核心整合 + 清理（5 小時）

**週二**：測試與除錯（3 小時）
- 測試案例 1: GitHub Issue 檢索
- 測試案例 2: Amazon 商品比價
- 測試案例 3: 備用邏輯（向下相容）

**週三**：預設範本庫（2 小時）
- 建立 `templates/presets.json`
- 實作匯入功能

**週四**：規則測試模式（3 小時）
- UI 設計
- 測試引擎實作

**週五**：文檔完善（2 小時）
- 撰寫使用者手冊
- 製作 Demo GIF
- 準備展示腳本

**週末**：準備面試 Demo（4 小時）
- 錄製展示影片
- 準備技術問答

---

### 📅 本月計畫（2025-12）

**Week 1-2**：Version 3.0.0 完成上線
**Week 3**：規則優先級與分組功能
**Week 4**：準備 Chrome Web Store 上架資料

---

## 相關文件索引

### 核心文檔
- **README.md** - 專案說明（需更新）
- **PROJECT_STATUS.md** - 本檔案（專案現狀與規劃）

### 分析與設計
- **CODE_ANALYSIS.md** - 程式碼品質分析報告
  - 6 個致命問題
  - 5 步驟改進方案
  - Linus 式評價

- **REFACTORING_PLAN.md** - 泛化重構方案
  - Level 1: 重新包裝（1 小時）
  - Level 2: 動態配置（4 小時）
  - Level 3: 商業化（2 小時）
  - 面試展示腳本

### 功能規格
- **FEATURE_SPEC.md** - 規則配置系統功能規格書
  - 資料結構定義
  - UI 組件規格
  - 使用範例
  - 驗收標準

### 實作指南
- **INTEGRATION_GUIDE.md** - 規則系統整合步驟
  - Step-by-step 程式碼修改
  - 測試計畫
  - 部署檢查清單
  - 注意事項

### 原始文檔
- **CONTRIBUTING.md** - 貢獻指南
- **CODE_OF_CONDUCT.md** - 行為準則
- **LICENSE** - MIT 授權

---

## 快速指令

### 開發環境啟動
```bash
# 1. 開啟 Chrome 擴充功能頁面
chrome://extensions

# 2. 啟用開發者模式

# 3. 載入未封裝項目 → 選擇專案資料夾
```

### 測試流程
```bash
# 1. 載入擴充功能

# 2. 點擊擴充功能圖示 → 開啟 popup

# 3. 點擊「進階規則配置」→ 測試規則頁面

# 4. 新增測試規則：
#    - 網域: github.com
#    - 提取類型: 正則表達式
#    - 提取規則: #(\d+)
#    - 關聯網站: GitHub、Stack Overflow

# 5. 開啟 https://github.com/microsoft/vscode/issues/12345
#    → 觀察浮動按鈕是否出現
```

### Git 工作流
```bash
# 分支策略
git checkout -b feature/rule-system-integration

# 提交規範
git commit -m "feat: integrate rule-based extraction engine"
git commit -m "fix: resolve async handling in background.js"
git commit -m "docs: update README with new features"
git commit -m "chore: remove dead code"

# 合併到主分支
git checkout main
git merge feature/rule-system-integration
```

---

## 聯絡與協作

### 問題回報
- GitHub Issues: （專案上傳後填寫）
- Email: （待填寫）

### 開發者
- **主要開發**: Claude Code + 使用者
- **程式碼審查**: Linus Torvalds 哲學指導

---

## 附錄：資料結構參考

### 網站設定格式（新）
```javascript
{
  "settings": [
    {
      "id": "site_abc123",
      "name": "GitHub",
      "versions": [
        {
          "id": "version_def456",
          "name": "Issues",
          "baseUrl": "https://github.com/search?q={}&type=issues"
        },
        {
          "id": "version_ghi789",
          "name": "Repositories",
          "baseUrl": "https://github.com/search?q={}&type=repositories"
        }
      ]
    }
  ]
}
```

### 規則配置格式
```javascript
{
  "domainRules": [
    {
      "id": "rule_abc123",
      "domain": "github.com",
      "name": "GitHub Issue 檢索",
      "enabled": true,
      "extractors": [
        {
          "type": "regex",
          "pattern": "#(\\d+)",
          "transform": "match_1"
        }
      ],
      "sites": ["site_abc123_version_def456"]
    }
  ]
}
```

---

**🎯 明天開始工作時，請先閱讀本檔案的「明天優先工作」章節！**
