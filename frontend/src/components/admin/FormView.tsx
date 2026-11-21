import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface FormViewProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onBack: () => void;
  backLabel?: string;
  children: ReactNode;
  className?: string;
}

const FormView = ({
  title,
  subtitle,
  icon,
  onBack,
  backLabel = "Kembali",
  children,
  className = "",
}: FormViewProps) => {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center gap-2 px-4 py-2 mb-6 bg-white text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-semibold"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        <span>{backLabel}</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
          {icon && <div className="bg-slate-100 p-2 rounded-xl text-[#0b6393]">{icon}</div>}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormView;
