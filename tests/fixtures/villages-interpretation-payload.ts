/** Mock-provider reader for shared witnessed evidence; never adds an unauthorized ID. */
export function fixtureInterpretationChecks(content: string): any[] {
  const payload = JSON.parse(content);
  return payload.checks.map((check: any) => ({
    ...check,
    evidence: check.evidence ?? (payload.evidence ?? []).filter((line: any) => check.evidenceIds.includes(line.id)),
  }));
}
