#!/usr/bin/env bash
# Backend-ийг энэ Mac дээр байнга ажиллуулна (macOS launchd):
#   компьютерт нэвтрэхэд автоматаар асна, терминал хаасан ч зогсохгүй, унавал өөрөө дахин асна.
#   Өгөгдлийн сан, нууц үг .env-ээс (DATABASE_URL г.м.), сайтыг 15 минут тутам дахин бүтээж шинэ мэдээ оруулна.
#
#   bash deploy/mac-service.sh install     бүтээгээд суулгаж асаана (порт 3000; өөр порт: PORT=3005 bash deploy/mac-service.sh install)
#   bash deploy/mac-service.sh restart     кодоо өөрчилсний дараа: дахин бүтээгээд асаана
#   bash deploy/mac-service.sh status      ажиллаж байгаа эсэх
#   bash deploy/mac-service.sh logs        лог (гарах: Ctrl + C)
#   bash deploy/mac-service.sh uninstall   зогсоож устгана
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
LABEL="mn.ulaanbaatar.backend"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/ulaanbaatar-mn.log"
DOMAIN="gui/$(id -u)"
NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo "✗ Node.js олдсонгүй (https://nodejs.org)"; exit 1; }

# Суулгасан үйлчилгээний порт (plist-ээс), эс бөгөөс PORT эсвэл 3000
current_port() { /usr/libexec/PlistBuddy -c 'Print :EnvironmentVariables:PORT' "$PLIST" 2>/dev/null || echo "${PORT:-3000}"; }

wait_up() {
  local port="$1"
  printf '  Асаж байна'
  for _ in $(seq 1 60); do
    if curl -fs -m 2 "http://127.0.0.1:$port/api/health" >/dev/null 2>&1; then echo ' ✓'; return 0; fi
    printf '.'; sleep 1
  done
  echo; echo "✗ 60 секундэд асаагүй. Лог: bash deploy/mac-service.sh logs"; return 1
}

show_urls() {
  local port="$1" ip
  ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
  echo "  → http://localhost:$port"
  [ -n "$ip" ] && echo "  → http://$ip:$port  (ижил сүлжээний бусад компьютерээс)"
  echo "  Өгөгдлийн сан: $(curl -fs -m 2 "http://127.0.0.1:$port/api/health" | sed -E 's/.*"db":"([a-z]+)".*/\1/')"
}

case "${1:-}" in
  install)
    PORT="${PORT:-3000}"
    [ -f .env ] || { echo "✗ .env алга. Эхлээд: bash deploy/connect-postgres.sh ..."; exit 1; }
    if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 && ! launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
      echo "✗ $PORT порт өөр программд ашиглагдаж байна. Өөр порт: PORT=3005 bash deploy/mac-service.sh install"; exit 1
    fi
    echo "→ Бүтээж байна (npm run build)..."
    npm run build --silent
    mkdir -p "$(dirname "$PLIST")" "$(dirname "$LOG")"
    cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>$NODE</string><string>$ROOT/dist/server/main.js</string></array>
  <key>WorkingDirectory</key><string>$ROOT</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key><string>production</string>
    <key>PORT</key><string>$PORT</string>
    <key>PATH</key><string>$(dirname "$NODE"):/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>10</integer>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST
    launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
    launchctl bootstrap "$DOMAIN" "$PLIST"
    echo "✓ Суулгалаа: компьютерт нэвтрэх бүрд автоматаар асна."
    wait_up "$PORT" && show_urls "$PORT"
    ;;
  restart)
    [ -f "$PLIST" ] || { echo "✗ Суулгаагүй байна: bash deploy/mac-service.sh install"; exit 1; }
    echo "→ Бүтээж байна (npm run build)..."
    npm run build --silent
    launchctl kickstart -k "$DOMAIN/$LABEL"
    wait_up "$(current_port)" && show_urls "$(current_port)"
    ;;
  status)
    if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
      echo "Үйлчилгээ: суусан ($(launchctl print "$DOMAIN/$LABEL" | awk -F'= ' '/^\tstate/ {print $2}'))"
      if curl -fs -m 2 "http://127.0.0.1:$(current_port)/api/health" >/dev/null; then echo "✓ Ажиллаж байна"; show_urls "$(current_port)"; else echo "✗ Хариу өгөхгүй байна. Лог: bash deploy/mac-service.sh logs"; fi
    else
      echo "Үйлчилгээ суугаагүй. Суулгах: bash deploy/mac-service.sh install"
    fi
    ;;
  logs)
    touch "$LOG"; tail -n 60 -f "$LOG"
    ;;
  uninstall)
    launchctl bootout "$DOMAIN/$LABEL" >/dev/null 2>&1 || true
    rm -f "$PLIST"
    echo "✓ Зогсоож устгалаа. (Лог: $LOG)"
    ;;
  *)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
