document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('savedTab').addEventListener('click', () => showTab('saved'));
    document.getElementById('addTab').addEventListener('click', () => showTab('add'));
    document.getElementById('addSite').addEventListener('click', addSite);
    document.getElementById('exportSettings').addEventListener('click', exportSettings);
    document.getElementById('importButton').addEventListener('click', () => document.getElementById('importSettings').click());
    document.getElementById('importSettings').addEventListener('change', importSettings);
  });

  function showTab(tab) {
    document.getElementById('savedTab').classList.remove('active');
    document.getElementById('addTab').classList.remove('active');
    document.getElementById('savedSites').classList.remove('active');
    document.getElementById('addSiteForm').classList.remove('active');

    if (tab === 'saved') {
      document.getElementById('savedTab').classList.add('active');
      document.getElementById('savedSites').classList.add('active');
    } else {
      document.getElementById('addTab').classList.add('active');
      document.getElementById('addSiteForm').classList.add('active');
    }
  }

  function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || [];
      const container = document.getElementById('sitesContainer');
      container.innerHTML = '';
      settings.forEach((site, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td contenteditable="true">${site.name}</td>
          <td contenteditable="true">${site.baseUrl}</td>
          <td>
            <button class="update-btn"><i class="fi fi-rr-refresh"></i></button>
            <button class="delete-btn"><i class="fi fi-rs-trash"></i></button>
          </td>
        `;
        container.appendChild(tr);
      });
      addEventListeners();
    });
  }

  function addEventListeners() {
    document.querySelectorAll('.update-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => updateSite(index));
    });
    document.querySelectorAll('.delete-btn').forEach((btn, index) => {
      btn.addEventListener('click', () => deleteSite(index));
    });
  }

  function addSite() {
    const name = document.getElementById('newSiteName').value;
    const baseUrl = document.getElementById('newSiteUrl').value;
    if (name && baseUrl) {
      const container = document.getElementById('sitesContainer');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${container.children.length + 1}</td>
        <td contenteditable="true">${name}</td>
        <td contenteditable="true">${baseUrl}</td>
        <td>
          <button class="update-btn"><i class="fi fi-rr-refresh"></i></button>
          <button class="delete-btn"><i class="fi fi-rs-trash"></i></button>
        </td>
      `;
      container.appendChild(tr);
      document.getElementById('newSiteName').value = '';
      document.getElementById('newSiteUrl').value = '';
      showTab('saved');
      saveSettings();
      addEventListeners();
    } else {
      alert('請填寫所有欄位');
    }
  }

  function updateSite(index) {
    const container = document.getElementById('sitesContainer');
    const tr = container.children[index];
    const name = tr.children[1].textContent;
    const baseUrl = tr.children[2].textContent;
    const sites = Array.from(container.children).map(tr => {
      return {
        name: tr.children[1].textContent,
        baseUrl: tr.children[2].textContent
      };
    });
    sites[index] = { name, baseUrl };
    chrome.storage.sync.set({ settings: sites }, () => {
      createContextMenu(sites);
    });
  }

  function deleteSite(index) {
    const container = document.getElementById('sitesContainer');
    container.removeChild(container.children[index]);
    Array.from(container.children).forEach((tr, i) => {
      tr.children[0].textContent = i + 1;
      tr.children[3].innerHTML = `
        <button class="update-btn"><i class="fi fi-rr-refresh"></i></button>
        <button class="delete-btn"><i class="fi fi-rs-trash"></i></button>
      `;
    });
    saveSettings();
    addEventListeners();
  }

  function saveSettings() {
    const sites = Array.from(document.getElementById('sitesContainer').children).map(tr => {
      return {
        name: tr.children[1].textContent,
        baseUrl: tr.children[2].textContent
      };
    });
    chrome.storage.sync.set({ settings: sites }, () => {
      createContextMenu(sites);
    });
  }

  function exportSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || [];
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settings.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function importSettings(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const settings = JSON.parse(e.target.result);
        chrome.storage.sync.set({ settings }, () => {
          loadSettings();
          createContextMenu(settings);
        });
      };
      reader.readAsText(file);
    }
  }

  function createContextMenu(settings) {
    chrome.runtime.sendMessage({ action: 'updateContextMenu', settings });
  }