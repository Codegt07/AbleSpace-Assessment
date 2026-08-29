"use client";

import { useMemo, useState } from "react";

export type Project = {
  _id: string;
  title: string;
  priority?: string;
  dueDate?: string;
  leadName: string;
  leadAvatar?: string;
  viewOnly: boolean;
};

type ProjectListProps = {
  projects: Project[];
  visibleFields: string[];

  onOpenProject: (project: Project) => void;
  onEditProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => Promise<void>;
  onAddProject?: () => void;
};

const priorityStyles: Record<
  string,
  {
    color: string;
    bars: number[];
  }
> = {
  Urgent: {
    color: "text-red-500",
    bars: [4, 7, 10, 12],
  },

  High: {
    color: "text-red-500",
    bars: [4, 7, 10],
  },

  Medium: {
    color: "text-orange-500",
    bars: [3, 6, 8],
  },

  Low: {
    color: "text-[#a0a0a0]",
    bars: [3, 4, 5],
  },
};

function Priority({ value }: { value?: string }) {
  const priority =
    priorityStyles[value || "Medium"] ||
    priorityStyles.Medium;

  return (
    <div
      className={`flex items-center gap-[5px] ${priority.color}`}
    >
      <div className="flex h-[12px] items-end gap-[1px]">
        {priority.bars.map((height, index) => (
          <span
            key={index}
            className="w-[1.5px] rounded-sm bg-current"
            style={{ height }}
          />
        ))}
      </div>

      <span className="text-[12px]">
        {value || "Medium"}
      </span>
    </div>
  );
}

function formatDate(date?: string) {
  return date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No date";
}

export default function ProjectList({
  projects,
  visibleFields,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onAddProject,
}: ProjectListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(
    null,
  );

  const showPriority =
    visibleFields.includes("Priority");

  const showMembers =
    visibleFields.includes("Members");

  const showDueDate =
    visibleFields.includes("Due Date");

  const columns = useMemo(() => {
    const result: string[] = [
      "minmax(0, 1.8fr)",
    ];

    if (showPriority) {
      result.push("0.8fr");
    }

    if (showMembers) {
      result.push("0.8fr");
    }

    if (showDueDate) {
      result.push("0.95fr");
    }

    result.push("0.55fr");

    return result.join(" ");
  }, [
    showPriority,
    showMembers,
    showDueDate,
  ]);

  return (
    <div className="w-full overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      {/* TABLE HEADER */}
      <div
        className="hidden h-[36px] items-center bg-[var(--hover)] px-3 text-[12px] font-medium text-[var(--text)] md:grid"
        style={{
          gridTemplateColumns: columns,
        }}
      >
        <span>Project</span>

        {showPriority && (
          <span>Priority</span>
        )}

        {showMembers && (
          <span>Lead</span>
        )}

        {showDueDate && (
          <span>Due Date</span>
        )}

        <span className="text-right">
          Actions
        </span>
      </div>

      {/* PROJECT ROWS */}
      {projects.map((project) => (
        <div
          key={project._id}
          onClick={() =>
            onOpenProject(project)
          }
          className="cursor-pointer border-t border-[var(--border)] px-3 py-3 text-[12px] hover:bg-[var(--hover)] md:grid md:min-h-[38px] md:items-center md:py-0"
          style={{
            gridTemplateColumns: columns,
          }}
        >
          {/* PROJECT */}
          <div className="min-w-0">
            <p className="truncate text-[13px] text-[var(--text)]">
              {project.title}
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)] md:hidden">
              {project.viewOnly
                ? "View only"
                : "Your project"}
            </p>
          </div>

          {/* PRIORITY */}
          {showPriority && (
            <div className="mt-3 md:mt-0">
              <Priority
                value={project.priority}
              />
            </div>
          )}

          {/* MEMBERS / LEAD */}
          {showMembers && (
            <div className="mt-2 flex min-w-0 items-center gap-2 md:mt-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--hover)] text-[9px] font-medium text-[var(--text)]">
                {project.leadAvatar ? (
                  <img
                    src={project.leadAvatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  project.leadName
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <span className="truncate text-[12px] text-[var(--text)]">
                {project.leadName}
              </span>
            </div>
          )}

          {/* DUE DATE */}
          {showDueDate && (
            <span className="mt-2 text-[12px] text-[var(--muted)] md:mt-0">
              {formatDate(project.dueDate)}
            </span>
          )}

          {/* ACTIONS */}
          <div
            className="relative mt-2 flex justify-end md:mt-0"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {!project.viewOnly &&
              (onEditProject ||
                onDeleteProject) && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        (previous) =>
                          previous === project._id
                            ? null
                            : project._id,
                      )
                    }
                    className="cursor-pointer text-[14px] text-[var(--muted)]"
                  >
                    ···
                  </button>

                  {openMenuId ===
                    project._id && (
                    <div className="absolute right-0 top-5 z-40 w-[100px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-md">
                      {onEditProject && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(
                              null,
                            );

                            onEditProject(
                              project._id,
                            );
                          }}
                          className="w-full rounded-md px-2 py-[6px] text-left text-[11px] hover:bg-[var(--hover)]"
                        >
                          Edit
                        </button>
                      )}

                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={async () => {
                            setOpenMenuId(
                              null,
                            );

                            await onDeleteProject(
                              project._id,
                            );
                          }}
                          className="w-full rounded-md px-2 py-[6px] text-left text-[11px] text-red-500 hover:bg-[#fff2f2]"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      ))}

      {/* ADD PROJECT */}
      <button
        type="button"
        onClick={onAddProject}
        className="flex h-[36px] w-full cursor-pointer items-center rounded-b-lg border-t border-[var(--border)] px-3 text-[13px] text-[var(--text)] hover:bg-[var(--hover)]"
      >
        + Add Projects
      </button>
    </div>
  );
}