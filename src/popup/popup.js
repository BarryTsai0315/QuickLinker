const DEFAULT_SETTINGS = {
  settings: [],
  scanMode: 'bestMatch',
  closeOriginalTab: false,
  showFloatingButton: true,
  showUpdateNotification: false,
  updateFromVersion: null,
  themeMode: 'auto',
  language: 'auto',
  searchHistory: [],
  devMode: false
};

const I18N = {
  'zh-TW': {
    age_title: '年齡驗證', age_desc: '本擴充功能涉及成人內容網站。<br>繼續使用前請確認以下事項。',
    age_check1: '我確認我已年滿 18 歲',
    age_check2: '我了解本工具的用途，且在我所在地區使用此類內容合法',
    age_confirm: '確認並繼續', age_version_note: 'v3.6.0 更新後需重新確認',
    update_title: '本次更新',
    update_from: '更新版本',
    update_item_missav: 'MissAV 支援多版本搜尋，同一個番號會同時檢查正常版與無碼版。',
    update_item_uncensored: '無碼標籤已加入多語系，會跟隨目前的語言設定顯示。',
    update_item_consistency: '修正右鍵選單、停用網站、浮動按鈕開關與設定資料的一致性。',
    update_item_options: '網站管理可修改預設網站，最近搜尋會合併大小寫相同的番號。',
    update_confirm: '知道了',
    detected: '偵測到的番號', sites: '搜尋網站', recent: '最近搜尋',
    options: '⚙ 選項', search_btn: '🔍 一鍵搜尋', searching: '搜尋中...',
    no_code: '未偵測到番號', no_sites: '尚未設定搜尋網站', no_recent: '尚無最近搜尋',
    just_now: '剛才', minutes_ago: '分鐘前', hours_ago: '小時前', days_ago: '天前'
  },
  'zh-CN': {
    age_title: '年龄验证', age_desc: '本扩展涉及成人内容网站。<br>继续使用前请确认以下事项。',
    age_check1: '我确认我已年满 18 岁',
    age_check2: '我了解本工具的用途，且在我所在地区使用此类内容合法',
    age_confirm: '确认并继续', age_version_note: 'v3.6.0 更新后需重新确认',
    update_title: '本次更新',
    update_from: '更新版本',
    update_item_missav: 'MissAV 支持多版本搜索，同一个番号会同时检查普通版与无码版。',
    update_item_uncensored: '无码标签已加入多语言，会跟随当前语言设置显示。',
    update_item_consistency: '修正右键菜单、停用网站、浮动按钮开关与设置数据的一致性。',
    update_item_options: '网站管理可修改默认网站，最近搜索会合并大小写相同的番号。',
    update_confirm: '知道了',
    detected: '检测到的番号', sites: '搜索网站', recent: '最近搜索',
    options: '⚙ 选项', search_btn: '🔍 一键搜索', searching: '搜索中...',
    no_code: '未检测到番号', no_sites: '尚未设置搜索网站', no_recent: '暂无最近搜索',
    just_now: '刚刚', minutes_ago: '分钟前', hours_ago: '小时前', days_ago: '天前'
  },
  en: {
    age_title: 'Age Verification', age_desc: 'This extension involves adult content sites.<br>Please confirm the following before continuing.',
    age_check1: 'I confirm I am 18 years of age or older',
    age_check2: 'I understand the purpose of this tool and it is legal to access such content in my region',
    age_confirm: 'Confirm & Continue', age_version_note: 'Re-confirmation required after v3.6.0 update',
    update_title: 'What changed',
    update_from: 'Updated',
    update_item_missav: 'MissAV now supports multiple search versions, checking regular and uncensored pages for the same code.',
    update_item_uncensored: 'The uncensored label is localized and follows your language setting.',
    update_item_consistency: 'Context menus, disabled sites, floating button settings, and stored site data now behave consistently.',
    update_item_options: 'Default sites can be edited, and recent searches merge codes that only differ by letter case.',
    update_confirm: 'Got it',
    detected: 'Detected Code', sites: 'Search Sites', recent: 'Recent Searches',
    options: '⚙ Options', search_btn: '🔍 Quick Search', searching: 'Searching...',
    no_code: 'No code detected', no_sites: 'No search sites configured', no_recent: 'No recent searches',
    just_now: 'Just now', minutes_ago: 'min ago', hours_ago: 'hours ago', days_ago: 'days ago'
  },
  ja: {
    age_title: '年齢確認', age_desc: 'この拡張機能はアダルトコンテンツサイトに関連しています。<br>続行する前に以下を確認してください。',
    age_check1: '私は18歳以上であることを確認します',
    age_check2: 'このツールの目的を理解し、私の地域でのアクセスが合法であることを確認します',
    age_confirm: '確認して続ける', age_version_note: 'v3.6.0 更新後に再確認が必要です',
    update_title: '今回の更新',
    update_from: '更新バージョン',
    update_item_missav: 'MissAV は複数バージョン検索に対応し、同じコードで通常版と無修正版を確認します。',
    update_item_uncensored: '無修正ラベルは多言語化され、現在の言語設定に従って表示されます。',
    update_item_consistency: '右クリックメニュー、無効化サイト、フローティングボタン設定、保存データの一貫性を修正しました。',
    update_item_options: '既定サイトを編集でき、最近の検索では大文字小文字だけが違うコードを統合します。',
    update_confirm: '了解',
    detected: '検出されたコード', sites: '検索サイト', recent: '最近の検索',
    options: '⚙ オプション', search_btn: '🔍 クイック検索', searching: '検索中...',
    no_code: 'コードが検出されません', no_sites: '検索サイトが未設定です', no_recent: '最近の検索はありません',
    just_now: 'たった今', minutes_ago: '分前', hours_ago: '時間前', days_ago: '日前'
  },
  ko: {
    age_title: '나이 확인', age_desc: '이 확장 프로그램은 성인 콘텐츠 사이트와 관련이 있습니다.<br>계속하기 전에 다음을 확인해 주세요.',
    age_check1: '저는 만 18세 이상임을 확인합니다',
    age_check2: '이 도구의 목적을 이해하며, 제 지역에서 해당 콘텐츠 이용이 합법적임을 확인합니다',
    age_confirm: '확인 후 계속', age_version_note: 'v3.6.0 업데이트 후 재확인 필요',
    update_title: '이번 업데이트',
    update_from: '업데이트 버전',
    update_item_missav: 'MissAV 다중 버전 검색을 지원하여 같은 코드의 일반판과 무수정판을 함께 확인합니다.',
    update_item_uncensored: '무수정 라벨은 다국어로 표시되며 현재 언어 설정을 따릅니다.',
    update_item_consistency: '컨텍스트 메뉴, 비활성 사이트, 플로팅 버튼 설정, 저장 데이터의 일관성을 수정했습니다.',
    update_item_options: '기본 사이트를 편집할 수 있고, 최근 검색은 대소문자만 다른 코드를 병합합니다.',
    update_confirm: '확인',
    detected: '감지된 코드', sites: '검색 사이트', recent: '최근 검색',
    options: '⚙ 옵션', search_btn: '🔍 빠른 검색', searching: '검색 중...',
    no_code: '코드가 감지되지 않음', no_sites: '검색 사이트가 설정되지 않음', no_recent: '최근 검색 없음',
    just_now: '방금', minutes_ago: '분 전', hours_ago: '시간 전', days_ago: '일 전'
  }
};

let currentSettings = DEFAULT_SETTINGS;
let currentLang = 'en';
let detectedCode = '';

function normalizeSearchCode(value) {
  const normalized = String(value || '')
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const key = normalized.replace(/[^A-Z0-9]/g, '');
  if (!/[A-Z]/.test(key) || !/[0-9]/.test(key)) return null;
  return { code: normalized, key };
}

function normalizeSearchHistory(history) {
  const seen = new Set();
  const normalized = [];
  (Array.isArray(history) ? history : []).forEach((item) => {
    const parsed = normalizeSearchCode(item?.code);
    if (!parsed || seen.has(parsed.key)) return;
    seen.add(parsed.key);
    normalized.push({ ...item, code: parsed.code, normalizedCode: parsed.key });
  });
  return normalized.slice(0, 20);
}

function detectLang() {
  const lang = navigator.language || 'en';
  if (lang === 'zh-TW' || lang === 'zh-HK') return 'zh-TW';
  if (lang.startsWith('zh')) return 'zh-CN';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('ko')) return 'ko';
  return 'en';
}

function resolveLang(pref) {
  return pref === 'auto' ? detectLang() : pref;
}

function applyLang(lang) {
  currentLang = resolveLang(lang);
  const strings = I18N[currentLang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!strings[key]) return;
    if (key === 'age_desc') {
      el.innerHTML = strings[key];
    } else {
      el.textContent = strings[key];
    }
  });
}

function applyTheme(mode) {
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.className = isDark ? 'theme-dark' : 'theme-light';
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.textContent = isDark ? '🌙' : '☀️';
}

async function toggleTheme() {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const effectiveDark = document.documentElement.classList.contains('theme-dark');
  const nextMode = result.themeMode === 'dark' || (result.themeMode === 'auto' && effectiveDark) ? 'light' : 'dark';
  await chrome.storage.sync.set({ themeMode: nextMode });
  applyTheme(nextMode);
}

async function initAgeGate() {
  const currentVersion = chrome.runtime.getManifest().version;
  const data = await chrome.storage.sync.get('ageVerifiedVersion');
  if (data.ageVerifiedVersion === currentVersion) return;

  const gate = document.getElementById('ageGate');
  const confirmBtn = document.getElementById('ageConfirmBtn');
  const versionNote = document.getElementById('ageVersionNote');
  const check1 = document.getElementById('ageCheck1');
  const check2 = document.getElementById('ageCheck2');

  versionNote.textContent = `v${currentVersion} 更新後需重新確認`;
  gate.style.display = 'flex';

  function updateBtn() {
    const ok = check1.checked && check2.checked;
    confirmBtn.disabled = !ok;
    confirmBtn.classList.toggle('ready', ok);
  }
  check1.addEventListener('change', updateBtn);
  check2.addEventListener('change', updateBtn);

  confirmBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({ ageVerifiedVersion: currentVersion });
    gate.style.transition = 'opacity .35s';
    gate.style.opacity = '0';
    setTimeout(() => { gate.style.display = 'none'; showUpdateNotice(); }, 380);
  });
}

function showUpdateNotice() {
  const notice = document.getElementById('updateNotice');
  if (!notice || !currentSettings.showUpdateNotification) return;

  const ageGate = document.getElementById('ageGate');
  if (ageGate && ageGate.style.display !== 'none') return;

  const strings = I18N[currentLang] || I18N.en;
  const manifestVersion = chrome.runtime.getManifest().version;
  const versionText = document.getElementById('updateVersionText');
  if (versionText) {
    const fromVersion = currentSettings.updateFromVersion;
    versionText.textContent = fromVersion
      ? `${strings.update_from}: ${fromVersion} -> ${manifestVersion}`
      : `${strings.update_from}: v${manifestVersion}`;
  }
  notice.hidden = false;
}

async function dismissUpdateNotice() {
  const notice = document.getElementById('updateNotice');
  if (notice) notice.hidden = true;
  currentSettings.showUpdateNotification = false;
  await chrome.storage.sync.set({ showUpdateNotification: false });
  if (chrome.action?.setBadgeText) chrome.action.setBadgeText({ text: '' });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAgeGate();
  const manifestVersion = chrome.runtime.getManifest().version;

  currentSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const localData = await chrome.storage.local.get(['searchHistory']);
  const normalizedHistory = normalizeSearchHistory(localData.searchHistory);
  if (JSON.stringify(normalizedHistory) !== JSON.stringify(localData.searchHistory || [])) {
    await chrome.storage.local.set({ searchHistory: normalizedHistory });
  }
  currentSettings.searchHistory = normalizedHistory;
  applyTheme(currentSettings.themeMode);
  applyLang(currentSettings.language);
  renderSiteToggles(currentSettings.settings);
  renderRecentSearches(normalizedHistory);

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('updateConfirmBtn')?.addEventListener('click', dismissUpdateNotice);
  document.getElementById('optionsBtn')?.addEventListener('click', () => chrome.runtime.openOptionsPage());

  const versionText = document.getElementById('versionText');
  if (versionText) versionText.textContent = `v${manifestVersion}`;
  showUpdateNotice();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const codeEl = document.getElementById('detectedCode');
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { type: 'GET_CODE' }, (response) => {
    const strings = I18N[currentLang] || I18N.en;
    if (chrome.runtime.lastError) {
      detectedCode = '';
      if (codeEl) codeEl.textContent = strings.no_code;
      return;
    }
    const rawCode = response?.code || response?.result?.code || '';
    const resultCode = typeof rawCode === 'string' ? rawCode : rawCode?.code || '';
    const normalized = normalizeSearchCode(resultCode);
    detectedCode = normalized?.code || resultCode;
    if (codeEl) codeEl.textContent = detectedCode || strings.no_code;
    if (detectedCode) appendSearchHistory(detectedCode);
  });
});

function renderSiteToggles(settings) {
  const list = document.getElementById('siteToggleList');
  if (!list) return;
  const strings = I18N[currentLang] || I18N.en;
  list.innerHTML = '';

  if (!Array.isArray(settings) || settings.length === 0) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(strings.no_sites)}</div>`;
    return;
  }

  settings.forEach((site, index) => {
    const version = site.versions?.[0] || {};
    const baseUrl = version.baseUrl || site.baseUrl || '';
    const row = document.createElement('div');
    row.className = 'site-toggle-row';
    row.innerHTML = `
      <div class="site-toggle-meta">
        <div class="site-toggle-name">${escapeHtml(site.name || '')}</div>
        <div class="site-toggle-url">${escapeHtml(baseUrl)}</div>
      </div>
      <label class="switch">
        <input type="checkbox" ${site.enabled === false ? '' : 'checked'} data-site-index="${index}">
        <span></span>
      </label>
    `;
    row.querySelector('input').addEventListener('change', async (event) => {
      const updated = [...(currentSettings.settings || [])];
      updated[index] = { ...updated[index], enabled: event.target.checked };
      currentSettings.settings = updated;
      await chrome.storage.sync.set({ settings: updated });
      chrome.runtime.sendMessage({ action: 'updateContextMenu' });
    });
    list.appendChild(row);
  });
}

function renderRecentSearches(history) {
  const section = document.getElementById('recentSearchSection');
  const list = document.getElementById('recentSearchList');
  if (!section || !list) return;
  const strings = I18N[currentLang] || I18N.en;
  const items = normalizeSearchHistory(history).slice(0, 5);
  list.innerHTML = '';

  if (items.length === 0) {
    section.style.display = 'block';
    list.innerHTML = `<div class="empty-state">${escapeHtml(strings.no_recent)}</div>`;
    return;
  }

  section.style.display = 'block';
  items.forEach((item) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'recent-row';
    row.innerHTML = `
      <span>${escapeHtml(item.code)}</span>
      <small>${escapeHtml(formatRelativeTime(item.timestamp))}</small>
    `;
    row.addEventListener('click', () => {
      detectedCode = item.code;
      const codeEl = document.getElementById('detectedCode');
      if (codeEl) codeEl.textContent = item.code;
      doSearch(item.code);
    });
    list.appendChild(row);
  });
}

function formatRelativeTime(timestamp) {
  const strings = I18N[currentLang] || I18N.en;
  const seconds = Math.max(0, Math.floor((Date.now() - Number(timestamp || 0)) / 1000));
  if (seconds < 60) return strings.just_now;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${strings.minutes_ago}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${strings.hours_ago}`;
  return `${Math.floor(hours / 24)} ${strings.days_ago}`;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value || '';
  return div.innerHTML;
}

async function appendSearchHistory(code) {
  const normalized = normalizeSearchCode(code);
  if (!normalized) return;
  const result = await chrome.storage.local.get(['searchHistory']);
  const existing = normalizeSearchHistory(result.searchHistory);
  const updated = [
    { code: normalized.code, normalizedCode: normalized.key, timestamp: Date.now() },
    ...existing.filter((item) => item.normalizedCode !== normalized.key)
  ].slice(0, 20);
  await chrome.storage.local.set({ searchHistory: updated });
  renderRecentSearches(updated);
}

async function doSearch(code) {
  if (!code) return;
  await appendSearchHistory(code);

  let currentHost = '';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentHost = tab?.url ? new URL(tab.url).hostname : '';
  } catch (error) {
    currentHost = '';
  }

  const enabledSiteIds = [];
  (currentSettings.settings || []).forEach((site) => {
    if (site.enabled === false) return;
    (site.versions || []).forEach((version) => enabledSiteIds.push(`${site.id}_${version.id}`));
  });

  chrome.runtime.sendMessage({
    action: 'checkUrls',
    code,
    limitedSites: enabledSiteIds.length ? enabledSiteIds : null,
    ...(currentHost ? { currentHost } : {})
  }, (response) => {
    const results = (response?.results || []).filter((item) => item.status === 'available');
    results.forEach((item) => {
      const resultUrl = item.finalUrl || item.url;
      chrome.runtime.sendMessage({
        action: 'openResultUrl',
        url: resultUrl,
        matchUrls: [item.finalUrl, item.url, ...(Array.isArray(item.matchUrls) ? item.matchUrls : [])]
      });
    });
  });
}
