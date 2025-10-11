import React, { useEffect, useState } from "react";

export const SimpleCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Fallback cursor that's always visible */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: position.x - 12,
          top: position.y - 12,
        }}
      >
        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg" />
      </div>
      
      {/* Debug info */}
      <div
        className="fixed top-4 left-4 bg-black text-white p-2 rounded z-[9999] text-xs"
        style={{ opacity: 0.8 }}
      >
        Cursor: {position.x}, {position.y}
      </div>
    </>
  );
};
