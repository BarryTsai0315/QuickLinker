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

    // Initial load
    loadSettingsAndRender();
});

let currentSettings = []; // Global variable to hold current settings

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    document.getElementById(`${tabName}Content` || `${tabName}Sites` || `${tabName}Form`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

async function loadSettingsAndRender() {
    const result = await chrome.storage.sync.get(['settings', 'scanMode']);
    currentSettings = result.settings || [];
    const scanMode = result.scanMode || 'bestMatch'; // Default to bestMatch

    renderSites(currentSettings);
    document.getElementById(scanMode + 'Mode').checked = true; // Set scan mode radio button

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

        // Render versions for this site
        renderVersions(site.id, site.versions);

        // Add event listeners for site actions
        siteDiv.querySelector('.toggle-versions-btn').addEventListener('click', (e) => {
            const versionsContainer = e.target.closest('.site-item').querySelector('.site-versions-container');
            versionsContainer.style.display = versionsContainer.style.display === 'none' ? 'block' : 'none';
            e.target.textContent = versionsContainer.style.display === 'none' ? '▼' : '▲';
        });
        siteDiv.querySelector('.edit-site-btn').addEventListener('click', (e) => editSite(site.id));
        siteDiv.querySelector('.delete-site-btn').addEventListener('click', (e) => deleteSite(site.id));
        siteDiv.querySelector('.add-version-btn').addEventListener('click', (e) => addVersion(site.id));
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

    const newName = prompt('編輯網站名稱:', site.name);
    if (newName !== null && newName.trim() !== '') {
        site.name = newName.trim();
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