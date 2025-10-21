import React from 'react';

interface ResizableDividerProps {
  setLeftPanelWidth: React.Dispatch<React.SetStateAction<number>>;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({
  setLeftPanelWidth,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setLeftPanelWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="w-[4px] cursor-col-resize bg-gradient-to-r from-gray-100 to-gray-200"
      onMouseDown={handleMouseDown}
    />
  );
};

export default ResizableDivider;

//      className="absolute left-[-2px] z-10 h-full w-[4px] cursor-ew-resize bg-token-text-quaternary opacity-0"
