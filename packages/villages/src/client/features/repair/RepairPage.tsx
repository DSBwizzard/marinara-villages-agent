import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { BackgroundWork, VillageSnapshot } from "../../../shared/contracts/village.js";
import type {
  RepairBrowseItem,
  RepairField,
  RepairPersonSection,
  RepairValue,
  RepairWorldSection,
} from "../../../shared/contracts/repair.js";
import { VillageIcon, type VillageIconName } from "../../shared/VillageIcon.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { StorybookSearchIcon } from "../../shared/StorybookHeading.js";
import { AgendaPlanner } from "../../shared/AgendaPlanner.js";
import { LocationDirectoryRow } from "../../shared/LocationDirectoryRow.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { AvatarFace, readPortraits } from "../residents/ResidentPanels.js";
import { PersonDirectoryCard } from "../residents/PersonDirectoryCard.js";
import { messageFrom } from "../../shared/api.js";
import { letterFontFamily, useLetterFont } from "../../shared/letter-font-css.js";
import type { RepairController } from "./useRepairController.js";
import { PagedText, RepairFieldControl, useRepairSpace } from "./RepairFields.js";
import { REPAIR_STYLES } from "./repair-styles.js";
import { RELATIONSHIP_METER_STYLES } from "../../shared/RelationshipMeters.js";
import { ZoneImageControls } from "../../shared/ZoneImageControls.js";

const areas = [
  ["people", "People", "people"],
  ["places", "Locations", "places"],
  ["world", "World", "world"],
  ["progress", "Recover work", "projects"],
  ["history", "Repair history", "details"],
] as const satisfies readonly (readonly [string, string, VillageIconName])[];
const personSections: [RepairPersonSection, string][] = [
  ["relationships", "Relationships"],
  ["memories", "Memories"],
  ["wishes", "Wishes"],
  ["home", "Home & work"],
  ["agenda", "Agenda"],
  ["details", "Character"],
];
const worldSections: [RepairWorldSection, string][] = [
  ["setting", "Village setting"],
  ["circumstances", "Circumstances"],
  ["conditions", "Conditions"],
  ["weather", "Weather"],
  ["scenes", "Scenes"],
  ["snapshots", "Village snapshots"],
];
const recoverySections: [string, string][] = [
  ["attention", "Needs attention"],
  ["active", "In progress"],
  ["paused", "Paused"],
  ["completed", "Completed"],
];
const short = (text: string) => (text.length > 90 ? text.slice(0, 87) + "…" : text);

function Pages({
  page,
  size,
  total,
  onPage,
  disabled = false,
  offset,
}: {
  page: number;
  size: number;
  total: number;
  onPage(page: number): void;
  disabled?: boolean;
  offset?: number;
}) {
  const last = Math.max(0, Math.ceil(total / size) - 1);
  const current = Math.min(page, last);
  const start = offset ?? current * size;
  return (
    <nav className="repair-pages" aria-label="Pages">
      <span role="status">{total ? `${start + 1}–${Math.min(start + size, total)} of ${total}` : "0 results"}</span>
      <button
        type="button"
        disabled={disabled || start === 0}
        onClick={() => onPage(offset === undefined ? current - 1 : Math.max(0, start - size))}
      >
        Previous
      </button>
      <button
        type="button"
        disabled={disabled || start + size >= total}
        onClick={() => onPage(offset === undefined ? current + 1 : start + size)}
      >
        Next →
      </button>
    </nav>
  );
}
function Sections({
  entries,
  value,
  onChange,
  name,
  disabled,
  mode,
}: {
  entries: [string, string, VillageIconName?][];
  value: string;
  onChange(value: string): void;
  name: string;
  disabled?: boolean;
  mode?: "left" | "phone";
}) {
  return (
    <>
      {mode !== "phone" ? (
        <nav className={mode === "left" ? "repair-notebook-nav" : "repair-sections"} aria-label={name}>
          {entries.map(([id, title, icon]) => (
            <button
              type="button"
              key={id}
              disabled={disabled}
              aria-current={value === id ? "page" : undefined}
              onClick={() => onChange(id)}
            >
              {icon ? <VillageIcon name={icon} /> : null}
              {title}
            </button>
          ))}
        </nav>
      ) : null}
      {mode !== "left" ? (
        <label className="repair-mobile-section">
          <span className="repair-sr">{name}</span>
          <select
            aria-label={name}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          >
            {entries.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}

function AreaChoice({
  area,
  disabled,
  onChange,
  compact = false,
}: {
  area: string;
  disabled: boolean;
  onChange(value: string): void;
  compact?: boolean;
}) {
  return (
    <label className={compact ? "repair-compact-area" : "repair-mobile-area"}>
      <span className="repair-sr">REPAIR area</span>
      <select
        aria-label="REPAIR area"
        disabled={disabled}
        value={area}
        onChange={(event) => onChange(event.target.value)}
      >
        {areas.map(([id, title]) => (
          <option key={id} value={id}>
            {title}
          </option>
        ))}
        <option value="all">Search REPAIR</option>
      </select>
    </label>
  );
}

export function RepairPage({
  controller: c,
  onBack,
  onScene,
  preparation,
  preparationProblem,
  onRetryPreparation,
  jobs = [],
  onRetryWork,
  artwork,
  onCharacterTools,
}: {
  controller: RepairController;
  onBack(): void;
  onScene?(): void;
  preparation?: VillageSnapshot["foundingPreparation"];
  preparationProblem?: string;
  onRetryPreparation?(): Promise<void>;
  jobs?: BackgroundWork[];
  onRetryWork?(job: BackgroundWork): Promise<void>;
  artwork?: import("../../shared/ZoneImageControls.js").ZoneArtworkCommands;
  onCharacterTools?(personId: string): void;
}) {
  const [peopleTab, setPeopleTab] = useState("Villagers"),
    [peopleQuery, setPeopleQuery] = useState(""),
    [peoplePage, setPeoplePage] = useState(0);
  const [placeKind, setPlaceKind] = useState("all"),
    [placeMap, setPlaceMap] = useState(""),
    [placeQuery, setPlaceQuery] = useState(""),
    [placePage, setPlacePage] = useState(0);
  const [placeSection, setPlaceSection] = useState("details"),
    [listPage, setListPage] = useState(0),
    [step, setStep] = useState(0);
  const [memoryFilter, setMemoryFilter] = useState("remembered"),
    [recordQuery, setRecordQuery] = useState("");
  const [historyDetail, setHistoryDetail] = useState<string>();
  const [accountPage, setAccountPage] = useState(0);
  const [deleteSnapshot, setDeleteSnapshot] = useState<string>();
  const [reviewSide, setReviewSide] = useState<"before" | "after">("after");
  const [recoveryFilter, setRecoveryFilter] = useState("attention"),
    [retrying, setRetrying] = useState(""),
    [problem, setProblem] = useState("");
  const [agendaDate, setAgendaDate] = useState("");
  const requestedStep = useRef<{ id: string; step: number | "last" } | undefined>(undefined);
  const [portraits, setPortraits] = useState<Awaited<ReturnType<typeof readPortraits>>>({});
  const space = useRepairSpace();
  const content = useRef<HTMLDivElement>(null);
  const small = space.width < 700,
    compact = space.height / space.scale < 340;
  const proseRows = Math.max(
    1,
    Math.min(
      compact ? 3 : 5,
      Math.floor((space.height / space.scale - (small ? 155 : c.person && c.section === "memories" ? 195 : 140)) / 24),
    ),
  );
  const isSnapshots = c.view === "checkpoints" || c.topic === "restore";
  const inWorld = c.topic === "world" || c.topic === "restore";
  const personSection = c.person && personSections.find(([id]) => id === c.section)?.[1];
  const personCollection = c.person && ["memories", "relationships", "wishes", "details"].includes(c.section);
  const listBudget = isSnapshots
    ? small
      ? 174 + (c.index?.sceneOpen ? 34 : 0) + (deleteSnapshot ? 44 : 0)
      : 140
    : c.topic === "places" && !c.placePath.length
      ? 240
      : personCollection
        ? c.section === "memories"
          ? small
            ? 195
            : 275
          : 185
        : c.topic === "progress"
          ? 150
          : 130;
  const rowHeight = small ? (isSnapshots || c.topic === "progress" ? 100 : 80) : 72;
  const rowSize = Math.max(1, Math.floor((space.height / space.scale - listBudget) / rowHeight));
  const peopleSize = 4;
  const portraitSize = Math.max(40, Math.min(132, (space.height / space.scale - 300) / 2));
  const directory = c.view === "list" && c.collection === "list" && c.topic === "people" && !c.person;
  const isHistory = c.view === "history";
  const area = isHistory ? "history" : isSnapshots ? "world" : c.topic;
  const chooseArea = (next: string) => {
    setRecordQuery("");
    setListPage(0);
    setStep(0);
    setHistoryDetail(undefined);
    setProblem("");
    if (next === "history") void c.showHistory();
    else void c.chooseTopic(next as "people" | "places" | "world" | "progress" | "all");
  };
  const people = (c.index?.people ?? []).filter(
    (person) =>
      (peopleTab === "NPCs"
        ? person.npc
        : peopleTab === "Visitors"
          ? person.visitor
          : !person.npc && !person.visitor) &&
      person.name.toLocaleLowerCase().includes(peopleQuery.toLocaleLowerCase()),
  );
  const currentPeoplePage = Math.min(peoplePage, Math.max(0, Math.ceil(people.length / peopleSize) - 1));
  const visiblePeople = people.slice(currentPeoplePage * peopleSize, (currentPeoplePage + 1) * peopleSize);
  const portraitIds = (c.person ? [c.person.id] : directory ? visiblePeople.map((person) => person.id) : [])
    .filter((id) => id !== "player" && !c.index?.people.find((person) => person.id === id)?.npc)
    .sort()
    .join(",");
  useEffect(() => {
    const abort = new AbortController();
    if (portraitIds)
      void readPortraits(portraitIds.split(","), abort.signal)
        .then((next) => {
          if (!abort.signal.aborted) setPortraits((prior) => ({ ...prior, ...next }));
        })
        .catch(() => {});
    return () => abort.abort();
  }, [portraitIds]);
  useEffect(() => {
    if (c.view === "hub" && c.index) void c.chooseTopic("people");
  }, [c]);
  const placeNodes = c.placeDirectory
    .filter((node) => node.id === "venues" || node.id === "places")
    .flatMap((node) => node.children ?? []);
  const maps = [
    ...new Map(placeNodes.filter((node) => node.mapId).map((node) => [node.mapId!, node.mapName ?? "Map"])).entries(),
  ];
  const locations = placeNodes
    .filter(
      (node) =>
        (!placeMap || node.mapId === placeMap) &&
        (placeKind === "all" || (placeKind === "venues") === (node.icon === "venue")) &&
        node.title.toLocaleLowerCase().includes(placeQuery.toLocaleLowerCase()),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
  const location =
    c.topic === "places" && c.collection === "list"
      ? placeNodes.find((node) => c.placePath.includes(node.id))
      : undefined;
  const zone = location?.children?.find((node) => node.icon === "zone" && c.placePath.includes(node.id));
  const targetPlace = zone ?? location;
  const placeSections: [string, string, VillageIconName][] = zone
    ? [
        ["details", "Details", "details"],
        ["access", "Access & hours", "access"],
        ["connections", "Connections", "compass"],
        ["artwork", "Artwork", "artwork"],
        ["conditions", "Conditions", "projects"],
      ]
    : [
        ["details", "Details", "details"],
        ...(location?.icon === "venue" ? ([["people", "People & roles", "people"]] as typeof placeSections) : []),
        ["zones", "Zones", "zone"],
        ["access", "Access & hours", "access"],
        ["conditions", "Conditions", "projects"],
        ["artwork", "Artwork", "artwork"],
      ];
  const placeNotebook = !!targetPlace && c.view !== "review";
  const mainPlaceRecord = targetPlace?.children?.find((item) =>
    item.id.startsWith(zone ? '["zone-details",' : location?.icon === "venue" ? '["venue",' : '["place",'),
  );
  const choosePlaceSection = (part: string) => {
    c.setPlacePath(c.placePath.slice(0, c.placePath.indexOf(targetPlace!.id) + 1));
    setPlaceSection(part);
    setListPage(0);
    void c.load("places", 0, "", part === "details" ? mainPlaceRecord?.id : undefined);
  };
  const sections =
    c.view === "review"
      ? null
      : c.person
        ? {
            name: "Person repairs",
            entries: personSections.filter(([id]) => id !== "agenda" || c.person?.hasAgenda),
            value: c.section,
            onChange: (part: string) => {
              setRecordQuery("");
              setListPage(0);
              if (part !== c.section) void c.chooseSection(part as RepairPersonSection);
            },
          }
        : placeNotebook
          ? {
              name: "Location repairs",
              entries: placeSections,
              value: placeSection,
              onChange: choosePlaceSection,
            }
          : inWorld
            ? {
                name: "World repairs",
                entries: worldSections,
                value: c.section,
                onChange: (part: string) => {
                  setListPage(0);
                  setStep(0);
                  if (part === "snapshots") void c.chooseTopic("restore");
                  else if (part !== c.section) void c.chooseTopic("world", "", part as RepairWorldSection);
                },
              }
            : c.topic === "progress"
              ? {
                  name: "Recovery status",
                  entries: recoverySections,
                  value: recoveryFilter,
                  onChange: (part: string) => {
                    setRecoveryFilter(part);
                    setListPage(0);
                  },
                }
              : null;
  const openPlace = (node: RepairBrowseItem) => {
    c.setPlacePath(
      node.icon === "zone" ? [...c.placePath, node.id] : [node.icon === "venue" ? "venues" : "places", node.id],
    );
    setPlaceSection("details");
    setListPage(0);
    const record = node.children?.find((item) =>
      item.id.startsWith(node.icon === "zone" ? '["zone-details",' : node.icon === "venue" ? '["venue",' : '["place",'),
    );
    void c.load("places", 0, "", record?.id);
  };
  const backPlace = () => {
    if (zone && location) {
      openPlace(location);
      return;
    }
    c.setPlacePath([]);
    setPlaceSection("details");
    setListPage(0);
    void c.load("places");
  };
  const selected = c.selected;
  const editing = !!selected && !!c.draft && (c.view === "edit" || (c.view === "list" && !!selected.agendaDay));
  const relationshipSection = c.person && c.section === "relationships";
  const isRelationship = selected?.id.startsWith('["relationship",');
  const mainPlaceDetails = !!targetPlace && !!selected && selected.id === mainPlaceRecord?.id;
  const mainWorldSetting = selected?.id === '["world"]';
  const isMemory = selected?.topic === "memories";
  const readOnlyMemory = isMemory && ["forget", "remember"].includes(c.draft?.action ?? "");
  const venueField = c.editorFields.find((field) => field.key.startsWith("venue:"));
  const chosenVenue = selected?.agenda?.venues?.find((venue) => venue.value === c.draft?.values[venueField?.key ?? ""]);
  const fields = c.editorFields.flatMap<RepairField>((field) => {
    if (
      c.draft?.values.scope === "village" &&
      (["venueId", "zoneId"].includes(field.key) || field.key.startsWith("target:"))
    )
      return [];
    if (
      c.topic === "places" &&
      selected?.id.startsWith('["narrative-condition",') &&
      (field.key === "venueId" || (zone && field.key === "zoneId"))
    )
      return [{ ...field, readOnly: true }];
    if (selected?.id === '["snapshot-schedule"]') {
      if (c.draft?.values.frequency === "off" && field.key !== "frequency") return [];
      if (field.key === "weekday" && c.draft?.values.frequency !== "weekly") return [];
    }
    if (field.dependsOn)
      return c.draft?.values[field.dependsOn]
        ? [
            {
              ...field,
              options: field.options?.filter(
                (option) => !option.parent || option.parent === c.draft?.values[field.dependsOn!],
              ),
            },
          ]
        : [];
    if (!selected?.agendaDay)
      return [
        mainPlaceDetails && field.key === "form"
          ? { ...field, label: "Building", multiline: false }
          : mainPlaceDetails && field.key === "description"
            ? { ...field, label: "Description" }
            : field,
      ];
    if (field === venueField)
      return [
        {
          ...field,
          label: "Location",
          options: [{ value: "", label: "No location" }, ...(selected.agenda?.venues ?? [])],
        },
      ];
    if (field.key.startsWith("zone:"))
      return chosenVenue
        ? [{ ...field, options: [{ value: "", label: "Choose automatically" }, ...chosenVenue.zones] }]
        : [];
    return [
      {
        ...field,
        label: field.label
          .replace(/^Activity \d+$/u, "Activity")
          .replace(/^Activity \d+ start$/u, "Start")
          .replace(/^Activity \d+ end$/u, "End"),
      },
    ];
  });
  const fieldGroups = useMemo(() => {
    if (isRelationship) {
      const scores = fields.filter((field) => field.key === "warmth" || field.key === "romance");
      const other = fields.filter((field) => !scores.includes(field));
      if (space.height / space.scale >= 365) return [fields];
      if (space.height / space.scale >= 255) return [scores, ...other.map((field) => [field])];
    }
    if (mainWorldSetting && space.height / space.scale >= (small ? 345 : 355)) {
      return [
        [
          ...fields.filter((field) => ["name", "worldName"].includes(field.key)),
          ...fields.filter((field) => !["name", "worldName"].includes(field.key)),
        ],
      ];
    }
    if (mainPlaceDetails && !small && !compact && space.height / space.scale >= 430) {
      const first = fields.filter((field) => ["name", "form", "description"].includes(field.key));
      const remaining = fields.filter((field) => !first.includes(field));
      if (first.length === 3) return [first, ...remaining.map((field) => [field])];
    }
    if (!compact && selected?.id.startsWith('["work",'))
      return [
        fields.filter((field) => ["venueId", "zoneId", "activity", "inviteGuests"].includes(field.key)),
        fields.filter((field) => ["days", "start", "end"].includes(field.key)),
        ...fields
          .filter((field) => field.key.startsWith("access:"))
          .reduce<RepairField[][]>((groups, field, index) => {
            if (index % 3 === 0) groups.push([]);
            groups.at(-1)!.push(field);
            return groups;
          }, []),
      ].filter((group) => group.length);
    const groups: RepairField[][] = [];
    const proseField = (field: RepairField) =>
      (field.type === "text" && field.multiline !== false) || field.type === "days";
    for (const field of fields) {
      const prior = groups.at(-1);
      if (
        !compact &&
        field.group &&
        prior?.[0]?.group === field.group &&
        !proseField(field) &&
        !prior.some(proseField) &&
        prior.length < (field.type === "boolean" && prior.every((f) => f.type === "boolean") ? 3 : 2) &&
        (space.height / space.scale >= 450 || (selected?.actions.length ?? 0) <= 3)
      ) {
        prior.push(field);
        continue;
      }
      const prose = (field.type === "text" && field.multiline !== false) || field.type === "days";
      if (
        !compact &&
        prior?.length === 1 &&
        !prose &&
        !field.group &&
        !prior[0]!.group &&
        !(prior[0]!.type === "text" && prior[0]!.multiline !== false) &&
        prior[0]!.type !== "days"
      )
        prior.push(field);
      else groups.push([field]);
    }
    if (isMemory && selected?.source.length && space.height < 520)
      groups.push([
        { key: "__evidence", label: "Original conversation", type: "text", value: selected.source.join("\n\n") },
      ]);
    return groups;
  }, [
    fields,
    compact,
    isMemory,
    isRelationship,
    mainWorldSetting,
    selected,
    space.height,
    space.scale,
    mainPlaceDetails,
    small,
  ]);
  const currentStep = Math.min(step, Math.max(0, fieldGroups.length - 1));
  useLayoutEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [
    c.view,
    c.topic,
    c.section,
    c.person?.id,
    c.placePath,
    selected?.id,
    currentStep,
    step,
    listPage,
    c.offset,
    historyDetail,
  ]);
  const groupCount = fieldGroups.length;
  useEffect(() => {
    requestedStep.current = undefined;
  }, [c.topic, c.person?.id, c.section]);
  useEffect(() => {
    if (!selected) return;
    setAccountPage(0);
    const request = requestedStep.current;
    setStep(request?.id === selected.id ? (request.step === "last" ? groupCount - 1 : request.step) : 0);
    requestedStep.current = undefined;
  }, [selected, groupCount]);
  const errorStep = fieldGroups.findIndex((group) => group.some((field) => field.key === c.errorField));
  useEffect(() => {
    if (c.errorField && errorStep >= 0) {
      setStep(errorStep);
      requestAnimationFrame(() => document.getElementById("repair-field-" + c.errorField)?.focus());
    }
  }, [c.errorField, errorStep, c.error]);
  const openPage = (id: string, targetStep: number | "last") => {
    if (id === selected?.id) setStep(targetStep === "last" ? fieldGroups.length - 1 : targetStep);
    else {
      requestedStep.current = { id, step: targetStep };
      void c.open(id);
    }
  };
  const arrangementIndex =
    c.person && c.section === "home" ? c.records.findIndex((record) => record.id === selected?.id) : -1;
  const previousRecord = arrangementIndex > 0 ? c.records[arrangementIndex - 1] : undefined;
  const nextRecord = arrangementIndex >= 0 ? c.records[arrangementIndex + 1] : undefined;
  const arrangementSteps =
    arrangementIndex < 0 || compact
      ? []
      : c.records.flatMap((record) =>
          (record.fields.some((field) => field.key === "homeId")
            ? ["Home", "Sleeping Zone"]
            : ["Work", "Days & times"]
          ).map((label, index) => ({
            record,
            label,
            index,
          })),
        );
  const arrangementStep = arrangementSteps.findIndex(
    (item) => item.record.id === selected?.id && item.index === currentStep,
  );
  const showPageButtons = groupCount > 1 || !!previousRecord || !!nextRecord;
  const stepTitle = (group: RepairField[]) =>
    group.some((field) => field.key === "homeId")
      ? "Home"
      : selected?.id.startsWith('["work",') && !compact
        ? group.some((field) => field.key === "days")
          ? "Days & times"
          : "Work"
        : selected?.id.startsWith('["management",')
          ? "Runs this Venue"
          : group.map((field) => field.label).join(" & ");
  const changeValue = (field: RepairField, value: RepairValue) =>
    c.update({
      values: {
        ...c.draft!.values,
        [field.key]:
          field.key === "timeZone" && value === "" ? Intl.DateTimeFormat().resolvedOptions().timeZone : value,
        ...Object.fromEntries(
          c.editorFields.filter((child) => child.dependsOn === field.key).map((child) => [child.key, ""]),
        ),
        ...(field === venueField ? { [`zone:${field.key.split(":")[1]}`]: "" } : {}),
      },
    });
  const font = String(c.draft?.values.letterFontId ?? "");
  useLetterFont(font || undefined);
  const collectionBesideEditor =
    personCollection &&
    !relationshipSection &&
    space.width >= 1020 &&
    !compact &&
    (c.section === "memories" || c.total > 1);
  let nestedFolder: RepairBrowseItem | undefined;
  let placeChildren = targetPlace?.children ?? [];
  for (const id of c.placePath.slice(c.placePath.indexOf(targetPlace?.id ?? "") + 1)) {
    const folder = placeChildren.find((node) => node.id === id && node.children);
    if (folder) {
      nestedFolder = folder;
      placeChildren = folder.children!;
    }
  }
  const placeItems = placeChildren
    .filter((node) =>
      nestedFolder
        ? true
        : placeSection === "zones"
          ? node.icon === "zone"
          : placeSection === "conditions"
            ? node.title === "Conditions"
            : placeSection === "hours"
              ? node.id.startsWith('["hours-')
              : placeSection === "connections"
                ? node.id.startsWith('["zone-connections",')
                : placeSection === "artwork"
                  ? node.id.startsWith('["zone-artwork",') || node.id.startsWith('["location-artwork",')
                  : placeSection === "access"
                    ? node.icon === "access"
                    : placeSection === "people"
                      ? ["Runs this Venue", "Residents", "Workers"].includes(node.title)
                      : node.icon !== "zone" &&
                        !["Conditions", "Runs this Venue", "Residents", "Workers"].includes(node.title) &&
                        node.icon !== "access" &&
                        !node.id.startsWith('["location-artwork",') &&
                        !node.id.startsWith('["zone-artwork",') &&
                        !node.id.startsWith('["zone-connections",') &&
                        !node.id.startsWith('["new-zone",'),
    )
    .flatMap((node) =>
      ["conditions", "residents", "workers"].includes(placeSection) ? (node.children ?? [node]) : [node],
    );
  const showingEvidence = fieldGroups[currentStep]?.[0]?.key === "__evidence";
  const editorTitle = selected?.agendaDay
    ? "Edit activity"
    : isMemory
      ? selected?.creating
        ? "Add memory"
        : currentStep === 0
          ? "Memory"
          : stepTitle(fieldGroups[currentStep]!)
      : (selected?.title ?? "");
  const collectionSearch =
    c.section === "relationships" ? "Find a relationship" : c.section === "wishes" ? "Find a Wish" : "Find a memory";
  const collection = personCollection ? (
    <section className="repair-card repair-collection" aria-label={personSection}>
      <header className="repair-card-title">
        <h2>{personSection}</h2>
        <div className="repair-collection-tools">
          {c.section === "memories" ? (
            <nav className="repair-actions" aria-label="Memory status">
              {(["Remembered", "Forgotten"] as const).map((label) => {
                const status = label.toLowerCase();
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={memoryFilter === status}
                    onClick={() => {
                      setMemoryFilter(status);
                      void c.searchRecords(recordQuery, 0, status);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          ) : null}
          {c.creation && (c.section === "memories" || c.section === "wishes") ? (
            <button type="button" disabled={c.busy} onClick={() => void c.open(c.creation!.id)}>
              {c.section === "wishes" ? "Add Wish" : "Add memory"}
            </button>
          ) : null}
        </div>
      </header>
      {c.section !== "details" ? (
        <label className="repair-search">
          <StorybookSearchIcon />
          <input
            autoComplete="off"
            type="search"
            aria-label={collectionSearch}
            placeholder={collectionSearch}
            value={recordQuery}
            onChange={(event) => {
              setRecordQuery(event.target.value);
              void c.searchRecords(event.target.value);
            }}
          />
        </label>
      ) : null}
      <div className="repair-record-list">
        {c.records.slice(0, rowSize).map((record) => (
          <button
            type="button"
            key={record.id}
            aria-label={record.title}
            aria-current={editing && selected.id === record.id ? "page" : undefined}
            disabled={c.busy}
            onClick={() => {
              setStep(0);
              void c.open(record.id);
            }}
          >
            <strong>{record.title}</strong>
            {record.summary ? <small>{record.summary}</small> : null}
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {!c.records.length && !c.busy ? (
        <p>
          {recordQuery
            ? "No matches."
            : c.section === "memories"
              ? `No ${memoryFilter} memories.`
              : "Nothing here yet."}
        </p>
      ) : null}
      {c.total > rowSize || c.offset > 0 ? (
        <Pages
          page={0}
          offset={c.offset}
          size={rowSize}
          total={c.total}
          disabled={c.busy}
          onPage={(offset) => void c.searchRecords(recordQuery, offset)}
        />
      ) : null}
    </section>
  ) : null;
  const reviewPageSize = compact ? 1 : small ? 1 : 3;
  const reviewPages = [
    ...(c.review?.changes ?? []),
    ...(c.review?.affected.length
      ? [{ label: "Linked effects", before: "", after: c.review.affected.join("\n") }]
      : []),
  ];
  const reviewStep = Math.min(step, Math.max(0, Math.ceil(reviewPages.length / reviewPageSize) - 1));
  const history = c.index?.history ?? [];
  const historySize = Math.max(1, Math.floor((space.height / space.scale - (small ? 56 : 80)) / (small ? 96 : 66)));
  const historyRow = history.find((entry) => entry.id === historyDetail);
  const days = c.records.flatMap((record) => (record.agenda ? [{ record, ...record.agenda }] : []));
  const visibleJobs = jobs.filter(
    (job) =>
      job.kind !== "personal-mail" &&
      (recoveryFilter === "attention"
        ? ["failed", "interrupted"].includes(job.status)
        : recoveryFilter === "active"
          ? ["queued", "running"].includes(job.status)
          : job.status === recoveryFilter),
  );
  const retry = async (job: BackgroundWork) => {
    setRetrying(job.id);
    setProblem("");
    try {
      await onRetryWork?.(job);
    } catch (cause) {
      setProblem(messageFrom(cause, "Could not retry this work."));
    } finally {
      setRetrying("");
    }
  };

  const searchForm = (className?: string) => (
    <form
      className={className}
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        setListPage(0);
        void c.chooseTopic("all", c.query);
      }}
    >
      <input
        autoComplete="off"
        type="search"
        placeholder="Search REPAIR"
        aria-label="Search REPAIR"
        value={c.query}
        onChange={(event) => c.setQuery(event.target.value)}
      />
    </form>
  );

  return (
    <div className="villages-repair" aria-label="REPAIR">
      <style>{REPAIR_STYLES + RELATIONSHIP_METER_STYLES}</style>
      <header className="repair-chrome">
        <button
          type="button"
          aria-label="← Return to village"
          disabled={c.saving}
          onClick={() => {
            c.leave();
            onBack();
          }}
        >
          <span className="repair-menu-full">← Return to village</span>
          <span className="repair-menu-short" aria-hidden="true">
            ← Village
          </span>
        </button>
        <strong>
          <img
            src="/api/capability-packages/villages/assets/repair-icon.png"
            alt=""
            aria-hidden="true"
            width="36"
            height="36"
          />
          REPAIR
        </strong>
        <span>{c.index?.villageName}</span>
        <AreaChoice area={area} disabled={c.saving} onChange={chooseArea} compact />
        {searchForm()}
      </header>
      <nav className="repair-area-tabs" aria-label="REPAIR areas">
        {areas.map(([id, title, icon]) => (
          <button
            type="button"
            key={id}
            aria-current={area === id ? "page" : undefined}
            disabled={c.saving}
            onClick={() => chooseArea(id)}
          >
            <VillageIcon name={icon} />
            {title}
          </button>
        ))}
      </nav>
      <AreaChoice area={area} disabled={c.saving} onChange={chooseArea} />
      <main className="repair-content">
        {c.person || targetPlace || (inWorld && c.index && c.view !== "review") ? (
          <header className="repair-target">
            {c.person || targetPlace ? (
              <button
                type="button"
                className="repair-back"
                disabled={c.saving}
                onClick={() => (c.person ? void c.chooseTopic("people") : backPlace())}
              >
                {c.person ? "← People" : zone && location ? `← ${location.title}` : "← Locations"}
              </button>
            ) : null}
            {c.person ? (
              <AvatarFace
                name={c.person.name}
                portrait={portraits[c.person.id]}
                className={`${P}-avatar`}
                glyph={c.person.id === "player" ? "person" : "initial"}
              />
            ) : (
              <span className="repair-target-icon">
                <VillageIcon name={inWorld ? "world" : zone ? "zone" : "places"} />
              </span>
            )}
            <div title={c.person?.name ?? targetPlace?.title ?? c.index?.villageName}>
              <h1>{c.person?.name ?? targetPlace?.title ?? c.index?.villageName}</h1>
              <small>
                {c.person
                  ? c.person.npc
                    ? "NPC"
                    : c.person.visitor
                      ? "Visitor"
                      : c.person.id === "player"
                        ? "Your Persona"
                        : "Villager"
                  : inWorld
                    ? "World"
                    : zone
                      ? "Zone"
                      : location?.icon === "venue"
                        ? "Venue"
                        : "Location"}
              </small>
            </div>
          </header>
        ) : (
          <h1 className="repair-context-title">
            {isHistory
              ? "Repair history"
              : isSnapshots
                ? "Village snapshots"
                : editing && selected && !selected.people
                  ? selected.title
                  : (areas.find(([id]) => id === area)?.[1] ?? "Search results")}
          </h1>
        )}
        {area === "all" && !editing && c.view !== "review" ? searchForm("repair-mobile-search") : null}
        {sections ? <Sections {...sections} mode="phone" disabled={c.saving} /> : null}
        {c.error || problem || (selected?.artwork && artwork?.problem) ? (
          <p className="repair-error" role="alert">
            {c.error || problem || artwork?.problem}
          </p>
        ) : null}
        {!c.index ? <p role="status">Opening REPAIR…</p> : null}
        <div className="repair-workspace" data-notebook={placeNotebook} data-sections={!!sections} ref={space.ref}>
          {sections ? <Sections {...sections} mode="left" disabled={c.saving} /> : null}
          <div className="repair-notebook-body" ref={content}>
            {c.view === "review" && c.review ? (
              <section className="repair-review">
                <h2>Review changes</h2>
                {!small ? <p>{short(c.review.title)}</p> : null}
                {reviewPages
                  .slice(reviewStep * reviewPageSize, (reviewStep + 1) * reviewPageSize)
                  .map((change, index) =>
                    change.label === "Linked effects" ? (
                      <section key={index}>
                        <h3>Linked effects</h3>
                        <PagedText label="Linked effects" value={change.after} readOnly rows={proseRows} />
                      </section>
                    ) : (
                      <div className="repair-comparison" data-mobile={small} key={index}>
                        <h3>{change.label}</h3>
                        {small ? (
                          <>
                            <nav className="repair-review-sides" aria-label="Compare change">
                              {(["before", "after"] as const).map((side) => (
                                <button
                                  type="button"
                                  key={side}
                                  aria-pressed={reviewSide === side}
                                  onClick={() => setReviewSide(side)}
                                >
                                  {side === "before" ? "Before" : "After"}
                                </button>
                              ))}
                            </nav>
                            <PagedText
                              label={change.label + " " + reviewSide}
                              value={change[reviewSide] || "None"}
                              readOnly
                              rows={proseRows}
                            />
                          </>
                        ) : (
                          <>
                            <div>
                              <span>Before</span>
                              <PagedText
                                label={`${change.label} before`}
                                value={change.before || "None"}
                                readOnly
                                rows={compact ? 2 : 3}
                              />
                            </div>
                            <div>
                              <span>After</span>
                              <PagedText
                                label={`${change.label} after`}
                                value={change.after || "None"}
                                readOnly
                                rows={compact ? 2 : 3}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ),
                  )}
                {c.review.kind === "restore" ? (
                  <label>
                    <input
                      autoComplete="off"
                      type="checkbox"
                      checked={c.restoreAcknowledged}
                      onChange={(event) => c.setRestoreAcknowledged(event.target.checked)}
                    />{" "}
                    Replace Village progress with this snapshot
                  </label>
                ) : null}
                <Pages page={reviewStep} size={reviewPageSize} total={reviewPages.length} onPage={setStep} />
              </section>
            ) : c.view === "loading" ? (
              <section className="repair-card" aria-busy={c.busy}>
                {c.busy ? (
                  <span role="status">Loading…</span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      c.retrySavedRefresh
                        ? void c.retrySavedRefresh()
                        : void c.load(
                            c.topic,
                            c.offset,
                            recordQuery,
                            placeNotebook && placeSection === "details" && !nestedFolder
                              ? mainPlaceRecord?.id
                              : undefined,
                          )
                    }
                  >
                    Try again
                  </button>
                )}
              </section>
            ) : c.view === "restored" ? (
              <section className="repair-card">
                <h2>Village restored</h2>
                {c.preservedDraft ? (
                  <PagedText label={c.preservedDraft.title} value={c.preservedDraft.text} readOnly />
                ) : null}
                <button type="button" onClick={() => void c.load()}>
                  Village snapshots
                </button>
              </section>
            ) : directory ? (
              <section
                className="repair-directory repair-people-directory"
                data-compact={space.height / space.scale < 420}
                style={{ "--repair-portrait-size": `${portraitSize}px` } as CSSProperties}
              >
                <Sections
                  name="People categories"
                  entries={["Villagers", "Visitors", "NPCs"].map((title) => [title, title])}
                  value={peopleTab}
                  onChange={(tab) => {
                    setPeopleTab(tab);
                    setPeoplePage(0);
                  }}
                />
                <label className="repair-search">
                  <StorybookSearchIcon />
                  <input
                    autoComplete="off"
                    type="search"
                    aria-label="Find a person"
                    placeholder="Find a person"
                    value={peopleQuery}
                    onChange={(event) => {
                      setPeopleQuery(event.target.value);
                      setPeoplePage(0);
                    }}
                  />
                </label>
                <div className={`${P}-directory-grid`}>
                  {visiblePeople.map((person) => (
                    <PersonDirectoryCard
                      key={person.id}
                      name={person.name}
                      portrait={portraits[person.id]}
                      disabled={c.busy}
                      label={`Repair ${person.name}`}
                      onOpen={() => {
                        setRecordQuery("");
                        void c.choosePerson(person);
                      }}
                    />
                  ))}
                </div>
                <Pages page={currentPeoplePage} size={peopleSize} total={people.length} onPage={setPeoplePage} />
              </section>
            ) : c.topic === "places" && !targetPlace ? (
              <section className="repair-directory repair-locations">
                <div className="repair-location-filters">
                  <select
                    aria-label="Filter by map"
                    value={placeMap}
                    onChange={(event) => {
                      setPlaceMap(event.target.value);
                      setPlacePage(0);
                    }}
                  >
                    <option value="">All maps</option>
                    {maps.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <label className="repair-search">
                    <StorybookSearchIcon />
                    <input
                      autoComplete="off"
                      type="search"
                      aria-label="Search known locations"
                      placeholder="Search known locations"
                      value={placeQuery}
                      onChange={(event) => {
                        setPlaceQuery(event.target.value);
                        setPlacePage(0);
                      }}
                    />
                  </label>
                </div>
                <Sections
                  name="Location categories"
                  entries={[
                    ["all", "All"],
                    ["venues", `Venues ${placeNodes.filter((node) => node.icon === "venue").length}`],
                    ["other", `Other locations ${placeNodes.filter((node) => node.icon !== "venue").length}`],
                  ]}
                  value={placeKind}
                  onChange={(kind) => {
                    setPlaceKind(kind);
                    setPlacePage(0);
                  }}
                />
                <div className={`${P}-locations-group`}>
                  <header className="repair-list-heading">
                    <h2>Known locations</h2>
                    <small>A–Z</small>
                  </header>
                  <ul>
                    {locations
                      .slice(
                        Math.min(placePage, Math.max(0, Math.ceil(locations.length / rowSize) - 1)) * rowSize,
                        (Math.min(placePage, Math.max(0, Math.ceil(locations.length / rowSize) - 1)) + 1) * rowSize,
                      )
                      .map((node) => (
                        <li key={node.id}>
                          <LocationDirectoryRow
                            id={node.id}
                            name={node.title}
                            mapName={node.mapName}
                            venue={node.icon === "venue"}
                            onOpen={() => openPlace(node)}
                          />
                        </li>
                      ))}
                  </ul>
                </div>
                <Pages page={placePage} size={rowSize} total={locations.length} onPage={setPlacePage} />
              </section>
            ) : isHistory ? (
              historyRow ? (
                <section className="repair-card">
                  <button type="button" onClick={() => setHistoryDetail(undefined)}>
                    ← Repair history
                  </button>
                  <h2>{short(historyRow.title)}</h2>
                  <PagedText
                    label="Repair details"
                    readOnly
                    value={historyRow.changes
                      .map((change) => `${change.label}\n${change.before || "None"} → ${change.after || "None"}`)
                      .join("\n\n")}
                    rows={compact ? 3 : 8}
                  />
                </section>
              ) : (
                <section className="repair-directory">
                  <table className="repair-history" role="table" aria-label="Repairs">
                    <thead role="rowgroup">
                      <tr role="row">
                        <th scope="col">When</th>
                        <th scope="col">Action</th>
                        <th scope="col">Target</th>
                        <th scope="col">Change</th>
                      </tr>
                    </thead>
                    <tbody role="rowgroup">
                      {history.slice(0, historySize).map((entry) => (
                        <tr role="row" key={entry.id}>
                          <td>
                            {new Date(entry.at).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>{entry.action ?? "Updated"}</td>
                          <td>
                            <button type="button" aria-label={entry.title} onClick={() => setHistoryDetail(entry.id)}>
                              {short(entry.title)}
                            </button>
                          </td>
                          <td>
                            {short(
                              entry.changes
                                .map(
                                  (change) => `${change.label}: ${change.before || "None"} → ${change.after || "None"}`,
                                )
                                .join(", "),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!history.length ? <p>No repairs yet.</p> : null}
                  <Pages
                    page={0}
                    offset={c.index?.historyOffset ?? 0}
                    size={historySize}
                    total={c.index?.historyTotal ?? 0}
                    onPage={(offset) => void c.historyPage(offset)}
                  />
                </section>
              )
            ) : isSnapshots && !editing ? (
              <section className="repair-directory">
                <button
                  type="button"
                  disabled={c.busy}
                  onClick={() => void c.open('["snapshot-schedule"]')}
                >
                  Snapshot schedule →
                </button>
                <form
                  autoComplete="off"
                  className="repair-snapshot-create"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void c.saveCheckpoint();
                  }}
                >
                  <input
                    autoComplete="off"
                    aria-label="Snapshot name"
                    placeholder="Snapshot name"
                    maxLength={120}
                    value={c.checkpointTitle}
                    onChange={(event) => c.setCheckpointTitle(event.target.value)}
                  />
                  <button type="submit" disabled={c.busy}>
                    Save snapshot
                  </button>
                </form>
                <div className="repair-record-list">
                  {c.index?.checkpoints.slice(0, rowSize).map((snapshot) => (
                    <div className="repair-snapshot-row" key={snapshot.id}>
                      <button
                        type="button"
                        disabled={c.busy || c.index?.sceneOpen}
                        onClick={() => {
                          setStep(0);
                          void c.restore(snapshot.id);
                        }}
                      >
                        <strong>{snapshot.title}</strong>
                        <small>{new Date(snapshot.at).toLocaleString()}</small>
                        <small>
                          {snapshot.mode === "scheduled"
                            ? "Scheduled"
                            : snapshot.mode === "manual"
                              ? "Manual"
                              : snapshot.title === "Before checkpoint restoration"
                                ? "Before restore"
                                : "Before repair"}
                          {snapshot.villageAt ? `, Village time ${new Date(snapshot.villageAt).toLocaleString()}` : ""}
                        </small>
                        <span>Review restore →</span>
                      </button>
                      {deleteSnapshot === snapshot.id ? (
                        <>
                          <button
                            type="button"
                            disabled={c.busy}
                            onClick={() => {
                              void c.deleteCheckpoint(snapshot.id, snapshot.token);
                              setDeleteSnapshot(undefined);
                            }}
                          >
                            Delete snapshot
                          </button>
                          <button
                            type="button"
                            className="repair-snapshot-confirm"
                            onClick={() => setDeleteSnapshot(undefined)}
                          >
                            Keep snapshot
                          </button>
                        </>
                      ) : snapshot.mode !== "automatic" ? (
                        <button
                          type="button"
                          aria-label={"Delete " + snapshot.title}
                          disabled={c.busy}
                          onClick={() => setDeleteSnapshot(snapshot.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <Pages
                  page={0}
                  offset={c.index?.checkpointOffset ?? 0}
                  size={rowSize}
                  total={c.index?.checkpointTotal ?? 0}
                  onPage={(offset) => void c.checkpointPage(offset)}
                />
                {c.index?.sceneOpen ? <p>Conclude the Scene to restore.</p> : null}
              </section>
            ) : editing && selected.people && !c.person ? (
              <section className="repair-directory">
                <h2>Whose memory?</h2>
                <div className={P + "-directory-grid"}>
                  {selected.people.slice(accountPage * peopleSize, (accountPage + 1) * peopleSize).map((account) => {
                    const person = c.index?.people.find((entry) => entry.id === account.id);
                    return person ? (
                      <PersonDirectoryCard
                        key={person.id}
                        name={person.name}
                        portrait={portraits[person.id]}
                        label={"Repair " + person.name}
                        onOpen={() => void c.choosePerson(person, "memories", selected.id)}
                      />
                    ) : null;
                  })}
                </div>
                <Pages page={accountPage} size={peopleSize} total={selected.people.length} onPage={setAccountPage} />
              </section>
            ) : editing ? (
              <div className="repair-editor" data-collection={collectionBesideEditor || undefined}>
                {c.person && c.section === "home" ? (
                  <label className="repair-mobile-record">
                    <span className="repair-sr">Home and work section</span>
                    <select
                      aria-label="Home and work section"
                      disabled={c.busy}
                      value={selected.id}
                      onChange={(event) => void c.open(event.target.value)}
                    >
                      {c.records.map((record) => (
                        <option key={record.id} value={record.id}>
                          {record.id.startsWith('["home",') ? "Home" : record.title}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                {collectionBesideEditor ? (
                  collection
                ) : showPageButtons && !relationshipSection ? (
                  <nav className="repair-steps" aria-label="Form sections">
                    {arrangementSteps.length
                      ? arrangementSteps
                          .map((item, index) => ({ ...item, ordinal: index }))
                          .slice(Math.floor(arrangementStep / 4) * 4, Math.floor(arrangementStep / 4) * 4 + 4)
                          .map(({ record, label, index, ordinal }) => (
                            <button
                              type="button"
                              key={record.id + index}
                              disabled={c.busy}
                              aria-current={record.id === selected.id && currentStep === index ? "step" : undefined}
                              onClick={() => openPage(record.id, index)}
                            >
                              <span>{ordinal + 1}</span>
                              {label}
                            </button>
                          ))
                      : fieldGroups
                          .map((group, index) => ({ group, index }))
                          .slice(Math.floor(currentStep / 4) * 4, Math.floor(currentStep / 4) * 4 + 4)
                          .map(({ group, index }) => (
                            <button
                              type="button"
                              key={index}
                              aria-current={currentStep === index ? "step" : undefined}
                              onClick={() => setStep(index)}
                            >
                              <span>{index + 1}</span>
                              {stepTitle(group)}
                            </button>
                          ))}
                  </nav>
                ) : null}
                <section className="repair-card">
                  {relationshipSection && (c.total > 1 || c.offset > 0) ? (
                    <div className="repair-relationship-target">
                      {isRelationship && c.person?.id !== "player" ? <strong>{c.person?.name} →</strong> : null}
                      <select
                        aria-label="Relationship with"
                        disabled={c.busy}
                        value={selected.id}
                        onChange={(event) => void c.open(event.target.value)}
                      >
                        {(c.records.some((row) => row.id === selected.id) ? c.records : [selected, ...c.records]).map(
                          (row) => (
                            <option key={row.id} value={row.id}>
                              {c.person?.id === "player" ? row.title : row.title.replace(`${c.person?.name} → `, "")}
                            </option>
                          ),
                        )}
                      </select>
                      {c.total > 50 || c.offset > 0 ? (
                        <Pages
                          page={0}
                          size={50}
                          offset={c.offset}
                          total={c.total}
                          disabled={c.busy}
                          onPage={(offset) => void c.searchRecords("", offset)}
                        />
                      ) : null}
                    </div>
                  ) : null}
                  {!(relationshipSection && (c.total > 1 || c.offset > 0)) ? (
                    <header className="repair-card-title">
                      <h2>
                        {mainWorldSetting
                          ? "Village setting"
                          : mainPlaceDetails
                            ? "Details"
                            : isRelationship
                              ? selected.title
                              : isMemory
                                ? editorTitle
                                : fieldGroups[currentStep]
                                  ? stepTitle(fieldGroups[currentStep]!)
                                  : editorTitle}
                      </h2>
                      {(arrangementSteps.length || groupCount) > 1 ? (
                        <small>
                          {arrangementSteps.length ? arrangementStep + 1 : currentStep + 1} of{" "}
                          {arrangementSteps.length || groupCount}
                        </small>
                      ) : null}
                      {!(c.person && c.section === "home") &&
                      !mainPlaceDetails &&
                      !relationshipSection &&
                      !mainWorldSetting &&
                      !(inWorld && c.section === "weather") ? (
                        <button
                          type="button"
                          className="repair-close"
                          data-collection={personCollection || undefined}
                          aria-label={`Back to ${personSection || (targetPlace ? placeSection : "records")}`}
                          disabled={c.busy}
                          onClick={() =>
                            void c.load(
                              c.topic,
                              c.offset,
                              recordQuery,
                              placeNotebook && placeSection === "details" && !nestedFolder
                                ? mainPlaceRecord?.id
                                : undefined,
                            )
                          }
                        >
                          {personCollection ? "← Back" : "×"}
                        </button>
                      ) : null}
                    </header>
                  ) : null}
                  {placeNotebook && placeSection === "details" && placeItems.length > 1 ? (
                    <label className="repair-field">
                      Edit
                      <select
                        aria-label="Details item"
                        disabled={c.busy}
                        value={selected.id}
                        onChange={(event) => void c.open(event.target.value)}
                      >
                        {placeItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.id === mainPlaceRecord?.id
                              ? zone
                                ? "Zone settings"
                                : "Details"
                              : item.id.startsWith('["room",')
                                ? "Room detail: " + short(item.summary || item.title)
                                : item.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {!showingEvidence && selected.actions.length > 3 ? (
                    <label className="repair-field">
                      Action
                      <select
                        aria-label="Repair action"
                        disabled={c.busy}
                        value={c.draft.action}
                        onChange={(event) =>
                          c.update({
                            action: event.target.value,
                            ...(event.target.value === "teach" ? { knowers: [] } : {}),
                          })
                        }
                      >
                        {selected.actions.map((action) => (
                          <option key={action.id} value={action.id}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : !showingEvidence && selected.actions.length > 1 ? (
                    <div className="repair-actions">
                      {selected.actions.map((action) => (
                        <button
                          type="button"
                          key={action.id}
                          aria-pressed={c.draft!.action === action.id}
                          disabled={c.busy}
                          onClick={() =>
                            c.update({ action: action.id, ...(action.id === "teach" ? { knowers: [] } : {}) })
                          }
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {showingEvidence ? (
                    <PagedText
                      label="Original conversation"
                      value={selected.source.join("\n\n")}
                      readOnly
                      rows={proseRows}
                    />
                  ) : c.draft.action === "teach" ? (
                    <label className="repair-field">
                      Add person
                      <select
                        aria-label="Add person"
                        value={c.draft.knowers[0] ?? ""}
                        onChange={(event) => c.update({ knowers: event.target.value ? [event.target.value] : [] })}
                      >
                        <option value="">Choose a person</option>
                        {selected.recipients?.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : fieldGroups[currentStep]?.[0]?.key === "__tools" && onCharacterTools ? (
                    <button
                      type="button"
                      disabled={c.busy || c.canReview}
                      onClick={() => onCharacterTools(JSON.parse(selected.id)[1])}
                    >
                      Character tools →
                    </button>
                  ) : selected.artwork && fieldGroups[currentStep]?.[0]?.key === "image" && artwork ? (
                    <ZoneImageControls
                      name={selected.title}
                      imageUrl={selected.artwork.imageUrl}
                      canGenerate={selected.artwork.canGenerate}
                      disabled={c.busy || !!artwork.placeBusyId || c.canReview}
                      onGenerate={() =>
                        void artwork
                          .drawPlaceImage(selected.artwork!.locationId, selected.artwork!.zoneId)
                          .then(() => c.refreshSelected())
                      }
                      onUpload={(file) =>
                        void artwork
                          .keepPlaceImage(selected.artwork!.locationId, selected.artwork!.zoneId, file)
                          .then(() => c.refreshSelected())
                      }
                      onRemove={() =>
                        void artwork
                          .dropPlaceImage(selected.artwork!.locationId, selected.artwork!.zoneId)
                          .then(() => c.refreshSelected())
                      }
                    />
                  ) : readOnlyMemory ? (
                    <PagedText
                      label="Memory"
                      value={String(selected.fields[0]?.value ?? "")}
                      readOnly
                      rows={proseRows}
                    />
                  ) : (
                    <div
                      className="repair-fields"
                      data-columns={
                        (selected.id.startsWith('["work",') && !compact) ||
                        (mainPlaceDetails && fieldGroups[currentStep]?.length === 3) ||
                        (mainWorldSetting && fieldGroups[currentStep]?.length === 4)
                      }
                      data-world={mainWorldSetting || undefined}
                    >
                      {fieldGroups[currentStep]?.map((field) => (
                        <RepairFieldControl
                          key={`${c.person?.id ?? selected.account?.personId ?? ""}:${selected.id}:${c.draft.action}:${field.key}`}
                          field={field}
                          value={c.draft!.values[field.key] ?? field.value}
                          disabled={c.busy}
                          error={c.errorField === field.key ? c.error : undefined}
                          onChange={(value) => changeValue(field, value)}
                          rows={mainWorldSetting && fieldGroups[currentStep]?.length === 4 ? 2 : proseRows}
                          hideLabel={
                            !placeNotebook &&
                            !isRelationship &&
                            fieldGroups[currentStep]?.length === 1 &&
                            (isMemory || stepTitle(fieldGroups[currentStep]!) === field.label)
                          }
                        />
                      ))}
                    </div>
                  )}
                  {fields.some((field) => field.key === "letterFontId") ? (
                    <p style={{ fontFamily: letterFontFamily(font) }}>
                      Dear friend, I hope this letter finds you well.
                    </p>
                  ) : null}
                  {isMemory && selected.source.length && space.height >= 520 ? (
                    <section className="repair-evidence">
                      <h3>Original conversation</h3>
                      <PagedText label="Original conversation" readOnly value={selected.source.join("\n\n")} rows={3} />
                    </section>
                  ) : null}
                  {!fields.length && selected.source.length ? (
                    <PagedText
                      label="Current state"
                      readOnly
                      value={selected.source.join("\n\n")}
                      rows={compact ? 3 : 6}
                    />
                  ) : null}
                </section>
              </div>
            ) : c.topic === "places" && targetPlace ? (
              <section className="repair-directory">
                <h2>{placeSections.find(([id]) => id === placeSection)?.[1] ?? "Details"}</h2>
                {nestedFolder ? (
                  <button type="button" onClick={() => c.setPlacePath(c.placePath.slice(0, -1))}>
                    ← {placeSection === "access" ? "Access" : "Back"}
                  </button>
                ) : null}
                <div className={placeSection === "zones" ? `${P}-venue-zones` : "repair-record-list"}>
                  {placeSection === "zones" && location ? (
                    <button
                      type="button"
                      disabled={c.busy}
                      onClick={() => void c.open(JSON.stringify(["new-zone", JSON.parse(location.id)[2]]))}
                    >
                      Add Zone
                    </button>
                  ) : null}
                  {placeItems.slice(listPage * rowSize, (listPage + 1) * rowSize).map((item) =>
                    placeSection === "zones" ? (
                      <VenueZoneRow
                        key={item.id}
                        id={item.id}
                        name={item.title}
                        image={item.image}
                        onOpen={() => openPlace(item)}
                      />
                    ) : (
                      <button
                        type="button"
                        key={item.id}
                        aria-label={item.title}
                        disabled={c.busy}
                        onClick={() =>
                          item.personId
                            ? void c.choosePerson(
                                c.index!.people.find((person) => person.id === item.personId)!,
                                "home",
                              )
                            : item.children
                              ? (c.setPlacePath([...c.placePath, item.id]), setListPage(0))
                              : void c.open(item.id)
                        }
                      >
                        <strong>{item.title}</strong>
                        {item.summary ? <small>{short(item.summary)}</small> : null}
                        <span>›</span>
                      </button>
                    ),
                  )}
                </div>
                {!placeItems.length ? (
                  <p>
                    No {placeSection === "conditions" ? "conditions" : "records"} for {targetPlace.title}.
                  </p>
                ) : null}
                <Pages page={listPage} size={rowSize} total={placeItems.length} onPage={setListPage} />
              </section>
            ) : c.topic === "people" && c.section === "agenda" ? (
              <section className="repair-directory">
                <AgendaPlanner
                  days={days}
                  date={agendaDate}
                  disabled={c.busy}
                  pageSize={Math.max(1, Math.floor((space.height / space.scale - (small ? 200 : 175)) / 55))}
                  onDate={(date) => setAgendaDate(date)}
                  onActivity={(day, block) => {
                    const record = days.find((entry) => entry.date === day.date)?.record;
                    if (block.repairRecordId) void c.open(block.repairRecordId);
                    else if (record && block.repairIndex !== undefined)
                      void c.open(record.id, { index: block.repairIndex, token: record.token });
                    else setProblem("This saved commitment has no current booking.");
                  }}
                  renderDayAction={(day) => (
                    <>
                      {c.records.some((r) => r.id === JSON.stringify(["routine", c.person?.id])) ? (
                        <button
                          type="button"
                          disabled={c.busy}
                          onClick={() => void c.open(JSON.stringify(["routine", c.person?.id]))}
                        >
                          Routine
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={c.busy}
                        onClick={() => {
                          const record = days.find((entry) => entry.date === day.date)?.record;
                          if (record) void c.open(record.id, { index: "new", token: record.token });
                        }}
                      >
                        Add activity
                      </button>
                    </>
                  )}
                />
              </section>
            ) : personCollection ? (
              collection
            ) : (
              <section className="repair-directory">
                {c.topic === "progress" ? (
                  <>
                    {recoveryFilter === "attention" && preparation?.status === "failed" && onRetryPreparation ? (
                      <section className="repair-recovery-row" aria-label="Initial preparation">
                        <strong>Initial preparation</strong>
                        {preparation.error ? <span>{preparation.error}</span> : null}
                        <button type="button" onClick={() => void onRetryPreparation()}>
                          Retry unfinished work
                        </button>
                        {preparationProblem ? <p role="alert">{preparationProblem}</p> : null}
                      </section>
                    ) : null}
                    <div className="repair-record-list">
                      {visibleJobs.slice(listPage * rowSize, (listPage + 1) * rowSize).map((job) => (
                        <div key={job.id} className="repair-recovery-row">
                          <strong>{job.kind === "resident-planning" ? "Resident activity" : job.label}</strong>
                          <span>{job.status}</span>
                          {job.error ? <span className="repair-recovery-problem">{short(job.error)}</span> : null}
                          {["failed", "interrupted", "paused"].includes(job.status) && onRetryWork ? (
                            <button type="button" disabled={!!retrying} onClick={() => void retry(job)}>
                              {retrying === job.id
                                ? "Queuing…"
                                : job.status === "paused"
                                  ? "Run now"
                                  : "Retry unfinished work"}
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                {c.topic === "world" ? <h2>{worldSections.find(([id]) => id === c.section)?.[1]}</h2> : null}
                <div className="repair-record-list">
                  {c.records.slice(0, rowSize).map((record) => (
                    <button
                      type="button"
                      key={record.id}
                      aria-label={record.title}
                      onClick={() => {
                        setStep(0);
                        void c.open(record.id);
                      }}
                    >
                      <strong>{short(record.title)}</strong>
                      <small>{record.summary}</small>
                      <span>›</span>
                    </button>
                  ))}
                </div>
                {!c.records.length && !visibleJobs.length && !c.busy ? <p>No records here.</p> : null}
                {c.topic === "progress" && !c.records.length ? (
                  <Pages page={listPage} size={rowSize} total={visibleJobs.length} onPage={setListPage} />
                ) : c.total > rowSize || c.offset > 0 ? (
                  <Pages
                    page={0}
                    offset={c.offset}
                    size={rowSize}
                    total={c.total}
                    onPage={(offset) => void c.searchRecords(recordQuery, offset)}
                  />
                ) : null}
              </section>
            )}
          </div>
        </div>
      </main>
      <footer className="repair-footer" data-active={editing || c.view === "review"}>
        {c.view === "review" ? (
          <>
            <button type="button" onClick={c.backFromReview} disabled={c.busy}>
              Back
            </button>
            <button
              type="button"
              className="repair-primary"
              disabled={c.busy || (c.review?.kind === "restore" && !c.restoreAcknowledged)}
              onClick={() => void c.apply()}
            >
              {c.saving ? "Saving…" : c.review?.kind === "restore" ? "Restore Village" : "Save changes"}
            </button>
          </>
        ) : editing ? (
          <>
            <span role="status">{c.canReview ? "Unsaved changes" : c.notice || "No changes"}</span>
            {showPageButtons ? (
              <button
                type="button"
                className="repair-page-nav"
                aria-label="Previous"
                disabled={c.busy || (currentStep === 0 && !previousRecord)}
                onClick={() =>
                  currentStep ? setStep(currentStep - 1) : previousRecord && openPage(previousRecord.id, "last")
                }
              >
                <span className="repair-page-word">Previous</span>
                <span className="repair-page-arrow" aria-hidden="true">
                  ←
                </span>
              </button>
            ) : null}
            <button type="button" onClick={c.discard} disabled={c.busy}>
              Discard
            </button>
            <button
              type="button"
              className="repair-primary"
              disabled={c.busy || !c.canReview}
              onClick={() => {
                setStep(0);
                void c.prepare();
              }}
            >
              Review changes
            </button>
            {showPageButtons ? (
              <button
                type="button"
                className="repair-page-nav"
                aria-label="Next"
                disabled={c.busy || (currentStep + 1 >= fieldGroups.length && !nextRecord)}
                onClick={() =>
                  currentStep + 1 < fieldGroups.length
                    ? setStep(currentStep + 1)
                    : nextRecord && openPage(nextRecord.id, 0)
                }
              >
                <span className="repair-page-word">Next</span>
                <span className="repair-page-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ) : null}
          </>
        ) : (
          <>
            <span role="status">{c.busy ? "Working…" : c.notice}</span>
            {onScene ? (
              <button
                type="button"
                onClick={() => {
                  c.leave();
                  onScene();
                }}
              >
                Back to Scene
              </button>
            ) : null}
          </>
        )}
      </footer>
    </div>
  );
}
