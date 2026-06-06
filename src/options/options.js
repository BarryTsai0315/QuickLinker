const I18N = {
  'zh-TW': {
    age_title:'年齡驗證', age_desc:'本擴充功能涉及成人內容網站。<br>繼續使用前請確認以下事項。',
    age_check1:'我確認我已年滿 18 歲',
    age_check2:'我了解本工具的用途，且在我所在地區使用此類內容合法',
    age_confirm:'確認並繼續', age_version_note:'v3.6.0 更新後需重新確認',
    detected:'偵測到的番號', sites:'搜尋網站', recent:'最近搜尋',
    options:'⚙ 選項', options_title:'設定', new_tab:'在新分頁開啟',
    nav_sites:'網站管理', nav_scan:'掃描模式', nav_appearance:'外觀',
    nav_general:'一般設定', nav_io:'匯入/匯出',
    search_btn:'🔍 一鍵搜尋', searching:'搜尋中…',
    theme_label:'深色模式', theme_desc:'預設跟隨瀏覽器（系統）設定',
    theme_auto:'🖥 跟隨系統', theme_dark:'🌙 深色', theme_light:'☀️ 淺色',
    lang_label:'顯示語言', lang_desc:'預設跟隨瀏覽器語言設定', lang_auto:'跟隨瀏覽器',
    scan_best:'最佳結果', scan_best_desc:'找到第一個可用連結後立即停止，速度更快。',
    scan_full:'完整掃描', scan_full_desc:'平行掃描所有網站，顯示全部結果。',
    close_tab:'搜尋後關閉原始分頁', close_tab_desc:'開啟搜尋結果後自動關閉原本頁面',
    float_btn:'顯示浮動按鈕', float_btn_desc:'在偵測到番號的頁面顯示快捷按鈕',
    update_notify:'版本更新通知', update_notify_desc:'更新後顯示新功能提示',
    add_site:'新增網站', edit_site:'修改', save_site:'儲存', cancel:'取消', delete_site:'刪除', delete_confirm:'確定要刪除此網站？',
    site_name_placeholder:'網站名稱', base_url_placeholder:'搜尋網址，使用 {} 代表番號',
    base_url_error:'Base URL 必須包含 {}。', invalid_settings_file:'設定檔格式不正確。',
    import_complete:'匯入完成。', import_failed:'匯入失敗。', clear_confirm:'確定要清除全部設定？',
    io_desc:'將設定備份或還原到另一台裝置',
    export:'匯出設定', import:'匯入設定', danger:'危險區域',
    danger_desc:'此操作無法復原', clear_all:'清除全部設定',
    t_2m:'2 分鐘前', t_1h:'1 小時前', t_yd:'昨天',
    dev_section:'開發人員選項', dev_section_desc:'供回報問題使用，一般使用者不需開啟',
    dev_mode:'開發者模式', dev_mode_desc:'啟用後將在 Service Worker 主控台顯示詳細 log',
  },
  'zh-CN': {
    age_title:'年龄验证', age_desc:'本扩展涉及成人内容网站。<br>继续使用前请确认以下事项。',
    age_check1:'我确认我已年满 18 岁',
    age_check2:'我了解本工具的用途，且在我所在地区使用此类内容合法',
    age_confirm:'确认并继续', age_version_note:'v3.6.0 更新后需重新确认',
    detected:'检测到的番号', sites:'搜索网站', recent:'最近搜索',
    options:'⚙ 选项', options_title:'设置', new_tab:'在新标签页打开',
    nav_sites:'网站管理', nav_scan:'扫描模式', nav_appearance:'外观',
    nav_general:'常规设置', nav_io:'导入/导出',
    search_btn:'🔍 一键搜索', searching:'搜索中…',
    theme_label:'深色模式', theme_desc:'默认跟随浏览器（系统）设置',
    theme_auto:'🖥 跟随系统', theme_dark:'🌙 深色', theme_light:'☀️ 浅色',
    lang_label:'显示语言', lang_desc:'默认跟随浏览器语言设置', lang_auto:'跟随浏览器',
    scan_best:'最佳结果', scan_best_desc:'找到第一个可用链接后立即停止，速度更快。',
    scan_full:'完整扫描', scan_full_desc:'并行扫描所有网站，显示全部结果。',
    close_tab:'搜索后关闭原标签页', close_tab_desc:'打开搜索结果后自动关闭原页面',
    float_btn:'显示悬浮按钮', float_btn_desc:'在检测到番号的页面显示快捷按钮',
    update_notify:'版本更新通知', update_notify_desc:'更新后显示新功能提示',
    add_site:'添加网站', edit_site:'修改', save_site:'保存', cancel:'取消', delete_site:'删除', delete_confirm:'确定要删除此网站？',
    site_name_placeholder:'网站名称', base_url_placeholder:'搜索网址，使用 {} 代表番号',
    base_url_error:'Base URL 必须包含 {}。', invalid_settings_file:'设置文件格式不正确。',
    import_complete:'导入完成。', import_failed:'导入失败。', clear_confirm:'确定要清除全部设置？',
    io_desc:'将设置备份或还原到另一台设备',
    export:'导出设置', import:'导入设置', danger:'危险区域',
    danger_desc:'此操作无法撤销', clear_all:'清除全部设置',
    t_2m:'2 分钟前', t_1h:'1 小时前', t_yd:'昨天',
    dev_section:'开发者选项', dev_section_desc:'供反馈问题使用，普通用户无需开启',
    dev_mode:'开发者模式', dev_mode_desc:'启用后将在 Service Worker 控制台显示详细日志',
  },
  'en': {
    age_title:'Age Verification', age_desc:'This extension involves adult content sites.<br>Please confirm the following before continuing.',
    age_check1:'I confirm I am 18 years of age or older',
    age_check2:'I understand the purpose of this tool and it is legal to access such content in my region',
    age_confirm:'Confirm & Continue', age_version_note:'Re-confirmation required after v3.6.0 update',
    detected:'Detected Code', sites:'Search Sites', recent:'Recent Searches',
    options:'⚙ Options', options_title:'Settings', new_tab:'Opens in new tab',
    nav_sites:'Sites', nav_scan:'Scan Mode', nav_appearance:'Appearance',
    nav_general:'General', nav_io:'Import / Export',
    search_btn:'🔍 Quick Search', searching:'Searching…',
    theme_label:'Dark Mode', theme_desc:'Default: follows browser (system) setting',
    theme_auto:'🖥 Follow System', theme_dark:'🌙 Dark', theme_light:'☀️ Light',
    lang_label:'Language', lang_desc:'Default: follows browser language', lang_auto:'Follow Browser',
    scan_best:'Best Match', scan_best_desc:'Stop at first available link. Faster.',
    scan_full:'Full Scan', scan_full_desc:'Scan all sites in parallel. Shows all results.',
    close_tab:'Close original tab after search', close_tab_desc:'Auto-close original page when search results open',
    float_btn:'Show floating button', float_btn_desc:'Display shortcut button on detected pages',
    update_notify:'Update notifications', update_notify_desc:'Show new features after an update',
    add_site:'Add Site', edit_site:'Edit', save_site:'Save', cancel:'Cancel', delete_site:'Delete', delete_confirm:'Delete this site?',
    site_name_placeholder:'Site name', base_url_placeholder:'Search URL, use {} for the code',
    base_url_error:'Base URL must include {}.', invalid_settings_file:'Invalid settings file.',
    import_complete:'Import complete.', import_failed:'Import failed.', clear_confirm:'Clear all settings?',
    io_desc:'Backup or restore your settings to another device',
    export:'Export Settings', import:'Import Settings', danger:'Danger Zone',
    danger_desc:'This action cannot be undone', clear_all:'Clear All Settings',
    t_2m:'2 min ago', t_1h:'1 hour ago', t_yd:'Yesterday',
    dev_section:'Developer Options', dev_section_desc:'For bug reporting. Regular users do not need this.',
    dev_mode:'Developer Mode', dev_mode_desc:'Enables detailed logs in the Service Worker console',
  },
  'ja': {
    age_title:'年齢確認', age_desc:'この拡張機能はアダルトコンテンツサイトに関連しています。<br>続行する前に以下を確認してください。',
    age_check1:'私は18歳以上であることを確認します',
    age_check2:'このツールの目的を理解し、私の地域でのアクセスが合法であることを確認します',
    age_confirm:'確認して続ける', age_version_note:'v3.6.0 更新後に再確認が必要です',
    detected:'検出されたコード', sites:'検索サイト', recent:'最近の検索',
    options:'⚙ オプション', options_title:'設定', new_tab:'新しいタブで開く',
    nav_sites:'サイト管理', nav_scan:'スキャンモード', nav_appearance:'外観',
    nav_general:'一般設定', nav_io:'インポート/エクスポート',
    search_btn:'🔍 クイック検索', searching:'検索中…',
    theme_label:'ダークモード', theme_desc:'デフォルト：ブラウザ（システム）設定に従う',
    theme_auto:'🖥 システムに従う', theme_dark:'🌙 ダーク', theme_light:'☀️ ライト',
    lang_label:'表示言語', lang_desc:'デフォルト：ブラウザの言語設定に従う', lang_auto:'ブラウザに従う',
    scan_best:'ベストマッチ', scan_best_desc:'最初の利用可能なリンクで停止。高速。',
    scan_full:'フルスキャン', scan_full_desc:'全サイトを並行スキャンし、全結果を表示。',
    close_tab:'検索後に元のタブを閉じる', close_tab_desc:'検索結果を開いたら元のページを自動的に閉じる',
    float_btn:'フローティングボタンを表示', float_btn_desc:'検出されたページにショートカットボタンを表示',
    update_notify:'アップデート通知', update_notify_desc:'更新後に新機能を表示',
    add_site:'サイトを追加', edit_site:'編集', save_site:'保存', cancel:'キャンセル', delete_site:'削除', delete_confirm:'このサイトを削除しますか？',
    site_name_placeholder:'サイト名', base_url_placeholder:'検索URL。コード部分に {} を使用',
    base_url_error:'Base URL には {} が必要です。', invalid_settings_file:'設定ファイルの形式が正しくありません。',
    import_complete:'インポート完了。', import_failed:'インポートに失敗しました。', clear_confirm:'すべての設定を削除しますか？',
    io_desc:'設定を別のデバイスにバックアップまたは復元',
    export:'設定をエクスポート', import:'設定をインポート', danger:'危険ゾーン',
    danger_desc:'この操作は元に戻せません', clear_all:'全設定を削除',
    t_2m:'2 分前', t_1h:'1 時間前', t_yd:'昨日',
    dev_section:'開発者オプション', dev_section_desc:'バグ報告用。一般ユーザーは不要です。',
    dev_mode:'開発者モード', dev_mode_desc:'有効にするとService WorkerコンソールにログがI表示されます',
  },
  'ko': {
    age_title:'나이 확인', age_desc:'이 확장 프로그램은 성인 콘텐츠 사이트와 관련이 있습니다.<br>계속하기 전에 다음을 확인해 주세요.',
    age_check1:'저는 만 18세 이상임을 확인합니다',
    age_check2:'이 도구의 목적을 이해하며, 제 지역에서 해당 콘텐츠 이용이 합법적임을 확인합니다',
    age_confirm:'확인 후 계속', age_version_note:'v3.6.0 업데이트 후 재확인 필요',
    detected:'감지된 코드', sites:'검색 사이트', recent:'최근 검색',
    options:'⚙ 옵션', options_title:'설정', new_tab:'새 탭에서 열기',
    nav_sites:'사이트 관리', nav_scan:'스캔 모드', nav_appearance:'외관',
    nav_general:'일반 설정', nav_io:'가져오기/내보내기',
    search_btn:'🔍 빠른 검색', searching:'검색 중…',
    theme_label:'다크 모드', theme_desc:'기본값: 브라우저(시스템) 설정 따름',
    theme_auto:'🖥 시스템 따름', theme_dark:'🌙 다크', theme_light:'☀️ 라이트',
    lang_label:'표시 언어', lang_desc:'기본값: 브라우저 언어 설정 따름', lang_auto:'브라우저 따름',
    scan_best:'최적 결과', scan_best_desc:'첫 번째 가능한 링크에서 중지. 더 빠릅니다.',
    scan_full:'전체 스캔', scan_full_desc:'모든 사이트를 병렬 스캔하여 전체 결과 표시.',
    close_tab:'검색 후 원래 탭 닫기', close_tab_desc:'검색 결과를 열면 원래 페이지를 자동으로 닫기',
    float_btn:'플로팅 버튼 표시', float_btn_desc:'감지된 페이지에 단축키 버튼 표시',
    update_notify:'업데이트 알림', update_notify_desc:'업데이트 후 새 기능 표시',
    add_site:'사이트 추가', edit_site:'수정', save_site:'저장', cancel:'취소', delete_site:'삭제', delete_confirm:'이 사이트를 삭제할까요?',
    site_name_placeholder:'사이트 이름', base_url_placeholder:'검색 URL, 코드 위치에 {} 사용',
    base_url_error:'Base URL에는 {}가 포함되어야 합니다.', invalid_settings_file:'설정 파일 형식이 올바르지 않습니다.',
    import_complete:'가져오기가 완료되었습니다.', import_failed:'가져오기에 실패했습니다.', clear_confirm:'모든 설정을 지울까요?',
    io_desc:'다른 기기에 설정을 백업하거나 복원',
    export:'설정 내보내기', import:'설정 가져오기', danger:'위험 구역',
    danger_desc:'이 작업은 되돌릴 수 없습니다', clear_all:'모든 설정 지우기',
    t_2m:'2 분 전', t_1h:'1 시간 전', t_yd:'어제',
    dev_section:'개발자 옵션', dev_section_desc:'버그 보고용. 일반 사용자는 필요하지 않습니다.',
    dev_mode:'개발자 모드', dev_mode_desc:'활성화하면 Service Worker 콘솔에 상세 로그가 표시됩니다',
  }
};

function detectLang() {
  const locale = navigator.language || 'en';
  if (locale === 'zh-TW' || locale === 'zh-HK') return 'zh-TW';
  if (locale.startsWith('zh')) return 'zh-CN';
  if (locale.startsWith('ja')) return 'ja';
  if (locale.startsWith('ko')) return 'ko';
  return 'en';
}

function resolveLang(pref) {
  return pref === 'auto' ? detectLang() : pref;
}

function applyLang(lang) {
  const resolvedLang = resolveLang(lang);
  const strings = I18N[resolvedLang] || I18N['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key in strings) {
      if (String(strings[key]).includes('<br>')) {
        el.innerHTML = strings[key];
      } else {
        el.textContent = strings[key];
      }
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key in strings) el.placeholder = strings[key];
  });
}

const DEFAULT_SETTINGS = {
  settings: [],
  scanMode: 'bestMatch',
  closeOriginalTab: false,
  enableCache: true,
  showFloatingButton: true,
  showUpdateNotification: false,
  themeMode: 'auto',
  language: 'auto',
  searchHistory: [],
  devMode: false
};

let optionsState = { ...DEFAULT_SETTINGS };

async function getSyncStorage(defaults) {
  if (!globalThis.chrome?.storage?.sync) return { ...defaults };
  return chrome.storage.sync.get(defaults);
}

async function setSyncStorage(values) {
  if (!globalThis.chrome?.storage?.sync) {
    optionsState = { ...optionsState, ...values };
    return;
  }
  await chrome.storage.sync.set(values);
}

function sendRuntimeMessage(message) {
  if (globalThis.chrome?.runtime?.sendMessage) {
    chrome.runtime.sendMessage(message);
  }
}

function applyTheme(mode) {
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.className = isDark ? 'theme-dark' : 'theme-light';
}

document.addEventListener('DOMContentLoaded', async () => {
  optionsState = await getSyncStorage(DEFAULT_SETTINGS);
  applyTheme(optionsState.themeMode);
  applyLang(optionsState.language);
  renderSitesList(optionsState.settings);

  document.querySelectorAll('.opt-nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      document.querySelectorAll('.opt-nav-item').forEach((nav) => nav.classList.remove('active'));
      document.querySelectorAll('.opt-page').forEach((panel) => { panel.style.display = 'none'; });
      item.classList.add('active');
      document.getElementById(`page-${page}`).style.display = 'block';
    });
  });

  document.querySelectorAll('.scan-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.scanMode === optionsState.scanMode);
    card.addEventListener('click', async () => {
      optionsState.scanMode = card.dataset.scanMode;
      document.querySelectorAll('.scan-card').forEach((item) => item.classList.toggle('selected', item === card));
      await setSyncStorage({ scanMode: optionsState.scanMode });
    });
  });

  document.querySelectorAll('[data-theme-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.themeMode === optionsState.themeMode);
    button.addEventListener('click', async () => {
      optionsState.themeMode = button.dataset.themeMode;
      document.querySelectorAll('[data-theme-mode]').forEach((item) => item.classList.toggle('active', item === button));
      await setSyncStorage({ themeMode: optionsState.themeMode });
      applyTheme(optionsState.themeMode);
    });
  });

  document.querySelectorAll('[data-lang-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.langMode === optionsState.language);
    button.addEventListener('click', async () => {
      optionsState.language = button.dataset.langMode;
      document.querySelectorAll('[data-lang-mode]').forEach((item) => item.classList.toggle('active', item === button));
      await setSyncStorage({ language: optionsState.language });
      applyLang(optionsState.language);
    });
  });

  [
    ['closeOriginalTab', 'closeOriginalTab'],
    ['enableCache', 'enableCache'],
    ['showFloatingButton', 'showFloatingButton'],
    ['showUpdateNotification', 'showUpdateNotification'],
    ['devMode', 'devMode']
  ].forEach(([id, key]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    toggle.checked = Boolean(optionsState[key]);
    toggle.addEventListener('change', async () => {
      optionsState[key] = toggle.checked;
      await setSyncStorage({ [key]: toggle.checked });
    });
  });

  document.getElementById('addSiteBtn')?.addEventListener('click', () => {
    document.getElementById('addSiteForm').hidden = false;
  });
  document.getElementById('newSiteForm')?.addEventListener('submit', submitNewSite);
  document.getElementById('exportBtn')?.addEventListener('click', exportSettings);
  document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile')?.addEventListener('change', importSettings);
  document.getElementById('clearAllBtn')?.addEventListener('click', clearAllSettings);
});

function renderSitesList(settings) {
  const list = document.getElementById('sitesList');
  if (!list) return;
  list.innerHTML = '';

  if (!Array.isArray(settings) || settings.length === 0) {
    list.innerHTML = '<div class="empty-state" data-i18n="nav_sites"></div>';
    applyLang(optionsState.language);
    return;
  }

  const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
  settings.forEach((site, index) => {
    const versions = Array.isArray(site.versions) ? site.versions : [{ name: 'Default', baseUrl: site.baseUrl || '' }];
    const card = document.createElement('div');
    card.className = 'site-card';
    card.innerHTML = `
      <div class="site-card-head">
        <div>
          <h3>${escapeHtml(site.name || '')}</h3>
          <p>${escapeHtml(versions[0]?.baseUrl || '')}</p>
        </div>
        <div class="button-row">
          <button type="button" class="secondary-btn" data-edit-index="${index}">${escapeHtml(strings.edit_site)}</button>
          <button type="button" class="danger-btn" data-delete-index="${index}">${escapeHtml(strings.delete_site)}</button>
        </div>
      </div>
      <div class="version-chips">
        ${versions.map((version) => `<span>${escapeHtml(version.name || 'Default')}</span>`).join('')}
      </div>
      <form class="form-grid site-edit-form" data-edit-form="${index}" hidden>
        <input type="text" data-edit-name="${index}" value="${escapeAttr(site.name || '')}" placeholder="${escapeAttr(strings.site_name_placeholder)}" required>
        <input type="text" data-edit-url="${index}" value="${escapeAttr(versions[0]?.baseUrl || '')}" placeholder="${escapeAttr(strings.base_url_placeholder)}" required>
        <div class="inline-error" data-edit-error="${index}"></div>
        <div class="button-row">
          <button type="submit" class="primary-btn">${escapeHtml(strings.save_site)}</button>
          <button type="button" class="secondary-btn" data-cancel-edit="${index}">${escapeHtml(strings.cancel)}</button>
        </div>
      </form>
    `;
    card.querySelector('[data-edit-index]').addEventListener('click', () => {
      card.querySelector(`[data-edit-form="${index}"]`).hidden = false;
    });
    card.querySelector('[data-cancel-edit]').addEventListener('click', () => {
      card.querySelector(`[data-edit-form="${index}"]`).hidden = true;
    });
    card.querySelector('[data-edit-form]').addEventListener('submit', (event) => updateSite(event, index));
    card.querySelector('[data-delete-index]').addEventListener('click', () => deleteSite(index));
    list.appendChild(card);
  });
}

async function updateSite(event, index) {
  event.preventDefault();
  const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
  const nameInput = event.currentTarget.querySelector(`[data-edit-name="${index}"]`);
  const urlInput = event.currentTarget.querySelector(`[data-edit-url="${index}"]`);
  const error = event.currentTarget.querySelector(`[data-edit-error="${index}"]`);
  const name = nameInput.value.trim();
  const baseUrl = urlInput.value.trim();

  if (!baseUrl.includes('{}')) {
    error.textContent = strings.base_url_error;
    return;
  }

  const updated = [...(optionsState.settings || [])];
  const current = updated[index] || {};
  const versions = Array.isArray(current.versions) && current.versions.length
    ? current.versions.map((version, versionIndex) => versionIndex === 0 ? { ...version, baseUrl } : version)
    : [{ id: `${current.id || Date.now().toString(36)}_default`, name: 'Default', baseUrl }];
  updated[index] = { ...current, name, versions };
  optionsState.settings = updated;
  await setSyncStorage({ settings: updated });
  sendRuntimeMessage({ action: 'updateContextMenu' });
  renderSitesList(updated);
}

async function deleteSite(index) {
  const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
  if (!confirm(strings.delete_confirm)) return;
  const updated = [...(optionsState.settings || [])];
  updated.splice(index, 1);
  optionsState.settings = updated;
  await setSyncStorage({ settings: updated });
  sendRuntimeMessage({ action: 'updateContextMenu' });
  renderSitesList(updated);
}

async function submitNewSite(event) {
  event.preventDefault();
  const nameInput = document.getElementById('newSiteName');
  const urlInput = document.getElementById('newSiteBaseUrl');
  const error = document.getElementById('siteFormError');
  const name = nameInput.value.trim();
  const baseUrl = urlInput.value.trim();

  if (!baseUrl.includes('{}')) {
    const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
    error.textContent = strings.base_url_error;
    return;
  }

  error.textContent = '';
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const versionId = `${id}_default`;
  const updated = [
    ...(optionsState.settings || []),
    { id, name, enabled: true, versions: [{ id: versionId, name: 'Default', baseUrl }] }
  ];
  optionsState.settings = updated;
  await setSyncStorage({ settings: updated });
  sendRuntimeMessage({ action: 'updateContextMenu' });
  nameInput.value = '';
  urlInput.value = '';
  document.getElementById('addSiteForm').hidden = true;
  renderSitesList(updated);
}

async function exportSettings() {
  const data = globalThis.chrome?.storage?.sync ? await chrome.storage.sync.get(null) : optionsState;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quicklinker-settings.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importSettings(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
        throw new Error(strings.invalid_settings_file);
      }
      await setSyncStorage(parsed);
      showIoFeedback((I18N[resolveLang(optionsState.language)] || I18N.en).import_complete);
      optionsState = await getSyncStorage(DEFAULT_SETTINGS);
      applyTheme(optionsState.themeMode);
      applyLang(optionsState.language);
      renderSitesList(optionsState.settings);
    } catch (error) {
      const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
      showIoFeedback(error.message || strings.import_failed, true);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

async function clearAllSettings() {
  const strings = I18N[resolveLang(optionsState.language)] || I18N.en;
  if (!confirm(strings.clear_confirm)) return;
  if (globalThis.chrome?.storage?.sync) {
    await chrome.storage.sync.clear();
  }
  location.reload();
}

function showIoFeedback(message, isError = false) {
  const feedback = document.getElementById('ioFeedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.classList.toggle('error', isError);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value || '';
  return div.innerHTML;
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
