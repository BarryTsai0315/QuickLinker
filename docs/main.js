/* ==========================================================================
   QuickLinker 官網腳本
   - 主題：light | dark 二態，未設定即跟隨系統（含 matchMedia change listener）
   - i18n：?lang= → localStorage → navigator.language → en
   - 進場動畫：IntersectionObserver（取代 AOS）
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 外部連結單一來源（原本散在 HTML 三處的裸 URL） ---------- */
  var STORE_URL = 'https://chromewebstore.google.com/detail/quicklinker/nlekpdjojigdbkidndldccapckfonjfb';
  var REPO_URL = 'https://github.com/BarryTsai0315/QuickLinker';

  var LINKS = {
    heroInstall: STORE_URL,
    ctaInstall: STORE_URL,
    footerStore: STORE_URL,
    heroRepo: REPO_URL,
    ctaRepo: REPO_URL,
    footerRepo: REPO_URL,
    footerSocial: REPO_URL
  };

  /* ---------- i18n 常數 ---------- */
  var SUPPORTED = ['zh-TW', 'en', 'ja', 'ko'];
  var FALLBACK_LANG = 'en';
  var LANG_KEY = 'ql-lang';
  var THEME_KEY = 'ql-theme';

  var THEME_COLOR = { light: '#fbfcfe', dark: '#0b0d15' };

  /* =======================================================================
     連結填入
     ======================================================================= */
  function applyLinks() {
    Object.keys(LINKS).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = LINKS[id];
    });
  }

  /* =======================================================================
     主題
     ======================================================================= */
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function storedTheme() {
    var t = localStorage.getItem(THEME_KEY);
    return t === 'dark' || t === 'light' ? t : null;
  }

  function effectiveTheme() {
    return storedTheme() || (systemDark.matches ? 'dark' : 'light');
  }

  function syncThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[effectiveTheme()]);
  }

  function applyTheme(theme) {
    // 用 setAttribute/removeAttribute 而非覆寫 className，避免抹掉其他 class
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    syncThemeColor();
  }

  function initTheme() {
    applyTheme(storedTheme());

    // 沒手動選過主題時，系統切換要即時跟隨
    var onSystemChange = function () {
      if (!storedTheme()) applyTheme(null);
    };
    if (typeof systemDark.addEventListener === 'function') {
      systemDark.addEventListener('change', onSystemChange);
    } else if (typeof systemDark.addListener === 'function') {
      systemDark.addListener(onSystemChange);
    }

    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
        console.log('[QuickLinker] theme switched to ' + next);
      });
    }
  }

  /* =======================================================================
     i18n
     ======================================================================= */

  /**
   * navigator.language 正規化。合法結果只有 SUPPORTED 中的四個值。
   * zh-TW / zh-HK / zh-Hant → zh-TW
   * zh-CN / zh-Hans / zh    → zh-TW（官網不做簡中）
   * ja / ja-JP              → ja
   * ko / ko-KR              → ko
   * 其他                     → en
   */
  function normalizeLang(raw) {
    if (!raw) return FALLBACK_LANG;
    var tag = String(raw).toLowerCase();
    if (tag.indexOf('zh') === 0) return 'zh-TW';
    if (tag.indexOf('ja') === 0) return 'ja';
    if (tag.indexOf('ko') === 0) return 'ko';
    return FALLBACK_LANG;
  }

  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) !== -1;
  }

  /** 解析優先序：?lang= → localStorage → navigator.language → en */
  function resolveLang() {
    var q = new URLSearchParams(window.location.search).get('lang');
    if (q && isSupported(q)) return q;

    var stored = localStorage.getItem(LANG_KEY);
    if (stored && isSupported(stored)) return stored;

    return normalizeLang(navigator.language);
  }

  function applyDict(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return;

      var value = dict[key];
      var attr = el.getAttribute('data-i18n-attr');

      if (attr) {
        el.setAttribute(attr, value);
      } else if (value.indexOf('<br>') !== -1) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });
  }

  function applyLang(lang) {
    return fetch('i18n/' + lang + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (dict) {
        applyDict(dict);
        document.documentElement.lang = lang;

        var select = document.getElementById('langSelect');
        if (select) select.value = lang;

        // 把語言寫回網址，方便分享特定語言版本的連結
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);

        console.log('[QuickLinker] language applied: ' + lang);
      })
      .catch(function (err) {
        // fail loudly：不靜默吞錯、不清空內容，頁面保持 HTML 內的繁中原文
        console.error('[QuickLinker] i18n load failed: ' + lang + ' — ' + err.message);
      });
  }

  function initI18n() {
    var select = document.getElementById('langSelect');
    if (select) {
      select.addEventListener('change', function (e) {
        var lang = e.target.value;
        if (!isSupported(lang)) return;
        localStorage.setItem(LANG_KEY, lang);
        applyLang(lang);
      });
    }
    applyLang(resolveLang());
  }

  /* =======================================================================
     進場動畫（取代 AOS）
     ======================================================================= */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 不加 has-js 就等於完全不隱藏，內容維持可見
    if (reduced || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('has-js');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* =======================================================================
     Navbar 與捲動進度條
     ======================================================================= */
  function initScrollEffects() {
    var navbar = document.getElementById('navbar');
    var progress = document.getElementById('progressBar');

    var onScroll = function () {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 8);

      if (progress) {
        var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progress.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + '%';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =======================================================================
     其他
     ======================================================================= */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* =======================================================================
     啟動
     ======================================================================= */
  function init() {
    applyLinks();
    initTheme();
    initI18n();
    initReveal();
    initScrollEffects();
    initYear();
    console.log('[QuickLinker] site ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
