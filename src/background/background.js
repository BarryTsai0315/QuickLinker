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
      // 直接創建一層選單：網站名稱 - 版本名稱
      if (Array.isArray(site.versions)) {
        site.versions.forEach(version => {
          // 組合顯示名稱
          const displayName = site.versions.length > 1
            ? `${site.name} - ${version.name}`  // 多版本時顯示版本名稱
            : site.name;  // 單版本時只顯示網站名稱

          chrome.contextMenus.create({
            id: `${site.id}_${version.id}`,
            parentId: "parent",
            title: displayName,
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

chrome.runtime.onInstalled.addListener((details) => {
  const currentVersion = chrome.runtime.getManifest().version;

  if (details.reason === 'update') {
    console.log(`[QuickLinker] 擴充功能已更新: ${details.previousVersion} → ${currentVersion}`);
    chrome.storage.sync.set({
      showUpdateNotification: true,
      updateFromVersion: details.previousVersion
    });
    chrome.action.setBadgeText({ text: 'NEW' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else if (details.reason === 'install') {
    console.log('[QuickLinker] 擴充功能已安裝');
    // 首次安裝也顯示功能介紹
    chrome.storage.sync.set({
      showUpdateNotification: true,
      updateFromVersion: null
    });
    chrome.action.setBadgeText({ text: 'NEW' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  }

  chrome.storage.sync.get(['settings'], (result) => {
    let settings = result.settings || [];
    let updated = false;

    const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    // 數據遷移：舊格式轉新格式
    settings = settings.map(site => {
      if (!site.versions) {
        // 舊格式：{ name: 'JavDB', baseUrl: '...' }
        console.log('[QuickLinker] Migrating old format site:', site.name);
        updated = true;
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

    const defaultSites = [
      {
        id: generateUniqueId(),
        name: 'Missav',
        versions: [
          { id: generateUniqueId(), name: '預設', baseUrl: 'https://missav.ai/ja/{}' }
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
      const code = message.code;
      const limitedSites = message.limitedSites;

      console.log('[QuickLinker Background] Checking URLs for code:', code);
      console.log('[QuickLinker Background] Limited sites:', limitedSites);

      // 建立待檢查清單
      const tasks = [];
      for (const site of settings) {
        for (const version of site.versions) {
          const siteVersionId = `${site.id}_${version.id}`;
          if (limitedSites && !limitedSites.includes(siteVersionId)) {
            continue;
          }
          const fullUrl = version.baseUrl.replace('{}', code);
          tasks.push({ id: siteVersionId, url: fullUrl, siteName: `${site.name} - ${version.name}` });
        }
      }

      if (scanMode === 'bestMatch') {
        // bestMatch：循序檢查，找到第一個可用即停止
        const results = [];
        for (const urlInfo of tasks) {
          console.log('[QuickLinker Background] Checking URL:', urlInfo.url);
          try {
            const response = await fetch(urlInfo.url, { method: 'HEAD', cache: 'no-cache' });
            if (response.status === 404) {
              results.push({ ...urlInfo, status: 'unavailable' });
            } else {
              results.push({ ...urlInfo, status: 'available', finalUrl: response.url });
              console.log('[QuickLinker Background] Best match found, sending response');
              sendResponse({ results });
              return;
            }
          } catch (error) {
            results.push({ ...urlInfo, status: 'error', error: error.message });
          }
        }
        sendResponse({ results });
      } else {
        // fullScan：平行檢查所有網站，大幅加速
        console.log('[QuickLinker Background] Full scan: checking', tasks.length, 'URLs in parallel');
        const results = await Promise.all(tasks.map(async (urlInfo) => {
          try {
            const response = await fetch(urlInfo.url, { method: 'HEAD', cache: 'no-cache' });
            if (response.status === 404) {
              return { ...urlInfo, status: 'unavailable' };
            } else {
              return { ...urlInfo, status: 'available', finalUrl: response.url };
            }
          } catch (error) {
            return { ...urlInfo, status: 'error', error: error.message };
          }
        }));
        console.log('[QuickLinker Background] Sending final results:', results.length, 'items');
        sendResponse({ results });
      }
    })();
    return true; // Keep message channel open for async response
  }
});