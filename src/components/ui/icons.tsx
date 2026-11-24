import type { SVGProps } from "react";
import {
  siClaude,
  siCss,
  siGithub,
  siHtml5,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siX,
} from "simple-icons";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d={siGithub.path} />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d={siX.path} />
    </Svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </Svg>
  );
}

const techIcons: Record<string, { path: string; hex: string }> = {
  javascript: siJavascript,
  typescript: siTypescript,
  react: siReact,
  nextdotjs: siNextdotjs,
  html5: siHtml5,
  css: siCss,
  tailwindcss: siTailwindcss,
  nodedotjs: siNodedotjs,
  mongodb: siMongodb,
  postgresql: siPostgresql,
  supabase: siSupabase,
  python: siPython,
  claude: siClaude,
};

/** Tech logo with a monogram fallback for anything not in simple-icons. */
export function TechIcon({ name, icon, size = 18 }: { name: string; icon?: string; size?: number }) {
  const si = icon ? techIcons[icon] : undefined;
  if (si) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={si.path} />
      </svg>
    );
  }
  const letters = name
    .replace(/[^A-Za-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-grid place-items-center rounded-[5px] border border-current/30 font-mono text-[9px] font-semibold leading-none"
      style={{ width: size, height: size }}
    >
      {letters}
    </span>
  );
}
