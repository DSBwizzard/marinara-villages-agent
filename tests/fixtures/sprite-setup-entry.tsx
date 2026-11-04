import { createRoot } from "react-dom/client";
import { useState } from "react";
import { SpriteSetupDialog } from "../../packages/villages/src/client/features/residents/SpriteSetupDialog.js";
function App() {
  const [open, setOpen] = useState(false),
    [added, setAdded] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [existing, setExisting] = useState(false);
  const [preparedRevision, setPreparedRevision] = useState<number>();
  return (
    <>
      <button onClick={() => setOpen(true)}>Choose Bupkis</button>
      <button onClick={() => setFailNext(true)}>Fail next addition</button>
      <button onClick={() => setPreparedRevision(1)}>Use saved sprite choice</button>
      <button
        onClick={() => {
          setExisting(true);
          setOpen(true);
        }}
      >
        Review resident sprites
      </button>
      {added ? <p>Bupkis added</p> : null}
      {open ? (
        <SpriteSetupDialog
          characterId="bupkis"
          name="Bupkis"
          existing={existing}
          preserveSelection={preparedRevision !== undefined}
          portrait={{
            url: "http://villages.test/portrait.png",
            crop: { srcX: 0.25, srcY: 0.1, srcWidth: 0.3, srcHeight: 0.3 },
          }}
          onClose={(revision) => {
            document.getElementById("app")!.dataset.closedRevision = String(revision);
            setOpen(false);
          }}
          onDone={(revision) => {
            if (failNext) {
              setFailNext(false);
              throw new Error("Move-in failed.");
            }
            document.getElementById("app")!.dataset.spriteRevision = String(revision);
            setPreparedRevision(revision);
            setAdded(true);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
