# QuickLinker 規則配置系統 - 功能規格書

## 概述

本文檔定義「規則配置系統」的完整功能需求，讓使用者可以動態設定在哪些網域觸發浮動按鈕，以及如何提取內容並連結到搜尋網站。

---

## 一、核心功能

### 1.1 規則配置頁面 (rules-config.html)

#### 入口點
- 從 `popup.html` 的「網站管理」頁籤新增「進階規則配置」按鈕
- 點擊後開啟獨立的全頁面配置介面

#### 頁面結構
```
┌─────────────────────────────────────────┐
│  Header (標題 + 說明)                    │
├─────────────────────────────────────────┤
│  Action Bar                             │
│  [新增規則] [匯入] [匯出] [返回主介面]   │
├─────────────────────────────────────────┤
│  規則列表                                │
│  ┌───────────────────────────────────┐  │
│  │ Rule Card 1 (github.com)          │  │
│  │ - 啟用/停用開關                    │  │
│  │ - 提取規則預覽                     │  │
│  │ - 關聯網站標籤                     │  │
│  │ [編輯] [刪除]                      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Rule Card 2 (amazon.com)          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 1.2 規則資料結構

```javascript
{
  "domainRules": [
    {
      "id": "rule_abc123",           // 唯一識別碼
      "domain": "github.com",         // 觸發網域
      "name": "GitHub Issue 檢索",    // 規則名稱（選填）
      "enabled": true,                // 是否啟用
      "extractors": [                 // 內容提取規則（可多組）
        {
          "type": "selector",         // 提取類型: selector | regex | clipboard | url
          "pattern": ".js-issue-title", // 提取規則
          "transform": "text"         // 轉換方式: text | href | data-* | match_1
        },
        {
          "type": "regex",
          "pattern": "#(\\d+)",
          "transform": "match_1"
        }
      ],
      "sites": [                      // 關聯網站 ID（來自 settings）
        "site_id_1_version_id_1",
        "site_id_2_version_id_1"
      ]
    }
  ]
}
```

---

## 二、UI 組件規格

### 2.1 規則卡片 (Rule Card)

#### 視覺設計
- **網域標籤**：漸層背景，顯眼標示網域名稱
- **啟用開關**：Toggle Switch，即時生效
- **提取規則列表**：
  - 顯示提取類型（帶顏色標籤）
  - 顯示提取規則（等寬字體）
  - 顯示轉換方式
- **關聯網站**：Chip 標籤顯示已連結網站
- **操作按鈕**：編輯、刪除

#### 互動行為
- Hover 時卡片高亮邊框
- 停用時整體半透明
- 刪除需二次確認

### 2.2 新增/編輯模態框 (Modal)

#### 表單欄位

**1. 觸發網域** (必填)
- 輸入框
- Placeholder: `例如: github.com, amazon.com`
- 驗證：不可為空

**2. 規則名稱** (選填)
- 輸入框
- Placeholder: `例如: GitHub Issue 檢索`

**3. 內容提取規則** (必填，可多組)
- 動態表單，支援新增/刪除多行
- 每行包含：
  - **提取類型**（下拉選單）：
    - `CSS 選擇器` - 使用 `document.querySelector()`
    - `正則表達式` - 使用 `RegExp.match()`
    - `剪貼簿` - 讀取剪貼簿內容
    - `URL` - 使用當前頁面 URL
  - **提取規則**（文字輸入）：
    - CSS 選擇器範例：`.js-issue-title`, `#productTitle`
    - 正則範例：`#(\d+)`, `([A-Z]{2,4}-\d{2,5})`
  - **轉換方式**（文字輸入）：
    - `text` - 提取文字內容
    - `href` - 提取連結
    - `data-*` - 提取 data 屬性
    - `match_1` - 正則捕獲組第一組
  - **刪除按鈕**

**4. 關聯搜尋網站** (必填)
- 多選下拉框
- 選項來自 `chrome.storage.sync.settings`
- 顯示格式：`網站名稱 - 版本名稱`
- 已選數量提示：`已選擇 3 個網站`

**5. JSON 預覽**
- 即時顯示當前表單生成的 JSON 結構
- 幫助使用者理解資料格式

#### 驗證規則
- 網域不可為空
- 至少有一條提取規則
- 至少選擇一個關聯網站
- 提取規則的 `pattern` 不可為空

---

## 三、功能流程

### 3.1 新增規則流程

```
使用者點擊「新增規則」
  ↓
開啟空白表單模態框
  ↓
輸入網域（例如: github.com）
  ↓
新增提取規則
  - 選擇類型: CSS 選擇器
  - 輸入規則: .js-issue-title
  - 轉換方式: text
  ↓
選擇關聯網站（多選）
  - ☑ GitHub Search
  - ☑ Stack Overflow
  ↓
預覽 JSON 輸出
  ↓
點擊「儲存規則」
  ↓
驗證表單 → 儲存到 chrome.storage.sync
  ↓
關閉模態框，重新渲染規則列表
  ↓
顯示成功通知
```

### 3.2 編輯規則流程

```
點擊規則卡片的「編輯」按鈕
  ↓
載入現有規則資料到表單
  ↓
修改欄位（網域、提取規則、關聯網站）
  ↓
即時更新 JSON 預覽
  ↓
點擊「儲存規則」
  ↓
更新 domainRules 陣列中的對應項目
  ↓
儲存到 storage → 重新渲染
```

### 3.3 刪除規則流程

```
點擊「刪除」按鈕
  ↓
彈出確認對話框：「確定要刪除此規則嗎？」
  ↓
使用者確認
  ↓
從 domainRules 陣列移除該項
  ↓
儲存到 storage → 重新渲染
  ↓
顯示「規則已刪除」通知
```

### 3.4 啟用/停用規則

```
使用者切換 Toggle Switch
  ↓
即時更新 rule.enabled 屬性
  ↓
儲存到 storage
  ↓
更新卡片視覺狀態（停用時半透明）
```

---

## 四、與現有系統整合

### 4.1 修改 `content.js`

**當前邏輯（硬編碼）**：
```javascript
if (window.location.hostname.includes('javdb.com')) {
  const urlMatch = window.location.pathname.match(/\/v\/([a-zA-Z0-9-]+)/);
  if (urlMatch) return urlMatch[1];
}
```

**新邏輯（規則驅動）**：
```javascript
async function extractCodeByRules() {
  const { domainRules } = await chrome.storage.sync.get(['domainRules']);
  const currentDomain = location.hostname;

  // 找到匹配的規則
  const matchedRule = domainRules.find(rule =>
    rule.enabled && currentDomain.includes(rule.domain)
  );

  if (!matchedRule) return null;

  // 執行提取規則
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

    if (result) {
      return {
        code: result,
        sites: matchedRule.sites  // 只檢查規則中指定的網站
      };
    }
  }

  return null;
}
```

### 4.2 修改 `background.js`

**新增訊息處理**：
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkUrlsByRule') {
    (async () => {
      const { settings } = await chrome.storage.sync.get(['settings']);
      const { code, siteIds } = message;

      // 只檢查規則中指定的網站
      const filteredSettings = settings.filter(site =>
        site.versions.some(v => siteIds.includes(`${site.id}_${v.id}`))
      );

      const results = [];
      for (const site of filteredSettings) {
        for (const version of site.versions) {
          const siteId = `${site.id}_${version.id}`;
          if (!siteIds.includes(siteId)) continue;

          const fullUrl = version.baseUrl.replace('{}', code);
          // ... 執行檢查邏輯
        }
      }
      sendResponse({ results });
    })();
    return true;
  }
});
```

### 4.3 修改 `popup.html`

在「網站管理」頁籤新增按鈕：
```html
<div id="savedSites" class="tab-content active">
  <div style="margin-bottom: 16px;">
    <button class="btn btn-secondary" id="openRulesConfigBtn">
      <i class="fi fi-rr-settings-sliders"></i> 進階規則配置
    </button>
  </div>
  <div id="sitesContainer" class="sortable-list">
    <!-- 原有內容 -->
  </div>
</div>
```

**popup.js 新增事件監聽**：
```javascript
document.getElementById('openRulesConfigBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'rules-config.html' });
});
```

---

## 五、使用範例

### 範例 1: GitHub Issue 檢索

**場景**：在 GitHub Issue 頁面自動偵測 Issue 號碼

**規則配置**：
```json
{
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
  "sites": ["stackoverflow_search", "google_search"]
}
```

**執行流程**：
1. 使用者開啟 `https://github.com/microsoft/vscode/issues/12345`
2. `content.js` 檢測到網域匹配
3. 執行正則提取，得到 `12345`
4. 浮動按鈕顯示，連結到 Stack Overflow 和 Google 搜尋 `12345`

### 範例 2: Amazon 商品比價

**規則配置**：
```json
{
  "domain": "amazon.com",
  "name": "商品比價",
  "enabled": true,
  "extractors": [
    {
      "type": "selector",
      "pattern": "#productTitle",
      "transform": "text"
    }
  ],
  "sites": ["amazon_jp", "taobao_search"]
}
```

**執行流程**：
1. 使用者開啟 Amazon 商品頁
2. 提取商品標題（例如: `Sony WH-1000XM5`）
3. 浮動按鈕顯示日本 Amazon 和淘寶的搜尋連結
4. 點擊綠色按鈕跳轉比價

---

## 六、開發檢查清單

### Phase 1: 基礎實作
- [x] 建立 `rules-config.html` 頁面結構
- [x] 實作 CSS 樣式（響應式設計）
- [x] 建立 `rules-config.js` 邏輯
- [x] 實作規則 CRUD 功能
- [x] 實作多選網站下拉框
- [x] 實作 JSON 即時預覽

### Phase 2: 整合現有系統
- [ ] 修改 `content.js` 使用規則引擎
- [ ] 修改 `background.js` 支援規則過濾
- [ ] 在 `popup.html` 新增入口按鈕
- [ ] 測試規則與浮動按鈕聯動

### Phase 3: 進階功能
- [ ] 實作規則匯入/匯出
- [ ] 新增規則排序功能（拖曳）
- [ ] 新增規則測試模式（預覽提取結果）
- [ ] 新增規則範本庫

### Phase 4: 優化與文檔
- [ ] 效能優化（規則快取）
- [ ] 錯誤處理（正則表達式驗證）
- [ ] 撰寫使用者文檔
- [ ] 製作教學 GIF

---

## 七、技術細節

### 7.1 資料儲存
- 使用 `chrome.storage.sync.domainRules` 儲存規則
- 單一規則大小限制：8KB
- 總儲存空間：100KB (chrome.storage.sync 限制)

### 7.2 效能考量
- 規則匹配使用 `String.includes()` 而非正則，提升速度
- 提取規則按順序執行，找到結果立即返回
- 規則快取在 `content.js` 載入時，避免重複讀取 storage

### 7.3 安全性
- 正則表達式需驗證，防止 ReDoS 攻擊
- CSS 選擇器使用 `querySelector`，自動防護 XSS
- 使用者輸入需 `escapeHtml()` 處理

---

## 八、未來擴展

### 8.1 規則優先級
支援多條規則同時匹配時的優先順序設定

### 8.2 規則分組
將規則分組管理（例如：開發工具組、電商組、學術組）

### 8.3 條件觸發
支援更複雜的條件（例如：URL 路徑匹配、頁面停留時間）

### 8.4 雲端同步
支援跨裝置規則同步（需後端 API）

---

## 九、驗收標準

### 功能驗收
- ✅ 可新增、編輯、刪除規則
- ✅ 規則可啟用/停用
- ✅ 多選網站正常運作
- ✅ JSON 預覽即時更新
- ✅ 匯入/匯出功能正常
- ✅ 與浮動按鈕正確聯動

### UI/UX 驗收
- ✅ 響應式設計，支援手機/平板
- ✅ 所有按鈕有 hover 效果
- ✅ 表單驗證提示清晰
- ✅ 成功/錯誤通知明顯

### 效能驗收
- ✅ 規則列表渲染時間 < 100ms（50 條規則內）
- ✅ 規則匹配時間 < 10ms
- ✅ 無記憶體洩漏

---

**文件版本**: v1.0
**最後更新**: 2025-11-27
**負責人**: Claude Code
