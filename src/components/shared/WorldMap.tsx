import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './WorldMap.module.scss';

const BASE = import.meta.env.BASE_URL;

interface WorldMapProps {
  name: string;
  x: number;
  y: number;
  onClose: () => void;
}

const INITIAL_SCALE = 1.1;
const MIN_SCALE = 0.15;
const MAX_SCALE = 3;
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

const touchDistance = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
const touchMidpoint = (t: React.TouchList) => ({
  x: (t[0].clientX + t[1].clientX) / 2,
  y: (t[0].clientY + t[1].clientY) / 2,
});

export default function WorldMap({ name, x, y, onClose }: WorldMapProps) {
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  // Mirror latest state so zoom/pan math never reads a stale closure value.
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const posRef = useRef(pos);
  posRef.current = pos;
  const dragging = useRef(false);
  const dragLast = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(0);

  // Center the marker inside the visible viewport once it has been measured.
  useEffect(() => {
    const vp = viewportRef.current;
    const vw = vp ? vp.clientWidth : window.innerWidth * 0.9;
    const vh = vp ? vp.clientHeight : window.innerHeight * 0.9;
    setPos({ x: vw / 2 - x * INITIAL_SCALE, y: vh / 2 - y * INITIAL_SCALE });
  }, [x, y]);

  // Convert a client (screen) point into viewport-local coordinates.
  const toViewport = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    return rect ? { x: clientX - rect.left, y: clientY - rect.top } : { x: clientX, y: clientY };
  }, []);

  // Zoom by `factor` keeping the focal point (fx, fy, in viewport coords) fixed on screen.
  const zoomAt = useCallback((factor: number, fx: number, fy: number) => {
    const prevScale = scaleRef.current;
    const nextScale = clampScale(prevScale * factor);
    if (nextScale === prevScale) return;
    const ratio = nextScale / prevScale;
    const p = posRef.current;
    setScale(nextScale);
    setPos({ x: fx - (fx - p.x) * ratio, y: fy - (fy - p.y) * ratio });
  }, []);

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const vp = viewportRef.current;
      zoomAt(factor, vp ? vp.clientWidth / 2 : 0, vp ? vp.clientHeight / 2 : 0);
    },
    [zoomAt],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const f = toViewport(e.clientX, e.clientY);
      zoomAt(e.deltaY > 0 ? 0.9 : 1.1, f.x, f.y);
    },
    [toViewport, zoomAt],
  );

  const panStart = useCallback((cx: number, cy: number) => {
    dragging.current = true;
    dragLast.current = { x: cx, y: cy };
  }, []);

  const panMove = useCallback((cx: number, cy: number) => {
    if (!dragging.current) return;
    const dx = cx - dragLast.current.x;
    const dy = cy - dragLast.current.y;
    dragLast.current = { x: cx, y: cy };
    const p = posRef.current;
    setPos({ x: p.x + dx, y: p.y + dy });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => panStart(e.clientX, e.clientY), [panStart]);
  const onMouseMove = useCallback((e: React.MouseEvent) => panMove(e.clientX, e.clientY), [panMove]);
  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        dragging.current = false;
        pinchDist.current = touchDistance(e.touches);
      } else if (e.touches.length === 1) {
        panStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [panStart],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = touchDistance(e.touches);
        if (pinchDist.current > 0) {
          const mid = touchMidpoint(e.touches);
          const f = toViewport(mid.x, mid.y);
          zoomAt(dist / pinchDist.current, f.x, f.y);
        }
        pinchDist.current = dist;
      } else if (e.touches.length === 1) {
        panMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [panMove, toViewport, zoomAt],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      pinchDist.current = 0;
      if (e.touches.length === 0) dragging.current = false;
      else if (e.touches.length === 1) panStart(e.touches[0].clientX, e.touches[0].clientY);
    },
    [panStart],
  );

  // Rendered through a portal to document.body: an ancestor .tab-page keeps a
  // persistent transform (page-entry animation, fill-mode: both), which would
  // otherwise trap position:fixed and push this modal off-screen.
  return createPortal(
    <div className={styles.overlay} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>🗺️ {name}</span>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div
          ref={viewportRef}
          className={styles.viewport}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={styles.canvas}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              backgroundImage: `url(${BASE}maps/world-map.jpg)`,
              width: 3004,
              height: 3004,
              backgroundSize: '3004px 3004px',
            }}
          >
            <div className={styles.marker} style={{ left: x, top: y }}>
              <span className={styles.markerLabel}>{name}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={() => zoomFromCenter(1.3)} className={styles.zoomBtn}>
            +
          </button>
          <span className={styles.zoomValue}>{Math.round(scale * 100)}%</span>
          <button onClick={() => zoomFromCenter(1 / 1.3)} className={styles.zoomBtn}>
            −
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
