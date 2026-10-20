import { createRoot } from "react-dom/client";
import { useState } from "react";
import { SpriteSetupDialog } from "../../packages/villages/src/client/features/residents/SpriteSetupDialog.js";
function App() {
  const [open, setOpen] = useState(false),
    [added, setAdded] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Choose Bupkis</button>
      {added ? <p>Bupkis added</p> : null}
      {open ? (
        <SpriteSetupDialog
          characterId="bupkis"
          name="Bupkis"
          portrait={{
            url: "http://villages.test/portrait.png",
            crop: { srcX: 0.25, srcY: 0.1, srcWidth: 0.3, srcHeight: 0.3 },
          }}
          onClose={() => setOpen(false)}
          onDone={() => {
            setAdded(true);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
createRoot(document.getElementById("app")!).render(<App />);
