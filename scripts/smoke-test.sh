#!/usr/bin/env bash
# Quick checks of a RUNNING site. No login needed.
#
#   bash scripts/smoke-test.sh [base-url]      (default http://localhost:3002)
#
# Pages load, the admin and its API are closed to visitors, the health check
# answers, uploads cannot be abused, and the security headers are present.
# Exits non-zero if anything fails, so CI can use it.
B="${1:-http://localhost:3002}"
T="$(mktemp -d)"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "ok    $1"; pass=$((pass+1)); else echo "FAIL  $1 (expected $2, got $3)"; fail=$((fail+1)); fi; }
code() { curl -s -o "$T/body" -m 30 -w "%{http_code}" "$@"; }

echo "pages"
for p in / /studio /services /services/architecture /past-projects /contact /team /testimonials /about /awards /blog /sitemap.xml /robots.txt /manifest.webmanifest /privacy /terms /favicon.ico /icon-192.png /apple-icon.png; do
  check "GET $p" 200 "$(code "$B$p")"
done
check "unknown page is a real 404" 404 "$(code "$B/no-such-page-xyz")"

echo "health"
check "GET /api/health" 200 "$(code "$B/api/health")"
check "health says ok" 1 "$(grep -c '"status":"ok"' "$T/body")"

echo "admin is closed to visitors"
check "/admin redirects to login" 307 "$(code "$B/admin")"
check "/admin/login is reachable" 200 "$(code "$B/admin/login")"
check "admin API: enquiries" 307 "$(code "$B/api/admin/enquiries")"
check "admin API: change password" 307 "$(code -X POST -H 'Content-Type: application/json' -d '{}' "$B/api/admin/password")"
check "admin API: a plan file" 307 "$(code "$B/api/admin/enquiry-files/aaaaaaaaaaaaaaaaaaaaaaaa.pdf")"
check "wrong login is refused" 401 "$(code -X POST -H 'Content-Type: application/json' -d '{"email":"nobody@example.com","password":"not-a-password"}' "$B/api/admin/login")"

echo "forms"
check "project form: bad email refused" 400 "$(code -X POST -F name=Smoke -F email=not-an-email -F phone=1 "$B/api/start-project")"
printf '<html><script>1</script></html>' > "$T/x.html"
check "project form: .html upload refused" 400 "$(code -X POST -F name=Smoke -F email=smoke@example.com -F phone=1 -F "planFile=@$T/x.html" "$B/api/start-project")"

echo "uploads"
for u in "/uploads/%2e%2e/package.json" "/uploads/..%2fpackage.json" "/uploads/x/.hidden" "/uploads/x/y.json"; do
  check "uploads path $u" 404 "$(code --path-as-is "$B$u")"
done

echo "headers and search"
H="$(curl -sI -m 30 "$B/")"
check "HSTS" 1 "$(echo "$H" | grep -ci '^strict-transport-security:')"
check "Content-Security-Policy" 1 "$(echo "$H" | grep -ci '^content-security-policy:')"
check "nosniff" 1 "$(echo "$H" | grep -ci '^x-content-type-options: nosniff')"
check "admin is noindex" 1 "$(curl -sI -m 30 "$B/admin/login" | grep -ci '^x-robots-tag: noindex')"
check "share image on /studio" 1 "$(curl -s -m 30 "$B/studio" | grep -c 'property="og:image"')"
check "robots.txt hides /admin" 1 "$(curl -s -m 30 "$B/robots.txt" | grep -ci 'disallow: /admin')"

echo
echo "passed $pass, failed $fail"
rm -rf "$T"
[ "$fail" -eq 0 ]
