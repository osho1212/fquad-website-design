import React from "react";

type Block =
  | { type: "p"; text: string }
  | { type: "h2" | "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

const HEADING = /^(#{1,3})\s+(.+)$/;
const BULLET = /^[-*•]\s+(.+)$/;

/**
 * The journal body is plain text from a textarea: paragraphs are separated by
 * a blank line. A few light conventions are honoured so longer entries can
 * have structure — "## Heading", "### Subheading", "> quote" and "- list".
 * Everything is rendered as text nodes (never HTML), so a post can't inject markup.
 */
export function parseBody(body: string): Block[] {
  // Browsers submit textareas with CRLF line endings, so normalise first —
  // otherwise "\n\n" never matches and the whole post becomes one paragraph.
  const chunks = body
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  const blocks: Block[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((l) => l.trim());

    // A heading line may be followed by its first paragraph with no blank line.
    const heading = lines[0].match(HEADING);
    if (heading) {
      // The page title is the only h1, so "#" and "##" both become h2.
      blocks.push({ type: heading[1].length >= 3 ? "h3" : "h2", text: heading[2] });
      const rest = lines.slice(1).join("\n").trim();
      if (rest) blocks.push({ type: "p", text: rest });
      continue;
    }

    if (lines.every((l) => BULLET.test(l))) {
      blocks.push({ type: "list", items: lines.map((l) => l.replace(BULLET, "$1")) });
      continue;
    }

    if (lines.every((l) => l.startsWith(">"))) {
      blocks.push({ type: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join("\n") });
      continue;
    }

    blocks.push({ type: "p", text: lines.join("\n") });
  }

  return blocks;
}

/**
 * Long-form text set to a readable measure (the container caps the line at
 * ~68 characters; 17–18px type at a 1.85 line height).
 */
export function Prose({ body }: { body: string }) {
  const blocks = parseBody(body);

  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="m-0 mt-14 mb-5 first:mt-0 text-xl sm:text-2xl leading-snug tracking-tight uppercase text-white"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="m-0 mt-10 mb-4 first:mt-0 text-base sm:text-lg leading-snug tracking-[0.08em] uppercase text-white"
              >
                {block.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="m-0 mb-7 border-l border-white/40 pl-6 sm:pl-8 text-lg sm:text-xl italic leading-relaxed text-white/80 whitespace-pre-line"
              >
                {block.text}
              </blockquote>
            );
          case "list":
            return (
              <ul
                key={i}
                className="m-0 mb-7 pl-6 list-disc marker:text-white/70 space-y-2 text-base sm:text-lg leading-[1.8] text-white/80"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default:
            return (
              <p
                key={i}
                className="m-0 mb-7 last:mb-0 text-base sm:text-lg leading-[1.85] text-white/80 whitespace-pre-line"
              >
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
