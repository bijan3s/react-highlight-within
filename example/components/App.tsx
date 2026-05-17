import React, { useState } from "react";
import { HighlightWithin, highlightWithin } from "react-highlight-within";
import { Eyebrow } from "./Eyebrow";
import { Card } from "./Card";
import { ControlBar } from "./ControlBar";
import { BiDiCard } from "./BiDiCard";
import { DynamicNotesCard } from "./DynamicNotesCard";
import { NativeControlsCard } from "./NativeControlsCard";
import { useTheme } from "./useTheme";

const CONTROL_BG: Record<"light" | "dark", string> = {
  light: "#fde68a", // amber-200 — warm yellow, readable over dark text
  dark: "#92400e", // amber-800 — rich brown-amber, readable over light text
};

export const App = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("signal");
  const [highlightInput, setHighlightInput] = useState(true);
  const [highlightTextarea, setHighlightTextarea] = useState(true);
  const [notes, setNotes] = useState([
    "Signal archive synchronized with the relay.",
    "Nested content can now be highlighted after render.",
  ]);
  const [inputValue, setInputValue] = useState(
    "Signal frequency — try editing this input live.",
  );
  const [textareaValue, setTextareaValue] = useState(
    "This is a real textarea.\nType anything containing 'signal' and watch it light up.",
  );

  return (
    <div className="app">
      <header className="page-header">
        <div className="container">
          <Eyebrow>react-highlight-within</Eyebrow>
          <h1>Highlight search matches anywhere on the page.</h1>
          <p className="lead">
            Rendered content, nested children, inputs, textareas — and now via{" "}
            <span className="kbd">MutationObserver</span> so dynamic content
            updates without re-walking the whole tree.
          </p>
        </div>
      </header>

      <main className="content container">
        <ControlBar
          search={search}
          onSearch={setSearch}
          highlightInput={highlightInput}
          onToggleInput={() => setHighlightInput((c) => !c)}
          highlightTextarea={highlightTextarea}
          onToggleTextarea={() => setHighlightTextarea((c) => !c)}
        />

        <HighlightWithin
          as="div"
          className="grid"
          search={search}
          highlightInput={highlightInput}
          highlightTextarea={highlightTextarea}
        >
          <Card
            eyebrow="Nested content"
            title="Signals flow through nested child components."
          >
            <p className="muted">
              This paragraph lives inside a child component. Highlights still
              find it without re-shaping your tree.
            </p>
          </Card>

          <BiDiCard />

          <DynamicNotesCard
            notes={notes}
            onAddNote={() =>
              setNotes((c) => [
                ...c,
                `Signal note ${c.length + 1} from a dynamic child.`,
              ])
            }
          />
        </HighlightWithin>
        <HighlightWithin
          search={search}
          bgColor={CONTROL_BG[theme]}
          highlightInput={highlightInput}
          highlightTextarea={highlightTextarea}
        >
          <NativeControlsCard
            inputValue={inputValue}
            onInputChange={setInputValue}
            textareaValue={textareaValue}
            onTextareaChange={setTextareaValue}
          />
        </HighlightWithin>

        <HighlightWithin search={search} asChild>
          <section className="card card--span">
            <Eyebrow>asChild — no wrapper rendered</Eyebrow>
            <h2>This section is the highlight root itself.</h2>
            <p className="muted">
              With <span className="kbd">asChild</span>, the component clones
              this single child and attaches its ref directly — no extra{" "}
              <span className="kbd">div</span> in the layout.
            </p>
          </section>
        </HighlightWithin>

        <HighlightWithin
          search={search}
          markClassName="demo-mark"
          as="section"
          className="card card--span"
        >
          <Eyebrow>markClassName — your CSS owns the styling</Eyebrow>
          <h2>Highlight signal markers via a CSS class.</h2>
          <p className="muted">
            This card sets{" "}
            <span className="kbd">markClassName="demo-mark"</span>, so the
            default inline colors are skipped and the rule in{" "}
            <span className="kbd">styles.css</span> takes over.
          </p>
        </HighlightWithin>

        <section className="card card--span">
          <Eyebrow>Legacy function</Eyebrow>
          {highlightWithin(
            <p className="muted">
              The original <span className="kbd">highlightWithin()</span> helper
              still works for ad-hoc highlighting of literal JSX text — kept for
              v1 compatibility.
            </p>,
            { search, markClassName: "demo-mark-legacy" },
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          MIT · v3 preview · prefers-color-scheme aware
        </div>
      </footer>
    </div>
  );
};
