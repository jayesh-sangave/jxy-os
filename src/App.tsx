import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  Folder, FolderOpen, FileText, File, Terminal, Cpu, Mail, Minus, Square, X,
  RefreshCw, Monitor, Maximize2, Activity, Radio, Gauge, Network, ChevronLeft,
  Home, HardDrive, Download, ExternalLink, Image as ImageIcon, Video, Box, Code2,
} from "lucide-react";
import StartMenu, { type AppId } from "./components/StartMenu";
import "./index.css";
import "./mobile-robotics.css";

type Snap = "none" | "left" | "right";
type WindowState = {
  id: AppId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  closing?: boolean;
  zIndex: number;
  position: { x: number; y: number };
  snap: Snap;
};

const appInfo: Record<AppId, { title: string; icon: typeof Folder }> = {
  explorer: { title: "File Explorer", icon: FolderOpen },
  projects: { title: "My Projects", icon: Folder },
  about: { title: "About Me", icon: FileText },
  terminal: { title: "Terminal", icon: Terminal },
  lab: { title: "Robotics Lab", icon: Cpu },
  resume: { title: "Resume", icon: FileText },
  contact: { title: "Contact", icon: Mail },
};
const desktopApps: AppId[] = ["explorer", "projects", "about", "lab", "terminal"];

function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [wallpaper, setWallpaper] = useState(0);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 700px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const openApp = (id: AppId) => {
    const existing = windows.find((win) => win.id === id);
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setContextMenu(null);
    if (existing) {
      setWindows((prev) => prev.map((win) => win.id === id
        ? { ...win, minimized: false, closing: false, zIndex: nextZ, snap: "none" }
        : win));
      return;
    }
    const offset = windows.length * 28;
    setWindows((prev) => [...prev, {
      id,
      title: appInfo[id].title,
      minimized: false,
      maximized: mobile,
      zIndex: nextZ,
      snap: "none",
      position: {
        x: Math.max(12, Math.min(180 + offset, window.innerWidth - 340)),
        y: Math.max(12, Math.min(80 + offset, window.innerHeight - 300)),
      },
    }]);
  };

  const focusWindow = (id: AppId) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) => prev.map((win) => win.id === id
      ? { ...win, minimized: false, closing: false, zIndex: nextZ }
      : win));
  };

  const closeWindow = (id: AppId) => {
    setWindows((prev) => prev.map((win) => win.id === id ? { ...win, closing: true } : win));
    window.setTimeout(() => setWindows((prev) => prev.filter((win) => win.id !== id)), 190);
  };
  const toggleMinimize = (id: AppId) => {
    setWindows((prev) => prev.map((win) => win.id === id ? { ...win, minimized: !win.minimized } : win));
  };
  const toggleMaximize = (id: AppId) => {
    setWindows((prev) => prev.map((win) => win.id === id
      ? { ...win, maximized: !win.maximized, snap: "none" }
      : win));
  };
  const handleTaskbarClick = (id: AppId) => {
    const selected = windows.find((win) => win.id === id);
    if (!selected) return;
    const highestZ = Math.max(...windows.filter((win) => !win.minimized).map((win) => win.zIndex), 0);
    if (!selected.minimized && selected.zIndex === highestZ) toggleMinimize(id);
    else focusWindow(id);
  };
  const handleDesktopPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    setStartOpen(false);
    setContextMenu(null);
    if (event.target === event.currentTarget) setSelectedIcon(null);
  };
  const handleContextMenu = (event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault();
    setContextMenu({
      x: Math.max(4, Math.min(event.clientX, window.innerWidth - 200)),
      y: Math.max(4, Math.min(event.clientY, window.innerHeight - 160)),
    });
    setSelectedIcon(null);
    setStartOpen(false);
  };

  useEffect(() => {
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStartOpen(false);
        setContextMenu(null);
        setSelectedIcon(null);
      }
    };
    window.addEventListener("keydown", closeMenus);
    return () => window.removeEventListener("keydown", closeMenus);
  }, []);

  return (
    <main
      className={`desktop wallpaper-${wallpaper} ${mobile ? "mobile-layout" : ""}`}
      onPointerDown={handleDesktopPointerDown}
      onContextMenu={handleContextMenu}
    >
      <div className="desktop-icons">
        {desktopApps.map((id) => {
          const Icon = appInfo[id].icon;
          return (
            <button
              className={`desktop-icon ${selectedIcon === id ? "selected" : ""}`}
              key={id}
              onClick={() => mobile ? openApp(id) : setSelectedIcon(id)}
              onDoubleClick={() => openApp(id)}
              onPointerDown={(event) => event.stopPropagation()}
              onContextMenu={(event) => {
                event.stopPropagation();
                event.preventDefault();
                setSelectedIcon(id);
                setContextMenu({
                  x: Math.min(event.clientX, window.innerWidth - 190),
                  y: Math.min(event.clientY, window.innerHeight - 150),
                });
              }}
            >
              <Icon size={36} strokeWidth={1.5} />
              <span>{appInfo[id].title}</span>
            </button>
          );
        })}
      </div>

      {windows.map((win) => (
        <Window
          key={win.id}
          window={win}
          mobile={mobile}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => toggleMinimize(win.id)}
          onMaximize={() => toggleMaximize(win.id)}
          onMove={(position) => setWindows((prev) => prev.map((item) => item.id === win.id
            ? { ...item, position, snap: "none" }
            : item))}
          onSnap={(snap) => setWindows((prev) => prev.map((item) => item.id === win.id
            ? { ...item, snap, maximized: false }
            : item))}
          onOpenApp={openApp}
        />
      ))}

      {contextMenu && (
        <div
          className="desktop-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button onClick={() => { setSelectedIcon(null); setContextMenu(null); }}><RefreshCw size={15} />Refresh</button>
          <div className="context-menu-divider" />
          <button onClick={() => { setWallpaper((current) => (current + 1) % 3); setContextMenu(null); }}><Monitor size={15} />Change wallpaper</button>
          <button onClick={() => { setContextMenu(null); setSelectedIcon(null); }}><Maximize2 size={15} />Personalize</button>
        </div>
      )}

      {startOpen && <StartMenu onOpenApp={openApp} onClose={() => setStartOpen(false)} />}
      <Taskbar
        windows={windows}
        onWindowClick={handleTaskbarClick}
        onStartClick={() => { setStartOpen((open) => !open); setContextMenu(null); }}
        startOpen={startOpen}
      />
    </main>
  );
}

function Window({ window: win, mobile, onFocus, onClose, onMinimize, onMaximize, onMove, onSnap, onOpenApp }: {
  window: WindowState;
  mobile: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onSnap: (snap: Snap) => void;
  onOpenApp: (id: AppId) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapPreview, setSnapPreview] = useState<Snap>("none");

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (mobile || win.maximized || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const visibleX = win.snap === "right" ? window.innerWidth / 2 : 0;
    setDragOffset({ x: event.clientX - (win.snap === "none" ? win.position.x : visibleX), y: event.clientY - (win.snap === "none" ? win.position.y : 0) });
    setDragging(true);
    onFocus();
  };
  const handleDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging || win.maximized) return;
    const x = Math.max(0, Math.min(event.clientX - dragOffset.x, window.innerWidth - 120));
    const y = Math.max(0, Math.min(event.clientY - dragOffset.y, window.innerHeight - 100));
    onMove({ x, y });
    setSnapPreview(event.clientX < 18 ? "left" : event.clientX > window.innerWidth - 18 ? "right" : "none");
  };
  const finishDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setDragging(false);
    setSnapPreview("none");
    if (event.clientY <= 12) onMaximize();
    else if (event.clientX <= 12) onSnap("left");
    else if (event.clientX >= window.innerWidth - 12) onSnap("right");
  };
  const snapStyle = win.snap === "left"
    ? { left: 0, top: 0, width: "50vw", height: "calc(100% - 40px)" }
    : win.snap === "right"
      ? { left: "50vw", top: 0, width: "50vw", height: "calc(100% - 40px)" }
      : { left: win.maximized ? 0 : win.position.x, top: win.maximized ? 0 : win.position.y };

  return (
    <section
      className={`window ${win.maximized ? "maximized" : ""} ${win.snap !== "none" ? "snapped" : ""} ${win.closing ? "window-closing" : ""} ${win.minimized ? "window-minimizing" : ""} ${dragging ? "window-dragging" : ""}`}
      style={{ ...snapStyle, zIndex: win.zIndex }}
      onPointerDown={onFocus}
    >
      <header
        className="window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={handleDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => { setDragging(false); setSnapPreview("none"); }}
        onDoubleClick={() => { if (!mobile) onMaximize(); }}
      >
        <span>{win.title}</span>
        <div className="window-controls">
          <button onPointerDown={(event) => event.stopPropagation()} onClick={onMinimize} aria-label="Minimize"><Minus size={14} /></button>
          <button onPointerDown={(event) => event.stopPropagation()} onClick={onMaximize} aria-label="Maximize"><Square size={12} /></button>
          <button className="close-button" onPointerDown={(event) => event.stopPropagation()} onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>
      </header>
      {snapPreview !== "none" && <div className={`snap-preview snap-${snapPreview}`} />}
      <div className={`window-content ${win.id === "terminal" ? "terminal-window-content" : ""}`}>
        {win.id === "explorer" && <FileExplorerView onOpenApp={onOpenApp} />}
        {win.id === "projects" && <ProjectsView />}
        {win.id === "about" && <AboutView />}
        {win.id === "lab" && <RoboticsLabView />}
        {win.id === "terminal" && <TerminalView onOpenApp={onOpenApp} />}
        {win.id === "resume" && <ResumeView />}
        {win.id === "contact" && <ContactView />}
      </div>
    </section>
  );
}

const projects = [
  { title: "Robocon Autonomous Robot", category: "Robotics", description: "A competition robot integrating motion control, localization, and autonomous navigation.", technologies: ["ROS 2", "C++", "Nav2", "OpenCV"] },
  { title: "LiDAR SLAM", category: "Localization", description: "A LiDAR-based mapping and localization pipeline using point-cloud processing and scan matching.", technologies: ["C++", "ROS 2", "PCL", "ICP"] },
  { title: "Motor Control System", category: "Embedded", description: "A real-time motor control system with encoder feedback, PID control, and CAN communication.", technologies: ["STM32", "C", "CAN", "PID"] },
];

function ProjectsView() {
  return (
    <div className="portfolio-page">
      <div className="portfolio-heading"><span className="eyebrow">SELECTED WORK</span><h2>Projects</h2><p>Things built, broken, debugged, and made to work.</p></div>
      <div className="project-grid">{projects.map((project, index) => (
        <article className="project-card" key={project.title}>
          <div className="project-card-top"><span className="project-number">{String(index + 1).padStart(2, "0")}</span><span className="project-category">{project.category}</span></div>
          <h3>{project.title}</h3><p>{project.description}</p>
          <div className="technology-tags">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
        </article>
      ))}</div>
    </div>
  );
}

function AboutView() {
  const skills = ["Robotics", "ROS 2", "C++", "Python", "Computer Vision", "Embedded Systems", "Control Systems", "SLAM"];
  return (
    <div className="portfolio-page">
      <div className="portfolio-heading"><span className="eyebrow">WHO I AM</span><h2>Engineer. Developer. Builder.</h2></div>
      <div className="about-layout"><div className="about-avatar">JX</div><div>
        <h3>Building systems that move.</h3>
        <p>I’m an engineering student focused on robotics, automation, and software. I enjoy working across the stack, from embedded firmware and motor control to perception and autonomous systems.</p>
        <p>Most of my learning happens through real projects: designing, testing, breaking things, and iterating until they work.</p>
      </div></div>
      <h3 className="section-heading">Technical toolbox</h3><div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
    </div>
  );
}

function RoboticsLabView() {
  const [tab, setTab] = useState<"telemetry" | "stack">("telemetry");
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 900);
    return () => window.clearInterval(timer);
  }, [running]);
  const battery = Math.max(18, 96 - (tick % 80) * 0.65);
  const vx = Math.sin(tick / 5) * 0.42;
  const wz = Math.cos(tick / 7) * 0.3;
  return (
    <div className="portfolio-page">
      <div className="portfolio-heading"><span className="eyebrow">ENGINEERING WORKSPACE · SIMULATION</span><h2>Robotics Lab</h2><p>Interactive robot telemetry and systems overview. Values below are simulated, not live hardware data.</p></div>
      <div className="robot-tabs">
        <button className={tab === "telemetry" ? "active" : ""} onClick={() => setTab("telemetry")}><Activity size={15} />Telemetry</button>
        <button className={tab === "stack" ? "active" : ""} onClick={() => setTab("stack")}><Network size={15} />Systems</button>
      </div>
      {tab === "telemetry" ? <>
        <div className="robot-status"><span className="status-dot" />SIMULATOR ONLINE <span className="sim-label">DEMO DATA</span><button onClick={() => setRunning((v) => !v)}>{running ? "Pause" : "Resume"}</button></div>
        <div className="telemetry-grid">
          <Metric icon={<Gauge size={17} />} label="Linear velocity" value={`${vx.toFixed(2)} m/s`} />
          <Metric icon={<Radio size={17} />} label="Angular velocity" value={`${wz.toFixed(2)} rad/s`} />
          <Metric icon={<Activity size={17} />} label="Battery" value={`${battery.toFixed(0)}%`} progress={battery} />
          <Metric icon={<Cpu size={17} />} label="Motor controller" value="NOMINAL" />
        </div>
        <div className="robot-visual"><div className="robot-grid-bg" /><div className="robot-chassis"><span className="robot-front">FRONT ↑</span><span className="wheel wheel-a" /><span className="wheel wheel-b" /><span className="wheel wheel-c" /><span className="robot-core">JXY</span></div><span className="robot-visual-caption">OMNI DRIVE · TOP VIEW · SIMULATED</span></div>
      </> : <div className="systems-list">
        <SystemRow name="ROS 2" detail="Distributed middleware" status="Software" />
        <SystemRow name="Nav2 / MPPI" detail="Autonomous navigation and control" status="Navigation" />
        <SystemRow name="LiDAR + IMU" detail="Perception and state estimation" status="Sensors" />
        <SystemRow name="STM32 / ODrive" detail="Motor control and CAN communication" status="Hardware" />
        <SystemRow name="Localization" detail="ICP, odometry, and sensor fusion" status="Algorithms" />
      </div>}
    </div>
  );
}

function Metric({ icon, label, value, progress }: { icon: ReactNode; label: string; value: string; progress?: number }) {
  return <article className="metric-card"><div className="metric-label">{icon}{label}</div><strong>{value}</strong>{progress !== undefined && <div className="metric-track"><span style={{ width: `${progress}%` }} /></div>}</article>;
}
function SystemRow({ name, detail, status }: { name: string; detail: string; status: string }) {
  return <div className="system-row"><div><strong>{name}</strong><span>{detail}</span></div><small>{status}</small></div>;
}

type TerminalLine = { kind: "input" | "output" | "error" | "muted"; text: string };
const terminalHelp = [
  ["help, /help", "List available commands and usage"],
  ["about", "Open the About Me app"],
  ["explorer", "Open File Explorer"],
  ["open <app>", "Open an app by name or alias"],
  ["projects", "List selected projects"],
  ["project <name>", "Show a project summary"],
  ["robotics", "Open the Robotics Lab"],
  ["ros", "Show the robotics software stack"],
  ["skills", "List technical skills"],
  ["resume", "Open the resume app"],
  ["contact", "Open contact options"],
  ["github", "Open GitHub profile"],
  ["whoami", "Show the current user"],
  ["date", "Print the current date and time"],
  ["neofetch", "Show JXY OS system information"],
  ["sudo hire-me", "Display the hiring message"],
  ["clear", "Clear terminal output"],
  ["history", "Show recent commands"],
  ["pwd", "Show the virtual working directory"],
  ["cd ~", "Return to the virtual home directory"],
];

function TerminalView({ onOpenApp }: { onOpenApp: (id: AppId) => void }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "output", text: "JXY OS Terminal [Version 2.0]" },
    { kind: "muted", text: "Interactive portfolio shell. Type /help to see commands." },
  ]);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState("~");
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const append = (next: TerminalLine[]) => setLines((prev) => [...prev, ...next].slice(-160));
  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    const args = trimmed.replace(/^\//, "").split(/\s+/);
    const cmd = args[0].toLowerCase();
    const rest = args.slice(1).join(" ");
    const output = (text: string, kind: TerminalLine["kind"] = "output") => append([{ kind, text }]);
    append([{ kind: "input", text: `jxy@${cwd} $ ${raw}` }]);
    switch (cmd) {
      case "help":
        append([
          { kind: "muted", text: "COMMAND                         DESCRIPTION" },
          ...terminalHelp.map(([name, desc]) => ({ kind: "output" as const, text: `${name.padEnd(31)}${desc}` })),
          { kind: "muted", text: "This is a portfolio command shell, not a real system terminal." },
        ]);
        break;
      case "clear": setLines([]); break;
      case "about": onOpenApp("about"); output("Opening About Me..."); break;
      case "open": {
        const aliases: Record<string, AppId> = { explorer: "explorer", files: "explorer", projects: "projects", project: "projects", about: "about", terminal: "terminal", lab: "lab", robotics: "lab", resume: "resume", contact: "contact" };
        const id = aliases[rest.toLowerCase()];
        if (id) { onOpenApp(id); output(`Opening ${appInfo[id].title}...`); }
        else output("Usage: open <explorer|projects|about|terminal|robotics|resume|contact>", "muted");
        break;
      }
      case "explorer": case "files": onOpenApp("explorer"); output("Opening File Explorer..."); break;
      case "projects": output(projects.map((p, i) => `${i + 1}. ${p.title} [${p.category}]`).join("\n")); break;
      case "project": {
        const found = projects.find((p) => p.title.toLowerCase().includes(rest.toLowerCase()));
        if (!rest) output("Usage: project <name>", "muted");
        else if (found) output(`${found.title}\n${found.description}\nStack: ${found.technologies.join(", ")}`);
        else output(`No project matching "${rest}". Try: projects`, "error");
        break;
      }
      case "robotics": case "lab": onOpenApp("lab"); output("Opening Robotics Lab..."); break;
      case "ros": output("ROS 2 · Nav2 · MPPI · tf2 · ros2_control\nSensors: Hokuyo / RPLIDAR · VN100 IMU\nEmbedded: STM32 · ESP32 · ODrive · CAN"); break;
      case "skills": output("C/C++ · Python · ROS 2 · OpenCV · SLAM · Nav2\nSTM32 · ESP32 · CAN · Docker · Linux · Git"); break;
      case "resume": onOpenApp("resume"); output("Opening Resume..."); break;
      case "contact": onOpenApp("contact"); output("Opening Contact..."); break;
      case "github": window.open("https://github.com/jayesh-sangave", "_blank", "noopener,noreferrer"); output("Opening GitHub profile..."); break;
      case "whoami": output("JXY · Robotics / Controls · Engineer and developer"); break;
      case "date": output(new Date().toString()); break;
      case "neofetch": output("      .----.       JXY OS\n     / .--. \\      Portfolio Edition 2.0\n    | |    | |     React + TypeScript\n     \\`-.__.-\\`      Robotics-first interface\n      J X Y         Kernel: browser"); break;
      case "sudo": output(rest === "hire-me" ? "Permission granted. Let's build something that moves.\nContact: open the Contact app." : "This portfolio shell does not grant system privileges.", "muted"); break;
      case "history": output(history.map((item, i) => `${i + 1}  ${item}`).join("\n") || "No history yet."); break;
      case "pwd": output(`/home/jxy${cwd === "~" ? "" : cwd.slice(1)}`); break;
      case "cd": if (!rest || rest === "~") setCwd("~"); else output("Only the virtual home directory is available.", "muted"); break;
      default: output(`Command not found: ${cmd}. Type /help for available commands.`, "error");
    }
  };
  const complete = (value: string) => {
    const token = value.trim().split(/\s+/)[0].replace(/^\//, "").toLowerCase();
    const matches = terminalHelp.map(([name]) => name.split(/[ ,]/)[0]).filter((name) => name.startsWith(token));
    if (matches.length === 1) setCommand(matches[0] + " ");
    else if (matches.length > 1) setSuggestion(matches.join("   "));
    else setSuggestion("No matching command");
  };

  return (
    <div className="terminal-content" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-output" ref={outputRef} aria-live="polite">
        {lines.map((line, index) => <pre className={`terminal-line ${line.kind}`} key={index}>{line.text}</pre>)}
      </div>
      {suggestion && <div className="terminal-suggestion">{suggestion}</div>}
      <form className="terminal-input-row" onSubmit={(event) => { event.preventDefault(); runCommand(command); setCommand(""); setSuggestion(""); }}>
        <label>jxy@{cwd} $</label>
        <input
          ref={inputRef}
          value={command}
          onChange={(event) => { setCommand(event.target.value); setSuggestion(""); }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              const index = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
              setHistoryIndex(index); setCommand(history[index] || "");
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              const index = Math.min(history.length, historyIndex + 1);
              setHistoryIndex(index); setCommand(history[index] || "");
            } else if (event.key === "Tab") { event.preventDefault(); complete(command); }
          }}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
        <button type="submit" aria-label="Run command">↵</button>
      </form>
    </div>
  );
}

type ProjectTemplate = {
  id: string; title: string; file: string; category: string; role: string;
  summary: string; facts: string[]; result: string; technologies: string[];
};
const projectTemplates: ProjectTemplate[] = [
  {
    id: "robocon-2026", title: "DD Robocon 2026", file: "DD_Robocon_2026.project", category: "Competition robotics",
    role: "Team Captain & Manual Operator",
    summary: "Led the team across autonomous and manual robot development, testing, strategy, and competition operations.",
    facts: ["Led the team during the 2026 DD Robocon season.", "Served as manual operator during competition while overseeing both robots."],
    result: "All India Rank 2",
    technologies: ["Robotics", "Controls", "Competition engineering"],
  },
  {
    id: "r2-navigation", title: "Autonomous Navigation · R2", file: "R2_Autonomous_Navigation.project", category: "Autonomous systems",
    role: "Robotics Control Developer",
    summary: "Optimized ROS-based navigation on the R2 competition robot, focusing on faster full-field traversal.",
    facts: ["Worked on ROS-based navigation for the 2024 competition robot.", "Optimized the navigation system to reduce full-field traversal time."],
    result: "Traversal time reduced from 15 s to 7 s (53% faster)",
    technologies: ["ROS", "Navigation", "Robot controls"],
  },
  {
    id: "dunking-robot", title: "Dunking Robot · Robocon 2025", file: "Dunking_Robot_2025.project", category: "Mechanical + robotics",
    role: "Design and build",
    summary: "Designed and built a jumping robot for the 2025 Robocon season, using an elastic-based energy storage system.",
    facts: ["Built a 25 kg robot.", "Designed the jump mechanism around elastic energy storage."],
    result: "30 cm jump height",
    technologies: ["Mechanical design", "Energy storage", "Robot integration"],
  },
  {
    id: "auto-aim", title: "Real-Time Auto-Aim System", file: "Real_Time_Auto_Aim.project", category: "Controls + perception",
    role: "System engineering",
    summary: "Engineered a real-time auto-aim system for closed-loop self-alignment and dynamic shooting-power adjustment.",
    facts: ["Implemented closed-loop self-alignment.", "Adjusted shooting power dynamically."],
    result: "Closed-loop alignment with dynamic shooting-power adjustment",
    technologies: ["Control systems", "Perception", "Real-time systems"],
  },
];

function FileExplorerView({ onOpenApp }: { onOpenApp: (id: AppId) => void }) {
  const [location, setLocation] = useState<"home" | "project">("home");
  const [selected, setSelected] = useState<ProjectTemplate | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const goHome = () => { setLocation("home"); setSelected(null); };
  const openProjectFolder = () => { setLocation("project"); setSelected(null); };

  return (
    <div className="explorer-shell">
      <div className="explorer-toolbar">
        <div className="explorer-nav">
          <button onClick={() => selected ? setSelected(null) : goHome()} aria-label="Back"><ChevronLeft size={17}/></button>
          <button onClick={goHome} aria-label="Home"><Home size={15}/></button>
        </div>
        <div className="explorer-address"><HardDrive size={15}/><span>This PC</span><span className="address-separator">›</span><span>{selected ? `Project › ${selected.title}` : location === "project" ? "Project" : ""}</span></div>
        <div className="explorer-view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view">▦</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view">☷</button></div>
      </div>
      <div className="explorer-body">
        <aside className="explorer-sidebar">
          <span className="explorer-side-heading">Quick access</span>
          <button onClick={goHome} className={location === "home" && !selected ? "active" : ""}><Home size={15}/> Home</button>
          <button onClick={openProjectFolder} className={location === "project" ? "active" : ""}><Folder size={15}/> Project</button>
          <button onClick={() => onOpenApp("resume")}><FileText size={15}/> Resume.pdf</button>
          <span className="explorer-side-heading explorer-this-pc">This PC</span>
          <button onClick={goHome}><HardDrive size={15}/> Local Disk (C:)</button>
        </aside>
        <section className="explorer-content">
          {selected ? <ProjectDetail project={selected} onBack={() => setSelected(null)} /> : location === "home" ? <>
            <h3 className="explorer-section-title">Frequent locations</h3>
            <div className={`explorer-items ${view}`}>
              <button className="explorer-folder-card" onClick={openProjectFolder}><Folder size={39}/><span><strong>Project</strong><small>{projectTemplates.length} project pages</small></span></button>
              <button className="explorer-file-card" onClick={() => onOpenApp("resume")}><FileText size={34}/><span><strong>Resume.pdf</strong><small>PDF document</small></span></button>
            </div>
            <div className="explorer-info-note">Project pages are structured templates. Images, videos, CAD renders, architecture diagrams and code samples can be added later.</div>
          </> : <>
            <div className="explorer-folder-heading"><Folder size={22}/><div><h3>Project</h3><p>{projectTemplates.length} project pages</p></div></div>
            <div className={`explorer-items project-items ${view}`}>
              {projectTemplates.map((project) => <button className="explorer-project-file" key={project.id} onClick={() => setSelected(project)}>
                <File size={29}/><span><strong>{project.title}</strong><small>{project.category}</small><small>{project.file}</small></span>
              </button>)}
            </div>
          </>}
        </section>
      </div>
      <div className="explorer-status"><span>{selected ? selected.file : location === "project" ? `${projectTemplates.length} items` : "2 items"}</span><span>JXY OS File Explorer</span></div>
    </div>
  );
}

function ProjectDetail({ project, onBack }: { project: ProjectTemplate; onBack: () => void }) {
  const mediaSlots = [
    { label: "Photos", hint: "Robot builds, mechanisms, competition shots", icon: <ImageIcon size={19}/> },
    { label: "Videos", hint: "Demo runs, match footage, test recordings", icon: <Video size={19}/> },
    { label: "CAD & diagrams", hint: "Assemblies, schematics, architecture", icon: <Box size={19}/> },
    { label: "Code & logs", hint: "Repositories, plots, debug notes", icon: <Code2 size={19}/> },
  ];
  return <div className="project-detail-page">
    <button className="project-detail-back" onClick={onBack}><ChevronLeft size={15}/> Project folder</button>
    <div className="project-detail-heading"><span className="eyebrow">{project.category.toUpperCase()}</span><h2>{project.title}</h2><p>{project.summary}</p></div>
    <div className="project-detail-meta"><div><small>ROLE</small><strong>{project.role}</strong></div><div><small>OUTCOME</small><strong>{project.result}</strong></div></div>
    <section className="project-detail-section"><h3>Engineering notes</h3><ul>{project.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></section>
    <section className="project-detail-section"><h3>Technology</h3><div className="technology-tags">{project.technologies.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
    <section className="project-detail-section"><div className="project-media-title"><h3>Media & attachments</h3><span>ASSETS TO BE ADDED</span></div><div className="project-media-grid">{mediaSlots.map((slot) => <article className="project-media-slot" key={slot.label}>{slot.icon}<strong>{slot.label}</strong><p>{slot.hint}</p><small>Placeholder · awaiting assets</small></article>)}</div></section>
  </div>;
}

function ResumeView() {
  return (
    <div className="resume-viewer">
      <div className="resume-toolbar">
        <div><span className="eyebrow">DOCUMENT VIEWER</span><h2>Jayesh Sangave · Resume</h2></div>
        <div className="resume-actions">
          <a href="/resume.pdf" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open PDF</a>
          <a href="/resume.pdf" download="Jayesh_Sangave_Resume.pdf"><Download size={14} /> Download</a>
        </div>
      </div>
      <iframe className="resume-frame" src="/resume.pdf#toolbar=1&navpanes=0" title="Jayesh Sangave resume" />
    </div>
  );
}

function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:jayesh.sangave.mtt@gmail.com?subject=${subject}&body=${body}`;
  };
  return (
    <div className="portfolio-page"><div className="portfolio-heading"><span className="eyebrow">GET IN TOUCH</span><h2>Contact</h2><p>Have a project, collaboration, or engineering problem?</p></div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
        <label>Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What are you working on?" rows={5} required /></label>
        <button type="submit" className="contact-submit">Open email client</button>
        <p className="form-note">This currently opens your email application. Backend integration can be added later.</p>
      </form>
    </div>
  );
}

function Taskbar({ windows, onWindowClick, onStartClick, startOpen }: {
  windows: WindowState[];
  onWindowClick: (id: AppId) => void;
  onStartClick: () => void;
  startOpen: boolean;
}) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <footer className="taskbar" onPointerDown={(event) => event.stopPropagation()}>
      <button className={`start-button ${startOpen ? "start-active" : ""}`} onClick={onStartClick}>
        <span className="start-orb windows7-orb" aria-hidden="true"><i className="win-pane pane-red"/><i className="win-pane pane-green"/><i className="win-pane pane-blue"/><i className="win-pane pane-yellow"/></span><span className="start-label">Start</span>
      </button>
      <div className="taskbar-apps">{windows.filter((win) => !win.closing).map((win) => (
        <button key={win.id} className={`taskbar-item ${!win.minimized ? "active" : ""}`} onClick={() => onWindowClick(win.id)} title={win.title}>{win.title}</button>
      ))}</div>
      <div className="system-tray"><span>JXY OS</span><span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
    </footer>
  );
}

export default App;
