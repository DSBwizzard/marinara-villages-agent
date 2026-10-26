# Villages

The opt-in [resident development prototype](../../docs/resident-development.md) tests elapsed-time intentions and independent moves into existing homes.

A text-first shared-life sim for Marinara Engine. A Village can be any shared place: a settlement, station, workplace, or other setting. Your linked Persona lives alongside characters from your library.

Villages requires Engine 2.5.0 or later, before 4.0.0. Install the package and restart Engine to open its tab in Home.

## Founding

Founding proceeds through Place, People, Map, Venues and Review. Write one Place description covering the location, world and current conditions, choose your Persona and up to three starting residents, then prepare the map and Venues. There is no required Starting Scenario or start-mode selector. An existing place need not be newly established or in disrepair.

Map artwork is required, through explicit generation or upload. The first map takes the Village's name. Map details describe the area shown, whether it is a building interior, a neighborhood or another kind of place. New generation requests a continuous overhead environment at 2560 × 1440 (16:9), with scenery extending to the edges and no baked-in interface or labels. Providers may return different dimensions. Uploads need at least 768 pixels on the shorter side and 1024 on the longer side, with proportions between 2:3 and 2:1.

Quick Start can suggest required Venues from the founding context. It preserves manual edits and existing placements. **Check suggestions** retrieves a saved result after a lost connection without another generation request. Invalid or incomplete suggestions preserve the draft and require deliberate retry.

Each Venue has a name, physical form, Exterior and an explicit layout. Residences can include Common and Private Space; the initial Community Venue has public Common Space and no owner or Private Space. Select a map photograph to edit the Venue and its Zones. On narrow screens the editor opens as a sheet. Edits, artwork and map placement save into the device-local draft; conflicts and save failures must be resolved before founding.

Older unfinished drafts combine their two authored description fields once, preserving writing, artwork and saved requests. Founded Villages retain their locked starting history separately. Place accepts up to 4,096 characters; required context that cannot fit a generation request fails before dispatch.

Preparation saves completed Venue details, private interiors, resident routines and initial Wish attempts separately. A quiet-day Wish result counts as complete. **Retry preparation** reuses valid saved results and completed tasks. Private interiors remain hidden until authorized entry.

## Joining the Village

Characters preserve their complete captured source cards, including authored histories, relationships, secrets and knowledge limits. Multiple Worlds allows shared or different origins. Founding offers an optional **Village world** label; each character has optional **Homeworld** and **Add starting note** fields. The player's **Your backstory** stays separate.

Selection and admission make no backstory-generation request. Later **Move in** uses the same optional character fields before sprite setup. Confirming setup admits the character; canceling leaves the roster unchanged. Original library cards remain untouched. Explicit card refresh preserves private admission context.

Current Village state governs present locations, possessions, access and later developments. Shared world labels do not establish acquaintance or disclose private knowledge. Selected lorebooks remain read-only context within their configured budget. Missing arrivals remain unspecified.

The admission format targets fresh worlds and drafts. Character Origins modes and generated historical adaptations are removed; older histories and drafts are not converted.

## Venues, Zones and access

A **Venue** is the place; **Zones** are its spaces. Exterior, Common Space, Private Space and additional public or staff spaces have stable identities and explicit connections. Every space needs a route to Entrance. Access policy does not determine acoustics.

Entry, discovery and authority to change a space are separate. Invitations identify their visitor and destination; entering or discovering a room does not grant editing or invitation authority. Resident and worker assignments, managers, hours, bans, construction and revocation govern new Scenes and persistent writes; an open Scene retains its captured access.

Private descriptions, contents, pictures and unseen attendance stay server-side until the player is entitled to see them. Private Zone views retain the last observed interior until another authorized visit. See [Venue and Zone rules](venue-zones.md) for access, controllers, layouts and renovations.

## Scenes

UI terminology distinguishes an **Action** (what a player or resident does or attempts), a **World change** (a confirmed persistent consequence), a **Scene change** (a change within the current Scene, including movement or attendance), and **Resident activity** (background social activity, routines and housing decisions). **Event** is reserved for a future product feature; technical event names and saved schemas keep their existing meanings.

A Scene continues within one Venue across Zone movement. At its start, Villages captures attendance, positions, activities, connections, physical conditions, permissions, authority, time and writing context. Background schedules, renovations, access changes, memories and relationships cannot rewrite that moment or expose unseen occupants. Witnessed developments within the Scene build on its captured context; a new Scene uses current village state.

Every Zone holds at most four villagers; the player does not use a villager slot. A Venue can hold more across separate Zones. Movement checks every destination, including offscreen Zones. A blocked group movement preserves positions. Forced relocation uses available permitted spaces, then home or another Venue's Exterior. A villager leaving the Venue leaves this Scene without loading the destination cast.

If an immediate request to move villagers between recorded Zones is mechanically unavailable, Villages preserves the entire input as an editable draft and shows a blue `i` chip: “The requested change in Zone occupancy could not be completed.” Neither the input nor the generated response enters the Scene or its memories, including other dialogue/actions in the same input. The notice clears when editing or sending again. This result does not reveal unseen occupants or explain the private constraint. Available movement still depends on the villagers’ choices; future plans remain plans. Already admitted saved requests retain their original interpretation contract.

The composer offers:

- **Say / Do** for speech and local actions in the current Zone.
- **Move** for permitted Zone travel within the same Scene, without a generated arrival reply.
- **Contact** for a directed knock, call or conversation toward an adjacent Zone.
- **Conclude** to end the Scene.

Invitations do not automatically move the player. Speech and physical sounds use captured connections and server-calculated witnesses. Ambient sounds without a character source remain local narration and create no offstage witnesses. Addressing one person does not isolate audible bystanders. Hearing a noise does not reveal private words, attendance or its unseen cause. Whispering does not bypass witness validation.

A resident continuing a doorway conversation may approach, stay inside or decline. Audible remote dialogue does not put its speaker into the physical cast. Physical handoffs still require the participants to share the relevant Zone.

Navigation retains an unfinished Scene, composer draft and reading position. Refresh restores it even after days away. Real time between replies does not pass within the roleplay: a morning conversation remains that morning conversation. The wider Village continues on real time. Conclude rejoins its current date, schedules and availability without inventing player activities during the gap; Scenes cannot advance the Village into the future.

Scenes remain open until **Conclude**, with no inactivity or age limit. Ordinary pacing is allowed; waiting between replies does not grant hours or days of completed activity. Unsupported time travel, large time skips and ongoing conditions the game cannot enforce are held before acceptance. New appointments resolve from the Scene's date and must still be possible when the player chooses them. An old Scene cannot overwrite a newer affected world fact or revive a corrected, retired or fulfilled Wish.

**HALT** holds the entire turn, including its generated reply, outside the fiction. A brief notice identifies the boundary and preserves the player's editable input. No part enters dialogue, memories or world effects. The player rewrites it; Villages does not substitute a dream, a failed attempt or an invented action. Accepted information belongs to the original encounter and is recorded when accepted. It can inform subsequent interactions without rewriting the intervening days. An ordinary refusal, attempt, historical report or unrelated world change does not by itself require HALT.

During development, **DEBUG Settings → Advance Village time** advances this instance by a custom elapsed duration across all Village mechanics, using normal absence catch-up. Enabled background work may use models. The saved advance survives restart; active Scenes keep their captured moment. This temporary control will be removed before active playtesters join. See [Village time](../../docs/village-clock-recovery.md).

## Writing and saved changes

Scenes use complete captured character cards and authored post-history instructions. Writing Settings control person, tense, rating and additional prose guidance; they cannot replace character identity, permissions or verified outcomes. Optional context is reduced before essential identity or Scene evidence; essential context that cannot fit stops the request.

Each new reply includes at most four complete villager profiles across local and offstage speakers together. An addressed reachable offstage villager takes priority. Other villagers remain physically present and retain their witnessed events without requiring another model call or invented reactions.

Memories, relationships, Wishes and Projects retain their own evidence and application records. Valid saved effects can recover independently after storage failures. Stars, hearts and Wish notices report committed visible changes; dismissal survives reload. Ending a current Scene does not buy a separate memory or relationship review.

Effects save per accepted exchange. For ordinary reversible properties, the most recently saved valid change wins the current Village, even when it comes from an older Scene. Ending the Scene never restores its snapshot or reapplies earlier changes. Resources, ownership, target existence and revision checks still protect consequential writes.

Memories retain meaningful experiences, information and open matters without expiry or automatic pruning. Each has explicit knowers and bounded exact source excerpts; mentioning someone does not teach them. Reports, observations, interpretations and committed events remain distinct. Recall searches the full eligible history locally within bounded prompts. Transcripts supply evidence rather than automatic knowledge.

The Memories page starts with the player and loads 50 entries at a time. Inspect can select another knower and reveal retained evidence without teaching anyone. Forget suppresses the chosen existing knower on that memory root; independent disclosures, permissions, gameplay state and historical transcripts remain. Correct replaces remembered wording for selected existing knowers and labels it as a player correction. Original evidence stays in Inspect; active Scenes retain their captured history. Corrections never teach new knowers or change gameplay mechanics. Wishes keep only goal/condition clarifications, proof and lifecycle authority; ordinary conversational details live in Memories. Pursuit and relationship summaries use saved player disclosures and never fill gaps from private current state.

History is held separately in Engine’s existing document store; the Village atomically publishes its committed reference with current gameplay state. Ordinary world activity does not load the growing history. Live presence renewals avoid repeated absence catch-up.

This coordinated cutover requires Village format 5 and Scene format 2. Earlier saves and Scenes are rejected without conversion or deletion of their stored bytes. Use an independent fresh world; preserve older worlds for their matching runtime.

New generation and consequential effects validate source identity, witnesses, revisions and authority. Rejected proposals do not become gameplay facts. The [generation lifecycle](../../docs/generation-pipeline.md), [Scene privacy](../../docs/scene-response-privacy.md) and [response recovery](../../docs/scene-response-recovery.md) describe the technical contracts.

## People and relationships

People opens the Villagers directory inside a shared notebook. Selecting a villager opens their profile; **Back to Villagers** retains search and reading position. Close returns to the originating map, menu or Scene.

Profiles show information the player has heard or discovered: attributed relationship statements, shared Wishes, known routines and authored history. Private feelings, intentions and unseen attendance stay out of the notebook. Inspect is a separate spoiler view with readable perspectives, reasons, exact evidence, active terms, revisions and recovery status.

Each resident owns a sparse, directional perspective: a connection label, private stance, expectations, concerns and significant experiences. Authored history, unilateral boundaries, mutual agreements and concrete commitments remain distinct. The player authors their own feelings. Serious choices can end a friendship or partnership; reconciliation is possible and never guaranteed. Time away creates no automatic relationship penalty. Friendship never grants access or reveals secrets.

Starting history is prepared once from the resident cards, player backstory and selected lore. Explicit spouse, sibling or friendship history is honored without inventing player consent. True contradictions ask for a targeted creator clarification. Refreshes and later admissions preserve played developments. This relationship contract requires an independent new Village; older saved worlds are rejected before normalization or recovery and remain untouched.

Personal Mailbox is available from exploration, Scenes and profiles. Exact outgoing text is saved before generation. System settles its meaning before delivery; a failed later reply leaves the original delivered and the reply pending. Local replay and reading use no model calls. Only delivered player-addressed messages appear as correspondence; opening them applies saved disclosures to native Memories. The existing System call also selects meaningful resident memories from correspondence. Bounded owner-only recall respects Forget and Correct; local processing failures retain Replay saved work controls after delivery. Invitations record explicit acceptance of immutable terms without inventing speech, travel or player feelings. When the resident explicitly offers access and controls invitations to that Zone, acceptance issues permission for one visit through the normal access ledger. General meeting proposals grant no access; bans, hours, accompaniment and later revocation still apply. Explicit accepted deadlines may pass offline; an unaccepted invitation creates no obligation.

Automatic resident activity can include a private resident encounter or a personal message. Off, Quiet, Balanced and Lively allow 0, 1, 3 and 6 attempts per local day, at least fifteen minutes apart while the game is visible, with no catch-up. Each attempt allows at most two principal requests and reserves its allowance before dispatch; failure, no action and unknown outcomes still count. When no encounter, Project or Wish opportunity fits, available residents take turns being considered for ordinary activity or personal contact. Weather alone does not start an automatic request. Unfinished social sources retain recovery controls instead of silently triggering a new attempt. Private encounters and mail produce no public feed prose.

Scene writing and meaning normally use Narration followed by one combined System interpretation. Exact source receipts retain separate captured-Scene and current-live after-values; delayed replies cannot erase newer live endings or terms. Explicit reinterpretation keeps the original words and refreshes settlement context. Model context and output are bounded; the implementation does not replace semantic judgment with score rules or keyword inference.

New residents receive a concise identity description during preparation. **Manage → Edit description** can edit or clear it. Later generation and card refresh preserve player edits; descriptions affect display only.

## Routines, Wishes and Projects

Villages constructs dated plans locally from each resident's routine. Optional Engine schedule influence supplies preferences; availability and actual Zone access still govern destinations. Schedules continue while a Scene retains its captured situation.

Wishes are private desired outcomes. Profiles reveal them through witnessed disclosures and discoveries, not friendship alone. Journals retain what the player has learned without invented percentages or hidden step boxes. Progress and fulfillment require the original outcome, applicable expressed conditions and authoritative evidence for physical changes. A Project, claim or suggestion alone does not prove fulfillment.

Ongoing Wishes have a daily generation allowance, at least 24 hours between attempts and at most two active Wishes per resident. Missed days do not create a generation backlog. A Wish eligible in an unfinished Scene remains eligible there until its final saved effects finish. This protects against expiry only: corrections, retirement, consent, resources and current conditions remain authoritative. The original deadline is retained, and ordinary expiry resumes after release. Expiry and retirement preserve what the player already learned.

Projects create new Venues or directly renovate their Classes, residence capacity and Zones. Planning records the intended physical result, location, willing resident lead and necessary agreements. Consent and volunteering can arrive in any order, including the same conversation. Gifts and objects are narrative and have no Project effects.

The Project portfolio uses a blueprint board with a Project index and freely selectable Overview, Design, Zones, People, Site and Progress tabs. A single Physical design field in Design also supplies Overview; Entrance appearance is authored independently. Design edits persist while switching Projects or tabs. Classes and willing leads use direct choices; Zones are edited one at a time. Save and Start remain separate actions. A design changed elsewhere requires reloading the current design before stale local edits can be submitted. Site placement can open the map while a Scene remains active; saving or cancelling returns to Projects without moving anyone or changing the Scene's captured moment, attendance or draft.

Only the player's **Start** begins work. It atomically checks the saved design revision, willing lead, agreements and capacity, then creates the worksite. Drafts reserve nothing. Two Projects may be active in any mix, with distinct leads and one per Venue/site. Paused work counts toward both limits.

Every Project takes **24 elapsed real hours**, including opening guidance. Visits, Scenes, ordinary routines and presence at the site do not advance or pause its clock. Actual lead withdrawal/departure or lost authority pauses work. Explicit **Resume** requires a willing lead and valid agreements for the committed design, preserving remaining time.

Completion automatically applies the committed result in one transaction. A genuine obstacle pauses the Project with an explanation and applies no partial design. No opening visit is required. Before Start, design changes renew only affected agreements. After Start, finish or cancel before changing scope. **Cancel** releases capacity and fences late completion or Scene effects. Captured Scenes and their transcripts remain available to conclude after an unfinished site is cancelled.

Renovations add, remove or repurpose Zones without Upgrade slots or operational Upgrade records. Classes, capacity and Zones are stored directly. A Venue supports at most six active non-Entrance Zones, including private, shared, indoor and outdoor spaces; two Classes; four residents; and four villagers per Zone. Changed spaces determine consent and temporary closures; untouched rooms remain usable. Renovation approval cannot move residents, assign jobs or alter access policy. Existing connection representation and validation remain unchanged.

Opening guidance is optional. After the gathering, founders are available individually at their own unrestricted Entrance. Hear proposals in any order and accept any heard proposal immediately. Acceptance creates a planning draft and grants neither consent nor a lead commitment. Ordinary Projects remain available throughout the introduction. Skipping guidance preserves accepted Projects under the same rules.

Refresh restores saved progress. Incomplete gathering or introduction writing stays retained for diagnosis; replacing it requires explicit retry. Private preparation and unseen attendance remain server-side. Provider-free checks establish mechanics and layout, not live-model writing quality.

## Map, artwork and sprites

One Village can have multiple named maps. **All maps** shows thumbnails for switching directly between them. Map opens the last viewed map. Places starts closed, opens only when requested, and searches only the displayed map. Browsing changes the view without moving anyone or changing an active Scene. The Scene's actions menu opens Map; **Return to Scene** restores its composer draft. Starting another Scene still requires concluding the current one.

Village Settings manages map names, artwork, framing and reviewed marker placements. Each additional map requires artwork and starts empty. A new Venue Project chooses its map when placing its site; creating or browsing a map never creates Venues. Village-wide Venue and resident limits remain shared. Maps have no required connections, exits or travel steps. Map deletion and moving existing Venues between maps are outside this pass. This implementation starts with fresh Village data and provides no conversion of earlier maps.

Map exploration fills the play area with pan, zoom, and labeled Venue markers. The searchable Places navigator is a collapsible desktop rail and a phone drawer. Venue names sit centered below their dots. Tapping or keyboard-selecting a map marker opens its Venue screen directly. Returning to the map retains the camera position. Places remains a separate searchable list. Selecting a destination from Places centers it without entering; **Visit** starts entry. Map, Places, People and More provide navigation on both layouts. People retains its shared notebook. Portrait is the supported phone design. Resizing retains search, drafts and reading position, and reduced motion skips notebook movement.

Scenery styles apply to future pictures. Zone artwork depicts that Zone from within its saved physical context and cannot establish gameplay facts. First authorized discovery of a private space permits one background picture attempt; failure does not automatically retry. Later regeneration is deliberate. See [Zone pictures](../../docs/zone-pictures.md).

Character sprites are independent artwork copies. Sprite setup shows a wrapping grid and a popup editor for expression, facing, inclusion, default and framing. Closing the editor restores focus and grid position. **Back** and **Add without sprites** remain available during import; completed copies survive cancellation and missing art resumes on reopening.

Choose a vision-capable chat connection for explicit sprite analysis. The browser remembers the choice. Image Captioning and System selections do not control it. Analysis sends temporary PNG copies capped at a 1024px longest edge without enlarging smaller sources, with up to two requests in flight and an 800-token allowance per image. Saved originals and framing remain unchanged. Each completed proposal is saved independently. Failure or cancellation stops new dispatches; an already dispatched sibling may also be billed, and a successful sibling survives failure. A successful run can suggest a neutral front-facing default; older results are not automatically reanalyzed.

**Use when** is a short Scene selection rule grounded in the visible expression. Ordinary standing postures need no matching narration; depicted actions, physical states and props must fit the existing Scene. Analysis does not infer occupations or invent situations from appearance. Existing descriptions remain available for review and editing. Scene attention chooses the view: front toward the player and side toward another resident. A default in the requested view takes priority over an expression available only in the other view.

Preparation marks indicate complete included metadata, not saved approval. **Add villager with sprites** or **Use sprites** accepts the reviewed set and included default. Back, framing saves and analysis preserve unapproved drafts. Excluded artwork remains available.

Signatures may be names, initials, symbols or doodles chosen from the saved character. **Generate signature** makes an explicit image request; browsing never does. Original art is retained, and a transparent derivative removes light paper, including white fills. White paint is intentionally treated as paper. Regeneration preserves the previous signature until success; saved paid responses can be reused after an upload or save failure.

## Background work and recovery

Time, construction, approved moves, expiry and schedule rollover advance locally. Recurring enrichment runs while Villages is visible and pauses before its next request after the player leaves. Finite work already requested by the player can finish while away. Returning does not replay resident planning for every missed day.

While visible, Villages renews its background-work lease every 30 seconds and uses that response as its shared refresh. Faster status reads run only for unfinished work in the relevant visible view. Settled Scenes, profiles, signatures and closed diagnostics have no dedicated refresh timer. Scene changes are scoped to their originating Scene; delayed results also trigger retrieval through the shared refresh. Returning retrieves saved results without repeating generation.

**Resident activity and Wishes → Off** pauses automatic social planning, routine suggestions, housing proposals and new Wishes. It does not stop time, schedules, construction, approved moves or existing Wish expiry.

Resident planning uses a bounded daily allowance, independent of physical changes and memory records. A quiet result is valid. Accepted encounters keep private, witnessed evidence; routine suggestions affect future choices, and housing proposals remain pending decisions.

Background work reports saved stages, progress and provider-reported usage; missing usage stays unavailable. Configuration or authentication failures pause shared connection admission. Timeouts, transport failures and invalid responses fail their task without automatic retry. Deliberate retries reuse valid saved results before requesting replacements.

A failed uncommitted Scene send preserves the editable draft. Unchanged submissions reuse saved work; edited sends can replace uncommitted failed generation. Committed effects and required authority work retain their recovery rules. **Replay saved work** applies saved output without buying interpretation; explicit interpretation or replacement may make a model request.

An interrupted request may already have been billed. Reads, polling, diagnostics and storage retries do not authorize another paid attempt. Engine's document store buffers disk persistence and exposes no package flush barrier, so a hard crash can lose a recently acknowledged claim or response. Package request identities are not a guarantee of crash-proof billing deduplication.

## Settings and compatibility

System and Narration connections serve their configured roles. Optional **Use Decisions** defaults Off and uses Engine's public capability when available; unsupported or unsuitable checks retain System handling. Server rules remain authoritative over actual effects. See [Decisions integration](../../docs/decisions-capability-integration.md).

**Send on Enter** defaults Off. Enter inserts a newline; enabling the setting sends with Enter, while Shift+Enter inserts a newline and IME composition does not send.

**DEBUG Settings → Verbose runtime logging** exposes prompts, replies and private conversation context in the server terminal. It defaults Off and is separate from destructive debug controls.

The former Events feed, prose generator and Force Village Update action are removed. Existing worlds retain their background pace, daily spending floor, memories, physical receipts and accepted social work. Old prose jobs retain private diagnostic evidence and cannot generate, apply or retry; unused scheduled-event records are no longer gameplay state.

Saved operations keep the contracts under which they were admitted. Prompt changes do not authorize reinterpreting settled history, regenerating purchased responses or replacing existing progress. Feature-specific compatibility limits above do not authorize future saved-data loss.

[Experimental spinoffs](../../docs/spinoffs.md) can open an Engine roleplay with one resident and return reviewed compatible memories. Their ownership, spending and recovery rules are separate from ordinary Scene navigation.

Build, test and release commands belong in [DEVELOPMENT.md](../../DEVELOPMENT.md). Code boundaries and saved-state constraints are described in [architecture and compatibility](../../docs/architecture-migration.md).

Village storage uses one current format (version 3). Missing world data starts fresh. Other formats are rejected without rewriting them; there is no Project or Upgrade migration or conversion. Prepare independent fresh Villages storage before installing/loading this package. The player starts the new Village; installation does not reset existing storage.
