# Playing Villages

Villages is a life sim about sharing a place with characters from your Marinara Engine library. Your Persona lives alongside them: you visit, talk, get to know each other, and work together on changes to your surroundings. The setting can be a settlement, a station, a workplace, or any other shared place you describe.

**This is an unreleased prototype.** This guide describes the current test build. Features and save compatibility can change between test builds.

[Setup](#installation-and-setup) · [Founding](#found-your-village) · [Scenes](#have-a-scene) · [Projects](#wishes-and-projects) · [REPAIR](#repair-your-world) · [Troubleshooting](#if-something-goes-wrong)

## Installation and setup

### Get access to a test build

There is no public Villages installer or listing in Engine's official **Download Agents** catalog yet. Arrange a test installation with the project maintainer and the person running your Marinara server. They need to install the agreed package on that server; downloading this repository's source ZIP does not install it.

Once the package is installed:

1. Restart Marinara Engine, or have the server operator restart it if you use a shared server.
2. Open **Home → Villages**. Villages has its own Home tab; you play there.
3. If the tab is missing, confirm that the package was installed on the server you are connected to and that the server restarted successfully.

The current package requires **Engine 2.5.0 or later, before 4.0.0**, plus its declared Engine capabilities. An incompatible package needs a compatible Engine build before it can be installed.

### Prepare your library and connections

Have a Persona and **one to three characters** ready in your Engine library. Your Persona represents you; the characters become the first residents. Villages keeps its own captured copies of their cards and does not rewrite your originals.

Create or check your model connections in Engine before founding. Choose them on the founding screen's **Setting** step:

| Connection | What it does                                                              |
| ---------- | ------------------------------------------------------------------------- |
| **System** | Prepares the world, residents and background work.                        |
| **GM**     | Writes new Scenes and proposes their gameplay updates.                    |
| **Images** | Generates artwork when requested. Choose **Disabled** to supply your own. |

Choose a specific language connection for **both System and GM** before continuing. You can use the same one for both. Later, change these choices in Villages' **General Settings**. Existing connection selections and model settings are preserved.

An image connection is optional if you upload your map. Founding requires an uploaded or generated map; the initial grid is a placeholder. Sprite setup makes no model requests.

**Requests may cost money.** Founding, Scene replies, artwork, and enabled resident activity use your configured providers. Model choice affects writing quality and reliability; a successful connection is not a guarantee that every response will be usable.

## Found your Village

The setup steps are **Setting → People → Venues and Map → Review**.

1. **Setting:** Name the Village, then name and describe its **Starting location**, such as a harbour between a river and cliffs. The Village is the shared community across its maps; Founding establishes its first location. This description supplies context rather than enforcing a travel boundary. Select lorebooks for world history and references. Use **World rules** for constraints and the single **Circumstances** box for village-wide starting conditions. The clock follows Engine’s timezone. **Art settings** selects one Engine preset or custom style for the map and Venue images, with map-specific details and exclusions. Changes save with the draft and apply to future generations; existing artwork stays intact.
2. **People:** Choose your Persona and one to three residents. Their cards and lorebooks supply backstory. Select a resident to open their appearance. Browse Engine folders or **Uncategorized**, then drag a sprite into **Front** or **Side**; selecting it and using the folder’s **+** also works. Assigned sprites dim in the library and cannot belong to both views. Only the default has a green check. **Use Portrait** shows the character’s Scene portrait and preserves sprite assignments. Changes save automatically; navigation waits for the confirmed revision.
3. **Venues and Map:** Each person has a separate Residence, alongside one public Community Venue. Founding supports up to four Residences and one Community Venue; additional places, mixed uses and shared homes come after Founding. The overview shows the starting Venues beside the Village map. Click an artwork-backed Venue card to open its large editor popout. **Venue name** and **Venue form** have matching, top-aligned fields. A simple Zone list selects the details and artwork shown beside it. **Edit layout** switches to the draggable connection graph with Add/Remove controls; **Finish layout** returns to the selected Zone. The selected Zone has an editable heading, **Zone description** for its physical features and condition, and purpose/access below. Artwork and its Generate/Upload controls stay together beside the details when space permits. Edits save automatically; **Done**, Escape or the close button returns to the overview without changing map positions. The editor and dimming stay within Villages, leaving Engine controls visible and usable. The editor fills the Villages pane on smaller screens and allows scrolling when needed. Non-Entrance Zones have a **Public / Restricted** switch; changing it preserves ownership and sleeping assignments. **Generate artwork** and **Upload image** apply to the selected Zone, including the Entrance. **Suggest** explicitly replaces the entire starting set with AI-written Residences and Community Venue, including Zone names, purposes, descriptions and connections. Existing older drafts stay intact until you confirm replacement. Pending attempts recover automatically without generating again; **Retry** appears only after a confirmed failure. Drag map points to position Venues. **Generate artwork** and **Upload image** supply the required map; the initial grid cannot be used to proceed to Review.
4. **Review:** Check playable destinations, conditions, household assignments, World rules and circumstances. Every founder needs exactly one home and an accessible sleeping destination. Every Venue needs connected Zones and descriptions, with Entrance plus at most six Zones. The Village opens at the Community Venue once local routines are usable; optional personal routines and Wishes continue preparing in the background.

Founding describes the start of play. Current Venue and Zone records describe physical conditions thereafter. Restoring part of an abandoned mall changes that same mall; it keeps its identity and any unrestored spaces. Historical descriptions and lorebooks cannot undo the restoration. Resolving a broader circumstance does not repair buildings, remove unrelated restrictions or change standing rules.

The playable world is a local community with at most **16 Venues**. Existing starting infrastructure is playable immediately, subject to its condition and access. Mentioning more farms or saying another mall exists does not add destinations. After Founding, new infrastructure and material alterations use supported actions or Projects. Visiting a place does not construct or restore it. Administrative **REPAIR** remains separate.

The designated Community Venue stays unowned and public after Founding: no bans, invitations, accompaniment requirements or opening hours. Its included Zones must have public access. To change its use or control, first use **Manage → Use as Community Venue** on another eligible place. This releases only your own control; another person's control, assigned residents or workers, bans and opening hours must be resolved first. The former Community Venue then follows ordinary Venue rules. This access guarantee does not change physical damage or routing.

Map uploads need at least **768 pixels on the shorter side** and **1024 on the longer side**, with proportions between **2:3 and 2:1**. Generation requests an overhead map at 2560 × 1440; providers may return other dimensions.

Setup drafts save on your device, so finish them in the same browser. If your connection drops or you leave Founding, returning retrieves the same saved suggestion attempt automatically. Cancelled browser waits do not indicate generation failure. A confirmed failed or interrupted attempt offers **Retry** for a new, explicitly requested generation. Background jobs such as Routines and initial Wishes retry one eligible empty or malformed answer automatically, preserving completed work. This can charge one additional model response. Further failures and interrupted requests can be retried under **REPAIR → Progress**.

Characters keep their authored histories, relationships, secrets, and limits on what they know. Sharing a homeworld does not automatically make them acquainted. Optional lorebooks provide reference context without being rewritten.

After founding, the residents gather at the Community Venue for an everyday moment. Respond in your own words or actions, continue the Scene, or conclude it when you are ready. Residents return to their routines, and Projects are available whenever you want them.

Selected lorebooks are read from Engine for new generation. Constant entries need no keyword, but still need room in the lore allowance. Current-message matches take priority, followed by recent shared dialogue, setting matches, and remaining Constants. Recent dialogue is bounded and must already be available to the request, visible to you, and heard by every represented resident. Lore retrieval does not grant character knowledge.

**Lore activity** is available beside Village Lorebooks, in Scene options and alongside artwork controls. Contextual links start with the relevant activity search; clearing it restores the complete history. The main map has no Lore activity bar. Filter by generation, search entries or books, then select an entry and a receiving request. The explanation shows Constant eligibility or the matched key, exact surrounding source text, matching mode, secondary-condition evidence and when that request's prompt was prepared. On phones, Entries and the explanation are separate views with a Back control. A red dot marks activity newer than the revision last opened on that device; arrivals while reading appear as New activity without moving your selection.

The latest 200 source lookups are retained privately in the package's document store and survive restart. Each receiving request is recorded only after its final Lore fitting, with retries reusing the same attribution. Different Villages retain separate histories within that shared bound. Summary polling contains only an opaque scope and revision; names are fetched when the inspector opens, and exact keys/context only for the selected explanation. Full entry bodies are not copied. Constant entries show request context when no key was needed. Older work without captured evidence cannot reconstruct it from today's Lorebooks. These records describe prepared prompt inclusion, not proof that a model used a fact. Lore remains reference data, separate from GM instructions, and image generation considers selected lore automatically.

Map and Zone artwork also receive the attached images and captions of entries retained in their final prompt, including image-only entries. Book covers are excluded. Engine accepts at most four reference images, including existing Zone pictures during edits. Requests stop before generation if references are unavailable, exceed that limit, or the chosen image connection or its fallback cannot accept them. Scene text requests use Lorebook text; the current Engine text API does not accept attached images.

Primary keys support case-sensitive and whole-word matching. Secondary conditions support any/all and their negations; an empty secondary list adds no condition. Higher entry order wins within a relevance tier, with stable IDs breaking ties. Authored regex keys are unsupported. Whole entries fit within the estimated token allowance and 24-entry limit; Scene writing can omit individual lower-priority entries when its full prompt needs space. A zero budget disables retrieval. Unavailable selected books stop the affected new generation with an explicit retry error; completed work remains retained. Existing worlds, generated places and routines are not regenerated by installation.

In **DEBUG Settings**, enabling **Verbose runtime logging** also enables **Lorebook inspection**. **Test selection** checks the saved books against your query without a model request. Reports distinguish lookup selection from final GM/System prompt inclusion and show why entries were omitted. Reports include private entry titles, stay in server memory for the latest ten inspections, and clear when logging is switched off or the runtime restarts. They never appear in ordinary Scene responses. Terminal logging can also contain private prompts and replies; keep it private.

## Find your way around

- **Map:** Pan, zoom, or select a labeled Venue marker to open its page.
- **Places:** Search the current map. Selecting a result centers the map; **Visit** starts entry into that place.
- **People:** Browse residents and open their profiles.
- **More:** Open the Village's other pages and settings.

A **Place** is a discovered or introduced location in the world. Visit it and move through its Zones for Scenes before it joins the village simulation. **Discover Places** supports explicit exploration, search and first-visit preparation. The optional Places map layer starts off; unplaced Places remain visitable. [Places and establishment](../../docs/places.md) explains discovery, supporting characters and promotion.

A **Venue** is an established village location, such as a home or café. A **Zone** is one of its spaces, such as the kitchen or bedroom. Each Venue has an Entrance plus up to six Zones. In Founding, choose **Edit layout** to arrange Zones and change connections. In a Venue's **Zones** page, drag the Zones to arrange them without overlap. Managers can choose their connections; drawing distance changes neither movement nor sound. Browse a Venue to see what is known about it, then choose **Visit** to enter.

In Places, Zone positions and connections remain a draft until you leave Zones or switch Venues. A valid layout starts saving in the background as you navigate away. Every Zone must have a path to Entrance; if the draft is disconnected, Keep editing returns to it and Discard and leave restores the entire saved layout. Temporary disconnections remain visible while editing. Selecting another Zone keeps the draft. A failed save retains the draft and displays its error when you return to Zones; leaving again retries saving. Refreshing or closing the browser discards edits that have not been saved.

Select a Zone to view its title and artwork. Click its title to rename it; Enter or leaving the title saves, and Escape cancels. Entrance keeps its fixed name. Artwork fits a reserved frame without resizing the editor. Modify Zone Connections toggles a passage when you select two tiles. End the active Scene before moving tiles or changing connections; viewing and selecting Zones remains available during a Scene. If a Scene starts while a draft is pending, returning to the Scene retains that draft for editing after it ends.

Each Zone, including the Entrance, keeps one account of **Long-term details**. Physical changes belong to Projects, evidenced gameplay, or **REPAIR**. Small unfinished physical work can remain in those details: shelves waiting for brackets are different from a promise to build shelves, which belongs in Memories. Completed work updates the same account while preserving unrelated details. There is no separate Features list or possession inventory.

A Zone can also retain one paragraph of **Short-term details**, such as cups left after tea. It fades after about a Village day. Unrelated new activity does not extend that window; deliberately maintaining the whole arrangement can renew it. Looking at a place or mentioning it does not refresh it. Ordinary temporary use requires valid access; enduring alterations also need evidenced authority over that Zone. Already scheduled resident encounters use the same rules without a new activity scheduler. A residence move changes who lives there and who controls access; it does not automatically rewrite the room or transport belongings.

Entering a private space requires permission. Knowing that a room exists, being friends with someone, or hearing a sound from it does not grant access or reveal its contents. An invitation permits entry; use **Move** when you want to go there. The [Venue and Zone reference](venue-zones.md) covers detailed access and sound rules.

On a phone, use portrait orientation. Places opens as a drawer, and Venue editing opens as a sheet.

## Have a Scene

Scenes use one GM response for dialogue and gameplay updates. This build requires fresh Scene format 4; retired formats are rejected without conversion. The GM still needs to follow the game rules, and code validates proposed changes before applying them; it no longer receives a mandatory second model review. Wishes, relationships and Memories still update during play, without a separate Scene-end request.

A Scene is an ongoing interaction within one Venue. It can continue as you move between that Venue's Zones.

| Control      | Use it to…                                                               |
| ------------ | ------------------------------------------------------------------------ |
| **Say / Do** | Speak or attempt an action in your current Zone.                         |
| **Move**     | Travel to a permitted Zone without requesting a generated arrival reply. |
| **Contact**  | Knock, call, or speak toward an adjacent Zone.                           |
| **Conclude** | End the Scene.                                                           |

For a first visit, try a greeting and a small action, then ask about the resident's day. Residents can agree, refuse, or suggest something else. A request or a future plan is not automatically a completed change.

People hear what reaches them through the connected spaces. Addressing one person does not make ordinary speech private. Hearing someone in another room does not mean they joined you, and exchanging an object still requires being together.

Each Zone has room for four villagers; your Persona does not use a villager slot. If a requested change in occupancy cannot be completed, Villages keeps your input as an editable draft and shows a notice. The whole turn stays outside the Scene, including any other dialogue in that input. It will not reveal a private reason such as unseen occupants.

If you see **HALT**, the proposed turn has not entered the story. Read the notice and rewrite your draft. Ordinary refusals can still happen within the story; HALT holds the entire turn for a boundary the game cannot safely resolve. If the generated reply introduces an unsupported outcome, Villages tries one replacement and checks it again. If that fails, your input stays saved for Retry. Character abilities remain part of their identity; their enacted consequences must fit what Villages can support.

### Take breaks without losing your progress

You can leave the page or refresh and return to your unfinished Scene, draft, and reading position. Scenes have no inactivity deadline.

Once a Scene and its saved effects are settled, its working record retires. Witnessed conversation remains available for bounded encounter recall, alongside relevant Project evidence and saved recovery work. A conversation Memory provides the existing Forget/Correct controls for that encounter.

New Scenes follow the Village's current time. Residents can leave for commitments and others can arrive while you stay in the Venue. Each exchange keeps the time, participants and witnesses admitted for that request; a scheduled departure waits for that exchange to settle. Accepted changes count as you play, before **Conclude**.

On returning, earlier replies remain saved and your draft stays unsent. A small World changes popup shows arrivals and departures with the Village time, outside the dialogue box; you can dismiss it or reopen its chip. The Scene shows who is here now without inventing anything your Persona did during the gap. New arrivals do not learn earlier conversations automatically. If the situation changes before Send, your message stays a draft while the Scene updates; review it before sending again. Time passing never purchases a generated greeting.

Saved and interrupted supported requests keep their admitted time, evidence, allowance and recovery controls.

## Get to know the residents

Profiles show what you have learned about a resident: relationships, shared Wishes, known routines, and discovered history. **Back to Villagers** keeps your directory reading position. **Inspect** reveals spoilers only when you deliberately open it; inspecting does not teach your Persona or the residents anything.

Each resident has their own perspective: their connection with you, expectations, concerns, and particular shared history. A boundary, a mutual agreement, and a concrete commitment mean different things. You author your Persona’s feelings. Serious choices can end a friendship or partnership; reconciliation is possible and never guaranteed. Time away creates no automatic penalty, and friendship grants neither access nor secrets.

Starting history honors the resident cards, your backstory, and selected lore, including explicit existing friendships and marriages. Only contradictory social facts that change a relationship, shared history, or who knows a fact ask for clarification; spelling and other background discrepancies do not block preparation. Founding waits for starting history before admitting a new Scene and offers **Inspect starting history** to clarify a conflict or explicitly retry failed history work. Optional routine and Wish work stays separate, and an already active Scene retains its saved history contract. Later Village relationship developments take precedence over conflicting cards or lore; editing a lorebook alone does not rewrite played history. Preparing this history does not invent your consent or give anyone unsupported knowledge.

**Mailbox** keeps personal correspondence as individual letters in Inbox and Sent. Opening one letter marks only that letter read. Sent letters remain in Sent; failure recovery is offered only when processing needs attention. Exact outgoing words are saved before generation. Reading and replaying saved processing make no model request. Each villager receives a randomly chosen letter style when they join. **Simple text** switches the letter body to a neutral font and is remembered on that browser or device; signatures stay visible. Missing characters fall back to a device font. Letters can influence relationships and memories, but do not grant access, create commitments, or perform actions. Failed processing retains recovery controls even when the original message was already delivered.

Residents follow routines, and their availability changes through the day. Founding admits the chosen characters; accepted sprite copies and your original library cards stay separate.

Moving into an occupied home requires your incoming resident and every current housemate to agree to the exact destination and sleeping space. Private rooms retain their individual control; shared rooms use household control. Resident moves take 24 Village hours after approval; your own move applies immediately once the required people agree. Changed membership or room availability holds a scheduled move for renewed review. Cancelling releases its reservation.

### Memories

Memories keep meaningful experiences, information, and open matters. Each belongs to the people who learned it. Mentioning a character does not give that character the information.

The People overview and Venues page show each person's currently assigned home and workplaces. These public assignments update when they change; Memory corrections and Forget do not change them. Private Zones, current presence and schedules remain separate.

The Memories page starts with your Persona and loads entries in batches. **Inspect** can show retained evidence and another person's memories. **Forget** suppresses a selected person's existing memory; **Correct** changes its wording for selected people who already know it. These actions do not change physical gameplay facts, teach new people, or rewrite admitted requests or earlier dialogue.

## Repair your world

Open **REPAIR** from the main menu. Choose **Memories**, **People**, **Places**, **World & history**, **Progress**, or **Backups & repairs**. **People** lists the villagers; choose someone to see their **Memories** or **Details**. Under **Details**, **letter style** previews and changes their font for existing and future letters. The style stays with that character if they leave and return. REPAIR is an administrative view: saved records, private memories, sources, history, and repair tools are available by default. Browsing does not teach your Persona or any villager anything.

Edit a record, then use **Review changes** to check **Before / After** and **Affected records** before saving. **Modify** edits a memory's text. **Forget** shows the saved memory as read-only text and lets you select who forgets it; **Review forgetting** shows the effect before saving. Switching back to Modify keeps your unfinished edit. Memory changes apply only to selected people who already know the detail; the review shows each person's current wording. A memory about someone does not give that person knowledge of it. **Add memory** shows the new text and who will remember it, with the source recorded as **Added by you**. Physical facts, access, character context, relationships and authoritative progress have separate editors. Historical Scene corrections are annotations. Saved-effect recovery replays retained work without requesting new model responses.

**Places → Zone** edits **Long-term details** and **Short-term details**, and can clear or deliberately renew the short-term details. Undo restores the earlier expiry rather than starting another day. Corrections do not invent actions, consent, or character knowledge.

**Repair history** keeps the changes and offers **Review undo** where a safe inverse is available. Undo refuses to overwrite later changes to affected records. Consequential repairs save a checkpoint automatically; you can also name a manual checkpoint. Checkpoints retain independent copies of saved world data. Restoration has its own review and saves the current world first. Current time, spending and replay protection remain current, so elapsed Projects may complete when play resumes.

Unapplied reviews keep at most ten current previews. Leaving a review discards its server preview while preserving your edit draft; if a preview is no longer available, review the edit again. Applying a review retires its preview through the same recovery journal as the saved changes. Repair history, Undo and checkpoints remain separate.

Opening REPAIR and applying ordinary corrections preserve your unfinished Scene, accepted history, and drafts. Whole-world restoration requires the current Scene and pending recovery work to be settled. A restored checkpoint can reopen its saved idle Scene under its original temporal contract; a draft from another Scene remains available to copy.

## Wishes and Projects

**Wishes** are concrete personal social desires. They can arise through conversation, correspondence, resident encounters and occasional private reflection. Residents can act on them, reconsider an approach, keep them quietly in the background, fulfill them or withdraw them. Invitations and plans establish arrangements; the desired interaction must actually happen. NPCs can satisfy Wishes without player involvement.

The Wishes notebook retains only what your Persona learned, with timestamps for its recorded entries. **Follow** controls Wish notices without changing what the resident wants. Inspect exposes private retained state separately. There are no hidden progress percentages, expiry rolls or active-Wish slot caps. Housing and other larger ambitions are deferred. See [Social Wishes](../../docs/wishes.md).

This build requires a fresh format-16 Village. Older worlds and setup records remain stored and are rejected without conversion.

**Projects** create new Venues or renovate existing ones. Use the Project board to review the design, Zones, people, site, and progress. You can keep up to six drafts while deciding which Projects to start. Saving a draft and starting work are separate steps:

1. Describe the physical result and choose the site or existing Venue.
2. Arrange the needed agreements and a willing resident lead.
3. Review the saved design, then press **Start** when you want work to begin.

Every Project takes **24 elapsed real hours**. Two can be active at once, with different leads and one per Venue or site. Paused Projects count toward those limits. Visiting a site or leaving the game does not speed up or pause its clock.

Starting a Project reserves **six hours of lead focus** before its completion deadline. This replaces ordinary work or discretionary activities while protecting essential duties, rest and accepted time reservations. Work uses substantial periods at the site's Entrance. If the time cannot fit, choose another willing lead or start later. The Project's Progress view shows its next work period; the Agenda determines availability and location from the same reservations.

Pause or cancellation releases the reserved periods. Resume arranges the remaining focus within the remaining Project time. These are planned work periods at minute resolution; the completion clock remains 24 elapsed hours. No separate work history or effort meter is kept.

If the lead withdraws or the necessary authority is lost, work pauses. **Resume** requires a willing lead and valid agreements and preserves the remaining time. Completion applies the agreed design automatically. To change the scope after work starts, finish or cancel first. Canceling an unfinished site leaves its captured Scenes available to conclude.

A Venue supports up to six non-Entrance Zones, two Classes, and four occupants, including the player. Renovation can change its building form and Entrance details as well as selected interior Zones. Building changes require the affected people's agreement and preserve unrelated interiors. Renovation does not automatically move residents, assign jobs, or grant access.

## Maps, artwork, and sprites

**World Configuration** manages map names, artwork, framing, and marker placements. The compact map selector switches between maps without moving anyone. **Map options → Move markers** lets you correct Venue positions directly; select a Venue and tap the map, or use the arrow keys on the map or a marker, then save. These corrections do not move residents. Map options also controls the Places layer. **Places → Discover Places** opens discovery. The envelope in Village navigation opens the Mailbox; its dot indicates delivered, unread mail addressed to the player. Additional maps need artwork and begin empty; creating a map does not create its Venues. Existing Venues cannot currently be moved between maps, and maps cannot be deleted.

Scene navigation can open the map; **Return to Scene** restores your draft. Conclude the current Scene before starting another.

Scenery styles apply to future pictures. During play, Places shows each Zone's Founding design or last observed appearance, including saved artwork before a first visit. Lasting changes wait for the player's next visit or settled action in that Zone; browsing never purchases artwork. **Dynamic Images** controls automatic updates, and **Prevent dynamic image updates for this Zone** preserves the current artwork. **Generate new**, failed-work **Retry**, **Upload reference** and **Remove** remain available before visiting, after leaving and during renovations. Manual generation uses the known appearance without newer unseen facts; it never records a visit or changes physical facts. Older worlds recover unvisited appearances from saved artwork descriptions; where no historical design survives, generation uses the public Zone name and known architecture until a visit supplies its appearance. **Upload reference** saves artistic guidance without replacing the backdrop or changing game facts. At the next eligible generation, the physical description controls the space and the reference can influence compatible style. **Remove** clears artwork and its reference. Founding and REPAIR remain explicit authoring tools.

Day/night imagery is standard, with one image reused for AI-known constant lighting. Existing description-writing requests make that decision without an extra classification call. Artwork uses stable daytime lighting independent of generation time, respecting established world rules; night is derived from that same base. Play follows Village time and timezone, including map tint; Founding stays daytime. There are no day/night or Refresh controls. Completed daytime artwork remains visible if night fails, and Retry resumes the failed stage. Each automatic image counts against six images per real hour; paired stages can run together, with five minutes between automatic updates of the same Zone. Undo/Restore preserves limits. Existing artwork is retained without bulk generation. Closed Scenes retain captured presentation. See [Zone pictures](../../docs/zone-pictures.md) for lifecycle and provider limits.

The map's artwork changes tint with Village time, leaving markers and controls readable. Morning begins at 05:00, daytime at 08:00, evening at 17:00 and night at 20:00 in the saved Village timezone, including daylight-saving changes. The server clock and saved development time advance govern presentation; the browser's local timezone does not. Active Scenes select their saved day/night background from the time admitted between exchanges, while concluded Scenes retain their captured presentation. Clock changes never request artwork.

Founding’s People pane saves each assignment, default and portrait choice automatically. Opening an old character setup does not adopt it into a new founding draft. Removing an assignment keeps its independent artwork copy available for reuse. Empty Sprite mode falls back to the portrait until artwork is assigned.

Sprite Manager’s **Import Engine sprites** lets you choose an Engine folder and import its artwork as **Front**, **Side**, or **Unassigned**. Names start from Engine labels. Review individual names, facing, default, and framing before choosing **Add villager with sprites** or **Use sprites**. Unassigned artwork stays available for later setup without appearing in Scenes; **Keep artwork** saves a wholly unassigned set. **Add without sprites** remains available. Closing the editor or saving framing does not approve the set.

Imports make independent copies and reuse existing copies by their original Engine filename. Reimporting preserves reviewed names, assignments, framing and the default. Large folders import in bounded batches; failed images stay listed for retry, and completed copies survive leaving setup. Matching unambiguous Front and Side names share an expression. An existing assignment is never silently replaced; rename or unassign a conflicting import before applying it. Later Engine renames and folder moves do not change imported artwork. Older Engines without the folder catalog retain flat full-body import.

Side-facing artwork must look right; Villages mirrors it to look left. Front-facing artwork addresses you. The GM selects expressions and attention while writing new Scenes. Code handles placement, variants, mirroring and animation without another request.

**Generate signature** makes an image request. The original is retained alongside a transparent version; light and white areas are treated as paper. Failed regeneration keeps the previous signature.

## Background activity and costs

Time, schedules, construction, approved moves, and expiry can advance without model requests. Recurring creative activity runs while Villages is visible and pauses before its next request after you leave. Work you already requested can finish while you are away.

Set **Pace → Off** to pause automatic resident and world reviews. Local time, construction, approved moves and established environmental expiry continue. Retained Wishes do not expire.

Quiet, Average, and Busy permit at most 2, 6, and 12 shared automatic reviews per Village-local day, at least 60, 30, and 15 minutes apart respectively. Midnight resets the allowance without shortening spacing. New resident encounters and world developments use one principal model request; retained older jobs can use two. One eligible automatic retry may buy another response. Quiet outcomes, failures and unknown outcomes count. Completed replies are reused; unknown outcomes require deliberate recovery. Accepted due arrangements have priority; other resident and world reviews alternate. Residents may initiate private encounters or personal mail.

**Consequence → Gentle / Moderate / Dramatic** controls introduced circumstances and event-driven escalation. Gentle is the default. It does not restrict ordinary character behavior or replace HALT. Lowering it preserves established facts and constrains uncommitted developments. Discover circumstances through ordinary visits, conversations, activities and memories; player assertions do not independently create external facts. Situations can remain quiet, develop or resolve without player involvement.

An eligible new Scene turn can introduce a local environmental development through its existing GM request. It shares the background allowance and cadence, uses the independently selected existing Zone, and yields to accepted arrangements. The captured Scene must still match the target circumstances. Quiet is valid. Consequences settle before display; a stale generated draft remains recoverable. Village-wide weather developments use the background timeline. Existing action evidence and authority rules remain.

World reviews have one existing prepared Zone as their physical target, with a separate timed Village-wide weather authority. Enduring changes remain in the Zone description. Temporary conditions can restrict ordinary use while preserving authorized inspection, corrective work and egress. Supported repairs update physical prose and the matching condition together. An ended condition does not repair damage or clear another restriction. Deterministic weather remains the baseline; an accepted timed override takes precedence only during its established interval. Each admitted exchange retains its captured circumstances; live Scenes refresh between exchanges. Material physical changes use the existing Zone artwork lifecycle and spending limits.

After an absence of at least one hour, Villages may use the remaining return-day allowance for up to six grounded resident or world opportunities. These share the ordinary allowance without waiting between opportunities. A batch considers at most the latest seven days, never a review for every missed day. Its allowance date and maximum stay fixed: reserved work can finish after midnight, but unstarted opportunities cannot use the next day's allowance. Existing saved batches retain their admitted recovery behavior. The host and internet need not be available during the absence; requests run after Villages returns. A compact welcome-back card shows progress and recovery controls. Preparation failures retry once automatically only when no saved request exists; eligible failed replies use the worker's single automatic retry. Retry can make additional model requests. Continue skips only work that can safely be abandoned, while committed effects must finish recovering. The Debug section includes spoiler-bearing accounts for the current and up to 20 previous catch-up periods (fewer if accounts are large), and the development time control. Accounts already overwritten before history was introduced cannot be recovered.

Background work shows progress, failures, and provider-reported usage where available. A quiet result can be valid; the game does not need to invent an event for every interval.

## If something goes wrong

| Problem                       | What to do                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Founding asks for connections | Select available language connections for both **System** and **GM**.                                         |
| A setup suggestion seems lost | Return to Founding; the saved attempt recovers automatically. Use **Retry** only after a confirmed failure.   |
| Preparation stops             | Fix any connection problem, then retry unfinished work under **REPAIR → Progress**. Completed tasks are kept. |
| A Scene send fails            | Keep or edit the retained draft. An unchanged submission can reuse saved work.                                |
| Saved output needs applying   | Use **Replay saved work** when offered. This applies saved output without buying another interpretation.      |
| A turn is held with HALT      | Read the notice and rewrite the preserved input. That turn has not become story history.                      |

Failures do not automatically purchase replacement responses. Explicit interpretation, replacement, or generation retries may make another model request. A timed-out or interrupted provider request may already have been billed. Saved results reduce repeated work but cannot guarantee that every response survives a hard server crash.

## Sprite variants and visual settings

**Visual Settings** contains **Random sprite variants**, **Card-flip sprite changes**, **Character chat colors**, **Dynamic Images** and scenery style, each with a short explanation. Toggles and style presets save immediately; custom style text saves after a short typing pause. Pending edits survive settings navigation, and failed saves retain the latest draft with Retry. The personalization default remains compatible with saved worlds but is no longer exposed here. Random variants and card flips default On; reduced-motion preferences still disable flip animation.

Use Engine's filename convention for approved sprites: happy_01.png and happy_blush.png share the happy choice. Full-body files use full_happy_01.png and full_happy_blush.png. At least two suffixed names form a group; an exact base image joins its group when present. Original filenames determine groups even when Sprite Setup supplies different display names. No separate variant assignments are needed. With random variants Off, expressions remain individual choices.

Each new expression cue chooses an approved variant for its facing and saves that concrete choice. Refresh, backward reading and dialogue pagination retain it. Random picks can repeat. Artwork creation and cleanup remain in Engine, which also handles downloads from Sprite Manager.

## Settings and saved worlds

In **General Settings**, choose your connections. **Writing Settings** control person, tense, rating, and prose guidance while preserving character identity and the game's rules.

**Send on Enter** defaults Off. Normally, Enter adds a newline. When enabled, Enter sends and Shift+Enter adds a newline.

Progress saves as you play, and refresh restores it. The current test build uses **Village format 16** and **Scene format 4**. Older worlds, setup records, Scenes and checkpoints require their matching runtime. Arrange independent fresh test storage before trying an incompatible build. Installation does not reset existing storage or delete an incompatible world.

Installed package files remain on the Marinara server, but model-driven play still needs a working connection to your configured provider. Before changing or removing a test installation, arrange a backup and confirm how to keep its world with the server operator. **Reset the village and start over** is a separate destructive action.
