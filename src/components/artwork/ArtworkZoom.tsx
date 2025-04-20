
import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ArtworkZoomProps {
  imageUrl: string;
  title: string;
}

const ArtworkZoom = ({ imageUrl, title }: ArtworkZoomProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && scale > 1) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };
  
  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={() => setIsOpen(true)}
      >
        <ZoomIn className="h-4 w-4" />
        <span>Zoom</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-[80vh]">
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
              <Button variant="secondary" size="icon" onClick={handleZoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={handleZoomIn} disabled={scale >= 3}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div 
              ref={containerRef}
              className="w-full h-full overflow-hidden bg-black/50 relative"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="absolute transform origin-center transition-transform duration-100 cursor-move"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-25%', // Center the image
                  marginTop: '-25%',
                  width: '50%', // Make image take up half the container
                  height: '50%',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArtworkZoom;
