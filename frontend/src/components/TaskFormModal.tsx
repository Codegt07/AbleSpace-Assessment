"use client";

type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

type TaskFormModalProps = {
  open: boolean;
  editingTaskId: string | null;
  mode: "task" | "subtask";
  entityName?: "Task" | "Project";
  title: string;
  description: string;
  selectedStatus: TaskStatus;
  priority: string;
  dueDate: string;
  labels: string;
  addingTask: boolean;
  showAddTaskWaitMessage: boolean;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setSelectedStatus: (value: TaskStatus) => void;
  setPriority: (value: string) => void;
  setDueDate: (value: string) => void;
  setLabels: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function TaskFormModal({
  open,
  editingTaskId,
  mode,
  entityName = "Task",
  title,
  description,
  selectedStatus,
  priority,
  dueDate,
  labels,
  setTitle,
  setDescription,
  setSelectedStatus,
  setPriority,
  setDueDate,
  setLabels,
  onClose,
  onSubmit,
  addingTask,
  showAddTaskWaitMessage,
}: TaskFormModalProps) {
  if (!open) return null;

  const isSubtask = mode === "subtask";
  const isEditing = Boolean(editingTaskId);
  const actionName = isSubtask ? "Subtask" : entityName;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div onClick={(event) => event.stopPropagation()} className="w-[435px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[var(--text)]">
            {isEditing ? `Edit ${actionName}` : `Add ${actionName}`}
          </h2>
          <button type="button" onClick={onClose} className="cursor-pointer text-[21px] text-[var(--muted)]">×</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Title</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`Enter ${actionName.toLowerCase()} title`} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[14px] outline-none focus:border-[var(--accent)]" />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a description" rows={3} className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] px-3 py-2 text-[14px] outline-none focus:border-[var(--accent)]" />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Status</label>
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as TaskStatus)} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[14px] outline-none">
              <option value="To Do">To Do</option><option value="Doing">Doing</option><option value="Completed">Completed</option><option value="On Hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Priority</label>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[14px] outline-none">
              <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Due Date</label>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[14px] outline-none" />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[var(--text)]">Labels</label>
            <input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="Design, Frontend" className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] px-3 text-[14px] outline-none" />
            <p className="mt-1 text-[11px] text-[var(--muted)]">Separate multiple labels with commas.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 cursor-pointer rounded-lg border border-[var(--border)] px-4 text-[13px] font-medium text-[var(--text)]">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={addingTask} className="h-9 cursor-pointer rounded-lg bg-[var(--accent)] px-4 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70">
            {addingTask ? "Creating..." : isEditing ? "Save Changes" : `Add ${actionName}`}
          </button>
        </div>

        {showAddTaskWaitMessage && !isEditing && (
          <p className="mt-2 text-center text-[11px] leading-[15px] text-[var(--muted)]">
            The server may take a little longer
            <br />on the first request. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}
