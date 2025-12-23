import { useRef } from 'react';
import type { CVData } from '../../types';
import {
    User,
    Phone,
    Mail,
    Linkedin,
    Link,
    MapPin,
    Camera,
    X,
} from 'lucide-react';

interface PersonalInfoFormProps {
    data: CVData;
    onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function PersonalInfoForm({ data, onUpdate }: PersonalInfoFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran foto maksimal 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate('profilePhoto', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        onUpdate('profilePhoto', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasi Pribadi
            </h2>
            <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Profil (opsional)
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {data.profilePhoto ? (
                                <div className="relative w-20 h-24">
                                    <img
                                        src={data.profilePhoto}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 shadow-md"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <Camera className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                {data.profilePhoto ? 'Ganti Foto' : 'Pilih Foto'}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                                Format: JPG, PNG. Maksimal 2MB
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={data.fullName}
                            onChange={(e) => onUpdate('fullName', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Muhamad Adlildzil Arifah"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor Telepon
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => onUpdate('phone', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="085156693650"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => onUpdate('email', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="adldzl4002@gmail.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            LinkedIn
                        </label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={data.linkedin}
                                onChange={(e) => onUpdate('linkedin', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="https://www.linkedin.com/in/username"
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showLinkedinUnderline}
                                onChange={(e) => onUpdate('showLinkedinUnderline', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">Tampilkan dengan underline biru</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Portfolio
                        </label>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={data.portfolio}
                                onChange={(e) => onUpdate('portfolio', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="https://bit.ly/Portofolio-Adlildzil"
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.showPortfolioUnderline}
                                onChange={(e) => onUpdate('showPortfolioUnderline', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">Tampilkan dengan underline biru</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={data.address}
                            onChange={(e) => onUpdate('address', e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="DKI Jakarta, Jakarta Utara"
                        />
                    </div>
                </div>
            </div >
        </section >
    );
}
