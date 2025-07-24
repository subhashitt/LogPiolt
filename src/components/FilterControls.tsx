import { useState } from 'react';
import { Filter, Calendar, Search, Code, AlertCircle } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalLogs: number;
  filteredCount?: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  filters, 
  onFiltersChange, 
  totalLogs,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string | { start: string; end: string }) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      timestampRange: { start: '', end: '' },
      logLevel: '',
      keyword: '',
      component: '',
      responseCode: '',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.timestampRange.start || filters.timestampRange.end) count++;
    if (filters.logLevel) count++;
    if (filters.keyword) count++;
    if (filters.component) count++;
    if (filters.responseCode) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredCount !== undefined && filteredCount !== totalLogs 
                ? `${filteredCount} of ${totalLogs} logs` 
                : `${totalLogs} logs total`}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Log Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Log Level
            </label>
            <select
              value={filters.logLevel}
              onChange={(e) => updateFilter('logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="">All Levels</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                placeholder="Search in messages..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* Response Code Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Code
            </label>
            <select
              value={filters.responseCode}
              onChange={(e) => updateFilter('responseCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="">All Codes</option>
              <option value="2">2xx Success</option>
              <option value="3">3xx Redirection</option>
              <option value="4">4xx Client Error</option>
              <option value="5">5xx Server Error</option>
              <option value="200">200 OK</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Internal Server Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timestamp Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Timestamp Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="datetime-local"
                    value={filters.timestampRange.start}
                    onChange={(e) => updateFilter('timestampRange', {
                      ...filters.timestampRange,
                      start: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                  <span className="text-xs text-gray-500">From</span>
                </div>
                <div>
                  <input
                    type="datetime-local"
                    value={filters.timestampRange.end}
                    onChange={(e) => updateFilter('timestampRange', {
                      ...filters.timestampRange,
                      end: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                  />
                  <span className="text-xs text-gray-500">To</span>
                </div>
              </div>
            </div>

            {/* Component Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="inline-block w-4 h-4 mr-1" />
                Component/Module
              </label>
              <input
                type="text"
                value={filters.component}
                onChange={(e) => updateFilter('component', e.target.value)}
                placeholder="e.g., AuthService, UserController..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>Multiple filters are combined with AND logic</span>
            </div>
            <button
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
