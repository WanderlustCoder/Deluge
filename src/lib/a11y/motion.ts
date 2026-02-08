// Motion and animation accessibility utilities

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get animation duration based on user preference
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

// Get transition based on user preference
export function getTransition(
  property: string,
  duration: number,
  easing: string = 'ease'
): string {
  if (prefersReducedMotion()) {
    return 'none';
  }
  return `${property} ${duration}ms ${easing}`;
}

// Safe animation wrapper for Framer Motion
export function getMotionVariants(
  enter: Record<string, unknown>,
  exit: Record<string, unknown>
) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: exit,
    animate: enter,
    exit: exit,
  };
}

// Animation timing presets
export const ANIMATION_TIMING = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
};

// Get safe timing
export function getSafeTiming(timing: number): number {
  return prefersReducedMotion() ? 0 : timing;
}

// Create a motion-safe animation class
export function getMotionSafeClass(motionClass: string, staticClass: string): string {
  return prefersReducedMotion() ? staticClass : motionClass;
}

// Framer Motion safe props
export function getSafeMotionProps(props: {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
}) {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }
  return props;
}
