// Simple client-side HTML sanitizer to reduce XSS risk.
// NOTE: This is not as complete as libraries like DOMPurify, but cukup untuk use case CV ini.

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, "text/html");

  const dangerousTags = ["script", "style", "iframe", "object", "embed", "link", "meta"];

  dangerousTags.forEach((tag) => {
    const elements = doc.getElementsByTagName(tag);
    while (elements[0]) {
      elements[0].parentNode?.removeChild(elements[0]);
    }
  });

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const nodesToClean: Element[] = [];
  while (walker.nextNode()) {
    const el = walker.currentNode as Element;
    nodesToClean.push(el);
  }

  for (const el of nodesToClean) {
    // Remove event handler attributes (onClick, onLoad, dll)
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }

      // Prevent javascript: URLs
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  }

  return doc.body.innerHTML;
}
