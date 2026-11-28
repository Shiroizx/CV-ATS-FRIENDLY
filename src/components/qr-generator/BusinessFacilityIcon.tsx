import {
  Accessibility,
  Armchair,
  Baby,
  BedDouble,
  Car,
  Coffee,
  ImagePlus,
  ParkingSquare,
  PawPrint,
  TrainFront,
  UtensilsCrossed,
  Wifi,
  Wine,
} from 'lucide-react';
import type { BusinessFacilityId } from '../../types/qrGenerator';

/**
 * Merender ikon ringkas untuk setiap fasilitas Halaman Bisnis secara konsisten antara form dan pratinjau ponsel.
 */
export function BusinessFacilityIcon({
  id,
  className = 'w-4 h-4',
}: {
  id: BusinessFacilityId;
  className?: string;
}) {
  switch (id) {
    case 'wifi':
      return <Wifi className={className} />;
    case 'train':
      return <TrainFront className={className} />;
    case 'seating':
      return <Armchair className={className} />;
    case 'taxi':
      return <Car className={className} />;
    case 'accessible':
      return <Accessibility className={className} />;
    case 'accommodation':
      return <BedDouble className={className} />;
    case 'toilet':
      return (
        <span className="text-[10px] font-extrabold leading-none tracking-tight">
          WC
        </span>
      );
    case 'cafe':
      return <Coffee className={className} />;
    case 'kid_friendly':
      return <Baby className={className} />;
    case 'bar':
      return <Wine className={className} />;
    case 'pet_friendly':
      return <PawPrint className={className} />;
    case 'restaurant':
      return <UtensilsCrossed className={className} />;
    case 'parking':
      return <ParkingSquare className={className} />;
    default:
      return <ImagePlus className={className} />;
  }
}
