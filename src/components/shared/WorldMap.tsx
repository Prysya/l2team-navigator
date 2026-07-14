import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './WorldMap.module.scss';

const BASE = import.meta.env.BASE_URL;

interface WorldMapProps {
  name: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function WorldMap({ name, x, y, onClose }: WorldMapProps) {
  const [scale, setScale] = useState(1.1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const vw = window.innerWidth * 0.9;
    const vh = window.innerHeight * 0.9;
    const s = 1.1;
    const cx = vw / 2 - x * s;
    const cy = vh / 2 - y * s;
    setPos({ x: cx, y: cy });
  }, [x, y]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(3, Math.max(0.15, prev * delta)));
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragPos.current = { ...pos };
    },
    [pos],
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: dragPos.current.x + (e.clientX - dragStart.current.x),
      y: dragPos.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className={styles.overlay} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>🗺️ {name}</span>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.viewport} onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove}>
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
          <button onClick={() => setScale((s) => Math.min(3, s * 1.3))} className={styles.zoomBtn}>
            +
          </button>
          <span className={styles.zoomValue}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.max(0.15, s / 1.3))} className={styles.zoomBtn}>
            −
          </button>
        </div>
      </div>
    </div>
  );
}
