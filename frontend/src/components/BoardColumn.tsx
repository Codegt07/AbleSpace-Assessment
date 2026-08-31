import TaskCard from "./TaskCard";

type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

type TaskMember = {
  userId: string;
};

type Task = {
  _id: string;
  title: string;
  assignee: string;
  avatar?: string; // add this
  dueDate: string;
  labels: string[];
  priority: string;

  createdBy?: string;
  members?: TaskMember[];
  currentUserId: string | null;
};

type BoardColumnProps = {
  title: TaskStatus;
  tasks: Task[];
  onAddTask: () => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
  visibleFields: string[];
  onLeaveTask: (taskId: string) => Promise<void>;
};

export default function BoardColumn({
  title,
  tasks,
  visibleFields,
  onAddTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onLeaveTask,
}: BoardColumnProps) {
  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();

        const taskId = event.dataTransfer.getData("taskId");

        if (taskId) {
          onDropTask(taskId, title);
        }
      }}
      className="w-full min-w-0 self-start rounded-lg border border-[var(--border)] bg-[var(--hover)] p-2 text-[var(--text)]"
    >
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[var(--muted)]">⠿</span>

          <h2 className="truncate text-[12px] font-semibold text-[var(--text)] sm:text-[13px]">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onAddTask}
            className="cursor-pointer text-[16px] text-[var(--text)] sm:text-[17px]"
          >
            +
          </button>

          <button
            type="button"
            className="cursor-pointer text-[13px] text-[var(--muted)] sm:text-[15px]"
          >
            •••
          </button>
        </div>
      </div>

      <div className="mt-1 space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            taskId={task._id}
            title={task.title}
            assignee={task.assignee}
            dueDate={task.dueDate}
            labels={task.labels}
            priority={task.priority}
            visibleFields={visibleFields}
            onOpen={() => onOpenTask(task._id)}
            onEdit={() => onEditTask(task._id)}
            onDelete={() => onDeleteTask(task._id)}
            createdBy={task.createdBy}
            members={task.members || []}
            currentUserId={task.currentUserId}
            onLeave={() => onLeaveTask(task._id)}
            avatar={task.avatar}
            />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mt-2 flex h-8 w-full cursor-pointer items-center px-2 text-left text-[10px] font-medium text-[var(--accent)] hover:bg-[var(--hover)] sm:text-[11px]"
      >
        + Add Task
      </button>
    </section>
  );
}