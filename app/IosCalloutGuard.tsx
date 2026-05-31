"use client";

import { useEffect } from "react";

const allowedInputTypes = new Set(["text", "search", "email", "tel", "url", "password", "number"]);

function isRealTextField(element: HTMLElement | null) {
  if (!element) return false;
  const candidate = element.closest(
    'textarea, input, [contenteditable="true"], [contenteditable="plaintext-only"]'
  ) as HTMLElement | null;
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

export function IosCalloutGuard() {
  useEffect(() => {
    const handler = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (isRealTextField(target)) return;
      event.preventDefault();
    };

    document.addEventListener("contextmenu", handler, true);
    document.addEventListener("selectstart", handler, true);

    return () => {
      document.removeEventListener("contextmenu", handler, true);
      document.removeEventListener("selectstart", handler, true);
    };
  }, []);

  return null;
}
