import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  Folder,
  FileText,
  Terminal,
  Cpu,
  Mail,
  Minus,
  Square,
  X,
  RefreshCw,
  Monitor,
  Maximize2,
} from "lucide-react";
import StartMenu, { type AppId } from "./components/StartMenu";
import "./index.css";

type Snap = "none" | "left" | "right";

type WindowState = {
  id: AppId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  snap: Snap;
};

const appInfo: Record<AppId, { title: string; icon: typeof Folder }> = {
  projects: { title: "My Projects", icon: Folder },
  about: { title: "About Me", icon: FileText },
  terminal: { title: "Terminal", icon: Terminal },
  lab: { title: "Robotics Lab", icon: Cpu },
  resume: { title: "Resume", icon: FileText },
  contact: { title: "Contact", icon: Mail },
};

const desktopApps: AppId[] = ["projects", "about", "lab", "terminal"];

function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [wallpaper, setWallpaper] = useState(0);

  const openApp = (id: AppId) => {
    const existing = windows.find((win) => win.id === id);
    const nextZ = topZ + 1;

    setTopZ(nextZ);
    setContextMenu(null);

    if (existing) {
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id
            ? {
                ...win,
                minimized: false,
                zIndex: nextZ,
                snap: "none",
              }
            : win,
        ),
      );
      return;
    }

    const offset = windows.length * 28;

    setWindows((prev) => [
      ...prev,
      {
        id,
        title: appInfo[id].title,
        minimized: false,
        maximized: false,
        zIndex: nextZ,
        snap: "none",
        position: {
          x: Math.min(180 + offset, window.innerWidth - 340),
          y: Math.min(80 + offset, window.innerHeight - 300),
        },
      },
    ]);
  };

  const focusWindow = (id: AppId) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);

    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? { ...win, minimized: false, zIndex: nextZ }
          : win,
      ),
    );
  };

  const closeWindow = (id: AppId) => {
    setWindows((prev) => prev.filter((win) => win.id !== id));
  };

  const toggleMinimize = (id: AppId) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, minimized: !win.minimized } : win,
      ),
    );
  };

  const toggleMaximize = (id: AppId) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? {
              ...win,
              maximized: !win.maximized,
              snap: "none",
            }
          : win,
      ),
    );
  };

  const handleTaskbarClick = (id: AppId) => {
    const selected = windows.find((win) => win.id === id);
    if (!selected) return;

    const highestZ = Math.max(...windows.map((win) => win.zIndex));
    const isFocused = !selected.minimized && selected.zIndex === highestZ;

    if (isFocused) {
      toggleMinimize(id);
    } else {
      focusWindow(id);
    }
  };

  const handleDesktopPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    setStartOpen(false);
    setContextMenu(null);

    if (event.target === event.currentTarget) {
      setSelectedIcon(null);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const menuWidth = 190;
    const menuHeight = 150;

    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - menuWidth),
      y: Math.min(event.clientY, window.innerHeight - menuHeight),
    });

    setSelectedIcon(null);
    setStartOpen(false);
  };

  const refreshDesktop = () => {
    setSelectedIcon(null);
    setContextMenu(null);
  };

  const cycleWallpaper = () => {
    setWallpaper((current) => (current + 1) % 3);
    setContextMenu(null);
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
      className={`desktop wallpaper-${wallpaper}`}
      onPointerDown={handleDesktopPointerDown}
      onContextMenu={handleContextMenu}
    >
      <div className="desktop-icons">
        {desktopApps.map((id) => {
          const Icon = appInfo[id].icon;

          return (
            <button
              className={`desktop-icon ${
                selectedIcon === id ? "selected" : ""
              }`}
              key={id}
              onClick={() => setSelectedIcon(id)}
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

      {windows.map((win) => {
        if (win.minimized) return null;

        return (
          <Window
            key={win.id}
            window={win}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => toggleMinimize(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onMove={(position) =>
              setWindows((prev) =>
                prev.map((item) =>
                  item.id === win.id
                    ? { ...item, position, snap: "none" }
                    : item,
                ),
              )
            }
            onSnap={(snap) =>
              setWindows((prev) =>
                prev.map((item) =>
                  item.id === win.id ? { ...item, snap } : item,
                ),
              )
            }
          />
        );
      })}

      {contextMenu && (
        <div
          className="desktop-context-menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button onClick={refreshDesktop}>
            <RefreshCw size={15} />
            Refresh
          </button>

          <div className="context-menu-divider" />

          <button onClick={cycleWallpaper}>
            <Monitor size={15} />
            Change wallpaper
          </button>

          <button
            onClick={() => {
              setContextMenu(null);
              setSelectedIcon(null);
            }}
          >
            <Maximize2 size={15} />
            Personalize
          </button>
        </div>
      )}

      {startOpen && (
        <StartMenu
          onOpenApp={openApp}
          onClose={() => setStartOpen(false)}
        />
      )}

      <Taskbar
        windows={windows}
        onWindowClick={handleTaskbarClick}
        onStartClick={() => {
          setStartOpen((open) => !open);
          setContextMenu(null);
        }}
        startOpen={startOpen}
      />
    </main>
  );
}

function Window({
  window: win,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onSnap,
}: {
  window: WindowState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onSnap: (snap: Snap) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (win.maximized || win.snap !== "none" || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    setDragOffset({
      x: event.clientX - win.position.x,
      y: event.clientY - win.position.y,
    });

    setDragging(true);
    onFocus();
  };

  const handleDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging || win.maximized) return;

    onMove({
      x: Math.max(0, event.clientX - dragOffset.x),
      y: Math.max(0, event.clientY - dragOffset.y),
    });
  };

  const finishDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;

    setDragging(false);

    const edge = 12;

    if (event.clientY <= edge) {
      onMaximize();
    } else if (event.clientX <= edge) {
      onSnap("left");
    } else if (event.clientX >= window.innerWidth - edge) {
      onSnap("right");
    } else {
      onSnap("none");
    }
  };

  const snapStyle =
    win.snap === "left"
      ? {
          left: 0,
          top: 0,
          width: "50vw",
          height: "calc(100% - 40px)",
        }
      : win.snap === "right"
        ? {
            left: "50vw",
            top: 0,
            width: "50vw",
            height: "calc(100% - 40px)",
          }
        : {
            left: win.maximized ? 0 : win.position.x,
            top: win.maximized ? 0 : win.position.y,
          };

  return (
    <section
      className={`window ${
        win.maximized ? "maximized" : ""
      } ${win.snap !== "none" ? "snapped" : ""}`}
      style={{
        ...snapStyle,
        zIndex: win.zIndex,
      }}
      onPointerDown={onFocus}
    >
      <header
        className="window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={handleDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={onMaximize}
      >
        <span>{win.title}</span>

        <div className="window-controls">
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onMinimize}
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>

          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onMaximize}
            aria-label="Maximize"
          >
            <Square size={12} />
          </button>

          <button
            className="close-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      <div className="window-content">
        {win.id === "projects" && <ProjectsView />}

        {win.id === "about" && <AboutView />}

        {win.id === "lab" && <RoboticsLabView />}

        {win.id === "terminal" && (
          <div className="terminal-content">
            <p>JXY OS Terminal [Version 1.0]</p>
            <p>Type help to explore.</p>
            <span>jxy@jxy-os:~$ _</span>
          </div>
        )}

        {win.id === "resume" && <ResumeView />}

        {win.id === "contact" && <ContactView />}
      </div>
    </section>
  );
}

const projects = [
  {
    title: "Robocon Autonomous Robot",
    category: "Robotics",
    description:
      "A competition robot integrating motion control, localization, and autonomous navigation.",
    technologies: ["ROS 2", "C++", "Nav2", "OpenCV"],
  },
  {
    title: "LiDAR SLAM",
    category: "Localization",
    description:
      "A LiDAR-based mapping and localization pipeline using point-cloud processing and scan matching.",
    technologies: ["C++", "ROS 2", "PCL", "ICP"],
  },
  {
    title: "Motor Control System",
    category: "Embedded",
    description:
      "A real-time motor control system with encoder feedback, PID control, and CAN communication.",
    technologies: ["STM32", "C", "CAN", "PID"],
  },
];

function ProjectsView() {
  return (
    <div className="portfolio-page">
      <div className="portfolio-heading">
        <span className="eyebrow">SELECTED WORK</span>
        <h2>Projects</h2>
        <p>Things built, broken, debugged, and made to work.</p>
      </div>

      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.title}>
            <div className="project-card-top">
              <span className="project-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="project-category">{project.category}</span>
            </div>

            <h3>{project.title}</h3>
            <p>{project.description}</p>

            <div className="technology-tags">
              {project.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AboutView() {
  const skills = [
    "Robotics",
    "ROS 2",
    "C++",
    "Python",
    "Computer Vision",
    "Embedded Systems",
    "Control Systems",
    "SLAM",
  ];

  return (
    <div className="portfolio-page">
      <div className="portfolio-heading">
        <span className="eyebrow">WHO I AM</span>
        <h2>Engineer. Developer. Builder.</h2>
      </div>

      <div className="about-layout">
        <div className="about-avatar">JX</div>

        <div>
          <h3>Building systems that move.</h3>
          <p>
            I’m an engineering student focused on robotics, automation,
            and software. I enjoy working across the stack, from embedded
            firmware and motor control to perception and autonomous systems.
          </p>
          <p>
            Most of my learning happens through real projects: designing,
            testing, breaking things, and iterating until they work.
          </p>
        </div>
      </div>

      <h3 className="section-heading">Technical toolbox</h3>

      <div className="skill-list">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </div>
  );
}

function RoboticsLabView() {
  return (
    <div className="portfolio-page">
      <div className="portfolio-heading">
        <span className="eyebrow">ENGINEERING WORKSPACE</span>
        <h2>Robotics Lab</h2>
        <p>Where software meets hardware, and debugging meets reality.</p>
      </div>

      <div className="lab-grid">
        <article className="lab-card">
          <Cpu size={24} />
          <h3>Controls & Embedded</h3>
          <p>
            Motor control, encoder feedback, real-time firmware, and
            communication buses.
          </p>
        </article>

        <article className="lab-card">
          <Terminal size={24} />
          <h3>ROS 2 Systems</h3>
          <p>
            Robot bringup, navigation, controller integration, and
            distributed robotics software.
          </p>
        </article>

        <article className="lab-card">
          <Folder size={24} />
          <h3>Perception & SLAM</h3>
          <p>
            LiDAR processing, visual odometry, point clouds, and
            localization pipelines.
          </p>
        </article>
      </div>

      <div className="lab-note">
        <strong>Current focus</strong>
        <p>
          Developing robust autonomous systems that can operate reliably
          outside simulation.
        </p>
      </div>
    </div>
  );
}

function ResumeView() {
  return (
    <div className="portfolio-page resume-view">
      <span className="eyebrow">EXPERIENCE & EDUCATION</span>
      <h2>Resume</h2>
      <p>
        A concise overview of my engineering experience, projects,
        education, and technical skills.
      </p>

      <div className="resume-placeholder">
        <FileText size={42} />
        <h3>Resume PDF</h3>
        <p>Add your resume PDF to the public folder to enable the download.</p>
        <a href="/resume.pdf" download>
          Download resume
        </a>
      </div>
    </div>
  );
}

function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );

    window.location.href =
      `mailto:your-email@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-heading">
        <span className="eyebrow">GET IN TOUCH</span>
        <h2>Contact</h2>
        <p>Have a project, collaboration, or engineering problem?</p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="What are you working on?"
            rows={5}
            required
          />
        </label>

        <button type="submit" className="contact-submit">
          Open email client
        </button>

        <p className="form-note">
          This currently opens your email application. We’ll connect it to
          the backend later.
        </p>
      </form>
    </div>
  );
}

function Taskbar({
  windows,
  onWindowClick,
  onStartClick,
  startOpen,
}: {
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
    <footer
      className="taskbar"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        className={`start-button ${startOpen ? "start-active" : ""}`}
        onClick={onStartClick}
      >
        <span className="start-orb">✦</span>
        Start
      </button>

      <div className="taskbar-apps">
        {windows.map((win) => (
          <button
            key={win.id}
            className={`taskbar-item ${!win.minimized ? "active" : ""}`}
            onClick={() => onWindowClick(win.id)}
          >
            {win.title}
          </button>
        ))}
      </div>

      <div className="system-tray">
        <span>JXY OS</span>
        <span>
          {time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </footer>
  );
}

export default App;