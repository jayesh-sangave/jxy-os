import type { SVGProps } from "react";

export type NeoIconName = "explorer" | "projects" | "about" | "terminal" | "lab" | "resume" | "contact";
type Props = SVGProps<SVGSVGElement> & { name: NeoIconName; size?: number };

/** Small glossy, neo-retro app icons designed for the JXY OS desktop. */
export default function NeoIcon({ name, size = 40, ...props }: Props) {
  const id = `neo-${name}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#ffffff"/><stop offset=".32" stopColor="#bfe7ff"/><stop offset="1" stopColor="#3475b7"/></linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff2a8"/><stop offset=".45" stopColor="#f6c34f"/><stop offset="1" stopColor="#bb7622"/></linearGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a8e7ff"/><stop offset=".42" stopColor="#388ed5"/><stop offset="1" stopColor="#164475"/></linearGradient>
        <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#354d70"/><stop offset="1" stopColor="#08182d"/></linearGradient>
        <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b8ff9e"/><stop offset=".5" stopColor="#48c35c"/><stop offset="1" stopColor="#13713c"/></linearGradient>
        <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffb6a6"/><stop offset=".5" stopColor="#ec645b"/><stop offset="1" stopColor="#a92535"/></linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/><feOffset dy="2"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g filter={`url(#${id}-shadow)`} strokeLinejoin="round" strokeLinecap="round">
        {name === "explorer" && <>
          <path d="M7 18a5 5 0 0 1 5-5h15l6 6h19a5 5 0 0 1 5 5v25a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5Z" fill="#9b631a" stroke="#ffe5a3" strokeWidth="2"/>
          <path d="M6 25a5 5 0 0 1 5-5h41a5 5 0 0 1 5 5v23a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5Z" fill="url(#neo-explorer-gold)" stroke="#fff2c5" strokeWidth="2"/>
          <path d="M9 29h44l-6 19H6Z" fill="#f7d77d" opacity=".9"/><path d="M11 24h39" stroke="#fff" strokeWidth="2" opacity=".8"/>
        </>}
        {name === "projects" && <>
          <path d="M7 18a5 5 0 0 1 5-5h15l6 6h19a5 5 0 0 1 5 5v25a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5Z" fill="url(#neo-projects-gold)" stroke="#fff0bd" strokeWidth="2"/>
          <circle cx="39" cy="37" r="12" fill="#526b8a" stroke="#d5efff" strokeWidth="3"/><circle cx="39" cy="37" r="5" fill="#d7e5ef" stroke="#38516d" strokeWidth="2"/>
          <path d="m39 21 2 5 5 1-3 4 1 5-5-2-4 2 1-5-3-4 5-1Z" fill="#f6d77c" stroke="#a16a22" strokeWidth="1.5"/>
        </>}
        {name === "about" && <>
          <rect x="10" y="10" width="44" height="44" rx="5" fill="url(#neo-about-blue)" stroke="#d9f1ff" strokeWidth="2"/><rect x="14" y="14" width="36" height="36" rx="3" fill="#f4f7fa" stroke="#4f789e"/>
          <circle cx="27" cy="27" r="7" fill="#e5b17a" stroke="#8c5630" strokeWidth="1.5"/><path d="M17 44c1-8 5-11 10-11s9 3 10 11" fill="#4287bd" stroke="#23547b" strokeWidth="2"/>
          <path d="M40 23h6M40 29h6M40 35h6M18 48h28" stroke="#7b91a5" strokeWidth="2"/>
        </>}
        {name === "terminal" && <>
          <rect x="6" y="9" width="52" height="39" rx="5" fill="url(#neo-terminal-dark)" stroke="#a8dfff" strokeWidth="2.5"/><rect x="10" y="13" width="44" height="31" rx="2" fill="#07131b" stroke="#5d9fca"/>
          <path d="m17 22 7 5-7 5M29 33h13" fill="none" stroke="#76f18b" strokeWidth="3"/><path d="M22 50h20l4 5H18Z" fill="#9cb5c8" stroke="#f2fbff" strokeWidth="1.5"/><path d="M25 49h14" stroke="#536c80" strokeWidth="2"/>
        </>}
        {name === "lab" && <>
          <path d="M32 6 53 17v28L32 58 11 45V17Z" fill="url(#neo-lab-blue)" stroke="#c7f0ff" strokeWidth="2.5"/>
          <rect x="17" y="18" width="30" height="27" rx="9" fill="#dcebf2" stroke="#6c8da6" strokeWidth="2"/><rect x="21" y="24" width="22" height="13" rx="4" fill="#122d43" stroke="#6bb9ec"/>
          <circle cx="27" cy="30" r="3" fill="#6affb0"/><circle cx="37" cy="30" r="3" fill="#6affb0"/><path d="M26 41h12" stroke="#6d8190" strokeWidth="2.5"/><path d="M32 10v7m-4-7h8" stroke="#fff3ac" strokeWidth="2.5"/>
          <path d="M14 28h4M46 28h4M24 48v5m16-5v5" stroke="#f6bf52" strokeWidth="2.5"/>
        </>}
        {name === "resume" && <>
          <path d="M15 7h25l11 11v38H15a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z" fill="#f6fbff" stroke="#b9dcf5" strokeWidth="2"/><path d="M40 7v12h11" fill="#9dd5f6" stroke="#71a9d0" strokeWidth="2"/>
          <rect x="18" y="25" width="28" height="5" rx="2" fill="#327eb5"/><path d="M19 36h26M19 42h23M19 48h15" stroke="#8298ab" strokeWidth="2.5"/><circle cx="45" cy="46" r="9" fill="url(#neo-resume-red)" stroke="#ffe0d4" strokeWidth="1.5"/><path d="m41 46 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2"/>
        </>}
        {name === "contact" && <>
          <rect x="7" y="15" width="50" height="36" rx="5" fill="url(#neo-contact-blue)" stroke="#d9f2ff" strokeWidth="2.5"/><path d="m9 19 23 18 23-18" fill="none" stroke="#fff" strokeWidth="4"/><path d="m9 48 17-14m29 14L38 34" stroke="#73b9eb" strokeWidth="3"/><path d="M11 17h42" stroke="#fff" strokeWidth="2" opacity=".7"/>
        </>}
      </g>
      <path d="M13 9c9-6 27-7 38 1" fill="none" stroke="#fff" strokeWidth="2" opacity=".3"/>
    </svg>
  );
}
