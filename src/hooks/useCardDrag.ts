"use client";

import { useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useCallback } from "react";

interface UseCardDragProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

export function useCardDrag({ onSwipeLeft, onSwipeRight, disabled = false }: UseCardDragProps) {
  const [{ x, y, rotation, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
  }));

  const bind = useDrag(
    ({ active, movement: [mx, my], direction: [xDir], velocity: [vx] }) => {
      if (disabled) return;

      // Calculate rotation based on horizontal movement
      const rotationValue = mx / 100;
      
      // Determine if this is a trigger swipe (fast movement or moved far enough)
      const trigger = !active && (Math.abs(mx) > 100 || Math.abs(vx) > 0.5);
      
      if (trigger) {
        // Determine swipe direction and trigger callback
        const isSwipeRight = xDir > 0;
        
        // Animate card flying off screen
        api.start({
          x: isSwipeRight ? window.innerWidth + 200 : -window.innerWidth - 200,
          y: my + (isSwipeRight ? -100 : -100),
          rotation: isSwipeRight ? 30 : -30,
          scale: 0.8,
          config: { tension: 200, friction: 20 },
          onResolve: () => {
            // Trigger the callback immediately after starting animation
            setTimeout(() => {
              if (isSwipeRight) {
                onSwipeRight();
              } else {
                onSwipeLeft();
              }
            }, 100); // Small delay to let animation start
          },
        });
      } else if (active) {
        // Card follows finger while dragging
        api.start({
          x: mx,
          y: my,
          rotation: rotationValue,
          scale: 1.05,
          immediate: true,
        });
      } else {
        // Snap back to center when released without trigger
        api.start({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          config: { tension: 300, friction: 30 },
        });
      }
    },
    {
      axis: undefined, // Allow movement in all directions
      bounds: { left: -300, right: 300, top: -200, bottom: 200 },
      rubberband: true,
    }
  );

  const resetCard = useCallback(() => {
    api.set({ x: 0, y: 0, rotation: 0, scale: 1 });
  }, [api]);

  return {
    bind,
    style: {
      x,
      y,
      rotation: rotation.to(r => `rotate(${r}deg)`),
      scale,
    },
    resetCard,
  };
}