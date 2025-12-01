interface SelectionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectionCard({ label, selected, onClick }: SelectionCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative flex items-center p-4 cursor-pointer transition-all duration-200
        border-2 rounded-xl w-full
        ${selected 
          ? 'border-primary bg-white ring-1 ring-primary shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {/* Cirkeln till vänster */}
      <div className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors
        ${selected ? 'border-primary' : 'border-gray-300'}
      `}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>

      <span className={`font-medium text-lg ${selected ? 'text-primary' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}