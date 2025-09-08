"use client";

import { useSpring, config } from "@react-spring/web";
import { useState, useCallback } from "react";

export interface UseSwipeAnimationProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function useSwipeAnimation({ onSwipeLeft, onSwipeRight }: UseSwipeAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const [springs, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
    config: config.default,
  }));

  const animateSwipeLeft = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Animate card flying off to the left
    api.start({
      x: -window.innerWidth * 1.5,
      y: -100,
      rotation: -30,
      opacity: 0,
      config: config.wobbly,
      onResolve: () => {
        // Reset position off-screen right for next card
        api.set({
          x: window.innerWidth * 1.5,
          y: 0,
          rotation: 30,
          opacity: 0,
          scale: 0.8,
        });

        onSwipeLeft();

        // Animate in the new card from the right
        api.start({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          config: config.gentle,
          onResolve: () => {
            setIsAnimating(false);
          },
        });
      },
    });
  }, [api, onSwipeLeft, isAnimating]);

  const animateSwipeRight = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Animate card flying off to the right
    api.start({
      x: window.innerWidth * 1.5,
      y: -100,
      rotation: 30,
      opacity: 0,
      config: config.wobbly,
      onResolve: () => {
        // Reset position off-screen left for next card
        api.set({
          x: -window.innerWidth * 1.5,
          y: 0,
          rotation: -30,
          opacity: 0,
          scale: 0.8,
        });

        onSwipeRight();

        // Animate in the new card from the left
        api.start({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          config: config.gentle,
          onResolve: () => {
            setIsAnimating(false);
          },
        });
      },
    });
  }, [api, onSwipeRight, isAnimating]);

  const handleSwipeStart = useCallback(() => {
    // Add subtle scale animation on swipe start
    api.start({
      scale: 1.02,
      config: config.wobbly,
    });
  }, [api]);

  const handleSwipeEnd = useCallback(() => {
    // Reset scale when swipe ends without completing
    api.start({
      scale: 1,
      config: config.gentle,
    });
  }, [api]);

  return {
    springs,
    isAnimating,
    animateSwipeLeft,
    animateSwipeRight,
    handleSwipeStart,
    handleSwipeEnd,
  };
}