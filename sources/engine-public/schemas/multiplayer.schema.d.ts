import { z } from "zod";
export declare const MULTIPLAYER_PROTOCOL_VERSION: 1;
export declare const MULTIPLAYER_LIMITS: {
    readonly messages: 100;
    readonly actionBytes: 16384;
    readonly snapshotBytes: 262144;
    readonly text: 8000;
    readonly description: 4000;
    readonly pollMs: 20000;
    readonly inviteMs: number;
    readonly sessionMs: number;
};
/** Reviewed text only. Never accept card extensions, image URLs or library records. */
export declare const multiplayerPersonaSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
}, "strict", z.ZodTypeAny, {
    name: string;
    description: string;
}, {
    name: string;
    description: string;
}>;
export declare const multiplayerCharacterProposalSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    role: z.ZodEnum<["character", "gm"]>;
}, "strict", z.ZodTypeAny, {
    name: string;
    role: "character" | "gm";
    description: string;
}, {
    name: string;
    role: "character" | "gm";
    description: string;
}>;
export declare const multiplayerPlayerSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    personaName: z.ZodNullable<z.ZodString>;
    isHost: z.ZodBoolean;
    connected: z.ZodBoolean;
    ready: z.ZodBoolean;
    joinsNextRound: z.ZodBoolean;
    personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    id: string;
    ready: boolean;
    displayName: string;
    personaName: string | null;
    isHost: boolean;
    connected: boolean;
    joinsNextRound: boolean;
    personaChangeRejected?: boolean | undefined;
}, {
    id: string;
    ready: boolean;
    displayName: string;
    personaName: string | null;
    isHost: boolean;
    connected: boolean;
    joinsNextRound: boolean;
    personaChangeRejected?: boolean | undefined;
}>;
export declare const multiplayerMessageSchema: z.ZodObject<{
    id: z.ZodString;
    actorId: z.ZodNullable<z.ZodString>;
    actorName: z.ZodString;
    kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
    text: z.ZodString;
    createdAt: z.ZodString;
    event: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
        targetName: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        type: "host-pass" | "kick" | "pause" | "resume";
        targetName?: string | undefined;
    }, {
        type: "host-pass" | "kick" | "pause" | "resume";
        targetName?: string | undefined;
    }>>;
    reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        emoji: z.ZodString;
        by: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        by: string[];
        emoji: string;
    }, {
        by: string[];
        emoji: string;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    text: string;
    id: string;
    kind: "user" | "assistant" | "narrator" | "event";
    createdAt: string;
    actorId: string | null;
    actorName: string;
    event?: {
        type: "host-pass" | "kick" | "pause" | "resume";
        targetName?: string | undefined;
    } | undefined;
    reactions?: {
        by: string[];
        emoji: string;
    }[] | undefined;
}, {
    text: string;
    id: string;
    kind: "user" | "assistant" | "narrator" | "event";
    createdAt: string;
    actorId: string | null;
    actorName: string;
    event?: {
        type: "host-pass" | "kick" | "pause" | "resume";
        targetName?: string | undefined;
    } | undefined;
    reactions?: {
        by: string[];
        emoji: string;
    }[] | undefined;
}>;
export declare const multiplayerRoundSchema: z.ZodObject<{
    id: z.ZodString;
    number: z.ZodNumber;
    phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
    requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
    submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
    ownSubmission: z.ZodNullable<z.ZodObject<{
        revision: z.ZodNumber;
        text: z.ZodString;
        pass: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        text: string;
        pass: boolean;
        revision: number;
    }, {
        text: string;
        pass: boolean;
        revision: number;
    }>>;
}, "strict", z.ZodTypeAny, {
    number: number;
    id: string;
    phase: "interrupted" | "collecting" | "resolving";
    requiredParticipantIds: string[];
    submittedParticipantIds: string[];
    ownSubmission: {
        text: string;
        pass: boolean;
        revision: number;
    } | null;
}, {
    number: number;
    id: string;
    phase: "interrupted" | "collecting" | "resolving";
    requiredParticipantIds: string[];
    submittedParticipantIds: string[];
    ownSubmission: {
        text: string;
        pass: boolean;
        revision: number;
    } | null;
}>;
/** Public Game presentation only; no cards, raw trackers, widgets, debug output or assets. */
export declare const multiplayerGameStateSchema: z.ZodObject<{
    state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
    location: z.ZodNullable<z.ZodString>;
    weather: z.ZodNullable<z.ZodString>;
    time: z.ZodNullable<z.ZodString>;
    choices: z.ZodArray<z.ZodString, "many">;
    rolls: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        total: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        label: string;
        total: number;
    }, {
        label: string;
        total: number;
    }>, "many">;
    trackers: z.ZodArray<z.ZodObject<{
        ownerId: z.ZodString;
        name: z.ZodString;
        values: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            label: string;
            value: string;
        }, {
            label: string;
            value: string;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        name: string;
        values: {
            label: string;
            value: string;
        }[];
        ownerId: string;
    }, {
        name: string;
        values: {
            label: string;
            value: string;
        }[];
        ownerId: string;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    state: "exploration" | "dialogue" | "combat" | "travel_rest";
    weather: string | null;
    rolls: {
        label: string;
        total: number;
    }[];
    choices: string[];
    location: string | null;
    time: string | null;
    trackers: {
        name: string;
        values: {
            label: string;
            value: string;
        }[];
        ownerId: string;
    }[];
}, {
    state: "exploration" | "dialogue" | "combat" | "travel_rest";
    weather: string | null;
    rolls: {
        label: string;
        total: number;
    }[];
    choices: string[];
    location: string | null;
    time: string | null;
    trackers: {
        name: string;
        values: {
            label: string;
            value: string;
        }[];
        ownerId: string;
    }[];
}>;
export type MultiplayerGameState = z.infer<typeof multiplayerGameStateSchema>;
export declare const multiplayerSnapshotSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
    revision: z.ZodNumber;
    name: z.ZodString;
    mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
    selfId: z.ZodString;
    nextSequence: z.ZodNumber;
    status: z.ZodEnum<["lobby", "active", "paused", "ended"]>;
    generation: z.ZodEnum<["idle", "running", "failed"]>;
    usage: z.ZodObject<{
        generations: z.ZodNumber;
        maxGenerations: z.ZodNumber;
        automaticReplies: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        generations: number;
        maxGenerations: number;
        automaticReplies: boolean;
    }, {
        generations: number;
        maxGenerations: number;
        automaticReplies: boolean;
    }>;
    players: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodString;
        personaName: z.ZodNullable<z.ZodString>;
        isHost: z.ZodBoolean;
        connected: z.ZodBoolean;
        ready: z.ZodBoolean;
        joinsNextRound: z.ZodBoolean;
        personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        ready: boolean;
        displayName: string;
        personaName: string | null;
        isHost: boolean;
        connected: boolean;
        joinsNextRound: boolean;
        personaChangeRejected?: boolean | undefined;
    }, {
        id: string;
        ready: boolean;
        displayName: string;
        personaName: string | null;
        isHost: boolean;
        connected: boolean;
        joinsNextRound: boolean;
        personaChangeRejected?: boolean | undefined;
    }>, "many">;
    characters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<["character", "gm"]>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        id: string;
        role: "character" | "gm";
    }, {
        name: string;
        id: string;
        role: "character" | "gm";
    }>, "many">;
    messages: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        actorId: z.ZodNullable<z.ZodString>;
        actorName: z.ZodString;
        kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
        text: z.ZodString;
        createdAt: z.ZodString;
        event: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
            targetName: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        }, {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        }>>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            by: z.ZodArray<z.ZodString, "many">;
        }, "strict", z.ZodTypeAny, {
            by: string[];
            emoji: string;
        }, {
            by: string[];
            emoji: string;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        text: string;
        id: string;
        kind: "user" | "assistant" | "narrator" | "event";
        createdAt: string;
        actorId: string | null;
        actorName: string;
        event?: {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        } | undefined;
        reactions?: {
            by: string[];
            emoji: string;
        }[] | undefined;
    }, {
        text: string;
        id: string;
        kind: "user" | "assistant" | "narrator" | "event";
        createdAt: string;
        actorId: string | null;
        actorName: string;
        event?: {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        } | undefined;
        reactions?: {
            by: string[];
            emoji: string;
        }[] | undefined;
    }>, "many">;
    round: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        number: z.ZodNumber;
        phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
        requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
        submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
        ownSubmission: z.ZodNullable<z.ZodObject<{
            revision: z.ZodNumber;
            text: z.ZodString;
            pass: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            text: string;
            pass: boolean;
            revision: number;
        }, {
            text: string;
            pass: boolean;
            revision: number;
        }>>;
    }, "strict", z.ZodTypeAny, {
        number: number;
        id: string;
        phase: "interrupted" | "collecting" | "resolving";
        requiredParticipantIds: string[];
        submittedParticipantIds: string[];
        ownSubmission: {
            text: string;
            pass: boolean;
            revision: number;
        } | null;
    }, {
        number: number;
        id: string;
        phase: "interrupted" | "collecting" | "resolving";
        requiredParticipantIds: string[];
        submittedParticipantIds: string[];
        ownSubmission: {
            text: string;
            pass: boolean;
            revision: number;
        } | null;
    }>>;
    game: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
        location: z.ZodNullable<z.ZodString>;
        weather: z.ZodNullable<z.ZodString>;
        time: z.ZodNullable<z.ZodString>;
        choices: z.ZodArray<z.ZodString, "many">;
        rolls: z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            total: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            label: string;
            total: number;
        }, {
            label: string;
            total: number;
        }>, "many">;
        trackers: z.ZodArray<z.ZodObject<{
            ownerId: z.ZodString;
            name: z.ZodString;
            values: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                label: string;
                value: string;
            }, {
                label: string;
                value: string;
            }>, "many">;
        }, "strict", z.ZodTypeAny, {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }, {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        state: "exploration" | "dialogue" | "combat" | "travel_rest";
        weather: string | null;
        rolls: {
            label: string;
            total: number;
        }[];
        choices: string[];
        location: string | null;
        time: string | null;
        trackers: {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }[];
    }, {
        state: "exploration" | "dialogue" | "combat" | "travel_rest";
        weather: string | null;
        rolls: {
            label: string;
            total: number;
        }[];
        choices: string[];
        location: string | null;
        time: string | null;
        trackers: {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }[];
    }>>>;
}, "strict", z.ZodTypeAny, {
    characters: {
        name: string;
        id: string;
        role: "character" | "gm";
    }[];
    name: string;
    status: "active" | "ended" | "lobby" | "paused";
    version: 1;
    round: {
        number: number;
        id: string;
        phase: "interrupted" | "collecting" | "resolving";
        requiredParticipantIds: string[];
        submittedParticipantIds: string[];
        ownSubmission: {
            text: string;
            pass: boolean;
            revision: number;
        } | null;
    } | null;
    mode: "roleplay" | "game" | "conversation";
    revision: number;
    roomId: string;
    selfId: string;
    nextSequence: number;
    generation: "running" | "failed" | "idle";
    usage: {
        generations: number;
        maxGenerations: number;
        automaticReplies: boolean;
    };
    players: {
        id: string;
        ready: boolean;
        displayName: string;
        personaName: string | null;
        isHost: boolean;
        connected: boolean;
        joinsNextRound: boolean;
        personaChangeRejected?: boolean | undefined;
    }[];
    messages: {
        text: string;
        id: string;
        kind: "user" | "assistant" | "narrator" | "event";
        createdAt: string;
        actorId: string | null;
        actorName: string;
        event?: {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        } | undefined;
        reactions?: {
            by: string[];
            emoji: string;
        }[] | undefined;
    }[];
    game?: {
        state: "exploration" | "dialogue" | "combat" | "travel_rest";
        weather: string | null;
        rolls: {
            label: string;
            total: number;
        }[];
        choices: string[];
        location: string | null;
        time: string | null;
        trackers: {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }[];
    } | null | undefined;
}, {
    characters: {
        name: string;
        id: string;
        role: "character" | "gm";
    }[];
    name: string;
    status: "active" | "ended" | "lobby" | "paused";
    version: 1;
    round: {
        number: number;
        id: string;
        phase: "interrupted" | "collecting" | "resolving";
        requiredParticipantIds: string[];
        submittedParticipantIds: string[];
        ownSubmission: {
            text: string;
            pass: boolean;
            revision: number;
        } | null;
    } | null;
    mode: "roleplay" | "game" | "conversation";
    revision: number;
    roomId: string;
    selfId: string;
    nextSequence: number;
    generation: "running" | "failed" | "idle";
    usage: {
        generations: number;
        maxGenerations: number;
        automaticReplies: boolean;
    };
    players: {
        id: string;
        ready: boolean;
        displayName: string;
        personaName: string | null;
        isHost: boolean;
        connected: boolean;
        joinsNextRound: boolean;
        personaChangeRejected?: boolean | undefined;
    }[];
    messages: {
        text: string;
        id: string;
        kind: "user" | "assistant" | "narrator" | "event";
        createdAt: string;
        actorId: string | null;
        actorName: string;
        event?: {
            type: "host-pass" | "kick" | "pause" | "resume";
            targetName?: string | undefined;
        } | undefined;
        reactions?: {
            by: string[];
            emoji: string;
        }[] | undefined;
    }[];
    game?: {
        state: "exploration" | "dialogue" | "combat" | "travel_rest";
        weather: string | null;
        rolls: {
            label: string;
            total: number;
        }[];
        choices: string[];
        location: string | null;
        time: string | null;
        trackers: {
            name: string;
            values: {
                label: string;
                value: string;
            }[];
            ownerId: string;
        }[];
    } | null | undefined;
}>;
export declare const multiplayerActionSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"message">;
    text: z.ZodString;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    text: string;
    type: "message";
    sequence: number;
    operationId: string;
}, {
    text: string;
    type: "message";
    sequence: number;
    operationId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"submit-action">;
    roundId: z.ZodString;
    submissionRevision: z.ZodNumber;
    text: z.ZodString;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    text: string;
    type: "submit-action";
    sequence: number;
    operationId: string;
    roundId: string;
    submissionRevision: number;
}, {
    text: string;
    type: "submit-action";
    sequence: number;
    operationId: string;
    roundId: string;
    submissionRevision: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"pass">;
    roundId: z.ZodString;
    submissionRevision: z.ZodNumber;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "pass";
    sequence: number;
    operationId: string;
    roundId: string;
    submissionRevision: number;
}, {
    type: "pass";
    sequence: number;
    operationId: string;
    roundId: string;
    submissionRevision: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"request-response">;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "request-response";
    sequence: number;
    operationId: string;
}, {
    type: "request-response";
    sequence: number;
    operationId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"set-persona">;
    persona: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        name: string;
        description: string;
    }, {
        name: string;
        description: string;
    }>;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    persona: {
        name: string;
        description: string;
    };
    type: "set-persona";
    sequence: number;
    operationId: string;
}, {
    persona: {
        name: string;
        description: string;
    };
    type: "set-persona";
    sequence: number;
    operationId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"propose-character">;
    character: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        role: z.ZodEnum<["character", "gm"]>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        role: "character" | "gm";
        description: string;
    }, {
        name: string;
        role: "character" | "gm";
        description: string;
    }>;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    character: {
        name: string;
        role: "character" | "gm";
        description: string;
    };
    type: "propose-character";
    sequence: number;
    operationId: string;
}, {
    character: {
        name: string;
        role: "character" | "gm";
        description: string;
    };
    type: "propose-character";
    sequence: number;
    operationId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"leave">;
    operationId: z.ZodString;
    sequence: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "leave";
    sequence: number;
    operationId: string;
}, {
    type: "leave";
    sequence: number;
    operationId: string;
}>]>;
export declare const multiplayerErrorCodeSchema: z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>;
export declare const multiplayerGuestStateSchema: z.ZodObject<{
    phase: z.ZodEnum<["awaiting-approval", "connected", "reconnecting", "ended"]>;
    snapshot: z.ZodNullable<z.ZodObject<{
        version: z.ZodLiteral<1>;
        roomId: z.ZodString;
        revision: z.ZodNumber;
        name: z.ZodString;
        mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
        selfId: z.ZodString;
        nextSequence: z.ZodNumber;
        status: z.ZodEnum<["lobby", "active", "paused", "ended"]>;
        generation: z.ZodEnum<["idle", "running", "failed"]>;
        usage: z.ZodObject<{
            generations: z.ZodNumber;
            maxGenerations: z.ZodNumber;
            automaticReplies: z.ZodBoolean;
        }, "strict", z.ZodTypeAny, {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        }, {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        }>;
        players: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            displayName: z.ZodString;
            personaName: z.ZodNullable<z.ZodString>;
            isHost: z.ZodBoolean;
            connected: z.ZodBoolean;
            ready: z.ZodBoolean;
            joinsNextRound: z.ZodBoolean;
            personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
        }, "strict", z.ZodTypeAny, {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }, {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }>, "many">;
        characters: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            role: z.ZodEnum<["character", "gm"]>;
        }, "strict", z.ZodTypeAny, {
            name: string;
            id: string;
            role: "character" | "gm";
        }, {
            name: string;
            id: string;
            role: "character" | "gm";
        }>, "many">;
        messages: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            actorId: z.ZodNullable<z.ZodString>;
            actorName: z.ZodString;
            kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
            text: z.ZodString;
            createdAt: z.ZodString;
            event: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
                targetName: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            }, {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            }>>;
            reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                emoji: z.ZodString;
                by: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                by: string[];
                emoji: string;
            }, {
                by: string[];
                emoji: string;
            }>, "many">>;
        }, "strict", z.ZodTypeAny, {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }, {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }>, "many">;
        round: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            number: z.ZodNumber;
            phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
            requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
            submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
            ownSubmission: z.ZodNullable<z.ZodObject<{
                revision: z.ZodNumber;
                text: z.ZodString;
                pass: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                text: string;
                pass: boolean;
                revision: number;
            }, {
                text: string;
                pass: boolean;
                revision: number;
            }>>;
        }, "strict", z.ZodTypeAny, {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        }, {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        }>>;
        game: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
            location: z.ZodNullable<z.ZodString>;
            weather: z.ZodNullable<z.ZodString>;
            time: z.ZodNullable<z.ZodString>;
            choices: z.ZodArray<z.ZodString, "many">;
            rolls: z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                total: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                label: string;
                total: number;
            }, {
                label: string;
                total: number;
            }>, "many">;
            trackers: z.ZodArray<z.ZodObject<{
                ownerId: z.ZodString;
                name: z.ZodString;
                values: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    value: z.ZodString;
                }, "strict", z.ZodTypeAny, {
                    label: string;
                    value: string;
                }, {
                    label: string;
                    value: string;
                }>, "many">;
            }, "strict", z.ZodTypeAny, {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }, {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }>, "many">;
        }, "strict", z.ZodTypeAny, {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        }, {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        }>>>;
    }, "strict", z.ZodTypeAny, {
        characters: {
            name: string;
            id: string;
            role: "character" | "gm";
        }[];
        name: string;
        status: "active" | "ended" | "lobby" | "paused";
        version: 1;
        round: {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        } | null;
        mode: "roleplay" | "game" | "conversation";
        revision: number;
        roomId: string;
        selfId: string;
        nextSequence: number;
        generation: "running" | "failed" | "idle";
        usage: {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        };
        players: {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }[];
        messages: {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }[];
        game?: {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        } | null | undefined;
    }, {
        characters: {
            name: string;
            id: string;
            role: "character" | "gm";
        }[];
        name: string;
        status: "active" | "ended" | "lobby" | "paused";
        version: 1;
        round: {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        } | null;
        mode: "roleplay" | "game" | "conversation";
        revision: number;
        roomId: string;
        selfId: string;
        nextSequence: number;
        generation: "running" | "failed" | "idle";
        usage: {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        };
        players: {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }[];
        messages: {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }[];
        game?: {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        } | null | undefined;
    }>>;
    error: z.ZodNullable<z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>>;
}, "strict", z.ZodTypeAny, {
    error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
    phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
    snapshot: {
        characters: {
            name: string;
            id: string;
            role: "character" | "gm";
        }[];
        name: string;
        status: "active" | "ended" | "lobby" | "paused";
        version: 1;
        round: {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        } | null;
        mode: "roleplay" | "game" | "conversation";
        revision: number;
        roomId: string;
        selfId: string;
        nextSequence: number;
        generation: "running" | "failed" | "idle";
        usage: {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        };
        players: {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }[];
        messages: {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }[];
        game?: {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        } | null | undefined;
    } | null;
}, {
    error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
    phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
    snapshot: {
        characters: {
            name: string;
            id: string;
            role: "character" | "gm";
        }[];
        name: string;
        status: "active" | "ended" | "lobby" | "paused";
        version: 1;
        round: {
            number: number;
            id: string;
            phase: "interrupted" | "collecting" | "resolving";
            requiredParticipantIds: string[];
            submittedParticipantIds: string[];
            ownSubmission: {
                text: string;
                pass: boolean;
                revision: number;
            } | null;
        } | null;
        mode: "roleplay" | "game" | "conversation";
        revision: number;
        roomId: string;
        selfId: string;
        nextSequence: number;
        generation: "running" | "failed" | "idle";
        usage: {
            generations: number;
            maxGenerations: number;
            automaticReplies: boolean;
        };
        players: {
            id: string;
            ready: boolean;
            displayName: string;
            personaName: string | null;
            isHost: boolean;
            connected: boolean;
            joinsNextRound: boolean;
            personaChangeRejected?: boolean | undefined;
        }[];
        messages: {
            text: string;
            id: string;
            kind: "user" | "assistant" | "narrator" | "event";
            createdAt: string;
            actorId: string | null;
            actorName: string;
            event?: {
                type: "host-pass" | "kick" | "pause" | "resume";
                targetName?: string | undefined;
            } | undefined;
            reactions?: {
                by: string[];
                emoji: string;
            }[] | undefined;
        }[];
        game?: {
            state: "exploration" | "dialogue" | "combat" | "travel_rest";
            weather: string | null;
            rolls: {
                label: string;
                total: number;
            }[];
            choices: string[];
            location: string | null;
            time: string | null;
            trackers: {
                name: string;
                values: {
                    label: string;
                    value: string;
                }[];
                ownerId: string;
            }[];
        } | null | undefined;
    } | null;
}>;
export declare const multiplayerInviteSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    origin: z.ZodEffects<z.ZodString, string, string>;
    roomId: z.ZodString;
    invite: z.ZodString;
    fingerprint: z.ZodString;
    expiresAt: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    expiresAt: string;
    roomId: string;
    origin: string;
    invite: string;
    fingerprint: string;
}, {
    version: 1;
    expiresAt: string;
    roomId: string;
    origin: string;
    invite: string;
    fingerprint: string;
}>;
/** Bound bytes before JSON.parse and validate the result with its exact schema. */
export declare function parseMultiplayerJson<T>(input: string, schema: z.ZodType<T>, maximumBytes: number): T;
export type MultiplayerPersona = z.infer<typeof multiplayerPersonaSchema>;
export type MultiplayerPlayer = z.infer<typeof multiplayerPlayerSchema>;
export type MultiplayerMessage = z.infer<typeof multiplayerMessageSchema>;
export type MultiplayerSnapshot = z.infer<typeof multiplayerSnapshotSchema>;
export type MultiplayerAction = z.infer<typeof multiplayerActionSchema>;
export type MultiplayerGuestState = z.infer<typeof multiplayerGuestStateSchema>;
export type MultiplayerErrorCode = z.infer<typeof multiplayerErrorCodeSchema>;
export type MultiplayerInvite = z.infer<typeof multiplayerInviteSchema>;
export declare const multiplayerPeerRequestSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"preview">;
    invite: z.ZodString;
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "preview";
    roomId: string;
    invite: string;
}, {
    version: 1;
    type: "preview";
    roomId: string;
    invite: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"join">;
    invite: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodString;
    persona: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        name: string;
        description: string;
    }, {
        name: string;
        description: string;
    }>;
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    persona: {
        name: string;
        description: string;
    };
    version: 1;
    type: "join";
    displayName: string;
    roomId: string;
    invite: string;
    password: string;
}, {
    persona: {
        name: string;
        description: string;
    };
    version: 1;
    type: "join";
    displayName: string;
    roomId: string;
    invite: string;
    password: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"poll">;
    revision: z.ZodNumber;
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "poll";
    revision: number;
    roomId: string;
}, {
    version: 1;
    type: "poll";
    revision: number;
    roomId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"action">;
    action: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"message">;
        text: z.ZodString;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        text: string;
        type: "message";
        sequence: number;
        operationId: string;
    }, {
        text: string;
        type: "message";
        sequence: number;
        operationId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"submit-action">;
        roundId: z.ZodString;
        submissionRevision: z.ZodNumber;
        text: z.ZodString;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        text: string;
        type: "submit-action";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    }, {
        text: string;
        type: "submit-action";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"pass">;
        roundId: z.ZodString;
        submissionRevision: z.ZodNumber;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "pass";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    }, {
        type: "pass";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"request-response">;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "request-response";
        sequence: number;
        operationId: string;
    }, {
        type: "request-response";
        sequence: number;
        operationId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"set-persona">;
        persona: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            name: string;
            description: string;
        }, {
            name: string;
            description: string;
        }>;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        persona: {
            name: string;
            description: string;
        };
        type: "set-persona";
        sequence: number;
        operationId: string;
    }, {
        persona: {
            name: string;
            description: string;
        };
        type: "set-persona";
        sequence: number;
        operationId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"propose-character">;
        character: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            role: z.ZodEnum<["character", "gm"]>;
        }, "strict", z.ZodTypeAny, {
            name: string;
            role: "character" | "gm";
            description: string;
        }, {
            name: string;
            role: "character" | "gm";
            description: string;
        }>;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        character: {
            name: string;
            role: "character" | "gm";
            description: string;
        };
        type: "propose-character";
        sequence: number;
        operationId: string;
    }, {
        character: {
            name: string;
            role: "character" | "gm";
            description: string;
        };
        type: "propose-character";
        sequence: number;
        operationId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"leave">;
        operationId: z.ZodString;
        sequence: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: "leave";
        sequence: number;
        operationId: string;
    }, {
        type: "leave";
        sequence: number;
        operationId: string;
    }>]>;
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "action";
    action: {
        text: string;
        type: "message";
        sequence: number;
        operationId: string;
    } | {
        text: string;
        type: "submit-action";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    } | {
        type: "pass";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    } | {
        type: "request-response";
        sequence: number;
        operationId: string;
    } | {
        persona: {
            name: string;
            description: string;
        };
        type: "set-persona";
        sequence: number;
        operationId: string;
    } | {
        character: {
            name: string;
            role: "character" | "gm";
            description: string;
        };
        type: "propose-character";
        sequence: number;
        operationId: string;
    } | {
        type: "leave";
        sequence: number;
        operationId: string;
    };
    roomId: string;
}, {
    version: 1;
    type: "action";
    action: {
        text: string;
        type: "message";
        sequence: number;
        operationId: string;
    } | {
        text: string;
        type: "submit-action";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    } | {
        type: "pass";
        sequence: number;
        operationId: string;
        roundId: string;
        submissionRevision: number;
    } | {
        type: "request-response";
        sequence: number;
        operationId: string;
    } | {
        persona: {
            name: string;
            description: string;
        };
        type: "set-persona";
        sequence: number;
        operationId: string;
    } | {
        character: {
            name: string;
            role: "character" | "gm";
            description: string;
        };
        type: "propose-character";
        sequence: number;
        operationId: string;
    } | {
        type: "leave";
        sequence: number;
        operationId: string;
    };
    roomId: string;
}>]>;
export declare const multiplayerPeerResponseSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"preview">;
    name: z.ZodString;
    mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
    expiresAt: z.ZodString;
    version: z.ZodLiteral<1>;
    roomId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    name: string;
    version: 1;
    type: "preview";
    mode: "roleplay" | "game" | "conversation";
    expiresAt: string;
    roomId: string;
}, {
    name: string;
    version: 1;
    type: "preview";
    mode: "roleplay" | "game" | "conversation";
    expiresAt: string;
    roomId: string;
}>, z.ZodObject<{
    version: z.ZodLiteral<1>;
    type: z.ZodLiteral<"admission">;
    session: z.ZodString;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "admission";
    session: string;
}, {
    version: 1;
    type: "admission";
    session: string;
}>, z.ZodObject<{
    version: z.ZodLiteral<1>;
    type: z.ZodLiteral<"state">;
    state: z.ZodObject<{
        phase: z.ZodEnum<["awaiting-approval", "connected", "reconnecting", "ended"]>;
        snapshot: z.ZodNullable<z.ZodObject<{
            version: z.ZodLiteral<1>;
            roomId: z.ZodString;
            revision: z.ZodNumber;
            name: z.ZodString;
            mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
            selfId: z.ZodString;
            nextSequence: z.ZodNumber;
            status: z.ZodEnum<["lobby", "active", "paused", "ended"]>;
            generation: z.ZodEnum<["idle", "running", "failed"]>;
            usage: z.ZodObject<{
                generations: z.ZodNumber;
                maxGenerations: z.ZodNumber;
                automaticReplies: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }>;
            players: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                displayName: z.ZodString;
                personaName: z.ZodNullable<z.ZodString>;
                isHost: z.ZodBoolean;
                connected: z.ZodBoolean;
                ready: z.ZodBoolean;
                joinsNextRound: z.ZodBoolean;
                personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }>, "many">;
            characters: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<["character", "gm"]>;
            }, "strict", z.ZodTypeAny, {
                name: string;
                id: string;
                role: "character" | "gm";
            }, {
                name: string;
                id: string;
                role: "character" | "gm";
            }>, "many">;
            messages: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                actorId: z.ZodNullable<z.ZodString>;
                actorName: z.ZodString;
                kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
                text: z.ZodString;
                createdAt: z.ZodString;
                event: z.ZodOptional<z.ZodObject<{
                    type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
                    targetName: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }>>;
                reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    emoji: z.ZodString;
                    by: z.ZodArray<z.ZodString, "many">;
                }, "strict", z.ZodTypeAny, {
                    by: string[];
                    emoji: string;
                }, {
                    by: string[];
                    emoji: string;
                }>, "many">>;
            }, "strict", z.ZodTypeAny, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }>, "many">;
            round: z.ZodNullable<z.ZodObject<{
                id: z.ZodString;
                number: z.ZodNumber;
                phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
                requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
                submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
                ownSubmission: z.ZodNullable<z.ZodObject<{
                    revision: z.ZodNumber;
                    text: z.ZodString;
                    pass: z.ZodBoolean;
                }, "strict", z.ZodTypeAny, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }>>;
            }, "strict", z.ZodTypeAny, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }>>;
            game: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
                location: z.ZodNullable<z.ZodString>;
                weather: z.ZodNullable<z.ZodString>;
                time: z.ZodNullable<z.ZodString>;
                choices: z.ZodArray<z.ZodString, "many">;
                rolls: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    total: z.ZodNumber;
                }, "strict", z.ZodTypeAny, {
                    label: string;
                    total: number;
                }, {
                    label: string;
                    total: number;
                }>, "many">;
                trackers: z.ZodArray<z.ZodObject<{
                    ownerId: z.ZodString;
                    name: z.ZodString;
                    values: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodString;
                    }, "strict", z.ZodTypeAny, {
                        label: string;
                        value: string;
                    }, {
                        label: string;
                        value: string;
                    }>, "many">;
                }, "strict", z.ZodTypeAny, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }>, "many">;
            }, "strict", z.ZodTypeAny, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }>>>;
        }, "strict", z.ZodTypeAny, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }>>;
        error: z.ZodNullable<z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>>;
    }, "strict", z.ZodTypeAny, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }>;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "state";
    state: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    };
}, {
    version: 1;
    type: "state";
    state: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    };
}>, z.ZodObject<{
    version: z.ZodLiteral<1>;
    type: z.ZodLiteral<"accepted">;
    operationId: z.ZodString;
    state: z.ZodObject<{
        phase: z.ZodEnum<["awaiting-approval", "connected", "reconnecting", "ended"]>;
        snapshot: z.ZodNullable<z.ZodObject<{
            version: z.ZodLiteral<1>;
            roomId: z.ZodString;
            revision: z.ZodNumber;
            name: z.ZodString;
            mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
            selfId: z.ZodString;
            nextSequence: z.ZodNumber;
            status: z.ZodEnum<["lobby", "active", "paused", "ended"]>;
            generation: z.ZodEnum<["idle", "running", "failed"]>;
            usage: z.ZodObject<{
                generations: z.ZodNumber;
                maxGenerations: z.ZodNumber;
                automaticReplies: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }>;
            players: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                displayName: z.ZodString;
                personaName: z.ZodNullable<z.ZodString>;
                isHost: z.ZodBoolean;
                connected: z.ZodBoolean;
                ready: z.ZodBoolean;
                joinsNextRound: z.ZodBoolean;
                personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }>, "many">;
            characters: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<["character", "gm"]>;
            }, "strict", z.ZodTypeAny, {
                name: string;
                id: string;
                role: "character" | "gm";
            }, {
                name: string;
                id: string;
                role: "character" | "gm";
            }>, "many">;
            messages: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                actorId: z.ZodNullable<z.ZodString>;
                actorName: z.ZodString;
                kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
                text: z.ZodString;
                createdAt: z.ZodString;
                event: z.ZodOptional<z.ZodObject<{
                    type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
                    targetName: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }>>;
                reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    emoji: z.ZodString;
                    by: z.ZodArray<z.ZodString, "many">;
                }, "strict", z.ZodTypeAny, {
                    by: string[];
                    emoji: string;
                }, {
                    by: string[];
                    emoji: string;
                }>, "many">>;
            }, "strict", z.ZodTypeAny, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }>, "many">;
            round: z.ZodNullable<z.ZodObject<{
                id: z.ZodString;
                number: z.ZodNumber;
                phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
                requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
                submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
                ownSubmission: z.ZodNullable<z.ZodObject<{
                    revision: z.ZodNumber;
                    text: z.ZodString;
                    pass: z.ZodBoolean;
                }, "strict", z.ZodTypeAny, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }>>;
            }, "strict", z.ZodTypeAny, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }>>;
            game: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
                location: z.ZodNullable<z.ZodString>;
                weather: z.ZodNullable<z.ZodString>;
                time: z.ZodNullable<z.ZodString>;
                choices: z.ZodArray<z.ZodString, "many">;
                rolls: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    total: z.ZodNumber;
                }, "strict", z.ZodTypeAny, {
                    label: string;
                    total: number;
                }, {
                    label: string;
                    total: number;
                }>, "many">;
                trackers: z.ZodArray<z.ZodObject<{
                    ownerId: z.ZodString;
                    name: z.ZodString;
                    values: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodString;
                    }, "strict", z.ZodTypeAny, {
                        label: string;
                        value: string;
                    }, {
                        label: string;
                        value: string;
                    }>, "many">;
                }, "strict", z.ZodTypeAny, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }>, "many">;
            }, "strict", z.ZodTypeAny, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }>>>;
        }, "strict", z.ZodTypeAny, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }>>;
        error: z.ZodNullable<z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>>;
    }, "strict", z.ZodTypeAny, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }>;
}, "strict", z.ZodTypeAny, {
    version: 1;
    type: "accepted";
    state: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    };
    operationId: string;
}, {
    version: 1;
    type: "accepted";
    state: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    };
    operationId: string;
}>, z.ZodObject<{
    version: z.ZodLiteral<1>;
    type: z.ZodLiteral<"error">;
    code: z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>;
    state: z.ZodOptional<z.ZodObject<{
        phase: z.ZodEnum<["awaiting-approval", "connected", "reconnecting", "ended"]>;
        snapshot: z.ZodNullable<z.ZodObject<{
            version: z.ZodLiteral<1>;
            roomId: z.ZodString;
            revision: z.ZodNumber;
            name: z.ZodString;
            mode: z.ZodEnum<["conversation", "roleplay", "game"]>;
            selfId: z.ZodString;
            nextSequence: z.ZodNumber;
            status: z.ZodEnum<["lobby", "active", "paused", "ended"]>;
            generation: z.ZodEnum<["idle", "running", "failed"]>;
            usage: z.ZodObject<{
                generations: z.ZodNumber;
                maxGenerations: z.ZodNumber;
                automaticReplies: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }, {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            }>;
            players: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                displayName: z.ZodString;
                personaName: z.ZodNullable<z.ZodString>;
                isHost: z.ZodBoolean;
                connected: z.ZodBoolean;
                ready: z.ZodBoolean;
                joinsNextRound: z.ZodBoolean;
                personaChangeRejected: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }, {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }>, "many">;
            characters: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                role: z.ZodEnum<["character", "gm"]>;
            }, "strict", z.ZodTypeAny, {
                name: string;
                id: string;
                role: "character" | "gm";
            }, {
                name: string;
                id: string;
                role: "character" | "gm";
            }>, "many">;
            messages: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                actorId: z.ZodNullable<z.ZodString>;
                actorName: z.ZodString;
                kind: z.ZodEnum<["user", "assistant", "narrator", "event"]>;
                text: z.ZodString;
                createdAt: z.ZodString;
                event: z.ZodOptional<z.ZodObject<{
                    type: z.ZodEnum<["host-pass", "kick", "pause", "resume"]>;
                    targetName: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }, {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                }>>;
                reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    emoji: z.ZodString;
                    by: z.ZodArray<z.ZodString, "many">;
                }, "strict", z.ZodTypeAny, {
                    by: string[];
                    emoji: string;
                }, {
                    by: string[];
                    emoji: string;
                }>, "many">>;
            }, "strict", z.ZodTypeAny, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }, {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }>, "many">;
            round: z.ZodNullable<z.ZodObject<{
                id: z.ZodString;
                number: z.ZodNumber;
                phase: z.ZodEnum<["collecting", "resolving", "interrupted"]>;
                requiredParticipantIds: z.ZodArray<z.ZodString, "many">;
                submittedParticipantIds: z.ZodArray<z.ZodString, "many">;
                ownSubmission: z.ZodNullable<z.ZodObject<{
                    revision: z.ZodNumber;
                    text: z.ZodString;
                    pass: z.ZodBoolean;
                }, "strict", z.ZodTypeAny, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }, {
                    text: string;
                    pass: boolean;
                    revision: number;
                }>>;
            }, "strict", z.ZodTypeAny, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }, {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            }>>;
            game: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<["exploration", "dialogue", "combat", "travel_rest"]>;
                location: z.ZodNullable<z.ZodString>;
                weather: z.ZodNullable<z.ZodString>;
                time: z.ZodNullable<z.ZodString>;
                choices: z.ZodArray<z.ZodString, "many">;
                rolls: z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    total: z.ZodNumber;
                }, "strict", z.ZodTypeAny, {
                    label: string;
                    total: number;
                }, {
                    label: string;
                    total: number;
                }>, "many">;
                trackers: z.ZodArray<z.ZodObject<{
                    ownerId: z.ZodString;
                    name: z.ZodString;
                    values: z.ZodArray<z.ZodObject<{
                        label: z.ZodString;
                        value: z.ZodString;
                    }, "strict", z.ZodTypeAny, {
                        label: string;
                        value: string;
                    }, {
                        label: string;
                        value: string;
                    }>, "many">;
                }, "strict", z.ZodTypeAny, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }, {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }>, "many">;
            }, "strict", z.ZodTypeAny, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }, {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            }>>>;
        }, "strict", z.ZodTypeAny, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }, {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        }>>;
        error: z.ZodNullable<z.ZodEnum<["disabled", "unavailable", "invalid-invite", "expired-invite", "identity-changed", "identity-conflict", "incompatible-version", "wrong-password", "room-full", "snapshot-too-large", "rate-limited", "awaiting-approval", "declined", "revoked", "room-ended", "disconnected", "invalid-message", "stale-action", "busy", "restricted-command", "generation-failed"]>>;
    }, "strict", z.ZodTypeAny, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }, {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    }>>;
}, "strict", z.ZodTypeAny, {
    version: 1;
    code: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed";
    type: "error";
    state?: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    } | undefined;
}, {
    version: 1;
    code: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed";
    type: "error";
    state?: {
        error: "unavailable" | "disabled" | "invalid-invite" | "expired-invite" | "identity-changed" | "identity-conflict" | "incompatible-version" | "wrong-password" | "room-full" | "snapshot-too-large" | "rate-limited" | "awaiting-approval" | "declined" | "revoked" | "room-ended" | "disconnected" | "invalid-message" | "stale-action" | "busy" | "restricted-command" | "generation-failed" | null;
        phase: "ended" | "connected" | "awaiting-approval" | "reconnecting";
        snapshot: {
            characters: {
                name: string;
                id: string;
                role: "character" | "gm";
            }[];
            name: string;
            status: "active" | "ended" | "lobby" | "paused";
            version: 1;
            round: {
                number: number;
                id: string;
                phase: "interrupted" | "collecting" | "resolving";
                requiredParticipantIds: string[];
                submittedParticipantIds: string[];
                ownSubmission: {
                    text: string;
                    pass: boolean;
                    revision: number;
                } | null;
            } | null;
            mode: "roleplay" | "game" | "conversation";
            revision: number;
            roomId: string;
            selfId: string;
            nextSequence: number;
            generation: "running" | "failed" | "idle";
            usage: {
                generations: number;
                maxGenerations: number;
                automaticReplies: boolean;
            };
            players: {
                id: string;
                ready: boolean;
                displayName: string;
                personaName: string | null;
                isHost: boolean;
                connected: boolean;
                joinsNextRound: boolean;
                personaChangeRejected?: boolean | undefined;
            }[];
            messages: {
                text: string;
                id: string;
                kind: "user" | "assistant" | "narrator" | "event";
                createdAt: string;
                actorId: string | null;
                actorName: string;
                event?: {
                    type: "host-pass" | "kick" | "pause" | "resume";
                    targetName?: string | undefined;
                } | undefined;
                reactions?: {
                    by: string[];
                    emoji: string;
                }[] | undefined;
            }[];
            game?: {
                state: "exploration" | "dialogue" | "combat" | "travel_rest";
                weather: string | null;
                rolls: {
                    label: string;
                    total: number;
                }[];
                choices: string[];
                location: string | null;
                time: string | null;
                trackers: {
                    name: string;
                    values: {
                        label: string;
                        value: string;
                    }[];
                    ownerId: string;
                }[];
            } | null | undefined;
        } | null;
    } | undefined;
}>]>;
export type MultiplayerPeerRequest = z.infer<typeof multiplayerPeerRequestSchema>;
export type MultiplayerPeerResponse = z.infer<typeof multiplayerPeerResponseSchema>;
//# sourceMappingURL=multiplayer.schema.d.ts.map