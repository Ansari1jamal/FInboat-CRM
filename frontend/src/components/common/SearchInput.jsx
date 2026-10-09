import {
  Search,
  X,
} from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  const clear = () => {
    onChange({
      target: {
        value: "",
      },
    });
  };

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
      />

      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;