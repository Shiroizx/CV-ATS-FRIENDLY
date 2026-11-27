import { useState } from 'react';
import {
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react';
import { processVCardImageDataUrl } from '../../lib/qrExport';
import { showError } from '../../utils/swal';

interface QRImageEditorModalProps {
  imageUrl: string;
  squareCrop?: boolean;
  onClose: () => void;
  onSave: (processedDataUrl: string) => void;
}

/**
 * Modal edit gambar (Perbesar, Flip Horizontal/Vertikal, Putar Kiri/Kanan)
 * untuk foto profil avatar maupun layar selamat datang vCard.
 */
export default function QRImageEditorModal({
  imageUrl,
  squareCrop = true,
  onClose,
  onSave,
}: QRImageEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await processVCardImageDataUrl(imageUrl, {
        zoom,
        flipH,
        flipV,
        rotateDeg,
        squareCrop,
        maxChars: 18000,
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

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
          {/* Kanvas Pratinjau Crop */}
          <div className="relative w-full aspect-square max-h-[280px] mx-auto bg-zinc-500/80 rounded-xl overflow-hidden flex items-center justify-center">
            <div className="relative w-[220px] h-[220px] bg-white overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={imageUrl}
                alt="Pratinjau edit gambar"
                className="max-w-full max-h-full object-contain transition-transform duration-150 select-none pointer-events-none"
                style={{
                  transform: `scale(${zoom}) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${rotateDeg}deg)`,
                }}
              />
              {squareCrop && (
                <div
                  aria-hidden="true"
                  className="absolute inset-1 rounded-full border-2 border-dashed border-blue-500/75 pointer-events-none"
                />
              )}
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
              <span className="text-xs font-mono text-zinc-500">
                {zoom.toFixed(1)}×
              </span>
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
