export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  component?: string;
  url?: string;
  responseCode?: string;
  headers?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface FilterOptions {
  timestampRange: {
    start: string;
    end: string;
  };
  logLevel: string;
  keyword: string;
  component: string;
  responseCode: string;
}

export interface AnalysisResult {
  summary: {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
  };
  insights: string[];
  recommendations: string[];
  criticalIssues: string[];
}

export interface MaskingRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
