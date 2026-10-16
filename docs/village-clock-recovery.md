# Village timezone and time away

The Engine computer's current date and time are authoritative. Villages does not try to detect clock manipulation, compare wall time with an elapsed timer, or pause gameplay for clock confirmation. Sleep, Docker suspension and any length of shutdown resume normally using the existing offline catch-up rules. Some optional work still requires the usual explicit provider permissions.

Founding prefills the timezone from the Engine host, lets the founder choose a named timezone, and saves that choice permanently. Existing worlds adopt the Engine host timezone once. The browser's timezone does not control the village. A named zone such as America/Los_Angeles uses its daylight-saving rules automatically: PST in winter and PDT in summer. Calendar appointments follow local civil time; duration waits use absolute timestamps, so a daylight-saving transition does not add or remove an hour of work.

Advancing the system clock can advance time-based gameplay. Moving it backward does not undo completed actions or refill daily opportunities: a saved latest-visited time prevents calendar replay until the date catches up. Unfinished deadlines remain absolute; moving the clock backward can lengthen their remaining waits. Negative remaining durations are treated as due by the existing lifecycle rules. No anti-cheat or independent real-time authority is claimed.

Old pending clock notices clear automatically without shifting deadlines or rewriting history. Previously accepted timer offsets remain for saved-data compatibility. Older open clients may still call the recovery endpoint; it observes the current clock and returns the snapshot without requiring confirmation.

The map resynchronizes from the server periodically and on focus/visibility changes. Desktop/mobile browser checks, controlled sleep/offline/clock-change cases and archive-identical HTTP acceptance use synthetic storage and zero provider calls. The user's system clock is never changed by tests.
