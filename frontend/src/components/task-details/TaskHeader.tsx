 "use client";

import { useState } from "react";
import TaskActionMenu from "@/components/TaskActionMenu";

type TaskHeaderProps = {
  title: string;
  description?: string;
  viewOnly: boolean;
  isCreator: boolean;
  isTaskMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSettings: () => void;
  onLeave: () => void;
  viewCount: number;
  viewers: {
    userId: string;
    viewedAt?: string;
  }[];
  showViewers: boolean;
  onToggleViewers: () => void;
  getUser: (
    userId: string,
  ) => {
    name?: string;
    avatar?: string;
  } | undefined;
};

export default function TaskHeader({
  title,
  description,
  viewOnly,
  isCreator,
  isTaskMember,
  onEdit,
  onDelete,
  onSettings,
  onLeave,
  viewCount,
  viewers,
  showViewers,
  onToggleViewers,
  getUser,
}: TaskHeaderProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeMenu = () => setShowActionMenu(false);

  const taskUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?mode=view`
      : "";

  const handleCopyLink = async () => {
    if (!taskUrl) return;

    try {
      await navigator.clipboard.writeText(taskUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy Task Link Error:", error);
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setCopied(false);
  };

  return (
    <>
      <div className="order-1 flex items-start justify-between gap-3 sm:gap-6 lg:order-none">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-7 text-[var(--text)] sm:text-[25px] sm:leading-8">
            {title}
          </h1>
          <p className="mt-1.5 max-w-[720px] text-[13px] leading-5 text-[var(--muted)] sm:text-[14px] sm:leading-5.5">
            {description || "No description provided."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <button
            type="button"
            title={viewOnly ? "View only" : "Task settings"}
            onClick={() => {
              if (!viewOnly) onSettings();
            }}
            disabled={viewOnly}
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)] disabled:cursor-default disabled:opacity-60"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="3"
                y="6"
                width="8"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M4.5 6V4.5C4.5 2.57 9.5 2.57 9.5 4.5V6"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div
            className="relative"
            onMouseEnter={() => {
              if (!showViewers) onToggleViewers();
            }}
            onMouseLeave={() => {
              if (showViewers) onToggleViewers();
            }}
          >
            <button
              type="button"
              title="Views"
              className="flex h-[30px] cursor-pointer items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--accent)] hover:bg-[var(--hover)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1.5 7C2.8 4.8 4.6 3.7 7 3.7C9.4 3.7 11.2 4.8 12.5 7C11.2 9.2 9.4 10.3 7 10.3C4.6 10.3 2.8 9.2 1.5 7Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <circle
                  cx="7"
                  cy="7"
                  r="1.7"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
              <span className="text-[10px]">{viewCount}</span>
            </button>

            {showViewers && (
              <div className="absolute right-0 top-[36px] z-50 w-[260px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl ">
                <div className="mb-2 flex items-centerjustify-between gap-2">
                  <p className="text-[11px] font-semibold text-[var(--text)]">
                    Viewed by
                  </p>
                  <span className="text-[9px] text-[var(--muted)]">
                    {viewCount} {viewCount === 1 ? "person" : "people"}
                  </span>
                </div>

                {viewers.length === 0 ? (
                  <p className="text-[10px] text-[var(--muted)]">
                    No viewers yet.
                  </p>
                ) : (
                  <div className="max-h-[220px] space-y-2 overflow-y-auto hide-scrollbar">
                    {viewers.map((viewer) => {
                      const user = getUser(viewer.userId);

                      return (
                        <div
                          key={`${viewer.userId}-${viewer.viewedAt ?? "unknown"}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[10px] font-medium text-white">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                user?.name?.charAt(0).toUpperCase() || "?"
                              )}
                            </div>

                            <span className="truncate text-[11px] text-[var(--text)]">
                              {user?.name || "Unknown user"}
                            </span>
                          </div>

                          {viewer.viewedAt && (
                            <span className="shrink-0 text-[9px] text-[var(--muted)]">
                              {new Date(
                                viewer.viewedAt,
                              ).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            title="Share"
            onClick={() => setShowShareModal(true)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border cursor-pointer border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--hover)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="4"
                cy="7"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle
                cx="10"
                cy="3.5"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle
                cx="10"
                cy="10.5"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <path
                d="M5.3 6.3L8.7 4.2M5.3 7.7L8.7 9.8"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </button>

          {!viewOnly && (
            <div className="relative">
              <button
                type="button"
                title="More"
                onClick={() => setShowActionMenu((previous) => !previous)}
                className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[11px] text-[var(--accent)] hover:bg-[var(--hover)]"
              >
                •••
              </button>

              <TaskActionMenu
                open={showActionMenu}
                onEdit={
                  isCreator
                    ? () => {
                        closeMenu();
                        onEdit();
                      }
                    : undefined
                }
                onDelete={
                  isCreator
                    ? () => {
                        closeMenu();
                        onDelete();
                      }
                    : undefined
                }
                onSettings={
                  isCreator
                    ? () => {
                        closeMenu();
                        onSettings();
                      }
                    : undefined
                }
                onLeave={
                  !isCreator && isTaskMember
                    ? () => {
                        closeMenu();
                        onLeave();
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeShareModal();
            }
          }}
        >
          <div className="w-full max-w-[520px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--text)]">
                  Share task
                </h2>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Share this task using the link below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeShareModal}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[16px] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                aria-label="Close share dialog"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2">
              <input
                type="text"
                value={taskUrl}
                readOnly
                className="min-w-0 flex-1 bg-transparent px-1 text-[11px] text-[var(--text)] outline-none"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] font-medium text-[var(--text)] hover:bg-[var(--hover)]"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}