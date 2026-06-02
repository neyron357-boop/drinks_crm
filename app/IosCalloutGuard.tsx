"use client";

import { useEffect } from "react";

const allowedInputTypes = new Set(["text", "search", "email", "tel", "url", "password", "number"]);
const textControlSelector = 'textarea, input, [contenteditable="true"], [contenteditable="plaintext-only"]';
const tapSurfaceSelector = [
  "button",
  "summary",
  "a[href]",
  '[role="button"]',
  ".tap-target",
  ".inventory-list-row",
  ".product-pick"
].join(",");

function closestTextControl(element: HTMLElement | null) {
  return element?.closest(textControlSelector) as HTMLElement | null;
}

function isRealTextField(element: HTMLElement | null) {
  const candidate = closestTextControl(element);
  if (!candidate) return false;

  if (candidate instanceof HTMLTextAreaElement) {
    return !candidate.readOnly && !candidate.disabled;
  }

  if (candidate instanceof HTMLInputElement) {
    const type = (candidate.getAttribute("type") ?? "text").toLowerCase();
    return allowedInputTypes.has(type) && !candidate.readOnly && !candidate.disabled;
  }

  return candidate.isContentEditable;
}

function clearSelection() {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) selection.removeAllRanges();
}

function blurActiveTextControl() {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const candidate = closestTextControl(active);
  if (candidate) candidate.blur();
}

export function IosCalloutGuard() {
  useEffect(() => {
    const blockCallout = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (isRealTextField(target)) return;
      clearSelection();
      event.preventDefault();
    };

    const prepareTap = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target || isRealTextField(target)) return;
      clearSelection();
      if (target.closest(tapSurfaceSelector)) blurActiveTextControl();
    };

    document.addEventListener("pointerdown", prepareTap, true);
    document.addEventListener("touchstart", prepareTap, true);
    document.addEventListener("mousedown", prepareTap, true);
    document.addEventListener("contextmenu", blockCallout, true);
    document.addEventListener("selectstart", blockCallout, true);

    return () => {
      document.removeEventListener("pointerdown", prepareTap, true);
      document.removeEventListener("touchstart", prepareTap, true);
      document.removeEventListener("mousedown", prepareTap, true);
      document.removeEventListener("contextmenu", blockCallout, true);
      document.removeEventListener("selectstart", blockCallout, true);
    };
  }, []);

  return null;
}
