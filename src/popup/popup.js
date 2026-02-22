document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.id.replace('Tab', '');
            showTab(tabName);
        });
    });

    // Main actions
    document.getElementById('addSiteButton').addEventListener('click', addSite);
    document.getElementById('exportSettings').addEventListener('click', exportSettings);
    document.getElementById('importButton').addEventListener('click', () => document.getElementById('importSettings').click());
    document.getElementById('importSettings').addEventListener('change', importSettings);

    // Scan mode selection
    document.querySelectorAll('input[name="scanMode"]').forEach(radio => {
        radio.addEventListener('change', saveScanMode);
    });

    // Close original tab setting
    document.getElementById('closeOriginalTab').addEventListener('change', saveCloseOriginalTabSetting);

    // Event delegation for site card buttons (only add once)
    document.getElementById('sitesContainer').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-site-btn');
        const deleteBtn = e.target.closest('.delete-site-btn');

        if (editBtn) {
            const siteId = editBtn.dataset.siteId;
            editSite(siteId);
        } else if (deleteBtn) {
            const siteId = deleteBtn.dataset.siteId;
            deleteSite(siteId);
        }
    });

    // Initial load
    loadSettingsAndRender();
});

let currentSettings = []; // Global variable to hold current settings

function showTab(tabName) {
    console.log('[QuickLinker] Switching to tab:', tabName);

    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    // Map tab names to content IDs
    const tabContentMap = {
        'saved': 'savedSites',
        'settings': 'settingsContent',
        'add': 'addSiteForm'
    };

    const contentId = tabContentMap[tabName];
    const buttonId = `${tabName}Tab`;

    console.log('[QuickLinker] Content ID:', contentId, 'Button ID:', buttonId);

    if (contentId && document.getElementById(contentId)) {
        document.getElementById(contentId).classList.add('active');
    } else {
        console.error('[QuickLinker] Tab content not found:', contentId);
    }

    if (document.getElementById(buttonId)) {
        document.getElementById(buttonId).classList.add('active');
    } else {
        console.error('[QuickLinker] Tab button not found:', buttonId);
    }
}

async function loadSettingsAndRender() {
    const result = await chrome.storage.sync.get(['settings', 'scanMode', 'closeOriginalTab']);
    currentSettings = result.settings || [];
    const scanMode = result.scanMode || 'bestMatch'; // Default to bestMatch
    const closeOriginalTab = result.closeOriginalTab !== undefined ? result.closeOriginalTab : false; // Default to false

    renderSites(currentSettings);
    document.getElementById(scanMode + 'Mode').checked = true; // Set scan mode radio button
    document.getElementById('closeOriginalTab').checked = closeOriginalTab; // Set close original tab checkbox

    // Initialize drag-and-drop for sites
    initSortable('sitesContainer', (newOrder) => {
        currentSettings = newOrder.map(id => currentSettings.find(s => s.id === id));
        saveSettings(currentSettings);
    });
}

function renderSites(settings) {
    const container = document.getElementById('sitesContainer');
    container.innerHTML = '';

    if (settings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fi fi-rr-globe"></i>
                <h3>尚未新增任何網站</h3>
                <p>點擊上方「新增」標籤開始設定網站</p>
            </div>
        `;
        return;
    }

    settings.forEach(site => {
        const siteCard = document.createElement('div');
        siteCard.className = 'site-card sortable-item';
        siteCard.dataset.id = site.id;
        siteCard.setAttribute('draggable', 'true'); // Enable dragging

        // Escape HTML to prevent XSS
        const escapeName = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        siteCard.innerHTML = `
            <div class="site-header">
                <div class="site-name">
                    <i class="fi fi-rr-globe"></i>
                    ${escapeName(site.name)}
                </div>
                <div class="site-actions">
                    <button class="icon-btn drag drag-handle" title="拖曳排序">
                        <i class="fi fi-rr-apps-sort"></i>
                    </button>
                    <button class="icon-btn edit edit-site-btn" data-site-id="${site.id}" title="編輯">
                        <i class="fi fi-rr-pencil"></i>
                    </button>
                    <button class="icon-btn delete delete-site-btn" data-site-id="${site.id}" title="刪除">
                        <i class="fi fi-rr-trash-xmark"></i>
                    </button>
                </div>
            </div>
            ${site.versions ? site.versions.map(version => `
                <div class="version-item">
                    <div class="version-name">
                        <i class="fi fi-rr-link"></i>
                        ${escapeName(version.name)}
                    </div>
                </div>
                <div class="version-url">${escapeName(version.baseUrl)}</div>
            `).join('') : ''}
        `;

        container.appendChild(siteCard);
    });
}

function renderVersions(siteId, versions) {
    const versionsContainer = document.querySelector(`.versions-list[data-site-id="${siteId}"]`);
    versionsContainer.innerHTML = '';

    if (versions.length === 0) {
        versionsContainer.innerHTML = '<p>沒有版本。請新增。</p>';
        return;
    }

    versions.forEach(version => {
        const versionDiv = document.createElement('div');
        versionDiv.className = 'version-item sortable-item';
        versionDiv.dataset.id = version.id;
        versionDiv.innerHTML = `
            <span class="drag-handle">☰</span>
            <span class="version-name-display">${version.name}</span>
            <span class="version-url-display">${version.baseUrl}</span>
            <button class="edit-version-btn" title="編輯版本"><i class="fi fi-rr-edit"></i></button>
            <button class="delete-version-btn" title="刪除版本"><i class="fi fi-rs-trash"></i></button>
        `;
        versionsContainer.appendChild(versionDiv);

        // Add event listeners for version actions
        versionDiv.querySelector('.edit-version-btn').addEventListener('click', (e) => editVersion(siteId, version.id));
        versionDiv.querySelector('.delete-version-btn').addEventListener('click', (e) => deleteVersion(siteId, version.id));
    });

    // Initialize drag-and-drop for versions
    initSortable(versionsContainer.id || versionsContainer.className.split(' ')[0] + '[data-site-id="' + siteId + '"]', (newOrder) => {
        const site = currentSettings.find(s => s.id === siteId);
        if (site) {
            site.versions = newOrder.map(id => site.versions.find(v => v.id === id));
            saveSettings(currentSettings);
        }
    });
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function addSite() {
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
        loadSettingsAndRender(); // Re-render to show new site
    } else {
        showFeedback('請填寫所有欄位。', 'error');
    }
}

async function editSite(siteId) {
    const site = currentSettings.find(s => s.id === siteId);
    if (!site) return;

    // Edit site name
    const newName = prompt('編輯網站名稱:', site.name);
    if (newName === null) return; // User cancelled

    // Edit URL from the first version (default version)
    let newUrl = null;
    if (site.versions && site.versions.length > 0) {
        newUrl = prompt('編輯基礎 URL:\n(使用 {} 作為搜尋關鍵字的佔位符)', site.versions[0].baseUrl);
        if (newUrl === null) return; // User cancelled
    }

    // Apply changes
    let hasChanges = false;
    if (newName.trim() !== '' && newName !== site.name) {
        site.name = newName.trim();
        hasChanges = true;
    }
    if (newUrl && newUrl.trim() !== '' && site.versions[0]) {
        site.versions[0].baseUrl = newUrl.trim();
        hasChanges = true;
    }

    if (hasChanges) {
        await saveSettings(currentSettings);
        loadSettingsAndRender();
    }
}

async function deleteSite(siteId) {
    if (confirm('確定要刪除這個網站嗎？')) {
        currentSettings = currentSettings.filter(s => s.id !== siteId);
        await saveSettings(currentSettings);
        loadSettingsAndRender();
    }
}

async function addVersion(siteId) {
    const siteDiv = document.querySelector(`.site-item[data-id="${siteId}"]`);
    const nameInput = siteDiv.querySelector('.new-version-name');
    const urlInput = siteDiv.querySelector('.new-version-url');
    const name = nameInput.value.trim();
    const baseUrl = urlInput.value.trim();

    if (name && baseUrl) {
        const site = currentSettings.find(s => s.id === siteId);
        if (site) {
            site.versions.push({ id: generateUniqueId(), name: name, baseUrl: baseUrl });
            await saveSettings(currentSettings);
            nameInput.value = '';
            urlInput.value = '';
            renderVersions(siteId, site.versions); // Re-render only versions for this site
        }
    } else {
        showFeedback('請填寫所有版本欄位。', 'error');
    }
}

async function editVersion(siteId, versionId) {
    const site = currentSettings.find(s => s.id === siteId);
    if (!site) return;
    const version = site.versions.find(v => v.id === versionId);
    if (!version) return;

    const newName = prompt('編輯版本名稱:', version.name);
    if (newName !== null && newName.trim() !== '') {
        version.name = newName.trim();
    }

    const newUrl = prompt('編輯版本 URL:', version.baseUrl);
    if (newUrl !== null && newUrl.trim() !== '') {
        version.baseUrl = newUrl.trim();
    }

    if ((newName !== null && newName.trim() !== '') || (newUrl !== null && newUrl.trim() !== '')) {
        await saveSettings(currentSettings);
        renderVersions(siteId, site.versions);
    }
}

async function deleteVersion(siteId, versionId) {
    if (confirm('確定要刪除這個版本嗎？')) {
        const site = currentSettings.find(s => s.id === siteId);
        if (site) {
            site.versions = site.versions.filter(v => v.id !== versionId);
            await saveSettings(currentSettings);
            renderVersions(siteId, site.versions);
        }
    }
}

async function saveSettings(settingsArray) {
    await chrome.storage.sync.set({ settings: settingsArray });
    chrome.runtime.sendMessage({ action: 'updateContextMenu' }); // Update context menu if settings change
    showFeedback('設定已儲存！');
}

async function saveScanMode() {
    const selectedMode = document.querySelector('input[name="scanMode"]:checked').value;
    await chrome.storage.sync.set({ scanMode: selectedMode });
    showFeedback('掃描模式已儲存！');
}

async function saveCloseOriginalTabSetting() {
    const closeOriginalTab = document.getElementById('closeOriginalTab').checked;
    await chrome.storage.sync.set({ closeOriginalTab: closeOriginalTab });
    showFeedback('分頁管理設定已儲存！');
}

function exportSettings() {
    const dataToExport = {
        settings: currentSettings,
        scanMode: document.querySelector('input[name="scanMode"]:checked').value
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quicklinker_settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importSettings(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && Array.isArray(importedData.settings)) {
                    await saveSettings(importedData.settings);
                    if (importedData.scanMode) {
                        await chrome.storage.sync.set({ scanMode: importedData.scanMode });
                    }
                    loadSettingsAndRender();
                    showFeedback('設定匯入成功！');
                } else {
                    showFeedback('無效的檔案格式。', 'error');
                }
            } catch (error) {
                showFeedback('無法解析檔案。', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

function showFeedback(message, type = 'success') {
    let feedback = document.getElementById('feedbackMessage');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'feedbackMessage';
        feedback.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 10px 20px; border-radius: 5px; color: white; font-size: 14px;
            z-index: 1000; opacity: 0; transition: opacity 0.3s, background-color 0.3s;
            white-space: nowrap;
        `;
        document.body.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    feedback.style.opacity = 1;

    setTimeout(() => {
        feedback.style.opacity = 0;
    }, 3000);
}

// Basic Drag-and-Drop Implementation
function initSortable(containerId, onDropCallback) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) {
        console.error('Sortable container not found:', containerId);
        return;
    }

    let draggedItem = null;

    container.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('sortable-item')) {
            draggedItem = e.target;
            e.dataTransfer.effectAllowed = 'move';
            // Add a small delay to allow the browser to capture the drag image
            setTimeout(() => {
                draggedItem.classList.add('dragging');
            }, 0);
        }
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        if (e.target.classList.contains('sortable-item') && draggedItem) {
            const boundingBox = e.target.getBoundingClientRect();
            const offset = boundingBox.y + (boundingBox.height / 2);
            if (e.clientY < offset) {
                container.insertBefore(draggedItem, e.target);
            } else {
                container.insertBefore(draggedItem, e.target.nextSibling);
            }
        }
    });

    container.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            const newOrder = Array.from(container.children).map(item => item.dataset.id);
            onDropCallback(newOrder);
        }
    });
}