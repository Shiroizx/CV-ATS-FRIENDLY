import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  Move,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react';
import { processVCardImageDataUrl } from '../../lib/qrExport';
import { computeVCardImageCropLayout } from '../../lib/qrHelpers';
import { showError } from '../../utils/swal';

interface QRImageEditorModalProps {
  imageUrl: string;
  squareCrop?: boolean;
  aspectRatio?: number;
  maxChars?: number;
  onClose: () => void;
  onSave: (processedDataUrl: string) => void;
}

/**
 * Modal edit gambar (Geser/Pan, Perbesar, Flip Horizontal/Vertikal, Putar Kiri/Kanan)
 * untuk foto profil avatar, banner kustom, maupun layar selamat datang vCard.
 */
export default function QRImageEditorModal({
  imageUrl,
  squareCrop = true,
  aspectRatio,
  maxChars = 14000,
  onClose,
  onSave,
}: QRImageEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 240, h: 240 });
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const cropStageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  useEffect(() => {
    const stage = cropStageRef.current;
    if (!stage) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY < 0 ? 0.1 : -0.1;
      setZoom((prev) => Math.min(3, Math.max(1, Number((prev + step).toFixed(2)))));
    };
    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, []);

  const normalizedRot = ((rotateDeg % 360) + 360) % 360;
  const swapped = normalizedRot === 90 || normalizedRot === 270;
  const orientedW = swapped ? naturalSize.h : naturalSize.w;
  const orientedH = swapped ? naturalSize.w : naturalSize.h;

  let frameW = 196;
  let frameH = 196;
  if (squareCrop) {
    frameW = 196;
    frameH = 196;
  } else if (aspectRatio && aspectRatio > 0) {
    frameW = 224;
    frameH = Math.max(80, Math.round(frameW / aspectRatio));
  } else {
    const fit = Math.min(196 / Math.max(1, orientedW), 196 / Math.max(1, orientedH));
    frameW = Math.max(60, Math.round(orientedW * fit));
    frameH = Math.max(60, Math.round(orientedH * fit));
  }

  const layout = computeVCardImageCropLayout({
    srcW: naturalSize.w,
    srcH: naturalSize.h,
    frameW,
    frameH,
    zoom,
    rotateDeg,
    cover: true,
    offsetX: offset.x,
    offsetY: offset.y,
  });

  const canPan = layout.maxOffsetX > 0.002 || layout.maxOffsetY > 0.002;
  const hasEdits =
    zoom > 1.001 ||
    flipH ||
    flipV ||
    normalizedRot !== 0 ||
    Math.abs(layout.clampedOffsetX) > 0.001 ||
    Math.abs(layout.clampedOffsetY) > 0.001;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: layout.clampedOffsetX,
      startOffsetY: layout.clampedOffsetY,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const rawX = drag.startOffsetX + (e.clientX - drag.startX) / frameW;
    const rawY = drag.startOffsetY + (e.clientY - drag.startY) / frameH;
    setOffset({
      x: Math.max(-layout.maxOffsetX, Math.min(layout.maxOffsetX, rawX)),
      y: Math.max(-layout.maxOffsetY, Math.min(layout.maxOffsetY, rawY)),
    });
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setFlipH(false);
    setFlipV(false);
    setRotateDeg(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await processVCardImageDataUrl(imageUrl, {
        zoom,
        flipH,
        flipV,
        rotateDeg,
        squareCrop,
        aspectRatio,
        offsetX: layout.clampedOffsetX,
        offsetY: layout.clampedOffsetY,
        maxChars,
      });
      onSave(result);
    } catch (err) {
      await showError(
        'Gagal Memproses Gambar',
        err instanceof Error ? err.message : 'Gambar gagal disesuaikan.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <span>Tutup</span>
            <X className="w-4 h-4 rounded-full border border-white/70 p-0.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-5">
          {/* Kanvas Pratinjau Crop Interaktif (Area Luar Transparan, Bisa Digeser & Scroll Zoom) */}
          <div
            ref={cropStageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className={`relative w-full min-h-[276px] mx-auto bg-zinc-200 rounded-xl overflow-hidden flex items-center justify-center px-3 pt-4 pb-11 touch-none select-none ${
              canPan
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-default'
            }`}
          >
            <div
              className="relative flex-shrink-0"
              style={{
                width: `${frameW}px`,
                height: `${frameH}px`,
              }}
            >
              <div
                aria-hidden="true"
                className={`absolute inset-0 z-0 ${
                  squareCrop ? 'rounded-full bg-white' : 'bg-white'
                }`}
              />
              <img
                src={imageUrl}
                alt="Pratinjau edit gambar"
                draggable={false}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                    setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
                  }
                }}
                className={`z-10 pointer-events-none select-none ${
                  isDragging ? '' : 'transition-transform duration-150'
                }`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${layout.drawW}px`,
                  height: `${layout.drawH}px`,
                  marginLeft: `${-layout.drawW / 2}px`,
                  marginTop: `${-layout.drawH / 2}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate3d(${layout.dx}px, ${layout.dy}px, 0) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${layout.normalizedRot}deg)`,
                }}
              />
              <div
                aria-hidden="true"
                className={`absolute inset-0 z-20 pointer-events-none ${
                  squareCrop
                    ? 'rounded-full border-2 border-dashed border-white/95'
                    : aspectRatio
                      ? 'border-2 border-dashed border-white/95'
                      : 'border border-dashed border-white/90'
                }`}
                style={{
                  boxShadow:
                    '0 0 0 1px rgba(59, 130, 246, 0.75), 0 0 0 9999px rgba(15, 23, 42, 0.58)',
                }}
              />
            </div>

            <div className="pointer-events-none absolute z-30 bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-medium text-white/95 inline-flex items-center gap-1.5 whitespace-nowrap">
              <Move className="w-3 h-3" />
              <span>
                {canPan
                  ? 'Seret gambar untuk geser posisi'
                  : 'Perbesar zoom terlebih dahulu untuk geser posisi'}
              </span>
            </div>
          </div>

          {/* Slider Perbesar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="vcard-img-zoom"
                className="text-sm font-bold text-zinc-900"
              >
                Perbesar
              </label>
              <div className="flex items-center gap-2.5">
                {hasEdits && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <span className="text-xs font-mono text-zinc-500">
                  {zoom.toFixed(1)}×
                </span>
              </div>
            </div>
            <input
              id="vcard-img-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Tombol Transformasi & Simpan */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Balik Horizontal"
                onClick={() => setFlipH((v) => !v)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  flipH
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <FlipHorizontal2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Balik Vertikal"
                onClick={() => setFlipV((v) => !v)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  flipV
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <FlipVertical2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Putar Kiri 90°"
                onClick={() => setRotateDeg((d) => d - 90)}
                className="w-10 h-10 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Putar Kanan 90°"
                onClick={() => setRotateDeg((d) => d + 90)}
                className="w-10 h-10 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="px-7 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
