interface Props {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
