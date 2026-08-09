import Sidebar from "@/components/Sidebar";
import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <main className="ml-[240px] min-h-screen">
        <div className="h-[52px] border-b border-[#e8e8e8]" />

        <div className="px-6 pt-6">
          <h1 className="text-[16px] font-semibold text-[#171717]">
            Tasks
          </h1>

          <div className="mt-4">
            <TaskBoard />
          </div>
        </div>
      </main>
    </div>
  );
}