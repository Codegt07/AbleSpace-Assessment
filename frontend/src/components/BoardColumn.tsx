import TaskCard from "./TaskCard";

type Task = {
  title: string;
  assignee: string;
  dueDate: string;
  labels: string[];
};

type BoardColumnProps = {
  title: string;
  tasks: Task[];
};

export default function BoardColumn({
  title,
  tasks,
}: BoardColumnProps) {
  return (
    <section className="w-full min-w-0 rounded-lg border border-[#e4e4e4] bg-[#f5f5f5] p-2 self-start">
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[#555]">⠿</span>

          <h2 className="text-[12px] font-semibold text-[#222]">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[16px] text-[#333]"
          >
            +
          </button>

          <button
            type="button"
            className="text-[14px] text-[#777]"
          >
            •••
          </button>
        </div>
      </div>

      <div className="mt-1 space-y-2">
        {tasks.map((task, index) => (
          <TaskCard
            key={`${task.title}-${index}`}
            title={task.title}
            assignee={task.assignee}
            dueDate={task.dueDate}
            labels={task.labels}
          />
        ))}
      </div>

      <button
        type="button"
        className="mt-2 flex h-8 w-full items-center px-2 text-left text-[11px] font-medium text-[#333] hover:bg-[#ebebeb]"
      >
        + Add Task
      </button>
    </section>
  );
}