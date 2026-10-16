
/** A provider-ready prompt for one named character in a multi-character scene illustration. */
export interface SceneIllustrationCharacterPrompt {
    /** Visible character name, matched against the scene's allowed character roster. */
    name: string;
    /** Character-only identity, appearance, pose, expression, and action prompt. */
    prompt: string;
    /** Optional character-only undesired-content prompt used by providers that support it. */
    negativePrompt?: string;
    /** Optional normalized subject center used by providers with spatial character prompting. */
    position?: {
        x: number;
        y: number;
    };
}
