import { useState, useRef, useEffect, useCallback } from 'react';

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
    setScale(prev => Math.min(3, Math.max(0.15, prev * delta)));
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragPos.current = { ...pos };
  }, [pos]);

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
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        style={{
          background: 'var(--color-surface)', border: '2px solid var(--color-border)',
          borderRadius: 8, overflow: 'hidden', maxWidth: '90vw', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', position: 'relative',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
          fontWeight: 700, color: 'var(--color-text)', fontSize: 13,
        }}>
          <span>🗺️ {name}</span>
          <button onClick={onClose} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6,
            color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        <div
          style={{ overflow: 'hidden', position: 'relative' }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
        >
          <div style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            backgroundImage: `url(${BASE}maps/world-map.jpg)`,
            width: 3004, height: 3004, backgroundSize: '3004px 3004px',
          }}>
            <div style={{
              position: 'absolute', left: x, top: y, width: 14, height: 14,
              background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
              transform: 'translate(-50%, -50%)', zIndex: 10,
              boxShadow: '0 0 12px rgba(239,68,68,0.6)',
            }}>
              <span style={{
                position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                marginBottom: 4, background: 'var(--color-bg)', color: 'var(--color-primary)',
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                whiteSpace: 'nowrap', border: '1px solid var(--color-border)', pointerEvents: 'none',
              }}>
                {name}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '10px 16px', borderTop: '1px solid var(--color-border)',
        }}>
          <button onClick={() => setScale(s => Math.min(3, s * 1.3))} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4,
            color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 700,
          }}>+</button>
          <span style={{ color: '#fff', fontSize: 12, minWidth: 40, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale(s => Math.max(0.15, s / 1.3))} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4,
            color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 700,
          }}>−</button>
        </div>
      </div>
    </div>
  );
}
