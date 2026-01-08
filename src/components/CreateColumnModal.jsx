import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#22d3ee", // cyan
  "#8b5cf6", // purple
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#ec4899", // pink
  "#10b981", // emerald
];

export default function CreateColumnModal({ isOpen, onClose, boardId, theme }) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const createColumn = useMutation(api.columns.create);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createColumn({
      name: name.trim(),
      color: selectedColor,
      boardId,
    });

    setName("");
    setSelectedColor(PRESET_COLORS[0]);
    onClose();
    toast.success("New column added");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-md border ${
          theme === "dark"
            ? "border-slate-700 bg-slate-900"
            : "border-slate-300 bg-slate-100"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Column Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g In Review"
              className="w-full px-3 py-2 rounded-md border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Column Color
            </label>

            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`size-12 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? "border-purple-500 scale-110"
                      : "border-slate-800 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-purple-500 text-white rounded-mg font-medium hover:bg-purple-600 transition-colors"
          >
            Create Column
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
