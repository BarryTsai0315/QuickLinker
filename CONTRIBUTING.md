# 貢獻指南

我們非常歡迎您對 QuickLinker 專案的貢獻！無論是錯誤報告、功能建議、文件改進還是程式碼提交，您的參與都將幫助我們讓這個專案變得更好。

在您開始貢獻之前，請花一些時間閱讀這份指南，它將幫助您了解如何有效地參與。

## 行為準則

請務必閱讀並遵守我們的 [行為準則](CODE_OF_CONDUCT.md)。我們致力於為所有貢獻者提供一個開放和包容的環境。

## 如何報告錯誤

如果您發現了錯誤，請透過 GitHub Issues 頁面提交。

在提交錯誤報告時，請盡可能提供詳細的資訊，這將有助於我們更快地理解和解決問題：

*   **錯誤描述：** 清晰簡潔地描述您遇到的問題。
*   **重現步驟：** 提供詳細的步驟，以便我們能夠重現該錯誤。如果可能，請包含相關的程式碼片段或截圖。
*   **預期行為：** 描述您認為程式碼應該如何運作。
*   **實際行為：** 描述錯誤發生時的實際行為。
*   **環境資訊：** 您的瀏覽器版本、作業系統、QuickLinker 擴充功能的版本等。

## 如何建議新功能

如果您有新功能的想法，也歡迎透過 GitHub Issues 頁面提交。

在提交功能建議時，請說明：

*   **功能描述：** 清晰地描述您希望新增的功能。
*   **使用場景：** 說明這個功能將如何幫助使用者，以及它解決了什麼問題。
*   **潛在的實現方式：** 如果您有任何關於如何實現這個功能的想法，也可以提出。

## 如何貢獻程式碼

我們歡迎程式碼貢獻！請遵循以下步驟：

1.  **Fork 專案：** 在 GitHub 上 Fork QuickLinker 專案到您的帳戶。
2.  **Clone 倉庫：** 將您 Fork 的倉庫 Clone 到您的本地機器：
    ```bash
    git clone https://github.com/您的用戶名/QuickLinker.git
    ```
3.  **建立分支：** 為您的新功能或錯誤修復建立一個新的分支。請使用有意義的名稱（例如：`feature/add-url-validation` 或 `bugfix/context-menu-issue`）：
    ```bash
    git checkout -b your-feature-or-bugfix-branch
    ```
4.  **進行修改：** 在您的分支上進行程式碼修改。請確保您的程式碼符合專案的編碼風格。
5.  **測試：** 如果您的修改涉及到功能性變更，請確保新增或更新了相應的測試（如果專案有測試框架）。
6.  **提交變更：** 撰寫清晰的提交訊息，說明您的變更內容：
    ```bash
    git commit -m "feat: Add URL validation to popup settings"
    ```
    或
    ```bash
    git commit -m "fix: Resolve context menu display issue"
    ```
7.  **推送到您的 Fork：**
    ```bash
    git push origin your-feature-or-bugfix-branch
    ```
8.  **建立 Pull Request (PR)：** 在 GitHub 上，從您的 Fork 建立一個 Pull Request 到 QuickLinker 專案的 `main` 分支。
    *   請在 PR 描述中詳細說明您的變更，並參考相關的 Issue 編號（如果有的話）。
    *   我們的維護者將會審查您的 PR，並可能提出修改建議。

## 編碼風格

請盡量遵循專案現有的編碼風格。我們可能會使用 ESLint 或 Prettier 等工具來確保程式碼的一致性。

## 提交訊息規範

我們建議使用 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 規範來撰寫提交訊息，這有助於自動生成變更日誌。

常見的提交類型包括：

*   `feat`: 新功能
*   `fix`: 錯誤修復
*   `docs`: 文件變更
*   `style`: 不影響程式碼邏輯的格式變更 (空格、分號等)
*   `refactor`: 重構程式碼，不新增功能也不修復錯誤
*   `perf`: 性能優化
*   `test`: 新增或修改測試
*   `build`: 影響建構系統或外部依賴的變更 (例如：npm, webpack)
*   `ci`: CI 配置檔案和腳本的變更
*   `chore`: 其他不屬於上述類型的變更 (例如：更新 .gitignore)

**範例：**

```
feat: Add URL validation to site settings

This commit introduces client-side validation for URLs entered in the popup
settings to ensure they are valid HTTP/HTTPS URLs.
```

感謝您對 QuickLinker 的貢獻！
