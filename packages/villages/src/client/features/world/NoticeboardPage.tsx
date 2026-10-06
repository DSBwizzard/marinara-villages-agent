import { ELEMENT_TAG } from "../../shared/constants.js";
import type { MenuScreenController } from "../settings/screen-contracts.js";

export function renderNoticeboardPage(
  ports: Pick<
    MenuScreenController,
    "addNotice" | "busy" | "noticeDraft" | "removeNotice" | "setNoticeDraft" | "snapshot"
  >,
) {
  const { addNotice, busy, noticeDraft, removeNotice, setNoticeDraft, snapshot } = ports;
  return (
    <div className={`${ELEMENT_TAG}-overlay`}>
      <div className={`${ELEMENT_TAG}-overlay-head`}>
        <h2 className={`${ELEMENT_TAG}-panel-title`}>Noticeboard</h2>
      </div>
      {snapshot.noticeboard.length === 0 ? (
        <p className={`${ELEMENT_TAG}-empty`}>
          Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation — and they
          will pin notes of their own up as time goes on.
        </p>
      ) : (
        <ul className={`${ELEMENT_TAG}-notices`}>
          {snapshot.noticeboard.map((notice, index) => (
            <li key={`${index}:${notice.text}`} className={`${ELEMENT_TAG}-notice-row`}>
              <span>
                {/* The signature first, the way a note on a board is
                              read: who is asking, then what they want. Your
                              own pins have no name on them — everyone here
                              already knows who you are. */}
                {notice.author.length > 0 ? (
                  <span className={`${ELEMENT_TAG}-notice-author`}>{`${notice.author}: `}</span>
                ) : null}
                {notice.text}
              </span>
              <button
                type="button"
                className={`${ELEMENT_TAG}-remove`}
                onClick={() => void removeNotice(index)}
                disabled={busy}
                aria-label={`Take down: ${notice.text}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={`${ELEMENT_TAG}-notice-add`}>
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          type="text"
          value={noticeDraft}
          maxLength={snapshot.settings.maxNoticeLength}
          placeholder="Pin up a rumour, an event, a rule…"
          aria-label="New noticeboard note"
          onChange={(event) => setNoticeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            void addNotice();
          }}
        />
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          onClick={() => void addNotice()}
          disabled={
            busy ||
            noticeDraft.trim().length === 0 ||
            snapshot.noticeboard.length >= snapshot.settings.maxNoticeboardNotes
          }
        >
          {`Pin it up (${snapshot.noticeboard.length}/${snapshot.settings.maxNoticeboardNotes})`}
        </button>
      </div>
    </div>
  );
}
