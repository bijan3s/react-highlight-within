import React, { type ReactNode } from "react";

interface ToggleProps {
  pressed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const Toggle = ({ pressed, onToggle, children }: ToggleProps) => (
  <button
    type="button"
    className="toggle"
    aria-pressed={pressed}
    onClick={onToggle}
  >
    <span className="toggle-dot" aria-hidden="true" />
    {children}
  </button>
);
