import React from "react";

type BulletLine = { type: "bullet"; text: string; indent: number };
type ParsedLine = BulletLine | { type: "paragraph"; text: string } | { type: "space" };

function tokenize(input: string): ParsedLine[] {
  return input.split("\n").map((line) => {
    if (!line.trim()) {
      return { type: "space" as const };
    }

    const nestedMatch = line.match(/^(\s+)-\s+(.*)$/);
    if (nestedMatch) {
      return {
        type: "bullet" as const,
        text: nestedMatch[2],
        indent: Math.max(1, Math.floor(nestedMatch[1].length / 2)),
      };
    }

    const bulletMatch = line.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      return {
        type: "bullet" as const,
        text: bulletMatch[1],
        indent: 0,
      };
    }

    return { type: "paragraph" as const, text: line.trim() };
  });
}

export function renderRichText(input: string, baseKey: string) {
  const lines = tokenize(input);
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.type === "paragraph") {
      blocks.push(
        <p key={`${baseKey}-p-${index}`} style={{ margin: "0 0 10px", lineHeight: 1.7 }}>
          {line.text}
        </p>,
      );
      index += 1;
      continue;
    }

    if (line.type === "space") {
      blocks.push(<div key={`${baseKey}-space-${index}`} style={{ height: 10 }} />);
      index += 1;
      continue;
    }

    const bullets: BulletLine[] = [];
    while (index < lines.length && lines[index].type === "bullet") {
      bullets.push(lines[index] as BulletLine);
      index += 1;
    }

    const topLevel = bullets.filter((item) => item.indent === 0);
    blocks.push(
      <ul key={`${baseKey}-ul-${index}`} style={{ margin: "0 0 12px", paddingLeft: 22 }}>
        {topLevel.map((item, topIndex) => {
          const start = bullets.indexOf(item);
          const nextStart = topIndex < topLevel.length - 1 ? bullets.indexOf(topLevel[topIndex + 1]) : bullets.length;
          const nested = bullets.slice(start + 1, nextStart).filter((child) => child.indent > 0);

          return (
            <li key={`${baseKey}-li-${topIndex}`} style={{ marginBottom: 6, lineHeight: 1.7 }}>
              {item.text}
              {nested.length > 0 ? (
                <ul style={{ marginTop: 6, paddingLeft: 20, listStyleType: "circle" }}>
                  {nested.map((child, childIndex) => (
                    <li key={`${baseKey}-nested-${topIndex}-${childIndex}`} style={{ marginBottom: 4 }}>
                      {child.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>,
    );
  }

  return blocks;
}
