import BoardColumn from "./BoardColumn";

const columns = [
  {
    title: "To Do",
    tasks: [
      {
        title: "Write API Documentation",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: ["Deployment", "Deployment"],
      },
      {
        title: "Implement Search Function",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: ["Deployment", "Deployment"],
      },
      {
        title: "Deploy to Production",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: ["Deployment", "Deployment"],
      },
    ],
  },
  {
    title: "Doing",
    tasks: [
      {
        title: "Code Review Completed",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: ["Deployment", "Deployment"],
      },
      {
        title: "Design Mockups Finalized",
        assignee: "Admin",
        dueDate: "29 Jul",
        labels: ["Deployment", "Deployment"],
      },
    ],
  },
  {
    title: "Completed",
    tasks: [
      {
        title: "Feature Testing Passed",
        assignee: "QA Team",
        dueDate: "30 Jul",
        labels: ["Testing", "Passed"],
      },
      {
        title: "UI Design Updated",
        assignee: "Designer",
        dueDate: "31 Jul",
        labels: ["Design", "Updated"],
      },
      {
        title: "Security Audit Scheduled",
        assignee: "Security",
        dueDate: "01 Aug",
        labels: ["Audit", "Scheduled"],
      },
    ],
  },
  {
    title: "On Hold",
    tasks: [
      {
        title: "UI Review Pending",
        assignee: "Designer",
        dueDate: "02 Aug",
        labels: ["Review", "Pending"],
      },
      {
        title: "Backend Integration",
        assignee: "Dev Team",
        dueDate: "03 Aug",
        labels: ["Development"],
      },
    ],
  },
];

export default function TaskBoard() {
  return (
    <div className="grid w-full grid-cols-4 gap-3">
      {columns.map((column) => (
        <BoardColumn
          key={column.title}
          title={column.title}
          tasks={column.tasks}
        />
      ))}
    </div>
  );
}