# Antigravity 2.0 繁體中文套件

> **安裝方式選擇：**
> - v1.0.7：傳統 zip / `npm install` / 腳本安裝流程。
> - v2.0.0：Windows / macOS 安裝器流程，仍需先安裝 Node.js LTS，但不需手動執行 `npm install`。請參考 [v2.0.0 快速安裝說明](README-v2.md)。
>
> 可依偏好的安裝方式自行選擇下載。

將 Antigravity 2.0 的介面翻譯為繁體中文（台灣）。目前提供傳統腳本安裝流程與 v2 安裝器流程；前者適合習慣自行解壓縮並執行 `npm install` 的使用者，後者適合偏好圖形化安裝檔的使用者。支援 Windows 與 macOS。

Antigravity 2.0 Traditional Chinese Localization Toolkit is a source-available project that translates the Antigravity 2.0 interface into Traditional Chinese. It works by unpacking and repacking the local Electron ASAR file, without modifying official core binaries or redistributing any official Antigravity files. The toolkit supports both Windows and macOS, provides quick script-based installation and full restoration after dependencies are installed, automatically creates backups, runs entirely on the user’s local machine, and carefully avoids translating code editors, terminals, input fields, debug consoles, and other areas where localization could interfere with development workflows.

---

## 簡介

**Antigravity 2.0 繁體中文套件**是一套公開且免費的介面本地化工具，透過 ASAR 解包與重新打包機制，將 Antigravity 2.0 的英文介面翻譯為繁體中文。

為確保翻譯內容與 Antigravity 2.0 官方最新 v2.14.0 介面一致，建議可先安裝本套件最新版。

- 不修改官方核心二進位檔案
- 不散布官方 `app.asar` 或任何官方檔案
- 完成 Node.js 與 `npm install` 後，可按兩下腳本安裝與完整還原
- 所有操作在使用者的電腦執行

---

## 使用畫面

### 主介面

![Antigravity 2.0 繁體中文主介面](images/screenshot-main-ui.JPG)

### 設定頁

![Antigravity 2.0 繁體中文設定頁](images/screenshot-settings.JPG)

---

## 下載方式

### 方式一：GitHub Releases（推薦）

前往本專案的 [GitHub Releases](../../releases) 頁面，在 Assets 區下載 `antigravity2-zh-hant-v1.0.6.zip`。

1. 下載 `antigravity2-zh-hant-v1.0.6.zip`
2. 解壓縮到任意目錄
3. 開啟 Windows 的 **命令提示字元（cmd）**，或 macOS 的 **終端機（Terminal）**
4. 使用 `cd` 切換到剛才解壓縮的套件資料夾
5. 再執行：

```bash
npm install
```

Windows 範例：

```bash
cd "C:\Users\你的使用者名稱\Downloads\antigravity2-zh-hant-v1.0.6"
npm install
```

macOS 範例：

```bash
cd ~/Downloads/antigravity2-zh-hant-v1.0.6
npm install
```

> 補充：Windows 可在資料夾上方路徑列輸入 `cmd` 後按 Enter；macOS 可在終端機輸入 `cd ` 後，把資料夾拖進終端機視窗。

> 如果資料夾路徑包含空格，請使用雙引號 `"` 包住完整路徑。

> ⚠️ **注意**：請下載完整的 `.zip` 檔案，不要只下載單一的 `.bat` 或 `.command` 檔案。安裝腳本需要搭配 `localization_engine.js`、`dicts/` 字典目錄與 `package.json` 等檔案才能正常運作。

> ⚠️ **注意**：Releases zip 中不包含 `node_modules/`，因此解壓縮後仍需執行 `npm install` 安裝依賴套件。

### 方式二：Git Clone

Windows 請先開啟「命令提示字元（cmd）」或其他可使用 Git 的終端機，macOS 請開啟「終端機（Terminal）」。以下指令需在終端機／命令提示字元中執行：

```bash
git clone https://github.com/workkkkkkez00m/antigravity2.0-zh-tw.git
cd antigravity2.0-zh-tw
npm install
```
---

## 功能特色

- 🌐 **繁體中文介面**：涵蓋主介面、設定頁、Agent 管理、MCP／知識庫頁面等多個區域
- 🖥️ **跨平台支援**：同時支援 Windows 與 macOS
- 🔧 **快速安裝**：完成 Node.js 與 `npm install` 後，按兩下安裝腳本即可執行安裝
- 🔄 **完整還原**：隨時可還原為官方英文原版
- 🛡️ **安全備份**：首次安裝時自動備份官方 `app.asar`
- 📦 **離線運作**：使用本地 `@electron/asar`，不依賴 `npx` 動態下載
- 🎯 **精準翻譯**：自動避開程式碼區、終端機（Terminal）、編輯器等不應翻譯的區域

---

## 重要提醒：官方軟體更新後須重新安裝

> ⚠️ **每次 Antigravity 官方釋出更新後，繁體中文介面可能會消失。這是正常現象。**

Antigravity 官方更新時，會重新覆蓋 `app.asar` 檔案，導致先前注入的繁體中文本地化內容被移除。

**這是正常情況，並非套件故障。**

只要在更新後重新執行安裝腳本，即可恢復繁體中文介面：

- **Windows**：按兩下 `install-win.bat` 執行
- **macOS**：按兩下 `install-macos.command` 執行

> 💡 建議在每次 Antigravity 更新完成後，養成重新執行安裝腳本的習慣。

---

## 支援狀態

| 平台 | 安裝 | 還原 | UI 驗證 | 備註 |
|------|------|------|---------|------|
| macOS | ✅ 已通過 | ✅ 已通過 | ✅ 已通過 | 實機驗證完成 |
| Windows | ✅ 已通過 | ✅ 已通過 | ⚠️ 部分驗證 | v1.0.6 已於 Windows 10 測試完成，Windows 11 待測試 |

> 翻譯範圍持續補齊中。若在使用過程中發現未翻譯的文字，歡迎回報。

---

## 使用前需求

使用本套件前，請確認已安裝以下工具：

| 需求項目 | 說明 |
|----------|------|
| **Antigravity 2.0** | 本套件的翻譯對象，需先安裝 Antigravity |
| **Node.js LTS** | 前往 [nodejs.org](https://nodejs.org/) 下載安裝（安裝時會一併安裝 npm） |
| **npm** | 隨 Node.js 一同安裝，用於安裝本地依賴 |

### 首次使用前

第一次使用前，請先切換到本套件的資料夾，也就是可以看到 `package.json` 的那一層目錄。

1. Windows：開啟「命令提示字元（cmd）」
2. macOS：開啟「終端機（Terminal）」
3. 使用 `cd` 切換到解壓縮後的套件資料夾
4. 確認目前位於包含以下檔案的資料夾：
   - `package.json`
   - `localization_engine.js`
   - `dicts/`
5. 再執行：

```bash
npm install
```

此步驟會安裝本地 `@electron/asar` 套件，用於 ASAR 解包與重新打包。本套件使用本地安裝的 `@electron/asar`，不依賴 `npx` 動態下載，確保離線環境也能正常運作。

---

## 快速開始

1. 開啟終端機：
   - Windows：**命令提示字元（cmd）**
   - macOS：**終端機（Terminal）**
2. 使用 `cd` 切換到解壓縮後的套件資料夾，例如：

```bash
# Windows 範例
cd "C:\Users\你的使用者名稱\Downloads\antigravity2-zh-hant-v1.0.6"

# macOS 範例
cd ~/Downloads/antigravity2-zh-hant-v1.0.6
```

3. 確認 Node.js 與 npm：

```bash
node -v
npm -v
```

4. 第一次使用執行：

```bash
npm install
```

5. 完全退出 Antigravity。
6. 執行安裝腳本：
   - Windows：按兩下 `install-win.bat`
   - macOS：按兩下 `install-macos.command`
7. 重新啟動 Antigravity，即可看到繁體中文介面。

---

## Windows 安裝

### 前置確認

建議開啟 **命令提示字元（cmd）**，確認 Node.js 與 npm 已可使用：

```cmd
node -v
npm -v
```

若上述指令能正確輸出版本號，請先使用 `cd` 切換到解壓縮後的本套件資料夾，再執行：

```cmd
cd "C:\Users\你的使用者名稱\Downloads\antigravity2-zh-hant-v1.0.6"
npm install
```

若使用 PowerShell 時被 ExecutionPolicy 擋住，可改用命令提示字元 cmd，或在 PowerShell 中執行：

```cmd
npm.cmd install
```

### 安裝繁體中文

1. **完全退出** Antigravity 軟體。
2. 在本套件資料夾中，**按兩下 `install-win.bat` 執行**。
3. 執行完成後，重新啟動 Antigravity，即可看到繁體中文介面。

### 手動指定安裝路徑

若 Antigravity 的安裝位置與預設不同，可使用以下方式手動指定：

```cmd
node localization_engine.js --install-dir "C:\Users\<你的使用者名稱>\AppData\Local\Programs\antigravity"
```

### Windows 常見問題

<details>
<summary><strong>node.exe 存取被拒（Access Denied）</strong></summary>

若執行 `node -v` 時出現「存取被拒」，通常代表系統 PATH 上的 `node.exe` 指向異常位置（例如 Windows App 安裝目錄）。解決方式：

1. 移除現有 Node.js 安裝
2. 從 [nodejs.org](https://nodejs.org/) 重新下載 LTS 版本安裝
3. 安裝完成後重新開啟終端機，確認 `node -v` 正常輸出版本號
</details>

<details>
<summary><strong>找不到 npm</strong></summary>

npm 隨 Node.js 一併安裝。若 `npm -v` 無法使用，請重新安裝 Node.js LTS 版本。安裝時確認勾選 npm 相關選項。
</details>

<details>
<summary><strong>Antigravity 安裝路徑不同</strong></summary>

引擎預設搜尋 `%LOCALAPPDATA%\Programs\antigravity`。若你的 Antigravity 安裝在其他位置，請使用 `--install-dir` 參數手動指定。
</details>

---

## macOS 安裝

### 前置確認

開啟 **終端機（Terminal）**，確認 Node.js 與 npm 已可使用：

```bash
node -v
npm -v
```

若上述指令能正確輸出版本號，請先使用 `cd` 切換到解壓縮後的本套件資料夾，再執行：

```bash
cd ~/Downloads/antigravity2-zh-hant-v1.0.6
npm install
```

### 安裝繁體中文

1. **完全退出** Antigravity 軟體（選單列 → Antigravity → Quit，或 `Cmd+Q`）。
2. 在 Finder 中找到本套件資料夾，**按兩下 `install-macos.command` 執行**。
   - 若系統提示「無法驗證開發者」，請在 Finder 中對檔案按右鍵 → **開啟**。
3. 執行完成後，重新啟動 Antigravity，即可看到繁體中文介面。

### .command 無法執行

若按兩下 `.command` 檔案後沒有反應，請先在終端機中授予執行權限：

```bash
chmod +x install-macos.command restore-macos.command
```

### 手動指定安裝路徑

若 Antigravity 的安裝位置與預設不同，可使用以下方式手動指定：

```bash
node localization_engine.js --install-dir "/Applications/Antigravity.app"
```

### macOS EPERM/EACCES 備份說明

首次安裝時，引擎會建立 `app.asar.bak` 備份檔。在某些 macOS 環境下可能遇到權限問題：

1. 引擎會先嘗試 `fs.copyFileSync` 建立備份
2. 若遇到 **EPERM** 或 **EACCES** 錯誤，會自動改用 `/bin/cp -p` 作為備援方式
3. 本套件**不會自動執行 `sudo`**

若備援方式仍失敗，可手動建立備份後再執行安裝：

```bash
cp "/Applications/Antigravity.app/Contents/Resources/app.asar" \
   "/Applications/Antigravity.app/Contents/Resources/app.asar.bak"
```

---

## 還原官方原版

### Windows

按兩下 `restore-win.bat` 執行，或在命令列執行：

```cmd
node localization_engine.js --restore
```

### macOS

按兩下 `restore-macos.command` 執行，或在終端機執行：

```bash
node localization_engine.js --restore
```

### 通用方式

任何平台均可使用以下指令還原：

```bash
node localization_engine.js --restore
```

> 還原時，引擎會使用首次安裝時建立的 `app.asar.bak` 回復官方原版。還原完成後，備份檔會被移除。

---

## 翻譯範圍

### 已翻譯區域

| 區域 | 說明 |
|------|------|
| 主介面文字 | 側邊欄、頂部導覽、一般按鈕與標籤 |
| 設定頁 | 完整設定面板、權限控制、子選單 |
| Agent / Workspace | Agent 管理頁面、工作區頁面 |
| MCP / Knowledge | MCP 伺服器與知識庫管理頁面 |
| 系統選單 | 標題列選單（檔案、編輯、檢視、視窗、說明） |
| 工作列 / 選單文字 | 工作列右鍵選單、Agent 狀態顯示 |
| 啟動畫面文字 | 載入動畫文字 |
| 鍵盤快捷鍵頁 | 快捷鍵描述與分類 |

> 目前共 **813 筆翻譯詞彙**。

### 不翻譯區域

以下區域會自動避開翻譯，以確保使用體驗不受影響：

- 程式碼區（Monaco Editor）
- 終端機（Terminal）
- 輸入框（`<input>`、`<textarea>`、`contenteditable`）
- `<code>`、`<pre>` 區塊
- SVG / Canvas 圖形元素
- Debug Console
- Suggest Widget（自動完成選單）

---

## 常見問題

<details>
<summary><strong>為什麼需要 npm install？</strong></summary>

本套件使用 `@electron/asar` 進行 ASAR 解包與重新打包。`npm install` 會將此工具安裝到本地 `node_modules/` 目錄，使安裝腳本能夠正常運作。只需在首次使用時執行一次。
</details>

<details>
<summary><strong>沒有 Node.js 可以用嗎？</strong></summary>

目前不行。本地化引擎以 Node.js 撰寫，需要 Node.js 執行 ASAR 解包、注入與重新打包。請前往 [nodejs.org](https://nodejs.org/) 安裝 LTS 版本。
</details>

<details>
<summary><strong>npx is not recognized 怎麼辦？</strong></summary>

本套件已改用本地 `@electron/asar`，不再依賴 `npx`。請確認已先切換到本套件的資料夾，也就是可以看到 `package.json` 的那一層目錄，並執行 `npm install`，即可正常運作。
</details>

<details>
<summary><strong>node.exe 存取被拒怎麼辦？</strong></summary>

此問題通常出現在 Windows，代表系統 PATH 上的 `node.exe` 指向異常位置。請移除現有 Node.js，從 [nodejs.org](https://nodejs.org/) 重新下載 LTS 版本安裝，然後重新開啟終端機確認。
</details>

<details>
<summary><strong>Antigravity 更新後翻譯不見了怎麼辦？</strong></summary>

Antigravity 官方更新時，會重新覆蓋 `app.asar` 檔案，導致先前注入的繁體中文本地化內容被移除。這是正常現象，並非套件故障。

解決方式：

1. 完全退出 Antigravity
2. 重新執行安裝腳本（Windows：`install-win.bat`；macOS：`install-macos.command`）
3. 重新啟動 Antigravity，即可恢復繁體中文介面
</details>

<details>
<summary><strong>如何還原官方原版？</strong></summary>

Windows 執行 `restore-win.bat`、macOS 執行 `restore-macos.command`，或使用 `node localization_engine.js --restore`。還原時會使用 `app.asar.bak` 回復官方原版。
</details>

<details>
<summary><strong>是否會修改官方 app.asar？</strong></summary>

是的，安裝過程會解包 `app.asar`、注入翻譯程式碼後重新打包。但首次安裝時會自動建立 `app.asar.bak` 備份，可隨時還原為官方原版。
</details>

<details>
<summary><strong>是否會散布官方 app.asar？</strong></summary>

不會。本專案不包含、不散布 Antigravity 官方 `app.asar` 或任何官方二進位檔案。所有操作均在使用者的電腦執行。
</details>

<details>
<summary><strong>為什麼 PROJECT_ID / SIGNATURE 還是 zh-hant-tw？</strong></summary>

`PROJECT_ID`（`antigravity2-zh-hant-tw`）與 `SIGNATURE`（`ZH-HANT-TW`）作為內部技術識別碼，用於套件名稱與注入區塊的清理邏輯。若變更這些識別碼，會導致舊版注入區塊無法被正確清理。因此保留原有識別碼以維持向下相容。
</details>

---

## 注意事項

1. **請先退出 Antigravity 再操作**：執行安裝或還原腳本前，請確認已完全退出 Antigravity，避免檔案被占用。
2. **Antigravity 更新後需重新套用**：官方更新會覆蓋 `app.asar`，更新後請重新執行安裝腳本。
3. **macOS Gatekeeper**：首次執行 `.command` 檔案時，若系統提示「無法驗證開發者」，請在 Finder 中對檔案按右鍵 → 開啟。
4. **Windows 權限**：若出現「存取被拒」，請對 `.bat` 檔案按右鍵 → **以系統管理員身分執行**。
5. **不要以 sudo 執行**：本套件不會自動使用 `sudo`，也不建議以 root 身分執行腳本。

---

## 授權

自 v2.0.0 / v1.0.7 版本起，本專案採用 [Apache License 2.0 with Commons Clause](LICENSE) 授權，屬於 source-available／原始碼公開授權，並非 OSI 定義的 open source 授權。

你可以一般使用、研究、修改與分享本專案原始碼；但不得販售本軟體本身，或將本軟體主要功能包裝成付費商品或服務。

更早的既有發布版本仍依其發布時的 Apache License 2.0 授權，不因 v2.0.0 / v1.0.7 版本起的授權變更而追溯改變。

---

## 免責聲明

- 本專案為非官方社群工具，與 Antigravity 官方無關。
- 本專案**不包含、不散布** Antigravity 官方 `app.asar` 或任何官方二進位檔案。
- 使用者應自行承擔修改本機應用程式資源的風險。
- 所有注入操作均在使用者的電腦執行，並提供完整還原機制。
- 本專案自 v2.0.0 / v1.0.7 版本起依據 Apache License 2.0 with Commons Clause 以「現狀」（AS IS）提供，不附帶任何明示或暗示的保證；更早的既有發布版本仍依其發布時的 Apache License 2.0 授權。
