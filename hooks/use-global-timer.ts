import { useEffect, useRef, useState } from 'react';

type Tick = (now: number) => void;

const subscribers = new Set<Tick>();
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let currentIntervalMs = 1000;

function restartTimer(intervalMs: number) {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  currentIntervalMs = intervalMs;
  intervalHandle = setInterval(() => {
    const now = Date.now();
    subscribers.forEach((subscriber) => subscriber(now));
  }, intervalMs);
}

export function subscribeToGlobalTimer(subscriber: Tick, minIntervalMs = 1000) {
  subscribers.add(subscriber);

  if (!intervalHandle || minIntervalMs < currentIntervalMs) {
    restartTimer(Math.max(250, minIntervalMs));
  }

  return () => {
    subscribers.delete(subscriber);

    if (!subscribers.size && intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  };
}

export function useGlobalTimer(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  const lastTickRef = useRef(now);

  useEffect(() => {
    return subscribeToGlobalTimer((time) => {
      if (time - lastTickRef.current >= intervalMs) {
        lastTickRef.current = time;
        setNow(time);
      }
    }, intervalMs);
  }, [intervalMs]);

  return now;
}
