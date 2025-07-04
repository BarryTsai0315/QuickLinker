importScripts('contextMenu.js');

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    let settings = result.settings || [];

    // 檢查是否已存在 Missav
    const hasMissav = settings.some(site => site.name === 'Missav');
    // 檢查是否已存在 JABLE
    const hasJable = settings.some(site => site.name === 'JABLE');

    let needUpdate = false;

    // 如果沒有 Missav，則加入
    if (!hasMissav) {
      settings.push({
        name: 'Missav',
        baseUrl: 'https://missav.ws/ja/{}'
      });
      needUpdate = true;
    }

    // 如果沒有 JABLE，則加入
    if (!hasJable) {
      settings.push({
        name: 'JABLE',
        baseUrl: 'https://jable.tv/videos/{}/'
      });
      needUpdate = true;
    }

    // 如果有新增任何設定，則更新 storage
    if (needUpdate) {
      chrome.storage.sync.set({ settings }, () => {
        createContextMenu(settings);
      });
    } else {
      createContextMenu(settings);
    }
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    createContextMenu(changes.settings.newValue);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateContextMenu') {
    createContextMenu(message.settings);
  }

  if (message.type === 'checkUrl') {
    fetch(message.url, {
      method: 'HEAD',
      mode: 'no-cors' // 使用 no-cors 模式
    })
    .then(response => {
      sendResponse({ success: true });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // 保持消息通道開啟
  }
});