"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TaskFormModal from "@/components/TaskFormModal";
import TaskHeader from "@/components/task-details/TaskHeader";
import TaskSubtasks from "@/components/task-details/TaskSubtasks";
import TaskComments from "@/components/task-details/TaskComments";
import TaskDetailsSidebar from "@/components/task-details/TaskDetailsSidebar";
import TaskUpdates from "@/components/task-details/TaskUpdates";
import AddMemberModal from "@/components/task-details/AddMemberModal";
import TaskSettingsModal from "@/components/task-details/TaskSettingsModal";
import {
  CalendarIcon,
  PaperclipIcon,
  TagIcon,
  formatShortDate,
} from "@/components/task-details/ui";
import type {
  Task,
  TaskStatus,
  TaskUpdate,
} from "@/components/task-details/types";
import useTaskDetails from "@/hooks/useTaskDetails";
import useTaskMutations from "@/hooks/useTaskMutations";
import useWorkspaceUsers from "@/hooks/useWorkSpaceUsers";
import useTaskComments from "@/hooks/useTaskComments";
import useTaskViews from "@/hooks/useTaskViews";
import TaskResources from "@/components/task-details/TaskResources";


export default function TaskDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = params.taskId as string;
  const viewOnly = searchParams.get("mode") === "view";
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
const [showTaskSettingsModal, setShowTaskSettingsModal] = useState(false);
const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
const [showTaskFormModal, setShowTaskFormModal] = useState(false);
const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

const [taskTitle, setTaskTitle] = useState("");
const [taskDescription, setTaskDescription] = useState("");
const [taskStatus, setTaskStatus] =
  useState<TaskStatus>("To Do");
const [taskPriority, setTaskPriority] = useState("Medium");
const [taskDueDate, setTaskDueDate] = useState("");
const [taskLabels, setTaskLabels] = useState("");
const [subtaskTitle, setSubtaskTitle] = useState("");
const [subtaskDescription, setSubtaskDescription] = useState("");
const [subtaskStatus, setSubtaskStatus] =
  useState<TaskStatus>("To Do");
const [subtaskPriority, setSubtaskPriority] = useState("Medium");
const [subtaskDueDate, setSubtaskDueDate] = useState("");
const [subtaskLabels, setSubtaskLabels] = useState("");
const [memberSearch, setMemberSearch] = useState("");
const [showPriorityMenu, setShowPriorityMenu] = useState(false);
const [openSubtaskAction, setOpenSubtaskAction] = useState<string | null>(null);

const {
  task,
  updates,
  subtasks,
  comments,
  loading,
  currentUserId,
  taskSettings,
  setTask,
  setSubtasks,
  setComments,
  setTaskSettings,
} = useTaskDetails(taskId, viewOnly);

const {
  viewCount,
  viewers,
  showViewers,
  toggleViewers,
} = useTaskViews(taskId, currentUserId, viewOnly);

const {
  workspaceUsers,
  getUser,
  userInitial,
  formatUserName,
} = useWorkspaceUsers(showMemberModal);

const {
  commentText,
  setCommentText,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  showAllComments,
  setShowAllComments,
  expandedReplies,
  rootComments,
  visibleComments,
  toggleReplies,
} = useTaskComments(comments);

const isCreator = currentUserId === task?.createdBy;
const isTaskMember =
  task?.members?.some((member) => member.userId === currentUserId) ?? false;
const canAddMembers =
  !viewOnly && !!task && (isCreator || task.allowMembersToAddMembers !== false);
const canCreateSubtasks =
  !viewOnly && !!task && (isCreator || task.allowMembersToCreateSubtasks !== false);
const canComment =
  !viewOnly && !!task && (isCreator || task.allowMembersToComment !== false);

const {
  creatingSubtask,
  updatingTask,
  addingMemberId,
  addingComment,
  addingReply,
  savingSettings,
  handleCreateSubtask,
  handleUpdateTask,
  handleDeleteSubtask,
  handleDeleteTask,
  handleAddWorkspaceMember,
  handleRemoveMember,
  handleAddComment,
  handlePriorityChange,
  handleStartDateChange,
  handleDueDateChange,
  handleLeaveTask,
  handleSaveTaskSettings,
  handleDeleteComment
} = useTaskMutations({
  taskId,
  task,
  currentUserId,
  isCreator,
  taskSettings,
  editingSubtaskId,
  subtaskTitle,
  subtaskDescription,
  subtaskStatus,
  subtaskPriority,
  subtaskDueDate,
  subtaskLabels,
  editingTaskId,
  taskTitle,
  taskDescription,
  taskStatus,
  taskPriority,
  taskDueDate,
  taskLabels,
  commentText,
  replyText,
  setTask,
  setSubtasks,
  setComments,
  setTaskSettings,
  setShowSubtaskModal,
  setSubtaskTitle,
  setSubtaskDescription,
  setSubtaskStatus,
  setSubtaskPriority,
  setSubtaskDueDate,
  setSubtaskLabels,
  setEditingSubtaskId,
  setOpenSubtaskAction,
  setEditingTaskId,
  setTaskTitle,
  setTaskDescription,
  setTaskStatus,
  setTaskPriority,
  setTaskDueDate,
  setTaskLabels,
  setShowTaskFormModal,
  setShowTaskSettingsModal,
  setReplyText,
  setReplyingTo,
  setCommentText,
  setShowPriorityMenu,
});

const handleEditSubtask = (subtask: Task) => {
  setEditingSubtaskId(subtask._id);
  setSubtaskTitle(subtask.title || "");
  setSubtaskDescription(subtask.description || "");
  setSubtaskStatus(subtask.status || "To Do");
  setSubtaskPriority(subtask.priority || "Medium");
  setSubtaskDueDate(
    subtask.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 10) : "",
  );
  setSubtaskLabels((subtask.labels || []).join(", "));
  setOpenSubtaskAction(null);
  setShowSubtaskModal(true);
};

const handleEditTask = () => {
  if (!task) return;

  setEditingTaskId(task._id);
  setTaskTitle(task.title || "");
  setTaskDescription(task.description || "");
  setTaskStatus(task.status || "To Do");
  setTaskPriority(task.priority || "Medium");
  setTaskDueDate(
    task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 10)
      : "",
  );
  setTaskLabels((task.labels || []).join(", "));

  setShowTaskFormModal(true);
};


  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="ml-0 min-h-screen pb-16 lg:ml-[240px] lg:pb-0">
          <div className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
            <p className="text-[12px] text-[var(--muted)]">
              Loading task...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />

        <main className="ml-0 min-h-screen pb-16 lg:ml-[240px] lg:pb-0">
          <div className="flex items-center justify-center px-6 py-10">
            <p className="text-[12px] text-[var(--muted)]">
              Task not found
            </p>
          </div>
        </main>
      </div>
    );
  }

  const priorityOptions = ["No Priority", "Urgent", "High", "Medium", "Low"];

  const priorityUpdateText = (update: TaskUpdate) => {
    const metadata = update.metadata || {};
    const oldPriority =
      metadata.fromPriority ??
      metadata.previousPriority ??
      metadata.oldPriority ??
      metadata.from;
    const newPriority =
      metadata.toPriority ??
      metadata.nextPriority ??
      metadata.newPriority ??
      metadata.to;

    if (
      (metadata.type === "priority" || metadata.field === "priority") &&
      oldPriority !== undefined &&
      newPriority !== undefined
    ) {
      return `changed priority from ${oldPriority || "No priority"} to ${newPriority}`;
    }

    return update.message;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />

      <main className="ml-0 min-h-screen pb-16 lg:ml-[240px] lg:pb-0">
        <div className="h-[54px] border-b border-[var(--border)]" />

        <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:gap-7 lg:px-7 lg:py-6">
          <section className="contents lg:block lg:min-w-0 lg:flex-1">
            <TaskHeader
              title={task.title}
              description={task.description}
              viewOnly={viewOnly}
              isCreator={isCreator}
              isTaskMember={isTaskMember}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onSettings={() => setShowTaskSettingsModal(true)}
              onLeave={handleLeaveTask}
              viewCount={viewCount}
              viewers={viewers}
              showViewers={showViewers}
              onToggleViewers={toggleViewers}
              getUser={getUser}
            />

            <div className="order-2 mt-5 flex items-center gap-3 lg:order-none">
              <span className="text-[14px] font-medium text-[var(--text)]">Properties</span>
              <div className="flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[9px] font-medium text-white">
                {getUser(task.createdBy)?.avatar ? (
                  <img src={getUser(task.createdBy)?.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  userInitial(task.createdBy)
                )}
              </div>
              <span className="flex items-center gap-1.5 rounded-md bg-[#fff0f0] px-2.5 py-1 text-[11px] font-medium text-[#ff4d4f]">
                <CalendarIcon />
                {formatShortDate(task.dueDate)}
              </span>
            </div>

            <div className="order-3 mt-4 flex items-start gap-4 sm:gap-7 lg:order-none">
              <span className="w-[58px] shrink-0 pt-[3px] text-[13px] font-medium text-[var(--text)] sm:text-[14px]">Labels</span>
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {task.labels?.length ? task.labels.map((label) => (
                  <span key={label} className="flex items-center gap-1 rounded-full bg-[var(--hover)] px-2.5 py-1 text-[12px] font-medium text-[var(--text)]">
                    <TagIcon />
                    {label}
                  </span>
                )) : (
                  <span className="text-[13px] text-[var(--muted)]">No labels</span>
                )}
              </div>
            </div>

            <TaskResources
              task={task}
              viewOnly={viewOnly}
              isCreator={isCreator}
              setTask={setTask}
            />
            <TaskSubtasks
              subtasks={subtasks}
              viewOnly={viewOnly}
              canCreateSubtasks={canCreateSubtasks}
              getUser={getUser}
              userInitial={userInitial}
              onEditSubtask={handleEditSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              openSubtaskAction={openSubtaskAction}
              setOpenSubtaskAction={setOpenSubtaskAction}
              onAddSubtask={() => setShowSubtaskModal(true)}
            />

            <TaskComments
              comments={comments}
              rootComments={rootComments}
              visibleComments={visibleComments}
              showAllComments={showAllComments}
              setShowAllComments={setShowAllComments}
              expandedReplies={expandedReplies}
              toggleReplies={toggleReplies}
              canComment={canComment}
              viewOnly={viewOnly}
              currentUserId={currentUserId}
              addingReply={addingReply}
              replyText={replyText}
              setReplyingTo={setReplyingTo}
              replyingTo={replyingTo}
              setReplyText={setReplyText}
              handleAddComment={handleAddComment}
              handleDeleteComment={handleDeleteComment}
              addingComment={addingComment}
              commentText={commentText}
              setCommentText={setCommentText}
              getUser={getUser}
              userInitial={userInitial}
              formatUserName={formatUserName}
              
            />
          </section>

          <aside className="order-7 w-full shrink-0 lg:order-none lg:w-[285px]">
            <TaskDetailsSidebar
              task={task}
              currentUserId={currentUserId}
              canAddMembers={canAddMembers}
              showPriorityMenu={showPriorityMenu}
              setShowPriorityMenu={setShowPriorityMenu}
              priorityOptions={priorityOptions}
              handlePriorityChange={handlePriorityChange}
              handleStartDateChange={handleStartDateChange}
              handleDueDateChange={handleDueDateChange}
              onAddMembers={() => setShowMemberModal(true)}
              getUser={getUser}
              userInitial={userInitial}
              formatUserName={formatUserName}
            />

            <TaskUpdates
              updates={updates}
              getUser={getUser}
              userInitial={userInitial}
              formatUserName={formatUserName}
              priorityUpdateText={priorityUpdateText}
            />
          </aside>

          </div>

        <TaskFormModal
          open={showSubtaskModal}
          editingTaskId={editingSubtaskId}
          mode="subtask"
          title={subtaskTitle}
          description={subtaskDescription}
          selectedStatus={subtaskStatus}
          priority={subtaskPriority}
          dueDate={subtaskDueDate}
          labels={subtaskLabels}
          setTitle={setSubtaskTitle}
          setDescription={setSubtaskDescription}
          setSelectedStatus={setSubtaskStatus}
          setPriority={setSubtaskPriority}
          setDueDate={setSubtaskDueDate}
          setLabels={setSubtaskLabels}
          onClose={() => {
            setShowSubtaskModal(false);
            setEditingSubtaskId(null);
            setSubtaskTitle("");
            setSubtaskDescription("");
            setSubtaskStatus("To Do");
            setSubtaskPriority("Medium");
            setSubtaskDueDate("");
            setSubtaskLabels("");
          }}
          onSubmit={handleCreateSubtask}
          addingTask={creatingSubtask}
          showAddTaskWaitMessage={false}
        />

        <TaskFormModal
        open={showTaskFormModal}
        editingTaskId={editingTaskId}
        mode="task"
        title={taskTitle}
        description={taskDescription}
        selectedStatus={taskStatus}
        priority={taskPriority}
        dueDate={taskDueDate}
        labels={taskLabels}
        setTitle={setTaskTitle}
        setDescription={setTaskDescription}
        setSelectedStatus={setTaskStatus}
        setPriority={setTaskPriority}
        setDueDate={setTaskDueDate}
        setLabels={setTaskLabels}
        onClose={() => {
          setShowTaskFormModal(false);
          setEditingTaskId(null);
        }}
        onSubmit={handleUpdateTask}
        addingTask={updatingTask}
        showAddTaskWaitMessage={false}
      />

        {showMemberModal && (
          <AddMemberModal
            task={task}
            workspaceUsers={workspaceUsers}
            memberSearch={memberSearch}
            setMemberSearch={setMemberSearch}
            addingMemberId={addingMemberId}
            currentUserId={currentUserId}
            isCreator={isCreator}
            canAddMembers={canAddMembers}
            handleAddWorkspaceMember={handleAddWorkspaceMember}
            handleRemoveMember={handleRemoveMember}
            onClose={() => {
              setShowMemberModal(false);
              setMemberSearch("");
            }}
          />
        )}

       {showTaskSettingsModal && !viewOnly && (
        <TaskSettingsModal
          taskSettings={taskSettings}
          setTaskSettings={setTaskSettings}
          savingSettings={savingSettings}
          handleSaveTaskSettings={handleSaveTaskSettings}
          onClose={() => setShowTaskSettingsModal(false)}
        />
      )}

      </main>
    </div>
  );
}