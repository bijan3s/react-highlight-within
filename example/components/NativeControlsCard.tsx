import React from "react";
import { Card } from "./Card";

interface NativeControlsCardProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  textareaValue: string;
  onTextareaChange: (value: string) => void;
}

export const NativeControlsCard = ({
  inputValue,
  onInputChange,
  textareaValue,
  onTextareaChange,
}: NativeControlsCardProps) => (
  <Card eyebrow="Native controls" title="Editable input and textarea.">
    <div className="field-stack">
      <label className="field">
        Input
        <input
          className="control"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type freely…"
        />
      </label>

      <label className="field">
        Textarea
        <textarea
          className="control"
          value={textareaValue}
          onChange={(e) => onTextareaChange(e.target.value)}
        />
      </label>
    </div>
  </Card>
);
