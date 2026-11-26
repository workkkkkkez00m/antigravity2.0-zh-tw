const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const crypto = require('crypto');

const PROJECT_ID = 'antigravity2-zh-hant-tw';
const PROJECT_NAME = 'Antigravity 2.0 繁體中文套件';
const ENGINE_VERSION = '2.0.10';
const SIGNATURE = 'ZH-HANT-TW';

const SIGNATURE_START = '/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION START --- */';
const SIGNATURE_END = '/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION END --- */';

function resolveAsarCli() {
    const localAsarPath = path.join(__dirname, 'node_modules', '@electron', 'asar', 'bin', 'asar.js');
    if (fs.existsSync(localAsarPath)) {
        return localAsarPath;
    }
    return null;
}

function runAsarCommand(action, args) {
    const asarCli = resolveAsarCli();
    if (!asarCli) {
        console.error('[錯誤] 找不到本地 @electron/asar CLI。');
        console.error('  請重新執行安裝工具。');
        return { success: false, stdout: '', stderr: '本地 @electron/asar 未安裝' };
    }

    const nodeExe = process.execPath;
    const cmd = `"${nodeExe}" "${asarCli}" ${action} ${args.map(a => `"${a}"`).join(' ')}`;
    return runCommandSync(cmd);
}

function checkEnvironment() {
    const asarCli = resolveAsarCli();
    if (!asarCli) {
        console.error('');
        console.error('╔══════════════════════════════════════════════════════════╗');
        console.error('║  [環境檢查] 找不到本地 @electron/asar CLI                ║');
        console.error('║                                                          ║');
        console.error('║  請重新執行安裝工具。                                    ║');
        console.error('║                                                          ║');
        console.error('║                                                          ║');
        console.error('║                                                          ║');
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
    const conversationControlLabels = {
        'Response actions': '回應操作',
        'Table options': '表格選項'
    };

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

    function translateCancelShortcut(value) {
        const match = value.match(/^(\\s*)Cancel(\\s*\\([^()]+\\))(\\s*)$/i);
        return match ? match[1] + (map.get('Cancel') || '取消') + match[2] + match[3] : null;
    }

    const greetingRules = [
        [/^Hi (.+), what can we get done today\\?$/, name => '嗨，' + name + '，今天想完成什麼？'],
        [/^Hey (.+), what should we build today\\?$/, name => '嗨，' + name + '，今天想打造什麼？'],
        [/^Welcome back, (.+)\\. Where should we pick up\\?$/, name => '歡迎回來，' + name + '。要從哪裡繼續？'],
        [/^Good to see you, (.+)\\. What's next\\?$/, name => '很高興見到你，' + name + '。接下來要做什麼？']
    ];

    const sshConnectionStatusRules = [
        [/^Checking (.+)…$/, '正在檢查 ', '…'],
        [/^Downloading the Antigravity server on (.+)…$/, '正在下載 Antigravity 伺服器至 ', '…'],
        [/^Installed the Antigravity server on (.+)[.]$/, '已在 ', ' 安裝 Antigravity 伺服器。'],
        [/^Starting the Antigravity server on (.+)…$/, '正在啟動以下主機上的 Antigravity 伺服器：', '…'],
        [/^Connecting to the running server on (.+)…$/, '正在連線至以下主機上執行中的伺服器：', '…'],
        [/^Restarting the Antigravity server on (.+)…$/, '正在重新啟動以下主機上的 Antigravity 伺服器：', '…'],
        [/^Connecting to (.+)…$/, '正在連線至 ', '…']
    ];

    function formatLimitDuration(value, abbreviated) {
        const match = abbreviated
            ? value.match(/^(\\d+)\\s*([dhm])(?:\\s+(\\d+)\\s*([dhm]))?(?:\\s+(\\d+)\\s*([dhm]))?$/i)
            : value.match(/^(\\d+)\\s+(days?|hours?|minutes?)(?:,\\s*(\\d+)\\s+(days?|hours?|minutes?))?(?:,\\s*(\\d+)\\s+(days?|hours?|minutes?))?$/i);
        if (!match) return null;

        const units = abbreviated
            ? { d: ['天', 0], h: ['小時', 1], m: ['分鐘', 2] }
            : { day: ['天', 0], hour: ['小時', 1], minute: ['分鐘', 2] };
        const parts = [];
        let previousOrder = -1;
        for (let i = 1; i < match.length; i += 2) {
            if (!match[i]) continue;
            const unit = match[i + 1].toLowerCase().replace(/s$/, '');
            const [label, order] = units[unit];
            if (order <= previousOrder) return null;
            parts.push(match[i] + ' ' + label);
            previousOrder = order;
        }
        return parts.join(' ');
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
        const cancelShortcutTranslation = translateCancelShortcut(originalVal);
        if (cancelShortcutTranslation !== null) return cancelShortcutTranslation;
        const valNorm = norm(originalVal);
        if (!valNorm) return originalVal;
        if (conversationControlLabels[valNorm]) return conversationControlLabels[valNorm];
        const breakdownCountMatch = valNorm.match(/^Show ([0-9]+) breakdowns?$/);
        if (breakdownCountMatch) {
            return '顯示 ' + breakdownCountMatch[1] + ' 項明細';
        }
        for (const [pattern, prefix, suffix] of sshConnectionStatusRules) {
            const match = valNorm.match(pattern);
            if (match) return prefix + match[1] + suffix;
        }
        const weeklyCountdown = valNorm.match(/^Weekly limit,\\s*resets in (.+)$/i);
        if (weeklyCountdown) {
            const duration = formatLimitDuration(weeklyCountdown[1], true);
            return duration ? '每週限制，' + duration + '後重置' : originalVal;
        }
        const resetCountdown = valNorm.match(/^Resets in (.+)$/i);
        if (resetCountdown) {
            const duration = formatLimitDuration(resetCountdown[1], true);
            return duration ? duration + '後重置' : originalVal;
        }
        const refreshCountdown = valNorm.match(/^You have used some of your (weekly|5-hour) limit, it will fully refresh in (.+)\\.$/i);
        if (refreshCountdown) {
            const duration = formatLimitDuration(refreshCountdown[2], false);
            if (!duration) return originalVal;
            const limit = refreshCountdown[1].toLowerCase() === 'weekly' ? '每週' : '五小時';
            return '您已使用部分' + limit + '額度，將於 ' + duration + '後完全恢復。';
        }
        for (const [pattern, translate] of greetingRules) {
            const match = valNorm.match(pattern);
            if (match) return translate(match[1]);
        }
        
        const valLower = valNorm.toLowerCase();
        let newVal = originalVal;

        if (map.has(valNorm)) {
            newVal = map.get(valNorm);
        } else if (lowerMap.has(valLower)) {
            newVal = lowerMap.get(valLower);
        } else {
            const shortcutMatch = valNorm.match(/^(.+?)(\\s+(?:↵|⏎|Enter|Return))$/);
            if (shortcutMatch) {
                const label = shortcutMatch[1];
                const labelLower = label.toLowerCase();
                if (map.has(label)) {
                    newVal = map.get(label) + shortcutMatch[2];
                } else if (lowerMap.has(labelLower)) {
                    newVal = lowerMap.get(labelLower) + shortcutMatch[2];
                }
            }
            if (newVal === originalVal) {
                for (const [key, translated] of longEntries) {
                    if (key.length > 20 && valNorm.includes(key)) {
                        newVal = newVal.split(key).join(translated);
                    }
                }
            }
        }
        if (newVal === originalVal) {
            const selectEnvironmentTranslation = map.get('Select Environment') || '選擇環境';
            const deleteProjectMatch = valNorm.match(/^Permanently delete (.+?) including (\\d+) active conversations? and (\\d+) archived conversations?\\.$/);
            if (valNorm.includes('Select Environment')) {
                newVal = originalVal.replace('Select Environment', selectEnvironmentTranslation);
            } else if (deleteProjectMatch) {
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

    function isTranslatablePlaceholderElement(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
        const tag = el.tagName.toUpperCase();
        return tag === 'TEXTAREA' || (tag === 'INPUT'
            && ['search', 'text'].includes((el.getAttribute('type') || 'text').toLowerCase()));
    }

    function translateAttributes(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
        const tag = el.tagName.toUpperCase();
        const canTranslatePlaceholder = isTranslatablePlaceholderElement(el);
        if (BLOCKED_TAGS.includes(tag) && !canTranslatePlaceholder) return;
        const className = el.className || '';
        if (canTranslatePlaceholder && (el.getAttribute('contenteditable') === 'true'
            || (typeof className === 'string' && BLOCKED_CLASSES.some(cls => className.includes(cls))))) return;
        if (isInBlockedZone(canTranslatePlaceholder ? (el.parentElement || el) : el)) return;

        for (const attr of ['placeholder', 'title', 'aria-label']) {
            if ((tag === 'INPUT' || tag === 'TEXTAREA') && attr !== 'placeholder') continue;
            const v = el.getAttribute(attr);
            if (!v) continue;
            const t = norm(v);
            const cancelShortcutTranslation = translateCancelShortcut(v);
            if (cancelShortcutTranslation !== null) {
                el.setAttribute(attr, cancelShortcutTranslation);
            } else if (conversationControlLabels[t]) {
                el.setAttribute(attr, conversationControlLabels[t]);
            } else if (map.has(t)) {
                el.setAttribute(attr, map.get(t));
            } else if (lowerMap.has(t.toLowerCase())) {
                el.setAttribute(attr, lowerMap.get(t.toLowerCase()));
            }
        }
    }

    function isApprovalNoTextNode(node) {
        if (!/^\\s*(?:4\\s+)?No\\s*$/.test(node.nodeValue || '') || !node.parentElement) return false;
        const placeholder = map.get('(tell the agent what to do instead)');
        let option = node.parentElement;
        for (let depth = 0; option && depth < 4; depth++, option = option.parentElement) {
            const hasPlaceholder = Array.from(option.querySelectorAll('input[placeholder], textarea[placeholder]')).some(el => {
                const value = el.getAttribute('placeholder');
                return value === '(tell the agent what to do instead)' || value === placeholder;
            });
            if (hasPlaceholder) {
                return option.querySelectorAll('[role="radio"], input[type="radio"]').length <= 1;
            }
        }
        return false;
    }

    function sweepAttributes(root) {
        if (!root || !root.querySelectorAll) return;
        const els = root.querySelectorAll('[title], [aria-label], [placeholder]');
        for (const el of els) {
            translateAttributes(el);
        }
    }

    const splitTextTranslationKeys = new Set([
        'No Projects found',
        'No automations yet'
    ]);

    const splitTextTranslationKeysLower = new Set(
        [...splitTextTranslationKeys].map(key => key.toLowerCase())
    );

    function translateSplitTextElement(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
        if (isInBlockedZone(el)) return false;
        if (el.matches && el.matches('button, input, textarea, select, option, [role="button"], [contenteditable="true"]')) return false;
        if (el.querySelector('button, input, textarea, select, option, svg, canvas, [contenteditable="true"]')) return false;

        const normalized = norm(el.textContent || '');
        if (!splitTextTranslationKeysLower.has(normalized.toLowerCase())) return false;

        const translated = map.get(normalized) || lowerMap.get(normalized.toLowerCase());
        if (!translated || translated === normalized) return false;

        const textNodes = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const current = walker.currentNode;
            if (!current.nodeValue || !current.nodeValue.trim()) continue;
            if (isInBlockedZone(current) || isConversationBodyNode(current)) return false;
            textNodes.push(current);
        }

        if (textNodes.length < 2 || textNodes.length > 4) return false;

        textNodes[0].nodeValue = translated;
        done.add(textNodes[0]);
        setTimeout(() => done.delete(textNodes[0]), 1000);

        for (let i = 1; i < textNodes.length; i++) {
            textNodes[i].nodeValue = '';
            done.add(textNodes[i]);
            setTimeout(() => done.delete(textNodes[i]), 1000);
        }

        return true;
    }

    const splitPhraseRules = [
        {
            key: 'when working in this project.',
            pattern: /when\\s*working\\s*in\\s*this\\s*project\\s*\\./i
        },
        {
            key: 'when working in these conversations.',
            pattern: /when\\s*working\\s*in\\s*these\\s*conversations\\s*\\./i
        },
        {
            key: 'This project is managed by the Swarm automation and can only be deleted by deleting that automation.',
            pattern: /This\\s*(?:project|專案)\\s*is\\s*managed\\s*by\\s*the\\s*Swarm\\s*automation\\s*and\\s*can\\s*only\\s*be\\s*deleted\\s*by\\s*deleting\\s*that\\s*automation\\s*\\./i
        },
        {
            key: 'Modified in',
            pattern: /\\bModified\\s+in\\b/i
        }
    ];
    const splitPhraseFragmentPattern = /\\b(?:when|working|in|this|project|these|conversations|Swarm|automation|Modified)\\b|專案/i;
    const splitPhraseInteractiveSelector = 'a, button, input, textarea, select, option, [role="link"], [role="button"], [contenteditable="true"]';
    const splitPhraseMaxParentTextLength = 400;
    const splitPhraseMaxParentDepth = 4;

    function translateSplitPhraseTextNode(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE || isInBlockedZone(node)) return false;

        let parent = node.parentElement;
        for (let depth = 0; parent && depth < splitPhraseMaxParentDepth; depth++) {
            if (isInBlockedZone(parent) || isConversationBodyNode(parent)) return false;

            const parentText = parent.textContent || '';
            if (parentText.length > splitPhraseMaxParentTextLength) break;
            const matchedRule = splitPhraseRules.find(rule => rule.pattern.test(parentText));
            if (!matchedRule) {
                parent = parent.parentElement;
                continue;
            }

            const textNodes = [];
            let offset = 0;
            const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const current = walker.currentNode;
                if (isConversationBodyNode(current)) return false;
                const value = current.nodeValue || '';
                textNodes.push({ node: current, start: offset, end: offset + value.length });
                offset += value.length;
            }

            const combinedText = textNodes.map(entry => entry.node.nodeValue || '').join('');
            const match = combinedText.match(matchedRule.pattern);
            if (!match || match.index === undefined) {
                parent = parent.parentElement;
                continue;
            }

            const translated = map.get(matchedRule.key)
                || lowerMap.get(matchedRule.key.toLowerCase());
            if (!translated) return false;

            const matchStart = match.index;
            const matchEnd = matchStart + match[0].length;
            const matchedNodes = textNodes.filter(entry => entry.start < matchEnd && entry.end > matchStart);
            if (!matchedNodes.length) return false;

            for (const entry of matchedNodes) {
                const entryParent = entry.node.parentElement;
                if (entryParent && entryParent.closest(splitPhraseInteractiveSelector)) return false;
            }

            let replacementWritten = false;
            for (const entry of matchedNodes) {
                const value = entry.node.nodeValue || '';
                const localStart = Math.max(matchStart, entry.start) - entry.start;
                const localEnd = Math.min(matchEnd, entry.end) - entry.start;
                const replacement = replacementWritten ? '' : translated;
                replacementWritten = true;
                entry.node.nodeValue = value.slice(0, localStart) + replacement + value.slice(localEnd);
                done.add(entry.node);
                setTimeout(() => done.delete(entry.node), 1000);
            }

            return true;
        }

        return false;
    }

    function translateAutomationProjectNotice(node) {
        if (!node || node.nodeType !== Node.TEXT_NODE || isInBlockedZone(node)) return false;

        const notices = [
            {
                key: 'This project was created for the {automation} automation.',
                pattern: /(This\\s+(?:project|專案)\\s+was\\s+created\\s+for\\s+the\\s+)(.+?)(\\s+automation\\.)/i
            },
            {
                key: 'This project is managed by the {automation} automation and can only be deleted by deleting that automation.',
                pattern: /(This\\s+(?:project|專案)\\s+is\\s+managed\\s+by\\s+the\\s+)(.+?)(\\s+automation\\s+and\\s+can\\s+only\\s+be\\s+deleted\\s+by\\s+deleting\\s+that\\s+automation\\.)/i
            }
        ];

        let parent = node.parentElement;
        for (let depth = 0; parent && depth < splitPhraseMaxParentDepth; depth++) {
            if (isInBlockedZone(parent) || isConversationBodyNode(parent)) return false;
            const parentText = parent.textContent || '';
            if (parentText.length > splitPhraseMaxParentTextLength) break;
            let match;
            let template;
            for (const notice of notices) {
                const translation = map.get(notice.key);
                if (!translation || !translation.includes('{automation}')) continue;
                const candidate = parentText.match(notice.pattern);
                if (candidate) {
                    match = candidate;
                    template = translation;
                    break;
                }
            }
            if (!match || match.index === undefined) {
                parent = parent.parentElement;
                continue;
            }
            const [prefixTranslation, suffixTranslation] = template.split('{automation}');

            const textNodes = [];
            let offset = 0;
            const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const current = walker.currentNode;
                if (isConversationBodyNode(current)) return false;
                const value = current.nodeValue || '';
                textNodes.push({ node: current, start: offset, end: offset + value.length });
                offset += value.length;
            }

            const prefixStart = match.index;
            const prefixEnd = prefixStart + match[1].length;
            const suffixStart = prefixEnd + match[2].length;
            const suffixEnd = suffixStart + match[3].length;
            const prefixNodes = textNodes.filter(entry => entry.start < prefixEnd && entry.end > prefixStart);
            const suffixNodes = textNodes.filter(entry => entry.start < suffixEnd && entry.end > suffixStart);
            if (!prefixNodes.length || !suffixNodes.length) return false;
            if ([...prefixNodes, ...suffixNodes].some(entry => entry.node.parentElement?.closest(splitPhraseInteractiveSelector))) return false;

            const replaceSpan = (entries, start, end, replacement) => {
                let written = false;
                for (const entry of entries) {
                    const value = entry.node.nodeValue || '';
                    const localStart = Math.max(start, entry.start) - entry.start;
                    const localEnd = Math.min(end, entry.end) - entry.start;
                    entry.node.nodeValue = value.slice(0, localStart) + (written ? '' : replacement) + value.slice(localEnd);
                    written = true;
                    done.add(entry.node);
                    setTimeout(() => done.delete(entry.node), 1000);
                }
            };

            replaceSpan(suffixNodes, suffixStart, suffixEnd, suffixTranslation);
            replaceSpan(prefixNodes, prefixStart, prefixEnd, prefixTranslation);
            return true;
        }

        return false;
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

        } catch (err) {}
    }

    function isConversationBodyNode(node) {
        const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
        if (el.closest('[data-base-ui-portal] [role="tooltip"]')) return false;
        if (el.closest('button, [role="button"]')) return false;
        return !!el.closest(
            '[data-testid="agent-response"] [data-markdown-root], '
            + '[data-testid="user-message-content"] div.whitespace-pre-wrap[data-quotable]'
        );
    }

    function translateNode(node) {
        try {
            if (!node) return;
            if (node.nodeType === Node.TEXT_NODE && isConversationBodyNode(node)) return;
            if (done.has(node)) {
                if (node.nodeType !== Node.TEXT_NODE) return;
                const currentValue = node.nodeValue || '';
                if (translateString(currentValue) === currentValue && !splitPhraseFragmentPattern.test(currentValue)) return;
                done.delete(node);
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                translateAttributes(node);
                if (!isConversationBodyNode(node) && translateSplitTextElement(node)) return;
                if (node.shadowRoot) translateNode(node.shadowRoot);
                for (const child of node.childNodes) translateNode(child);
                return;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const originalVal = node.nodeValue;
                if (!originalVal || originalVal.trim().length < 1) return;
                if (isInBlockedZone(node)) return;
                if (translateSplitTextElement(node.parentElement)) return;
                const hasSplitPhraseFragment = splitPhraseFragmentPattern.test(originalVal);
                if (hasSplitPhraseFragment && translateAutomationProjectNotice(node)) return;
                if (hasSplitPhraseFragment && translateSplitPhraseTextNode(node)) return;

                let newVal = isApprovalNoTextNode(node)
                    ? originalVal.replace(/No(?=\\s*$)/, '否')
                    : translateString(originalVal);

                if (newVal === originalVal && !hasSplitPhraseFragment && translateSplitPhraseTextNode(node)) return;

                if (newVal !== originalVal) {
                    node.nodeValue = newVal;
                    done.add(node);
                    setTimeout(() => done.delete(node), 1000);
                }
            }
        } catch (e) {}
    }

    const pendingTextNodes = new Set();
    let textFramePending = false;
    function queueTextNode(node) {
        pendingTextNodes.add(node);
        if (textFramePending) return;
        textFramePending = true;
        requestAnimationFrame(() => {
            const nodes = [...pendingTextNodes];
            pendingTextNodes.clear();
            textFramePending = false;
            for (const textNode of nodes) translateNode(textNode);
        });
    }

    function shouldTranslateTextImmediately(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE || !el.closest) return true;
        try {
            return !!el.closest('[data-base-ui-portal], ' + tooltipPortalSelectors.join(', '));
        } catch (e) {
            return true;
        }
    }

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                for (const n of m.addedNodes) {
                    if (n.nodeType === Node.TEXT_NODE) {
                        if (shouldTranslateTextImmediately(m.target)) {
                            translateNode(n);
                        } else if (!isConversationBodyNode(n)) {
                            queueTextNode(n);
                        }
                    } else {
                        translateNode(n);
                    }
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
                                sweepAttributes(n);
                            }
                            if (n.querySelectorAll) {
                                for (const tooltip of n.querySelectorAll(tooltipPortalSelectors.join(', '))) {
                                    translateNode(tooltip);
                                    sweepAttributes(tooltip);
                                }
                            }
                        } catch(e) {}
                    }
                }
            } else if (m.type === 'characterData') {
                if (m.target.nodeType === Node.TEXT_NODE) {
                    if (shouldTranslateTextImmediately(m.target.parentElement)) {
                        translateNode(m.target);
                    } else if (!isConversationBodyNode(m.target)) {
                        queueTextNode(m.target);
                    }
                } else {
                    translateNode(m.target);
                }
            } else if (m.type === 'attributes') {
                const el = m.target;
                if (!el || el.nodeType !== Node.ELEMENT_NODE) continue;
                const attr = m.attributeName;
                const canTranslatePlaceholder = attr === 'placeholder' && isTranslatablePlaceholderElement(el);
                const className = el.className || '';
                if (canTranslatePlaceholder && (el.getAttribute('contenteditable') === 'true'
                    || (typeof className === 'string' && BLOCKED_CLASSES.some(cls => className.includes(cls))))) continue;
                if (isInBlockedZone(canTranslatePlaceholder ? (el.parentElement || el) : el)) continue;
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
    });

    const obsOpts = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder'] };

    let initialTooltipScanDone = false;
    const startEngine = () => {
        const target = document.body || document.documentElement;
        if (!target) return;

        try {
            observer.observe(target, obsOpts);
            translateNode(target);
            sweepAttributes(target);
            if (!initialTooltipScanDone) {
                initialTooltipScanDone = true;
                translateTooltipPortals();
            }
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
            const canTranslatePlaceholder = name === 'placeholder' && isTranslatablePlaceholderElement(this);
            const className = this.className || '';
            if (!(canTranslatePlaceholder && (this.getAttribute('contenteditable') === 'true'
                || (typeof className === 'string' && BLOCKED_CLASSES.some(cls => className.includes(cls)))))
                && !isInBlockedZone(canTranslatePlaceholder ? (this.parentElement || this) : this)
                && (!BLOCKED_TAGS.includes(this.tagName.toUpperCase()) || canTranslatePlaceholder)) {
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

function stopMacAntigravityProcesses(installDir) {
    let appDir = path.resolve(installDir);
    while (!appDir.endsWith('.app') && path.dirname(appDir) !== appDir) appDir = path.dirname(appDir);
    if (!appDir.endsWith('.app')) {
        console.error(`[錯誤] 無法識別 Antigravity.app：${installDir}`);
        return false;
    }

    try {
        const appPaths = [appDir, fs.realpathSync(appDir)];
        const list = () => child_process.execFileSync('/bin/ps', ['-ww', '-axo', 'pid=,command='], { encoding: 'utf-8' })
            .split('\n').flatMap(line => {
                const match = line.match(/^\s*(\d+)\s+(.+)$/);
                if (!match || !appPaths.some(appPath => match[2].startsWith(`${appPath}/Contents/`))) return [];
                return [{ pid: Number(match[1]), command: match[2] }];
            });

        const stop = signal => {
            for (const item of list()) {
                if (!list().some(current => current.pid === item.pid && current.command === item.command)) continue;
                try { process.kill(item.pid, signal); }
                catch (error) { if (error.code !== 'ESRCH') throw error; }
            }
        };
        const wait = seconds => child_process.execFileSync('/bin/sleep', [String(seconds)]);
        // 維持 main 的兩輪關閉、等待與殘留 PID 處理，只匹配目標 app 的執行路徑。
        stop('SIGTERM');
        wait(2);
        stop('SIGTERM');
        wait(1.5);
        if (list().length === 0) return true;
        const remaining = list();
        for (const item of remaining) {
            if (!list().some(current => current.pid === item.pid && current.command === item.command)) continue;
            try { process.kill(item.pid, 'SIGKILL'); }
            catch (error) { if (error.code !== 'ESRCH') throw error; }
        }
        wait(0.5);
        const survivors = list();
        if (survivors.length === 0) return true;
        console.error(`[錯誤] Antigravity 未完整退出（PID：${survivors.map(item => item.pid).join(', ')}）；未修改 app.asar。`);
    } catch (error) {
        console.error(`[錯誤] 無法確認 Antigravity 是否完整退出：${error.message}；未修改 app.asar。`);
    }
    return false;
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

function verifyMacAsar(filePath, localized) {
    const asar = require('@electron/asar');
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size === 0) throw new Error(`ASAR 檔案為空或不是檔案：${filePath}`);
    asar.uncache(filePath);
    const raw = asar.getRawHeader(filePath);
    const dataSize = stat.size - 8 - raw.headerSize;
    if (dataSize < 0) throw new Error(`ASAR 標頭不完整：${filePath}`);
    const verifyEntries = entries => {
        for (const entry of Object.values(entries)) {
            if (entry.files) verifyEntries(entry.files);
            else if (!entry.unpacked && !entry.link && entry.size > 0) {
                const offset = Number(entry.offset);
                if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(entry.size)
                    || offset + entry.size > dataSize) throw new Error(`ASAR 內容不完整：${filePath}`);
            }
        }
    };
    verifyEntries(raw.header.files);
    asar.listPackage(filePath);
    const preload = asar.extractFile(filePath, 'dist/preload.js').toString('utf-8');
    if (!preload) throw new Error(`ASAR 中的 preload.js 為空：${filePath}`);
    const hasTranslation = preload.includes(SIGNATURE_START) && preload.includes(SIGNATURE_END);
    if (localized !== null && hasTranslation !== localized) throw new Error(`ASAR 翻譯狀態不符：${filePath}`);
}

function fileDigest(filePath) {
    const hash = crypto.createHash('sha256');
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(1024 * 1024);
    try {
        let count;
        while ((count = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) hash.update(buffer.subarray(0, count));
    } finally {
        fs.closeSync(fd);
    }
    return hash.digest('hex');
}

function verifySameFile(source, copy) {
    if (fs.statSync(source).size !== fs.statSync(copy).size || fileDigest(source) !== fileDigest(copy)) {
        throw new Error(`檔案複製後內容不一致：${copy}`);
    }
}

function ensureMacBackup(asarPath, bakPath, stagePath) {
    if (fs.existsSync(bakPath)) {
        verifyMacAsar(bakPath, false);
        return;
    }
    verifyMacAsar(asarPath, false);
    fs.copyFileSync(asarPath, stagePath, fs.constants.COPYFILE_EXCL);
    verifyMacAsar(stagePath, false);
    verifySameFile(asarPath, stagePath);
    fs.linkSync(stagePath, bakPath);
    try { verifyMacAsar(bakPath, false); }
    catch (error) { fs.unlinkSync(bakPath); throw error; }
}

function replaceMacAsar(asarPath, bakPath, candidatePath, rollbackPath, verifyInstalled) {
    const hadOriginal = fs.existsSync(asarPath);
    const originalDigest = hadOriginal ? fileDigest(asarPath) : null;
    if (hadOriginal) {
        fs.copyFileSync(asarPath, rollbackPath, fs.constants.COPYFILE_EXCL);
        verifySameFile(asarPath, rollbackPath);
    }
    try {
        fs.renameSync(candidatePath, asarPath);
        verifyInstalled(asarPath);
        if (hadOriginal) fs.unlinkSync(rollbackPath);
        return { success: true, recovered: true };
    } catch (error) {
        console.error(`[錯誤] ASAR 替換或驗證失敗：${error.message}`);
        try {
            if (hadOriginal) {
                if (!fs.existsSync(asarPath) || fileDigest(asarPath) !== originalDigest) {
                    fs.renameSync(rollbackPath, asarPath);
                }
                if (fileDigest(asarPath) !== originalDigest) throw new Error('回復後摘要不符');
            } else {
                if (fs.existsSync(asarPath)) fs.unlinkSync(asarPath);
                if (fs.existsSync(asarPath)) throw new Error('無法回復原本不存在的 app.asar');
            }
            console.error('[回復] 已回復替換前的 app.asar。');
        } catch (recoveryError) {
            console.error(`[錯誤] 自動回復失敗：${recoveryError.message}`);
            console.error(`[回復] 保留 ${bakPath}、${rollbackPath} 與 ${candidatePath} 供手動處理。`);
            return { success: false, recovered: false };
        }
        return { success: false, recovered: true };
    }
}

function install20(resourcesDir) {
    const asarPath = path.join(resourcesDir, 'app.asar');
    const bakPath = path.join(resourcesDir, 'app.asar.bak');
    const mac = process.platform === 'darwin';

    if (!fs.existsSync(asarPath)) {
        console.error(`[錯誤] 在 resources 目錄中找不到 app.asar：${resourcesDir}`);
        return false;
    }

    if (!checkEnvironment()) {
        return false;
    }

    if (mac ? !stopMacAntigravityProcesses(path.dirname(path.dirname(resourcesDir))) : (closeAntigravityProcesses(), false)) {
        return false;
    }

    let transactionDir;
    let preserveTransaction = false;
    try {
    if (mac) {
        transactionDir = fs.mkdtempSync(path.join(resourcesDir, '.app-asar-'));
        ensureMacBackup(asarPath, bakPath, path.join(transactionDir, 'backup.asar'));
    }

    if (!mac && !fs.existsSync(bakPath)) {
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
    } else if (!mac) {
        console.log('[備份] 已存在 app.asar.bak，本次沿用既有備份。');
    }

    const tempDir = mac ? path.join(transactionDir, 'unpacked') : path.join(__dirname, '_temp_asar');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log('[展開] 正在展開 app.asar...');
    const extractRes = runAsarCommand('extract', [asarPath, tempDir]);
    if (!extractRes.success || !fs.existsSync(tempDir)) {
        console.error('[錯誤] 展開失敗，請確認必要相依套件與 Node.js 可正常使用。');
        console.error(`詳情：${extractRes.stderr}\n${extractRes.stdout}`);
        return false;
    }

    const preloadPath = path.join(tempDir, 'dist', 'preload.js');
    if (!fs.existsSync(preloadPath)) {
        console.error(`[錯誤] 展開後找不到 preload.js：${preloadPath}`);
        fs.rmSync(tempDir, { recursive: true, force: true });
        return false;
    }

    console.log('[修改] 正在注入繁體中文台灣用語字典...');
    const preloadContent = fs.readFileSync(preloadPath, 'utf-8');
    const cleanedPreload = cleanJsContent(preloadContent);
    const translationJs = generateJs();
    fs.writeFileSync(preloadPath, cleanedPreload + '\n' + translationJs, 'utf-8');

    const menuPath = path.join(tempDir, 'dist', 'menu.js');
    if (fs.existsSync(menuPath)) {
        const menuContent = fs.readFileSync(menuPath, 'utf-8');
        const menuCleaned = cleanMenuJsContent(menuContent);
        const menuTranslationJs = createMenuTranslationPatch();

        const targetStr = 'electron_1.Menu.setApplicationMenu(menu);';
        const idx = menuCleaned.indexOf(targetStr);

        if (idx !== -1) {
            const patchedMenuContent = menuCleaned.substring(0, idx) + menuTranslationJs + '\n    ' + menuCleaned.substring(idx);
            fs.writeFileSync(menuPath, patchedMenuContent, 'utf-8');
        } else {
            console.warn('[警告] 找不到 menu.js 插入點，略過系統選單文字注入。');
        }
    }

    const trayPath = path.join(tempDir, 'dist', 'tray.js');
    if (fs.existsSync(trayPath)) {
        const trayContent = fs.readFileSync(trayPath, 'utf-8');
        const trayCleaned = cleanTrayJsContent(trayContent);

        const targetCreate = 'function createTray(actions) {';
        const replacementCreate = createTrayCreatePatch();

        let trayPatched = trayCleaned.replace(targetCreate, replacementCreate);

        const countRegex = /countItem\.label\s*=\s*\([\s\S]*?' running';/g;
        const replacementCount = "countItem.label = count > 0 ? `${count} 個 Agent 執行中` : '目前沒有執行中的 Agent';";
        trayPatched = trayPatched.replace(countRegex, replacementCount);

        fs.writeFileSync(trayPath, trayPatched, 'utf-8');
    }

    const loadingPath = path.join(tempDir, 'dist', 'loadingOverlay.js');
    if (fs.existsSync(loadingPath)) {
        let loadingContent = fs.readFileSync(loadingPath, 'utf-8');

        const targetText = '<div class="text">Loading Antigravity</div>';
        const replacementText = '<div class="text">正在啟動 Antigravity...</div>';
        loadingContent = loadingContent.replace(targetText, replacementText);

        fs.writeFileSync(loadingPath, loadingContent, 'utf-8');
    }

    console.log('[打包] 正在重新打包 app.asar...');
    const candidatePath = mac ? path.join(transactionDir, 'candidate.asar') : asarPath;
    const packRes = runAsarCommand('pack', [tempDir, candidatePath]);
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (!packRes.success) {
        console.error('[錯誤] 打包失敗。');
        console.error(`詳情：${packRes.stderr}\n${packRes.stdout}`);
        return false;
    }

    if (mac) {
        verifyMacAsar(candidatePath, true);
        const replacement = replaceMacAsar(asarPath, bakPath, candidatePath,
            path.join(transactionDir, 'rollback.asar'), installedPath => verifyMacAsar(installedPath, true));
        if (!replacement.success) {
            preserveTransaction = !replacement.recovered;
            return false;
        }
    }

    console.log(`[完成] ${PROJECT_NAME} 已套用完成。`);
    return true;
    } catch (error) {
        console.error(`[錯誤] 安裝 app.asar 失敗：${error.message}`);
        return false;
    } finally {
        if (transactionDir && !preserveTransaction) fs.rmSync(transactionDir, { recursive: true, force: true });
    }
}

function restore20(resourcesDir) {
    const asarPath = path.join(resourcesDir, 'app.asar');
    const bakPath = path.join(resourcesDir, 'app.asar.bak');

    if (!fs.existsSync(bakPath)) {
        console.log('[提示] 找不到 app.asar.bak，可能尚未套用過本工具，或備份已被移除。');
        return false;
    }

    if (process.platform === 'darwin') {
        if (!checkEnvironment()) return false;
        if (!stopMacAntigravityProcesses(path.dirname(path.dirname(resourcesDir)))) return false;
        let transactionDir;
        let preserveTransaction = false;
        try {
            verifyMacAsar(bakPath, false);
            transactionDir = fs.mkdtempSync(path.join(resourcesDir, '.app-asar-'));
            const candidatePath = path.join(transactionDir, 'candidate.asar');
            fs.copyFileSync(bakPath, candidatePath, fs.constants.COPYFILE_EXCL);
            verifyMacAsar(candidatePath, false);
            verifySameFile(bakPath, candidatePath);
            const replacement = replaceMacAsar(asarPath, bakPath, candidatePath,
                path.join(transactionDir, 'rollback.asar'), installedPath => {
                    verifyMacAsar(installedPath, false);
                    verifySameFile(bakPath, installedPath);
                });
            if (!replacement.success) {
                preserveTransaction = !replacement.recovered;
                return false;
            }
            try { fs.unlinkSync(bakPath); }
            catch (error) { console.warn(`[警告] 無法移除官方備份：${error.message}`); }
            console.log('[完成] 官方 app.asar 已還原。');
            return true;
        } catch (error) {
            console.error(`[錯誤] 還原 app.asar 失敗：${error.message}`);
            return false;
        } finally {
            if (transactionDir && !preserveTransaction) fs.rmSync(transactionDir, { recursive: true, force: true });
        }
    }

    closeAntigravityProcesses();

    console.log('[還原] 正在還原官方 app.asar...');
    fs.copyFileSync(bakPath, asarPath);
    fs.unlinkSync(bakPath);
    console.log('[完成] 官方 app.asar 已還原。');
    return true;
}

function locateResourcesDir(installDir, restore = false) {
    const candidates = [
        path.join(installDir, 'resources'),
        path.join(installDir, 'Contents', 'Resources'),
        installDir
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, 'app.asar'))
            || (process.platform === 'darwin' && restore && fs.existsSync(path.join(candidate, 'app.asar.bak')))) {
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

    if (process.platform === 'darwin' && process.env.ANTIGRAVITY_INSTALLER_MODE === '1'
        && process.env.ANTIGRAVITY_GUI_CONFIRMED !== '1') {
        console.error('[錯誤] macOS 安裝工具必須先完成圖形確認。');
        process.exitCode = 1;
        return;
    }

    const installDir = detectInstallationDir(manualDir);
    const resourcesDir = locateResourcesDir(installDir, restore);

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

    let success;

    if (restore) {
        console.log(`====== 正在還原 ${PROJECT_NAME} ======`);
        success = restore20(resourcesDir);
    } else {
        console.log(`====== 正在套用 ${PROJECT_NAME} ======`);
        success = install20(resourcesDir);
    }

    if (!success) {
        process.exitCode = 1;
    }
}

main();
