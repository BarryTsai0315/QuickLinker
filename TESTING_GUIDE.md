# QuickLinker 規則系統測試指南

## 測試環境準備

### Step 1: 重新載入擴充功能

1. 開啟 Chrome 並進入 `chrome://extensions`
2. 啟用「開發者模式」（右上角）
3. 找到 QuickLinker 擴充功能
4. 點擊「重新載入」按鈕（🔄）

### Step 2: 開啟開發者工具

由於我們加入了 console.log 調試訊息，建議開啟 Console 監控：

1. 按 F12 開啟開發者工具
2. 切換到「Console」標籤
3. 過濾訊息：輸入 `QuickLinker` 只顯示相關日誌

---

## 測試案例 1: GitHub Issue 檢索（正則表達式）

### 設定規則

1. 點擊 QuickLinker 擴充功能圖示
2. 切換到「網站管理」標籤
3. 點擊「進階規則配置」按鈕
4. 點擊「+ 新增規則」
5. 填寫表單：
   - **觸發網域**: `github.com`
   - **規則名稱**: `GitHub Issue 檢索`
   - **提取規則**:
     - 類型: `正則表達式`
     - 規則: `#(\d+)`
     - 轉換方式: `match_1`
   - **關聯網站**: 選擇任意 2-3 個網站（例如：Missav、JABLE）
6. 點擊「儲存」

### 執行測試

1. 開啟任意 GitHub Issue 頁面，例如：
   - `https://github.com/microsoft/vscode/issues/12345`
   - `https://github.com/facebook/react/issues/99999`

2. 觀察 Console 輸出（應該看到）：
   ```
   [QuickLinker] Loaded domain rules: [...]
   [QuickLinker] Current domain: github.com
   [QuickLinker] Matched rule: {...}
   [QuickLinker] Testing extractor: {type: 'regex', pattern: '#(\d+)', ...}
   [QuickLinker] Extraction successful: 12345
   [QuickLinker] Using rule-based extraction
   [QuickLinker] Using new format with limitedSites: [...]
   [QuickLinker] Checking URLs for code: 12345
   ```

3. 觀察頁面右下角：
   - ✅ 應該出現藍色浮動按鈕（+）
   - ✅ 點擊展開後，只顯示你選擇的 2-3 個網站按鈕
   - ✅ 按鈕顯示載入狀態（黃色邊框）
   - ✅ 檢查完成後顯示結果（綠色=可用、紅色=不可用）

### 預期結果

- ✅ **規則匹配成功**：Console 顯示「Matched rule」
- ✅ **提取成功**：從 URL 或頁面內容提取到 Issue 號碼
- ✅ **限定網站生效**：只檢查規則指定的網站
- ✅ **UI 正常顯示**：浮動按鈕出現並可點擊

---

## 測試案例 2: CSS 選擇器提取

### 設定規則

1. 在規則配置頁面新增規則：
   - **觸發網域**: `javdb.com`
   - **規則名稱**: `JavDB 番號提取`
   - **提取規則**:
     - 類型: `CSS 選擇器`
     - 規則: `.copy-to-clipboard`
     - 轉換方式: `data-clipboard-text`
   - **關聯網站**: 選擇 Missav、JABLE

### 執行測試

1. 開啟任意 JavDB 頁面（如果網站存在）
2. 觀察 Console 是否顯示選擇器提取邏輯
3. 確認浮動按鈕只顯示 Missav 和 JABLE

---

## 測試案例 3: 備用邏輯（向下相容）

### 測試目的

驗證當沒有規則匹配時，系統會自動使用舊邏輯。

### 執行測試

1. **刪除所有規則**（或暫時停用）
2. 開啟 `javdb.com` 網站
3. 觀察 Console：
   ```
   [QuickLinker] No matching rule found
   [QuickLinker] Using legacy extraction: ABC-123
   ```
4. 確認浮動按鈕仍然出現
5. 確認所有網站都被檢查（不受限定）

### 預期結果

- ✅ 舊邏輯正常運作
- ✅ 不破壞現有功能

---

## 測試案例 4: 規則啟用/停用

### 執行測試

1. 新增一條規則並保存
2. 開啟對應網站，確認規則生效
3. 回到規則配置頁面，點擊 Toggle 開關停用規則
4. 重新整理測試網頁
5. 觀察是否使用備用邏輯

### 預期結果

- ✅ 停用規則後不再匹配
- ✅ 自動降級到備用邏輯

---

## 測試案例 5: Storage 同步

### 執行測試

1. 開啟測試網頁（例如 GitHub Issue）
2. 保持網頁開啟，切換到規則配置頁面
3. 修改規則（例如更改關聯網站）
4. 保存後切回測試網頁
5. 觀察浮動按鈕是否自動更新（無需重新整理頁面）

### 預期結果

- ✅ 修改規則後立即生效
- ✅ Console 顯示「清除規則快取」
- ✅ 按鈕列表自動更新

---

## 常見問題排查

### 問題 1: 浮動按鈕沒有出現

**檢查項目**：
1. Console 是否顯示「No matching rule found」？
   - 是 → 檢查網域拼寫是否正確
   - 否 → 檢查規則是否啟用

2. Console 是否顯示「Extraction successful」？
   - 否 → 檢查提取規則（CSS 選擇器或正則）是否正確

3. 檢查是否有 JavaScript 錯誤

### 問題 2: 按鈕一直顯示載入狀態

**檢查項目**：
1. Console 是否顯示「Checking URLs for code」？
2. background.js 的 Console 是否有錯誤？
   - 進入 `chrome://extensions`
   - 點擊 QuickLinker 的「Service Worker」查看 Console

### 問題 3: 規則匹配了但提取失敗

**檢查項目**：
1. CSS 選擇器：
   - 開啟開發者工具 Elements 標籤
   - 使用 `Ctrl+F` 搜尋你的選擇器
   - 確認元素存在

2. 正則表達式：
   - 檢查正則語法是否正確
   - 使用 regex101.com 測試

---

## 效能驗證

### 檢查項目

1. **規則快取生效**：
   - 第一次載入頁面：Console 顯示「Loaded domain rules」
   - 後續操作：不再重複載入（除非 storage 變更）

2. **網站過濾生效**：
   - 規則指定 2 個網站時，background.js 只檢查 2 個
   - Console 顯示「Skipping site」訊息

3. **記憶體洩漏**：
   - 開啟 10 個測試頁面
   - 檢查 Chrome 任務管理器（Shift+Esc）
   - 記憶體使用應保持穩定

---

## 測試完成檢查清單

- [ ] GitHub Issue 檢索測試通過
- [ ] CSS 選擇器提取測試通過
- [ ] 備用邏輯測試通過
- [ ] 規則啟用/停用測試通過
- [ ] Storage 同步測試通過
- [ ] Console 無錯誤訊息
- [ ] 記憶體使用正常

---

## 回報測試結果

測試完成後，請回報以下資訊：

1. **通過的測試案例**：[列出編號]
2. **失敗的測試案例**：[列出編號 + 錯誤訊息]
3. **Console 截圖**：[如果有錯誤]
4. **特殊發現**：[任何意外行為]

---

**測試指南版本**: v1.0  
**最後更新**: 2025-11-27
