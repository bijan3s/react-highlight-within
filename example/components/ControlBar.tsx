import React from "react";
import { Toggle } from "./Toggle";
import { ThemeToggle } from "./ThemeToggle";

interface ControlBarProps {
  search: string;
  onSearch: (value: string) => void;
  highlightInput: boolean;
  onToggleInput: () => void;
  highlightTextarea: boolean;
  onToggleTextarea: () => void;
}

export const ControlBar = ({
  search,
  onSearch,
  highlightInput,
  onToggleInput,
  highlightTextarea,
  onToggleTextarea,
}: ControlBarProps) => (
  <div className="control-bar">
    <label className="field">
      Search term
      <input
        className="search-input"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Try signal, nested, archive, relay…"
      />
    </label>

    <Toggle pressed={highlightInput} onToggle={onToggleInput}>
      highlightInput
    </Toggle>

    <Toggle pressed={highlightTextarea} onToggle={onToggleTextarea}>
      highlightTextarea
    </Toggle>

    <ThemeToggle />
  </div>
);
