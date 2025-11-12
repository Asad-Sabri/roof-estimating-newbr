"use client";

import {
  RotateCw,
  RotateCcw,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Minus,
} from "lucide-react";

interface RightSidebarProps {
  onStartDrawing?: () => void;
  onStartSingleDrawing?: () => void;
  onSetDrawMode?: () => void;
  onDeleteAll?: () => void; 
  onDeleteSelected?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onToggleStreetView?: () => void;
  onToggleLabels?: () => void;
  labelsVisible?: boolean;
}

export default function RightSidebar({
  onStartDrawing,
  onStartSingleDrawing,
  onSetDrawMode,
  onDeleteAll,
  onDeleteSelected,
  onUndo,
  onRedo,
  onRotateLeft,
  onRotateRight,
  onToggleStreetView,
  onToggleLabels,
  labelsVisible,
}: RightSidebarProps) {
  // ✅ Polygon draw start
  const handleDrawPolygon = () => {
    onStartDrawing?.();
  };

  // ✅ Line draw start
    const handleSingleDrawLine = () => {
      onStartSingleDrawing?.();
    };

  const handleStreetView = () => onToggleStreetView?.();

  // ✅ Delete selected polygon (not all)
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ Always try delete selected first, then fallback to delete all
    if (onDeleteSelected) {
      onDeleteSelected();
    } else if (onDeleteAll) {
      onDeleteAll();
    }
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-[#0a1f44]/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/10 z-30">
      {/* Draw Polygon */}
      <button
        onClick={handleDrawPolygon}
        className="flex flex-col items-center text-white hover:text-blue-400 transition-colors"
        title="Draw Polygon"
      >
        <Pencil className="w-5 h-5" />
        <span className="text-xs">Draw</span>
      </button>

      {/* Draw Line */}
      <button
        onClick={handleSingleDrawLine}
        className="flex flex-col items-center text-white hover:text-blue-400 transition-colors"
        title="Draw Line"
      >
        <Minus className="w-5 h-5" />
        <span className="text-xs">Line</span>
      </button>


      {/* Delete */}
      <button
        onClick={handleDelete}
        className="flex flex-col items-center text-white hover:text-red-400 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-5 h-5" />
        <span className="text-xs">Delete</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-600 my-1"></div>

      {/* Undo */}
      <button
        onClick={onUndo}
        className="flex flex-col items-center text-white hover:text-purple-400 transition-colors"
        title="Undo"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-xs ">Undo</span>
      </button>

      {/* Redo */}
      <button
        onClick={onRedo}
        className="flex flex-col items-center text-white hover:text-purple-400 transition-colors"
        title="Redo"
      >
        <RotateCw className="w-5 h-5" />
        <span className="text-xs ">Redo</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-600 my-1"></div>

      {/* Rotate Left */}
      <button
        onClick={onRotateLeft}
        className="flex flex-col items-center text-white hover:text-cyan-400 transition-colors"
        title="Rotate Left"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="text-xs">Rotate L</span>
      </button>

      {/* Rotate Right */}
      <button
        onClick={onRotateRight}
        className="flex flex-col items-center text-white hover:text-cyan-400 transition-colors"
        title="Rotate Right"
      >
        <RotateCw className="w-5 h-5" />
        <span className="text-xs">Rotate R</span>
      </button>

      <button
        onClick={handleStreetView}
        className="flex flex-col items-center text-white hover:text-orange-400 transition-colors"
        title="Street View"
      >
        <Pencil className="w-5 h-5" />
        <span className="text-xs mt-1">Street</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-600 my-1"></div>

      {/* Toggle Labels */}
      <button
        onClick={() => onToggleLabels?.()}
        className="flex flex-col items-center text-white hover:text-green-400 transition-colors"
        title="Toggle Labels"
      >
        {labelsVisible ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
        <span className="text-xs mt-1">
          {labelsVisible ? "Hide" : "Show"}
        </span>
      </button>
    </div>
  );
}
