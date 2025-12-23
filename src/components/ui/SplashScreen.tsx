import type { FC } from "react";

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-purple-900 text-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4 animate-pulse">
          <img src="/favicon.png" alt="FreeBuild CV" className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight">FreeBuild CV</h1>
        <p className="text-sm font-medium text-blue-200 mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-blue-400/30">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-ping" />
          Beta Version · ATS Friendly CV Builder
        </p>
        <p className="text-sm text-slate-200/90 mb-6">Siap bantu kamu, mulai dari siswa SMA/SMK sampai fresh graduate, untuk bikin CV profesional yang ramah ATS dalam hitungan menit.</p>
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-sm font-semibold shadow-lg shadow-blue-500/40 transition-all inline-flex items-center justify-center gap-2"
        >
          <span>Mulai Buat CV</span>
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
