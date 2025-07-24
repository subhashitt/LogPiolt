import { useState } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  Download,
  Eye,
  Brain
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations' | 'critical'>('overview');

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      insights: result.insights,
      recommendations: result.recommendations,
      criticalIssues: result.criticalIssues,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color = 'blue' 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: number; 
    color?: string; 
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      gray: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <div className={`p-4 rounded-lg border w-40 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
        <div className="flex flex-col items-center">
          <div className="mb-3 flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">AI Analysis Results</h3>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'insights', label: 'Insights', icon: <Eye className="w-4 h-4" /> },
          { id: 'recommendations', label: 'Recommendations', icon: <CheckCircle className="w-4 h-4" /> },
          { id: 'critical', label: 'Critical Issues', icon: <AlertTriangle className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'critical' && result.criticalIssues.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {result.criticalIssues.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Log Summary</h4>
              <div className="flex flex-wrap justify-center gap-6">
                <StatCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Total Logs"
                  value={result.summary.totalLogs}
                  color="blue"
                />
                <StatCard
                  icon={<AlertTriangle className="w-5 h-5" />}
                  label="Errors"
                  value={result.summary.errorCount}
                  color="red"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Warnings"
                  value={result.summary.warningCount}
                  color="yellow"
                />
                <StatCard
                  icon={<CheckCircle className="w-5 h-5" />}
                  label="Info"
                  value={result.summary.infoCount}
                  color="green"
                />
                <StatCard
                  icon={<Info className="w-5 h-5" />}
                  label="Debug"
                  value={result.summary.debugCount}
                  color="gray"
                />
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Quick Assessment</h5>
              <div className="space-y-4 text-sm text-black">
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="font-medium">{result.criticalIssues.length} critical issues require immediate attention</span>
                  </p>
                  <p className="text-xs ml-4 text-black/80">
                    {result.criticalIssues.length === 0 
                      ? "No critical issues found. System appears to be operating normally."
                      : "These issues may affect system stability and require immediate resolution."}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">{result.insights.length} insights discovered</span>
                  </p>
                  <p className="text-xs ml-4 text-black/80">
                    {result.insights.length === 0 
                      ? "No significant patterns or trends identified in the current logs."
                      : `Analysis revealed ${result.insights.length} notable patterns or trends that could help improve system performance.`}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium">{result.recommendations.length} recommendations provided</span>
                  </p>
                  <p className="text-xs ml-4 text-black/80">
                    {result.recommendations.length === 0 
                      ? "No specific recommendations at this time. System is performing as expected."
                      : `${result.recommendations.length} actionable suggestions for optimizing system performance and reliability.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Key Insights ({result.insights.length})
            </h4>
            {result.insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No specific insights found in the current log analysis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Recommendations ({result.recommendations.length})
            </h4>
            {result.recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No specific recommendations available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-800 leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Critical Issues Tab */}
        {activeTab === 'critical' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Critical Issues ({result.criticalIssues.length})
            </h4>
            {result.criticalIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
                <p className="text-lg font-medium text-green-700 mb-2">All Clear!</p>
                <p>No critical issues detected in your logs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.criticalIssues.map((issue, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-medium mb-1">Critical Issue #{index + 1}</p>
                      <p className="text-gray-800 leading-relaxed">{issue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
