# Playing Villages

Villages is a life sim about sharing a place with characters from your Marinara Engine library. Your Persona lives alongside them: you visit, talk, get to know each other, and work together on changes to your surroundings. The setting can be a settlement, a station, a workplace, or any other shared place you describe.

**This is an unreleased prototype.** This guide describes the current test build. Features and save compatibility can change between test builds.

[Setup](#installation-and-setup) , [Founding](#found-your-village) , [Scenes](#have-a-scene) , [Projects](#wishes-and-projects) , [REPAIR](#repair-your-world) , [Troubleshooting](#if-something-goes-wrong)

## Installation and setup

### Get access to a test build

There is no public Villages installer or listing in Engine's official **Download Agents** catalog yet. Arrange a test installation with the project maintainer and the person running your Marinara server. They need to install the agreed package on that server; downloading this repository's source ZIP does not install it.

Once the package is installed:

1. Restart Marinara Engine, or have the server operator restart it if you use a shared server.
2. Open **Home → Villages**. Villages has its own Home tab; you play there.
3. If the tab is missing, confirm that the package was installed on the server you are connected to and that the server restarted successfully.

The current package requires **Engine 2.5.2 or later, before 4.0.0**, with Capability API **1.818**. An incompatible package needs a compatible Engine build before it can be installed.

### Prepare your library and connections

Have a Persona and **one to three characters** ready in your Engine library. Your Persona represents you; the characters become the first residents. Villages keeps its own captured copies of their cards and does not rewrite your originals.

Create or check your model connections in Engine before founding. Choose them on the founding screen's **Setting** step:

| Connection | What it does                                                              |
| ---------- | ------------------------------------------------------------------------- |
| **System** | Prepares the world, residents and background work.                        |
| **GM**     | Writes new Scenes and proposes their gameplay updates.                    |
| **Images** | Generates artwork when requested. Choose **Disabled** to supply your own. |

Choose a specific language connection for **both System and GM** before continuing. You can use the same one for both. Founding shows **Images** alongside them. Use the **Model Connections** gear beside the progress stars or in a mobile form's header to change these choices during Founding. After founding, use **Settings → General Preferences → Model Connections**. Set up providers and keys in Engine's **Connections** panel.

An image connection is optional if you upload your map. Founding requires an uploaded or generated map; the initial grid is a placeholder. Sprite setup makes no model requests.

**Requests may cost money.** Founding, Scene replies, artwork, and enabled resident activity use your configured providers. Model choice affects writing quality and reliability; a successful connection is not a guarantee that every response will be usable.

## Found your Village

The setup steps are **Setting → People → Maps → Venues → Review**.

Use **Back** and **Next** to navigate Founding. Clicking outside a popup or pressing Escape does not dismiss it.

1. **Setting:** Mari guides every Founding through the World, optional Lorebooks, Village and first Map. Name the Village, then name and describe its **Starting location**, such as a harbour between a river and cliffs. The Village is the shared community across its maps; Founding establishes its first location. This description supplies context rather than enforcing a travel boundary. Select lorebooks for world history and references, twelve per page on desktop or six on phones. Use **World rules** for standing constraints. The clock follows Engine’s timezone.
2. **People:** Choose your Persona and one to three residents. Their cards and lorebooks supply backstory. Each compact row shows the number of Character Card sprites available for Scenes, or a red **No Sprites Assigned!** warning. There is no appearance picker in Founding. Appearance is available under **Character Tools** after founding. Mari then introduces the two public locations and starter homes in one turn before the map workspace opens.
3. **Maps:** Upload or generate artwork for the first Map. On desktop, Mari slides aside before her dialogue and the workspace appear; reduced motion shows them immediately. The **Art settings** gear contains the image connection, a style dropdown, Map details and exclusions. Map prompts preserve these details, world rules and style while fitting supporting setting text and whole Lorebook entries into the image allowance. Art settings apply to future map and Venue generations; existing artwork stays intact. Artwork must finish before continuing to Venue placement; a simple placeholder does not qualify.
4. **Venues:** On desktop, open the in-game Venue page from the compact list or a map pin. On a phone, the map fills the workspace: tap a pin to open its Venue and **← Map** to return with the same zoom and position. Back and Next stay visible in both views. The map uses the gameplay framing, markers and labels. Drag a Venue icon to reposition it; releasing saves the move. Drops outside the visible map and cancelled gestures keep the previous position. Tap an icon to open its Venue without moving it. Drag the background to pan, pinch or use the zoom buttons, and **Reset** restores the default view. Arrow keys move a focused Venue icon; on the map background they pan. **About** holds the name, overall description and resident capacity. **Zones** opens the rooms, **People** holds each person’s arrangements, and **Access** sets visitor hours. Starter homes begin with one person each; the same profile combines households, work and public uses. The expanded map workspace continues directly from Maps into Venue placement. **Venue ideas** guides **Suggest**. Review the result and choose **Use changes** or **Discard**; existing pins stay in place. Pending requests are checked without generating again. A confirmed failure or server-confirmed unavailable result stops checking and enables explicit **Retry**; transient connection errors keep the same request ID. Every starting Residence, including the player's, has Entrance → Common Space → Private Space, with a resident and private sleeping destination already assigned; both can be edited. Each starter public Venue has Entrance plus Gathering and Activity spaces. One of the two public Venues is chosen for the opening gathering. Open a Venue to edit room details, artwork, or visitor access. Use **Zones → Zone connections** to change the layout. Text and layout edits save automatically; person arrangements and Access use their Save buttons. Restoring a draft keeps its saved layout.
5. **Review:** Edit your Persona and founding villagers together on then use **World**, **Village**, **Map** and **Lorebooks** on **Setting**. Character cards show their profile pictures when available. Removing a founder keeps their edited starter home available if they return; shared or mixed-use places remain, with departed founders' assignments cleared. Continue to the same Map and Venue workspace as the earlier Venue step. Phones show the Map full-screen with named markers and the familiar pan, zoom and **Reset** controls. Drag a marker to change its placement or tap it to open **About**, **Zones** or **Access**; **← Map** preserves the camera. **Map options → Map artwork** opens the existing artwork editor. **Next** returns to Mari for confirmation. After **Found village**, her short scripted send-off ends in her playful pose; **Enter village** submits the guarded founding action. These dialogue lines make no model requests. Back retraces the review and dialogue. Every founder needs exactly one home and an accessible sleeping destination. Every Venue needs connected Zones and descriptions, with Entrance plus at most six Zones. The Village opens at that opening Venue once local routines are usable; optional personal routines and Wishes continue preparing in the background.

Founding describes the start of play. Current Venue and Zone records describe physical conditions thereafter. Restoring part of an abandoned mall changes that same mall; it keeps its identity and any unrestored spaces. Historical descriptions and lorebooks cannot undo the restoration. Resolving a broader circumstance does not repair buildings, remove unrelated restrictions or change standing rules.

The playable world is a local community with at most **16 Venues**. Existing starting infrastructure is playable immediately, subject to its condition and access. Mentioning more farms or saying another mall exists does not add destinations. After Founding, new infrastructure and material alterations use supported actions or Projects. Visiting a place does not construct or restore it. Administrative **REPAIR** remains separate.

Every Venue can combine housing, work, public destinations and restricted rooms. The Village must retain at least two usable public Zones across two established Venues; nine to twelve Villagers require three Zones. Qualifying Zones and their full routes from Entrance must be public, unaccompanied and open around the clock to the player and all current Villagers. Entrances alone, worksites, unprepared spaces and Zones restricted by damage do not count. Access edits, route changes, construction and generated conditions cannot remove this minimum; open replacement shared space first. Ordinary visit-specific refusals do not change the ongoing public-space supply. Opening gathering selection grants no lasting status.

Map uploads need at least **768 pixels on the shorter side** and **1024 on the longer side**, with proportions between **2:3 and 2:1**. Generation requests an overhead map at 2560 × 1440; providers may return other dimensions.

Setup drafts save on your device, so finish them in the same browser. If your connection drops or you leave Founding, returning retrieves the same saved suggestion attempt automatically. Cancelled browser waits do not indicate generation failure. A confirmed failed or interrupted attempt offers **Retry** for a new, explicitly requested generation. Background jobs such as Routines and initial Wishes retry one eligible empty or malformed answer automatically, preserving completed work. This can charge one additional model response. Further failures and interrupted requests can be retried under **REPAIR → Recover work**.

Characters keep their authored histories, relationships, secrets, and limits on what they know. Sharing a homeworld does not automatically make them acquainted. Optional lorebooks provide reference context without being rewritten.

After founding, the residents gather at the Community Venue for an everyday moment. Respond in your own words or actions, continue the Scene, or conclude it when you are ready. Residents return to their routines, and Projects are available whenever you want them.

Selected lorebooks are read from Engine for new generation. Constant entries need no keyword, but still need room in the lore allowance. Current-message matches take priority, followed by recent shared dialogue, setting matches, and remaining Constants. Recent dialogue is bounded and must already be available to the request, visible to you, and heard by every represented resident. Lore retrieval does not grant character knowledge.

**Lorebook chips** count the entries used for the current Scene reply and sit below the location and time beside other notices. Click the chip to open a compact list of entry names. A reply without lore or a fresh Zone arrival clears it. Other screens show the latest request's entries. The popout follows the day/night palette and closes with its close button, Escape or an outside click. **Settings → Visual Settings → Show Lorebook chips** controls visibility without changing lore selection or generation.

The latest 200 source lookups are retained privately in the package's document store and survive restart. Each receiving request is recorded only after its final Lore fitting, with retries reusing the same attribution. Different Villages retain separate histories within that shared bound. Summary polling contains only an opaque scope and revision; names are fetched when the inspector opens, and exact keys/context only for the selected explanation. Full entry bodies are not copied. Constant entries show request context when no key was needed. Older work without captured evidence cannot reconstruct it from today's Lorebooks. These records describe prepared prompt inclusion, not proof that a model used a fact. Lore remains reference data, separate from GM instructions, and image generation considers selected lore automatically.

Map and Zone artwork also receive the attached images and captions of entries retained in their final prompt, including image-only entries. Book covers are excluded. Engine accepts at most four reference images, including existing Zone pictures during edits. Requests stop before generation if references are unavailable, exceed that limit, or the chosen image connection or its fallback cannot accept them. Scene text requests use Lorebook text; the current Engine text API does not accept attached images.

Primary keys support case-sensitive and whole-word matching. Secondary conditions support any/all and their negations; an empty secondary list adds no condition. Higher entry order wins within a relevance tier, with stable IDs breaking ties. Authored regex keys are unsupported. Whole entries fit within the estimated token allowance and 24-entry limit; Scene writing can omit individual lower-priority entries when its full prompt needs space. A zero budget disables retrieval. Unavailable selected books stop the affected new generation with an explicit retry error; completed work remains retained. Existing worlds, generated places and routines are not regenerated by installation.

In **DEBUG Settings**, enabling **Verbose runtime logging** also enables **Lorebook inspection**. **Test selection** checks the saved books against your query without a model request. Reports distinguish lookup selection from final GM/System prompt inclusion and show why entries were omitted. Reports include private entry titles, stay in server memory for the latest ten inspections, and clear when logging is switched off or the runtime restarts. They never appear in ordinary Scene responses. Terminal logging can also contain private prompts and replies; keep it private.

## Find your way around

- **Map:** Pan and zoom, or select a Venue marker to open its illustrated Venue page. Choose **Visit** to enter a Scene, **Zones**, **People** or **Access** for the Venue controls, or **Map** to return to the same map view.
- **Locations:** Browse known destinations with search, map and category filters. Both Venues and other Locations open their illustrated detail page. **Map** opens the separate village map, and **Visit** starts Scene entry.
- **People:** Browse residents and open their profiles.
- **More:** Open the Village's other pages and settings.

**People**, **Projects**, **Locations**, **Mailbox**, and **Settings** share an illustrated Storybook village. Daylight brings a powder-blue sky, sage navigation and forest-green ink. Night brings indigo skies, plum navigation, warm oat ink and lit windows. The menus switch at 06:00 and 20:00 in the Village timezone, or use the device clock before a Village is loaded. A compact navigation rail has its own width and ends above the foreground scenery. Only the content fades between sections; reduced motion switches immediately. People shows four complete resident tiles in a 2×2 grid without gallery scrolling, with pagination for five or more residents. The gallery fits the available height and remains beside the profile on desktop; selecting a resident changes its highlight without resizing portraits. Searching returns to the first page; profile and menu navigation retain the current page. The selected resident's assigned neutral sprite appears on the right, with the assigned default or portrait as a fallback. Its visible artwork is fitted to the available height without transparent canvas padding shrinking the character. The full biography wraps into the profile's reading area. Selecting **People** again returns to the gallery on a narrow panel. Navigation shares smooth vector silhouettes of people, a claw hammer, a house, an envelope and a gear throughout the game. The four profile tabs are **Overview**, **Relationships**, **Wishes**, and **Memories**. Overview shows Agenda, the signature as ink without a paper backing, and home/work connections. The gear at the end of the profile tabs opens **Character Tools**, which contains **Inspect**, signature actions, agenda records and venue connections. Wishes uses the same profile layout and reading area as the other sections. Real portraits, maps, venue images, letters and forms remain live. **Return to village** returns to the map; **Scene** returns to an active Scene. Narrow panels use compact top navigation and a scrolling profile with a smaller neutral sprite. Reading positions and unfinished local controls remain retained when switching menus.

A **Location** is any playable destination. **Venue** is a status admitting a Location to village mechanics. The full-width **Locations** directory groups Village Venues and other Locations; only Venues have a status badge. Search and the map/category filters apply to the whole known collection before A–Z pagination, with 50 results per page. Returning from details retains the search, filters, page and scroll position. **Map** opens the separate spatial view for placed Venues. The single **Explore** action discovers a Location you do not already know; search and the map find known destinations. **Visit** handles first arrival and ordinary Scene entry. After visiting once, **Add as Venue** admits the saved Location and selects a map position without a Project. [Locations and Venue admission](../../docs/places.md) explains discovery, supporting characters and promotion.

A **Venue** is an established village location, such as a home or café. A **Zone** is one of its spaces, such as the kitchen or bedroom. Each Venue has an Entrance plus up to six Zones. In Founding, choose **Zones → Zone connections** to arrange Zones and change connections. During play, **About** shows the place and offers **Visit** to enter. **Arrangements** shows unique portrait cards for residents, workers and managers. Choose a room in **Zones** to see its known artwork and access status.

In **Zones → Zone connections**, drag boxes or use the arrow keys to arrange the diagram. This changes its presentation and is available outside an active Scene. Changing a connection requires the Venue manager and both affected Zone managers’ authority, no active Scene, and no unfinished Venue project. Worksite layouts belong to their Projects. Passages work both ways and every Zone needs a path to the Entrance. **Save layout** applies a valid draft, and leaving the editor also saves a valid draft in the background. If a Zone is disconnected, Keep editing returns to the draft and Discard and leave restores the saved connections. A failed save retains the draft and displays its error when you return to the editor. Refreshing or closing the browser discards unsaved edits.

**Move** shows the same saved arrangement with angular connections, highlights the current Zone, and labels each destination’s access. Its colors follow the Village’s day/night menu theme. Revealed Zone artwork fades behind each label; unknown or missing artwork stays plain. Selecting an accessible Zone shows **Move to [Zone]?**, with **Stay here** and **Move**; selecting a box never moves immediately. An ordinary move may cross several Zones when the whole route is accessible. Select a restricted adjacent Zone to inspect its status and explicitly choose **Trespass…**; each trespass crosses only one connection. Every entered Zone needs access, including on the way back to Entrance; an inaccessible intermediate Zone requires its own adjacent trespass move. Arrange the diagram outside a Scene through **Zones → Zone connections**.

Select a room under **Zones** to rename it or manage its artwork. The room's artwork fills the editor backdrop, and **View full image** opens it uncropped. **← Zones** returns to the list. The checkmark, Enter or leaving the name field saves, and Escape cancels an in-progress name edit. Entrance keeps its fixed name. End the active Scene before changing connections. You can browse Zones during a Scene, and any pending connection draft stays available for editing after the Scene ends.

Each Zone, including the Entrance, keeps one account of **Long-term details**. Physical changes belong to Projects, evidenced gameplay, or **REPAIR**. Small unfinished physical work can remain in those details: shelves waiting for brackets are different from a promise to build shelves, which belongs in Memories. Completed work updates the same account while preserving unrelated details. There is no separate Features list or possession inventory.

A Zone can also retain one paragraph of **Short-term details**, such as cups left after tea. It fades after about a Village day. Unrelated new activity does not extend that window; deliberately maintaining the whole arrangement can renew it. Looking at a place or mentioning it does not refresh it. Ordinary temporary use requires valid access; enduring alterations also need evidenced authority over that Zone. Already scheduled resident encounters use the same rules without a new activity scheduler. A residence move changes who lives there and who controls access; it does not automatically rewrite the room or transport belongings.

Entering a private space requires permission. Knowing that a room exists, being friends with someone, or hearing a sound from it does not grant access or reveal its contents. An invitation permits entry; use **Move** when you want to go there. The [Venue and Zone reference](venue-zones.md) covers detailed access and sound rules.

On a phone, Locations uses one full-width scrolling page with category filters, stacked row labels and reachable Previous/Next controls.

## Have a Scene

Scenes use one GM response for dialogue and gameplay updates. This build requires fresh Scene format 5; retired formats are rejected without conversion or changes to their saved bytes. Ordinary conversation needs only narration and dialogue. Meaningful lasting developments use shared continuity; code validates native actions and retains witnessed access and circumstance outcomes. Wishes, relationships and Memories update during play without separate fictional lifecycle processors or a Scene-end model request.

A Scene is an ongoing interaction within one Venue. It can continue as you move between that Venue's Zones.

Ordinary visits can open quietly so you can look around or move without a narration request. Turn on **Spontaneous events** in Settings to allow a fresh visit to roll for a brief surprise opening. A development can start at the entrance, or a resident can take the initiative when you reach their Zone. An ordinary visit can spend one automatic GM call, and a short Village-time cooldown applies at each Venue.

With **Spontaneous events** on, a new encounter with a co-located Villager or established NPC while someone is trespassing can start one ordinary GM response. Unauthorized presence does not establish detection: cover, distractions, witnesses’ knowledge and their motives shape the response. Refreshing or someone leaving does not buy another response for the same encounter. Failed responses use the normal explicit **Retry** flow. Movement is committed separately; a failed response does not undo the crossing.

A no-access chip beside the Scene header marks when you are trespassing. Select it to see “You are currently in this area without permission.”

Villagers and NPCs can naturally follow you during a Scene, through their own dialogue or visibly falling into step. An audible spoken aside can establish following too. Ordinary **Move** takes followers along and shows **Coming with you** or **Staying here** in its confirmation. Following continues across moves while you remain together. Each person keeps their own access; someone who cannot follow stays behind. Ordinary following does not make someone willing to trespass. A character can explicitly commit to sneaking together for the current outing, or agree to just one restricted crossing. Unauthorized movement crosses one connection at a time. Ask them to wait, or let them leave, to end following. Bans, refusals, physical closures and capacity still apply. Warnings, reports, Memories and authorized access changes use ordinary witnessed consequences. **Conclude** always archives normally, without a special trespass ending or movement lock.

A resident’s invitation to another Venue can show a destination card. Select **Visit** to start a new Scene under the destination’s current access, escort and attendance rules. The invitation handoff generates no goodbye or greeting.

An invitation to a restricted Zone in the current Venue applies for the current Scene. Use **Move** to go there; visitor hours, bans and escort requirements still apply.

**Send** takes place in the Zone shown in the Scene header. Put spoken dialogue in quotation marks. Unquoted text describes actions, narration, or thoughts, and residents can respond to what they observe. If you describe heading to another Zone, the GM can write up to the crossing. Choose **Move** on the dock to enter a permitted Zone. A pending spontaneous opening can play when you arrive. Villagers can cross Zones or leave on their own in a GM reply. **Conclude** archives the Scene without a generated reply. Send any farewell as an ordinary turn before concluding.

Read messages in small chunks with **Next**, and use **Transcript** to read earlier exchanges. The dock keeps the message input in place while you read. Write dialogue, actions, thoughts, or a mixture and choose **Send**. **Move** is on the dock and becomes available when you can send a message. It goes to a permitted Zone without a generated arrival reply. Open **Venue actions** for **Settings**, **Retry Turn**, Village menus or **Conclude**. The first gear opens the game's main Settings; there is no separate Scene Settings or Hide Dialogue action. Conclude archives the Scene without generating a reply. Send any farewell or departure as an ordinary turn before concluding. You can knock, call, or speak toward an adjacent Zone in your own words.

For a first visit, try a greeting and a small action, then ask about the resident's day. Residents can agree, refuse, or suggest something else. A request or a future plan is not automatically a completed change.

Ordinary speech reaches everyone in the same Zone. A whisper reaches its one local recipient. A deliberate shout can reach a directly connected Zone. Hearing someone in another Zone leaves them where they are. Exchanging an object requires being together. Saved exchanges retain their original witnesses.

Heard asides appear above the Scene card beside the passage they accompany and remain in the transcript. They follow the same hearing rules as ordinary dialogue, whispers, and shouts.

Each Zone has room for four villagers; your Persona does not use a villager slot. If a requested change in occupancy cannot be completed, Villages keeps your input as an editable draft and shows a notice. The whole turn stays outside the Scene, including any other dialogue in that input. It will not reveal a private reason such as unseen occupants.

The GM first tries to continue in character. Attempts, threats, ordinary refusals, and plausible local damage can play out in the Scene. Permanent character loss, changes to the shared Village clock, and destruction of the playable Village can require **HALT**. The turn stays outside the story and the notice helps you revise your preserved draft. Recovery uses the saved reply or offers an explicit Retry when applicable.

### Take breaks without losing your progress

You can leave the page or refresh and return to your unfinished Scene, draft, and latest reply. Scenes have no inactivity deadline.

Once a Scene and its saved effects are settled, its playback can retire. Accepted exchanges and relevant Project evidence remain available to continuity and recovery. Scene playback includes your original submissions, including private thoughts, for anyone with access to this Engine instance. Characters learn only what they actually heard or witnessed.

New Scenes follow the Village's current time. Residents can leave for commitments and others can arrive while you stay in the Venue. Each exchange keeps the time, participants and witnesses admitted for that request; a scheduled departure waits for that exchange to settle. Accepted changes count as you play, before **Conclude**.

On returning, earlier replies remain saved and your draft stays unsent. A small World changes popup shows arrivals and departures with the Village time, outside the dialogue box; you can dismiss it or reopen its chip. The Scene shows who is here now without inventing anything your Persona did during the gap. New arrivals do not learn earlier conversations automatically. If the situation changes before Send, your message stays a draft while the Scene updates; review it before sending again. Time passing never purchases a generated greeting.

Saved and interrupted supported requests keep their admitted time, evidence, allowance and recovery controls.

## Get to know the residents

Profiles show each villager’s current attitude toward you and other villagers as a center-out relationship bar. The score starts at neutral. New changes can earn up to 6 points of ordinary gains or losses in each direction per Village day. A positive turning point backed by an earlier witnessed day can raise the gain allowance to 10. Positive allowances shrink as the score approaches +100. Serious breaches have their own allowance of 10 loss points. The model identifies the change and its source, and code applies it once within −100 to +100.

Ten hearts show separate romantic interest toward you and each villager. Each point on the 0–20 scale fills half a heart. A witnessed change in attraction can add one point per Village day. Cooling can lower interest on that same day. Attraction guides banter, letters, and invitations alongside warmth, history and boundaries. Each villager has their own score and the player expresses their own interest through play.

The **Agenda** in **People → Overview** shows seven Village days. It starts blank and adds witnessed schedule details and mutually accepted plans. A sighting records only that moment. A dated agreement reserves flexible time on the resident’s actual Agenda. A resident who feels close to you shares their full current schedule. Use **Character Tools → Inspect** to view the full schedule at any warmth, then **Leave Inspect** to return to your normal view. Empty space in the known view may include undiscovered plans.

The line below **Toward you** is one sentence of at most 15 words in the villager’s own voice. A completed Scene with the villager makes the first blurb eligible. When you return, one batch of due blurbs can be written at the end of catch-up using the day’s background allowance. A routine refresh requires two Village days and a 12-point shift since the last sentence. A turning point or serious breach can qualify sooner. Shared Wishes, routines, history, motivations and commitments follow what your Persona has learned. Statements retain their qualifications and full agreement terms. Returning to **People** keeps your directory page. **Inspect** opens private directional perspectives and their sources. Standing-invitation buttons reflect current access permissions.

Each resident's current attitude shapes who they seek out, what they confide, and how they respond to requests in Scenes and letters. Their history, motives and boundaries determine how that attitude shows up. For optional free-time meetups between Villagers, the background planner ranks candidates using both warmth scores, weighting the lower one at 75% and the higher one at 25%. You author your Persona’s feelings. Serious choices can end a friendship or partnership; reconciliation is possible and never guaranteed. Time away creates no automatic penalty, and friendship grants neither access nor secrets.

Starting history honors the resident cards, your backstory, and selected lore, including explicit existing friendships and marriages. Only contradictory social facts that change a relationship, shared history, or who knows a fact ask for clarification; spelling and other background discrepancies do not block preparation. Founding waits for starting history before admitting a new Scene and offers **Inspect starting history** to clarify a conflict or explicitly retry failed history work. Optional routine and Wish work stays separate, and an already active Scene retains its saved history contract. Later Village relationship developments take precedence over conflicting cards or lore; editing a lorebook alone does not rewrite played history. Preparing this history does not invent your consent or give anyone unsupported knowledge.

**Mailbox** keeps personal correspondence as individual letters in Inbox and Sent. Opening one letter marks only that letter read. Sent letters remain in Sent; failure recovery is offered only when processing needs attention. Exact outgoing words are saved before generation. Reading and replaying saved processing make no model request. Each villager receives a randomly chosen letter style when they join. **Simple text** switches the letter body to a neutral font and is remembered on that browser or device; signatures stay visible. Missing characters fall back to a device font. Letters can influence relationships and memories, but do not grant access, create commitments, or perform actions. Failed processing retains recovery controls even when the original message was already delivered.

Residents follow routines, and their availability changes through the day. Founding admits the chosen characters; accepted sprite copies and your original library cards stay separate.

### NPCs

**People** has Villagers, Visitors and NPCs tabs. NPCs retain identity, appearance and individual Memories without Villager Agendas, jobs or background simulation. Maps do not generate a starting NPC population. Existing NPCs and their history remain intact.

The GM can introduce one new individual in an ordinary response, retaining continuity after the witnessed encounter. **People → NPCs** automatically lists people you have met, most recent first. Meeting someone again updates their existing entry. Search and pages reach older acquaintances. Select a person to see their saved name, role, authored appearance and personality, and where and when you last met. On phones, **NPCs** returns to the list. Mere mentions add nobody. Browsing makes no model requests, changes no Memories and adds no simulation. Private Memories, facts and availability remain available through **REPAIR**, with reviewed changes and Undo. Names and location associations reuse established characters; a house or business name never creates a replacement owner.

NPC context is selected locally from relevant identities and history, within the Scene's existing recall budget. The GM does not receive the whole population or perform separate NPC-management work. See [Places and supporting characters](../../docs/places.md).

### Visitors

In newly founded Villages, Professor Mari is the first Visitor. Starting 24 elapsed Village hours after founding finishes, the next fresh visit to a suitable public Venue with a quiet Entrance begins her introduction. An active Scene, opening gathering, nearby conversation, or local event defers it. One GM request writes a playful, wry greeting and farewell about the Village or Venue using her existing character card; the fixed Visitor explanation appears between them. Read through it and choose **Continue** to conclude the Scene. Mari then stays for another 24 Village hours, available for ordinary conversations through People → Visitors, initially at the same Venue when accessible. She stays off-map overnight during this introductory visit. Afterwards, letters and occasional return visits remain available. Reloading or chatting does not extend the stay or regenerate her introduction. If generation fails, the ordinary greeting recovery controls remain available, including continuing with the fixed explanation and a short fallback farewell. The introduction runs once; existing worlds and saved dialogue keep their progress without replaying it.

Mari is reserved for this introduction during Founding. Afterward, she remains a met Visitor who can receive letters, return under the ordinary visit rules, or move in. Other selected Visitors become eligible for chance visits after the introduction concludes.

Mari's bundled standing artwork includes twelve front-facing expressions, including numbered variants, with Neutral as her automatic default. Untouched Appearance adopts these sprites; saved custom artwork and explicit Portrait choices stay in control. Her Engine character card remains her identity, with occasional fourth-wall humor in Villages and the same knowledge and privacy limits as everyone else.

Open **People → Visitors** to browse profiles or choose **Add Visitor** and select an unused Character Card. Villages sets up available standing sprites for Villagers and Visitors with untouched Appearance. It uses recognizable expression labels when available and chooses one standing sprite when the labels give no expression clues. The portrait is the fallback. **Character Tools → Appearance** lets you adjust the sprites and set up side views.

The Visitors tab uses the same portrait cards as Villagers. After meeting a Visitor, their Overview shows when you first met, the end of their current visit, **Find** when they are publicly available, and **Write a letter** addressed to them. Their Relationships and Memories remain available between visits.

A Visitor can arrive during the Village day and stays for two local nights, leaving at 5 p.m. on the third day. **Find visitor** opens their public daytime location. They turn in at 10 p.m. and return to town from 7 a.m. New stays use the nearby off-map overnight fallback. Room names do not assign lodging or grant access; inn and host arrangements remain deferred to the sleeping-arrangement design. Already saved lodging retains its existing native permissions and expiry.

After you hear a Visitor speak in a Scene, you can write to them in **Mailbox**, including while they’re away. Scenes and letters can develop the same relationship scores as with a Villager. A Visitor who agrees to return in a letter has a better chance of visiting in the next few Village days. They may also agree to give you space. **Turn visits off** stops appearances and keeps the correspondence available.

After meeting someone, **Character Tools → Move in** adds them to the Villagers with their existing relationship, Memories, letters and artwork. Visitors gain Villager Agendas, Wishes, and Project roles after they move in.

Moving into an occupied home requires your incoming resident and every current housemate to agree to the exact destination and sleeping space. Private rooms retain their individual control; shared rooms use household control. Resident moves take 24 Village hours after approval; your own move applies immediately once the required people agree. Changed membership or room availability holds a scheduled move for renewed review. Cancelling releases its reservation.

### Mixed-purpose Venues and work

Venues have no Classes. A café can be Rowan’s home, workplace and a public destination at once. Zones describe the actual rooms; membership and visitor rules decide access.

Venues use **About**, **Zones** and **Access**. Zones use **About** and **Access**, with a back control to their Venue. **About → Edit** holds the Venue name, overall Description and resident capacity. Entrance holds its exterior description; other Zones hold their own descriptions and appearance controls. During play, physical changes use **Plan a renovation**. **Zones → Zone connections** opens the layout editor.

**About** has Residents and Workers rows. A Zone has Sleeps here and Works here rows. Each row opens its scoped portrait roster and the shared arrangement editor. The People menu’s Arrangements tab uses those same editors. Access holds management.

During Founding, **About → Edit → Resident capacity** sets the Venue’s total capacity (0–4). A person’s **Home** form chooses **Venue** and **Sleeps in**, **Save home** or **Remove resident**. Removing residency retains work and management. **Work** holds activity, usual Zone, access rooms, weekdays and hours. **Management** assigns control; owned personal rooms retain their owner’s control. Cancel leaves saved person edits unchanged. **Access** sets Entry and Hours for the current Zone, or default Venue hours. Access saves preserve sleeping routes. Residents retain a route home outside public opening hours. Keep two always-public shared Venues for village life.

**Venue ideas** can request the same arrangements from Suggest. Review the proposed names, rooms and people, then choose **Use changes** or **Discard**. Map pins and unrelated existing Venues are retained. Founding’s final People review shows homes, sleeping places, management and work.

After Founding, **People → [person] → Arrangements → Work** proposes a new arrangement, changed terms or ending work. The worker, Venue managers and affected room controllers must agree to the exact offer. Discuss it in a Scene or letter; a person can speak only for themselves. Current work continues until approval. Work grants only the listed room access, never management. Weekly shifts appear in the existing Agenda, protect sleep, essential duties and accepted appointments, and can yield ordinary time to Projects.

After Founding, **Home** proposes an exact Venue and sleeping Zone through existing move agreements. Two residents can share a bedroom, including a room with an existing steward. Sharing grants entry without management. About holds name changes; Zones holds connections; renovations use Projects. Pay, business inventories and temporary guest/couch stays are outside this version.

### Activities and Keepsakes

Agreed plans appear in the Villager’s **Agenda**. Visit the meeting place at the agreed time and use its usual entrances and access rules. After a shared Scene, planned or spontaneous, a Villager may send a follow-up through the usual background activity allowance. A rare Keepsake recalls a particular moment that mattered to its sender.

Open a letter to reveal any attached Keepsake. **Mailbox → Keepsakes** collects the gifts you’ve opened. **Generate illustration** uses your configured image connection for that gift. The letter and caption are saved independently.

### Memories

Memories keep meaningful experiences, information, and open matters. Each belongs to the people who learned it. Mentioning a character does not give that character the information.

The People overview and Venues page show each person's currently assigned home and workplaces. These public assignments update when they change; Memory corrections and Forget do not change them. Private Zones, current presence and schedules remain separate.

The Memories page starts with your Persona and loads entries in batches. **Inspect** can show retained evidence and another person's continuity, including perspectives, Wishes, motivations and commitments. **Forget** suppresses a selected person's existing account; **Correct** changes its wording for selected people who already know it. These actions do not change physical gameplay facts or native permissions, teach new people, or rewrite admitted requests or earlier dialogue.

## Repair your world

Open **REPAIR** from the main menu. Browse **People**, **Locations & venues**, or **World & history**. Under **People**, choose a villager or **Your Persona** to see their **Memories**. You can also search saved records from **Find a record**. Memory results show who remembers the event. Under a villager’s **Details**, **letter style** previews and changes their font for existing and future letters. The style stays with that character if they leave and return. In **Locations & venues**, choose a location and then a Zone to edit its available records. Use **Recover work** for unfinished work and **History & backups** for repairs and checkpoints. REPAIR gives you administrative access to saved records, private memories, sources, and history. Browsing does not teach your Persona or any villager anything.

Edit a record, then use **Review changes** to check **Before / After** and **Affected records** before saving. **Modify** edits a memory's text. **Forget** shows the saved memory as read-only text and lets you select who forgets it; **Review forgetting** shows the effect before saving. Switching back to Modify keeps your unfinished edit. Memory changes apply only to selected people who already know the detail; the review shows each person's current wording. A memory about someone does not give that person knowledge of it. **Add memory** shows the new text and who will remember it, with the source recorded as **Added by you**. Physical facts, access, character context, relationships and authoritative progress have separate editors. Historical Scene corrections are annotations. Saved-effect recovery replays retained work without requesting new model responses.

Under **People → [resident] → Agenda**, select an activity to edit it in the planner or use **Add activity**. Both editors use the Venue and Zone pickers. Review is available when the draft has a change. The review shows which ordinary activities the new item replaces or shortens. Appointments and Project reservations retain their existing times.

Visitors appear under **People**, with their memories, character context, letter style, and visits under **Details**. Turning visits off ends the current trip and clears its preferences and lodging through the same rules as People. Visitor access is available under each Zone. These repairs support review and undo.

Under **Locations & venues**, choose a Zone and open the room detail you want to correct. Active timed details show when they expire. Corrections keep that expiry. A Venue’s **Entry policy** and **Standing access** are separate controls.

**Repair history** keeps the changes and offers **Review undo** where a safe inverse is available. Undo refuses to overwrite later changes to affected records. Consequential repairs save a checkpoint automatically; you can also name a manual checkpoint. Checkpoints retain independent copies of saved world data. Restoration has its own review and saves the current world first. Current time, spending and replay protection remain current, so elapsed Projects may complete when play resumes.

Unapplied reviews keep at most ten current previews. Leaving a review discards its server preview while preserving your edit draft; if a preview is no longer available, review the edit again. Applying a review retires its preview through the same recovery journal as the saved changes. Repair history, Undo and checkpoints remain separate.

Opening REPAIR and applying ordinary corrections preserve your unfinished Scene, accepted history, and drafts. Whole-world restoration requires the current Scene and pending recovery work to be settled. A restored checkpoint can reopen its saved idle Scene under its original temporal contract; a draft from another Scene remains available to copy.

## Wishes and Projects

**Wishes** are concrete personal social desires. They can arise through conversation, correspondence, resident encounters and occasional private reflection. Residents can act on them, reconsider an approach, keep them quietly in the background, fulfill them or withdraw them. Invitations and plans establish arrangements; the desired interaction must actually happen. NPCs can satisfy Wishes without player involvement.

The Wishes notebook retains only what your Persona learned, with timestamps for its recorded entries. **Follow** controls Wish notices without changing what the resident wants. Inspect exposes private retained state separately. There are no hidden progress percentages, expiry rolls or active-Wish slot caps. Housing and other larger ambitions are deferred. See [Social Wishes](../../docs/wishes.md).

**Projects** create new Venues or renovate existing ones. Use the Project board to review the design, Zones, people, site, and progress. You can keep up to six drafts while deciding which Projects to start. Saving a draft and starting work are separate steps:

1. Describe the physical result and choose the site or existing Venue.
2. Arrange the needed agreements and a willing resident lead.
3. Review the saved design, then press **Start** when you want work to begin.

Every Project takes **24 elapsed real hours**. Two can be active at once, with different leads and one per Venue or site. Paused Projects count toward those limits. Visiting a site or leaving the game does not speed up or pause its clock.

Starting a Project reserves **six hours of lead focus** before its completion deadline. This replaces ordinary work or discretionary activities while protecting essential duties, rest and accepted time reservations. Work uses substantial periods at the site's Entrance. If the time cannot fit, choose another willing lead or start later. The Project's Progress view shows its next work period; the Agenda determines availability and location from the same reservations.

Pause or cancellation releases the reserved periods. Resume arranges the remaining focus within the remaining Project time. These are planned work periods at minute resolution; the completion clock remains 24 elapsed hours. No separate work history or effort meter is kept.

If the lead withdraws or the necessary authority is lost, work pauses. **Resume** requires a willing lead and valid agreements and preserves the remaining time. Completion applies the agreed design automatically. To change the scope after work starts, finish or cancel first. Canceling an unfinished site leaves its captured Scenes available to conclude.

A Venue supports up to six non-Entrance Zones and up to four home places, including the player. Renovation can change its building form and Entrance details as well as selected interior Zones. Building changes require the affected people's agreement and preserve unrelated interiors. Renovation does not automatically move residents, assign jobs, or grant access.

## Maps, artwork, and sprites

**World Configuration** manages map names, artwork, framing, and marker placements. The compact map selector switches between maps without moving anyone. **Map options → Move markers** lets you correct Venue positions directly; select a Venue and tap the map, or use the arrow keys on the map or a marker, then save. These corrections do not move residents. **Locations → Explore** opens exploration. The envelope in Village navigation opens the Mailbox; its dot indicates delivered, unread mail addressed to the player. Additional maps need artwork and begin empty; creating a map does not create its Venues. Existing Venues cannot currently be moved between maps, and maps cannot be deleted.

Scene navigation can open the map; **Return to Scene** restores your draft. Conclude the current Scene before starting another.

Scenery styles apply to future pictures. Open a Zone to edit its heading, Description and Used for fields directly. Founding saves these edits immediately; physical changes during play open a renovation draft and retain consent requirements. People holds Room assignment; occupied rooms retain the residence move flow. The backdrop shows the current image. **Generate Image** uses the known design or last observed appearance. **Upload image** replaces the Zone image immediately and turns off **Automatic artwork updates** until you enable them again. **View fullsize** opens the image, and **Remove image** clears it. Ordinary Scene turns and browsing leave generation idle; **Dynamic Images** controls eligible automatic work on entry.

Day/night imagery is standard, with one image reused for AI-known constant lighting. Existing description-writing requests make that decision without an extra classification call. Artwork uses stable daytime lighting independent of generation time, respecting established world rules; night is derived from that same base. Play follows Village time and timezone, including map tint; Founding stays daytime. There are no day/night or Refresh controls. Completed daytime artwork remains visible if night fails, and Retry resumes the failed stage. Each automatic image counts against six images per real hour; paired stages can run together, with five minutes between automatic updates of the same Zone. Undo/Restore preserves limits. Existing artwork is retained without bulk generation. Closed Scenes retain captured presentation. See [Zone pictures](../../docs/zone-pictures.md) for lifecycle and provider limits.

The map's artwork changes tint with Village time, leaving markers and controls readable. Morning begins at 05:00, daytime at 08:00, evening at 17:00 and night at 20:00 in the saved Village timezone, including daylight-saving changes. The server clock and saved development time advance govern presentation; the browser's local timezone does not. Active Scenes select their saved day/night background from the time admitted between exchanges, while concluded Scenes retain their captured presentation. Clock changes never request artwork.

**Character Tools → Appearance** uses one sprite gallery. Use **Add sprites** to choose images from **No folder** or an Engine folder. Engine labels such as `happy_01`, `happy_blush` and `happy_pajamas_04` group automatically under `happy`. Sprite selection does not change with facing. Older paired assignments retain their artwork and use one stable image for each expression.

Use **Remove** below a sprite to remove its assignment. Reopen the picker to add it again. Upload and edit the original images in Engine. Re-select a linked sprite after editing it in Engine to update the saved version or label. You can add up to 200 sprites per save. **Portrait** shows the card portrait and keeps the sprite selection for later.

**Generate signature** makes one image request for the habitual identifying mark a character would leave on a brief note in their usual social or public life. Their adopted narrative card guides the identity they present and the pace, control and legibility of their strokes; neither the display name nor an alias is prescribed. It needs only an image connection. Retries reuse a saved image where available. The original is retained alongside a transparent version; light and white areas are treated as paper. Failed regeneration keeps the previous signature.

## Background activity and costs

Time, schedules, construction, approved moves, and expiry can advance without model requests. Recurring creative activity runs while Villages is visible and pauses before its next request after you leave. Work you already requested can finish while you are away.

Set **Pace → Off** to pause automatic resident and world reviews. Local time, construction, approved moves and established environmental expiry continue. Retained Wishes do not expire.

A resident encounter can establish a meetup when both participants speak. The GM chooses from feasible times and places, and the game reserves that free time. If both attend, each can remember being there even with Pace Off. Attendance alone never settles a Wish or gives the player knowledge of a private meetup.

Quiet, Average, and Busy permit at most 2, 6, and 12 shared automatic reviews per Village-local day, at least 60, 30, and 15 minutes apart respectively. Midnight resets the allowance without shortening spacing. Automatic reviews begin after the opening gathering. Accepted due arrangements have priority. A new shared visit can warrant one review for that group and Zone per day. World reviews need a new active circumstance. An eligible review uses one model request, and one eligible automatic retry can buy another. Quiet outcomes, failures, and unknown outcomes count. Completed replies are reused. Unknown outcomes require deliberate recovery. Residents may initiate personal mail during eligible activity.

**Consequence → Gentle / Moderate / Dramatic** controls introduced circumstances and event-driven escalation. Gentle is the default. It does not restrict ordinary character behavior or replace HALT. Lowering it preserves established facts and constrains uncommitted developments. Discover circumstances through ordinary visits, conversations, activities and memories; player assertions do not independently create external facts. Situations can remain quiet, develop or resolve without player involvement.

An eligible new Scene turn can introduce a local environmental development through its existing GM request. It shares the background allowance and cadence, uses the independently selected existing Zone, and yields to accepted arrangements. The captured Scene must still match the target circumstances. Quiet is valid. Consequences settle before display; a stale generated draft remains recoverable. Village-wide weather developments use the background timeline. Existing action evidence and authority rules remain.

World reviews can update the observable Room entries of one prepared Zone. A saved review holds for recovery if the captured Room changes before the result applies. Conditions can restrict ordinary use while preserving authorized inspection, corrective work and egress. A completed repair in a Scene or World review updates the affected Room entries and their linked condition together. Scene repairs work with Pace Off. Accepted weather overrides use the Village’s weather descriptions and take precedence during their specified interval. Each admitted exchange retains its captured circumstances. Live Scenes refresh between exchanges. A material change can make existing artwork stale without generating a new image.

After an absence of at least one hour, Villages may use the remaining return-day allowance for up to six grounded resident or world opportunities. These share the ordinary allowance without waiting between opportunities. A batch considers at most the latest seven days, never a review for every missed day. Its allowance date and maximum stay fixed: reserved work can finish after midnight, but unstarted opportunities cannot use the next day's allowance. Existing saved batches retain their admitted recovery behavior. The host and internet need not be available during the absence; requests run after Villages returns. A compact welcome-back card shows progress and recovery controls. Preparation failures retry once automatically only when no saved request exists; eligible failed replies use the worker's single automatic retry. Retry can make additional model requests. Continue skips only work that can safely be abandoned, while committed effects must finish recovering. The Debug section includes spoiler-bearing accounts for the current and up to 20 previous catch-up periods (fewer if accounts are large), and the development time control. Accounts already overwritten before history was introduced cannot be recovered.

Background work shows progress, failures, and provider-reported usage where available. A quiet result can be valid; the game does not need to invent an event for every interval.

## If something goes wrong

| Problem                       | What to do                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Founding asks for connections | Select available language connections for both **System** and **GM**.                                             |
| A setup suggestion seems lost | Return to Founding; the saved attempt recovers automatically. Use **Retry** only after a confirmed failure.       |
| Preparation stops             | Fix any connection problem, then retry unfinished work under **REPAIR → Recover work**. Completed tasks are kept. |
| A Scene send fails            | Keep or edit the retained draft. An unchanged submission can reuse saved work.                                    |
| Saved output needs applying   | Use **Replay saved work** when offered. This applies saved output without buying another interpretation.          |
| A turn is held with HALT      | Read the notice and rewrite the preserved input. That turn has not become story history.                          |

Failures do not automatically purchase replacement responses. Explicit interpretation, replacement, or generation retries may make another model request. A timed-out or interrupted provider request may already have been billed. Saved results reduce repeated work but cannot guarantee that every response survives a hard server crash.

## Sprite variants and visual settings

**Visual Settings** contains **Menu appearance**, **Random sprite variants**, **Card-flip sprite changes**, **Character chat colors**, **Dynamic Images** and scenery style. Menu appearance defaults to **Day & night**, following Village time, or can stay on **Day** or **Night**. It colors menus and the shared Founding/Scene reader without changing Village time or artwork. Toggles and style presets save immediately; custom style text saves after a short typing pause. Pending edits survive settings navigation, and failed saves retain the latest draft with Retry. The personalization default remains compatible with saved worlds but is no longer exposed here. Random variants and card flips default On; reduced-motion preferences still disable flip animation.

Folder sprites use Engine labels. For `happy_pajamas_wounded`, Villages looks for the full look, then `happy_pajamas`, then `happy` artwork from the assigned sprites. **Random sprite variants** chooses among matches. With it off, Villages uses the first match.

Each new expression cue saves one concrete sprite choice. Turning, refreshing the page, and reading backward use the recorded choices while the selected artwork remains available. Random picks can repeat.

## Settings and saved worlds

In **General Settings**, choose your connections. **Writing Settings** control person, tense, rating, and prose guidance while preserving character identity and the game's rules.

**Send on Enter** defaults Off. Normally, Enter adds a newline. When enabled, Enter sends and Shift+Enter adds a newline.

Progress saves as you play, and refresh restores it. The current test build requires fresh storage and uses **Village format 18** and **Scene format 5**. The new reader rejects older worlds, setup records, Scenes and checkpoints and preserves their stored bytes. Those saves require their matching runtime in separate storage.

Installed package files remain on the Marinara server, but model-driven play still needs a working connection to your configured provider. Before changing or removing a test installation, arrange a backup and confirm how to keep its world with the server operator. **Reset the village and start over** is a separate destructive action.
