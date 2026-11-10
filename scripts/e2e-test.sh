#!/usr/bin/env bash
# End-to-end checks against a running site that uses the Firebase EMULATORS.
# Covers what the smoke test cannot (it needs to sign in): sessions, roles,
# link checks, plan and image uploads, rate limits, Google sign-in and the admin team.
#
#   npm run emulators            (one terminal)
#   npm run dev                  (another, with the emulator variables set)
#   node --env-file-if-exists=.env.local scripts/e2e-setup.mjs
#   bash scripts/e2e-test.sh [base-url]
#
# Uses a different X-Real-IP per section so the rate limits do not interfere.
B="${1:-http://localhost:3002}"
EMU="${FIREBASE_STORAGE_EMULATOR_HOST:-127.0.0.1:9199}"
BUCKET="${FIREBASE_STORAGE_BUCKET:-demo-fquad.appspot.com}"
T="$(mktemp -d)"
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $1  ($3)"; pass=$((pass+1)); else echo "FAIL  $1  expected $2 got $3"; fail=$((fail+1)); fi; }
J='Content-Type: application/json'
RUN="$(date +%s)$RANDOM"   # a fresh set of addresses each run, so earlier runs do not count
ip() { echo "X-Real-IP: run$RUN-$1-$2"; }
code() { curl -s -o "$T/body" -w "%{http_code}" "$@"; }
get() { curl -s -o "$T/body" "$@"; }
login() { code -c "$1" -X POST -H "$J" -H "Origin: $B" -H "$(ip 0 $RANDOM)" -d "{\"email\":\"$2\",\"password\":\"$3\"}" "$B/api/admin/login"; }
field() { node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(process.argv[2].split(".").reduce((o,k)=>o?.[k],j)??"")' "$T/body" "$1"; }
# The emulator only answers storage listings for admin requests ("Bearer owner").
pending_list() { curl -s -H 'Authorization: Bearer owner' "http://$EMU/v0/b/$BUCKET/o?prefix=private%2Fpending%2F" | grep -o '"name"' | wc -l; }
stored() { curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer owner' "http://$EMU/v0/b/$BUCKET/o/$(printf %s "$1" | sed 's#/#%2F#g')"; }

SUPER=e2e-super@example.com; LIM=e2e-limited@example.com; PW='E2e-test-password-1!'; NEWPW='Rotated-e2e-password-77'

echo "--- sign in, then change the password: other sessions end, this one stays"
check "login A" 200 "$(login $T/a $SUPER $PW)"
check "login B" 200 "$(login $T/b $SUPER $PW)"
check "A works" 200 "$(code -b $T/a $B/api/admin/enquiries)"
check "B works" 200 "$(code -b $T/b $B/api/admin/enquiries)"
check "change password (A)" 200 "$(code -b $T/a -c $T/a -X POST -H "$J" -H "Origin: $B" -d "{\"currentPassword\":\"$PW\",\"newPassword\":\"$NEWPW\"}" $B/api/admin/password)"
check "A still signed in" 200 "$(code -b $T/a $B/api/admin/enquiries)"
check "B signed out (API)" 401 "$(code -b $T/b $B/api/admin/enquiries)"
check "B sent to login (page)" 307 "$(code -b $T/b $B/admin/enquiries)"
check "old password refused" 401 "$(login $T/x $SUPER $PW)"
check "new password accepted" 200 "$(login $T/c $SUPER $NEWPW)"
# put it back so the run can be repeated
code -b $T/c -X POST -H "$J" -H "Origin: $B" -d "{\"currentPassword\":\"$NEWPW\",\"newPassword\":\"$PW\"}" $B/api/admin/password >/dev/null
check "login again with the original" 200 "$(login $T/s $SUPER $PW)"

echo "--- roles"
check "ADMIN login" 200 "$(login $T/l $LIM $PW)"
check "ADMIN reads enquiries" 200 "$(code -b $T/l $B/api/admin/enquiries)"
check "ADMIN reads page content" 200 "$(code -b $T/l $B/api/admin/cms/home)"
check "ADMIN reads media" 200 "$(code -b $T/l $B/api/admin/media)"
check "ADMIN cannot list team" 403 "$(code -b $T/l $B/api/admin/team)"
check "ADMIN cannot read settings" 403 "$(code -b $T/l $B/api/admin/settings)"
check "ADMIN cannot add an award" 403 "$(code -b $T/l -X POST -H "$J" -d '{"year":2024,"title":"A","body":"B"}' $B/api/admin/awards)"
check "SUPERADMIN lists team" 200 "$(code -b $T/s $B/api/admin/team)"
check "SUPERADMIN reads settings" 200 "$(code -b $T/s $B/api/admin/settings)"
check "dashboard page" 200 "$(code -b $T/s $B/admin)"
check "CMS index page" 200 "$(code -b $T/s $B/admin/cms)"
check "media page" 200 "$(code -b $T/s $B/admin/media)"
check "cross-site admin call refused" 403 "$(code -b $T/s -H 'Origin: https://evil.example' $B/api/admin/enquiries)"

echo "--- links in the editors"
check "CMS: javascript: refused" 400 "$(code -b $T/s -X PATCH -H "$J" -d '{"section":"hero","data":{"primaryCtaHref":"javascript:alert(1)"}}' $B/api/admin/cms/home)"
check "CMS: /contact accepted" 200 "$(code -b $T/s -X PATCH -H "$J" -d '{"section":"hero","data":{"primaryCtaHref":"/contact"}}' $B/api/admin/cms/home)"
check "CMS: saved value is read back" /contact "$(code -b $T/s $B/api/admin/cms/home >/dev/null; field content.hero.primaryCtaHref)"
check "CMS: reset to default" 200 "$(code -b $T/s -X DELETE "$B/api/admin/cms/home?section=hero")"
check "team LinkedIn: javascript: refused" 400 "$(code -b $T/s -X POST -H "$J" -d '{"name":"A","role":"B","linkedIn":"javascript:alert(1)"}' $B/api/admin/team)"
check "settings Instagram: javascript: refused" 400 "$(code -b $T/s -X PATCH -H "$J" -d '{"instagramUrl":"javascript:alert(1)"}' $B/api/admin/settings)"

echo "--- records: team, awards, testimonials, journal, enquiries"
check "team: create" 201 "$(code -b $T/s -X POST -H "$J" -d '{"name":"Test Person","role":"Tester","featured":true}' $B/api/admin/team)"
tid="$(field member.id)"
check "team: second gets the next order" 1 "$(code -b $T/s -X POST -H "$J" -d '{"name":"Second","role":"Tester"}' $B/api/admin/team >/dev/null; field member.order)"
sid="$(field member.id)"
check "team: list has both" 1 "$(get -b $T/s $B/api/admin/team; node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.members.length>=2?1:0)' $T/body)"
check "team: update" Renamed "$(code -b $T/s -X PATCH -H "$J" -d '{"name":"Renamed"}' $B/api/admin/team/$tid >/dev/null; field member.name)"
check "team: update of a missing id" 404 "$(code -b $T/s -X PATCH -H "$J" -d '{"name":"X"}' $B/api/admin/team/doesnotexist)"
check "award: create" 201 "$(code -b $T/s -X POST -H "$J" -d '{"year":2024,"title":"Best","body":"Because"}' $B/api/admin/awards)"
aid="$(field award.id)"
check "award: list newest year first" 1 "$(code -b $T/s -X POST -H "$J" -d '{"year":2026,"title":"Later","body":"x"}' $B/api/admin/awards >/dev/null; get -b $T/s $B/api/admin/awards; node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.awards[0].year>=j.awards[j.awards.length-1].year?1:0)' $T/body)"
check "testimonial: create" 201 "$(code -b $T/s -X POST -H "$J" -d '{"clientName":"A Client","quote":"Lovely work","featured":true}' $B/api/admin/testimonials)"
check "journal: create (published)" 201 "$(code -b $T/s -X POST -H "$J" -d '{"title":"First Post","body":"Hello","published":true}' $B/api/admin/blog)"
slug="$(field post.slug)"
check "journal: public page" 200 "$(code $B/blog/$slug)"
check "journal: sitemap lists it" 1 "$(curl -s $B/sitemap.xml | grep -c "/blog/$slug")"
check "journal: duplicate title gets its own slug" 1 "$(code -b $T/s -X POST -H "$J" -d '{"title":"First Post","body":"Again","published":true}' $B/api/admin/blog >/dev/null; [ "$(field post.slug)" != "$slug" ] && echo 1 || echo 0)"
check "team page shows the member" 1 "$(curl -s $B/team | grep -c "Renamed")"
check "settings: save" 200 "$(code -b $T/s -X PATCH -H "$J" -d '{"phone":"+91 90000 00000","mapLat":17.4,"mapLng":78.4}' $B/api/admin/settings)"
check "settings: read back" "+91 90000 00000" "$(code -b $T/s $B/api/admin/settings >/dev/null; field settings.phone)"
check "settings: public contact page uses it" 1 "$(curl -s $B/contact | grep -c '90000 00000')"
check "settings: clear the phone" 200 "$(code -b $T/s -X PATCH -H "$J" -d '{"phone":""}' $B/api/admin/settings)"
check "team: delete" 200 "$(code -b $T/s -X DELETE $B/api/admin/team/$tid)"
code -b $T/s -X DELETE $B/api/admin/team/$sid >/dev/null
check "award: delete" 200 "$(code -b $T/s -X DELETE $B/api/admin/awards/$aid)"

echo "--- images: upload straight to storage, then make the sizes"
node -e '
const sharp=require("sharp");
sharp({create:{width:1400,height:900,channels:3,background:{r:120,g:90,b:60}}}).jpeg().toFile(process.argv[1]);' "$T/photo.jpg" && sleep 1
size=$(stat -c %s "$T/photo.jpg")
check "upload-url: anonymous refused" 307 "$(code -X POST -H "$J" -d '{"contentType":"image/jpeg","size":100}' $B/api/admin/media/upload-url)"
check "upload-url: video refused" 400 "$(code -b $T/s -X POST -H "$J" -d '{"contentType":"video/mp4","size":100}' $B/api/admin/media/upload-url)"
check "upload-url: odd type refused" 400 "$(code -b $T/s -X POST -H "$J" -d '{"contentType":"text/html","size":100}' $B/api/admin/media/upload-url)"
check "upload-url: too large refused" 413 "$(code -b $T/s -X POST -H "$J" -d '{"contentType":"image/jpeg","size":99999999}' $B/api/admin/media/upload-url)"
check "upload-url: ticket issued" 200 "$(code -b $T/s -X POST -H "$J" -d "{\"contentType\":\"image/jpeg\",\"size\":$size}" $B/api/admin/media/upload-url)"
mid="$(field uploadId)"; murl="$(field upload.url)"; mauth="$(field upload.headers.Authorization)"
check "finalize before the file arrived" 400 "$(code -b $T/s -X POST -H "$J" -d "{\"uploadId\":\"$mid\",\"filename\":\"photo.jpg\"}" $B/api/admin/media)"
check "send the file to storage" 200 "$(code -X POST -H 'Content-Type: image/jpeg' -H "Authorization: $mauth" --data-binary @$T/photo.jpg "$murl")"
check "finalize: bad id refused" 400 "$(code -b $T/s -X POST -H "$J" -d '{"uploadId":"../x","filename":"a.jpg"}' $B/api/admin/media)"
check "finalize: sizes made" 201 "$(code -b $T/s -X POST -H "$J" -d "{\"uploadId\":\"$mid\",\"filename\":\"photo.jpg\",\"alt\":\"A test photo\"}" $B/api/admin/media)"
check "finalize: four variants (three JPEG sizes and a WebP)" 4 "$(node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.media.variants.length)' $T/body)"
check "finalize: main path" "/uploads/$mid/full.jpg" "$(field media.path)"
for f in thumb.jpg medium.jpg full.jpg full.webp; do check "served: /uploads/$mid/$f" 200 "$(code $B/uploads/$mid/$f)"; done
check "served as jpeg" image/jpeg "$(curl -s -o /dev/null -w '%{content_type}' $B/uploads/$mid/thumb.jpg)"
check "served as webp" image/webp "$(curl -s -o /dev/null -w '%{content_type}' $B/uploads/$mid/full.webp)"
check "the upload area is cleaned up" 404 "$(stored incoming/$mid/original)"
check "the finished sizes are in storage" 200 "$(stored uploads/$mid/full.jpg)"
check "optimiser reads it" 200 "$(code "$B/_next/image?url=%2Fuploads%2F$mid%2Ffull.jpg&w=640&q=72")"
check "media list has it" 1 "$(get -b $T/s $B/api/admin/media; node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.media.some(m=>m.id===process.argv[2])?1:0)' $T/body $mid)"
check "alt text saved" "A test photo" "$(code -b $T/s -X PATCH -H "$J" -d '{"alt":"A test photo"}' $B/api/admin/media/$mid >/dev/null; field media.alt)"
check "a folder can be made" 201 "$(code -b $T/s -X POST -H "$J" -d '{"name":"E2E folder"}' $B/api/admin/media-folders)"
fid="$(field folder.id)"
check "move the photo into it" "$fid" "$(code -b $T/s -X PATCH -H "$J" -d "{\"folderId\":\"$fid\"}" $B/api/admin/media/$mid >/dev/null; field media.folderId)"
check "deleting the folder keeps the photo" 200 "$(code -b $T/s -X DELETE $B/api/admin/media-folders/$fid)"
check "photo lost its folder" "" "$(code -b $T/s $B/api/admin/media >/dev/null; node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.media.find(m=>m.id===process.argv[2])?.folderId??"")' $T/body $mid)"
echo "--- a picture in use cannot be deleted"
code -b $T/s -X POST -H "$J" -d "{\"name\":\"With Photo\",\"role\":\"Tester\",\"mediaId\":\"$mid\"}" $B/api/admin/team >/dev/null; pid="$(field member.id)"
check "team member shows the picture (four sizes)" 4 "$(node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.member.media.variants.length)' $T/body)"
check "delete refused while in use" 409 "$(code -b $T/s -X DELETE $B/api/admin/media/$mid)"
code -b $T/s -X DELETE $B/api/admin/team/$pid >/dev/null
check "delete once free" 200 "$(code -b $T/s -X DELETE $B/api/admin/media/$mid)"
check "its files are gone" 404 "$(code $B/uploads/$mid/full.jpg)"
check "delete of a missing picture" 404 "$(code -b $T/s -X DELETE $B/api/admin/media/$mid)"
check "ADMIN can upload too" 200 "$(code -b $T/l -X POST -H "$J" -d "{\"contentType\":\"image/png\",\"size\":10}" $B/api/admin/media/upload-url)"

echo "--- a plan attached to the Start a Project form"
printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$T/plan.pdf"
printf '<html><script>alert(1)</script></html>' > "$T/fake.pdf"
P="$(ip 2 1)"
check "ticket: .html name refused" 400 "$(code -H "$P" -X POST -H "$J" -d '{"filename":"evil.html","size":100}' $B/api/start-project/upload-url)"
check "ticket: over 30 MB refused" 400 "$(code -H "$P" -X POST -H "$J" -d '{"filename":"big.pdf","size":31457281}' $B/api/start-project/upload-url)"
check "ticket: cross-site refused" 403 "$(code -H "$P" -X POST -H "$J" -H 'Origin: https://evil.example' -d '{"filename":"a.pdf","size":10}' $B/api/start-project/upload-url)"
check "ticket: issued" 200 "$(code -H "$P" -X POST -H "$J" -d '{"filename":"plan.pdf","size":60}' $B/api/start-project/upload-url)"
pf="$(field fileId)"; purl="$(field upload.url)"; AUTH="Authorization: $(field upload.headers.Authorization)"
check "send the plan to storage" 200 "$(code -X POST -H 'Content-Type: application/octet-stream' -H "$AUTH" --data-binary @$T/plan.pdf "$purl")"
check "the plan waits in private/pending" 1 "$(pending_list)"
brief() { echo "{\"name\":\"E2E Visitor\",\"email\":\"visitor@example.com\",\"phone\":\"1\",\"projectType\":\"Villa\",$1}"; }
check "brief: bad email refused" 400 "$(code -H "$P" -X POST -H "$J" -d '{"name":"A","email":"nope","phone":"1"}' $B/api/start-project)"
check "brief: unsafe file id refused" 400 "$(code -H "$P" -X POST -H "$J" -d "$(brief '"planFileId":"../../x.pdf"')" $B/api/start-project)"
check "brief: file that never arrived" 400 "$(code -H "$P" -X POST -H "$J" -d "$(brief '"planFileId":"aaaaaaaaaaaaaaaaaaaaaaaa.pdf"')" $B/api/start-project)"
check "brief: with the plan accepted" 201 "$(code -H "$P" -X POST -H "$J" -d "$(brief "\"planFileId\":\"$pf\",\"planFileName\":\"Site plan.pdf\"")" $B/api/start-project)"
check "enquiry names the private download" 1 "$(get -b $T/s $B/api/admin/enquiries; grep -c "/api/admin/enquiry-files/$pf" $T/body)"
check "the visitor's file name is kept" 1 "$(grep -c 'Site plan.pdf' $T/body)"
check "plan no longer pending" 0 "$(pending_list)"
curl -s -D "$T/hdr" -o "$T/dl" -b $T/s "$B/api/admin/enquiry-files/$pf" -w '' >/dev/null
check "admin downloads the plan" 0 "$(cmp -s $T/plan.pdf $T/dl; echo $?)"
check "...as an attachment" 1 "$(grep -ci 'content-disposition: attachment' $T/hdr)"
check "...never inline" 1 "$(grep -ci 'content-type: application/octet-stream' $T/hdr)"
check "anonymous cannot download it" 307 "$(code $B/api/admin/enquiry-files/$pf)"
check "no public address for plans" 404 "$(code $B/uploads/$pf)"
check "no way into private/ through /uploads" 404 "$(code --path-as-is "$B/uploads/..%2fprivate%2fplans%2f$pf")"
check "ADMIN role can read the plan" 200 "$(code -b $T/l $B/api/admin/enquiry-files/$pf)"
P2="$(ip 2 2)"
code -H "$P2" -X POST -H "$J" -d '{"filename":"fake.pdf","size":50}' $B/api/start-project/upload-url >/dev/null; ff="$(field fileId)"; furl="$(field upload.url)"; AUTH2="Authorization: $(field upload.headers.Authorization)"
code -X POST -H 'Content-Type: application/octet-stream' -H "$AUTH2" --data-binary @$T/fake.pdf "$furl" >/dev/null
check "the disguised file waits in private/pending" 1 "$(pending_list)"
check "html disguised as .pdf refused" 400 "$(code -H "$P2" -X POST -H "$J" -d "$(brief "\"planFileId\":\"$ff\"")" $B/api/start-project)"
check "...and removed from storage" 0 "$(pending_list)"
count_visitors() { get -b $T/s $B/api/admin/enquiries; grep -o 'visitor@example.com' $T/body | wc -l; }
before="$(count_visitors)"
check "honeypot: bot told it worked" 201 "$(code -H "$(ip 2 3)" -X POST -H "$J" -d "$(brief '"fq_hp_url":"spam"')" $B/api/start-project)"
check "honeypot: nothing saved" "$before" "$(count_visitors)"
check "contact form" 200 "$(code -H "$(ip 2 4)" -X POST -H "$J" -d '{"name":"A","email":"a@b.co","phone":"1","message":"hi"}' $B/api/contact)"
check "contact: non-text message refused" 400 "$(code -H "$(ip 2 4)" -X POST -H "$J" -d '{"name":"A","email":"a@b.co","phone":"1","message":{"x":1}}' $B/api/contact)"
check "enquiry status" CONTACTED "$(get -b $T/s $B/api/admin/enquiries; eid=$(node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(j.enquiries[0].id)' $T/body); get -b $T/s -X PATCH -H "$J" -d '{"status":"CONTACTED"}' $B/api/admin/enquiries/$eid; field enquiry.status)"

echo "--- rate limits (kept in Firestore)"
R="$(ip 3 1)"; last=""
for i in 1 2 3 4 5 6 7; do last="$(code -H "$R" -X POST -H "$J" -d '{"name":"A","email":"a@b.co","phone":"1","message":"hi"}' $B/api/contact)"; done
check "forms: the 6th in 10 minutes is refused" 429 "$last"
check "plan uploads: limited too" 429 "$(for i in 1 2 3 4 5 6 7 8 9 10 11 12; do code -H "$(ip 3 2)" -X POST -H "$J" -d '{"filename":"a.pdf","size":10}' $B/api/start-project/upload-url; echo; done | tail -2 | head -1)"
for i in 1 2 3 4 5; do code -H "$(ip 3 3)" -X POST -H "$J" -d '{"email":"victim@example.com","password":"wrong-guess"}' $B/api/admin/login >/dev/null; done
check "login: 6th wrong guess blocked" 429 "$(code -H "$(ip 3 4)" -X POST -H "$J" -d '{"email":"victim@example.com","password":"wrong-guess"}' $B/api/admin/login)"
check "login: the right password still works from elsewhere" 200 "$(login $T/z $SUPER $PW)"

echo "--- Google sign-in and the admin team (Auth emulator)"
AUTH="${FIREBASE_AUTH_EMULATOR_HOST:-127.0.0.1:9099}"
jsonfield() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s)[process.argv[1]]||"")}catch{console.log("")}})' "$1"; }
# An ID token from the Auth emulator for a sign-in with Google (the emulator accepts an unsigned Google token).
google_token() {
  local jwt
  jwt="$(node -e 'const b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");const e=process.argv[1];console.log(b({alg:"none",typ:"JWT"})+"."+b({iss:"https://accounts.google.com",aud:"fake",sub:"g-"+e,email:e,email_verified:process.argv[2]==="true",name:"Test "+e.split("@")[0]})+".")' "$1" "$2")"
  curl -s -X POST -H "$J" -d "{\"postBody\":\"id_token=$jwt&providerId=google.com\",\"requestUri\":\"http://localhost\",\"returnIdpCredential\":true,\"returnSecureToken\":true}" "http://$AUTH/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=fake" | jsonfield idToken
}
# An ID token for an ordinary email-and-password Firebase account, which must not be accepted.
password_token() {
  curl -s -X POST -H "$J" -d "{\"email\":\"$1\",\"password\":\"Passw0rd-test-1\",\"returnSecureToken\":true}" "http://$AUTH/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake" | jsonfield idToken
}
gsignin() { code -c "$1" -X POST -H "$J" -H "Origin: $B" -H "$(ip 4 $3)" -d "{\"idToken\":\"$2\"}" "$B/api/admin/login/google"; }
userfield() { node -e 'const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const u=j.users.find(u=>u.email===process.argv[2]);console.log(u?(u[process.argv[3]]??""):"")' "$T/body" "$1" "$2"; }

MATE="e2e-mate-$RUN@example.com"; STRANGER="e2e-stranger-$RUN@example.com"; UNV="e2e-unverified-$RUN@example.com"; PWACCT="e2e-pw-$RUN@example.com"
tk="$(google_token $STRANGER true)"
check "the Auth emulator issued a Google token" 1 "$([ ${#tk} -gt 100 ] && echo 1 || echo 0)"
check "Google: an address that is not on the list is refused" 403 "$(gsignin $T/g1 "$tk" 1)"
check "...and no session was created" 307 "$(code -b $T/g1 $B/api/admin/enquiries)"
check "Google: a made-up token is refused" 401 "$(gsignin $T/g2 "$(printf 'x%.0s' $(seq 1 200))" 2)"
check "Google: a missing token is refused" 400 "$(code -X POST -H "$J" -H "Origin: $B" -d '{}' $B/api/admin/login/google)"
check "Google: a cross-site call is refused" 403 "$(code -X POST -H "$J" -H 'Origin: https://evil.example' -d "{\"idToken\":\"$tk\"}" $B/api/admin/login/google)"
pt="$(password_token $PWACCT)"
check "Google: an email-and-password Firebase account is refused" 401 "$(gsignin $T/g3 "$pt" 3)"

echo "--- admin team: who can sign in"
check "SUPERADMIN lists admin users" 200 "$(code -b $T/s $B/api/admin/users)"
check "...no password hash is ever shown" 0 "$(grep -c passwordHash $T/body || true)"
check "ADMIN cannot list admin users" 403 "$(code -b $T/l $B/api/admin/users)"
check "ADMIN cannot add an admin user" 403 "$(code -b $T/l -X POST -H "$J" -d "{\"email\":\"$MATE\"}" $B/api/admin/users)"
check "anonymous cannot list admin users" 307 "$(code $B/api/admin/users)"
check "add: not an email" 400 "$(code -b $T/s -X POST -H "$J" -d '{"email":"not-an-email"}' $B/api/admin/users)"
check "add: unknown role" 400 "$(code -b $T/s -X POST -H "$J" -d "{\"email\":\"$MATE\",\"role\":\"OWNER\"}" $B/api/admin/users)"
check "add: cross-site call refused" 403 "$(code -b $T/s -X POST -H "$J" -H 'Origin: https://evil.example' -d "{\"email\":\"$MATE\"}" $B/api/admin/users)"
check "add a teammate" 201 "$(code -b $T/s -X POST -H "$J" -d "{\"email\":\"$MATE\",\"name\":\"Mate\",\"role\":\"ADMIN\"}" $B/api/admin/users)"
mid="$(field user.id)"
check "...with no password" false "$(field user.hasPassword)"
check "add: the same email again" 409 "$(code -b $T/s -X POST -H "$J" -d "{\"email\":\"$MATE\"}" $B/api/admin/users)"
check "add: the same email in capitals" 409 "$(code -b $T/s -X POST -H "$J" -d "{\"email\":\"$(echo $MATE | tr a-z A-Z)\"}" $B/api/admin/users)"

mt="$(google_token $MATE true)"
check "Google: the teammate signs in" 200 "$(gsignin $T/m "$mt" 5)"
check "the teammate reads enquiries" 200 "$(code -b $T/m $B/api/admin/enquiries)"
check "the teammate (ADMIN) cannot list the website team" 403 "$(code -b $T/m $B/api/admin/team)"
check "the teammate cannot manage admin users" 403 "$(code -b $T/m $B/api/admin/users)"
check "no password sign-in for a Google-only account" 401 "$(login $T/x2 $MATE 'Passw0rd-test-1!')"
check "a Google-only account cannot set a password" 400 "$(code -b $T/m -X POST -H "$J" -H "Origin: $B" -d '{"currentPassword":"x","newPassword":"A-new-long-password-1"}' $B/api/admin/password)"
check "the Account page explains Google sign-in" 1 "$(get -b $T/m $B/admin/account; grep -c 'sign in with Google as' $T/body | sed 's/^[2-9]/1/')"
code -b $T/s $B/api/admin/users >/dev/null
check "the last sign-in is recorded" 1 "$([ -n "$(userfield $MATE lastLoginAt)" ] && echo 1 || echo 0)"
check "the name is kept" Mate "$(userfield $MATE name)"

echo "--- admin team: roles and removal"
check "promote to SUPERADMIN" 200 "$(code -b $T/s -X PATCH -H "$J" -d '{"role":"SUPERADMIN"}' $B/api/admin/users/$mid)"
check "...takes effect on their next request" 200 "$(code -b $T/m $B/api/admin/team)"
check "unknown role refused" 400 "$(code -b $T/s -X PATCH -H "$J" -d '{"role":"OWNER"}' $B/api/admin/users/$mid)"
check "empty change refused" 400 "$(code -b $T/s -X PATCH -H "$J" -d '{}' $B/api/admin/users/$mid)"
check "demote back to ADMIN" 200 "$(code -b $T/s -X PATCH -H "$J" -d '{"role":"ADMIN"}' $B/api/admin/users/$mid)"
check "...takes effect on their next request" 403 "$(code -b $T/m $B/api/admin/team)"
code -b $T/s $B/api/admin/users >/dev/null; sid="$(userfield $SUPER id)"
check "the only SUPERADMIN cannot be demoted" 400 "$(code -b $T/s -X PATCH -H "$J" -d '{"role":"ADMIN"}' $B/api/admin/users/$sid)"
check "you cannot remove your own access" 400 "$(code -b $T/s -X DELETE $B/api/admin/users/$sid)"
check "an unknown account is not found" 404 "$(code -b $T/s -X DELETE $B/api/admin/users/a_doesnotexist)"
check "ADMIN cannot remove anyone" 403 "$(code -b $T/l -X DELETE $B/api/admin/users/$mid)"
check "remove the teammate" 200 "$(code -b $T/s -X DELETE $B/api/admin/users/$mid)"
check "...their open session ends at once" 401 "$(code -b $T/m $B/api/admin/enquiries)"
check "...and Google no longer lets them in" 403 "$(gsignin $T/m2 "$(google_token $MATE true)" 6)"

code -b $T/s -X POST -H "$J" -d "{\"email\":\"$UNV\"}" $B/api/admin/users >/dev/null; uid="$(field user.id)"
check "Google: an unverified email is refused even when listed" 401 "$(gsignin $T/g4 "$(google_token $UNV false)" 7)"
code -b $T/s -X DELETE $B/api/admin/users/$uid >/dev/null

GR="$(ip 4 90)"; last=""
for i in $(seq 1 11); do last="$(code -X POST -H "$J" -H "Origin: $B" -H "$GR" -d "{\"idToken\":\"$(printf 'x%.0s' $(seq 1 200))\"}" $B/api/admin/login/google)"; done
check "Google: repeated failures from one address are blocked" 429 "$last"

check "Admin Team page" 200 "$(code -b $T/s $B/admin/users)"
if [ -n "${NEXT_PUBLIC_FIREBASE_API_KEY:-}" ]; then
  # The server hands the Google sign-in settings to the login page as it serves it (not at
  # build time), so they are in the page itself, and the project id was worked out
  # from the Firebase settings the site already has.
  get $B/admin/login
  check "the login page carries the Google sign-in settings" 1 "$(grep -c "$NEXT_PUBLIC_FIREBASE_API_KEY" $T/body | sed 's/^[2-9]/1/')"
  check "...and the project it belongs to" 1 "$(grep -c 'demo-fquad' $T/body | sed 's/^[2-9]/1/')"
  check "...and the Google button itself is in the page script" 1 "$(grep -o 'static/chunks/app/admin/login/page-[A-Za-z0-9_-]*.js' $T/body | sort -u | head -1 | xargs -I{} curl -s "$B/_next/{}" | grep -c 'CONTINUE WITH GOOGLE' | sed 's/^[2-9]/1/')"
fi

echo "--- health"
check "health" 200 "$(code $B/api/health)"

echo
echo "passed $pass, failed $fail"
rm -rf "$T"
[ "$fail" -eq 0 ]
