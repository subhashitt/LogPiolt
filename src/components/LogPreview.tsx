import { useMemo, useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, AlertTriangle, Info, Bug, Zap } from 'lucide-react';
import { LogEntry, FilterOptions } from '../types';

interface LogPreviewProps {
  logs: LogEntry[];
  filters: FilterOptions;
  isMasked: boolean;
  onFilteredCountChange?: (count: number) => void;
}

const LogPreview: React.FC<LogPreviewProps> = ({ logs, filters, isMasked, onFilteredCountChange }) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Timestamp filter
      if (filters.timestampRange.start || filters.timestampRange.end) {
        const logTime = new Date(log.timestamp);
        if (filters.timestampRange.start && logTime < new Date(filters.timestampRange.start)) {
          return false;
        }
        if (filters.timestampRange.end && logTime > new Date(filters.timestampRange.end)) {
          return false;
        }
      }

      // Log level filter
      if (filters.logLevel && log.level !== filters.logLevel) {
        return false;
      }

      // Keyword filter
      if (filters.keyword && !log.message.toLowerCase().includes(filters.keyword.toLowerCase())) {
        return false;
      }

      // Component filter
      if (filters.component && (!log.component || !log.component.toLowerCase().includes(filters.component.toLowerCase()))) {
        return false;
      }

      // Response code filter
      if (filters.responseCode) {
        if (filters.responseCode.length === 1) {
          // Filter by status code category (2xx, 3xx, etc.)
          if (!log.responseCode || !log.responseCode.startsWith(filters.responseCode)) {
            return false;
          }
        } else {
          // Filter by exact status code
          if (log.responseCode !== filters.responseCode) {
            return false;
          }
        }
      }

      return true;
    });
  }, [logs, filters]);

  // Notify parent of filtered count change
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredLogs.length);
    }
  }, [filteredLogs.length, onFilteredCountChange]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelStyles = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'WARN':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'INFO':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'DEBUG':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const toggleDetails = (logId: string) => {
    setShowDetails(showDetails === logId ? null : logId);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setShowDetails(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMasked ? (
              <EyeOff className="h-5 w-5 text-green-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {isMasked ? 'Masked ' : ''}Log Preview
            </h3>
            {isMasked && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Sensitive data masked
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Showing {paginatedLogs.length} of {filteredLogs.length} logs
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="max-h-96 overflow-y-auto">
        {paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">Try adjusting your filters or upload different log data.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelStyles(log.level)}`}>
                        {log.level}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.component && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {log.component}
                        </span>
                      )}
                      {log.responseCode && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.responseCode.startsWith('2') ? 'bg-green-100 text-green-800' :
                          log.responseCode.startsWith('4') || log.responseCode.startsWith('5') ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.responseCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-mono leading-relaxed break-words">
                      {log.message}
                    </p>
                    {(log.url || log.headers) && (
                      <button
                        onClick={() => toggleDetails(log.id)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        {showDetails === log.id ? 'Hide details' : 'Show details'}
                      </button>
                    )}
                    {showDetails === log.id && (
                      <div className="mt-3 p-3 bg-gray-100 rounded-md">
                        {log.url && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-gray-700">URL:</span>
                            <p className="text-xs text-gray-600 font-mono mt-1 break-all">{log.url}</p>
                          </div>
                        )}
                        {log.headers && Object.keys(log.headers).length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-700">Headers:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(log.headers).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="text-gray-600 font-mono">{key}:</span>
                                  <span className="text-gray-800 font-mono ml-2">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-black">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50 text-black'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogPreview;
