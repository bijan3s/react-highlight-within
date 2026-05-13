import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { HighlightWithin, highlightWithin } from "react-highlight-within";

import "./styles.css";

const SignalStory = () => (
  <div className="story-grid">
    <article className="story-card story-card--hero">
      <span className="eyebrow">Nested Component</span>
      <h2>Signals flow through nested child components.</h2>
      <p>
        This text is rendered by a child component and highlighted after render
        by the wrapper component.
      </p>
    </article>

    <article className="story-card">
      <span className="eyebrow">Rendered Text</span>
      <p>
        Search for signal, archive, nested, or relay to confirm live updates.
      </p>
    </article>
  </div>
);

const LegacyPanel = ({ search }: { search: string }) => (
  <section className="panel legacy-panel">
    <span className="eyebrow">Legacy Function</span>
    {highlightWithin(
      <p>
        The original helper still works for literal JSX text, even while the
        component now covers rendered child output.
      </p>,
      {
        search,
        bgColor: "#ffd978",
        textColor: "#1f1400",
      },
    )}
  </section>
);

const App = () => {
  const [search, setSearch] = useState("signal");
  const [highlightInput, setHighlightInput] = useState(true);
  const [highlightTextarea, setHighlightTextarea] = useState(true);
  const [notes, setNotes] = useState([
    "Signal archive synchronized with the relay.",
    "Nested content can now be highlighted after render.",
  ]);

  return (
    <div className="app-shell">
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />

      <main className="layout">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Preview App</span>
            <h1>Highlight rendered child content before you publish.</h1>
            <p>
              This Vite preview exercises the new wrapper component, dynamic
              content updates, and the legacy helper side by side.
            </p>
          </div>

          <form
            className="controls"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="field">
              Search term
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Try signal, nested, archive, relay"
              />
            </label>

            <button
              type="button"
              className="action"
              onClick={() =>
                setNotes((current) => [
                  ...current,
                  `Signal note ${current.length + 1} arrived from a dynamic child branch.`,
                ])
              }
            >
              Add dynamic note
            </button>

            <div className="toggle-row">
              <button
                type="button"
                className="toggle-chip"
                aria-pressed={highlightInput}
                onClick={() => setHighlightInput((current) => !current)}
              >
                highlightInput: {highlightInput ? "on" : "off"}
              </button>

              <button
                type="button"
                className="toggle-chip"
                aria-pressed={highlightTextarea}
                onClick={() => setHighlightTextarea((current) => !current)}
              >
                highlightTextarea: {highlightTextarea ? "on" : "off"}
              </button>
            </div>
          </form>
        </section>

        <HighlightWithin
          as="section"
          search={search}
          highlightInput={highlightInput}
          highlightTextarea={highlightTextarea}
          className="preview-grid"
          style={{ display: "grid" }}
        >
          <section className="panel panel--wide">
            <SignalStory />
          </section>

          <section className="panel">
            <span className="eyebrow">Dynamic Children</span>
            <ul className="note-list">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <span className="eyebrow">Native Controls</span>
            <p>
              These fields now opt into highlighting through props on the
              wrapper. Toggle them above to verify input and textarea behavior
              separately.
            </p>

            <div className="field-stack">
              <label className="field">
                Native input
                <input value={`Input value now mirrors: ${search}`} readOnly />
              </label>

              <label className="field">
                Native textarea
                <textarea
                  value={`Textarea value now mirrors: ${search}`}
                  readOnly
                />
              </label>
            </div>
          </section>
        </HighlightWithin>

        <LegacyPanel search={search} />
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
