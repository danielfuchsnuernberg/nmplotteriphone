#!/bin/bash
# Release gate runner.
#
# WRITTEN IN v273, after a harness CRASHED and the sweep reported it as
# passing. The old one-liner did `case "$r" in *FAIL*)` on the last line
# of output - so a script that threw a ReferenceError and printed a node
# stack trace matched nothing and was counted as fine. focus.js was dead
# for a whole build that way.
#
# A harness that cannot run is not a harness that passed. This checks the
# exit code AND the output.

F="${1:-work.html}"
fails=0
crash=0

run () {
  local name="$1"; shift
  local out rc
  out=$("$@" 2>&1); rc=$?
  local last; last=$(printf '%s\n' "$out" | tail -1)
  if [ $rc -ne 0 ] && ! printf '%s' "$last" | grep -q 'FAIL'; then
    local why; why=$(printf '%s\n' "$out" | grep -m1 -E 'Error|error:' )
    [ -z "$why" ] && why=$(printf '%s\n' "$out" | head -1)
    printf '  CRASH  %-12s %s\n' "$name" "$why"
    crash=$((crash+1)); return
  fi
  case "$last" in
    *FAIL*) printf '  FAIL   %-12s %s\n' "$name" "$last"; fails=$((fails+1)) ;;
  esac
}

echo "=== core ==="
run checkorder node checkorder.js "$F"
run mirror     python3 mirror.py "$F"
run boot       node boot_test.js "$F"
run sheets     node sheets.js "$F"

echo "=== harnesses ==="
for s in railset more card appage fld sort fpl fplsize leg legs focus follow \
         mag chk proc verify153 fqcorr layers ptwin mine3 ats terrslide flight \
         gpx mbz ctl prof airspace addpoint conv tools times meas mark seq \
         tiles zoom rot tap; do
  run "$s" node "$s.js" "$F"
done

echo
echo "failures: $fails   crashes: $crash"
echo "expected: 3 failures (proc/ats/airspace, v262.html not in container), 0 crashes"
[ "$crash" -eq 0 ] && [ "$fails" -le 3 ]
