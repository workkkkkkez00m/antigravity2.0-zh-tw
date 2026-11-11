# Antigravity 2.0 繁體中文套件 — v2.0.6

> [返回 v1.0.13 傳統安裝流程說明](README.md)

## v2.0.6

v2.0.6 已將字典基準更新至 Antigravity 2.0 v2.31.0 介面。目前 6 個字典檔共 1,104 筆翻譯詞彙，較 v2.0.5 增加 46 筆；新增 Swarm 自動化專案提示、動態自動化名稱、語音與介面配置設定、MCP 工具說明等詞彙．翻譯引擎已擴充帶姓名的問候語翻譯，並改善跨文字節點的 Swarm 自動化專案提示、動態自動化名稱等翻譯．

請先留意兩件事：

- 電腦仍需先安裝 Node.js LTS。
- 若電腦已具備 Node.js / npm，即可使用安裝檔進行一鍵安裝，不需要手動執行 `npm install`。

> ⚠️ v2.0.6 的一鍵安裝是「免手動 `npm install`」，不是「免安裝 Node.js」。
> 安裝器不會內建 Node.js，也不會自動替使用者安裝 Node.js。

## v2 安裝器工具畫面

v2 安裝器提供 Windows / macOS 圖形化安裝與還原流程。使用者只要先安裝 Node.js LTS，即可透過安裝檔完成套用，不需要手動執行 `npm install`。下列為既有工具畫面；v2.0.6 安裝器的驗證狀態請見文末。

### Windows

| 安裝工具 | 還原工具 |
|----------|----------|
| ![Windows 安裝工具畫面](images/win-install.jpg) | ![Windows 還原工具畫面](images/win-restore.jpg) |

### macOS

| 安裝工具 | 還原工具 |
|----------|----------|
| ![macOS 安裝工具畫面](images/mac-install.jpg) | ![macOS 還原工具畫面](images/mac-restore.jpg) |

## 快速開始

### 1. 安裝前確認

請先確認電腦已有：

- 已安裝 Antigravity 2.0
- 已安裝 [Node.js LTS](https://nodejs.org/)
- Node.js 內建的 npm 可正常使用

如果不確定是否已安裝 Node.js，可開啟終端機或命令提示字元，輸入：

```bash
node -v
npm -v
```

兩個指令都有出現版本號，即可繼續安裝。

### 2. 完全退出 Antigravity

安裝前請先完全關閉 Antigravity，避免檔案正在使用中。

### 3. 執行安裝檔

依照你的系統執行對應安裝檔：

#### Windows

安裝：

```text
Antigravity-ZH-Hant-TW-v2.0.6-Windows-Install.exe
```

> ⚠️ **Windows SmartScreen 提醒**：目前 Windows 安裝檔尚未加入 Authenticode 程式碼簽章，因此 Windows 可能顯示 SmartScreen 警告。請只從本專案的 [GitHub Releases](../../releases) 下載安裝檔，不要使用來路不明的轉載檔案。

#### macOS

安裝：

```
Antigravity-ZH-Hant-TW-v2.0.6-macOS-Install.pkg
```

安裝完成後，重新開啟 Antigravity，即可看到繁體中文介面。

> 若安裝器提示找不到 Node.js 或 npm，請先安裝 Node.js LTS 後再重新執行安裝檔。

## 還原官方原版

如需恢復官方英文原版，請完全退出 Antigravity，然後執行對應的還原檔：

### Windows

```text
Antigravity-ZH-Hant-TW-v2.0.6-Windows-Restore.exe
```

### macOS

```
Antigravity-ZH-Hant-TW-v2.0.6-macOS-Restore.pkg
```

還原會使用安裝時建立的備份，將 Antigravity 回復為官方原版。

## 安全性特色

v2 安裝器沿用原有安全性設計：

- 不內建 Node.js，使用者需自行從官方網站安裝。
- 安裝檔只是將安裝流程自動化，所需套件仍會從官方來源下載，因此安裝時需要網路連線。
- 不散布 Antigravity 官方 `app.asar` 或任何官方檔案。
- 安裝與還原都在使用者電腦本機執行。
- 安裝時會保留備份，方便日後還原官方原版。
- 延續既有翻譯核心與安全檢查，並更新翻譯字典與版本資訊。

v2.0.6 的字典與版本資訊已更新，原有安裝流程與安全性說明仍適用。

## 授權

自 v2.0.0 / v1.0.7 版本起，本專案採用 [Apache License 2.0 with Commons Clause](LICENSE) 授權，屬於 source-available／原始碼公開授權，並非 OSI 定義的 open source 授權。

你可以一般使用、研究、修改與分享本專案原始碼；但不得販售本軟體本身，或將本軟體主要功能包裝成付費商品或服務。

## 發行狀態

v2.0.6 已完成翻譯字典與版本資訊更新。v1.0.13 傳統流程與 v2.0.6 安裝器均已於 Windows 與 macOS 完成安裝、還原及 UI 驗證。使用安裝器前，請確認 [GitHub Releases](../../releases) 的實際發行資產與說明。

若偏好傳統 zip / `npm install` / 腳本安裝流程，請參考 v1.0.13 README 的既有方式操作。
