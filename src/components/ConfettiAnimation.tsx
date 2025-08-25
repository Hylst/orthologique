import React, { useEffect, useState } from 'react';

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

/**
 * Confetti animation component that displays colorful falling confetti
 * when activated for celebrating 100% lesson completion
 */
const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ isActive, onComplete }) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
    size: number;
    speedX: number;
    speedY: number;
    rotationSpeed: number;
  }>>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setConfettiPieces([]);
      setAnimationComplete(false);
      return;
    }

    setAnimationComplete(false);

    // Create confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      rotation: Math.random() * 360,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 7)],
      size: Math.random() * 8 + 4,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    setConfettiPieces(pieces);

    // Animation loop
    const animationInterval = setInterval(() => {
      setConfettiPieces(prevPieces => {
        const updatedPieces = prevPieces.map(piece => ({
          ...piece,
          x: piece.x + piece.speedX,
          y: piece.y + piece.speedY,
          rotation: piece.rotation + piece.rotationSpeed,
          speedY: piece.speedY + 0.1, // Gravity effect
        })).filter(piece => piece.y < window.innerHeight + 20);

        // If all pieces have fallen, mark animation as complete
        if (updatedPieces.length === 0) {
          clearInterval(animationInterval);
          setAnimationComplete(true);
        }

        return updatedPieces;
      });
    }, 16); // ~60fps

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(animationInterval);
      setConfettiPieces([]);
      setAnimationComplete(true);
    }, 5000);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(timeout);
    };
  }, [isActive, onComplete]);

  // Handle animation completion callback
  useEffect(() => {
    if (animationComplete && onComplete) {
      onComplete();
    }
  }, [animationComplete, onComplete]);

  if (!isActive || confettiPieces.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            transition: 'none',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;