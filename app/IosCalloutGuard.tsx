"use client";

import { useEffect } from "react";

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

function clearSelection() {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) selection.removeAllRanges();
}

function collapseTextControlSelection(element: HTMLElement | null) {
  const candidate = closestTextControl(element);
  if (!candidate) return;

  if (candidate instanceof HTMLInputElement || candidate instanceof HTMLTextAreaElement) {
    try {
      const position = candidate.value.length;
      candidate.setSelectionRange(position, position);
    } catch {
      // Some native input types, for example date/number on mobile, do not expose selection ranges.
    }
  }
}

function blurActiveTextControl() {
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const candidate = closestTextControl(active);
  if (candidate) candidate.blur();
}

export function IosCalloutGuard() {
  useEffect(() => {
    const blockCallout = (event: Event) => {
      clearSelection();
      collapseTextControlSelection(event.target instanceof HTMLElement ? event.target : null);
      event.preventDefault();
    };

    const blockSelection = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      clearSelection();
      collapseTextControlSelection(target);
      if (target?.closest(tapSurfaceSelector) || closestTextControl(target)) return;
      event.preventDefault();
    };

    const prepareTap = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      clearSelection();
      collapseTextControlSelection(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      if (!target) return;
      if (target.closest(tapSurfaceSelector) || !closestTextControl(target)) blurActiveTextControl();
    };

    const collapseFocusedSelection = (event: Event) => {
      window.setTimeout(() => {
        clearSelection();
        collapseTextControlSelection(event.target instanceof HTMLElement ? event.target : null);
      }, 0);
    };

    const blockPasteInput = (event: Event) => {
      if (!(event instanceof InputEvent)) return;
      if (event.inputType !== "insertFromPaste" && event.inputType !== "insertFromDrop") return;
      clearSelection();
      collapseTextControlSelection(event.target instanceof HTMLElement ? event.target : null);
      event.preventDefault();
    };

    document.addEventListener("pointerdown", prepareTap, true);
    document.addEventListener("touchstart", prepareTap, true);
    document.addEventListener("mousedown", prepareTap, true);
    document.addEventListener("contextmenu", blockCallout, true);
    document.addEventListener("selectstart", blockSelection, true);
    document.addEventListener("selectionchange", clearSelection, true);
    document.addEventListener("dragstart", blockCallout, true);
    document.addEventListener("copy", blockCallout, true);
    document.addEventListener("cut", blockCallout, true);
    document.addEventListener("paste", blockCallout, true);
    document.addEventListener("beforeinput", blockPasteInput, true);
    document.addEventListener("focusin", collapseFocusedSelection, true);
    document.addEventListener("select", collapseFocusedSelection, true);

    return () => {
      document.removeEventListener("pointerdown", prepareTap, true);
      document.removeEventListener("touchstart", prepareTap, true);
      document.removeEventListener("mousedown", prepareTap, true);
      document.removeEventListener("contextmenu", blockCallout, true);
      document.removeEventListener("selectstart", blockSelection, true);
      document.removeEventListener("selectionchange", clearSelection, true);
      document.removeEventListener("dragstart", blockCallout, true);
      document.removeEventListener("copy", blockCallout, true);
      document.removeEventListener("cut", blockCallout, true);
      document.removeEventListener("paste", blockCallout, true);
      document.removeEventListener("beforeinput", blockPasteInput, true);
      document.removeEventListener("focusin", collapseFocusedSelection, true);
      document.removeEventListener("select", collapseFocusedSelection, true);
    };
  }, []);

  return null;
}
