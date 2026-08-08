// =============================================
// 開發者模式 Debug Log
// =============================================

let devMode = false;
chrome.storage.sync.get(['devMode'], (r) => { devMode = Boolean(r.devMode); });
let enableCache = true;
chrome.storage.sync.get(['enableCache'], (r) => { enableCache = r.enableCache !== false; });
chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'sync' && 'devMode' in changes) devMode = Boolean(changes.devMode.newValue);
  if ('enableCache' in changes) enableCache = changes.enableCache.newValue !== false;
});
function dbg(...args) { if (devMode) console.log(...args); }

function normalizeSearchCode(value) {
  const code = String(value || '')
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const key = code.replace(/[^A-Z0-9]/g, '');
  if (!/[A-Z]/.test(key) || !/[0-9]/.test(key)) return null;
  return { code, key };
}

function detectLang() {
  const lang = globalThis.navigator?.language || 'en';
  if (lang === 'zh-TW' || lang === 'zh-HK') return 'zh-TW';
  if (lang.startsWith('zh')) return 'zh-CN';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('ko')) return 'ko';
  return 'en';
}

function resolveLang(pref) {
  return pref === 'auto' ? detectLang() : pref;
}

function getUncensoredLabel(language) {
  return ({
    'zh-TW': '無碼',
    'zh-CN': '无码',
    ja: '無修正',
    ko: '무수정',
    en: 'Uncensored'
  })[resolveLang(language)] || 'Uncensored';
}

const CONTEXT_MENU_ID_SEPARATOR = '__';

function encodeContextMenuId(siteId, versionId) {
  return `${siteId}${CONTEXT_MENU_ID_SEPARATOR}${versionId}`;
}

function parseContextMenuId(menuItemId) {
  if (!menuItemId || menuItemId === 'parent') return null;
  const separatorIndex = menuItemId.indexOf(CONTEXT_MENU_ID_SEPARATOR);
  if (separatorIndex >= 0) {
    return {
      siteId: menuItemId.slice(0, separatorIndex),
      versionId: menuItemId.slice(separatorIndex + CONTEXT_MENU_ID_SEPARATOR.length)
    };
  }

  const legacySeparatorIndex = menuItemId.indexOf('_');
  if (legacySeparatorIndex < 0) return null;
  return {
    siteId: menuItemId.slice(0, legacySeparatorIndex),
    versionId: menuItemId.slice(legacySeparatorIndex + 1)
  };
}

function getSiteVersions(site) {
  if (Array.isArray(site.versions) && site.versions.length > 0) {
    return site.versions;
  }
  if (site.baseUrl) {
    return [{ id: 'legacy', name: '預設', baseUrl: site.baseUrl }];
  }
  return [];
}

const TEMPLATE_TOKEN_PATTERN = /\{\}|\{lower\}|\{upper\}|\{nodash\}|\{dmm\}/g;

function applyCodeTemplate(template, code) {
  const value = String(code ?? '');
  const alphanumeric = value.replace(/[^A-Za-z0-9]/g, '');
  const dmmMatch = value.match(/^([A-Za-z]+)[^A-Za-z0-9]*([0-9]+)$/);
  const dmm = dmmMatch
    ? `${dmmMatch[1].toLowerCase()}${dmmMatch[2].padStart(5, '0')}`
    : alphanumeric.toLowerCase();
  const replacements = {
    '{}': value,
    '{lower}': value.toLowerCase(),
    '{upper}': value.toUpperCase(),
    '{nodash}': alphanumeric,
    '{dmm}': dmm
  };

  return String(template ?? '').replace(TEMPLATE_TOKEN_PATTERN, (token) => encodeURIComponent(replacements[token]));
}

function getTemplateHostname(template) {
  try {
    const resolvedTemplate = String(template ?? '').replace(TEMPLATE_TOKEN_PATTERN, '__QL_CODE__');
    return new URL(resolvedTemplate).hostname;
  } catch (error) {
    return null;
  }
}

function isSameSiteHost(firstHost, secondHost) {
  const first = String(firstHost || '').toLowerCase().replace(/^www\./, '');
  const second = String(secondHost || '').toLowerCase().replace(/^www\./, '');
  if (!first || !second) return false;
  return first === second || first.endsWith(`.${second}`) || second.endsWith(`.${first}`);
}

// =============================================
// URL 可用性 Cache（chrome.storage.session，TTL 30 分鐘）
// =============================================

const CACHE_TTL = 30 * 60 * 1000;
const TAB_GROUP_ID_NONE = -1;

async function getCachedUrl(url, cacheEnabled = enableCache) {
  if (!cacheEnabled) return null;
  try {
    const key = 'uc_' + url;
    const result = await chrome.storage.session.get(key);
    const entry = result[key];
    if (!entry) {
      dbg('[QuickLinker] Cache MISS:', url);
      return null;
    }
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      dbg('[QuickLinker] Cache EXPIRED:', url);
      await chrome.storage.session.remove(key);
      return null;
    }
    dbg('[QuickLinker] Cache HIT:', url, '→', entry.available ? 'available' : 'unavailable');
    return entry;
  } catch (error) {
    dbg('[QuickLinker] Cache READ failed:', url, error.message);
    return null;
  }
}

async function setCachedUrl(url, available, finalUrl, cacheEnabled = enableCache) {
  if (!cacheEnabled) return;
  try {
    const key = 'uc_' + url;
    await chrome.storage.session.set({ [key]: { available, finalUrl, timestamp: Date.now() } });
    dbg('[QuickLinker] Cache WRITE:', url, '→', available ? 'available' : 'unavailable');
  } catch (error) {
    dbg('[QuickLinker] Cache WRITE failed:', url, error.message);
  }
}

function classifyProbeResponse(response, requestedUrl) {
  if (response.status >= 200 && response.status < 300) {
    try {
      const redirectedToRoot = response.redirected
        && new URL(response.url).pathname === '/'
        && new URL(requestedUrl).pathname !== '/';
      return redirectedToRoot ? 'unavailable' : 'available';
    } catch (error) {
      return 'available';
    }
  }
  if (response.status === 404 || response.status === 410) return 'unavailable';
  return 'unknown';
}

async function runAvailabilityProbe(url, method) {
  try {
    const response = await fetch(url, { method, cache: 'no-cache' });
    const status = classifyProbeResponse(response, url);
    const finalUrl = response.url || url;

    if (method === 'GET' && response.body) {
      try {
        await response.body.cancel();
      } catch (error) {
        dbg('[QuickLinker] Failed to cancel GET response body:', url, error.message);
      }
    }

    dbg('[QuickLinker] Probe result:', method, url, '→', response.status, status, '| finalUrl:', finalUrl, '| redirected:', response.redirected);
    return { status, finalUrl };
  } catch (error) {
    dbg('[QuickLinker] Probe failed:', method, url, error.message);
    return { status: 'unknown', finalUrl: url };
  }
}

async function probeUrlAvailability(url) {
  let result = await runAvailabilityProbe(url, 'HEAD');
  if (result.status === 'unknown') {
    dbg('[QuickLinker] Retrying unknown probe with GET:', url);
    result = await runAvailabilityProbe(url, 'GET');
  }
  return result;
}

async function getAvailabilityResult(urlInfo, cacheEnabled) {
  const cached = await getCachedUrl(urlInfo.url, cacheEnabled);
  if (cached) {
    dbg('[QuickLinker] Cache hit:', urlInfo.url);
    return {
      ...urlInfo,
      status: cached.available ? 'available' : 'unavailable',
      finalUrl: cached.finalUrl || urlInfo.url
    };
  }

  const probe = await probeUrlAvailability(urlInfo.url);
  if (probe.status !== 'unknown') {
    await setCachedUrl(urlInfo.url, probe.status === 'available', probe.finalUrl, cacheEnabled);
  }
  return { ...urlInfo, status: probe.status, finalUrl: probe.finalUrl };
}

function normalizeResultUrl(url) {
  const parsed = new URL(url);
  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = '';
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }
  return parsed.href;
}

function getResultUrlCandidates(url, matchUrls = []) {
  const candidates = [];
  for (const candidate of [url, ...(Array.isArray(matchUrls) ? matchUrls : [])]) {
    if (!candidate) continue;
    try {
      candidates.push(normalizeResultUrl(candidate));
    } catch (error) {
      // Invalid secondary candidates should not block opening the primary URL.
    }
  }
  return [...new Set(candidates)];
}

function getGenericResultKey(parsedOrUrl) {
  try {
    const parsed = typeof parsedOrUrl === 'string' ? new URL(parsedOrUrl) : parsedOrUrl;
    const hostname = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    pathname = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?\//, '/');
    return `${hostname}:${pathname}:${parsed.search}`;
  } catch (e) {
    return '';
  }
}

function getEquivalentResultKey(url) {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();

  if (hostname !== 'missav.ai') return getGenericResultKey(parsed);

  const path = parsed.pathname.toLowerCase();
  const segments = path.split('/').filter(Boolean);

  const CODE_RE = /^([a-z0-9]+-\d+)(-uncensored-leak)?$/;
  for (const seg of segments) {
    const m = seg.match(CODE_RE);
    if (m) {
      const variant = m[2] ? 'uncensored' : 'normal';
      return `${hostname}:${m[1]}:${variant}:${parsed.search}`;
    }
  }
  return '';
}

function getResultUrlCandidateKeys(url, matchUrls = []) {
  const keys = [];
  for (const candidate of [url, ...(Array.isArray(matchUrls) ? matchUrls : [])]) {
    if (!candidate) continue;
    try {
      const key = getEquivalentResultKey(candidate);
      if (key) keys.push(key);
    } catch (error) {
      // Invalid secondary candidates should not block opening the primary URL.
    }
  }
  return [...new Set(keys)];
}

function logDedupe(step, details, level = 'log') {
  console[level](`[QuickLinker Dedupe][${step}]`, details);
}

function getTabComparableUrl(tab) {
  return tab?.url || tab?.pendingUrl || '';
}

function getDedupeScanRows(tabs, targets, targetKeys) {
  return tabs
    .map((tab) => {
      const tabUrl = getTabComparableUrl(tab);
      let normalizedUrl = '';
      let tabKey = '';
      let exactMatch = false;
      let keyMatch = false;

      try {
        normalizedUrl = tabUrl ? normalizeResultUrl(tabUrl) : '';
        exactMatch = Boolean(normalizedUrl && targets.includes(normalizedUrl));
      } catch (error) {
        normalizedUrl = '';
      }

      try {
        tabKey = tabUrl ? getEquivalentResultKey(tabUrl) : '';
        keyMatch = Boolean(tabKey && targetKeys.includes(tabKey));
      } catch (error) {
        tabKey = '';
      }

      return {
        tabId: tab.id,
        windowId: tab.windowId,
        groupId: tab.groupId,
        tabUrl,
        pendingUrl: tab.pendingUrl,
        normalizedUrl,
        tabKey,
        exactMatch,
        keyMatch
      };
    })
    .filter((row) => (
      row.exactMatch ||
      row.keyMatch ||
      row.tabKey ||
      /missav\.ai|jable\.tv|javdb\.com/i.test(row.tabUrl || '')
    ));
}

function isGroupedTab(tab) {
  return tab?.groupId != null && tab.groupId !== TAB_GROUP_ID_NONE;
}

function tabMatchesTargets(tab, targets, targetKeys) {
  const tabUrl = getTabComparableUrl(tab);
  if (!tabUrl || tab.id == null || tab.windowId == null) return false;
  try {
    if (targets.includes(normalizeResultUrl(tabUrl))) return true;
    const tabKey = getEquivalentResultKey(tabUrl);
    return Boolean(tabKey && targetKeys.includes(tabKey));
  } catch (error) {
    return false;
  }
}

async function openResultUrl(url, matchUrls = [], senderTab = null) {
  try {
    normalizeResultUrl(url);
  } catch (error) {
    return { ok: false, error: error.message };
  }

  const effectiveMatchUrls = Array.isArray(matchUrls) ? matchUrls : [];
  const targets = getResultUrlCandidates(url, effectiveMatchUrls);
  const targetKeys = getResultUrlCandidateKeys(url, effectiveMatchUrls);
  const tabs = await chrome.tabs.query({});
  const existingTab = tabs.find(t => tabMatchesTargets(t, targets, targetKeys));
  const scanRows = getDedupeScanRows(tabs, targets, targetKeys);

  logDedupe('SCAN', {
    description: 'Scanned open tabs before deciding whether to reuse or create.',
    requestedUrl: url,
    matchUrls,
    senderTab: senderTab ? {
      tabId: senderTab.id,
      windowId: senderTab.windowId,
      groupId: senderTab.groupId,
      url: senderTab.url,
      pendingUrl: senderTab.pendingUrl
    } : null,
    targets,
    targetKeys,
    scannedTabCount: tabs.length,
    relevantTabs: scanRows
  });

  if (existingTab) {
    logDedupe('MATCH', {
      description: 'Found an existing tab for the requested result URL.',
      tabId: existingTab.id,
      windowId: existingTab.windowId,
      groupId: existingTab.groupId,
      tabUrl: getTabComparableUrl(existingTab),
      requestedUrl: url,
      matchUrls: effectiveMatchUrls,
      targets,
      targetKeys
    });
    logDedupe('FOCUS', {
      description: 'Activating matched tab and focusing its window.',
      tabId: existingTab.id,
      windowId: existingTab.windowId
    });
    await chrome.tabs.update(existingTab.id, { active: true });
    await chrome.windows.update(existingTab.windowId, { focused: true });
    return {
      ok: true,
      reused: true,
      tabId: existingTab.id,
      windowId: existingTab.windowId
    };
  }

  logDedupe('CREATE', {
    description: 'No existing tab matched. Creating a new result tab.',
    requestedUrl: url,
    matchUrls: effectiveMatchUrls,
    targets,
    targetKeys,
    scannedTabCount: tabs.length,
    relevantTabs: scanRows
  });

  const tab = await chrome.tabs.create({ url });
  return {
    ok: true,
    reused: false,
    tabId: tab.id,
    windowId: tab.windowId
  };
}

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
      if (site.enabled === false) return;
      const versions = getSiteVersions(site);
      // 直接創建一層選單：網站名稱 - 版本名稱
      if (versions.length > 0) {
        versions.forEach(version => {
          // 組合顯示名稱
          const displayName = versions.length > 1
            ? `${site.name} - ${version.name}`  // 多版本時顯示版本名稱
            : site.name;  // 單版本時只顯示網站名稱

          chrome.contextMenus.create({
            id: encodeContextMenuId(site.id, version.id),
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
  const parsedMenuId = parseContextMenuId(info.menuItemId);
  if (parsedMenuId) {
    const { siteId, versionId } = parsedMenuId;
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || [];
      const site = settings.find(s => s.id === siteId);
      if (site && site.enabled !== false && info.selectionText) {
        const version = getSiteVersions(site).find(v => v.id === versionId);
        if (version) {
          const url = applyCodeTemplate(version.baseUrl, info.selectionText);
          openResultUrl(url).catch((error) => {
            console.error('[QuickLinker] Failed to open result URL:', error);
          });
          const normalized = normalizeSearchCode(info.selectionText);
          if (!normalized) return;
          chrome.storage.local.get(['searchHistory'], ({ searchHistory = [] }) => {
            const history = Array.isArray(searchHistory) ? searchHistory : [];
            const next = [
              { code: normalized.code, normalizedCode: normalized.key, timestamp: Date.now() },
              ...history.filter((item) => normalizeSearchCode(item.code)?.key !== normalized.key)
            ].slice(0, 20);
            chrome.storage.local.set({ searchHistory: next });
          });
        }
      }
    });
  }
});

// =============================================
// 擴充功能生命週期事件 (Extension Lifecycle Events)
// =============================================

async function migrateSearchHistoryFromSync() {
  const syncData = await chrome.storage.sync.get(['searchHistory']);
  const syncHistory = syncData.searchHistory;
  if (!Array.isArray(syncHistory) || syncHistory.length === 0) return;
  const localData = await chrome.storage.local.get(['searchHistory']);
  const localHistory = Array.isArray(localData.searchHistory) ? localData.searchHistory : [];
  const merged = new Map();
  for (const item of [...localHistory, ...syncHistory]) {
    const norm = normalizeSearchCode(item.code);
    if (!norm) continue;
    const existing = merged.get(norm.key);
    if (!existing || Number(item.timestamp) > Number(existing.timestamp)) {
      merged.set(norm.key, { code: item.code, normalizedCode: norm.key, timestamp: item.timestamp });
    }
  }
  const result = Array.from(merged.values())
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 20);
  await chrome.storage.local.set({ searchHistory: result });
  await chrome.storage.sync.remove('searchHistory');
  dbg('[QuickLinker] Migrated searchHistory from sync to local:', result.length, 'entries');
}

chrome.runtime.onStartup.addListener(() => {
  migrateSearchHistoryFromSync();
});

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
    dbg('[QuickLinker] 擴充功能已安裝');
    // 首次安裝也顯示功能介紹
    chrome.storage.sync.set({
      showUpdateNotification: true,
      updateFromVersion: null
    });
    chrome.action.setBadgeText({ text: 'NEW' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  }

  migrateSearchHistoryFromSync();

  chrome.storage.sync.get(['settings'], (result) => {
    let settings = result.settings || [];
    let updated = false;

    const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    // 數據遷移：舊格式轉新格式
    settings = settings.map(site => {
      if (!site.versions) {
        // 舊格式：{ name: 'JavDB', baseUrl: '...' }
        dbg('[QuickLinker] Migrating old format site:', site.name);
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
          { id: generateUniqueId(), name: '預設', baseUrl: 'https://javdb.com/search?q={}&f=all' }
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
  if (message.action === 'openResultUrl') {
    openResultUrl(message.url, message.matchUrls, sender.tab)
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

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
      const stored = await chrome.storage.sync.get(['settings', 'scanMode', 'language', 'excludeCurrentSite', 'enableCache']);
      const settings = stored.settings;
      const scanMode = stored.scanMode; // 不帶預設，維持既有掃描模式取捨規則
      const language = stored.language;
      const excludeCurrentSite = stored.excludeCurrentSite !== false;
      const cacheEnabled = stored.enableCache !== false;
      const code = message.code;
      const limitedSites = message.limitedSites;
      const messageUrls = Array.isArray(message.urls) ? message.urls : null;
      const currentHost = typeof message.currentHost === 'string' ? message.currentHost : '';
      const effectiveScanMode = messageUrls ? 'fullScan' : scanMode;
      const uncensoredLabel = getUncensoredLabel(language || 'auto');

      dbg('[QuickLinker] Checking URLs for code:', code);
      dbg('[QuickLinker] Current host:', currentHost || '(missing)');
      dbg('[QuickLinker] Limited sites:', limitedSites);
      dbg('[QuickLinker] Message URLs:', messageUrls);

      // 建立待檢查清單
      const tasks = messageUrls || [];
      for (const site of settings || []) {
        if (site.enabled === false) continue;
        for (const version of getSiteVersions(site)) {
          const siteVersionId = `${site.id}_${version.id}`;
          if (limitedSites && !limitedSites.includes(siteVersionId)) {
            continue;
          }
          const baseUrl = String(version.baseUrl ?? '');
          // 僅「標準 missav 來源」（baseUrl 樣板為 https://missav.ai/{}）才自動展開 normal/uncensored 變體；
          // 其餘 missav 來源（如 fc2-ppv-{}）走一般流程，保留原始 baseUrl 前綴，避免前綴遺失與重複 URL
          let isStandardMissavBase = false;
          try {
            const usesOnlyUnchangedToken = baseUrl.includes('{}') && !/\{(?:lower|upper|nodash|dmm)\}/.test(baseUrl);
            const templateUrl = new URL(applyCodeTemplate(baseUrl, '__QL_CODE__'));
            isStandardMissavBase = usesOnlyUnchangedToken
              && templateUrl.hostname === 'missav.ai'
              && templateUrl.pathname === '/__QL_CODE__';
          } catch (error) {
            isStandardMissavBase = false;
          }
          if (isStandardMissavBase) {
            const missavCode = encodeURIComponent(code.toLowerCase());
            dbg('[QuickLinker] Expanding MissAV variants:', code);
            tasks.push({
              id: `${siteVersionId}_normal`,
              url: `https://missav.ai/${missavCode}`,
              siteName: site.name,
              label: ''
            });
            tasks.push({
              id: `${siteVersionId}_uncensored_leak`,
              url: `https://missav.ai/${missavCode}-uncensored-leak`,
              matchUrls: [
                `https://missav.ai/${missavCode}-uncensored-leak`,
                `https://missav.ai/dm2/${missavCode}-uncensored-leak`
              ],
              siteName: `${site.name} - ${uncensoredLabel}`,
              label: uncensoredLabel
            });
            continue;
          }
          const fullUrl = applyCodeTemplate(baseUrl, code);
          tasks.push({ id: siteVersionId, url: fullUrl, siteName: `${site.name} - ${version.name}` });
        }
      }

      // 傳入的網址清單與設定站台可能組出相同 URL（如 MissAV 頁面），先去重再排除同站
      const seenTaskUrls = new Set();
      const scanTasks = tasks.filter((task) => {
        if (seenTaskUrls.has(task.url)) {
          dbg('[QuickLinker] Skipping duplicate URL:', task.url);
          return false;
        }
        seenTaskUrls.add(task.url);
        if (excludeCurrentSite && currentHost) {
          const host = getTemplateHostname(task.url);
          if (host && isSameSiteHost(currentHost, host)) {
            dbg('[QuickLinker] Skipping same-site task:', task.url);
            return false;
          }
        }
        return true;
      });

      if (effectiveScanMode === 'bestMatch') {
        // bestMatch：循序檢查，找到第一個可用即停止
        const results = [];
        for (const urlInfo of scanTasks) {
          try {
            const result = await getAvailabilityResult(urlInfo, cacheEnabled);
            results.push(result);
            if (result.status === 'available') {
              sendResponse({ results });
              return;
            }
          } catch (error) {
            dbg('[QuickLinker] Failed to assemble availability result:', urlInfo.url, error.message);
            results.push({ ...urlInfo, status: 'error', error: error.message });
          }
        }
        sendResponse({ results });
      } else {
        // fullScan：平行檢查所有網站，大幅加速
        dbg('[QuickLinker] Full scan: checking', scanTasks.length, 'URLs in parallel');
        const results = await Promise.all(scanTasks.map(async (urlInfo) => {
          try {
            return await getAvailabilityResult(urlInfo, cacheEnabled);
          } catch (error) {
            dbg('[QuickLinker] Failed to assemble availability result:', urlInfo.url, error.message);
            return { ...urlInfo, status: 'error', error: error.message };
          }
        }));
        dbg('[QuickLinker] Sending final results:', results.length, 'items');
        sendResponse({ results });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
