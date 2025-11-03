// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";

// interface MagnifierProps {
//   map: mapboxgl.Map | null;
//   isVisible: boolean;
//   onClose: () => void;
// }

// const Magnifier: React.FC<MagnifierProps> = ({ map, isVisible, onClose }) => {
//   const magnifierRef = useRef<HTMLDivElement>(null);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const [mapLngLat, setMapLngLat] = useState<[number, number] | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (!map || !isVisible) return;

//     // ✅ Initialize with map center
//     const center = map.getCenter();
//     setMapLngLat([center.lng, center.lat]);

//     const handleMouseMove = (e: MouseEvent) => {
//       const rect = map.getCanvas().getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
      
//       // ✅ Convert pixel to lng/lat for magnifier content (real-time)
//       const lngLat = map.unproject([x, y]);
//       setMapLngLat([lngLat.lng, lngLat.lat]);
//     };

//     // ✅ Listen on canvas container for mouse moves (real-time updates)
//     const mapCanvas = map.getCanvasContainer();
//     mapCanvas.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       mapCanvas.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, [map, isVisible]);

//   useEffect(() => {
//     if (!map || !isVisible || !canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const updateMagnifier = () => {
//       if (!mapLngLat) {
//         // If no mouse position, show center of map
//         const center = map.getCenter();
//         setMapLngLat([center.lng, center.lat]);
//         return;
//       }

//       const width = canvas.width;
//       const height = canvas.height;
      
//       // Get map's current zoom
//       const currentZoom = map.getZoom();
//       const targetZoom = Math.min(currentZoom + 2, 22);
//       const scale = Math.pow(2, targetZoom - currentZoom);
      
//       // Calculate center point on map
//       const center = map.project(mapLngLat);
      
//       // Calculate source region to capture
//       const sourceX = Math.max(0, center.x - (width / 2) / scale);
//       const sourceY = Math.max(0, center.y - (height / 2) / scale);
//       const sourceWidth = width / scale;
//       const sourceHeight = height / scale;
      
//       // Get map canvas
//       const sourceCanvas = map.getCanvas();
      
//       if (sourceCanvas) {
//         ctx.clearRect(0, 0, width, height);
        
//         try {
//           // Draw magnified region from map canvas
//           ctx.drawImage(
//             sourceCanvas,
//             sourceX,
//             sourceY,
//             sourceWidth,
//             sourceHeight,
//             0,
//             0,
//             width,
//             height
//           );
          
//           // Draw crosshair
//           ctx.strokeStyle = "#FF0000";
//           ctx.lineWidth = 2;
//           ctx.beginPath();
//           ctx.moveTo(width / 2 - 15, height / 2);
//           ctx.lineTo(width / 2 + 15, height / 2);
//           ctx.moveTo(width / 2, height / 2 - 15);
//           ctx.lineTo(width / 2, height / 2 + 15);
//           ctx.stroke();
//         } catch (err) {
//           // Canvas might not be ready, ignore
//         }
//       }
//     };

//     // ✅ Update immediately on mount and whenever mapLngLat changes (real-time)
//     updateMagnifier();
    
//     // ✅ Also update on map move/zoom for continuous updates
//     const updateInterval = setInterval(updateMagnifier, 50); // Faster interval for smoother updates
    
//     return () => clearInterval(updateInterval);
//   }, [map, isVisible, mapLngLat]);

//   if (!isVisible || !map) return null;

//   return (
//     <div
//       ref={magnifierRef}
//       className="absolute pointer-events-none z-50 fixed"
//       style={{
//         left: "20px",
//         top: "80px", // Below header
//         width: "150px",
//         height: "150px",
//       }}
//     >
//       <div className="relative w-full h-full bg-white rounded-full border-4 border-gray-800 shadow-2xl overflow-hidden">
//         <canvas
//           ref={canvasRef}
//           width={150}
//           height={150}
//           className="w-full h-full"
//           style={{ imageRendering: "pixelated" }}
//         />
//         <div className="absolute inset-0 border-2 border-white rounded-full pointer-events-none"></div>
//       </div>
//     </div>
//   );
// };

// export default Magnifier;

