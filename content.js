function checkForCode() {
  const clipboardElement = document.querySelector('.copy-to-clipboard');
  return clipboardElement?.getAttribute('data-clipboard-text');
}

function createFloatingButton() {
  console.log('開始創建懸浮按鈕'); // 除錯用

  // 檢查是否已存在按鈕
  const existingContainer = document.querySelector('.floating-container');
  if (existingContainer) {
    existingContainer.remove(); // 移除現有按鈕，重新創建
  }

  // 檢查是否有番號
  const code = checkForCode();
  if (!code) {
    console.log('沒有找到番號，不創建按鈕');
    return;
  }
  console.log('找到番號:', code); // 除錯用

  // 創建容器
  const container = document.createElement('div');
  container.className = 'floating-container';

  // 創建子按鈕容器
  const subButtonsContainer = document.createElement('div');
  subButtonsContainer.className = 'sub-buttons';

  // 創建主按鈕
  const mainButton = document.createElement('div');
  mainButton.className = 'floating-button main-button';
  mainButton.innerHTML = '+';

  // 拖曳功能
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  container.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    if (e.target === mainButton) {
      initialX = e.clientX - container.offsetLeft;
      initialY = e.clientY - container.offsetTop;
      isDragging = true;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentY = e.clientY - initialY;

      // 只限制上下移動範圍
      const maxY = window.innerHeight - 50;
      currentY = Math.min(Math.max(0, currentY), maxY);

      container.style.top = currentY + 'px';
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  // 展開/收合功能
  let isExpanded = false;
  mainButton.addEventListener('click', (e) => {
    if (!isDragging) {
      isExpanded = !isExpanded;
      if (isExpanded) {
        subButtonsContainer.style.display = 'flex';
        mainButton.style.transform = 'rotate(45deg)';
        console.log('展開子按鈕'); // 除錯用
      } else {
        subButtonsContainer.style.display = 'none';
        mainButton.style.transform = 'rotate(0deg)';
        console.log('收起子按鈕'); // 除錯用
      }
    }
  });

  // 從 storage 獲取設定並創建子按鈕
  chrome.storage.sync.get(['settings'], async (result) => {
    console.log('載入的設定:', result.settings);
    const settings = result.settings || [];

    subButtonsContainer.innerHTML = '';

    // 檢查所有網站的可用性
    const availableSites = await Promise.all(
      settings.map(async (site) => {
        const clipboardElement = document.querySelector('.copy-to-clipboard');
        if (!clipboardElement) return site; // 改為返回 site 而不是 null

        const code = clipboardElement.getAttribute('data-clipboard-text');
        if (!code) return site; // 改為返回 site 而不是 null

        let link = site.baseUrl;
        if (link.includes('{}')) {
          link = link.replace('{}', code);
        } else {
          link += code;
        }

        try {
          const response = await chrome.runtime.sendMessage({
            type: 'checkUrl',
            url: link
          });

          if (response.success) {
            console.log(`${site.name} 可用`);
            return site;
          } else {
            console.log(`${site.name} 無效 (${response.status})`);
            return null;
          }
        } catch (error) {
          console.log(`檢查 ${site.name} 時發生錯誤，假設網站可用:`, error);
          return site; // 如果發生錯誤，我們假設網站是可用的
        }
      })
    );

    // 過濾掉無效的網站，只顯示可用的按鈕
    const validSites = availableSites.filter(site => site !== null);

    validSites.slice().reverse().forEach((site, index) => {
      const subButton = document.createElement('div');
      subButton.className = 'floating-button sub-button';

      let displayText = site.name.charAt(0);
      if (/[a-zA-Z]/.test(displayText)) {
        displayText = displayText.toUpperCase();
      }

      subButton.textContent = displayText;
      subButton.title = site.name;
      subButton.style.position = 'relative';
      subButton.style.zIndex = `${10 - index}`;

      subButton.addEventListener('click', () => {
        const clipboardElement = document.querySelector('.copy-to-clipboard');
        if (clipboardElement) {
          const code = clipboardElement.getAttribute('data-clipboard-text');
          if (code) {
            let link = site.baseUrl;
            if (link.includes('{}')) {
              link = link.replace('{}', code);
            } else {
              link += code;
            }
            window.location.href = link;
          }
        }
      });

      subButtonsContainer.appendChild(subButton);
    });
  });

  // 設定容器結構
  container.appendChild(subButtonsContainer);
  container.appendChild(mainButton);

  // 設定初始位置（改為右側且距離底部 100px）
  container.style.right = '20px';
  container.style.top = `${window.innerHeight - 100}px`;
  container.style.left = 'auto';

  document.body.appendChild(container);
  console.log('懸浮按鈕創建完成'); // 除錯用
}

// CSS 樣式
const style = document.createElement('style');
style.textContent = `
  .floating-container {
    position: fixed;
    z-index: 10000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    right: 20px;  /* 新增固定右側位置 */
  }

  .floating-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
  }

  .main-button {
    background: #4CAF50;
    color: white;
    font-size: 24px;
    padding: 0;
    z-index: 10001;
    position: relative;
  }

  .sub-buttons {
    display: none;
    flex-direction: column;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding-bottom: 10px;
  }

  .sub-button {
    background: #2196F3;
    color: white;
    font-size: 16px;
    margin-bottom: 10px;
    position: relative;
  }

  .sub-button:hover {
    transform: scale(1.1);
    background: #1976D2;
  }

  /* 修改懸浮提示樣式 */
  .sub-button:hover::after {
    content: attr(title);
    position: absolute;
    right: 120%;  /* 改為 right 而不是 left */
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;

document.head.appendChild(style);

// 初始化
createFloatingButton();

// 監聽 storage 變化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.settings) {
    console.log('設定已更新，重新創建按鈕'); // 除錯用
    createFloatingButton();
  }
});

// 監聽頁面變化
const observer = new MutationObserver(() => {
  const code = checkForCode();
  const container = document.querySelector('.floating-container');

  if (code && !container) {
    // 如果找到番號但沒有按鈕，則創建按鈕
    createFloatingButton();
  } else if (!code && container) {
    // 如果沒有番號但有按鈕，則移除按鈕
    container.remove();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});