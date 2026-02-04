import React, { useState } from "react";

export default function CollapsibleCard({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="cycle-card">
      <button
        type="button"
        className="cycle-card-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="cycle-card-toggle-left">
          <h3 className="cycle-card-title">{title}</h3>
          {badge ? <span className={`pill ${badge.className || ""}`}>{badge.text}</span> : null}
        </div>
        <span className="cycle-card-chevron">{open ? "▾" : "▸"}</span>
      </button>

      {open && <div className="cycle-card-body">{children}</div>}
    </div>
  );
}
