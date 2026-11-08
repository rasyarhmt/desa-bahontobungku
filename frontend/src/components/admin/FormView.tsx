import type { ReactNode } from "react";
import { FaArrowLeft } from "react-icons/fa";

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
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
      >
        <FaArrowLeft size={14} />
        <span>{backLabel}</span>
      </button>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          {icon && <div className="bg-indigo-100 p-2 rounded-lg">{icon}</div>}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FormView;
