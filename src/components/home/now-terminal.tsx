import type { NowItem } from "@/lib/types";
import { site } from "@/content/site";
import { LocalTime } from "./local-time";

/**
 * A small code-editor card showing the "Currently" data as a TypeScript object.
 * It's generated from the same data as the Currently section, so it's always in sync.
 */
export function NowTerminal({ items, updatedAt }: { items: NowItem[]; updatedAt: string | null }) {
  const clip = (t: string) => (t.length > 34 ? `${t.slice(0, 32).trimEnd()}…` : t);
  const first = (kind: NowItem["kind"]) => items.filter((i) => i.kind === kind).map((i) => clip(i.title));
  const rows: [string, string[]][] = [
    ["building", first("building")],
    ["learning", first("learning")],
    ["exploring", first("exploring")],
    ["writing", first("writing")],
  ].filter(([, v]) => (v as string[]).length > 0) as [string, string[]][];

  const lines: React.ReactNode[] = [
    <>
      <K>export const</K> <V>now</V> <P>=</P> <P>{"{"}</P>
    </>,
    ...rows.flatMap(([key, values]) =>
      values.length === 1
        ? [
            <>
              {"  "}
              <V>{key}</V>
              <P>:</P> <S>&quot;{values[0]}&quot;</S>
              <P>,</P>
            </>,
          ]
        : [
            <>
              {"  "}
              <V>{key}</V>
              <P>: [</P>
            </>,
            ...values.map((v) => (
              <>
                {"    "}
                <S>&quot;{v}&quot;</S>
                <P>,</P>
              </>
            )),
            <>
              {"  "}
              <P>],</P>
            </>,
          ],
    ),
    <>
      {"  "}
      <V>based</V>
      <P>:</P> <S>&quot;{site.location}&quot;</S>
      <P>,</P>
    </>,
    <>
      <P>{"}"}</P> <K>satisfies</K> <T>Life</T>
      <P>;</P>
    </>,
  ];

  return (
    <figure className="card overflow-hidden bg-elev/60 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>
        <figcaption className="font-mono text-xs text-subtle">~/now.ts</figcaption>
        <span className="font-mono text-[11px] text-subtle">
          <LocalTime timeZone={site.timezone} />
        </span>
      </div>
      <pre className="overflow-x-auto px-0 py-4 font-mono text-[12.5px] leading-[1.85] sm:text-[13px]">
        <code className="grid">
          {lines.map((line, i) => (
            <span key={i} className="grid grid-cols-[2.75rem_1fr] pr-4">
              <span className="select-none pr-4 text-right text-subtle/60">{i + 1}</span>
              <span className="whitespace-pre">{line}</span>
            </span>
          ))}
          <span className="grid grid-cols-[2.75rem_1fr]">
            <span className="select-none pr-4 text-right text-subtle/60">{lines.length + 1}</span>
            <span>
              <span className="caret" aria-hidden="true" />
            </span>
          </span>
        </code>
      </pre>
      {updatedAt && (
        <div className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-subtle">
          <span className="text-accent">✓</span> last updated{" "}
          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
            new Date(updatedAt),
          )}
        </div>
      )}
    </figure>
  );
}

const K = ({ children }: { children: React.ReactNode }) => <span className="text-[#c678dd] [:root[data-theme=light]_&]:text-[#8b3fb5]">{children}</span>;
const V = ({ children }: { children: React.ReactNode }) => <span className="text-fg">{children}</span>;
const S = ({ children }: { children: React.ReactNode }) => <span className="text-accent">{children}</span>;
const P = ({ children }: { children: React.ReactNode }) => <span className="text-subtle">{children}</span>;
const T = ({ children }: { children: React.ReactNode }) => <span className="text-[#56b6c2] [:root[data-theme=light]_&]:text-[#0e7490]">{children}</span>;
