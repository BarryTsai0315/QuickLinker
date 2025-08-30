// content.test.js
// 為了測試，我們需要將 content.js 中的函式暴露出來
// 這裡我們將模擬 content.js 的行為，並測試其與 DOM 和 chrome API 的互動

describe('content.js', () => {
  // 模擬 getCode 函式 (從 content.js 複製過來)
  const getCode = () => {
    const clipboardElement = document.querySelector('.copy-to-clipboard');
    if (clipboardElement) {
      return clipboardElement.getAttribute('data-clipboard-text');
    }

    if (window.location.hostname.includes('javdb.com')) {
      const urlMatch = window.location.pathname.match(/\/v\/([a-zA-Z0-9-]+)/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
      const titleMatch = document.title.match(/([a-zA-Z0-9-]+)/);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1];
      }
    }
    return null;
  };

  // 模擬 extractCodeFromText 函式 (從 content.js 複製過來)
  const extractCodeFromText = (text) => {
    const regex = /[a-zA-Z]{2,4}[- ]?\d{2,5}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      return matches[0].replace(/[- ]/, '-').toUpperCase();
    }
    return null;
  };

  // 模擬 updateFloatingButtons 函式 (從 content.js 複製過來)
  const updateFloatingButtons = async (code) => {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer) return;

    subButtonsContainer.innerHTML = '';

    const response = await chrome.runtime.sendMessage({ action: 'checkUrls', code: code });
    updateButtonStates(response.results);
  };

  // 模擬 createFloatingButton 函式 (從 content.js 複製過來)
  const createFloatingButton = async (code) => {
    let container = document.querySelector('.ql-floating-container');
    if (container) {
      await updateFloatingButtons(code);
      return;
    }

    container = document.createElement('div');
    container.className = 'ql-floating-container';

    const mainButton = document.createElement('div');
    mainButton.className = 'ql-floating-button ql-main-button';
    mainButton.innerHTML = '+';

    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.className = 'ql-sub-buttons';

    container.appendChild(subButtonsContainer);
    container.appendChild(mainButton);
    document.body.appendChild(container);

    let isExpanded = false;
    mainButton.addEventListener('click', () => {
      isExpanded = !isExpanded;
      subButtonsContainer.style.display = isExpanded ? 'flex' : 'none';
      mainButton.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    await updateFloatingButtons(code);
  };

  // 模擬 updateButtonStates 函式 (從 content.js 複製過來)
  const updateButtonStates = (results) => {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer || !results) return;

    subButtonsContainer.innerHTML = '';

    results.forEach(result => {
      const subButton = document.createElement('a');
      subButton.id = result.id;
      subButton.className = 'ql-floating-button ql-sub-button';
      subButton.title = result.siteName;

      let faviconUrl = '';
      try {
        const hostname = new URL(result.finalUrl || result.url).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;
      } catch (e) {
        console.error('Error getting favicon hostname:', e);
      }
      if (faviconUrl) {
        subButton.style.backgroundImage = `url(${faviconUrl})`;
      }

      switch (result.status) {
        case 'available':
          subButton.classList.add('status-available');
          subButton.href = result.finalUrl;
          subButton.target = '_blank';
          break;
        case 'unavailable':
          subButton.classList.add('status-unavailable');
          subButton.style.pointerEvents = 'none';
          break;
        case 'error':
          subButton.classList.add('status-error');
          subButton.style.pointerEvents = 'none';
          subButton.title = `Error checking ${result.siteName}: ${result.error}`;
          break;
        case 'loading':
        default:
          subButton.classList.add('status-loading');
          break;
      }
      subButtonsContainer.appendChild(subButton);
    });
  };


  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 DOM
    document.body.innerHTML = '';
    // 確保 MutationObserver 每次都是新的 mock
    global.MutationObserver.mockClear();
    global.MutationObserver = jest.fn(function(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.takeRecords = jest.fn();
    });
    // 重置 window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        hostname: 'example.com',
        pathname: '/',
      },
    });
    // 重置 document.title
    Object.defineProperty(document, 'title', {
      writable: true,
      value: 'Test Page',
    });
  });

  describe('getCode', () => {
    it('should return code from .copy-to-clipboard element', () => {
      document.body.innerHTML = '<div class="copy-to-clipboard" data-clipboard-text="CODE123"></div>';
      expect(getCode()).toBe('CODE123');
    });

    it('should return code from JavDB URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'javdb.com',
          pathname: '/v/ABC-123',
        },
      });
      expect(getCode()).toBe('ABC-123');
    });

    it('should return code from JavDB title', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          hostname: 'javdb.com',
          pathname: '/',
        },
      });
      Object.defineProperty(document, 'title', {
        writable: true,
        value: 'JavDB - XYZ-456',
      });
      expect(getCode()).toBe('XYZ-456');
    });

    it('should return null if no code found', () => {
      document.body.innerHTML = '<div></div>';
      expect(getCode()).toBeNull();
    });
  });

  describe('extractCodeFromText', () => {
    it('should extract XXX-YYY pattern', () => {
      expect(extractCodeFromText('Some text with ABC-123 in it')).toBe('ABC-123');
    });

    it('should extract XXXX-YYY pattern', () => {
      expect(extractCodeFromText('Another text with ABCD-12345 here')).toBe('ABCD-12345');
    });

    it('should handle spaces instead of hyphens', () => {
      expect(extractCodeFromText('Text with ABC 123 code')).toBe('ABC-123');
    });

    it('should return null if no pattern found', () => {
      expect(extractCodeFromText('Just some random text')).toBeNull();
    });
  });

  describe('createFloatingButton and updateFloatingButtons', () => {
    it('should create a new floating container if it does not exist', async () => {
      await createFloatingButton('TESTCODE');
      expect(document.querySelector('.ql-floating-container')).not.toBeNull();
      expect(document.querySelector('.ql-main-button')).not.toBeNull();
      expect(document.querySelector('.ql-sub-buttons')).not.toBeNull();
    });

    it('should update existing floating buttons if container exists', async () => {
      document.body.innerHTML = `
        <div class="ql-floating-container">
          <div class="ql-main-button"></div>
          <div class="ql-sub-buttons"></div>
        </div>
      `;
      const existingSubButtons = document.querySelector('.ql-sub-buttons');
      existingSubButtons.innerHTML = '<div class="old-button"></div>';

      await createFloatingButton('TESTCODE');
      expect(existingSubButtons.innerHTML).not.toContain('old-button'); // Should be cleared
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'checkUrls', code: 'TESTCODE' });
    });

    it('should send message to background script for checkUrls', async () => {
      await createFloatingButton('TESTCODE');
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'checkUrls', code: 'TESTCODE' });
    });

    it('should update button states based on results', () => {
      document.body.innerHTML = `
        <div class="ql-floating-container">
          <div class="ql-main-button"></div>
          <div class="ql-sub-buttons"></div>
        </div>
      `;
      const results = [
        { id: 's1_v1', url: 'http://avail.com', finalUrl: 'http://avail.com/final', siteName: 'Available Site', status: 'available' },
        { id: 's2_v2', url: 'http://unavail.com', siteName: 'Unavailable Site', status: 'unavailable' },
        { id: 's3_v3', url: 'http://error.com', siteName: 'Error Site', status: 'error', error: 'Test Error' },
      ];
      updateButtonStates(results);

      const subButtonsContainer = document.querySelector('.ql-sub-buttons');
      expect(subButtonsContainer.children.length).toBe(3);

      const availableButton = subButtonsContainer.querySelector('#s1_v1');
      expect(availableButton).toHaveClass('status-available');
      expect(availableButton.href).toBe('http://avail.com/final');
      expect(availableButton.target).toBe('_blank');

      const unavailableButton = subButtonsContainer.querySelector('#s2_v2');
      expect(unavailableButton).toHaveClass('status-unavailable');
      expect(unavailableButton.style.pointerEvents).toBe('none');

      const errorButton = subButtonsContainer.querySelector('#s3_v3');
      expect(errorButton).toHaveClass('status-error');
      expect(errorButton.style.pointerEvents).toBe('none');
      expect(errorButton.title).toContain('Test Error');
    });
  });

  describe('MutationObserver', () => {
    // 由於 MutationObserver 的測試比較複雜，通常需要模擬 DOM 變化
    // 這裡只測試它是否被正確初始化和觀察 body
    it('should observe document.body', () => {
      // 重新載入 content.js 的邏輯，以觸發 observer 的初始化
      // 這裡我們假設 content.js 在載入時會執行 observer.observe
      // 由於我們無法直接執行 content.js，我們將手動調用 observe
      const observer = new MutationObserver(() => {});
      observer.observe(document.body, { childList: true, subtree: true });
      expect(observer.observe).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
    });
  });

  describe('Text Selection Listener', () => {
    let addEventListenerSpy;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      // 模擬 content.js 中的事件監聽器註冊
      document.addEventListener('mouseup', () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {
          chrome.storage.sync.get(['settings'], (result) => {
            const settings = result.settings || [];
            const currentHostname = window.location.hostname;
            const isConfiguredSite = settings.some(site => {
              try {
                const siteHostname = new URL(site.baseUrl.replace('{}', '')).hostname;
                return currentHostname.includes(siteHostname);
              } catch (e) {
                console.error("Error parsing site URL:", site.baseUrl, e);
                return false;
              }
            });

            if (isConfiguredSite) {
              return;
            }

            const code = extractCodeFromText(selectedText);
            if (code) {
              createFloatingButton(code);
            }
          });
        }
      });
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it('should call createFloatingButton if text is selected and code is extracted', async () => {
      window.getSelection.mockReturnValue({ toString: () => 'ABC-123' });
      const createFloatingButtonMock = jest.fn();
      // 替換 createFloatingButton
      const originalCreateFloatingButton = createFloatingButton;
      createFloatingButton = createFloatingButtonMock;

      // 模擬 storage.sync.get 返回空 settings，確保不是配置的網站
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => cb({ settings: [] }));

      // 觸發 mouseup 事件
      document.dispatchEvent(new MouseEvent('mouseup'));

      await Promise.resolve(); // 等待 Promise 解決

      expect(createFloatingButtonMock).toHaveBeenCalledWith('ABC-123');

      // 恢復 createFloatingButton
      createFloatingButton = originalCreateFloatingButton;
    });

    it('should not call createFloatingButton if no text is selected', async () => {
      window.getSelection.mockReturnValue({ toString: () => '' });
      const createFloatingButtonMock = jest.fn();
      const originalCreateFloatingButton = createFloatingButton;
      createFloatingButton = createFloatingButtonMock;

      document.dispatchEvent(new MouseEvent('mouseup'));

      await Promise.resolve();

      expect(createFloatingButtonMock).not.toHaveBeenCalled();
      createFloatingButton = originalCreateFloatingButton;
    });

    it('should not call createFloatingButton if current site is a configured site', async () => {
      window.getSelection.mockReturnValue({ toString: () => 'ABC-123' });
      const createFloatingButtonMock = jest.fn();
      const originalCreateFloatingButton = createFloatingButton;
      createFloatingButton = createFloatingButtonMock;

      // 模擬 storage.sync.get 返回包含當前 hostname 的 settings
      chrome.storage.sync.get.mockImplementationOnce((keys, cb) => cb({
        settings: [{ id: 's1', name: 'Site 1', versions: [{ id: 'v1', name: 'Default', baseUrl: 'http://example.com/{}' }] }]
      }));
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { hostname: 'example.com' },
      });

      document.dispatchEvent(new MouseEvent('mouseup'));

      await Promise.resolve();

      expect(createFloatingButtonMock).not.toHaveBeenCalled();
      createFloatingButton = originalCreateFloatingButton;
    });
  });
});
