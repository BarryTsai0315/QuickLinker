function createContextMenu(settings) {
  // 先移除所有現有的選單項目
  chrome.contextMenus.removeAll(() => {
    // 確保在完全移除後才創建新的選單
    setTimeout(() => {
      try {
        // 創建父選單
        chrome.contextMenus.create({
          id: "parent",
          title: "階層式右鍵選單連結生成",
          contexts: ["selection"]
        });

        // 創建子選單項目
        settings.forEach((site, index) => {
          chrome.contextMenus.create({
            id: `site_${index}`,
            parentId: "parent",
            title: site.name,
            contexts: ["selection"]
          });
        });
      } catch (e) {
        console.error('創建選單時發生錯誤:', e);
      }
    }, 100); // 添加小延遲確保選單被完全移除
  });
}

// 監聽選單點擊事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('site_')) {
    const index = parseInt(info.menuItemId.split('_')[1], 10);
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || [];
      const site = settings[index];
      let link = site.baseUrl;
      if (link.includes('{}')) {
        link = link.replace('{}', info.selectionText);
      } else {
        link += info.selectionText;
      }
      chrome.tabs.create({ url: link });
    });
  }
});