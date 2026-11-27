import {
  Contact,
  FileText,
  Image as ImageIcon,
  Link2,
  Share2,
  Store,
  UtensilsCrossed,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QR_TYPES } from '../../types/qrGenerator';
import type { QRType, QRTypeIconName } from '../../types/qrGenerator';
import { showToast } from '../../utils/swal';

const ICON_MAP: Record<QRTypeIconName, LucideIcon> = {
  Link2,
  Contact,
  FileText,
  Image: ImageIcon,
  Share2,
  Video,
  Store,
  UtensilsCrossed,
};

interface QRTypeSelectorProps {
  selected: QRType | null;
  onSelect: (type: QRType) => void;
  onHover?: (type: QRType | null) => void;
}

export default function QRTypeSelector({
  selected,
  onSelect,
  onHover,
}: QRTypeSelectorProps) {
  const handleCardClick = (type: QRType, available: boolean, label: string) => {
    if (!available) {
      void showToast(
        'info',
        `Tipe "${label}" akan hadir pada tahap pengembangan berikutnya. Untuk saat ini gunakan URL Situs Web.`
      );
      return;
    }
    onSelect(type);
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-6">
        Pilih jenis kode QR
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onMouseLeave={() => onHover?.(null)}
      >
        {QR_TYPES.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isSelected = selected === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardClick(item.id, item.available, item.label)}
              onMouseEnter={() => onHover?.(item.id)}
              onFocus={() => onHover?.(item.id)}
              onBlur={() => onHover?.(null)}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                item.available
                  ? isSelected
                    ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/15 shadow-sm cursor-pointer'
                    : 'bg-white border-zinc-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                  : 'bg-zinc-50/70 border-zinc-200/80 opacity-65 hover:opacity-85 cursor-not-allowed'
              }`}
            >
              {item.popular && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  PALING BANYAK DIGUNAKAN
                </span>
              )}

              {!item.available && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-600 text-[10px] font-semibold">
                  Tahap Berikutnya
                </span>
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.available
                    ? isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 pr-2">
                <h3 className="text-base font-bold text-zinc-900 truncate">
                  {item.label}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
