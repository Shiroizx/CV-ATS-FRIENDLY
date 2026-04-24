import { useEffect, useMemo, useRef } from "react";
import mermaid from "mermaid";

interface MermaidBlockProps {
  diagram: string;
}

export default function MermaidBlock({ diagram }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const id = useMemo(() => `mmd-${crypto.randomUUID()}`, []);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    void (async () => {
      try {
        const { svg } = await mermaid.render(id, diagram);
        if (cancelled) return;
        el.innerHTML = svg;
      } catch (e) {
        if (cancelled) return;
        el.innerHTML = `<pre style="white-space:pre-wrap">${diagram.replaceAll("<", "&lt;")}</pre>`;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [diagram, id]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 overflow-x-auto">
      <div ref={containerRef} />
    </div>
  );
}

