export declare const MARI_PERMISSIONS_MODE_SETTINGS_KEY = "mari-permissions-mode";
export declare const MARI_PERMISSIONS_MODES: readonly ["auto", "manual", "accept-edits", "plan", "bypass"];
export type MariPermissionsMode = (typeof MARI_PERMISSIONS_MODES)[number];
export declare const DEFAULT_MARI_PERMISSIONS_MODE: MariPermissionsMode;
export declare function isMariPermissionsMode(value: unknown): value is MariPermissionsMode;
/** Labels and one-line descriptions for pickers; keep in sync with docs. */
export declare const MARI_PERMISSIONS_MODE_LABELS: Record<MariPermissionsMode, {
    label: string;
    description: string;
}>;
//# sourceMappingURL=mari-permissions-mode.d.ts.map