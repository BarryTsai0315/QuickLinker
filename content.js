// =============================================
// DOM & Observers
// =============================================

function getCode() {
    const clipboardElement = document.querySelector('.copy-to-clipboard');
    if (clipboardElement) {
        return clipboardElement.getAttribute('data-clipboard-text');
    }

    // Attempt to detect code from URL or title for specific sites like JavDB
    if (window.location.hostname.includes('javdb.com')) {
        const urlMatch = window.location.pathname.match(/\/v\/([a-zA-Z0-9-]+)/);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1];
        }
        const titleMatch = document.title.match(/([a-zA-Z0-9-]+)/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1];
        }
    }
    return null;
}

function extractCodeFromText(text) {
    // Regex for XXX-YYY or XXXX-YYY patterns
    const regex = /[a-zA-Z]{2,4}[- ]?\d{2,5}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        // Return the first found code, clean up potential spaces/hyphens
        return matches[0].replace(/[- ]/, '-').toUpperCase();
    }
    return null;
}

const observer = new MutationObserver(() => {
    const code = getCode();
    const container = document.querySelector('.ql-floating-container');
    if (code && !container) {
        createFloatingButton(code);
    } else if (!code && container) {
        container.remove();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// =============================================
// Floating Button Creation & Smart Scan
// =============================================

// =============================================
// Floating Button Creation & Smart Scan
// =============================================

async function updateFloatingButtons(code) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer) return;

    // Clear existing buttons
    subButtonsContainer.innerHTML = '';

    // Trigger Smart Scan with just the code
    const response = await chrome.runtime.sendMessage({ action: 'checkUrls', code: code });
    updateButtonStates(response.results);
}

async function createFloatingButton(code) {
    let container = document.querySelector('.ql-floating-container');
    if (container) {
        // If container already exists, just update its buttons
        await updateFloatingButtons(code);
        return;
    }

    // --- Create UI Elements (only if container doesn't exist) ---
    container = document.createElement('div');
    container.className = 'ql-floating-container';

    const mainButton = document.createElement('div');
    mainButton.className = 'ql-floating-button ql-main-button';
    mainButton.innerHTML = '+';

    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.className = 'ql-sub-buttons';

    // --- Append to DOM & Add Events ---
    container.appendChild(subButtonsContainer); // Append empty sub-buttons container initially
    container.appendChild(mainButton);
    document.body.appendChild(container);

    let isExpanded = false;
    mainButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        subButtonsContainer.style.display = isExpanded ? 'flex' : 'none';
        mainButton.style.transform = isExpanded ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    // Now populate and update the buttons
    await updateFloatingButtons(code);
}

function updateButtonStates(results) {
    const subButtonsContainer = document.querySelector('.ql-sub-buttons');
    if (!subButtonsContainer || !results) return;

    // Clear existing buttons before adding new ones
    subButtonsContainer.innerHTML = '';

    results.forEach(result => {
        const subButton = document.createElement('a');
        subButton.id = result.id; // Use the ID from background.js (siteId_versionId)
        subButton.className = 'ql-floating-button ql-sub-button';
        subButton.title = result.siteName; // Use the combined site and version name

        // Try to get favicon from the finalUrl or base URL
        let faviconUrl = '';
        try {
            const hostname = new URL(result.finalUrl || result.url).hostname;
            faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;
        } catch (e) {
            console.error('Error getting favicon hostname:', e);
        }
        if (faviconUrl) {
            subButton.style.backgroundImage = `url(${faviconUrl})`;
        }

        switch (result.status) {
            case 'available':
                subButton.classList.add('status-available');
                subButton.href = result.finalUrl; // Use the final URL after redirects
                subButton.target = '_blank';
                break;
            case 'unavailable':
                subButton.classList.add('status-unavailable');
                subButton.style.pointerEvents = 'none'; // Make it unclickable
                break;
            case 'error':
                subButton.classList.add('status-error');
                subButton.style.pointerEvents = 'none';
                subButton.title = `Error checking ${result.siteName}: ${result.error}`;
                break;
            case 'loading': // Initial state before check
            default:
                subButton.classList.add('status-loading');
                break;
        }
        subButtonsContainer.appendChild(subButton);
    });
}

// =============================================
// Styling
// =============================================

const style = document.createElement('style');
style.textContent = `
  .ql-floating-container {
    position: fixed; z-index: 9999; right: 20px; bottom: 20px;
    display: flex; flex-direction: column-reverse; align-items: center;
  }
  .ql-floating-button {
    width: 40px; height: 40px; border-radius: 50%;
    background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer; user-select: none; transition: all 0.3s ease;
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; background-size: 60%; background-position: center; background-repeat: no-repeat;
    border: 3px solid transparent;
  }
  .ql-main-button { background-color: #007bff; color: white; font-size: 28px; }
  .ql-sub-buttons { display: none; flex-direction: column; margin-bottom: 10px; }
  .ql-sub-button { background-color: #f8f9fa; margin-bottom: 10px; }
  .ql-sub-button:hover { transform: scale(1.15); }

  /* Status Styles */
  .status-loading { border-color: #ffc107; /* Yellow */ animation: pulse 1.5s infinite; }
  .status-available { border-color: #28a745; /* Green */ }
  .status-unavailable { border-color: #dc3545; /* Red */ opacity: 0.5; }
  .status-error { border-color: #fd7e14; /* Orange */ opacity: 0.6; }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
  }
`;
document.head.appendChild(style);

// =============================================
// Initial Execution & Listeners
// =============================================

// Initial check for code on page load
const initialCode = getCode();
if (initialCode) {
    createFloatingButton(initialCode);
}

// Listen for storage changes to rebuild
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const container = document.querySelector('.ql-floating-container');
    if (container) container.remove();
    const code = getCode();
    if (code) createFloatingButton(code);
  }
});

// Listen for text selection
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        // Check if current site is one of the configured sites
        chrome.storage.sync.get(['settings'], (result) => {
            const settings = result.settings || [];
            const currentHostname = window.location.hostname;
            const isConfiguredSite = settings.some(site => {
                try {
                    const siteHostname = new URL(site.baseUrl.replace('{}', '')).hostname;
                    return currentHostname.includes(siteHostname);
                } catch (e) {
                    console.error("Error parsing site URL:", site.baseUrl, e);
                    return false;
                }
            });

            // If it's a configured site, do not trigger global detection
            if (isConfiguredSite) {
                return;
            }

            const code = extractCodeFromText(selectedText);
            if (code) {
                createFloatingButton(code);
            }
        });
    }
});

// Make the floating container draggable
document.addEventListener('mousedown', (e) => {
    const container = document.querySelector('.ql-floating-container');
    if (!container || !container.contains(e.target)) return;

    let shiftX = e.clientX - container.getBoundingClientRect().left;
    let shiftY = e.clientY - container.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        container.style.left = pageX - shiftX + 'px';
        container.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    container.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        container.onmouseup = null;
    };

    container.ondragstart = function() {
        return false;
    };
});