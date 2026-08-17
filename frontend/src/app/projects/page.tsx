"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Task = {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  createdBy: string;
  members?: { userId: string; status: string }[];
};

type WorkspaceUser = {
  userId: string;
  name?: string;
  username?: string;
  avatar?: string;
};

function formatDate(date?: string) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function priorityClass(priority?: string) {
  if (priority === "High" || priority === "Urgent") {
    return "text-red-500";
  }

  if (priority === "Low") {
    return "text-[var(--muted)]";
  }

  return "text-[var(--accent)]";
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Task[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const storedGuest = localStorage.getItem("guest");

        if (!storedGuest) {
          setLoading(false);
          return;
        }

        const guest = JSON.parse(storedGuest);

        if (!guest.workspaceId || !guest.guestId) {
          setLoading(false);
          return;
        }

        const [projectsResponse, usersResponse] = await Promise.all([
          fetch(
            `http://localhost:5000/tasks/projects?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`,
          ),
          fetch(
            `http://localhost:5000/workspace-members/users?workspaceId=${guest.workspaceId}`,
          ),
        ]);

        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projectData = await projectsResponse.json();
        setProjects(projectData);

        if (usersResponse.ok) {
          setUsers(await usersResponse.json());
        }
      } catch (error) {
        console.error("Projects Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.userId, user])),
    [users],
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <div className="h-[52px] border-b border-[var(--border)]" />

        <div className="px-7 py-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[var(--accent)]">
              Projects
            </h1>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Parent tasks with subtasks assigned to you.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr] border-b border-[var(--border)] px-5">
              <div className="py-3.5 text-[11px] font-semibold text-[var(--muted)]">
                Project
              </div>
              <div className="py-3.5 text-[11px] font-semibold text-[var(--muted)]">
                Lead
              </div>
              <div className="py-3.5 text-[11px] font-semibold text-[var(--muted)]">
                Priority
              </div>
              <div className="py-3.5 text-[11px] font-semibold text-[var(--muted)]">
                Due Date
              </div>
            </div>

            {loading ? (
              <div className="flex h-[160px] items-center justify-center text-[11px] text-[var(--muted)]">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-[11px] text-[var(--muted)]">
                No projects yet.
              </div>
            ) : (
              projects.map((project) => {
                const lead = userMap.get(project.createdBy);
                const leadName =
                  lead?.name || lead?.username || project.createdBy;

                return (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() =>
                      router.push(`/tasks/${project._id}?mode=view`)
                    }
                    className="grid w-full grid-cols-[2fr_1.2fr_1fr_1fr] items-center border-b border-[var(--border)] px-5 text-left last:border-b-0 hover:bg-[var(--hover)]"
                  >
                    <div className="min-w-0 py-4 pr-4">
                      <p className="truncate text-[13px] font-medium text-[var(--text)]">
                        {project.title}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[var(--muted)]">
                        View project
                      </p>
                    </div>

                    <div className="flex items-center gap-2 py-4">
                      <div className="flex h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[9px] font-medium text-white">
                        {lead?.avatar ? (
                          <img
                            src={lead.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          leadName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="truncate text-[11px] text-[var(--text)]">
                        {leadName}
                      </span>
                    </div>

                    <div
                      className={`py-4 text-[11px] font-medium ${priorityClass(
                        project.priority,
                      )}`}
                    >
                      {project.priority || "Medium"}
                    </div>

                    <div className="py-4 text-[11px] text-[var(--muted)]">
                      {formatDate(project.dueDate)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}