import TaskCard from "./TaskCard";
type TaskStatus = "To Do" | "Doing" | "Completed" | "On Hold";

type Task = {
  _id: string;
  title: string;
  assignee: string;
  dueDate: string;
  labels: string[];
};

type BoardColumnProps = {
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
};


export default function BoardColumn({
  title,
  tasks,
  onAddTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onDropTask,
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
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">⠿</span>

          <h2 className="text-[12px] font-semibold text-[var(--text)]">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddTask}
            className="cursor-pointer text-[16px] text-[var(--text)]"
          >
            +
          </button>

          <button
            type="button"
            className="cursor-pointer text-[14px] text-[var(--muted)]"
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
            onOpen={() => onOpenTask(task._id)}
            onEdit={() => onEditTask(task._id)}
            onDelete={() => onDeleteTask(task._id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mt-2 flex h-8 w-full cursor-pointer items-center px-2 text-left text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--hover)]"
      >
        + Add Task
      </button>
    </section>
  );
}