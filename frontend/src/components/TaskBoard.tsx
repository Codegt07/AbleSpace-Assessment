"use client";

import { useRouter } from "next/navigation";
import TaskFormModal from "./TaskFormModal";
import TaskBoardToolbar from "./task-board/TaskBoardToolbar";
import TaskBoardView from "./task-board/TaskBoardView";
import useTaskBoard from "@/hooks/useTaskBoard";
import useTaskFilters from "@/hooks/useTaskFilters";
import useTaskNotifications from "@/hooks/useTaskNotifications";

export default function TaskBoard() {
  const router = useRouter();

  const openTask = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const notifications = useTaskNotifications({
    onOpenTask: openTask,
  });

  const board = useTaskBoard({
    refreshNotifications: notifications.fetchNotifications,
  });

  const filters = useTaskFilters(board.tasks);

  if (board.loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <p className="text-[12px] text-[var(--muted)]">
          Loading tasks...
        </p>
      </div>
    );
  }

  return (
    <>
      <TaskBoardToolbar
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

      <TaskBoardView
        tasks={filters.filteredTasks}
        searchQuery={filters.searchQuery}
        visibleFields={filters.visibleFields}
        viewMode={filters.viewMode}
        openAddTask={board.openAddTask}
        openTask={openTask}
        openEditTask={board.openEditTask}
        handleDeleteTask={board.handleDeleteTask}
        handleDropTask={board.handleDropTask}
        handleLeaveTask={board.handleLeaveTask}
      />

      <TaskFormModal
        open={board.showTaskModal}
        editingTaskId={board.editingTaskId}
        mode="task"
        description={board.description}
        title={board.title}
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
        onSubmit={
          board.editingTaskId
            ? board.handleUpdateTask
            : board.handleAddTask
        }
        addingTask={board.addingTask}
        showAddTaskWaitMessage={board.showAddTaskWaitMessage}
      />
    </>
  );
}
