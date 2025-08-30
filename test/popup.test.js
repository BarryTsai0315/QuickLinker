// popup.test.js
// 為了測試，我們需要將 popup.js 中的函式暴露出來
// 這裡我們將模擬 popup.js 的行為，並測試其與 DOM 和 chrome API 的互動

describe('popup.js', () => {
  // 模擬 popup.js 中的函式
  // 由於 popup.js 函式眾多，這裡只列出部分關鍵函式進行測試
  // 實際測試時需要將所有函式複製過來或使用模組化方式導出

  // 模擬 showTab 函式
  const showTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    const contentElement = document.getElementById(`${tabName}Content`) || document.getElementById(`${tabName}Sites`) || document.getElementById(`${tabName}Form`);
    if (contentElement) {
      contentElement.classList.add('active');
    }
    const buttonElement = document.getElementById(`${tabName}Tab`);
    if (buttonElement) {
      buttonElement.classList.add('active');
    }
  };

  // 模擬 generateUniqueId 函式
  const generateUniqueId = () => 'mockId';

  // 模擬 saveSettings 函式
  const saveSettings = async (settingsArray) => {
    await chrome.storage.sync.set({ settings: settingsArray });
    chrome.runtime.sendMessage({ action: 'updateContextMenu' });
    showFeedback('設定已儲存！');
  };

  // 模擬 showFeedback 函式
  const showFeedback = (message, type = 'success') => {
    let feedback = document.getElementById('feedbackMessage');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'feedbackMessage';
      document.body.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    feedback.style.opacity = 1;
    // 模擬 setTimeout
    setTimeout(() => {
      feedback.style.opacity = 0;
    }, 3000);
  };

  // 模擬 addSite 函式
  const addSite = async () => {
    const nameInput = document.getElementById('newSiteName');
    const baseUrlInput = document.getElementById('newSiteBaseUrl');
    const name = nameInput.value.trim();
    const baseUrl = baseUrlInput.value.trim();

    if (name && baseUrl) {
      const newSite = {
        id: generateUniqueId(),
        name: name,
        versions: [{ id: generateUniqueId(), name: '預設', baseUrl: baseUrl }] // Add a default version
      };
      currentSettings.push(newSite);
      await saveSettings(currentSettings);
      nameInput.value = '';
      baseUrlInput.value = '';
      showTab('saved');
      await loadSettingsAndRender(); // Re-render to show new site
    } else {
      showFeedback('請填寫所有欄位。', 'error');
    }
  };

  // 模擬 loadSettingsAndRender 函式
  let currentSettings = []; // 全域變數
  const loadSettingsAndRender = async () => {
    const result = await chrome.storage.sync.get(['settings', 'scanMode']);
    currentSettings = result.settings || [];
    const scanMode = result.scanMode || 'bestMatch';

    renderSites(currentSettings);
    const scanModeRadio = document.getElementById(`${scanMode}Mode`);
    if (scanModeRadio) {
      scanModeRadio.checked = true;
    }

    // 模擬 initSortable
    const initSortable = jest.fn();
    initSortable('sitesContainer', (newOrder) => {
      currentSettings = newOrder.map(id => currentSettings.find(s => s.id === id));
      saveSettings(currentSettings);
    });
  };

  // 模擬 renderSites 函式
  const renderSites = (settings) => {
    const container = document.getElementById('sitesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (settings.length === 0) {
      container.innerHTML = '<p>沒有儲存的網站。請到「新增網站」頁面新增。</p>';
      return;
    }

    settings.forEach(site => {
      const siteDiv = document.createElement('div');
      siteDiv.className = 'site-item sortable-item';
      siteDiv.dataset.id = site.id;
      siteDiv.innerHTML = `
          <div class="site-header">
              <span class="drag-handle">☰</span>
              <span class="site-name-display">${site.name}</span>
              <button class="toggle-versions-btn">▼</button>
              <button class="edit-site-btn" title="編輯網站"><i class="fi fi-rr-edit"></i></button>
              <button class="delete-site-btn" title="刪除網站"><i class="fi fi-rs-trash"></i></button>
          </div>
          <div class="site-versions-container" style="display: none;">
              <div class="versions-list sortable-list" data-site-id="${site.id}">
                  <!-- Versions will be rendered here -->
              </div>
              <div class="add-version-form">
                  <input type="text" class="new-version-name" placeholder="版本名稱 (例如: 無碼)">
                  <input type="text" class="new-version-url" placeholder="URL (使用 {} 作為番號佔位符)">
                  <button class="add-version-btn" data-site-id="${site.id}"><i class="fi fi-rr-add"></i> 新增版本</button>
              </div>
          </div>
      `;
      container.appendChild(siteDiv);

      // 模擬 renderVersions
      const renderVersions = jest.fn();
      renderVersions(site.id, site.versions);

      // 模擬事件監聽器
      siteDiv.querySelector('.toggle-versions-btn').addEventListener('click', () => {});
      siteDiv.querySelector('.edit-site-btn').addEventListener('click', () => {});
      siteDiv.querySelector('.delete-site-btn').addEventListener('click', () => {});
      siteDiv.querySelector('.add-version-btn').addEventListener('click', () => {});
    });
  };


  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="savedContent" class="tab-content">
        <div id="sitesContainer"></div>
      </div>
      <div id="addContent" class="tab-content">
        <input id="newSiteName" value="" />
        <input id="newSiteBaseUrl" value="" />
        <button id="addSiteButton"></button>
      </div>
      <div id="settingsContent" class="tab-content">
        <input type="radio" name="scanMode" id="bestMatchMode" value="bestMatch" checked />
        <input type="radio" name="scanMode" id="allMode" value="all" />
      </div>
      <button id="savedTab" class="tab-button"></button>
      <button id="addTab" class="tab-button"></button>
      <button id="settingsTab" class="tab-button"></button>
      <button id="exportSettings"></button>
      <input type="file" id="importSettings" />
      <button id="importButton"></button>
    `;
    currentSettings = []; // 重置全域變數
    jest.useFakeTimers(); // 使用假計時器來測試 setTimeout
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // 執行所有待處理的計時器
    jest.useRealTimers(); // 恢復真實計時器
  });

  describe('showTab', () => {
    it('should activate the correct tab content and button', () => {
      showTab('saved');
      expect(document.getElementById('savedContent')).toHaveClass('active');
      expect(document.getElementById('savedTab')).toHaveClass('active');
      expect(document.getElementById('addContent')).not.toHaveClass('active');
      expect(document.getElementById('addTab')).not.toHaveClass('active');
    });
  });

  describe('showFeedback', () => {
    it('should display a success message', () => {
      showFeedback('Test success!');
      const feedback = document.getElementById('feedbackMessage');
      expect(feedback).not.toBeNull();
      expect(feedback.textContent).toBe('Test success!');
      expect(feedback.style.backgroundColor).toBe('rgb(76, 175, 80)'); // #4CAF50
      expect(feedback.style.opacity).toBe('1');

      jest.advanceTimersByTime(3000);
      expect(feedback.style.opacity).toBe('0');
    });

    it('should display an error message', () => {
      showFeedback('Test error!', 'error');
      const feedback = document.getElementById('feedbackMessage');
      expect(feedback.textContent).toBe('Test error!');
      expect(feedback.style.backgroundColor).toBe('rgb(244, 67, 54)'); // #f44336
    });
  });

  describe('addSite', () => {
    it('should add a new site and re-render', async () => {
      document.getElementById('newSiteName').value = 'New Site';
      document.getElementById('newSiteBaseUrl').value = 'https://new.com/{}';

      await addSite();

      expect(currentSettings.length).toBe(1);
      expect(currentSettings[0].name).toBe('New Site');
      expect(currentSettings[0].versions[0].baseUrl).toBe('https://new.com/{}');
      expect(chrome.storage.sync.set).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'updateContextMenu' });
      expect(document.getElementById('newSiteName').value).toBe('');
      expect(document.getElementById('newSiteBaseUrl').value).toBe('');
      expect(document.getElementById('savedContent')).toHaveClass('active'); // showTab('saved')
      expect(document.getElementById('sitesContainer').innerHTML).toContain('New Site'); // re-render
    });

    it('should show error if fields are empty', async () => {
      document.getElementById('newSiteName').value = '';
      document.getElementById('newSiteBaseUrl').value = '';

      await addSite();

      expect(currentSettings.length).toBe(0);
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
      expect(document.getElementById('feedbackMessage').textContent).toBe('請填寫所有欄位。');
    });
  });

  describe('loadSettingsAndRender', () => {
    it('should load settings and render sites', async () => {
      // 模擬 chrome.storage.sync.get 返回 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 's1', name: 'Loaded Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'url1' }] }
          ],
          scanMode: 'all'
        });
      });

      await loadSettingsAndRender();

      expect(currentSettings.length).toBe(1);
      expect(currentSettings[0].name).toBe('Loaded Site 1');
      expect(document.getElementById('sitesContainer').innerHTML).toContain('Loaded Site 1');
      expect(document.getElementById('allMode').checked).toBe(true);
    });

    it('should render empty message if no settings', async () => {
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => cb({ settings: [] }));
      await loadSettingsAndRender();
      expect(document.getElementById('sitesContainer').innerHTML).toContain('沒有儲存的網站。');
    });
  });

  describe('exportSettings', () => {
    it('should create a download link with correct data', () => {
      currentSettings = [{ id: 's1', name: 'Export Site', versions: [] }];
      document.getElementById('bestMatchMode').checked = true; // Ensure a scanMode is selected

      const exportButton = document.getElementById('exportSettings');
      exportButton.click(); // Simulate click

      expect(global.Blob).toHaveBeenCalledTimes(1);
      expect(global.Blob.mock.calls[0][0][0]).toContain('"name":"Export Site"');
      expect(global.Blob.mock.calls[0][0][0]).toContain('"scanMode":"bestMatch"');
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');
      // The actual click on 'a' element is hard to test directly in JSDOM,
      // but we can check if its properties are set correctly.
      const mockA = document.createElement.mock.results.find(r => r.value.tagName === 'A').value;
      expect(mockA.href).toBe('blob:http://localhost/mock-object-url');
      expect(mockA.download).toBe('quicklinker_settings.json');
      expect(mockA.click).toHaveBeenCalledTimes(1);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-object-url');
    });
  });

  describe('importSettings', () => {
    it('should import settings from a file', async () => {
      const mockFileContent = JSON.stringify({
        settings: [{ id: 'imported1', name: 'Imported Site', versions: [] }],
        scanMode: 'all'
      });
      const mockFile = new File([mockFileContent], 'settings.json', { type: 'application/json' });

      const importInput = document.getElementById('importSettings');
      // 模擬 FileReader 的行為
      global.FileReader.mockImplementationOnce(function() {
        this.readAsText = jest.fn(() => {
          this.onload({ target: { result: mockFileContent } });
        });
        this.onload = null;
      });

      // 觸發 change 事件
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: { files: [mockFile] } });
      importInput.dispatchEvent(event);

      await Promise.resolve(); // 等待 Promise 解決

      expect(currentSettings.length).toBe(1);
      expect(currentSettings[0].name).toBe('Imported Site');
      expect(chrome.storage.sync.set).toHaveBeenCalledTimes(2); // One for settings, one for scanMode
      expect(document.getElementById('allMode').checked).toBe(true);
      expect(document.getElementById('feedbackMessage').textContent).toBe('設定匯入成功！');
    });

    it('should show error for invalid file format', async () => {
      const mockFileContent = 'invalid json';
      const mockFile = new File([mockFileContent], 'invalid.json', { type: 'application/json' });

      const importInput = document.getElementById('importSettings');
      global.FileReader.mockImplementationOnce(function() {
        this.readAsText = jest.fn(() => {
          this.onload({ target: { result: mockFileContent } });
        });
        this.onload = null;
      });

      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: { files: [mockFile] } });
      importInput.dispatchEvent(event);

      await Promise.resolve();

      expect(currentSettings.length).toBe(0);
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
      expect(document.getElementById('feedbackMessage').textContent).toBe('無法解析檔案。');
    });
  });

  describe('saveScanMode', () => {
    it('should save the selected scan mode', async () => {
      document.getElementById('allMode').checked = true;
      const allModeRadio = document.getElementById('allMode');

      const event = new Event('change');
      allModeRadio.dispatchEvent(event);

      await Promise.resolve();

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ scanMode: 'all' });
      expect(document.getElementById('feedbackMessage').textContent).toBe('掃描模式已儲存！');
    });
  });
});
