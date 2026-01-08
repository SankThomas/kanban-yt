import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useState } from "react";
import Board from "./Board";
import CreateBoardModal from "./CreateBoardModal";
import Sidebar from "./Sidebar";

export default function AuthenticatedApp() {
  const [currentBoard, setCurrentBoard] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("kanban-theme-yt");
    return saved || "dark";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  const { user } = useUser();
  const createUser = useMutation(api.users.create);
  const boards = useQuery(api.boards.list);

  // Create user in convex
  useEffect(() => {
    if (user) {
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || user.firstName || "User",
      }).catch(() => {});
    }
  }, [user, createUser]);

  // Get current board and show it
  useEffect(() => {
    const getCurrentBoard = () => {
      if (boards?.length > 0 && !currentBoard) {
        setCurrentBoard(boards[0]);
      }
    };

    getCurrentBoard();
  }, [boards, currentBoard]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kanban-theme", theme);
  }, [theme]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initializeColumns = useMutation(api.columns.initializeDefaultColumns);

  useEffect(() => {
    if (currentBoard) {
      initializeColumns({ boardId: currentBoard._id }).catch(() => {});
    }
  }, [currentBoard, initializeColumns]);

  const handleBoardSelect = (board) => {
    setCurrentBoard(board);
  };

  const handleCreateBoard = () => {
    setIsCreateBoardModalOpen(true);
  };

  const handleBoardCreated = (board) => {
    setCurrentBoard(board);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen overflow-auto flex">
      <Sidebar
        currentBoard={currentBoard}
        onBoardSelect={handleBoardSelect}
        onCreateBoard={handleCreateBoard}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "" : "ml-72"}`}
      >
        <Board board={currentBoard} theme={theme} />
      </div>

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        theme={theme}
      />
    </div>
  );
}
