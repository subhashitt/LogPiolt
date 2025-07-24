import { useState } from 'react';
import { analyzeLogsWithOpenAI } from './openai';
import LogUploadSection from './components/LogUploadSection';
import FilterControls from './components/FilterControls';
import LogPreview from './components/LogPreview';
import AnalysisResults from './components/AnalysisResults';
import { LogEntry, FilterOptions, AnalysisResult } from './types';

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [maskedLogs, setMaskedLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    timestampRange: { start: '', end: '' },
    logLevel: '',
    keyword: '',
    component: '',
    responseCode: '',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMasking, setIsMasking] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | undefined>(undefined);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [openAIApiKey, setOpenAIApiKey] = useState('OpenAI-Key');
  const [aiRawResult, setAiRawResult] = useState<string | null>(null);

  // Move maskHeaders above its first usage
  const maskHeaders = (headers: Record<string, string>): Record<string, string> => {
    const maskedHeaders = { ...headers };
    Object.keys(maskedHeaders).forEach(key => {
      if (key.toLowerCase().includes('authorization') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('key')) {
        maskedHeaders[key] = '***MASKED***';
      }
    });
    return maskedHeaders;
  };

  const handleLogsUpload = (uploadedLogs: LogEntry[]) => {
    setLogs(uploadedLogs);
    setMaskedLogs([]);
    setAnalysisResult(null);
  };

  const handleMaskLogs = async () => {
    setIsMasking(true);
    try {
      // Simulate masking API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple client-side masking simulation
      const masked = logs.map(log => ({
        ...log,
        message: maskSensitiveData(log.message),
        url: maskUrl(log.url || ''),
        headers: maskHeaders(log.headers || {}),
      }));
      
      setMaskedLogs(masked);
    } catch (error) {
      console.error('Error masking logs:', error);
    } finally {
      setIsMasking(false);
    }
  };

  const handleAnalyzeLogs = async () => {
    console.log('handleAnalyzeLogs called', { 
      maskedLogsLength: maskedLogs.length,
      useOpenAI,
      hasApiKey: !!openAIApiKey
    });
    
    if (maskedLogs.length === 0) {
      alert('Please mask logs first before analysis');
      return;
    }
    setIsAnalyzing(true);
    setAiRawResult(null);
    try {
      if (useOpenAI && openAIApiKey) {
        console.log('Preparing logs for OpenAI analysis...');
        // Send masked logs to OpenAI for analysis
        const logLines = maskedLogs.map(l => `[${l.timestamp}] [${l.level}]${l.component ? ' [' + l.component + ']' : ''} ${l.message}`);
        const aiResult = await analyzeLogsWithOpenAI(logLines, openAIApiKey);
        setAiRawResult(aiResult);
        // Try to parse AI result into insights, recommendations, critical issues
        // (Assume AI returns markdown or plain text, so we just show it in the UI)
        setAnalysisResult({
          summary: {
            totalLogs: maskedLogs.length,
            errorCount: maskedLogs.filter(l => l.level === 'ERROR').length,
            warningCount: maskedLogs.filter(l => l.level === 'WARN').length,
            infoCount: maskedLogs.filter(l => l.level === 'INFO').length,
            debugCount: maskedLogs.filter(l => l.level === 'DEBUG').length,
          },
          insights: [aiResult],
          recommendations: [],
          criticalIssues: [],
        });
        return;
      }
      // ...existing code for local analysis...
      // ...existing code...
    } catch (error) {
      console.error('Error analyzing logs:', error);
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error analyzing logs: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const maskSensitiveData = (message: string): string => {
    return message
      // Authentication and authorization
      .replace(/password[=:]\s*[^\s&,;)}\]'"]+/gi, 'password=***MASKED***')
      .replace(/token[=:]\s*[^\s&,;)}\]'"]+/gi, 'token=***MASKED***')
      .replace(/api[_-]?key[=:]\s*[^\s&,;)}\]'"]+/gi, 'api_key=***MASKED***')
      .replace(/Bearer\s+[^\s&,;)}\]'"]+/gi, 'Bearer ***MASKED***')
      .replace(/Basic\s+[^\s&,;)}\]'"]+/gi, 'Basic ***MASKED***')
      .replace(/jwt[=:]\s*[^\s&,;)}\]'"]+/gi, 'jwt=***MASKED***')
      .replace(/session[=:]\s*[^\s&,;)}\]'"]+/gi, 'session=***MASKED***')
      
      // Enhanced URL masking - handle full URLs in log messages
      .replace(/https?:\/\/[^\s,;)}\]'"]+/gi, (match) => {
        return maskUrl(match);
      })
      
      // Mask relative URLs with query parameters
      .replace(/\/[^\s?]*\?[^\s,;)}\]'"]+/g, (match) => {
        return maskUrl(match);
      })
      
      // Network and IP addresses
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '***IP_MASKED***')
      // IPv6 - Conservative patterns that avoid timestamp false positives
      .replace(/\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g, '***IPv6_MASKED***')
      .replace(/\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g, '***IPv6_MASKED***')
      .replace(/\b::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}\b/g, '***IPv6_MASKED***')
      .replace(/\b[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}\b/g, '***IPv6_MASKED***')
      
      // Email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***EMAIL_MASKED***')
      
      // Phone numbers
      .replace(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, '***PHONE_MASKED***')
      
      // Credit card numbers (basic pattern)
      .replace(/\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, '***CARD_MASKED***')
      
      // Social Security Numbers
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***SSN_MASKED***')
      
      // Database connection strings
      .replace(/server[=:][^\s;,)}\]]+/gi, 'server=***MASKED***')
      .replace(/database[=:][^\s;,)}\]]+/gi, 'database=***MASKED***')
      .replace(/user[=:][^\s;,)}\]]+/gi, 'user=***MASKED***')
      .replace(/uid[=:][^\s;,)}\]]+/gi, 'uid=***MASKED***')
      .replace(/pwd[=:][^\s;,)}\]]+/gi, 'pwd=***MASKED***')
      
      // File paths that might contain sensitive info
      .replace(/[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g, '***PATH_MASKED***')
      .replace(/\/(?:home|Users)\/[^\s,;)}\]]+/g, '***PATH_MASKED***')
      
      // UUIDs
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, '***UUID_MASKED***')
      
      // Potential secrets or hashes
      .replace(/\b[A-Za-z0-9+/]{32,}={0,2}\b/g, (match) => {
        // Only mask if it looks like a hash or encoded value
        if (match.length >= 32 && /[A-Z]/.test(match) && /[a-z]/.test(match) && /[0-9]/.test(match)) {
          return '***HASH_MASKED***';
        }
        return match;
      });
  };

  const maskUrl = (url: string): string => {
    if (!url) return url;
    
    try {
      const urlObj = new URL(url);
      // Mask username and password if present
      if (urlObj.username || urlObj.password) {
        urlObj.username = '***';
        urlObj.password = '***';
      }
      
      // Mask sensitive query parameters
      const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
      urlObj.searchParams.forEach((_, key) => {
        if (sensitiveParams.some(param => key.toLowerCase().includes(param))) {
          urlObj.searchParams.set(key, '***MASKED***');
        }
      });
      
      return urlObj.toString();
    } catch {
      // If URL parsing fails, do basic masking of query parameters
      return url.replace(/([?&](token|key|password|secret|auth)[^=]*=)[^&]*/gi, '$1***MASKED***');
    }
  }

  const exportMaskedLogs = () => {
    if (maskedLogs.length === 0) {
      alert('No masked logs to export');
      return;
    }

    try {
      const logText = maskedLogs.map(log => {
        let line = `${log.timestamp} ${log.level} [${log.component || 'Unknown'}] ${log.message}`;
        if (log.url) line += ` URL: ${log.url}`;
        if (log.responseCode) line += ` Status: ${log.responseCode}`;
        return line;
      }).join('\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masked-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Error exporting logs. Please try again.');
    }
  };

  const exportAnalysisReport = () => {
    if (!analysisResult) {
      alert('No analysis results to export');
      return;
    }

    try {
      const report = `
LOG ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
=====================================

SUMMARY
-------
Total Logs: ${analysisResult.summary.totalLogs}
Error Count: ${analysisResult.summary.errorCount}
Warning Count: ${analysisResult.summary.warningCount}
Info Count: ${analysisResult.summary.infoCount}
Debug Count: ${analysisResult.summary.debugCount}

INSIGHTS
--------
${analysisResult.insights.map((insight: string, i: number) => `${i + 1}. ${insight}`).join('\n')}

RECOMMENDATIONS
---------------
${analysisResult.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

CRITICAL ISSUES
---------------
${analysisResult.criticalIssues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}
`;

      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `log-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <span role="img" aria-label="lock">🔒</span> Secure Log Analysis Tool
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Upload or input logs, mask sensitive data locally, and get AI-powered analysis
            with complete privacy protection.
          </p>
        </div>

        {/* Main Layout */}
        <div className="max-w-4xl mx-auto">
          {/* Upload Section - Always centered */}
          <div className="mb-6 md:mb-8">
            <LogUploadSection onLogsUpload={handleLogsUpload} />
          </div>

          {/* Two Column Layout for Filters and Results */}
          {logs.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
              {/* Left Column - Filters and Actions */}
              <div className="space-y-4 md:space-y-6">
                <FilterControls
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalLogs={logs.length}
                  filteredCount={filteredCount}
                />

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <button
                      onClick={handleMaskLogs}
                      disabled={isMasking}
                      className="w-full sm:w-auto flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isMasking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Masking...
                        </>
                      ) : (
                        <>🔒 Mask Logs</>
                      )}
                    </button>

                    <button
                      onClick={handleAnalyzeLogs}
                      disabled={isAnalyzing || maskedLogs.length === 0}
                      className="w-full sm:w-auto flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>🤔 Submit to AI</>
                      )}
                    </button>
                  </div>

                  {/* Export Options */}
                  {(maskedLogs.length > 0 || analysisResult) && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 pt-4 border-t border-gray-200">
                      {maskedLogs.length > 0 && (
                        <button
                          onClick={exportMaskedLogs}
                          className="w-full sm:w-auto flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          📥 Export Masked Logs
                        </button>
                      )}
                      
                      {analysisResult && (
                        <button
                          onClick={exportAnalysisReport}
                          className="w-full sm:w-auto flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        >
                          📊 Export Report
                        </button>
                      )}
                    </div>
                  )}

                  {/* OpenAI Toggle */}
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useOpenAI"
                        checked={useOpenAI}
                        onChange={(e) => setUseOpenAI(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="useOpenAI" className="ml-2 block text-sm text-gray-900">
                        Use OpenAI for Analysis
                      </label>
                    </div>
                  </div>

                  {maskedLogs.length === 0 && logs.length > 0 && (
                    <p className="text-sm text-gray-600 text-center">
                      Mask logs first to protect sensitive data before AI analysis
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Preview and Results */}
              <div className="space-y-4 md:space-y-6">
                {(logs.length > 0 || maskedLogs.length > 0) && (
                  <LogPreview
                    logs={maskedLogs.length > 0 ? maskedLogs : logs}
                    filters={filters}
                    isMasked={maskedLogs.length > 0}
                    onFilteredCountChange={setFilteredCount}
                  />
                )}

                {analysisResult && (
                  <AnalysisResults result={analysisResult} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
