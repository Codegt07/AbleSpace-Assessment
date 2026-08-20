"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type Accent =
  | "amber"
  | "blue"
  | "pink"
  | "rose"
  | "emerald"
  | "black";

const accents: {
  id: Accent;
  label: string;
  color: string;
}[] = [
  { id: "amber", label: "Amber", color: "#f59e0b" },
  { id: "blue", label: "Blue", color: "#3b82f6" },
  { id: "pink", label: "Pink", color: "#ec4899" },
  { id: "rose", label: "Rose", color: "#f43f5e" },
  { id: "emerald", label: "Emerald", color: "#10b981" },
  { id: "black", label: "Black", color: "#171717" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [theme, setTheme] = useState<Theme>("light");
  const [accent, setAccent] = useState<Accent>("blue");
  const [userName, setUserName] = useState("Guest");

  const [themeOpen, setThemeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  // Workspace is open by default
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  const [themeInitialized, setThemeInitialized] =
    useState(false);

  const isTasksActive = pathname.startsWith("/tasks");
  const isProjectsActive =
    pathname.startsWith("/projects");
  const isProfileActive =
    pathname.startsWith("/profile");

  // Load saved profile name
  useEffect(() => {
    const storedGuest =
      localStorage.getItem("guest");

    if (!storedGuest) {
      return;
    }

    try {
      const guest = JSON.parse(storedGuest);
      setUserName(guest.name || "Guest");
    } catch (error) {
      console.error(
        "Failed to read guest profile:",
        error
      );
    }
  }, []);

  // Load saved theme and accent
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    const savedAccent =
      localStorage.getItem("accent");

    const initialTheme: Theme =
      savedTheme === "light" ||
      savedTheme === "dark"
        ? savedTheme
        : "light";

    const initialAccent: Accent =
      savedAccent &&
      accents.some(
        (item) => item.id === savedAccent
      )
        ? (savedAccent as Accent)
        : "blue";

    setTheme(initialTheme);
    setAccent(initialAccent);

    document.documentElement.dataset.theme =
      initialTheme;

    document.documentElement.dataset.accent =
      initialAccent;

    setThemeInitialized(true);
  }, []);

  // Apply and save theme/accent
  useEffect(() => {
    if (!themeInitialized) return;

    document.documentElement.dataset.theme =
      theme;

    document.documentElement.dataset.accent =
      accent;

    localStorage.setItem("theme", theme);
    localStorage.setItem("accent", accent);
  }, [
    theme,
    accent,
    themeInitialized,
  ]);

  const avatarLetter =
    userName.trim().charAt(0).toUpperCase() ||
    "G";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-[var(--border)] bg-[var(--sidebar-bg)] px-[8px] py-[14px] text-[var(--text)] transition-colors">

      {/* User */}
      <Link
        href="/profile"
        className="flex cursor-pointer items-center rounded-[8px] px-[8px] py-[4px] hover:bg-[var(--hover)]"
      >
        <div className="flex items-center gap-[8px]">
          <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
            {avatarLetter}
          </div>

          <span className="text-[14px] font-semibold text-[var(--text)]">
            {userName}
          </span>
        </div>
      </Link>

      <div className="mt-[24px]">

        {/* Workspace */}
        <button
          type="button"
          onClick={() =>
            setWorkspaceOpen(
              (previous) => !previous
            )
          }
          className="flex w-full cursor-pointer items-center justify-between rounded-[8px] px-[8px] text-[14px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
        >
          <span>Workspace</span>

          <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-[var(--text)] transition-transform ${
          workspaceOpen ? "" : "-rotate-90"
        }`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
        </button>

        {/* Workspace Items */}
        {workspaceOpen && (
          <nav className="mt-[10px] space-y-[2px] pl-[10px]">

            {/* Tasks */}
            <Link
              href="/tasks"
              className={`flex h-[34px] items-center gap-[9px] rounded-[8px] px-[8px] text-[12px] font-medium ${
                isTasksActive
                  ? "bg-[var(--active-bg)] text-[var(--accent)]"
                  : "text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                />
              </svg>

              Tasks
            </Link>

            {/* Projects */}
            <Link
              href="/projects"
              className={`flex h-[34px] items-center gap-[9px] rounded-[8px] px-[8px] text-[12px] font-medium ${
                isProjectsActive
                  ? "bg-[var(--active-bg)] text-[var(--accent)]"
                  : "text-[var(--text)] hover:bg-[var(--hover)]"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8h16" />
                <path d="M5 8l1-4h12l1 4" />
                <rect
                  x="4"
                  y="8"
                  width="16"
                  height="12"
                  rx="1.5"
                />
              </svg>

              Projects
            </Link>
          </nav>
        )}

        {/* Other Settings */}
        <div className="mt-[14px] space-y-[2px]">

          {/* Change Theme */}
          <button
            type="button"
            onClick={() => {
              setThemeOpen(!themeOpen);
              setColorOpen(false);
            }}
            className="flex h-[34px] w-full cursor-pointer items-center justify-between rounded-[8px] px-[8px] text-[13px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
          >
            <span className="flex items-center gap-[9px]">
              <span className="text-[15px]">
                ◐
              </span>

              Change Theme
            </span>

            <span className="text-[12px] text-[var(--muted)]">
              ›
            </span>
          </button>

          {themeOpen && (
            <div className="ml-[4px] rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              {(["light", "dark"] as Theme[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setTheme(item);
                      setThemeOpen(false);
                    }}
                    className={`flex h-[31px] w-full items-center justify-between rounded-[7px] px-[8px] text-[12px] capitalize hover:bg-[var(--hover)] ${
                      theme === item
                        ? "bg-[var(--active-bg)] text-[var(--accent)]"
                        : "text-[var(--text)]"
                    }`}
                  >
                    {item}

                    {theme === item && (
                      <span>✓</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}

          {/* Color Mode */}
          <button
            type="button"
            onClick={() => {
              setColorOpen(!colorOpen);
              setThemeOpen(false);
            }}
            className="flex h-[34px] w-full cursor-pointer items-center justify-between rounded-[8px] px-[8px] text-[13px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
          >
            <span className="flex items-center gap-[9px]">
              <span
                className="h-[11px] w-[11px] rounded-full"
                style={{
                  backgroundColor:
                    accents.find(
                      (item) =>
                        item.id === accent
                    )?.color,
                }}
              />

              Color Mode
            </span>

            <span className="text-[12px] text-[var(--muted)]">
              ›
            </span>
          </button>

          {colorOpen && (
            <div className="ml-[4px] rounded-[9px] border border-[var(--border)] bg-[var(--surface)] p-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              {accents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAccent(item.id);
                    setColorOpen(false);
                  }}
                  className={`flex h-[31px] w-full items-center justify-between rounded-[7px] px-[8px] text-[12px] hover:bg-[var(--hover)] ${
                    accent === item.id
                      ? "bg-[var(--active-bg)] text-[var(--accent)]"
                      : "text-[var(--text)]"
                  }`}
                >
                  <span className="flex items-center gap-[8px]">
                    <span
                      className="h-[9px] w-[9px] rounded-full"
                      style={{
                        backgroundColor:
                          item.color,
                      }}
                    />

                    {item.label}
                  </span>

                  {accent === item.id && (
                    <span>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Profile */}
          <Link
            href="/profile"
            className={`flex h-[34px] w-full cursor-pointer items-center gap-[9px] rounded-[8px] px-[8px] text-[13px] font-medium ${
              isProfileActive
                ? "bg-[var(--active-bg)] text-[var(--accent)]"
                : "text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />
              <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>

            Profile
          </Link>
        </div>
      </div>

      {/* Bottom Profile Avatar */}
      <Link
        href="/profile"
        aria-label="Open profile"
        className={`absolute bottom-[20px] left-[16px] z-50 flex h-[38px] w-[38px] items-center justify-center rounded-full border text-[12px] font-medium transition-colors ${
          isProfileActive
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : "border-[var(--border)] bg-[var(--surface-strong)] text-white hover:bg-[var(--accent)]"
        }`}
      >
        {avatarLetter}
      </Link>
    </aside>
  );
}