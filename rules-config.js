// =============================================
// Global State
// =============================================

let domainRules = [];
let availableSites = [];
let currentEditingRuleId = null;

// =============================================
// Initialization
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  renderRules();
  setupEventListeners();
});

async function loadData() {
  const result = await chrome.storage.sync.get(['domainRules', 'settings']);
  domainRules = result.domainRules || [];
  availableSites = result.settings || [];
}

function setupEventListeners() {
  // Modal controls
  document.getElementById('addRuleBtn').addEventListener('click', () => openModal());
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

  // Form submission
  document.getElementById('ruleForm').addEventListener('submit', handleFormSubmit);

  // Extractor management
  document.getElementById('addExtractorBtn').addEventListener('click', addExtractorRow);

  // Multi-select
  document.getElementById('sitesSelectTrigger').addEventListener('click', toggleSitesDropdown);

  // Import/Export
  document.getElementById('exportRulesBtn').addEventListener('click', exportRules);
  document.getElementById('importRulesBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = importRules;
    input.click();
  });

  // Back to popup
  document.getElementById('backToPopupBtn').addEventListener('click', () => {
    window.location.href = 'popup.html';
  });

  // Form input listeners for live preview
  document.getElementById('domainInput').addEventListener('input', updatePreview);
  document.getElementById('ruleNameInput').addEventListener('input', updatePreview);

  // Event delegation for extractors container (動態新增的提取規則)
  document.getElementById('extractorsContainer').addEventListener('input', (e) => {
    if (e.target.classList.contains('extractor-pattern-input') ||
        e.target.classList.contains('extractor-transform-input')) {
      updatePreview();
    }
  });

  document.getElementById('extractorsContainer').addEventListener('change', (e) => {
    if (e.target.classList.contains('extractor-type-select')) {
      updatePreview();
    }
  });

  // Event delegation for delete extractor buttons
  document.getElementById('extractorsContainer').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-extractor-btn');
    if (deleteBtn) {
      const extractorId = deleteBtn.dataset.extractorId;
      removeExtractor(extractorId);
    }
  });

  // Event delegation for sites selection (動態新增的網站選項)
  document.getElementById('sitesSelectOptions').addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      handleSiteSelection();
    }
  });

  // Event delegation for rule cards (編輯、刪除、Toggle)
  document.getElementById('rulesContainer').addEventListener('click', (e) => {
    // Edit button
    const editBtn = e.target.closest('.edit-rule-btn');
    if (editBtn) {
      const ruleId = editBtn.dataset.ruleId;
      editRule(ruleId);
      return;
    }

    // Delete button
    const deleteBtn = e.target.closest('.delete-rule-btn');
    if (deleteBtn) {
      const ruleId = deleteBtn.dataset.ruleId;
      deleteRule(ruleId);
      return;
    }
  });

  // Event delegation for rule toggle
  document.getElementById('rulesContainer').addEventListener('change', (e) => {
    if (e.target.classList.contains('rule-toggle')) {
      const ruleId = e.target.dataset.ruleId;
      toggleRule(ruleId);
    }
  });

  // Close modal when clicking outside
  document.getElementById('ruleModal').addEventListener('click', (e) => {
    if (e.target.id === 'ruleModal') closeModal();
  });
}

// =============================================
// Render Functions
// =============================================

function renderRules() {
  const container = document.getElementById('rulesContainer');
  const emptyState = document.getElementById('emptyState');

  if (domainRules.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = '';

  domainRules.forEach(rule => {
    const ruleCard = createRuleCard(rule);
    container.appendChild(ruleCard);
  });
}

function createRuleCard(rule) {
  const card = document.createElement('div');
  card.className = `rule-card ${rule.enabled ? '' : 'disabled'}`;
  card.dataset.ruleId = rule.id;

  // Get site names with version info
  const linkedSites = rule.sites.map(siteId => {
    // Parse site_xxx_version_yyy format
    const parts = siteId.split('_');
    if (parts.length >= 4) {
      const actualSiteId = `${parts[0]}_${parts[1]}`;
      const versionId = `${parts[2]}_${parts[3]}`;

      const site = availableSites.find(s => s.id === actualSiteId);
      if (site) {
        const version = site.versions.find(v => v.id === versionId);
        return version ? `${site.name} - ${version.name}` : site.name;
      }
    }
    return '未知網站';
  });

  card.innerHTML = `
    <div class="rule-header">
      <div class="rule-title">
        <span class="domain-badge">${escapeHtml(rule.domain)}</span>
        ${rule.name ? `<span style="color: #666; font-size: 14px;">${escapeHtml(rule.name)}</span>` : ''}
      </div>
      <div class="rule-actions">
        <label class="toggle-switch">
          <input type="checkbox" ${rule.enabled ? 'checked' : ''} class="rule-toggle" data-rule-id="${rule.id}">
          <span class="slider"></span>
        </label>
        <button class="icon-btn edit-rule-btn" data-rule-id="${rule.id}" title="編輯">
          <i class="fi fi-rr-edit"></i>
        </button>
        <button class="icon-btn delete-rule-btn" data-rule-id="${rule.id}" title="刪除">
          <i class="fi fi-rr-trash"></i>
        </button>
      </div>
    </div>

    <div class="rule-section">
      <div class="section-title">
        <i class="fi fi-rr-magic-wand"></i> 提取規則
      </div>
      <div class="extractors-list">
        ${rule.extractors.map(ext => `
          <div class="extractor-item">
            <div class="extractor-type type-${ext.type}">
              ${getExtractorTypeLabel(ext.type)}
            </div>
            <div class="extractor-pattern">${escapeHtml(ext.pattern)}</div>
            <div style="font-size: 12px; color: #999;">
              ${ext.transform || 'text'}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="rule-section">
      <div class="section-title">
        <i class="fi fi-rr-link"></i> 關聯網站 (${linkedSites.length})
      </div>
      <div class="sites-chips">
        ${linkedSites.map(siteName => `
          <div class="site-chip">
            <i class="fi fi-rr-globe"></i>
            ${siteName}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return card;
}

function getExtractorTypeLabel(type) {
  const labels = {
    'selector': 'CSS 選擇器',
    'regex': '正則表達式',
    'clipboard': '剪貼簿',
    'url': 'URL'
  };
  return labels[type] || type;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================
// Modal Management
// =============================================

function openModal(ruleId = null) {
  currentEditingRuleId = ruleId;
  const modal = document.getElementById('ruleModal');
  const modalTitle = document.getElementById('modalTitle');

  // Reset form
  document.getElementById('ruleForm').reset();
  document.getElementById('extractorsContainer').innerHTML = '';

  if (ruleId) {
    // Edit mode
    modalTitle.textContent = '編輯規則';
    const rule = domainRules.find(r => r.id === ruleId);
    if (rule) {
      document.getElementById('domainInput').value = rule.domain;
      document.getElementById('ruleNameInput').value = rule.name || '';

      // Populate extractors
      rule.extractors.forEach(ext => addExtractorRow(ext));

      // Set selected sites
      selectedSiteIds = [...rule.sites];
      updateSitesSelectText();
    }
  } else {
    // Add mode
    modalTitle.textContent = '新增規則';
    addExtractorRow(); // Add one default extractor
    selectedSiteIds = [];
  }

  populateSitesOptions();
  updatePreview();
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('ruleModal').classList.remove('active');
  currentEditingRuleId = null;
}

// =============================================
// Extractor Management
// =============================================

function addExtractorRow(extractor = null) {
  const container = document.getElementById('extractorsContainer');
  const extractorId = 'ext_' + Date.now() + Math.random().toString(36).substr(2, 9);

  const row = document.createElement('div');
  row.className = 'extractor-item';
  row.dataset.extractorId = extractorId;
  row.style.gridTemplateColumns = '140px 1fr 120px 40px';
  row.style.marginBottom = '10px';

  row.innerHTML = `
    <select class="form-select extractor-type-select">
      <option value="selector" ${extractor?.type === 'selector' ? 'selected' : ''}>CSS 選擇器</option>
      <option value="regex" ${extractor?.type === 'regex' ? 'selected' : ''}>正則表達式</option>
      <option value="clipboard" ${extractor?.type === 'clipboard' ? 'selected' : ''}>剪貼簿</option>
      <option value="url" ${extractor?.type === 'url' ? 'selected' : ''}>URL</option>
    </select>
    <input
      type="text"
      class="form-input extractor-pattern-input"
      placeholder="提取規則"
      value="${extractor?.pattern || ''}"
    />
    <input
      type="text"
      class="form-input extractor-transform-input"
      placeholder="轉換方式"
      value="${extractor?.transform || 'text'}"
    />
    <button type="button" class="icon-btn delete-extractor-btn" data-extractor-id="${extractorId}" title="刪除">
      <i class="fi fi-rr-cross"></i>
    </button>
  `;

  container.appendChild(row);
  updatePreview();
}

function removeExtractor(extractorId) {
  const row = document.querySelector(`[data-extractor-id="${extractorId}"]`);
  if (row) {
    row.remove();
    updatePreview();
  }
}

function getExtractorsFromForm(includeEmpty = false) {
  const extractors = [];
  const rows = document.querySelectorAll('#extractorsContainer .extractor-item');

  rows.forEach(row => {
    const type = row.querySelector('.extractor-type-select').value;
    const pattern = row.querySelector('.extractor-pattern-input').value.trim();
    const transform = row.querySelector('.extractor-transform-input').value.trim() || 'text';

    // 如果 includeEmpty 為 true（預覽模式），即使 pattern 為空也要顯示
    // 如果 includeEmpty 為 false（保存模式），只有 pattern 有值才加入
    if (includeEmpty || pattern) {
      extractors.push({ type, pattern, transform });
    }
  });

  return extractors;
}

// =============================================
// Sites Multi-Select
// =============================================

let selectedSiteIds = [];

function populateSitesOptions() {
  const container = document.getElementById('sitesSelectOptions');
  container.innerHTML = '';

  if (availableSites.length === 0) {
    container.innerHTML = '<div style="padding: 10px; color: #999;">尚無可用網站，請先在主介面新增</div>';
    return;
  }

  availableSites.forEach(site => {
    site.versions.forEach(version => {
      const option = document.createElement('div');
      option.className = 'multi-select-option';
      const siteId = `${site.id}_${version.id}`;
      const isChecked = selectedSiteIds.includes(siteId);

      option.innerHTML = `
        <input
          type="checkbox"
          id="site_${siteId}"
          value="${siteId}"
          ${isChecked ? 'checked' : ''}
        />
        <label for="site_${siteId}" style="cursor: pointer; flex: 1;">
          ${site.name} - ${version.name}
        </label>
      `;

      container.appendChild(option);
    });
  });
}

function toggleSitesDropdown() {
  const dropdown = document.getElementById('sitesSelectOptions');
  dropdown.classList.toggle('active');
}

function handleSiteSelection() {
  const checkboxes = document.querySelectorAll('#sitesSelectOptions input[type="checkbox"]');
  selectedSiteIds = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  updateSitesSelectText();
  updatePreview();
}

function updateSitesSelectText() {
  const text = document.getElementById('sitesSelectText');
  if (selectedSiteIds.length === 0) {
    text.textContent = '請選擇網站...';
  } else {
    text.textContent = `已選擇 ${selectedSiteIds.length} 個網站`;
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const multiSelect = document.getElementById('sitesMultiSelect');
  if (multiSelect && !multiSelect.contains(e.target)) {
    document.getElementById('sitesSelectOptions').classList.remove('active');
  }
});

// =============================================
// Preview
// =============================================

function updatePreview() {
  const domain = document.getElementById('domainInput').value.trim();
  const name = document.getElementById('ruleNameInput').value.trim();
  const extractors = getExtractorsFromForm(true); // 預覽模式：包含空的 extractors

  const ruleObject = {
    id: currentEditingRuleId || 'new_rule_id',
    domain: domain || 'example.com',
    name: name || undefined,
    enabled: true,
    extractors: extractors.length > 0 ? extractors : [{ type: 'selector', pattern: '', transform: 'text' }],
    sites: selectedSiteIds
  };

  // Remove undefined values for cleaner JSON
  Object.keys(ruleObject).forEach(key => {
    if (ruleObject[key] === undefined) delete ruleObject[key];
  });

  document.getElementById('rulePreview').textContent = JSON.stringify(ruleObject, null, 2);
}

// =============================================
// CRUD Operations
// =============================================

async function handleFormSubmit(e) {
  e.preventDefault();

  const domain = document.getElementById('domainInput').value.trim();
  const name = document.getElementById('ruleNameInput').value.trim();
  const extractors = getExtractorsFromForm();

  // Validation
  if (!domain) {
    alert('請輸入觸發網域');
    return;
  }

  if (extractors.length === 0) {
    alert('請至少新增一個提取規則');
    return;
  }

  if (selectedSiteIds.length === 0) {
    alert('請至少選擇一個關聯網站');
    return;
  }

  const rule = {
    id: currentEditingRuleId || generateUniqueId(),
    domain,
    name: name || undefined,
    enabled: true,
    extractors,
    sites: selectedSiteIds
  };

  // Remove undefined
  Object.keys(rule).forEach(key => {
    if (rule[key] === undefined) delete rule[key];
  });

  if (currentEditingRuleId) {
    // Update existing rule
    const index = domainRules.findIndex(r => r.id === currentEditingRuleId);
    if (index !== -1) {
      domainRules[index] = rule;
    }
  } else {
    // Add new rule
    domainRules.push(rule);
  }

  await saveRules();
  closeModal();
  renderRules();
  showNotification('規則已儲存');
}

async function toggleRule(ruleId) {
  const rule = domainRules.find(r => r.id === ruleId);
  if (rule) {
    rule.enabled = !rule.enabled;
    await saveRules();
    renderRules();
  }
}

function editRule(ruleId) {
  openModal(ruleId);
}

async function deleteRule(ruleId) {
  if (!confirm('確定要刪除此規則嗎？')) return;

  domainRules = domainRules.filter(r => r.id !== ruleId);
  await saveRules();
  renderRules();
  showNotification('規則已刪除');
}

async function saveRules() {
  await chrome.storage.sync.set({ domainRules });
}

// =============================================
// Import/Export
// =============================================

function exportRules() {
  const dataToExport = {
    domainRules,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quicklinker_rules_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('規則已匯出');
}

function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.domainRules || !Array.isArray(data.domainRules)) {
        alert('無效的檔案格式');
        return;
      }

      if (confirm(`將匯入 ${data.domainRules.length} 條規則，是否覆蓋現有規則？`)) {
        domainRules = data.domainRules;
        await saveRules();
        renderRules();
        showNotification('規則已匯入');
      }
    } catch (error) {
      alert('檔案解析失敗：' + error.message);
    }
  };
  reader.readAsText(file);
}

// =============================================
// Utilities
// =============================================

function generateUniqueId() {
  return 'rule_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #667eea;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
