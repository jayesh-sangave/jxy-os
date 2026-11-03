import { useMemo, useState } from "react";
import {
  Search,
  Folder,
  FileText,
  Terminal,
  Cpu,
  Mail,
  Power,
} from "lucide-react";

export type AppId =
  | "projects"
  | "about"
  | "terminal"
  | "lab"
  | "resume"
  | "contact";

type StartMenuProps = {
  onOpenApp: (id: AppId) => void;
  onClose: () => void;
};

const apps: {
  id: AppId;
  title: string;
  icon: typeof Folder;
}[] = [
  { id: "projects", title: "My Projects", icon: Folder },
  { id: "about", title: "About Me", icon: FileText },
  { id: "lab", title: "Robotics Lab", icon: Cpu },
  { id: "terminal", title: "Terminal", icon: Terminal },
  { id: "resume", title: "Resume", icon: FileText },
  { id: "contact", title: "Contact", icon: Mail },
];

export default function StartMenu({
  onOpenApp,
  onClose,
}: StartMenuProps) {
  const [query, setQuery] = useState("");

  const filteredApps = useMemo(
    () =>
      apps.filter((app) =>
        app.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const launch = (id: AppId) => {
    onOpenApp(id);
    onClose();
  };

  return (
    <div
      className="start-menu"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="start-menu-header">
        <div className="user-avatar">J</div>
        <div>
          <strong>JXY</strong>
          <span>Engineer · Developer</span>
        </div>
      </div>

      <div className="start-menu-body">
        <div className="start-menu-left">
          <div className="start-menu-label">Pinned applications</div>

          <div className="start-app-list">
            {filteredApps.map(({ id, title, icon: Icon }) => (
              <button key={id} onClick={() => launch(id)}>
                <Icon size={22} />
                <span>{title}</span>
              </button>
            ))}

            {filteredApps.length === 0 && (
              <p className="no-apps">No matching applications</p>
            )}
          </div>

          <div className="start-menu-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applications..."
              aria-label="Search applications"
            />
          </div>
        </div>

        <div className="start-menu-right">
          <button onClick={() => launch("resume")}>Resume</button>
          <button onClick={() => launch("projects")}>Projects</button>
          <button onClick={() => launch("lab")}>Robotics Lab</button>
          <button onClick={() => launch("contact")}>Contact</button>
        </div>
      </div>

      <div className="start-menu-footer">
        <span>JXY OS · Portfolio Edition</span>
        <button onClick={onClose} aria-label="Close Start menu">
          <Power size={16} />
          Close
        </button>
      </div>
    </div>
  );
}