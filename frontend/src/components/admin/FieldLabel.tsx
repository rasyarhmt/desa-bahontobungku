interface FieldLabelProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
}

const FieldLabel = ({ label, required, htmlFor }: FieldLabelProps) => (
  <label
    className="block text-sm font-semibold text-slate-800 mb-1"
    htmlFor={htmlFor}
  >
    {label}
    {required ? (
      <span className="text-red-700"> *</span>
    ) : (
      <span className="ml-1 text-sm font-normal text-slate-600">
        (opsional)
      </span>
    )}
  </label>
);

export default FieldLabel;