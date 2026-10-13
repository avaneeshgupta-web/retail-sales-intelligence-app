import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  RotateCcw,
  ChevronDown,
  Search,
  Check,
  X,
  Calendar,
  MapPin,
  Store,
  Building2,
  Tag,
  Layers,
} from 'lucide-react';
import { FilterState, MergedSalesRecord } from '../types/retail';

interface Props {
  allRecords: MergedSalesRecord[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

interface DropdownItem {
  value: string;
  label: string;
  count: number;
}

export const MultiFilterBar: React.FC<Props> = ({
  allRecords,
  filters,
  onFilterChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute distinct options with item counts
  const getOptions = (key: keyof MergedSalesRecord): DropdownItem[] => {
    const map = new Map<string, number>();
    allRecords.forEach((r) => {
      const val = String(r[key] || '').trim();
      if (val) {
        map.set(val, (map.get(val) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const weekOptions = getOptions('weekStartDate');
  const regionOptions = getOptions('region');
  const storeNameOptions = getOptions('storeName');
  const cityOptions = getOptions('city');
  const formatOptions = getOptions('storeFormat');
  const categoryOptions = getOptions('category');

  const handleToggleOption = (filterKey: keyof FilterState, optionValue: string) => {
    const currentList = filters[filterKey];
    const exists = currentList.includes(optionValue);
    const updated = exists
      ? currentList.filter((v) => v !== optionValue)
      : [...currentList, optionValue];

    onFilterChange({
      ...filters,
      [filterKey]: updated,
    });
  };

  const handleSelectAll = (filterKey: keyof FilterState, allValues: string[]) => {
    onFilterChange({
      ...filters,
      [filterKey]: allValues,
    });
  };

  const handleClearCategory = (filterKey: keyof FilterState) => {
    onFilterChange({
      ...filters,
      [filterKey]: [],
    });
  };

  const activeFiltersCount =
    filters.weekStartDates.length +
    filters.regions.length +
    filters.storeNames.length +
    filters.cities.length +
    filters.storeFormats.length +
    filters.categories.length;

  const renderDropdown = (
    id: string,
    title: string,
    icon: React.ReactNode,
    filterKey: keyof FilterState,
    options: DropdownItem[]
  ) => {
    const selectedValues = filters[filterKey];
    const isOpen = openDropdown === id;
    const isFiltered = selectedValues.length > 0;
    const allValues = options.map((o) => o.value);

    return (
      <div className="relative" key={id}>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className={`h-9 px-3 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            isFiltered
              ? 'bg-sky-500/10 text-sky-300 border-sky-500/40 shadow-sm'
              : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <span className="text-slate-400">{icon}</span>
          <span>{title}</span>
          {isFiltered && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500 text-slate-950">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 ml-auto text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <FilterDropdownMenu
            title={title}
            options={options}
            selectedValues={selectedValues}
            allValues={allValues}
            onToggle={(val) => handleToggleOption(filterKey, val)}
            onSelectAll={() => handleSelectAll(filterKey, allValues)}
            onClear={() => handleClearCategory(filterKey)}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-sm space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Filter Bar</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ({filteredCount} of {totalCount} records)
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-rose-500/10 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* 6 Multi-Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {renderDropdown(
          'week',
          'Week Date',
          <Calendar className="w-3.5 h-3.5" />,
          'weekStartDates',
          weekOptions
        )}
        {renderDropdown(
          'region',
          'Region',
          <MapPin className="w-3.5 h-3.5" />,
          'regions',
          regionOptions
        )}
        {renderDropdown(
          'store',
          'Store Name',
          <Store className="w-3.5 h-3.5" />,
          'storeNames',
          storeNameOptions
        )}
        {renderDropdown(
          'city',
          'City',
          <Building2 className="w-3.5 h-3.5" />,
          'cities',
          cityOptions
        )}
        {renderDropdown(
          'format',
          'Store Format',
          <Layers className="w-3.5 h-3.5" />,
          'storeFormats',
          formatOptions
        )}
        {renderDropdown(
          'category',
          'Category',
          <Tag className="w-3.5 h-3.5" />,
          'categories',
          categoryOptions
        )}
      </div>

      {/* Active filter pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Active Filters:</span>
          {Object.entries(filters).map(([key, list]) =>
            (list as string[]).map((val) => (
              <span
                key={`${key}-${val}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 border border-slate-700 text-sky-300"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => handleToggleOption(key as keyof FilterState, val)}
                  className="hover:text-rose-400 p-0.5"
                  title="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Sub-component for individual search-enabled multi-select dropdown popover
interface DropdownMenuProps {
  title: string;
  options: DropdownItem[];
  selectedValues: string[];
  allValues: string[];
  onToggle: (val: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const FilterDropdownMenu: React.FC<DropdownMenuProps> = ({
  title,
  options,
  selectedValues,
  allValues,
  onToggle,
  onSelectAll,
  onClear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-80">
      {/* Header with Search */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs bg-slate-900 border border-slate-700/60 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px]">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 hover:text-slate-300 font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Options List */}
      <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 max-h-56">
        {filteredOptions.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-500">No matches found</div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-sky-500/15 text-sky-200 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate" title={opt.label}>
                    {opt.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {opt.count}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
