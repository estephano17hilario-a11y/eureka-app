#!/usr/bin/env bash
# Despliega Eureka en el VPS propio (nginx sirve /var/www/eureka, API en Docker :3050).
#   npm run deploy:vps          -> frontend + API
#   npm run deploy:vps -- web   -> solo frontend
#   npm run deploy:vps -- api   -> solo API (server/server.js)
# Variable opcional: EUREKA_VPS=usuario@host (por defecto root@89.117.73.97)
set -euo pipefail

TARGET="${1:-all}"
HOST="${EUREKA_VPS:-root@89.117.73.97}"
OUT=".vps-build"

deploy_web() {
  echo "==> Compilando frontend"
  npx tsc --noEmit
  rm -rf "$OUT" && npx vite build --outDir "$OUT/dist" --emptyOutDir
  tar -czf "$OUT/dist.tgz" -C "$OUT/dist" .
  echo "==> Subiendo frontend a $HOST"
  scp "$OUT/dist.tgz" "$HOST:/root/eureka-dist.tgz"
  ssh "$HOST" 'set -e
    rm -rf /var/www/eureka.new && mkdir /var/www/eureka.new
    tar -xzf /root/eureka-dist.tgz -C /var/www/eureka.new
    chown -R www-data:www-data /var/www/eureka.new
    rm -rf /var/www/eureka.old
    [ -d /var/www/eureka ] && mv /var/www/eureka /var/www/eureka.old
    mv /var/www/eureka.new /var/www/eureka
    rm -rf /var/www/eureka.old /root/eureka-dist.tgz'
  rm -rf "$OUT"
}

deploy_api() {
  echo "==> Subiendo API a $HOST"
  scp server/server.js "$HOST:/opt/eureka/server.js"
  ssh "$HOST" 'docker restart eureka_api >/dev/null && sleep 3 && curl -fsS http://127.0.0.1:3050/health && echo'
}

case "$TARGET" in
  web) deploy_web ;;
  api) deploy_api ;;
  all) deploy_web; deploy_api ;;
  *) echo "Uso: $0 [web|api|all]" >&2; exit 1 ;;
esac
echo "==> Listo: https://eureka.89.117.73.97.sslip.io"
