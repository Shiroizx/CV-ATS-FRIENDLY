import type { ReactNode } from 'react';
import {
  Clock,
  Contact,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Play,
  Share2,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { motion } from 'motion/react';
import { QR_TYPES } from '../../types/qrGenerator';
import type { QRType } from '../../types/qrGenerator';

interface QRTypeHoverPreviewProps {
  type: QRType;
}

function PreviewStatusBar({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className="px-4 pb-2.5 flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-zinc-700 truncate">
        Pratinjau: {label}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
          available
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
        }`}
      >
        {available ? 'Tersedia' : 'Tahap Berikutnya'}
      </span>
    </div>
  );
}

function UrlPreviewMockup() {
  return (
    <>
      <div className="px-4 pb-3">
        <div className="bg-zinc-100 rounded-full px-3 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-600">
          <Globe className="w-3 h-3 text-zinc-500 flex-shrink-0" />
          <span>www.mywebsite.com</span>
        </div>
      </div>

      <div className="flex-1 bg-indigo-100/70 p-3 flex flex-col gap-3">
        <div className="bg-white rounded-2xl p-3.5 shadow-2xs space-y-3">
          <div className="h-32 rounded-xl bg-zinc-200/80 flex items-center justify-center text-zinc-400">
            <ImageIcon className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded-full bg-zinc-200" />
            <div className="h-2 w-full rounded-full bg-zinc-100" />
            <div className="h-2 w-2/3 rounded-full bg-zinc-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
            <div className="h-2 w-1/2 rounded-full bg-zinc-100" />
          </div>
        </div>

        <div className="mt-auto w-full py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
          Buka Situs Web
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </>
  );
}

function VCardPreviewMockup() {
  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pt-5 pb-6 text-center text-white">
        <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center mx-auto mb-2">
          <Contact className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-bold">Budi Santoso</p>
        <p className="text-[11px] text-blue-100">Product Designer • Jakarta</p>
      </div>

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-2 -mt-6">
          {[
            { icon: Phone, label: 'Telepon' },
            { icon: Mail, label: 'Email' },
            { icon: Globe, label: 'Web' },
          ].map(({ icon: ItemIcon, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-2 shadow-xs border border-zinc-100 flex flex-col items-center gap-1"
            >
              <ItemIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-semibold text-zinc-700">{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-3 border border-zinc-100 space-y-2.5 mt-1">
          <div className="flex items-center gap-2.5">
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            <div className="h-2.5 w-32 rounded-full bg-zinc-200" />
          </div>
          <div className="flex items-center gap-2.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <div className="h-2.5 w-36 rounded-full bg-zinc-100" />
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <div className="h-2.5 w-28 rounded-full bg-zinc-100" />
          </div>
        </div>

        <div className="mt-auto w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold text-center">
          Simpan Kontak
        </div>
      </div>
    </div>
  );
}

function PdfPreviewMockup() {
  return (
    <div className="flex-1 bg-rose-50/60 flex flex-col">
      <div className="bg-rose-600 px-4 py-4 text-white flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate">Company Profile 2026.pdf</p>
          <p className="text-[10px] text-rose-100">Dokumen PDF • 12 Halaman</p>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-3">
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-2xs flex-1 space-y-3">
          <div className="h-3 w-2/3 rounded-full bg-zinc-800/80" />
          <div className="h-24 rounded-xl bg-rose-100/70 flex items-center justify-center text-rose-400">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-zinc-200" />
            <div className="h-2 w-11/12 rounded-full bg-zinc-100" />
            <div className="h-2 w-4/5 rounded-full bg-zinc-100" />
            <div className="h-2 w-3/4 rounded-full bg-zinc-100" />
          </div>
        </div>

        <div className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold text-center">
          Lihat &amp; Unduh PDF
        </div>
      </div>
    </div>
  );
}

function ImageGalleryMockup() {
  return (
    <div className="flex-1 bg-emerald-50/50 p-3.5 flex flex-col gap-3">
      <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-2xs">
        <p className="text-xs font-bold text-zinc-900">Galeri Foto Produk</p>
        <p className="text-[10px] text-zinc-500">Koleksi katalog visual Anda</p>
      </div>

      <div className="h-28 rounded-2xl bg-emerald-100/80 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
        <ImageIcon className="w-9 h-9" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-1">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center text-zinc-300 min-h-[72px]"
          >
            <ImageIcon className="w-5 h-5" />
          </div>
        ))}
      </div>

      <div className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold text-center">
        Buka Galeri Penuh
      </div>
    </div>
  );
}

function SocialMockup() {
  const socials = [
    { name: 'Instagram', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { name: 'TikTok', color: 'bg-zinc-900' },
    { name: 'YouTube', color: 'bg-red-600' },
    { name: 'WhatsApp', color: 'bg-emerald-600' },
  ];

  return (
    <div className="flex-1 bg-violet-50/70 flex flex-col">
      <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 pt-5 pb-5 text-center text-white">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
          <Share2 className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold">@brandanda</p>
        <p className="text-[10px] text-violet-100">Ikuti seluruh kanal resmi kami</p>
      </div>

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-center">
        {socials.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-xl p-2.5 border border-violet-100 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg ${item.color} flex-shrink-0`} />
              <span className="text-xs font-semibold text-zinc-800">{item.name}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoMockup() {
  return (
    <div className="flex-1 bg-zinc-50 p-3.5 flex flex-col gap-3">
      <div className="rounded-2xl bg-zinc-900 h-36 relative flex items-center justify-center overflow-hidden shadow-sm">
        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
          <Play className="w-5 h-5 ml-0.5" />
        </div>
        <div className="absolute inset-x-3 bottom-2.5 h-1 rounded-full bg-white/25 overflow-hidden">
          <div className="w-1/2 h-full bg-blue-500 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3 border border-zinc-200/80 space-y-1.5">
        <p className="text-xs font-bold text-zinc-900">Video Pengenalan Produk</p>
        <div className="h-2 w-full rounded-full bg-zinc-100" />
        <div className="h-2 w-3/4 rounded-full bg-zinc-100" />
      </div>

      <div className="space-y-2 flex-1">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-white rounded-xl p-2.5 border border-zinc-200/70 flex items-center gap-2.5"
          >
            <div className="w-12 h-9 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-500 flex-shrink-0">
              <Play className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-4/5 rounded-full bg-zinc-200" />
              <div className="h-2 w-1/2 rounded-full bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessMockup() {
  return (
    <div className="flex-1 bg-sky-50/50 flex flex-col">
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-4 pt-5 pb-5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Kopi Nusantara</p>
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 text-[10px] font-semibold">
              Buka Sekarang
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col">
        <div className="bg-white rounded-2xl p-3 border border-sky-100 space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] text-zinc-700">
            <Clock className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>Senin – Minggu • 08:00 – 22:00</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-700">
            <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>Jl. Jend. Sudirman No. 12</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-700">
            <Phone className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
            <span>+62 812-3456-7890</span>
          </div>
        </div>

        <div className="h-24 rounded-2xl bg-sky-100/70 border border-sky-200/70 flex items-center justify-center text-sky-600 text-[11px] font-semibold gap-1.5">
          <MapPin className="w-4 h-4" />
          Peta Lokasi Bisnis
        </div>

        <div className="mt-auto w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-semibold text-center">
          Hubungi &amp; Petunjuk Arah
        </div>
      </div>
    </div>
  );
}

function MenuMockup() {
  const dishes = [
    { name: 'Nasi Goreng Spesial', price: 'Rp 28.000' },
    { name: 'Ayam Bakar Madu', price: 'Rp 32.000' },
    { name: 'Es Kopi Susu Gula Aren', price: 'Rp 18.000' },
  ];

  return (
    <div className="flex-1 bg-amber-50/50 flex flex-col">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 pt-4 pb-4 text-white flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold">Resto Nusantara</p>
          <p className="text-[10px] text-amber-100">Menu Digital Meja</p>
        </div>
      </div>

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
            Favorit
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white text-zinc-600 border border-amber-200 text-[10px] font-semibold">
            Minuman
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white text-zinc-600 border border-amber-200 text-[10px] font-semibold">
            Camilan
          </span>
        </div>

        <div className="space-y-2 flex-1">
          {dishes.map((dish) => (
            <div
              key={dish.name}
              className="bg-white rounded-xl p-2.5 border border-amber-100 shadow-2xs flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-zinc-900 truncate">{dish.name}</p>
                <p className="text-[10px] font-semibold text-amber-700">{dish.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PREVIEW_BODY: Record<QRType, () => ReactNode> = {
  url: UrlPreviewMockup,
  vcard: VCardPreviewMockup,
  pdf: PdfPreviewMockup,
  image: ImageGalleryMockup,
  social: SocialMockup,
  video: VideoMockup,
  business: BusinessMockup,
  menu: MenuMockup,
};

export default function QRTypeHoverPreview({ type }: QRTypeHoverPreviewProps) {
  const config = QR_TYPES.find((item) => item.id === type) ?? QR_TYPES[0];
  const RenderBody = PREVIEW_BODY[type];

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0.4, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      className="flex-1 flex flex-col"
    >
      <PreviewStatusBar label={config.label} available={config.available} />
      <RenderBody />
    </motion.div>
  );
}
