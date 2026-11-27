import { Check, ChevronRight } from 'lucide-react';
import type { WizardStep } from '../../types/qrGenerator';

interface QRStepIndicatorProps {
  currentStep: WizardStep;
  maxReachedStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

const STEPS: readonly { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Pilih jenis' },
  { step: 2, label: 'Tambahkan konten' },
  { step: 3, label: 'Kustomisasikan desain QR' },
];

export default function QRStepIndicator({
  currentStep,
  maxReachedStep,
  onStepClick,
}: QRStepIndicatorProps) {
  return (
    <nav aria-label="Tahapan pembuat QR" className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      {STEPS.map((item, idx) => {
        const isCurrent = item.step === currentStep;
        const isCompleted = item.step < currentStep;
        const isClickable = item.step <= maxReachedStep && item.step !== currentStep;

        return (
          <div key={item.step} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(item.step)}
              className={`flex items-center gap-2 text-xs sm:text-sm transition-colors ${
                isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCompleted
                      ? 'bg-zinc-100 border border-zinc-300 text-zinc-600'
                      : 'border border-zinc-300 text-zinc-400 bg-white'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
              </span>
              <span
                className={`whitespace-nowrap ${
                  isCurrent
                    ? 'font-semibold text-zinc-900'
                    : isCompleted
                      ? 'font-medium text-zinc-600'
                      : 'font-normal text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-zinc-300 hidden sm:block" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
