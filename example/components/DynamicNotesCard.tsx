import React from "react";
import { Card } from "./Card";

interface DynamicNotesCardProps {
  notes: string[];
  onAddNote: () => void;
}

export const DynamicNotesCard = ({
  notes,
  onAddNote,
}: DynamicNotesCardProps) => (
  <Card eyebrow="Dynamic content" title="MutationObserver picks up new nodes.">
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
    <button type="button" className="btn" onClick={onAddNote}>
      Add note
    </button>
  </Card>
);
