import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { LogEntry } from '../types';

interface LogUploadSectionProps {
  onLogsUpload: (logs: LogEntry[]) => void;
}

const LogUploadSection: React.FC<LogUploadSectionProps> = ({ onLogsUpload }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // File validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'text/plain',
      'text/log',
      'application/log',
      'text/x-log'
    ];
    
    const allowedExtensions = ['.log', '.txt', '.text', '.out'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (file.size > maxSize) {
      alert(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      const confirmed = confirm(
        'This file type may not be a log file. Do you want to continue anyway?'
      );
      if (!confirmed) return;
    }
    
    setUploadedFileName(file.name);
    
    try {
      const text = await file.text();
      
      if (!text.trim()) {
        alert('The file appears to be empty.');
        return;
      }
      
      if (text.length < 10) {
        const confirmed = confirm(
          'The file content seems very short. Are you sure this is a log file?'
        );
        if (!confirmed) return;
      }
      
      const logs = parseLogText(text);
      
      if (logs.length === 0) {
        alert('No valid log entries were found in the file.');
        return;
      }
      
      onLogsUpload(logs);
      
      // Show success message with parsing stats
      const logLevels = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`Successfully parsed ${logs.length} log entries:`, logLevels);
      
    } catch (error) {
      console.error('Error reading file:', error);
      
      let errorMessage = 'Error reading file. ';
      if (error instanceof Error) {
        if (error.message.includes('encoding')) {
          errorMessage += 'The file encoding may not be supported. Please ensure it\'s a UTF-8 text file.';
        } else {
          errorMessage += 'Please ensure it\'s a valid text file.';
        }
      }
      
      alert(errorMessage);
      setUploadedFileName(null);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      alert('Please enter some log data');
      return;
    }
    
    const lines = textInput.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      alert('No valid log lines found');
      return;
    }
    
    if (lines.length < 3) {
      const confirmed = confirm(
        `Only ${lines.length} log lines found. Are you sure you want to continue?`
      );
      if (!confirmed) return;
    }

    try {
      const logs = parseLogText(textInput);
      
      if (logs.length === 0) {
        alert('No valid log entries were parsed from the input.');
        return;
      }
      
      onLogsUpload(logs);
      setUploadedFileName(`Manual Input (${logs.length} entries)`);
      
      // Show parsing stats
      const logLevels = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`Successfully parsed ${logs.length} log entries:`, logLevels);
      
    } catch (error) {
      console.error('Error parsing log text:', error);
      alert('Error parsing the log data. Please check the format and try again.');
    }
  };

  const parseLogText = (text: string): LogEntry[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const logs: LogEntry[] = [];
    let parsedCount = 0;
    let errorCount = 0;

    lines.forEach((line, index) => {
      try {
        // Enhanced log parsing with multiple timestamp formats
        const timestampPatterns = [
          /(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)/,
          /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/,
          /(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})/,
          /(\d{13})/  // Unix timestamp in milliseconds
        ];

        let timestamp = new Date().toISOString();
        for (const pattern of timestampPatterns) {
          const match = line.match(pattern);
          if (match) {
            timestamp = match[1];
            // Convert Unix timestamp if needed
            if (/^\d{13}$/.test(timestamp)) {
              timestamp = new Date(parseInt(timestamp)).toISOString();
            }
            break;
          }
        }

        // Enhanced log level detection
        const levelMatch = line.match(/\b(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRITICAL)\b/i);
        let level: LogEntry['level'] = 'INFO';
        if (levelMatch) {
          const matchedLevel = levelMatch[1].toUpperCase();
          switch (matchedLevel) {
            case 'WARNING':
              level = 'WARN';
              break;
            case 'FATAL':
            case 'CRITICAL':
              level = 'ERROR';
              break;
            case 'TRACE':
              level = 'DEBUG';
              break;
            default:
              level = matchedLevel as LogEntry['level'];
          }
        }

        // Enhanced URL detection
        const urlMatch = line.match(/https?:\/\/[^\s,;)}\]]+/) || 
                        line.match(/\/[a-zA-Z0-9\/\-_.~!*'();:@&=+$,?#[\]]*/) ||
                        line.match(/\w+:\/\/[^\s,;)}\]]+/);

        // Enhanced response code detection
        const responseCodeMatch = line.match(/\b([1-5]\d{2})\b/) ||
                                 line.match(/status[=:\s]+([1-5]\d{2})/i) ||
                                 line.match(/code[=:\s]+([1-5]\d{2})/i);

        // Enhanced component extraction
        const componentPatterns = [
          /\[([^\]]+)\]/,
          /(\w+Service|\w+Controller|\w+Module|\w+Handler|\w+Provider)/,
          /logger[=:\s]+(\w+)/i,
          /class[=:\s]+(\w+)/i,
          /^(\w+):/
        ];

        let component = undefined;
        for (const pattern of componentPatterns) {
          const match = line.match(pattern);
          if (match) {
            component = match[1];
            break;
          }
        }

        // Extract additional metadata
        const headers: Record<string, string> = {};
        const headerMatches = line.match(/headers?\s*[:=]\s*\{([^}]+)\}/i);
        if (headerMatches) {
          try {
            // Simple header parsing
            const headerString = headerMatches[1];
            const headerPairs = headerString.split(',');
            headerPairs.forEach(pair => {
              const [key, value] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''));
              if (key && value) {
                headers[key] = value;
              }
            });
          } catch (e) {
            // Ignore header parsing errors
          }
        }

        const log: LogEntry = {
          id: `log-${index + 1}`,
          timestamp,
          level,
          message: line.trim(),
          url: urlMatch ? urlMatch[0] : undefined,
          responseCode: responseCodeMatch ? responseCodeMatch[1] : undefined,
          component,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        };

        logs.push(log);
        parsedCount++;
      } catch (error) {
        errorCount++;
        console.warn(`Error parsing line ${index + 1}:`, error);
        
        // Create a fallback log entry for unparseable lines
        const fallbackLog: LogEntry = {
          id: `log-${index + 1}`,
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: line.trim() || `[Unparseable log entry at line ${index + 1}]`,
        };
        logs.push(fallbackLog);
      }
    });

    // Show parsing summary
    if (errorCount > 0) {
      console.log(`Parsed ${parsedCount} logs successfully, ${errorCount} lines had parsing issues`);
    }

    return logs;
  };

  const clearUpload = () => {
    setUploadedFileName(null);
    setTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onLogsUpload([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
      {/* Tab Headers */}
      <div className="flex justify-center border-b bg-gray-50">
        <div className="flex w-full max-w-md">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              activeTab === 'upload'
                ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Upload Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              activeTab === 'paste'
                ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Paste Logs</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-10 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mb-4 sm:mb-6 transition-colors ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Drop your log files here, or click to browse
              </div>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
                Supports .log, .txt, and other text-based log files up to 50MB
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm sm:text-base"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".log,.txt,.text"
                onChange={handleFileInput}
              />
            </div>
          </div>
        )}

        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 text-center">
                Paste your log data
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your log data here...

Example format:
2024-01-15 10:30:45 ERROR [AuthService] Authentication failed for user 192.168.1.100
2024-01-15 10:30:46 WARN [DatabaseService] Connection timeout to db-server:5432
2024-01-15 10:30:47 INFO [UserController] User login successful"
                className="w-full h-48 sm:h-64 lg:h-72 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm text-gray-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="flex-1 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
              >
                Process Logs
              </button>
              <button
                onClick={() => setTextInput('')}
                className="flex-1 sm:flex-none bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {uploadedFileName && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center min-w-0 flex-1">
              <FileText className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-green-800 font-medium truncate">
                {uploadedFileName}
              </span>
            </div>
            <button
              onClick={clearUpload}
              className="text-green-600 hover:text-green-800 p-1 rounded transition-colors flex-shrink-0 ml-2"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogUploadSection;
