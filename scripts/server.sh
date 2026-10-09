#!/usr/bin/env bash
# Keeps the production-style server (npm start: vite build + node src/index.js) running in the background.
#   ./scripts/server.sh start     build and start (does nothing if already running)
#   ./scripts/server.sh stop
#   ./scripts/server.sh restart   rebuild + restart (use after code changes)
#   ./scripts/server.sh status
#   ./scripts/server.sh logs      follow the log (Ctrl-C to leave; the server keeps running)
# Port: PORT env var (default 3000). Log: logs/server.log. PID: logs/server.pid
set -u
cd "$(dirname "$0")/.."
mkdir -p logs
PID_FILE=logs/server.pid
LOG_FILE=logs/server.log
PORT="${PORT:-3000}"

running() { [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; }

start() {
  if running; then echo "already running (pid $(cat "$PID_FILE")) on http://localhost:$PORT"; return 0; fi
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "port $PORT is already in use by another process:"; lsof -nP -iTCP:"$PORT" -sTCP:LISTEN | tail -n +2
    return 1
  fi
  echo "building..."
  npm run build-ui >>"$LOG_FILE" 2>&1 || { echo "build failed, see $LOG_FILE"; return 1; }
  # nohup + new session so it survives closing the terminal; restarts are manual.
  PORT="$PORT" nohup node -r dotenv/config src/index.js >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  disown 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 1
    if curl -s -o /dev/null "http://localhost:$PORT/api/hello"; then echo "started (pid $(cat "$PID_FILE")): http://localhost:$PORT"; return 0; fi
  done
  echo "started but not answering yet; check $LOG_FILE"; return 1
}

stop() {
  if running; then
    kill "$(cat "$PID_FILE")" && echo "stopped pid $(cat "$PID_FILE")"
  else
    echo "not running"
  fi
  rm -f "$PID_FILE"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; sleep 1; start ;;
  status) if running; then echo "running (pid $(cat "$PID_FILE")) on http://localhost:$PORT"; else echo "not running"; fi ;;
  logs) tail -n 50 -f "$LOG_FILE" ;;
  *) echo "usage: $0 {start|stop|restart|status|logs}"; exit 1 ;;
esac
