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

Create or check your model connections in Engine before founding. Choose them on the founding screen's **Place** step:

| Connection    | What it does                                                              |
| ------------- | ------------------------------------------------------------------------- |
| **System**    | Prepares residents and interprets proposed gameplay changes.              |
| **Narration** | Writes Scene dialogue and description.                                    |
| **Images**    | Generates artwork when requested. Choose **Disabled** to supply your own. |

Choose a specific language connection for **both System and Narration** before continuing. You can use the same one for both. Later, change these choices in Villages' **General Settings**.

An image connection is optional. You can start with a simple map or upload one if Images is disabled. Sprite analysis separately needs a vision-capable language connection, selected in its own editor.

**Requests may cost money.** Founding, Scene replies, artwork, and enabled resident activity use your configured providers. Model choice affects writing quality and reliability; a successful connection is not a guarantee that every response will be usable.

## Found your Village

The setup steps are **Place → People → Map → Venues → Review**.

1. **Place:** Name the Village and describe the location, world, and current situation. It can be an established place in good condition; you do not have to begin by rebuilding a ruin.
2. **People:** Choose your Persona and one to three residents. Write **Your backstory** for your own situation. Optional **Homeworld** and **Add starting note** fields explain each resident's connection to the setting. The **Village world** label can help distinguish shared and different origins.
3. **Map:** Use the simple starting map, upload artwork, or deliberately generate it. The first map uses the Village's name. For generated artwork, describe the area actually shown, whether it is a building interior or a neighborhood.
4. **Venues:** Select a Venue on the map or in the selector, then tap the map to move its marker; arrow keys make small adjustments. Pan and zoom as on the in-game Map. **Edit** opens its physical form, Zones and artwork. Added Zones start with blank Used for and Appearance fields and keep the current tab. **Quick Start** always asks before replacing the Venue drafts with fresh templates: Entrance, Common and Private Zones for each residence, tailored to its resident or your persona; Entrance and Common for the Community Venue, tailored to the Village. Those defaults impose no layout requirements afterward: every Venue needs only its Entrance and may have up to six additional Zones. Residents' private interiors stay hidden until authorized entry.
5. **Review:** Resolve the listed setup problems and found the Village. Preparation creates the needed interiors, resident routines, and initial Wish attempts. A resident having no initial Wish is a valid result.

Map uploads need at least **768 pixels on the shorter side** and **1024 on the longer side**, with proportions between **2:3 and 2:1**. Generation requests an overhead map at 2560 × 1440; providers may return other dimensions.

Setup drafts save on your device, so finish them in the same browser. If suggestions finish after your connection drops, use **Check suggestions** to retrieve them. **Retry preparation** keeps usable completed work rather than starting everything over.

Characters keep their authored histories, relationships, secrets, and limits on what they know. Sharing a homeworld does not automatically make them acquainted. Optional lorebooks provide reference context without being rewritten.

After founding, the residents gather at the Community Venue for an everyday moment. Respond in your own words or actions, continue the Scene, or conclude it when you are ready. Residents return to their routines, and Projects are available whenever you want them.

Selected lorebooks are read from Engine for new generation. Constant entries need no keyword, but still need room in the lore allowance. Current-message matches take priority, followed by recent shared dialogue, setting matches, and remaining Constants. Recent dialogue is bounded and must already be available to the request, visible to you, and heard by every represented resident. Lore retrieval does not grant character knowledge.

Primary keys support case-sensitive and whole-word matching. Secondary conditions support any/all and their negations; an empty secondary list adds no condition. Higher entry order wins within a relevance tier, with stable IDs breaking ties. Authored regex keys are unsupported. Whole entries fit within the estimated token allowance and 24-entry limit; Scene writing can omit individual lower-priority entries when its full prompt needs space. A zero budget disables retrieval. Unavailable selected books stop the affected new generation with an explicit retry error; completed work remains retained. Existing worlds, generated places and routines are not regenerated by installation.

In **DEBUG Settings**, enabling **Verbose runtime logging** also enables **Lorebook inspection**. **Test selection** checks the saved books against your query without a model request. Reports distinguish lookup selection from final Scene Narration/System prompt inclusion and show why entries were omitted. Reports include private entry titles, stay in server memory for the latest ten inspections, and clear when logging is switched off or the runtime restarts. They never appear in ordinary Scene responses. Terminal logging can also contain private prompts and replies; keep it private.

## Find your way around

- **Map:** Pan, zoom, or select a labeled Venue marker to open its page.
- **Places:** Search the current map. Selecting a result centers the map; **Visit** starts entry into that place.
- **People:** Browse residents and open their profiles.
- **More:** Open the Village's other pages and settings.

A **Venue** is a place, such as a home or café. A **Zone** is one of its spaces, such as the kitchen or bedroom. Each Venue has an Entrance plus up to six Zones. In founding or the Venue's **Zones** page, drag the Zones to arrange them without overlap. Managers can choose their connections; drawing distance changes neither movement nor sound. Browse a Venue to see what is known about it, then choose **Visit** to enter.

In Places, Zone positions and connections save automatically. The layout sits beside the selected Zone editor on desktop and above it on phones. You can move between menus while a layout saves. Connections must keep every Zone reachable from the Entrance; invalid changes show an inline error. A failed save retains the layout; the next layout change retries saving.

Entering a private space requires permission. Knowing that a room exists, being friends with someone, or hearing a sound from it does not grant access or reveal its contents. An invitation permits entry; use **Move** when you want to go there. The [Venue and Zone reference](venue-zones.md) covers detailed access and sound rules.

On a phone, use portrait orientation. Places opens as a drawer, and Venue editing opens as a sheet.

## Have a Scene

A Scene is an ongoing interaction within one Venue. It can continue as you move between that Venue's Zones.

| Control      | Use it to…                                                               |
| ------------ | ------------------------------------------------------------------------ |
| **Say / Do** | Speak or attempt an action in your current Zone.                         |
| **Move**     | Travel to a permitted Zone without requesting a generated arrival reply. |
| **Contact**  | Knock, call, or speak toward an adjacent Zone.                           |
| **Conclude** | End the Scene and return to the Village's current day.                   |

For a first visit, try a greeting and a small action, then ask about the resident's day. Residents can agree, refuse, or suggest something else. A request or a future plan is not automatically a completed change.

People hear what reaches them through the connected spaces. Addressing one person does not make ordinary speech private. Hearing someone in another room does not mean they joined you, and exchanging an object still requires being together.

Each Zone has room for four villagers; your Persona does not use a villager slot. If a requested change in occupancy cannot be completed, Villages keeps your input as an editable draft and shows a notice. The whole turn stays outside the Scene, including any other dialogue in that input. It will not reveal a private reason such as unseen occupants.

If you see **HALT**, the proposed turn has not entered the story. Read the notice and rewrite your draft. Ordinary refusals can still happen within the story; HALT holds the entire turn for a boundary the game cannot safely resolve. If the generated reply introduces an unsupported outcome, Villages tries one replacement and checks it again. If that fails, your input stays saved for Retry. Character abilities remain part of their identity; their enacted consequences must fit what Villages can support.

### Take breaks without losing the moment

You can leave the page or refresh and return to your unfinished Scene, draft, and reading position. Scenes have no inactivity deadline.

Once a Scene and its saved effects are settled, its transcript is removed. Relevant Project evidence and saved recovery work remain available where needed.

A Scene keeps the time, attendance, and situation it began with. A morning conversation stays that morning conversation even if you return days later. Meanwhile, the wider Village follows real time. **Conclude** rejoins the current day without inventing activities for your Persona during the gap. A Scene cannot jump the Village into the future or complete days of work just because you waited between replies.

## Get to know the residents

Profiles show what you have learned about a resident: relationships, shared Wishes, known routines, and discovered history. **Back to Villagers** keeps your directory reading position. **Inspect** reveals spoilers only when you deliberately open it; inspecting does not teach your Persona or the residents anything.

Each resident has their own perspective: their connection with you, expectations, concerns, and particular shared history. A boundary, a mutual agreement, and a concrete commitment mean different things. You author your Persona’s feelings. Serious choices can end a friendship or partnership; reconciliation is possible and never guaranteed. Time away creates no automatic penalty, and friendship grants neither access nor secrets.

Starting history honors the resident cards, your backstory, and selected lore. Conflicting authored facts ask for a specific clarification in Inspect. Preparing this history does not invent your consent.

**Mailbox** keeps personal correspondence as individual letters in Inbox and Sent. Opening one letter marks only that letter read. Sent letters remain in Sent; failure recovery is offered only when processing needs attention. Exact outgoing words are saved before generation. Reading and replaying saved processing make no model request. Each villager receives a randomly chosen letter style when they join. **Simple text** switches the letter body to a neutral font and is remembered on that browser or device; signatures stay visible. Missing characters fall back to a device font. Letters can influence relationships and memories, but do not grant access, create commitments, or perform actions. Failed processing retains recovery controls even when the original message was already delivered.

Residents follow routines, and their availability changes through the day. Founding admits the chosen characters; accepted sprite copies and your original library cards stay separate.

### Memories

Memories keep meaningful experiences, information, and open matters. Each belongs to the people who learned it. Mentioning a character does not give that character the information.

The People overview and Venues page show each person's currently assigned home and workplaces. These public assignments update when they change; Memory corrections and Forget do not change them. Private Zones, current presence and schedules remain separate.

The Memories page starts with your Persona and loads entries in batches. **Inspect** can show retained evidence and another person's memories. **Forget** suppresses a selected person's existing memory; **Correct** changes its wording for selected people who already know it. These actions do not change physical gameplay facts, teach new people, or rewrite an active Scene's captured history.

## Repair your world

Open **REPAIR** from the main menu. Choose **Memories**, **People**, **Places**, **World & history**, **Progress**, or **Backups & repairs**. **People** lists the villagers; choose someone to see their **Memories** or **Details**. Under **Details**, **letter style** previews and changes their font for existing and future letters. The style stays with that character if they leave and return. REPAIR is an administrative view: saved records, private memories, sources, history, and repair tools are available by default. Browsing does not teach your Persona or any villager anything.

Edit a record, then use **Review changes** to check **Before / After** and **Affected records** before saving. **Modify** edits a memory's text. **Forget** shows the saved memory as read-only text and lets you select who forgets it; **Review forgetting** shows the effect before saving. Switching back to Modify keeps your unfinished edit. Memory changes apply only to selected people who already know the detail; the review shows each person's current wording. A memory about someone does not give that person knowledge of it. **Add memory** shows the new text and who will remember it, with the source recorded as **Added by you**. Physical facts, access, character context, relationships and authoritative progress have separate editors. Historical Scene corrections are annotations. Saved-effect recovery replays retained work without requesting new model responses.

**Repair history** keeps the changes and offers **Review undo** where a safe inverse is available. Undo refuses to overwrite later changes to affected records. Consequential repairs save a checkpoint automatically; you can also name a manual checkpoint. Checkpoints retain independent copies of saved world data. Restoration has its own review and saves the current world first. Current time, spending and replay protection remain current, so elapsed Projects may complete when play resumes.

Opening REPAIR and applying ordinary corrections preserve your unfinished Scene, captured context, and drafts. Whole-world restoration requires the current Scene and pending recovery work to be settled. A restored checkpoint can reopen its saved idle Scene with its frozen context; a draft from another Scene remains available to copy.

## Wishes and Projects

**Wishes** are concrete personal social desires. They can arise through conversation, correspondence, resident encounters and occasional private reflection. Residents can act on them, reconsider an approach, keep them quietly in the background, fulfill them or withdraw them. Invitations and plans establish arrangements; the desired interaction must actually happen. NPCs can satisfy Wishes without player involvement.

The Wishes notebook retains only what your Persona learned, with timestamps for its recorded entries. **Follow** controls Wish notices without changing what the resident wants. Inspect exposes private retained state separately. There are no hidden progress percentages, expiry rolls or active-Wish slot caps. Housing and other larger ambitions are deferred. See [Social Wishes](../../docs/wishes.md).

This refactor uses Village format 6. An unfounded format-5 record containing only setup settings can continue; records with residents, venues, history, pending work, or retired Wishes/Mailbox data remain stored and are rejected without conversion.

**Projects** create new Venues or renovate existing ones. Use the Project board to review the design, Zones, people, site, and progress. You can keep up to six drafts while deciding which Projects to start. Saving a draft and starting work are separate steps:

1. Describe the physical result and choose the site or existing Venue.
2. Arrange the needed agreements and a willing resident lead.
3. Review the saved design, then press **Start** when you want work to begin.

Every Project takes **24 elapsed real hours**. Two can be active at once, with different leads and one per Venue or site. Paused Projects count toward those limits. Visiting a site or leaving the game does not speed up or pause its clock.

If the lead withdraws or the necessary authority is lost, work pauses. **Resume** requires a willing lead and valid agreements and preserves the remaining time. Completion applies the agreed design automatically. To change the scope after work starts, finish or cancel first. Canceling an unfinished site leaves its captured Scenes available to conclude.

A Venue supports up to six non-Entrance Zones, two Classes, and four residents. Renovation does not automatically move residents, assign jobs, or grant access.

## Maps, artwork, and sprites

**World Configuration** manages map names, artwork, framing, and marker placements. On the map, **Move markers** lets you correct Venue positions directly; select a Venue and tap the map, or use the arrow keys on the map or a marker, then save. These corrections do not move residents. **All maps** switches between maps without moving anyone. Additional maps need artwork and begin empty; creating a map does not create its Venues. Existing Venues cannot currently be moved between maps, and maps cannot be deleted.

Scene navigation can open the map; **Return to Scene** restores your draft. Conclude the current Scene before starting another.

Scenery styles apply to future pictures. Zone artwork shows the space as known through an authorized visit; artwork does not create gameplay facts. First discovery of a private space can request one picture. A failed picture does not automatically retry; later regeneration is deliberate.

Sprite setup lets you choose expressions, facing, inclusion, defaults, and framing. **Add without sprites** remains available. Analysis uses the vision connection you choose and saves completed suggestions as it goes. Review the set and choose **Add villager with sprites** or **Use sprites** to accept it. Closing the editor or saving framing does not approve the set.

**Use when** describes when a sprite fits the Scene. Front-facing artwork addresses you; side-facing artwork addresses another resident. Existing artwork and descriptions remain available for editing.

**Generate signature** makes an image request. The original is retained alongside a transparent version; light and white areas are treated as paper. Failed regeneration keeps the previous signature.

## Background activity and costs

Time, schedules, construction, approved moves, and expiry can advance without model requests. Recurring creative activity runs while Villages is visible and pauses before its next request after you leave. Work you already requested can finish while you are away.

Set **Resident activity and Wishes → Off** to pause automatic social planning, routine suggestions, housing proposals, and new Wishes. Local time, construction and approved moves continue. Retained Wishes do not expire.

Quiet, Balanced, and Lively permit at most 1, 3, and 6 automatic resident attempts per local day. Ordinary activity is at least fifteen minutes apart and does not replay missed days. Each attempt uses at most two principal model requests; quiet outcomes, failures, and unknown outcomes still count. Residents may initiate private encounters or personal mail. Weather alone does not start an automatic request.

After an absence of at least one hour, Villages may use the remaining current-day allowance to create a few grounded resident encounters or private reflections. These share the ordinary allowance but do not wait fifteen minutes between opportunities. The host and internet need not be available during the absence; requests run after Villages returns. Retry can make additional model requests. Continue skips only work that can safely be abandoned, while committed effects must finish recovering. The Debug section includes spoiler-bearing accounts for the current and up to 20 previous catch-up periods (fewer if accounts are large), and the development time control. Accounts already overwritten before history was introduced cannot be recovered.

Background work shows progress, failures, and provider-reported usage where available. A quiet result can be valid; the game does not need to invent an event for every interval.

## If something goes wrong

| Problem                       | What to do                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Founding asks for connections | Select available language connections for both **System** and **Narration**.                                      |
| A setup suggestion seems lost | Use **Check suggestions** before requesting another result.                                                       |
| Preparation stops             | Read the task error, fix any connection problem, then use **Retry preparation**. Completed usable tasks are kept. |
| A Scene send fails            | Keep or edit the retained draft. An unchanged submission can reuse saved work.                                    |
| Saved output needs applying   | Use **Replay saved work** when offered. This applies saved output without buying another interpretation.          |
| A turn is held with HALT      | Read the notice and rewrite the preserved input. That turn has not become story history.                          |

Failures do not automatically purchase replacement responses. Explicit interpretation, replacement, or generation retries may make another model request. A timed-out or interrupted provider request may already have been billed, including an in-flight sprite analysis. Saved results reduce repeated work but cannot guarantee that every response survives a hard server crash.

## Sprite variants and visual settings

**Visual Settings** contains **Random sprite variants**, **Card-flip sprite changes**, and **Character chat colors**. Changes save immediately. Random variants and card flips default On; reduced-motion preferences still disable flip animation.

Use Engine's filename convention for approved sprites: happy_01.png and happy_blush.png share the happy choice. Full-body files use full_happy_01.png and full_happy_blush.png. At least two suffixed names form a group; an exact base image joins its group when present. Original filenames determine groups even when Sprite Setup supplies different display names. No separate variant assignments are needed. With random variants Off, expressions remain individual choices.

Each new expression cue chooses an approved variant for its facing and saves that concrete choice. Refresh, backward reading and dialogue pagination retain it. Random picks can repeat. Artwork creation and cleanup remain in Engine, which also handles downloads from Sprite Manager.

## Settings and saved worlds

In **General Settings**, choose your connections. **Writing Settings** control person, tense, rating, and prose guidance while preserving character identity and the game's rules. Optional **Use Decisions** defaults Off; when its Engine feature is unavailable, System handles the work instead.

**Send on Enter** defaults Off. Normally, Enter adds a newline. When enabled, Enter sends and Shift+Enter adds a newline.

Progress saves as you play, and refresh restores it. The current test build uses **Village format 6** and **Scene format 2**. Empty, unfounded format-5 setup records retain their settings and lorebook selection; ordinary saves persist the current format. Played format-5 worlds and earlier formats require their matching runtime. Arrange independent fresh test storage before trying an incompatible build. Installation does not reset existing storage or delete an incompatible world.

Installed package files remain on the Marinara server, but model-driven play still needs a working connection to your configured provider. Before changing or removing a test installation, arrange a backup and confirm how to keep its world with the server operator. **Reset the village and start over** is a separate destructive action.
