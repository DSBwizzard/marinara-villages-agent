# Pinned Engine public declarations

Declarations copied read-only from Marinara Engine 2.4.6, capability API 1.14. Upstream source: https://github.com/Pasta-Devs/Marinara-Engine. These retain upstream AGPL-3.0 licensing. Only the declaration dependency closure used by Villages is retained. Refresh deliberately and validate compatibility; ordinary builds never update these files.
# Exact source pin

These declarations were copied from Engine revision `974faebb683842f5a31be34cee65394d9a47c336`. `pin.json` records the upstream repository, license, API identity and individual file hashes. This type pin is distinct from the existing Decisions runtime compatibility pin. Refreshing either requires deliberate compatibility validation.

`privileged-access.json` retains only the Engine's public admin-access storage key and refusal hint. Its recorded source revision and file hash identify the read-only client source checked during migration. The remote-access regression compares Villages with this compatibility fixture. A full Engine application capture is unnecessary: the Villages build imports no borrowed Engine runtime helpers, and `sources/package-shared.ts` exposes public declarations only.

