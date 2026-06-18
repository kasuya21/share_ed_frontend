import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { EDUCATION_LEVELS, SORT_OPTIONS } from '../../lib/apiHelpers';

export default function FeedFilters({ filters, onChange, onSearch }) {
  const [showPanel, setShowPanel] = React.useState(false);

  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.level || filters.sort !== 'latest';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder="Search posts by keyword..."
            className="w-full bg-background/80 backdrop-blur-sm border border-input rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPanel((v) => !v)}
          className={`btn-premium gap-2 border border-border bg-card/80 backdrop-blur-sm shrink-0 ${
            hasActiveFilters ? 'text-primary border-primary/40' : 'text-muted-foreground'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
        <button type="button" onClick={onSearch} className="btn-premium btn-primary-custom shrink-0">
          Search
        </button>
      </div>

      {showPanel && (
        <div className="card-premium p-4 grid sm:grid-cols-2 gap-4 bg-card/90 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Education level
            </label>
            <select
              value={filters.level}
              onChange={(e) => update('level', e.target.value)}
              className="w-full bg-background border border-input rounded-xl py-2 px-3 text-sm text-foreground"
            >
              {EDUCATION_LEVELS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Sort by
            </label>
            <select
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value)}
              className="w-full bg-background border border-input rounded-xl py-2 px-3 text-sm text-foreground"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onChange({ search: filters.search, level: '', sort: 'latest' })}
              className="sm:col-span-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <X size={16} /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
