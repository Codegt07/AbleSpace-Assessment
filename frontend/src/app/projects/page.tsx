"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TaskFormModal from "@/components/TaskFormModal";
import ProjectList, { type Project } from "@/components/ProjectList";
import TaskBoardToolbar from "@/components/task-board/TaskBoardToolbar";
import useTaskBoard, { type Task } from "@/hooks/useTaskBoard";
import useTaskFilters from "@/hooks/useTaskFilters";
import useTaskNotifications from "@/hooks/useTaskNotifications";

type WorkspaceUser = {
  userId: string;
  name?: string;
  username?: string;
  avatar?: string;
};



type ProjectItem = Project & { labels?: string[]; status: Task["status"] };

export default function ProjectsPage() {
  const router = useRouter();
  const board = useTaskBoard();
  const notifications = useTaskNotifications({
    onOpenTask: (taskId) => router.push(`/tasks/${taskId}`),
  });
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const storedGuest = localStorage.getItem("guest");
      if (!storedGuest) return;
      const guest = JSON.parse(storedGuest) as { guestId?: string; workspaceId?: string };
      if (!guest.guestId || !guest.workspaceId) return;

      const [assignedResponse, tasksResponse, usersResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/projects?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?workspaceId=${guest.workspaceId}&userId=${guest.guestId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspace-members/users?workspaceId=${guest.workspaceId}`),
      ]);

      if (!assignedResponse.ok || !tasksResponse.ok) {
        throw new Error("Failed to fetch projects");
      }

      const assigned = (await assignedResponse.json()) as Task[];
      const allTasks = (await tasksResponse.json()) as Task[];
      const workspaceUsers = usersResponse.ok
        ? ((await usersResponse.json()) as WorkspaceUser[])
        : [];

      setUsers(workspaceUsers);
      const nextUserMap = new Map(workspaceUsers.map((user) => [user.userId, user]));
      const assignedIds = new Set(assigned.map((task) => task._id));
      const ownTasks = allTasks.filter((task) => task.createdBy === guest.guestId && !assignedIds.has(task._id));

      const merged = [...assigned.map((task) => ({ ...task, viewOnly: true })), ...ownTasks.map((task) => ({ ...task, viewOnly: false }))];

      setProjects(merged.map((task) => {
        const lead = nextUserMap.get(task.createdBy);
        return {
          _id: task._id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          leadName: lead?.name || lead?.username || task.createdBy,
          leadAvatar: lead?.avatar,
          viewOnly: task.viewOnly,
          labels: task.labels || [],
          status: task.status,
        };
      }));
    } catch (error) {
      console.error("Projects Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filterTasks: Task[] = useMemo(
    () => projects.map((project) => ({
      _id: project._id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      assignee: project.leadName,
      dueDate: project.dueDate,
      labels: project.labels,
    })),
    [projects],
  );

  const filters = useTaskFilters(filterTasks);

  const visibleProjects = useMemo(() => {
    const ids = new Set(filters.filteredTasks.map((task) => task._id));
    return projects.filter((project) => ids.has(project._id));
  }, [filters.filteredTasks, projects]);

  const handleOpenProject = (project: ProjectItem) => {
    router.push(project.viewOnly ? `/tasks/${project._id}?mode=view` : `/tasks/${project._id}`);
  };

  const handleCreateProject = async () => {
    const created = await board.handleAddTask();
    if (created) await loadProjects();
  };

  const handleUpdateProject = async () => {
    await board.handleUpdateTask();
    await loadProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    await board.handleDeleteTask(projectId);
    await loadProjects();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />
      <main className="ml-0 min-h-screen pb-16 lg:ml-[240px] lg:pb-0">
        <div className="h-[52px] border-b border-[var(--border)]" />
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <TaskBoardToolbar
            pageTitle="Projects"
            addLabel="Add Project"
            searchPlaceholder="Search projects..."
            showViewToggle={false}
            showNotificationButton={false}
            fieldOptionsOverride={["Priority", "Members", "Due Date"]}
            viewMode={filters.viewMode}
            setViewMode={filters.setViewMode}
            searchQuery={filters.searchQuery}
            setSearchQuery={filters.setSearchQuery}
            filterStatus={filters.filterStatus}
            setFilterStatus={filters.setFilterStatus}
            filterPriority={filters.filterPriority}
            setFilterPriority={filters.setFilterPriority}
            filterMember={filters.filterMember}
            setFilterMember={filters.setFilterMember}
            filterDueDate={filters.filterDueDate}
            setFilterDueDate={filters.setFilterDueDate}
            filterLabel={filters.filterLabel}
            setFilterLabel={filters.setFilterLabel}
            visibleFields={filters.visibleFields}
            setVisibleFields={filters.setVisibleFields}
            memberOptions={filters.memberOptions}
            labelOptions={filters.labelOptions}
            clearFilters={filters.clearFilters}
            openAddTask={board.openAddTask}
            notifications={notifications.notifications}
            showNotifications={notifications.showNotifications}
            setShowNotifications={notifications.setShowNotifications}
            notificationsLoading={notifications.notificationsLoading}
            unreadNotificationCount={notifications.unreadNotificationCount}
            markNotificationAsRead={notifications.markNotificationAsRead}
            markAllNotificationsAsRead={notifications.markAllNotificationsAsRead}
            formatNotificationTime={notifications.formatNotificationTime}
            getNotificationIcon={notifications.getNotificationIcon}
          />

          {loading ? (
            <div className="flex h-[160px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[11px] text-[var(--muted)]">Loading projects...</div>
          ) : visibleProjects.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[11px] text-[var(--muted)]">No projects yet.</div>
          ) : (
            <ProjectList
              projects={visibleProjects}
              visibleFields={filters.visibleFields}
              onOpenProject={handleOpenProject}
              onEditProject={board.openEditTask}
              onDeleteProject={handleDeleteProject}
              onAddProject={() => board.openAddTask("To Do")}
            />
          )}

          <TaskFormModal
            open={board.showTaskModal}
            editingTaskId={board.editingTaskId}
            mode="task"
            entityName="Project"
            title={board.title}
            description={board.description}
            selectedStatus={board.selectedStatus}
            priority={board.priority}
            dueDate={board.dueDate}
            labels={board.labels}
            setTitle={board.setTitle}
            setDescription={board.setDescription}
            setSelectedStatus={board.setSelectedStatus}
            setPriority={board.setPriority}
            setDueDate={board.setDueDate}
            setLabels={board.setLabels}
            onClose={board.resetTaskForm}
            onSubmit={board.editingTaskId ? handleUpdateProject : handleCreateProject}
            addingTask={board.addingTask}
            showAddTaskWaitMessage={board.showAddTaskWaitMessage}
          />
        </div>
      </main>
    </div>
  );
}
