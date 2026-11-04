import { useMemo, useState } from "react";
import { Search, Power, ChevronRight } from "lucide-react";
import NeoIcon, { type NeoIconName } from "./NeoIcon";

export type AppId = "explorer" | "projects" | "about" | "terminal" | "lab" | "resume" | "contact";
type StartMenuProps = { onOpenApp: (id: AppId) => void; onClose: () => void };
const apps: { id: AppId; title: string; icon: NeoIconName; subtitle: string }[] = [
  { id: "explorer", title: "File Explorer", icon: "explorer", subtitle: "Browse project files" },
  { id: "projects", title: "Projects", icon: "projects", subtitle: "Engineering work" },
  { id: "lab", title: "Robotics Lab", icon: "lab", subtitle: "Systems and telemetry" },
  { id: "terminal", title: "Terminal", icon: "terminal", subtitle: "Command interface" },
  { id: "resume", title: "Resume", icon: "resume", subtitle: "Experience and education" },
  { id: "about", title: "About Me", icon: "about", subtitle: "Profile and skills" },
  { id: "contact", title: "Contact", icon: "contact", subtitle: "Get in touch" },
];

export default function StartMenu({ onOpenApp, onClose }: StartMenuProps) {
  const [query, setQuery] = useState("");
  const filteredApps = useMemo(() => apps.filter((app) => app.title.toLowerCase().includes(query.toLowerCase())), [query]);
  const launch = (id: AppId) => { onOpenApp(id); onClose(); };
  return <div className="start-menu" onPointerDown={(event) => event.stopPropagation()}>
    <div className="start-menu-header"><div className="user-avatar"><span>J</span></div><div><strong>JXY</strong><span>Robotics · Controls · Software</span></div><small>PORTFOLIO OS</small></div>
    <div className="start-menu-body"><div className="start-menu-left"><div className="start-menu-label">Pinned applications</div>
      <div className="start-app-list">{filteredApps.map(({ id, title, icon, subtitle }) => <button key={id} onClick={() => launch(id)}><NeoIcon name={icon} size={34}/><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={13}/></button>)}
        {filteredApps.length === 0 && <p className="no-apps">No matching applications</p>}</div>
      <label className="start-menu-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programs and files..." aria-label="Search applications"/></label>
    </div><div className="start-menu-right"><span>SHORTCUTS</span><button onClick={() => launch("explorer")}>File Explorer</button><button onClick={() => launch("resume")}>Resume</button><button onClick={() => launch("projects")}>Projects</button><button onClick={() => launch("lab")}>Robotics Lab</button><button onClick={() => launch("contact")}>Contact</button><div className="start-menu-system"><span>JXY OS</span><small>Robotics Portfolio Edition</small></div></div></div>
    <div className="start-menu-footer"><span>All systems operational</span><button onClick={onClose} aria-label="Close Start menu"><Power size={15}/> Close</button></div>
  </div>;
}
