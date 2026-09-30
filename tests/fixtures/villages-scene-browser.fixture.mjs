const now = new Date().toISOString();
const image = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000"><rect width="1500" height="1000" fill="${color}"/><path d="M0 500h1500M750 0v1000" stroke="#eee1bf" stroke-width="80"/></svg>`).toString("base64")}`;
const spriteImage = (color) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="700"><circle cx="150" cy="100" r="65" fill="${color}"/><path d="M90 175h120l45 360H45zM105 530h35v170h-45zM160 530h35l45 170h-45z" fill="${color}"/></svg>`).toString("base64")}`;
const residentNames = ["Mara", "Eli", "Lina", "Taro"];
const residents = residentNames.map((name, index) => ({
  characterId: name.toLowerCase(),
  name,
  sprite: {
    assetId: name.toLowerCase(),
    expressions: [],
    images: [
      { view: "front", label: "neutral", url: spriteImage(["#e8ba91", "#a7cdf2", "#d9a8cd", "#bbd59a"][index]) },
    ],
    framing: { mode: "full", cropPercent: 0 },
  },
  summary: "A resident of the village.",
  tags: [],
  missing: false,
  place: null,
}));
const longGreeting =
  "The mill hums softly while dust turns in the late light, and each villager pauses to listen. ".repeat(12);
const mapImage = image("#719b77");
const place = (id, x, y) => ({
  id,
  name: id === "mill" ? "The Mill" : id === "harbour" ? "The Harbour" : "The Market",
  classes: id === "mill" ? ["workplace", "gathering"] : ["other"],
  category: "destination",
  description: "A village place.",
  capabilities: [],
  presentation: { image: { ref: id, url: image(id === "mill" ? "#a77a54" : "#6e91aa"), id }, x, y },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  state: { condition: "sound", upgrades: [], furniture: [], publicFacts: [], updatedAt: now },
});
const snapshot = {
  status: "ready",
  isFounded: true,
  village: {
    name: "QA Village",
    setting: "",
    dateLabel: "Today",
    weekday: "Friday",
    season: "fall",
    dayPhase: "morning",
    instant: now,
    localTime: "7:00 AM",
    minuteOfDay: 420,
    timeZone: "UTC",
    hour: 7,
    minute: 0,
    weather: "clear",
    dayIndex: 1,
    nextTransitionAt: "",
  },
  noticeboard: [{ id: "note-1", text: "Market today", author: "Mara", at: now }],
  venueRequests: [],
  projects: [],
  villageCapabilities: [],
  upgradeRequests: [],
  residences: [],
  happenings: [],
  villagers: residents,
  recap: null,
  settings: {
    promptKnowledge: "",
    defaultPromptKnowledge: "",
    promptBoxMaxLength: 1000,
    storyPace: "normal",
    venues: [place("mill", 0.04, 0.08), place("harbour", 0.96, 0.92), place("market", 0.5, 0.5)],
    homeBuildingNames: {},
    homeBuildings: [],
    defaultHomeBuilding: "small-home",
    playerPersonaId: "",
    playerPersonaName: "",
    playerPersonaMissing: false,
    selectedLorebookIds: [],
    setting: "",
    foundingReason: "",
    foundingDetails: "",
    maxPlaces: 10,
    maxVenueNameLength: 80,
    maxVenueNoteLength: 2000,
    maxVenueImageUrlLength: 2000000,
    maxVenueImageIdLength: 100,
    maxVenueImageBytes: 1000000,
    villageGalleryFolderName: "QA Village",
    visitRetention: { mode: "forever", value: 0 },
    townMapImageSetAt: now,
    townMapExpectedWidth: 1500,
    townMapExpectedHeight: 1000,
    townMapView: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    storyPaces: [],
    macros: [],
  },
};

export { now, image, spriteImage, residents, longGreeting, mapImage, snapshot };
