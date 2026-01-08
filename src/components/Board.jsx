import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { UserButton } from "@clerk/clerk-react";
import Column from "./Column";
import TaskModal from "./TaskModal";
import CreateTaskModal from "./CreateTaskModal";
import CreateColumnModal from "./CreateColumnModal";
import EditColumnModal from "./EditColumnModal";
import TaskCard from "./TaskCard";

export default function Board({ board, theme }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const tasks =
    useQuery(api.tasks.list, board ? { boardId: board._id } : "skip") || [];
  const columns =
    useQuery(api.columns.list, board ? { boardId: board._id } : "skip") || [];
  const initializeColumns = useMutation(api.columns.initializeDefaultColumns);
  const updateTaskOrder = useMutation(api.tasks.updateOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (board && columns.length === 0) {
      initializeColumns({ boardId: board._id });
    }
  }, [board, columns.length, initializeColumns]);

  const getTasksByColumn = (columnId) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  const getTaskCount = (columnId) => {
    return getTasksByColumn(columnId).length;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    let destColumnId = overId;
    let destTask = tasks.find((t) => t._id === overId);

    if (destTask) {
      destColumnId = destTask.columnId;
    } else {
      const column = columns.find((c) => c._id === overId);
      if (column) {
        destColumnId = column._id;
      } else {
        return;
      }
    }

    if (task.columnId === destColumnId && !destTask) {
      return;
    }

    const destTasks = getTasksByColumn(destColumnId);

    let newOrder;
    if (destTasks.length === 0) {
      newOrder = 0;
    } else if (destTask) {
      const destIndex = destTasks.findIndex((t) => t._id === destTask._id);
      if (destIndex === 0) {
        newOrder = destIndex[0].order - 1;
      } else {
        const beforeTask = destTasks[destIndex - 1];
        const afterTask = destTasks[destIndex];
        newOrder = (beforeTask.order + afterTask.order) / 2;
      }
    } else {
      newOrder = destTasks[destTasks.length - 1].order + 1;
    }

    await updateTaskOrder({
      taskId: taskId,
      newColumnId: destColumnId,
      newOrder: newOrder,
    });
  };

  if (!board) {
    return (
      <div
        className={`flex flex-1 items-center justify-center h-full transition-colors ${
          theme === "dark" ? "bg-slate-900" : "bg-slate-100"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-2xl! font-semibold mb-2 tansition-colors ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Welcome to your Kanban Board
          </h2>
          <p
            className={`transition-colors ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Create or select a board to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 min-w-full flex flex-col transition-colors ${
        theme === "dark" ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <div
        className={`flex items-center justify-between p-6 border-b transition-colors ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <h1 className={`text-2xl! font-bold transitionc-colors`}>
          {board.name}
        </h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
          >
            <Plus className="size-4" />
            <span>Add New Task</span>
          </button>

          <UserButton />
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-start space-x-6 min-w-max h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map((t) => t._id)}>
              {columns.map((column) => (
                <Column
                  key={column._id}
                  column={column}
                  count={getTaskCount(column._id)}
                  tasks={getTasksByColumn(column._id)}
                  onTaskClick={setSelectedTask}
                  onEditColumn={setEditingColumn}
                  theme={theme}
                />
              ))}
            </SortableContext>

            {/* New column button */}
            <div className="w-72 shrink-0 flex items-start justify-center pt-12">
              <button
                onClick={() => setIsCreateColumnModalOpen(true)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium text-lg rounded-lg border min-h-[200px] w-full justify-center transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:text-slate-100 bg-slate-900 border-slate-800 hover:border-purple-500"
                    : "text-slate-500 hover:text-slate-900 bg-slate-100 border-slate-200 hover:border-purple-500"
                }`}
              >
                <Plus className="size-6" />
                <span>New Column</span>
              </button>
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard task={activeTask} isDragging={true} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          theme={theme}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        boardId={board._id}
        columns={columns}
        theme={theme}
      />

      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
        boardId={board._id}
        theme={theme}
      />

      {editingColumn && (
        <EditColumnModal
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
