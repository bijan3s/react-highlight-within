import React from "react";
import { Card } from "./Card";

export const BiDiCard = () => (
  <Card eyebrow="Bi-directional text" title="LTR · RTL · mixed">
    <div className="bidi-stack">
      {/* ── hyphen-joined ── */}
      <p dir="ltr">signal-سیگنال-1</p>
      <p dir="ltr">سیگنال-signal-۱</p>
      <p dir="rtl">signal-سیگنال-1</p>
      <p dir="rtl">سیگنال-signal-۱</p>

      {/* ── multi-segment chains ── */}
      <p dir="ltr">en-فا-en-فا-42</p>
      <p dir="rtl">en-فا-en-فا-42</p>
      <p dir="ltr">signal-سیگنال-relay-رله-archive-آرشیو</p>
      <p dir="rtl">signal-سیگنال-relay-رله-archive-آرشیو</p>

      {/* ── underscore ── */}
      <p dir="ltr">signal_سیگنال_1</p>
      <p dir="rtl">سیگنال_signal_۱</p>
      <p dir="ltr">en_فا_en_فا_9</p>

      {/* ── dot-separated ── */}
      <p dir="ltr">signal.سیگنال.relay</p>
      <p dir="rtl">سیگنال.signal.رله</p>

      {/* ── slash ── */}
      <p dir="ltr">signal/سیگنال/1</p>
      <p dir="rtl">سیگنال/signal/۱</p>

      {/* ── colon ── */}
      <p dir="ltr">label: سیگنال-signal</p>
      <p dir="rtl">برچسب: signal-سیگنال</p>

      {/* ── hash / at-sign ── */}
      <p dir="ltr">#signal-سیگنال @relay-رله</p>
      <p dir="rtl">#سیگنال-signal @رله-relay</p>

      {/* ── parentheses ── */}
      <p dir="ltr">signal (سیگنال) relay</p>
      <p dir="rtl">سیگنال (signal) رله</p>
      <p dir="ltr">(signal-سیگنال) and (relay-رله)</p>

      {/* ── brackets / angle brackets ── */}
      <p dir="ltr">[signal-سیگنال] [relay-رله]</p>
      <p dir="rtl">[سیگنال-signal] [رله-relay]</p>

      {/* ── mixed numbers mid-word ── */}
      <p dir="ltr">test-1فا2en3-end</p>
      <p dir="rtl">تست-1en2فا3-پایان</p>
      <p dir="ltr">sig42nal-سیگ۴۲نال</p>

      {/* ── email / path-like ── */}
      <p dir="ltr">user-سیگنال@domain.com</p>
      <p dir="ltr">/path/سیگنال/signal/index</p>
      <p dir="rtl">/مسیر/signal/سیگنال/index</p>

      {/* ── sentence-level mixing ── */}
      <p dir="ltr">The word signal (سیگنال) appears in relay-رله contexts.</p>
      <p dir="rtl">کلمه سیگنال (signal) در محیط‌های relay-رله به‌کار می‌رود.</p>
      <p dir="ltr">demo-customer-9 with سیگنال-relay-رله inside ltr</p>
      <p dir="rtl">demo-customer-9 with سیگنال-relay-رله inside rtl</p>
    </div>
  </Card>
);
