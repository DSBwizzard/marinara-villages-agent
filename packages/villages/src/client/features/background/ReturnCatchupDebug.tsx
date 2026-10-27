import { useState } from "react";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";

/** This deliberately exposes private resident outcomes only in the debug tools. */
export function ReturnCatchupDebug() {
  const [account, setAccount] = useState<unknown>();
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setAccount(await request<unknown>("/debug/return-catchup"));
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "Could not inspect catch-up."));
    }
  };
  return (
    <section className={`${ELEMENT_TAG}-panel`}>
      <h3>Return catch-up debug</h3>
      <p>Contains resident secrets and spoilers.</p>
      <button type="button" onClick={() => void load()}>
        Inspect catch-up
      </button>
      {error ? <p role="alert">{error}</p> : null}
      {account !== undefined ? (
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(account, null, 2)}</pre>
      ) : null}
    </section>
  );
}
