"use client";

import {
  RotateCw,
  RotateCcw,
  Trash2,
  Scissors,
  Layers,
  Move,
  Square,
  Pencil,
  Compass,
  MapPin,
} from "lucide-react";

interface RightSidebarProps {
  onStartDrawing?: () => void;
  onDeleteAll?: () => void;
  onDeleteSelected?: () => void;
  onSetDrawMode?: (mode: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSplit?: () => void;
  onOverhang?: () => void;
  onRotateLeft?: () => void; // ✅ new prop
  onRotateRight?: () => void; // ✅ new prop
  onToggleStreetView?: () => void; // ✅ new prop
}

export default function RightSidebar({
  onStartDrawing,
  onDeleteAll,
  onDeleteSelected,
  onSetDrawMode,
  onUndo,
  onRedo,
  onSplit,
  onOverhang,
  onRotateLeft,
  onRotateRight,
  onToggleStreetView,
}: RightSidebarProps) {
  // ✅ Polygon draw start
  const handleDrawPolygon = () => {
    onStartDrawing?.();
    onSetDrawMode?.("draw_polygon");
  };

  // ✅ Simple select
  const handleSimpleSelect = () => onSetDrawMode?.("simple_select");
  const handleStreetView = () => onToggleStreetView?.();

  // ✅ Direct select / Edit
  const handleDirectSelect = () => onSetDrawMode?.("direct_select");

  // ✅ Delete selected polygon (not all)
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ✅ Always try delete selected first, then fallback to delete all
    if (onDeleteSelected) {
      // ✅ Call deleteSelected - it will handle selection and fallback to deleteAll if needed
      onDeleteSelected();
    } else if (onDeleteAll) {
      // ✅ Fallback: delete all if deleteSelected not available
      onDeleteAll();
    }
    
    // ✅ Ensure we're in select mode after delete
    onSetDrawMode?.("simple_select");
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

      {/* Select */}
      <button
        onClick={handleSimpleSelect}
        className="flex flex-col items-center text-white hover:text-green-400 transition-colors"
        title="Select Mode"
      >
        <Square className="w-5 h-5" />
        <span className="text-xs">Select</span>
      </button>

      {/* Edit */}
      <button
        onClick={handleDirectSelect}
        className="flex flex-col items-center text-white hover:text-yellow-400 transition-colors"
        title="Edit Points"
      >
        <Move className="w-5 h-5" />
        <span className="text-xs">Edit</span>
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="flex flex-col items-center text-white hover:text-red-400 transition-colors"
        title="Delete All"
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

      {/* Split */}
      <button
        onClick={onSplit}
        className="flex flex-col items-center text-white hover:text-purple-400 transition-colors"
        title="Split Polygon"
      >
        <Scissors className="w-5 h-5" />
        <span className="text-xs ">Split</span>
      </button>

      {/* Overhang */}
      <button
        onClick={onOverhang}
        className="flex flex-col items-center text-white hover:text-purple-400 transition-colors"
        title="Overhang Tool"
      >
        <Layers className="w-5 h-5" />
        <span className="text-xs">Overhang</span>
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
        <Move className="w-5 h-5" />
        <span className="text-xs mt-1">Street</span>
      </button>
    </div>
  );
}
