const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const PROJECT_ID = 'antigravity2-zh-hant-tw';
const PROJECT_NAME = 'Antigravity 2.0 繁體中文套件';
const ENGINE_VERSION = '1.0.5';
const SIGNATURE = 'ZH-HANT-TW';

const SIGNATURE_START = '/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION START --- */';
const SIGNATURE_END = '/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION END --- */';

/**
 * 解析本地 @electron/asar CLI 路徑。
 * 優先使用 node_modules/@electron/asar/bin/asar.js，若不存在則提示使用者先執行 npm install。
 * @returns {string|null} asar CLI 的絕對路徑，若找不到則回傳 null。
 */
function resolveAsarCli() {
    const localAsarPath = path.join(__dirname, 'node_modules', '@electron', 'asar', 'bin', 'asar.js');
    if (fs.existsSync(localAsarPath)) {
        return localAsarPath;
    }
    return null;
}

/**
 * 使用本地 asar CLI 執行指令。
 * @param {string} action - asar 動作，例如 'extract' 或 'pack'
 * @param {string[]} args - 傳入 asar 的參數陣列
 * @returns {{success: boolean, stdout: string, stderr: string}}
 */
function runAsarCommand(action, args) {
    const asarCli = resolveAsarCli();
    if (!asarCli) {
        console.error('[錯誤] 找不到本地 @electron/asar CLI。');
        console.error('  請先在專案目錄執行 npm install，再重新執行安裝。');
        return { success: false, stdout: '', stderr: '本地 @electron/asar 未安裝' };
    }

    const nodeExe = process.execPath;
    const cmd = `"${nodeExe}" "${asarCli}" ${action} ${args.map(a => `"${a}"`).join(' ')}`;
    return runCommandSync(cmd);
}

/**
 * 環境檢查：確認必要工具是否存在。
 * @returns {boolean} 環境檢查是否通過
 */
function checkEnvironment() {
    // 檢查本地 @electron/asar CLI
    const asarCli = resolveAsarCli();
    if (!asarCli) {
        console.error('');
        console.error('╔══════════════════════════════════════════════════════════╗');
        console.error('║  [環境檢查] 找不到本地 @electron/asar CLI                ║');
        console.error('║                                                          ║');
        console.error('║  請先在專案根目錄執行：                                  ║');
        console.error('║    npm install                                            ║');
        console.error('║                                                          ║');
        console.error('║  完成後再重新執行安裝腳本。                              ║');
        console.error('╚══════════════════════════════════════════════════════════╝');
        console.error('');
        return false;
    }
    console.log(`[環境檢查] 本地 asar CLI 已就緒：${asarCli}`);
    return true;
}

function normalizeText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
}

function loadDictionary() {
    const totalMap = {};
    const dictsDir = path.join(__dirname, 'dicts');

    if (!fs.existsSync(dictsDir)) {
        console.warn(`[警告] 找不到字典目錄：${dictsDir}`);
        return totalMap;
    }

    const files = fs.readdirSync(dictsDir).filter(file => file.endsWith('.json')).sort();

    for (const file of files) {
        try {
            const filePath = path.join(dictsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContent);

            for (const [k, v] of Object.entries(data)) {
                const normK = normalizeText(k);
                if (normK) totalMap[normK] = v;
            }
        } catch (e) {
            console.warn(`[警告] 無法讀取字典檔：${file}`);
            console.warn(e.message);
        }
    }

    return totalMap;
}

function generateJs() {
    const fullDict = loadDictionary();
    const longEntries = Object.entries(fullDict).sort((a, b) => b[0].length - a[0].length);

    const dictJson = JSON.stringify(fullDict, null, 4);
    const entriesJson = JSON.stringify(longEntries);

    const jsSource = `${SIGNATURE_START}
(() => {
    if (window.__ANTIGRAVITY_ZH_TW_LOADED__) return;
    window.__ANTIGRAVITY_ZH_TW_LOADED__ = true;

    const injectStyle = () => {
        if (!document.getElementById('ag-zh-hant-tooltip-style')) {
            const style = document.createElement('style');
            style.id = 'ag-zh-hant-tooltip-style';
            style.textContent = \`
                .react-tooltip-content-wrapper:not([data-ag-tooltip-ready="true"]),
                [class*="react-tooltip" i]:not([data-ag-tooltip-ready="true"]) {
                    visibility: hidden !important;
                    opacity: 0 !important;
                }
            \`;
            const parent = document.head || document.documentElement;
            if (parent) parent.appendChild(style);
        }
    };
    injectStyle();

    const map = new Map(Object.entries(DICT_PLACEHOLDER));
    const lowerMap = new Map();
    for (const [k, v] of map.entries()) lowerMap.set(k.toLowerCase(), v);

    const longEntries = REPLACEMENT_ENTRIES_PLACEHOLDER;
    const done = new WeakSet();

    const tooltipPortalSelectors = [
        '.react-tooltip-content-wrapper', '[class*="react-tooltip" i]',
        '[role="tooltip"]', '[data-radix-popper-content-wrapper]',
        '[data-radix-tooltip-content]', '[data-slot="tooltip-content"]',
        '[data-side][data-align]', '.tooltip', '.Tooltip',
        '.tooltip-content', '.tooltipContent', '.popover',
        '.popover-content', '.PopoverContent'
    ];

    const BLOCKED_CLASSES = ['monaco-editor', 'editor-container', 'terminal', 'output-view', 'debug-console', 'code-view', 'artifact-container', 'suggest-widget'];
    const BLOCKED_TAGS = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SVG', 'CANVAS', 'SYMBOL', 'PATH'];

    function norm(s) {
        if (!s) return '';
        return s.replace(/\\s+/g, ' ').replace(/[\\u2018\\u2019]/g, "'").replace(/[\\u201C\\u201D]/g, '"').trim();
    }

    function isInBlockedZone(node) {
        let curr = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        let depth = 0;

        while (curr && depth < 12) {
            if (curr.nodeType === Node.ELEMENT_NODE) {
                const tag = curr.tagName.toUpperCase();
                if (BLOCKED_TAGS.includes(tag)) return true;
                if (curr.getAttribute('contenteditable') === 'true') return true;

                const className = curr.className || '';
                if (typeof className === 'string' && BLOCKED_CLASSES.some(cls => className.includes(cls))) {
                    return true;
                }
            }

            curr = curr.parentElement || (curr.parentNode && curr.parentNode.host);
            depth++;
        }

        return false;
    }

    function translateString(originalVal) {
        if (!originalVal || typeof originalVal !== 'string') return originalVal;
        const valNorm = norm(originalVal);
        if (!valNorm) return originalVal;
        
        const valLower = valNorm.toLowerCase();
        let newVal = originalVal;

        if (map.has(valNorm)) {
            newVal = map.get(valNorm);
        } else if (lowerMap.has(valLower)) {
            newVal = lowerMap.get(valLower);
        } else {
            for (const [key, translated] of longEntries) {
                if (key.length > 20 && valNorm.includes(key)) {
                    newVal = newVal.split(key).join(translated);
                }
            }
        }
        if (newVal === originalVal) {
            const deleteProjectMatch = valNorm.match(/^Permanently delete (.+?) including (\\d+) active conversations? and (\\d+) archived conversations?\\.$/);
            if (deleteProjectMatch) {
                newVal = '永久刪除 ' + deleteProjectMatch[1] + '，包括 ' + deleteProjectMatch[2] + ' 個進行中對話以及 ' + deleteProjectMatch[3] + ' 個已封存對話。';
            } else {
                const deleteProjectPrefixMatch = valNorm.match(/^Permanently delete (.+)$/);
                const activeConversationsMatch = valNorm.match(/^(\\d+) active conversations?$/);
                const archivedConversationsMatch = valNorm.match(/^(\\d+) archived conversations?$/);

                if (deleteProjectPrefixMatch) {
                    newVal = '永久刪除 ' + deleteProjectPrefixMatch[1];
                } else if (activeConversationsMatch) {
                    newVal = activeConversationsMatch[1] + ' 個進行中對話';
                } else if (archivedConversationsMatch) {
                    newVal = archivedConversationsMatch[1] + ' 個已封存對話';
                } else if (valNorm === 'including') {
                    newVal = '，包括';
                } else if (valNorm === 'and') {
                    newVal = '以及';
                }
            }
        }
        return newVal;
    }

    function translateAttributes(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
        const tag = el.tagName.toUpperCase();
        if (BLOCKED_TAGS.includes(tag)) return;
        if (isInBlockedZone(el)) return;

        for (const attr of ['placeholder', 'title', 'aria-label']) {
            const v = el.getAttribute(attr);
            if (!v) continue;
            const t = norm(v);
            if (map.has(t)) {
                el.setAttribute(attr, map.get(t));
            } else if (lowerMap.has(t.toLowerCase())) {
                el.setAttribute(attr, lowerMap.get(t.toLowerCase()));
            }
        }
    }

    function sweepAttributes(root) {
        if (!root || !root.querySelectorAll) return;
        const els = root.querySelectorAll('[title], [aria-label], [placeholder]');
        for (const el of els) {
            translateAttributes(el);
        }
    }

    function hasTranslatableEnglishText(node) {
        if (!node) return false;
        const text = node.textContent || '';
        if (!text) return false;
        
        for (const [key, translated] of map.entries()) {
            if (key.length >= 3 && key !== translated && text.includes(key)) {
                return true;
            }
        }
        for (const [key, translated] of longEntries) {
            if (key.length >= 3 && key !== translated && text.includes(key)) {
                return true;
            }
        }
        return false;
    }

    function translateTooltipNodeWithReadyCheck(node, attempt = 1) {
        try {
            translateNode(node);
            translateAttributes(node);
            sweepAttributes(node);
        } finally {
            try {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const checkAndSetReady = () => {
                        let hasEnglish = false;
                        if (node.matches && node.matches('.react-tooltip-content-wrapper, [class*="react-tooltip" i]')) {
                            if (hasTranslatableEnglishText(node)) hasEnglish = true;
                        } else {
                            const subTooltips = node.querySelectorAll('.react-tooltip-content-wrapper, [class*="react-tooltip" i]');
                            for (const t of subTooltips) {
                                if (hasTranslatableEnglishText(t)) hasEnglish = true;
                            }
                        }
                        
                        if (hasEnglish && attempt <= 5) {
                            requestAnimationFrame(() => {
                                translateTooltipNodeWithReadyCheck(node, attempt + 1);
                            });
                        } else {
                            if (node.matches && node.matches('.react-tooltip-content-wrapper, [class*="react-tooltip" i]')) {
                                node.setAttribute('data-ag-tooltip-ready', 'true');
                            }
                            const subTooltips = node.querySelectorAll('.react-tooltip-content-wrapper, [class*="react-tooltip" i]');
                            for (const t of subTooltips) {
                                t.setAttribute('data-ag-tooltip-ready', 'true');
                            }
                        }
                    };
                    checkAndSetReady();
                }
            } catch (e) {}
        }
    }

    function translateTooltipPortals() {
        try {
            const portals = document.querySelectorAll(tooltipPortalSelectors.join(', '));
            for (const portal of portals) {
                if (!isInBlockedZone(portal)) {
                    if (portal.matches('.react-tooltip-content-wrapper, [class*="react-tooltip" i]')) {
                        translateTooltipNodeWithReadyCheck(portal);
                    } else {
                        translateNode(portal);
                        translateAttributes(portal);
                        sweepAttributes(portal);
                    }
                }
            }
        } catch (e) {}
    }

    function translateAroundPointer(e) {
        try {
            let el = e.target;
            while (el && el !== document.body) {
                translateAttributes(el);
                el = el.parentElement;
            }

            if (e.clientX !== undefined && e.clientY !== undefined) {
                const elsUnderPointer = document.elementsFromPoint(e.clientX, e.clientY);
                for (const elem of elsUnderPointer) {
                    translateAttributes(elem);
                }
            }

            requestAnimationFrame(() => {
                sweepAttributes(document.body);
                translateTooltipPortals();
            });
            setTimeout(() => { sweepAttributes(document.body); translateTooltipPortals(); }, 0);
            setTimeout(() => { sweepAttributes(document.body); translateTooltipPortals(); }, 30);
            setTimeout(() => { sweepAttributes(document.body); translateTooltipPortals(); }, 80);
            setTimeout(() => { sweepAttributes(document.body); translateTooltipPortals(); }, 150);
            setTimeout(() => { sweepAttributes(document.body); translateTooltipPortals(); }, 300);
        } catch (err) {}
    }

    function translateNode(node) {
        try {
            if (!node || done.has(node)) return;

            if (node.nodeType === Node.ELEMENT_NODE) {
                translateAttributes(node);
                if (node.shadowRoot) translateNode(node.shadowRoot);
                for (const child of node.childNodes) translateNode(child);
                return;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const originalVal = node.nodeValue;
                if (!originalVal || originalVal.trim().length < 1) return;
                if (isInBlockedZone(node)) return;

                let newVal = translateString(originalVal);

                if (newVal !== originalVal) {
                    node.nodeValue = newVal;
                    done.add(node);
                    setTimeout(() => done.delete(node), 1000);
                }
            }
        } catch (e) {}
    }

    let portalDebounce = null;
    const observer = new MutationObserver(mutations => {
        let hasChildList = false;
        for (const m of mutations) {
            if (m.type === 'childList') {
                hasChildList = true;
                for (const n of m.addedNodes) {
                    translateNode(n);
                    if (n.nodeType === Node.ELEMENT_NODE) {
                        try {
                            if (n.matches && n.matches('.react-tooltip-content-wrapper, [class*="react-tooltip" i]')) {
                                n.removeAttribute('data-ag-tooltip-ready');
                                translateTooltipNodeWithReadyCheck(n);
                            } else if (n.querySelector && n.querySelector('.react-tooltip-content-wrapper, [class*="react-tooltip" i]')) {
                                const tooltips = n.querySelectorAll('.react-tooltip-content-wrapper, [class*="react-tooltip" i]');
                                for (const t of tooltips) {
                                    t.removeAttribute('data-ag-tooltip-ready');
                                    translateTooltipNodeWithReadyCheck(t);
                                }
                            }

                            if (n.matches && n.matches(tooltipPortalSelectors.join(', '))) {
                                translateNode(n);
                                sweepAttributes(n);
                            } else if (n.querySelector && n.querySelector(tooltipPortalSelectors.join(', '))) {
                                translateTooltipPortals();
                            }
                        } catch(e) {}
                    }
                }
            } else if (m.type === 'characterData') {
                translateNode(m.target);
            } else if (m.type === 'attributes') {
                const el = m.target;
                if (el && el.nodeType === Node.ELEMENT_NODE && !isInBlockedZone(el)) {
                    const attr = m.attributeName;
                    if (attr === 'title' || attr === 'aria-label' || attr === 'placeholder') {
                        const v = el.getAttribute(attr);
                        if (v) {
                            const translated = translateString(v);
                            if (translated !== v) {
                                el.setAttribute(attr, translated);
                            }
                        }
                    }
                }
            }
        }
        if (hasChildList) {
            if (!portalDebounce) {
                portalDebounce = setTimeout(() => {
                    translateTooltipPortals();
                    portalDebounce = null;
                }, 50);
            }
        }
    });

    const obsOpts = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] };

    const startEngine = () => {
        const target = document.body || document.documentElement;
        if (!target) return;

        try {
            observer.observe(target, obsOpts);
            translateNode(target);
            sweepAttributes(target);
        } catch (e) {}
    };

    const origAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function() {
        const sr = origAttachShadow.apply(this, arguments);
        try { observer.observe(sr, obsOpts); } catch (e) {}
        return sr;
    };

    const origSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (typeof value === 'string' && (name === 'title' || name === 'aria-label' || name === 'placeholder')) {
            if (!isInBlockedZone(this) && !BLOCKED_TAGS.includes(this.tagName.toUpperCase())) {
                const translated = translateString(value);
                return origSetAttribute.call(this, name, translated);
            }
        }
        return origSetAttribute.call(this, name, value);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startEngine);
    } else {
        startEngine();
    }

    window.addEventListener('load', startEngine);
    setTimeout(startEngine, 100);
    setTimeout(startEngine, 300);
    setTimeout(startEngine, 1000);
    setTimeout(startEngine, 3000);
    setTimeout(startEngine, 6000);

    document.addEventListener('pointerover', translateAroundPointer, true);
    document.addEventListener('mouseover', translateAroundPointer, true);
    document.addEventListener('focusin', translateAroundPointer, true);
})();
${SIGNATURE_END}`;

    return jsSource
        .replace('DICT_PLACEHOLDER', dictJson)
        .replace('REPLACEMENT_ENTRIES_PLACEHOLDER', entriesJson);
}

function cleanJsContent(content) {
    const regex = new RegExp(escapeRegExp(SIGNATURE_START) + '[\\s\\S]*?' + escapeRegExp(SIGNATURE_END), 'g');
    return content.replace(regex, '');
}

function cleanMenuJsContent(content) {
    const startMarks = [
        '/* --- MENU TRANSLATION START --- */',
        '// =========================================='
    ];
    const endMarks = [
        '/* --- MENU TRANSLATION END --- */',
        'translateMenu(menu.items);'
    ];

    let cleaned = content;

    for (const startMark of startMarks) {
        const startIdx = cleaned.indexOf(startMark);
        if (startIdx === -1) continue;

        let endIdx = -1;
        let endMarkUsed = '';

        for (const endMark of endMarks) {
            const idx = cleaned.indexOf(endMark, startIdx);
            if (idx !== -1 && (endIdx === -1 || idx < endIdx)) {
                endIdx = idx;
                endMarkUsed = endMark;
            }
        }

        if (endIdx !== -1 && startIdx < endIdx) {
            cleaned = cleaned.substring(0, startIdx) + cleaned.substring(endIdx + endMarkUsed.length);
        }
    }

    return cleaned;
}

function cleanTrayJsContent(content) {
    const startMark = '/* --- TRAY TRANSLATION START --- */';
    const endMark = '/* --- TRAY TRANSLATION END --- */';
    const startIdx = content.indexOf(startMark);
    const endIdx = content.indexOf(endMark);

    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        return content.substring(0, startIdx) + content.substring(endIdx + endMark.length);
    }

    return content;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function closeAntigravityProcesses() {
    console.log('[1] 正在關閉 Antigravity，以避免檔案被占用...');

    try {
        if (process.platform === 'win32') {
            child_process.execSync('taskkill /f /im Antigravity.exe /t >nul 2>nul');
        } else {
            child_process.execSync('pkill -f Antigravity > /dev/null 2>&1');
        }
    } catch (e) {}

    const start = Date.now();
    while (Date.now() - start < 1500) {}
}

function detectInstallationDir(manualDir) {
    if (manualDir) {
        if (fs.existsSync(manualDir)) {
            return path.resolve(manualDir);
        }

        console.error(`[錯誤] 指定的安裝路徑不存在：${manualDir}`);
        process.exit(1);
    }

    const candidates = [];

    if (process.platform === 'win32') {
        const localAppdata = process.env.LOCALAPPDATA;
        if (localAppdata) {
            candidates.push(path.join(localAppdata, 'Programs', 'antigravity'));
        }

        candidates.push('D:\\Antigravity');
        candidates.push('C:\\Program Files\\Antigravity');
    } else if (process.platform === 'darwin') {
        candidates.push('/Applications/Antigravity.app');
        candidates.push(path.join(process.env.HOME || '', 'Applications', 'Antigravity.app'));
    }

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            console.log(`[偵測] 找到 Antigravity 安裝目錄：${candidate}`);
            return path.resolve(candidate);
        }
    }

    console.error('[錯誤] 找不到 Antigravity 安裝目錄。請使用 --install-dir 指定路徑。');
    process.exit(1);
}

function runCommandSync(cmd) {
    try {
        const out = child_process.execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
        return { success: true, stdout: out, stderr: '' };
    } catch (e) {
        return { success: false, stdout: e.stdout || '', stderr: e.stderr || e.message };
    }
}

function createMenuTranslationPatch() {
    return `
    /* --- MENU TRANSLATION START --- */
    const translations = {
        'File': '檔案',
        'Edit': '編輯',
        'View': '檢視',
        'Window': '視窗',
        'Help': '說明',
        'New Window': '新增視窗',
        'Create Project': '建立專案',
        'Command Palette': '命令選擇區',
        'Docs': '使用說明',
        'Check for Updates': '檢查更新',
        'Toggle Developer Tools': '切換開發者工具',
        'Undo': '復原',
        'Redo': '重做',
        'Cut': '剪下',
        'Copy': '複製',
        'Paste': '貼上',
        'Select All': '全選',
        'Minimize': '最小化',
        'Maximize': '最大化',
        'Close': '關閉',
        'Zoom': '縮放',
        'Reset Zoom': '重設縮放',
        'Zoom In': '放大',
        'Zoom Out': '縮小',
        'Toggle Full Screen': '切換全螢幕',
        'Bring All to Front': '將所有視窗移至最前',
        'Reload': '重新載入',
        'Force Reload': '強制重新載入',
        'Actual Size': '實際大小',
        'Paste and Match Style': '貼上並符合樣式',
        'Delete': '刪除',
        'Substitutions': '替換',
        'Show Substitutions': '顯示替換',
        'Smart Quotes': '智慧引號',
        'Smart Dashes': '智慧破折號',
        'Text Replacement': '文字替換',
        'Speech': '語音',
        'Start Speaking': '開始朗讀',
        'Stop Speaking': '停止朗讀',
        'Close Window': '關閉視窗'
    };

    function translateMenu(items) {
        for (const item of items) {
            const label = item.label || '';
            let cleanLabel = label;
            let mnemonic = '';

            const match = label.match(/&([a-zA-Z])/);
            if (match) {
                mnemonic = '(&' + match[1] + ')';
                cleanLabel = label.replace('&', '');
            }

            if (translations[cleanLabel]) {
                item.label = translations[cleanLabel] + mnemonic;
            } else if (translations[label]) {
                item.label = translations[label];
            }

            if (item.submenu && item.submenu.items) {
                translateMenu(item.submenu.items);
            }
        }
    }

    translateMenu(menu.items);
    /* --- MENU TRANSLATION END --- */
    `;
}

function createTrayCreatePatch() {
    return `function createTray(actions) {
    /* --- TRAY TRANSLATION START --- */
    const translations = {
        'No agents running': '目前沒有執行中的 Agent',
        'Open Antigravity': '開啟 Antigravity',
        'Quit': '結束'
    };

    for (const item of actions) {
        if (translations[item.label]) {
            item.label = translations[item.label];
        }
    }
    /* --- TRAY TRANSLATION END --- */`;
}

function install20(resourcesDir) {
    const asarPath = path.join(resourcesDir, 'app.asar');
    const bakPath = path.join(resourcesDir, 'app.asar.bak');

    if (!fs.existsSync(asarPath)) {
        console.error(`[錯誤] 在 resources 目錄中找不到 app.asar：${resourcesDir}`);
        return false;
    }

    // 環境檢查：在執行任何破壞性操作前，先確認 asar CLI 可用
    if (!checkEnvironment()) {
        return false;
    }

    closeAntigravityProcesses();

    if (!fs.existsSync(bakPath)) {
        console.log('[備份] 正在建立官方 app.asar 備份...');
        let backupOk = false;
        try {
            fs.copyFileSync(asarPath, bakPath);
            backupOk = true;
        } catch (copyErr) {
            if ((copyErr.code === 'EPERM' || copyErr.code === 'EACCES') && process.platform !== 'win32') {
                console.warn(`[備份] fs.copyFileSync 失敗 (${copyErr.code})，嘗試以 /bin/cp -p 建立備份...`);
                const cpResult = runCommandSync(`/bin/cp -p "${asarPath}" "${bakPath}"`);
                if (cpResult.success && fs.existsSync(bakPath)) {
                    backupOk = true;
                    console.log('[備份] 以 /bin/cp -p 建立備份成功。');
                } else {
                    console.error('[錯誤] 備份失敗：無法建立 app.asar.bak。');
                    console.error('  可能原因：macOS 權限限制或 .app 目錄權限不足。');
                    console.error('  建議：');
                    console.error('    1. 嘗試以具備權限的終端機執行本腳本');
                    console.error('    2. 或手動建立備份：');
                    console.error(`       cp "${asarPath}" "${bakPath}"`);
                    return false;
                }
            } else {
                console.error(`[錯誤] 備份失敗：${copyErr.message}`);
                return false;
            }
        }
        if (backupOk) {
            console.log('[備份] 備份完成。');
        }
    } else {
        console.log('[備份] 已存在 app.asar.bak，本次沿用既有備份。');
    }

    const tempDir = path.join(__dirname, '_temp_asar');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log('[解包] 正在解包 app.asar...');
    const extractRes = runAsarCommand('extract', [asarPath, tempDir]);
    if (!extractRes.success || !fs.existsSync(tempDir)) {
        console.error('[錯誤] 解包失敗，請確認已執行 npm install 並確認 Node.js 可正常使用。');
        console.error(`詳情：${extractRes.stderr}\n${extractRes.stdout}`);
        return false;
    }

    const preloadPath = path.join(tempDir, 'dist', 'preload.js');
    if (!fs.existsSync(preloadPath)) {
        console.error(`[錯誤] 解包後找不到 preload.js：${preloadPath}`);
        fs.rmSync(tempDir, { recursive: true, force: true });
        return false;
    }

    console.log('[修改] 正在注入繁體中文台灣用語字典...');
    const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
    const cleanedPreload = cleanJsContent(preloadContent);
    const translationJs = generateJs();
    fs.writeFileSync(preloadPath, cleanedPreload + '\n' + translationJs, 'utf-8');
    console.log('[修改] preload.js 注入完成。');

    const menuPath = path.join(tempDir, 'dist', 'menu.js');
    if (fs.existsSync(menuPath)) {
        console.log('[修改] 正在注入系統選單文字...');
        const menuContent = fs.readFileSync(menuPath, 'utf-8');
        const menuCleaned = cleanMenuJsContent(menuContent);
        const menuTranslationJs = createMenuTranslationPatch();

        const targetStr = 'electron_1.Menu.setApplicationMenu(menu);';
        const idx = menuCleaned.indexOf(targetStr);

        if (idx !== -1) {
            const patchedMenuContent = menuCleaned.substring(0, idx) + menuTranslationJs + '\n    ' + menuCleaned.substring(idx);
            fs.writeFileSync(menuPath, patchedMenuContent, 'utf-8');
            console.log('[修改] 系統選單文字注入完成。');
        } else {
            console.warn('[警告] 找不到 menu.js 插入點，略過系統選單文字注入。');
        }
    }

    const trayPath = path.join(tempDir, 'dist', 'tray.js');
    if (fs.existsSync(trayPath)) {
        console.log('[修改] 正在注入工作列選單文字...');
        const trayContent = fs.readFileSync(trayPath, 'utf-8');
        const trayCleaned = cleanTrayJsContent(trayContent);

        const targetCreate = 'function createTray(actions) {';
        const replacementCreate = createTrayCreatePatch();

        let trayPatched = trayCleaned.replace(targetCreate, replacementCreate);

        const countRegex = /countItem\.label\s*=\s*\([\s\S]*?' running';/g;
        const replacementCount = "countItem.label = count > 0 ? `${count} 個 Agent 執行中` : '目前沒有執行中的 Agent';";
        trayPatched = trayPatched.replace(countRegex, replacementCount);

        fs.writeFileSync(trayPath, trayPatched, 'utf-8');
        console.log('[修改] 工作列選單文字注入完成。');
    }

    const loadingPath = path.join(tempDir, 'dist', 'loadingOverlay.js');
    if (fs.existsSync(loadingPath)) {
        console.log('[修改] 正在調整啟動畫面文字...');
        let loadingContent = fs.readFileSync(loadingPath, 'utf-8');

        const targetText = '<div class="text">Loading Antigravity</div>';
        const replacementText = '<div class="text">正在啟動 Antigravity...</div>';
        loadingContent = loadingContent.replace(targetText, replacementText);

        fs.writeFileSync(loadingPath, loadingContent, 'utf-8');
        console.log('[修改] 啟動畫面文字調整完成。');
    }

    console.log('[打包] 正在重新打包 app.asar...');
    const packRes = runAsarCommand('pack', [tempDir, asarPath]);
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (!packRes.success) {
        console.error('[錯誤] 打包失敗。');
        console.error(`詳情：${packRes.stderr}\n${packRes.stdout}`);
        return false;
    }

    console.log(`[完成] ${PROJECT_NAME} 已套用完成。`);
    return true;
}

function restore20(resourcesDir) {
    const asarPath = path.join(resourcesDir, 'app.asar');
    const bakPath = path.join(resourcesDir, 'app.asar.bak');

    if (!fs.existsSync(bakPath)) {
        console.log('[提示] 找不到 app.asar.bak，可能尚未套用過本工具，或備份已被移除。');
        return false;
    }

    closeAntigravityProcesses();

    console.log('[還原] 正在還原官方 app.asar...');
    fs.copyFileSync(bakPath, asarPath);
    fs.unlinkSync(bakPath);
    console.log('[完成] 官方 app.asar 已還原。');
    return true;
}

function locateResourcesDir(installDir) {
    const candidates = [
        path.join(installDir, 'resources'),
        path.join(installDir, 'Contents', 'Resources'),
        installDir
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, 'app.asar'))) {
            return candidate;
        }
    }

    const normalized = installDir.replace(/\\/g, '/').replace(/\/$/, '');
    if (normalized.endsWith('/resources') && fs.existsSync(installDir)) {
        return installDir;
    }

    return path.join(installDir, 'resources');
}

function printVersion() {
    console.log(`${PROJECT_NAME}`);
    console.log(`Project ID: ${PROJECT_ID}`);
    console.log(`Engine version: ${ENGINE_VERSION}`);
    console.log(`Signature: ${SIGNATURE}`);
}

function main() {
    let restore = false;
    let manualDir = '';

    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--huifu' || args[i] === '--restore') {
            restore = true;
        } else if (args[i] === '--install-dir') {
            manualDir = args[i + 1] || '';
            i++;
        } else if (args[i] === '--version' || args[i] === '-v') {
            printVersion();
            return;
        }
    }

    const installDir = detectInstallationDir(manualDir);
    const resourcesDir = locateResourcesDir(installDir);

    if (!fs.existsSync(resourcesDir)) {
        console.error(`[錯誤] 無法定位有效的 resources 目錄：${resourcesDir}`);
        process.exit(1);
    }

    const asarPath = path.join(resourcesDir, 'app.asar');
    const bakPath = path.join(resourcesDir, 'app.asar.bak');

    if (!fs.existsSync(asarPath) && !(restore && fs.existsSync(bakPath))) {
        console.error('[錯誤] 找不到 app.asar。本工具僅支援 Antigravity 2.0。');
        process.exit(1);
    }

    if (restore) {
        console.log(`====== 正在還原 ${PROJECT_NAME} ======`);
        restore20(resourcesDir);
    } else {
        console.log(`====== 正在套用 ${PROJECT_NAME} ======`);
        install20(resourcesDir);
    }
}

main();
