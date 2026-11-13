export function FoundingGuide({ children }: { children: string }) {
  return (
    <aside className="villages-founding-guide" aria-label="Professor Mari">
      <img
        src="/sprites/mari/basic/pose-wave.webp"
        alt=""
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <div>
        <strong>Professor Mari</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}
