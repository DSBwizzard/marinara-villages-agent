import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { BackgroundWork, VillageSnapshot } from "../../../shared/contracts/village.js";
import type {
  RepairBrowseItem,
  RepairField,
  RepairPersonSection,
  RepairValue,
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
}: {
  entries: [string, string][];
  value: string;
  onChange(value: string): void;
  name: string;
  disabled?: boolean;
}) {
  return (
    <>
      <nav className="repair-sections" aria-label={name}>
        {entries.map(([id, title]) => (
          <button
            type="button"
            key={id}
            disabled={disabled}
            aria-current={value === id ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            {title}
          </button>
        ))}
      </nav>
      <label className="repair-mobile-section">
        <span className="repair-sr">{name}</span>
        <select aria-label={name} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {entries.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </label>
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
        {area === "all" ? <option value="all">Search results</option> : null}
        {areas.map(([id, title]) => (
          <option key={id} value={id}>
            {title}
          </option>
        ))}
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
  const pendingMemory = useRef<{ id: string; personId: string } | undefined>(undefined);
  const [reviewSide, setReviewSide] = useState<"before" | "after">("after");
  const [recoveryFilter, setRecoveryFilter] = useState("attention"),
    [retrying, setRetrying] = useState(""),
    [problem, setProblem] = useState("");
  const [agendaDate, setAgendaDate] = useState("");
  const requestedStep = useRef<{ id: string; step: number | "last" } | undefined>(undefined);
  const [portraits, setPortraits] = useState<Awaited<ReturnType<typeof readPortraits>>>({});
  const space = useRepairSpace();
  const small = space.width < 700,
    compact = space.height / space.scale < 340;
  const proseRows = Math.max(
    1,
    Math.min(
      compact ? 3 : 5,
      Math.floor((space.height / space.scale - (c.person && c.section === "memories" ? 195 : 140)) / 24),
    ),
  );
  const listBudget =
    c.view === "checkpoints" || c.topic === "restore"
      ? 140
      : c.topic === "places" && !c.placePath.length
        ? 240
        : c.person && c.section === "memories" && c.view === "list"
          ? 260
          : c.topic === "progress"
            ? 150
            : 130;
  const rowSize = Math.max(1, Math.floor((space.height - listBudget) / (72 * space.scale)));
  const peopleSize = 4;
  const portraitSize = Math.max(40, Math.min(132, (space.height / space.scale - 300) / 2));
  const directory = c.view === "list" && c.collection === "list" && c.topic === "people" && !c.person;
  const isHistory = c.view === "history";
  const isSnapshots = c.view === "checkpoints" || c.topic === "restore";
  const area = isHistory ? "history" : isSnapshots ? "world" : c.topic;
  const chooseArea = (next: string) => {
    pendingMemory.current = undefined;
    setRecordQuery("");
    setListPage(0);
    setStep(0);
    setHistoryDetail(undefined);
    setProblem("");
    if (next === "history") void c.showHistory();
    else void c.chooseTopic(next as "people" | "places" | "world" | "progress");
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
    void c.load("places");
  };
  const openPlace = (node: RepairBrowseItem) => {
    c.setPlacePath([node.icon === "venue" ? "venues" : "places", node.id]);
    setPlaceSection("details");
    setListPage(0);
    void c.load("places");
  };
  const backPlace = () => {
    c.setPlacePath(zone && location ? c.placePath.slice(0, c.placePath.indexOf(zone.id)) : []);
    setPlaceSection("details");
    setListPage(0);
    void c.load("places");
  };
  const selected = c.selected;
  useEffect(() => {
    const pending = pendingMemory.current;
    if (pending && c.person?.id === pending.personId && !c.busy) {
      pendingMemory.current = undefined;
      void c.open(pending.id);
    }
  }, [c]);
  const editing = !!selected && !!c.draft && (c.view === "edit" || (c.view === "list" && !!selected.agendaDay));
  const mainPlaceDetails = !!targetPlace && !!selected && selected.id === mainPlaceRecord?.id;
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
  }, [fields, compact, isMemory, selected, space.height, space.scale, mainPlaceDetails, small]);
  const currentStep = Math.min(step, Math.max(0, fieldGroups.length - 1));
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
  const browseMemory = c.person && ["memories", "relationships", "wishes"].includes(c.section);
  const filteredRecords = c.records;
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
  useEffect(() => {
    if (c.busy || c.view !== "list") return;
    if (placeNotebook && placeSection === "details" && !nestedFolder && mainPlaceRecord) {
      void c.open(mainPlaceRecord.id);
      return;
    }
    if (c.selected) return;
    if (c.person && c.section === "home" && c.records.length)
      void c.open((c.records.find((record) => record.id.startsWith('["home",')) ?? c.records[0]!).id);
  }, [c, placeNotebook, placeSection, nestedFolder, mainPlaceRecord]);
  const editorTitle = selected?.agendaDay
    ? "Edit activity"
    : isMemory
      ? selected?.creating
        ? "Add memory"
        : "Memory"
      : (selected?.title ?? "");
  const collectionSearch =
    c.section === "relationships" ? "Find a relationship" : c.section === "wishes" ? "Find a wish" : "Find a memory";
  const reviewPageSize = compact ? 1 : small ? 1 : 3;
  const reviewPages = [
    ...(c.review?.changes ?? []),
    ...(c.review?.affected.length
      ? [{ label: "Linked effects", before: "", after: c.review.affected.join("\n") }]
      : []),
  ];
  const reviewStep = Math.min(step, Math.max(0, Math.ceil(reviewPages.length / reviewPageSize) - 1));
  const history = c.index?.history ?? [];
  const historySize = Math.max(1, Math.floor((space.height - 80) / (small ? 90 : 66)));
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

  return (
    <div className="villages-repair" aria-label="REPAIR">
      <style>{REPAIR_STYLES + RELATIONSHIP_METER_STYLES}</style>
      <header className="repair-chrome">
        <button
          type="button"
          disabled={c.saving}
          onClick={() => {
            c.leave();
            onBack();
          }}
        >
          ← Return to village
        </button>
        <strong>REPAIR</strong>
        <span>{c.index?.villageName}</span>
        <AreaChoice area={area} disabled={c.saving} onChange={chooseArea} compact />
        <form
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
        {c.person || targetPlace ? (
          <header className="repair-target">
            <button
              type="button"
              className="repair-back"
              disabled={c.saving}
              onClick={() => (c.person ? void c.chooseTopic("people") : backPlace())}
            >
              {c.person ? "← People" : zone ? "← All Zones" : "← Locations"}
            </button>
            {c.person ? (
              <AvatarFace
                name={c.person.name}
                portrait={portraits[c.person.id]}
                className={`${P}-avatar`}
                glyph={c.person.id === "player" ? "person" : "initial"}
              />
            ) : (
              <span className="repair-target-icon">
                <VillageIcon name="places" />
              </span>
            )}
            <div>
              <h1>{c.person?.name ?? targetPlace?.title}</h1>
              <small>
                {c.person
                  ? c.person.npc
                    ? "NPC"
                    : c.person.visitor
                      ? "Visitor"
                      : c.person.id === "player"
                        ? "Your Persona"
                        : "Villager"
                  : zone
                    ? location?.title
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
        {c.person && c.view !== "review" ? (
          <Sections
            name="Person repairs"
            entries={personSections.filter(([id]) => id !== "agenda" || c.person?.hasAgenda)}
            value={c.section}
            disabled={c.saving}
            onChange={(part) => {
              setRecordQuery("");
              setListPage(0);
              void c.chooseSection(part as RepairPersonSection);
            }}
          />
        ) : placeNotebook ? (
          <label className="repair-mobile-section">
            <span className="repair-sr">Location repairs</span>
            <select
              aria-label="Location repairs"
              value={placeSection}
              disabled={c.busy}
              onChange={(event) => choosePlaceSection(event.target.value)}
            >
              {placeSections.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {c.error || problem || (selected?.artwork && artwork?.problem) ? (
          <p className="repair-error" role="alert">
            {c.error || problem || artwork?.problem}
          </p>
        ) : null}
        {!c.index ? <p role="status">Opening REPAIR…</p> : null}
        <div className="repair-workspace" data-notebook={placeNotebook} ref={space.ref}>
          {placeNotebook ? (
            <nav className="repair-notebook-nav" aria-label="Location repairs">
              {placeSections.map(([id, title, icon]) => (
                <button
                  type="button"
                  key={id}
                  aria-current={placeSection === id ? "page" : undefined}
                  disabled={c.busy}
                  onClick={() => choosePlaceSection(id)}
                >
                  <VillageIcon name={icon} />
                  {title}
                </button>
              ))}
            </nav>
          ) : null}
          <div className="repair-notebook-body">
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
            ) : c.view === "done" ? (
              <section className="repair-card">
                <h2>{c.review?.kind === "restore" ? "Village restored" : "Changes saved"}</h2>
                {c.preservedDraft ? (
                  <PagedText label={c.preservedDraft.title} value={c.preservedDraft.text} readOnly />
                ) : null}
                <button type="button" onClick={() => void c.load()}>
                  Continue repairing
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
                        void c.choosePerson(person, "memories");
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
                  <table className="repair-history">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, historySize).map((entry) => (
                        <tr key={entry.id}>
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
                            <button type="button" onClick={() => setHistoryDetail(entry.id)}>
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
            ) : isSnapshots ? (
              <section className="repair-directory">
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
                          {snapshot.mode === "manual"
                            ? "Manual"
                            : snapshot.title === "Before checkpoint restoration"
                              ? "Before restore"
                              : "Before repair"}
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
                          <button type="button" onClick={() => setDeleteSnapshot(undefined)}>
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
                        onOpen={() => {
                          pendingMemory.current = { id: selected.id, personId: person.id };
                          void c.choosePerson(person, "memories");
                        }}
                      />
                    ) : null;
                  })}
                </div>
                <Pages page={accountPage} size={peopleSize} total={selected.people.length} onPage={setAccountPage} />
              </section>
            ) : editing ? (
              <div className={`repair-editor ${browseMemory ? "repair-memory-editor" : ""}`}>
                {c.person && c.section === "home" ? (
                  <label className="repair-mobile-record">
                    <span className="repair-sr">Home and work section</span>
                    <select
                      aria-label="Home and work section"
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
                {browseMemory && !small ? (
                  <aside className="repair-memory-list">
                    <input
                      autoComplete="off"
                      type="search"
                      aria-label={collectionSearch}
                      placeholder={collectionSearch}
                      value={recordQuery}
                      onChange={(event) => {
                        setRecordQuery(event.target.value);
                        void c.searchRecords(event.target.value);
                        setListPage(0);
                      }}
                    />
                    <div className="repair-record-list">
                      {filteredRecords.slice(0, Math.max(1, rowSize - 1)).map((record) => (
                        <button
                          type="button"
                          aria-label={record.title}
                          aria-current={selected.id === record.id ? "page" : undefined}
                          key={record.id}
                          onClick={() => void c.open(record.id)}
                        >
                          {short(record.title)}
                        </button>
                      ))}
                    </div>
                    <Pages
                      page={0}
                      offset={c.offset}
                      size={Math.max(1, rowSize - 1)}
                      total={c.total}
                      onPage={(offset) => void c.searchRecords(recordQuery, offset)}
                    />
                  </aside>
                ) : (
                  <aside className="repair-steps">
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
                  </aside>
                )}
                <section className="repair-card">
                  <header className="repair-card-title">
                    <h2>
                      {mainPlaceDetails
                        ? "Details"
                        : selected.id.startsWith('["relationship",')
                          ? selected.title
                          : isMemory
                            ? editorTitle
                            : fieldGroups[currentStep]
                              ? stepTitle(fieldGroups[currentStep]!)
                              : editorTitle}
                    </h2>
                    <small>
                      {arrangementSteps.length ? arrangementStep + 1 : currentStep + 1} of{" "}
                      {arrangementSteps.length || Math.max(1, fieldGroups.length)}
                    </small>
                    {!(c.person && c.section === "home") && !mainPlaceDetails ? (
                      <button
                        type="button"
                        className="repair-close"
                        aria-label={`Back to ${c.person ? personSections.find(([id]) => id === c.section)?.[1] : targetPlace ? placeSection : "records"}`}
                        disabled={c.busy}
                        onClick={() => void c.load(c.topic, c.offset, recordQuery)}
                      >
                        ×
                      </button>
                    ) : null}
                  </header>
                  {placeNotebook && placeSection === "details" && placeItems.length > 1 ? (
                    <label className="repair-field">
                      Details record
                      <select
                        aria-label="Details record"
                        disabled={c.busy}
                        value={selected.id}
                        onChange={(event) => void c.open(event.target.value)}
                      >
                        {placeItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.id === mainPlaceRecord?.id ? "Details" : item.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {selected.actions.length > 3 ? (
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
                  ) : selected.actions.length > 1 ? (
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
                  {c.draft.action === "teach" ? (
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
                  ) : fieldGroups[currentStep]?.[0]?.key === "__evidence" ? (
                    <PagedText
                      label="Original conversation"
                      value={selected.source.join("\n\n")}
                      readOnly
                      rows={proseRows}
                    />
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
                        (mainPlaceDetails && fieldGroups[currentStep]?.length === 3)
                      }
                    >
                      {fieldGroups[currentStep]?.map((field) => (
                        <RepairFieldControl
                          key={`${c.person?.id ?? selected.account?.personId ?? ""}:${selected.id}:${c.draft.action}:${field.key}`}
                          field={field}
                          value={c.draft!.values[field.key] ?? field.value}
                          disabled={c.busy}
                          error={c.errorField === field.key ? c.error : undefined}
                          onChange={(value) => changeValue(field, value)}
                          rows={proseRows}
                          hideLabel={
                            !placeNotebook &&
                            !selected.id.startsWith('["relationship",') &&
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
                        onOpen={() => {
                          c.setPlacePath([...c.placePath, item.id]);
                          setPlaceSection("details");
                          setListPage(0);
                        }}
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
                  pageSize={Math.max(1, Math.floor((space.height - 200) / 55))}
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
            ) : (
              <section className="repair-directory">
                {c.topic === "progress" ? (
                  <>
                    <Sections
                      name="Recovery status"
                      entries={[
                        ["attention", "Needs attention"],
                        ["active", "In progress"],
                        ["paused", "Paused"],
                        ["completed", "Completed"],
                      ]}
                      value={recoveryFilter}
                      onChange={(next) => {
                        setRecoveryFilter(next);
                        setListPage(0);
                      }}
                    />
                    {preparation?.status === "failed" && onRetryPreparation ? (
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
                          {job.error ? <span>{short(job.error)}</span> : null}
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
                {c.topic === "world" ? (
                  <button
                    type="button"
                    className="repair-world-snapshots"
                    onClick={() => {
                      setListPage(0);
                      void c.chooseTopic("restore");
                    }}
                  >
                    Village snapshots →
                  </button>
                ) : null}
                {browseMemory ? (
                  <>
                    <input
                      autoComplete="off"
                      type="search"
                      aria-label={
                        c.section === "relationships"
                          ? "Find a relationship"
                          : c.section === "wishes"
                            ? "Find a Wish"
                            : "Find a memory"
                      }
                      placeholder={
                        c.section === "relationships"
                          ? "Find a relationship"
                          : c.section === "wishes"
                            ? "Find a Wish"
                            : "Find a memory"
                      }
                      value={recordQuery}
                      onChange={(event) => {
                        setRecordQuery(event.target.value);
                        void c.searchRecords(event.target.value);
                        setListPage(0);
                      }}
                    />
                    {c.section === "memories" ? (
                      <Sections
                        name="Memory status"
                        entries={[
                          ["remembered", "Remembered"],
                          ["forgotten", "Forgotten"],
                        ]}
                        value={memoryFilter}
                        onChange={(next) => {
                          setMemoryFilter(next);
                          void c.searchRecords(recordQuery, 0, next);
                          setListPage(0);
                        }}
                      />
                    ) : null}
                    {c.creation && ["memories", "wishes"].includes(c.section) ? (
                      <button type="button" onClick={() => void c.open(c.creation!.id)}>
                        {c.section === "wishes" ? "Add Wish" : "Add memory"}
                      </button>
                    ) : null}
                  </>
                ) : null}
                <div className="repair-record-list">
                  {filteredRecords.slice(0, rowSize).map((record) => (
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
                {!filteredRecords.length && !visibleJobs.length && !c.busy ? <p>No records here.</p> : null}
                {c.topic === "progress" && !filteredRecords.length ? (
                  <Pages page={listPage} size={rowSize} total={visibleJobs.length} onPage={setListPage} />
                ) : (
                  <Pages
                    page={0}
                    offset={c.offset}
                    size={rowSize}
                    total={c.total}
                    onPage={(offset) => void c.searchRecords(recordQuery, offset)}
                  />
                )}
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
            <span role="status">{c.canReview ? "Unsaved changes" : "No changes"}</span>
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
            <span role="status">{c.busy ? "Working…" : ""}</span>
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
