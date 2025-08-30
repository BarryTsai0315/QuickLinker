// background.test.js
// 假設 background.js 的內容被包裝在一個模組中，或者直接在測試中引入
// 如果 background.js 沒有導出任何東西，你需要將其內容複製到測試檔案中，或者使用工具來處理
// 這裡我將假設你可以將 background.js 的相關函式導出或在測試中直接定義

// 為了測試，我們需要將 background.js 中的函式暴露出來
// 假設 background.js 像這樣：
/*
// background.js
function createContextMenu(settings) { ... }
// ... 其他函式和事件監聽器 ...
*/

// 由於 background.js 沒有導出，我們需要手動引入或在測試中重新定義相關部分
// 這裡我們將模擬 background.js 的行為，並測試其與 chrome API 的互動

describe('background.js', () => {
  // 在每個測試前重置所有的 mock
  beforeEach(() => {
    jest.clearAllMocks();
    // 重新設置 onInstalled 和 onMessage 的 addListener，因為 clearAllMocks 會清除它們
    chrome.runtime.onInstalled.addListener = jest.fn();
    chrome.runtime.onMessage.addListener = jest.fn();
    chrome.contextMenus.onClicked.addListener = jest.fn();
    chrome.storage.onChanged.addListener = jest.fn();

    // 重新設置 get 的 mock 實現，以確保每次測試都是乾淨的狀態
    chrome.storage.sync.get.mockImplementation((keys, cb) => {
      const mockData = {
        settings: [
          { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          { id: 'site2', name: 'Test Site 2', versions: [{ id: 'v2', name: 'Default', baseUrl: 'https://test.com/{}' }] },
        ],
        scanMode: 'bestMatch',
      };
      if (typeof keys === 'string') {
        cb({ [keys]: mockData[keys] });
      } else if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(key => {
          if (mockData[key]) result[key] = mockData[key];
        });
        cb(result);
      } else {
        cb(mockData);
      }
    });
  });

  // 模擬 createContextMenu 函式 (從 background.js 複製過來)
  const createContextMenu = (settings) => {
    chrome.contextMenus.removeAll(() => {
      if (!Array.isArray(settings) || settings.length === 0) {
        return;
      }
      chrome.contextMenus.create({
        id: "parent",
        title: "使用「%s」搜尋",
        contexts: ["selection"]
      });

      settings.forEach(site => {
        chrome.contextMenus.create({
          id: site.id,
          parentId: "parent",
          title: site.name,
          contexts: ["selection"]
        });

        if (Array.isArray(site.versions)) {
          site.versions.forEach(version => {
            chrome.contextMenus.create({
              id: `${site.id}_${version.id}`,
              parentId: site.id,
              title: version.name,
              contexts: ["selection"]
            });
          });
        }
      });
    });
  };

  // 模擬 generateUniqueId 函式 (從 background.js 複製過來)
  const generateUniqueId = () => 'mockId'; // 為了測試穩定性，固定 ID

  describe('createContextMenu', () => {
    it('should remove all existing context menus', () => {
      createContextMenu([]);
      expect(chrome.contextMenus.removeAll).toHaveBeenCalledTimes(1);
    });

    it('should not create menus if settings are empty', () => {
      createContextMenu([]);
      expect(chrome.contextMenus.create).not.toHaveBeenCalled();
    });

    it('should create parent menu and site menus with versions', () => {
      const settings = [
        { id: 'siteA', name: 'Site A', versions: [{ id: 'vA1', name: 'Version A1', baseUrl: 'urlA1' }] },
        { id: 'siteB', name: 'Site B', versions: [{ id: 'vB1', name: 'Version B1', baseUrl: 'urlB1' }] },
      ];
      createContextMenu(settings);

      expect(chrome.contextMenus.create).toHaveBeenCalledWith({
        id: "parent",
        title: "使用「%s」搜尋",
        contexts: ["selection"]
      });
      expect(chrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'siteA',
        parentId: 'parent',
        title: 'Site A',
        contexts: ['selection']
      });
      expect(chrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'siteA_vA1',
        parentId: 'siteA',
        title: 'Version A1',
        contexts: ['selection']
      });
      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(1 + settings.length + settings[0].versions.length + settings[1].versions.length); // Parent + 2 sites + 2 versions
    });
  });

  describe('chrome.contextMenus.onClicked listener', () => {
    let onClickedCallback;

    beforeEach(() => {
      // 獲取 addListener 傳入的回調函式
      chrome.contextMenus.onClicked.addListener.mockImplementationOnce((cb) => {
        onClickedCallback = cb;
      });
      // 為了讓測試能夠觸發這個監聽器，我們需要重新執行 background.js 的初始化邏輯
      // 這裡我們假設 background.js 在啟動時會註冊這個監聽器
      // 由於我們無法直接執行 background.js，我們將手動調用 addListener
      // 實際應用中，你可能需要一個更複雜的測試設定來載入擴充功能
      // 這裡我們直接模擬監聽器被註冊
      chrome.contextMenus.onClicked.addListener(() => {}); // 模擬註冊
    });

    it('should open a new tab with the correct URL when a version is clicked', async () => {
      const info = {
        menuItemId: 'site1_v1',
        selectionText: 'test_query',
      };
      const tab = {};

      // 模擬 chrome.storage.sync.get 返回預期的 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          ],
        });
      });

      // 手動觸發 onClicked 回調
      await onClickedCallback(info, tab);

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['settings'], expect.any(Function));
      expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com/test_query' });
    });

    it('should not open a new tab if selectionText is missing', async () => {
      const info = {
        menuItemId: 'site1_v1',
        selectionText: '', // Missing selection text
      };
      const tab = {};

      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          ],
        });
      });

      await onClickedCallback(info, tab);
      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });
  });

  describe('chrome.runtime.onInstalled listener', () => {
    let onInstalledCallback;

    beforeEach(() => {
      chrome.runtime.onInstalled.addListener.mockImplementationOnce((cb) => {
        onInstalledCallback = cb;
      });
      // 模擬註冊
      chrome.runtime.onInstalled.addListener(() => {});
    });

    it('should initialize default settings if none exist', async () => {
      // 模擬 storage 中沒有 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => cb({ settings: [] }));

      // 模擬 createContextMenu
      const mockCreateContextMenu = jest.fn();
      // 為了測試，我們需要將 createContextMenu 替換為 mock
      // 這裡我們直接在測試中定義一個同名的 mock 函式
      const createContextMenu = mockCreateContextMenu;

      await onInstalledCallback();

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['settings'], expect.any(Function));
      expect(chrome.storage.sync.set).toHaveBeenCalledTimes(1);
      expect(chrome.storage.sync.set.mock.calls[0][0].settings.length).toBeGreaterThan(0); // 應該有預設設定
      expect(mockCreateContextMenu).toHaveBeenCalledTimes(1);
      expect(mockCreateContextMenu.mock.calls[0][0].length).toBeGreaterThan(0);
    });

    it('should not add default settings if they already exist', async () => {
      // 模擬 storage 中已有預設 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => cb({
        settings: [
          { id: 'mockId', name: 'Missav', versions: [{ id: 'mockId', name: '預設', baseUrl: 'https://missav.ws/ja/{}' }] }
        ]
      }));

      const mockCreateContextMenu = jest.fn();
      const createContextMenu = mockCreateContextMenu;

      await onInstalledCallback();

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['settings'], expect.any(Function));
      expect(chrome.storage.sync.set).not.toHaveBeenCalled(); // 不應該再次設置
      expect(mockCreateContextMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('chrome.storage.onChanged listener', () => {
    let onChangedCallback;

    beforeEach(() => {
      chrome.storage.onChanged.addListener.mockImplementationOnce((cb) => {
        onChangedCallback = cb;
      });
      chrome.storage.onChanged.addListener(() => {});
    });

    it('should update context menu when settings change', () => {
      const newSettings = [{ id: 'newSite', name: 'New Site', versions: [] }];
      const changes = {
        settings: {
          oldValue: [],
          newValue: newSettings,
        },
      };
      const namespace = 'sync';

      const mockCreateContextMenu = jest.fn();
      const createContextMenu = mockCreateContextMenu;

      onChangedCallback(changes, namespace);

      expect(mockCreateContextMenu).toHaveBeenCalledWith(newSettings);
    });
  });

  describe('chrome.runtime.onMessage listener', () => {
    let onMessageCallback;

    beforeEach(() => {
      chrome.runtime.onMessage.addListener.mockImplementationOnce((cb) => {
        onMessageCallback = cb;
      });
      chrome.runtime.onMessage.addListener(() => {});
    });

    it('should update context menu for "updateContextMenu" action', async () => {
      const message = { action: 'updateContextMenu' };
      const sender = {};
      const sendResponse = jest.fn();

      const mockCreateContextMenu = jest.fn();
      const createContextMenu = mockCreateContextMenu;

      // 模擬 storage.sync.get 返回 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({ settings: [{ id: 's1', name: 'Site 1', versions: [] }] });
      });

      await onMessageCallback(message, sender, sendResponse);

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['settings'], expect.any(Function));
      expect(mockCreateContextMenu).toHaveBeenCalledWith([{ id: 's1', name: 'Site 1', versions: [] }]);
      expect(sendResponse).not.toHaveBeenCalled(); // No async response needed
    });

    it('should check URLs for "checkUrls" action and send response', async () => {
      const message = { action: 'checkUrls', code: 'TESTCODE' };
      const sender = {};
      const sendResponse = jest.fn();

      // 模擬 fetch 成功
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          url: 'https://example.com/final',
          json: () => Promise.resolve({}),
        })
      );

      // 模擬 storage.sync.get 返回 settings 和 scanMode
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          ],
          scanMode: 'all', // 測試 'all' 模式
        });
      });

      const result = await onMessageCallback(message, sender, sendResponse);

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['settings', 'scanMode']);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/TESTCODE', expect.any(Object));
      expect(sendResponse).toHaveBeenCalledTimes(1);
      expect(sendResponse.mock.calls[0][0].results[0].status).toBe('available');
      expect(result).toBe(true); // Keep message channel open
    });

    it('should handle 404 status for "checkUrls" action', async () => {
      const message = { action: 'checkUrls', code: 'NOTFOUND' };
      const sender = {};
      const sendResponse = jest.fn();

      // 模擬 fetch 返回 404
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          status: 404,
          url: 'https://example.com/404',
          json: () => Promise.resolve({}),
        })
      );

      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          ],
          scanMode: 'all',
        });
      });

      await onMessageCallback(message, sender, sendResponse);

      expect(sendResponse.mock.calls[0][0].results[0].status).toBe('unavailable');
    });

    it('should handle fetch errors for "checkUrls" action', async () => {
      const message = { action: 'checkUrls', code: 'ERROR' };
      const sender = {};
      const sendResponse = jest.fn();

      // 模擬 fetch 拋出錯誤
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
          ],
          scanMode: 'all',
        });
      });

      await onMessageCallback(message, sender, sendResponse);

      expect(sendResponse.mock.calls[0][0].results[0].status).toBe('error');
      expect(sendResponse.mock.calls[0][0].results[0].error).toBe('Network error');
    });

    it('should stop scanning for "bestMatch" mode after first available result', async () => {
      const message = { action: 'checkUrls', code: 'BESTMATCH' };
      const sender = {};
      const sendResponse = jest.fn();

      // 模擬第一個 fetch 成功，第二個 fetch 不會被調用
      global.fetch
        .mockImplementationOnce(() =>
          Promise.resolve({
            status: 200,
            url: 'https://example.com/final1',
            json: () => Promise.resolve({}),
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            status: 200,
            url: 'https://example.com/final2',
            json: () => Promise.resolve({}),
          })
        );

      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => {
        cb({
          settings: [
            { id: 'site1', name: 'Test Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'https://example.com/{}' }] },
            { id: 'site2', name: 'Test Site 2', versions: [{ id: 'v2', name: 'Default', baseUrl: 'https://test.com/{}' }] },
          ],
          scanMode: 'bestMatch', // 測試 'bestMatch' 模式
        });
      });

      await onMessageCallback(message, sender, sendResponse);

      expect(global.fetch).toHaveBeenCalledTimes(1); // 只調用了一次 fetch
      expect(sendResponse).toHaveBeenCalledTimes(1);
      expect(sendResponse.mock.calls[0][0].results.length).toBe(1); // 只返回一個結果
      expect(sendResponse.mock.calls[0][0].results[0].status).toBe('available');
    });
  });
});
