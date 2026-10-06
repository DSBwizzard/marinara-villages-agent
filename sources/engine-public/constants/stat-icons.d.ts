export declare const SUPPORTED_STAT_ICONS: readonly ["activity", "apple", "battery", "battery-charging", "bed", "beer", "biceps-flexed", "bone", "book-open", "brain", "circle-dollar-sign", "clock", "cloud", "coins", "compass", "cookie", "crown", "diamond", "drama", "droplet", "dumbbell", "eye", "feather", "flame", "flask-conical", "footprints", "gem", "ghost", "hammer", "hand-metal", "heart", "heart-pulse", "hourglass", "key-round", "leaf", "lock", "medal", "moon", "mountain", "orbit", "pickaxe", "pill", "pizza", "radiation", "scale", "shield", "shield-check", "skull", "smile", "snowflake", "sparkles", "star", "sun", "sword", "swords", "target", "tent", "thermometer", "trophy", "utensils", "venetian-mask", "wallet-cards", "wand-sparkles", "waves", "wind", "wrench", "zap"];
export type SupportedStatIcon = (typeof SUPPORTED_STAT_ICONS)[number];
/** UI-only icon assignment for one normalized stat-name occurrence. */
export interface TrackerStatIconAssignment {
    name: string;
    occurrence: number;
    /** Null explicitly hides an inherited profile icon. */
    icon: SupportedStatIcon | null;
}
export declare function normalizeStatIcon(value: unknown): SupportedStatIcon | null;
//# sourceMappingURL=stat-icons.d.ts.map