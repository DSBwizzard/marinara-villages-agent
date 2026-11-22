export const DIALOGUE_READER_STYLES = `
.villages-dialogue-reader { min-width:0; border:1px solid var(--border); border-radius:.75rem; background:var(--popover); color:var(--foreground); font-family:var(--menu-font,Georgia,serif); box-shadow:0 .25rem .75rem #0004; }
.villages-dialogue-reader[hidden] { display:none!important; }
.villages-reader-content { min-width:0; padding:.75rem; }
.villages-reader-heading { display:flex; align-items:center; gap:.5rem; min-height:32px; margin-bottom:.4rem; }
.villages-reader-speaker { min-width:0; flex:1; font-size:1rem; font-weight:600; }
.villages-reader-speaker :is(p,strong) { margin:0!important; color:inherit; font:inherit; }
.villages-reader-speaker,.villages-reader-speaker>p { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.villages-reader-icon { flex:none; display:grid; place-items:center; width:1.5rem; height:1.5rem; }
.villages-reader-icon>svg { width:100%; height:100%; }
.villages-reader-actions { display:flex; align-items:center; gap:.5rem; flex:none; }
.villages-reader-actions button { min-height:32px; font:inherit; font-size:.8125rem; padding:.25rem .5rem; color:inherit; background:transparent; border:1px solid var(--border); border-radius:.5rem; cursor:pointer; }
.villages-reader-actions button:disabled { opacity:.5; cursor:default; }
.villages-reader-footer { position:relative; margin:0 .75rem; padding:.5rem 0; border-top:1px solid var(--border); }
.villages-reader-counter { font-size:.8125rem; white-space:nowrap; text-align:center; }
.villages-dialogue-reader .marinara-capability-villages-chat-vn-reading { min-height:4.5em; font-size:1rem; }
.villages-dialogue-reader .marinara-capability-villages-chat-vn-reading>p { font-size:inherit; line-height:1.5; margin:0; }
.villages-reading-measure { position:fixed!important; top:0; left:-100000px; visibility:hidden; pointer-events:none; height:auto!important; max-height:none!important; margin:0!important; overflow:visible; }
@media(max-width:727px) {
 .villages-reader-content { padding:.5rem .625rem; }
 .villages-reader-heading { gap:.375rem; }
 .villages-reader-actions { gap:.25rem; }
 .villages-reader-actions button { min-height:44px; margin-block:-6px; padding-inline:.4rem; }
 .villages-reader-footer { margin-inline:.625rem; }
}
`;
