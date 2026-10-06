# Venues, Zones, and access

A **Venue** is a place. Its **Venue Type** identifies it (home, bakery, church); its **Physical form** describes its physical arrangement (converted cottage, shopfront, open-air camp). The saved property remains `form` for compatibility. Venue classes supply residential, work, or gathering capabilities; they do not decide a Zone's visitor policy.

A **Zone** is a dedicated part of that place, indoors or outdoors. Each Zone has a stable ID, a name, **Used for** (`purpose`), **Appearance** (`description`), current physical state, optional artwork, and a separate access policy. A living room, restroom, bedroom, foyer, and tent all need a use. “Shared” and “personal” describe residential assignment, not visitor access.

Every Venue has an **Entrance** (`exterior`). It is Unrestricted, all day, every day, including when the Venue has visitor hours or bans. It is the arrival/departure fallback. Other Zones use **Public** or **Permission required** access. Public visitors still obey hours, bans, and physical closures. Residential Zones default to Permission required. A personal Zone can be Public.

## Authority and admission

Venue managers manage Venue hours and Venue-wide bans. Zones inherit those managers unless they have an independent manager list. Zone managers manage that Zone's policy and can invite. Delegated inviters can issue invitations without managing policy. Members and assigned member roles are distinct from both managers and visitors. Employment, residence, friendship, and guest permission do not silently grant management authority.

Visitor hours can inherit the Venue's hours, be always open, or use weekly local-time windows (including overnight windows). Managers and members may enter outside visitor hours. An invitation can explicitly allow outside-hours entry. Bans override these forms of admission; only an exception naming the exact current ban IDs and invitation can bypass them. A Zone invitation cannot override a Venue ban by itself. An employee's friendship does not cancel a ban.

Invitations are either for one **Scene** or standing permission. A future visit is claimed by the first admitted Scene, after the Scene is saved. Movement within the same Venue keeps that Scene. Accompaniment requires the named escort to be physically present in the destination Zone in captured Scene positions. Optional regular-visitor rules use the inviter's directional friend/close relationship; they are never inferred from a visitor's opinion of the inviter.

Refusing entry or asking someone to leave applies to the current Scene. A ban persists. Revoking permission, removing authority, or ending the visit cannot be undone by replaying an old response. If every manager of a scope has left the Village, the player can recover an orphaned Venue; a current Venue manager can recover an orphaned Zone. Recovery changes managers while preserving rules and bans and cannot displace a valid independent manager.

## Destinations and physical continuity

One resident can own several Zones. Home activities, sleeping, and work have separate explicit destinations. A sole suitable Zone can be selected automatically; ambiguous choices need an explicit destination. An unavailable destination falls back to Entrance. Moving residence archives and vacates all that resident's old personal Zones. The designated sleeping Zone supplies bedroom adaptation, rather than whichever Zone happens to appear first.

Scene attendance, positions, and time are captured when the Scene begins. Routine changes do not teleport its participants. Evidenced movement updates those captured positions. Access changes can cause a recorded exit to the previous permitted Zone or Entrance, within the same Scene. A fresh authority check precedes revealing an unseen Zone or generating its first-entry artwork.

Artwork uses Venue Type, Physical form, the selected Zone's use and appearance, current physical state, shared scenery style, and enabled resident/lore context. Access edits do not invalidate artwork. Unvisited contents, images, nonlocal attendance, and other scopes' access ledgers stay server-only. Visible diagnostics explain outcomes without exposing hidden policies.

## Implementation and troubleshooting

- Shared `venue-access.ts` defines policy, command, and projection types. Server `venue-access.ts` validates commands and provides the central evaluator. Callers provide authoritative relationships, Scene positions/time, and physical availability; planned activities provide their planned arrival time.
- Access commands require current authority, an expected revision, and an operation ID. Successful commands bind that ID to the semantic command. Rejected witnessed events have terminal receipts so replay cannot apply obsolete speech; invalid or unauthorized direct requests fail before a receipt is created. Structural edits cannot replace saved access policies. Lifecycle authority changes advance the access revision and permanently revoke grants whose issuer lost authority.
- `village-store.ts` hydrates seed-scoped relationship authority for each mutation retry and removes it before persistence. Canonical routine IDs survive coercion without a relationship snapshot. Legacy saves without a canonical access ledger retain their existing adapter behavior and identifiers.
- `access-speech.ts` limits model proposals to current authorized speech and exact scopes. Grounded interpretation checks every changed field; saved evidence and current authority are checked again before committing. Model metadata alone is not permission.
- Scoped access views return admission reasons and management controls only for authorized scopes. Diagnose an unexpected result with its reason, policy revision, exact Zone ID, invitation receipt, hours, and captured escort positions. Avoid exposing raw ledger contents to the client.
- `tests/villages-venue-access.regression.ts` covers authority, hours, directional ties, invitations, bans/exceptions, replay, recovery, multi-Zone ownership, scheduled admission, hidden projections, and an interleaved revocation during movement. It uses a mock document host and makes no model requests.

The founding workspace layout and placement-speed redesign is a separate change. This revision establishes the Venue/Zone meanings, editing fields, and access behavior that it will use.
