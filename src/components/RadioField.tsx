interface RadioFieldProps {
  id: string;
  name: string;
  value: string | number;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RadioField({ id, name, value, label, checked, onChange }: RadioFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="cursor-pointer block">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only" // Döljer den inbyggda radioknappen visuellt
        />
        <div 
          className={`
            p-4 rounded-xl transition-all duration-200 border 
            ${checked 
              ? 'bg-gray-50 border-gray-900 ring-2 ring-gray-900 text-gray-900 font-medium' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {label}
        </div>
      </label>
    </div>
  );
}