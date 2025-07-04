// =============================================
// 右鍵選單管理 (Context Menu Management)
// =============================================

function createContextMenu(settings) {
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
      // Create a parent context menu item for each site
      chrome.contextMenus.create({
        id: site.id,
        parentId: "parent",
        title: site.name,
        contexts: ["selection"]
      });

      // Create sub-menu items for each version of the site
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
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Check if the clicked item is a version of a site
  if (info.menuItemId.includes('_')) {
    const [siteId, versionId] = info.menuItemId.split('_');
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || [];
      const site = settings.find(s => s.id === siteId);
      if (site && info.selectionText) {
        const version = site.versions.find(v => v.id === versionId);
        if (version) {
          const url = version.baseUrl.replace('{}', encodeURIComponent(info.selectionText));
          chrome.tabs.create({ url });
        }
      }
    });
  }
});


// =============================================
// 擴充功能生命週期事件 (Extension Lifecycle Events)
// =============================================

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    let settings = result.settings || [];
    let updated = false;

    const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    const defaultSites = [
      {
        id: generateUniqueId(),
        name: 'Missav',
        versions: [
          { id: generateUniqueId(), name: '預設', baseUrl: 'https://missav.ws/ja/{}' }
        ]
      },
      {
        id: generateUniqueId(),
        name: 'JABLE',
        versions: [
          { id: generateUniqueId(), name: '預設', baseUrl: 'https://jable.tv/videos/{}/' }
        ]
      },
      {
        id: generateUniqueId(),
        name: 'JavDB',
        versions: [
          { id: generateUniqueId(), name: '預設', baseUrl: 'https://javdb.com/v/{}' }
        ]
      }
    ];

    defaultSites.forEach(defaultSite => {
      if (!settings.some(site => site.name === defaultSite.name)) {
        settings.push(defaultSite);
        updated = true;
      }
    });

    if (updated) {
      chrome.storage.sync.set({ settings }, () => {
        createContextMenu(settings);
      });
    } else {
      createContextMenu(settings);
    }
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    createContextMenu(changes.settings.newValue);
  }
});


// =============================================
// 訊息監聽 (Message Listener)
// =============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 來自 popup.js 的請求，手動更新右鍵選單
  if (message.action === 'updateContextMenu') {
    chrome.storage.sync.get(['settings'], (result) => {
      createContextMenu(result.settings || []);
    });
    return; // No async response needed
  }

  // 來自 content.js 的智慧掃描請求
  if (message.action === 'checkUrls') {
    (async () => {
      const { settings, scanMode } = await chrome.storage.sync.get(['settings', 'scanMode']);
      const code = message.code; // Directly receive the code

      const results = [];

      for (const site of settings) {
        for (const version of site.versions) {
          const fullUrl = version.baseUrl.replace('{}', code);
          const urlInfo = { id: `${site.id}_${version.id}`, url: fullUrl, siteName: `${site.name} - ${version.name}` };

          try {
            const response = await fetch(fullUrl, { method: 'HEAD', cache: 'no-cache' });
            if (response.status === 404) {
              results.push({ ...urlInfo, status: 'unavailable' });
            } else {
              results.push({ ...urlInfo, status: 'available', finalUrl: response.url });
              if (scanMode === 'bestMatch') {
                sendResponse({ results });
                return; // Stop and send response immediately for bestMatch
              }
            }
          } catch (error) {
            results.push({ ...urlInfo, status: 'error', error: error.message });
          }
        }
      }
      sendResponse({ results });
    })();
    return true; // Keep message channel open for async response
  }
});