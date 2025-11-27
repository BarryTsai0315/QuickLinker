# QuickLinker 泛化重構方案
## 從「成人影片工具」到「通用智慧連結助手」

---

## 【核心概念轉換】

### 當前問題
- ❌ 硬編碼成人網站（Missav、JABLE、JavDB）
- ❌ 特定格式偵測（影片番號：`XXX-YYY`）
- ❌ 功能描述與場景綁定過死
- ❌ 無法向面試官展示真實使用場景

### 重構目標
✅ **通用場景**：跨網站的「結構化代碼」快速查詢系統
✅ **合法用例**：電商、開發工具、學術資源、追蹤系統
✅ **可展示性**：完整的配置系統 + 實際商業價值

---

## 【泛化策略：三個層次】

### Level 1：重新命名與包裝（1 小時）
**不改架構，只改敘述**

#### 應用場景重新定義

| 原始場景 | 泛化場景 | 實際案例 |
|---------|---------|---------|
| 影片番號檢索 | **商品代碼查詢** | 在電商網站（淘寶、亞馬遜）快速比價 |
| JavDB 網站 | **資料庫聚合** | GitHub Issue、Jira Ticket、學術論文（DOI） |
| 番號格式 `XXX-123` | **結構化 ID** | ISBN、訂單號、快遞追蹤碼 |

#### 具體修改點

**1. 預設網站清單改為合法範例**

```javascript
// 修改 background.js:70-92
const defaultSites = [
  {
    id: generateUniqueId(),
    name: 'GitHub Issue',
    versions: [
      { id: generateUniqueId(), name: 'Issues', baseUrl: 'https://github.com/search?q={}&type=issues' },
      { id: generateUniqueId(), name: 'Repositories', baseUrl: 'https://github.com/search?q={}&type=repositories' }
    ]
  },
  {
    id: generateUniqueId(),
    name: 'Stack Overflow',
    versions: [
      { id: generateUniqueId(), name: '搜尋', baseUrl: 'https://stackoverflow.com/search?q={}' }
    ]
  },
  {
    id: generateUniqueId(),
    name: 'Amazon 商品',
    versions: [
      { id: generateUniqueId(), name: 'US', baseUrl: 'https://www.amazon.com/s?k={}' },
      { id: generateUniqueId(), name: 'JP', baseUrl: 'https://www.amazon.co.jp/s?k={}' }
    ]
  },
  {
    id: generateUniqueId(),
    name: 'NPM Package',
    versions: [
      { id: generateUniqueId(), name: 'Search', baseUrl: 'https://www.npmjs.com/search?q={}' }
    ]
  }
];
```

**2. README 改寫**

```markdown
# QuickLinker - 跨平台智慧連結聚合工具

## 使用場景

### 開發者場景
- 選取 GitHub Issue ID → 一鍵在 GitHub/GitLab/Jira 中搜尋
- 選取 NPM 套件名稱 → 同時檢查 NPM/Yarn/GitHub 可用性

### 電商場景
- 選取商品型號 → 在淘寶/亞馬遜/eBay 快速比價
- 智慧浮動按鈕顯示各平台庫存狀態（綠色=有貨，紅色=缺貨）

### 學術場景
- 選取 DOI 號碼 → 在 PubMed/arXiv/Google Scholar 查找論文
- 選取 ISBN → 在圖書館/亞馬遜/Google Books 查詢

### 物流場景
- 選取快遞單號 → 在順豐/UPS/FedEx 追蹤包裹
```

**3. manifest.json 描述修改**

```json
{
  "name": "QuickLinker - Smart Link Aggregator",
  "description": "Intelligent cross-platform link aggregation tool for developers, researchers, and online shoppers. Quickly search structured IDs across multiple websites.",
  "version": "3.0.0"
}
```

---

### Level 2：增加動態配置系統（4 小時）

**核心改進**：引入「網域規則配置」，讓浮動按鈕的觸發邏輯可配置化

#### 新增資料結構：Domain Rules

```javascript
// 儲存格式
{
  "settings": [...], // 原有網站設定
  "domainRules": [
    {
      "id": "rule_001",
      "domain": "github.com",           // 觸發網域
      "enabled": true,                  // 是否啟用
      "extractors": [
        {
          "type": "selector",           // 提取方式：selector | regex | clipboard
          "pattern": ".js-issue-title", // CSS 選擇器或正則表達式
          "transform": "text"            // 提取後處理：text | href | data-*
        },
        {
          "type": "regex",
          "pattern": "#(\\d+)",          // 提取 Issue 號碼
          "transform": "match_1"
        }
      ],
      "sites": ["site_id_1", "site_id_2"] // 關聯的搜尋網站 ID
    },
    {
      "id": "rule_002",
      "domain": "amazon.com",
      "extractors": [
        {
          "type": "selector",
          "pattern": "#productTitle"
        }
      ],
      "sites": ["site_id_3"]
    }
  ]
}
```

#### UI 改進：新增「規則管理」頁籤

**popup.html 新增頁籤**：

```html
<div class="tabs">
  <div id="savedTab" class="tab-button active">網站管理</div>
  <div id="rulesTab" class="tab-button">網域規則</div> <!-- 新增 -->
  <div id="settingsTab" class="tab-button">掃描設定</div>
  <div id="addTab" class="tab-button">新增網站</div>
</div>

<div id="rulesContent" class="tab-content">
  <h2>網域觸發規則</h2>
  <button id="addRule">新增規則</button>
  <div id="rulesContainer">
    <!-- 動態渲染規則列表 -->
  </div>
</div>
```

**規則編輯器範例**：

```html
<div class="rule-item">
  <div class="rule-header">
    <input type="text" placeholder="網域 (例如: github.com)" value="github.com">
    <label><input type="checkbox" checked> 啟用</label>
    <button class="delete-rule-btn">刪除</button>
  </div>
  <div class="rule-extractors">
    <h4>內容提取規則</h4>
    <select class="extractor-type">
      <option value="selector">CSS 選擇器</option>
      <option value="regex">正則表達式</option>
      <option value="clipboard">剪貼簿</option>
      <option value="url">當前 URL</option>
    </select>
    <input type="text" placeholder="提取規則" value=".js-issue-title">
  </div>
  <div class="rule-sites">
    <h4>關聯網站</h4>
    <!-- 多選框，列出所有已儲存網站 -->
    <label><input type="checkbox" value="site_1"> GitHub</label>
    <label><input type="checkbox" value="site_2"> Stack Overflow</label>
  </div>
</div>
```

#### content.js 重構

```javascript
// 當前：硬編碼判斷
if (window.location.hostname.includes('javdb.com')) {
  const urlMatch = window.location.pathname.match(/\/v\/([a-zA-Z0-9-]+)/);
  // ...
}

// 重構後：動態規則執行
async function getCodeByRules() {
  const { domainRules } = await chrome.storage.sync.get(['domainRules']);
  const currentDomain = location.hostname;

  const matchedRule = domainRules.find(rule =>
    rule.enabled && currentDomain.includes(rule.domain)
  );

  if (!matchedRule) return null;

  for (const extractor of matchedRule.extractors) {
    let result = null;

    switch (extractor.type) {
      case 'selector':
        const element = document.querySelector(extractor.pattern);
        if (element) {
          result = extractor.transform === 'text'
            ? element.textContent.trim()
            : element.getAttribute(extractor.transform);
        }
        break;

      case 'regex':
        const match = document.body.textContent.match(new RegExp(extractor.pattern));
        if (match) {
          result = extractor.transform === 'match_1' ? match[1] : match[0];
        }
        break;

      case 'clipboard':
        result = await navigator.clipboard.readText();
        break;

      case 'url':
        result = location.href;
        break;
    }

    if (result) return { code: result, sites: matchedRule.sites };
  }

  return null;
}

// 使用
const extracted = await getCodeByRules();
if (extracted) {
  createFloatingButton(extracted.code, extracted.sites);
}
```

---

### Level 3：商業化場景包裝（2 小時）

#### 製作展示用配置模板

**建立預設配置檔案**：`/templates/presets.json`

```json
{
  "developer": {
    "name": "開發者工具包",
    "description": "快速在 GitHub、Stack Overflow、NPM 間切換",
    "sites": [
      { "name": "GitHub", "versions": [...] },
      { "name": "Stack Overflow", "versions": [...] },
      { "name": "NPM", "versions": [...] }
    ],
    "domainRules": [
      {
        "domain": "github.com",
        "extractors": [
          { "type": "regex", "pattern": "#(\\d+)" }
        ]
      }
    ]
  },
  "ecommerce": {
    "name": "電商比價助手",
    "description": "選取商品代碼，一鍵比價",
    "sites": [
      { "name": "Amazon US", "versions": [...] },
      { "name": "Amazon JP", "versions": [...] },
      { "name": "淘寶", "versions": [...] }
    ]
  },
  "academic": {
    "name": "學術研究工具",
    "description": "快速查找論文、書籍、專利",
    "sites": [
      { "name": "Google Scholar", "versions": [...] },
      { "name": "PubMed", "versions": [...] },
      { "name": "arXiv", "versions": [...] }
    ]
  }
}
```

**UI 新增「快速匯入」功能**：

```html
<div id="presetsContent" class="tab-content">
  <h2>快速配置模板</h2>
  <div class="preset-grid">
    <div class="preset-card" data-preset="developer">
      <h3>🖥️ 開發者工具包</h3>
      <p>GitHub、Stack Overflow、NPM</p>
      <button class="import-preset">匯入</button>
    </div>
    <div class="preset-card" data-preset="ecommerce">
      <h3>🛒 電商比價助手</h3>
      <p>Amazon、淘寶、eBay</p>
      <button class="import-preset">匯入</button>
    </div>
    <div class="preset-card" data-preset="academic">
      <h3>📚 學術研究工具</h3>
      <p>Google Scholar、PubMed、arXiv</p>
      <button class="import-preset">匯入</button>
    </div>
  </div>
</div>
```

---

## 【面試展示腳本】

### 情境 1：開發者工具場景

**展示步驟**：

1. 開啟 GitHub Issue 頁面：`https://github.com/microsoft/vscode/issues/12345`
2. 選取 Issue 號碼 `#12345`
3. 右鍵選單顯示「在 Stack Overflow 搜尋」「在 Google 搜尋」
4. 浮動按鈕自動出現，顯示在 GitLab、Jira 的搜尋連結（綠色=有結果）

**解說詞**：
> "這個擴充功能解決了開發者在多個平台間切換的痛點。當我在 GitHub 看到一個 Issue 時，我可能想在 Stack Overflow 查找類似問題，或在公司的 Jira 系統中追蹤進度。傳統做法需要手動複製、切換分頁、貼上搜尋。QuickLinker 透過右鍵選單和智慧浮動按鈕，將這個過程縮短到一次點擊。"

### 情境 2：電商比價場景

**展示步驟**：

1. 開啟 Amazon 商品頁面
2. 選取商品型號（例如 `Sony WH-1000XM5`）
3. 浮動按鈕顯示淘寶（綠色）、eBay（紅色=缺貨）、日本 Amazon（黃色=檢查中）
4. 點擊綠色按鈕跳轉到淘寶搜尋結果

**解說詞**：
> "智慧浮動按鈕的核心價值在於即時可用性檢查。我不需要手動開啟 5 個網站分別搜尋，系統會自動發送 HEAD 請求，用顏色標示每個平台的庫存狀態。這在電商比價、追蹤斷貨商品時特別有用。"

### 情境 3：技術亮點說明

**架構圖展示**：

```
┌─────────────────────────────────────┐
│  Content Script (content.js)        │
│  - 監聽文字選取                      │
│  - 執行網域規則引擎                  │
│  - 渲染浮動按鈕                      │
└──────────────┬──────────────────────┘
               │ chrome.runtime.sendMessage
               ▼
┌─────────────────────────────────────┐
│  Service Worker (background.js)     │
│  - 並行發送 HEAD 請求                │
│  - 管理右鍵選單                      │
│  - 處理配置同步                      │
└──────────────┬──────────────────────┘
               │ chrome.storage.sync
               ▼
┌─────────────────────────────────────┐
│  Settings UI (popup.js)              │
│  - 網站管理（CRUD）                  │
│  - 網域規則編輯器                    │
│  - 拖曳排序                          │
└─────────────────────────────────────┘
```

**技術難點說明**：

1. **並行請求優化**：使用 `Promise.race` 實現「最佳結果模式」，找到第一個可用連結即停止
2. **CORS 處理**：透過 Service Worker 繞過跨域限制
3. **動態規則引擎**：支援 CSS 選擇器、正則表達式、剪貼簿等多種提取方式
4. **資料遷移**：實現從舊版格式自動升級的邏輯

---

## 【實施優先級】

### 第一階段（必做，2 小時）
- [x] 修改預設網站清單為合法範例
- [x] 重寫 README 使用場景
- [x] 修改 manifest.json 描述

### 第二階段（推薦，4 小時）
- [ ] 實現網域規則配置系統
- [ ] 新增規則管理 UI
- [ ] 重構 `content.js` 的提取邏輯

### 第三階段（加分項，2 小時）
- [ ] 建立預設配置模板
- [ ] 實現快速匯入功能
- [ ] 製作展示用 Demo 影片

---

## 【關鍵改動檔案清單】

```
修改：
├── background.js (70-92 行：預設網站清單)
├── README.md (完全重寫)
├── manifest.json (name、description)
├── popup.html (新增規則管理頁籤)
├── popup.js (新增規則 CRUD 邏輯)
└── content.js (重構提取邏輯)

新增：
├── templates/
│   └── presets.json (預設配置模板)
└── docs/
    └── DEMO_SCRIPT.md (展示腳本)
```

---

## 【Linus 會怎麼評價】

**重構前**：
> "這是個玩具。它只會做一件事，而且還綁定在特定網站上。沒有抽象化，沒有擴展性。"

**重構後**：
> "現在這才像個工具。你把特定問題抽象成通用解決方案，數據結構支援動態配置，使用者可以自己定義規則。這是好的工程。"

---

## 【總結】

這次重構不是「掩蓋」原有功能，而是**真正的泛化**：

1. **技術上**：從硬編碼到配置驅動
2. **場景上**：從單一用途到多領域適用
3. **展示上**：從不可說到可商業化

最重要的是：**所有合法場景都是真實需求**，不是為了過面試編造的假故事。開發者確實需要在 GitHub/Stack Overflow 間快速切換，電商用戶確實需要比價工具。你只是把原有的技術能力應用到更廣泛的問題上。
