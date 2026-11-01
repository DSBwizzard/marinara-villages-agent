# Villages

A text-first life sim for [Marinara Engine](https://github.com/Pasta-Devs/Marinara-Engine), built around your Persona and characters from your library. Make a home together, visit your neighbors, build relationships, and help shape the place where you live.

A Village can be a small town, a space station, a workplace, or another shared setting. You describe the place and choose its first residents. Their routines, Wishes, and your conversations give you reasons to come back.

## What you can do

- Create a place with its own map, homes, and community spaces.
- Visit residents and talk or act in ongoing Scenes.
- Learn about people through shared experiences, memories, and relationships.
- Work with residents on Projects that create or renovate places.
- Return later to a Village whose clock and construction have kept moving.

Conversations keep the moment when they began, so taking a break does not turn a morning chat into a conversation days later. Conclude the Scene when you are ready to rejoin the Village's current day.

## Status and access

**Villages is an unreleased prototype.** There is no public installer or Villages entry in Engine's official **Download Agents** catalog yet. Access currently requires an arranged test installation. Older tagged downloads are historical snapshots, not a supported installer for the current prototype.

For a test installation, the person running your Marinara server needs to install the agreed Villages build on that server. After installation, restart Engine and open **Home → Villages**. The GitHub source-code ZIP is not an installable Villages package.

## Before you start

You need:

- Marinara Engine **2.5.0 or later, before 4.0.0**, with the test package's required capabilities. Engine checks package compatibility during installation.
- A configured language-model connection. You must explicitly select connections for both **System** and **Narration**; they can use the same connection.
- A Persona and one to three starting characters in your Engine library.
- Map artwork, either uploaded or generated with an image connection. Image generation is optional if you supply your own artwork.

Model requests use your configured providers and may cost money, including during founding and background resident activity. You can turn automatic resident activity off while keeping local time and construction running.

## Your first Village

1. Open **Home → Villages** after your test installation has restarted.
2. In **Place**, describe your setting and choose **System**, **Narration**, and any **Images** connection.
3. Choose your Persona and starting residents in **People**.
4. Add a map, prepare the homes and community Venue, then review and found the Village.
5. Open a Venue from the map, choose **Visit**, and use **Say / Do** to begin interacting.

The [player guide](packages/villages/README.md) walks through setup, Scenes, relationships, Projects, artwork, and recovery.

## Saved worlds and test updates

The current prototype requires a fresh **Village save format 13** and uses **Scene format 3**. No older Village conversion is provided. Keep older worlds with their matching runtime, and arrange independent fresh storage before testing an incompatible build. Installing a package does not reset a world.

## Development and contributions

See [DEVELOPMENT.md](DEVELOPMENT.md) for building, checks, and test operations, and [architecture and compatibility](docs/architecture-migration.md) for technical contracts. [Upstream contribution guidance](docs/upstream-contribution.md) explains the separate process for a future Marinara-Agents submission.
