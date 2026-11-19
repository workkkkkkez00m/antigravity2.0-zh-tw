#!/usr/bin/env bash
# ========================================================
# Antigravity 2.0 繁體中文套件 - macOS 安裝工具
# ========================================================

# 切換到腳本所在目錄
cd "$(dirname "$0")" || exit 1

echo ""
echo "========================================================"
echo "  Antigravity 2.0 繁體中文套件"
echo "========================================================"
echo ""

# 前置檢查：Node.js
echo "[前置檢查] 檢查 Node.js 環境..."
if ! command -v node &> /dev/null; then
    echo ""
    echo "[錯誤] 找不到可用的 Node.js。"
    echo "  請前往 https://nodejs.org/ 安裝 LTS 版本，"
    echo "  並確認 node 已加入系統 PATH。"
    echo ""
    read -r -p "按下 Enter 鍵結束..."
    exit 1
fi

# 前置檢查：本地 @electron/asar CLI
if [ ! -f "./node_modules/@electron/asar/bin/asar.js" ]; then
    echo ""
    echo "[錯誤] 找不到本地 @electron/asar CLI。"
    echo "  請先在專案根目錄執行："
    echo "    npm install"
    echo "  完成後再重新執行本安裝腳本。"
    echo ""
    read -r -p "按下 Enter 鍵結束..."
    exit 1
fi

echo "[前置檢查] Node.js 與 asar CLI 均已就緒。"
echo ""

echo "[1/3] 請依畫面指示確認是否強制退出 Antigravity 並安裝。"
echo "[2/3] 準備套用繁體中文台灣用語本地化..."
node localization_engine.js "$@"
exit_code=$?
if [ "$exit_code" -eq 2 ]; then
    echo ""
    echo "[已取消] 本次安裝已結束。"
    echo ""
    read -r -p "按下 Enter 鍵結束..."
    exit "$exit_code"
fi
if [ "$exit_code" -ne 0 ]; then
    echo ""
    echo "[錯誤] 安裝失敗。"
    echo ""
    read -r -p "按下 Enter 鍵結束..."
    exit "$exit_code"
fi

echo ""
echo "[3/3] 套用完成！"
echo ""
echo "[注意] 請手動重新啟動 Antigravity 以生效。"
echo ""
read -r -p "按下 Enter 鍵結束..."
exit 0
