import Sidebar from "@/components/Sidebar";
import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <div className="h-[52px] border-b border-[var(--border)]" />

        <div className="px-6 pt-6">
          <div className="mt-4">
            <TaskBoard />
          </div>
        </div>
      </main>
    </div>
  );
}