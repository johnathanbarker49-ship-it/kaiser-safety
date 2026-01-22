import React from 'react';
import { SafetyDocument, Employee, DocumentSubmission, CATEGORY_COLORS, DocumentCategory } from '@/types/safety';
import { 
  DocumentIcon, 
  UsersIcon, 
  CheckIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  ChevronRightIcon,
  getCategoryIcon,
  CalendarIcon,
  TruckIcon,
  PrinterIcon
} from './Icons';

interface DashboardProps {
  documents: SafetyDocument[];
  employees: Employee[];
  submissions: DocumentSubmission[];
  onFillForm: (document: SafetyDocument) => void;
  onViewAllDocuments: () => void;
  onViewTeam: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  documents,
  employees,
  submissions,
  onFillForm,
  onViewAllDocuments,
  onViewTeam,
}) => {
  // Calculate stats
  const totalDocuments = documents.length;
  const completedToday = submissions.filter(s => {
    const today = new Date().toDateString();
    return s.submitted_at && new Date(s.submitted_at).toDateString() === today;
  }).length;
  const pendingDocuments = documents.filter(d => d.is_required).length - submissions.filter(s => s.status === 'submitted').length;
  const expiringDocuments = submissions.filter(s => {
    if (!s.expires_at) return false;
    const expiryDate = new Date(s.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;

  // Get documents by category for quick access
  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, SafetyDocument[]>);

  // Get recent submissions
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);



  const stats = [
    {
      label: 'Total Documents',
      value: totalDocuments,
      icon: DocumentIcon,
      color: 'bg-babyblue-500',
      bgColor: 'bg-babyblue-50',
      textColor: 'text-babyblue-600',
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: CheckIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Pending Required',
      value: Math.max(0, pendingDocuments),
      icon: ClockIcon,
      color: 'bg-gold-500',
      bgColor: 'bg-gold-50',
      textColor: 'text-gold-600',
    },
    {
      label: 'Expiring Soon',
      value: expiringDocuments,
      icon: AlertTriangleIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print-header mb-6">
        <div className="flex items-center justify-between border-b-2 border-babyblue-500 pb-4">
          <div>
            <h1 className="text-xl font-bold text-navy-900">Safety Compliance Dashboard Report</h1>
            <p className="text-sm text-gray-500">Kaiser - Canadian Construction Safety Platform</p>
          </div>

          <div className="text-right text-sm text-gray-600">
            <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
            <p>Time: {new Date().toLocaleTimeString('en-CA')}</p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-babyblue-500 to-babyblue-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden print:bg-babyblue-600 print:rounded-none print:p-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gold-400/20 rounded-full -translate-y-1/2 translate-x-1/2 print:hidden" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-gold-400/20 rounded-full translate-y-1/2 print:hidden" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 print:text-xl">
            Construction Safety Compliance
          </h1>
          <p className="text-babyblue-100 mb-6 max-w-xl print:mb-2 print:text-sm">
            Keep your team safe and compliant with Canadian construction safety regulations. 
            Manage all your safety documents, training records, and permits in one place.
          </p>
          <div className="flex flex-wrap gap-3 print-hide">
            <button
              onClick={onViewAllDocuments}
              className="px-5 py-2.5 bg-white text-babyblue-600 rounded-lg font-medium hover:bg-babyblue-50 transition-colors shadow-md"
            >
              Browse Documents
            </button>
            <button
              onClick={onViewTeam}
              className="px-5 py-2.5 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors shadow-md"
            >
              Manage Team
            </button>
            <button
              onClick={handlePrintReport}
              className="px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <PrinterIcon size={18} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-babyblue-100 p-5 hover:shadow-md transition-shadow print:p-3 print:rounded-none print:border-gray-300 avoid-break"
            >
              <div className="flex items-center justify-between mb-3 print:mb-2">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center print:w-8 print:h-8`}>
                  <Icon size={20} className={stat.textColor} />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy-900 print:text-xl">{stat.value}</p>
              <p className="text-sm text-gray-500 print:text-xs">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
        {/* Team Overview */}
        <div className="bg-white rounded-xl border border-babyblue-100 overflow-hidden print:rounded-none print:border-gray-300">
          <div className="p-5 border-b border-babyblue-100 flex items-center justify-between print:p-3">
            <div>
              <h2 className="font-semibold text-navy-900 print:text-base">Team Members</h2>
              <p className="text-sm text-gray-500 print:text-xs">{employees.length} employees</p>
            </div>
            <button
              onClick={onViewTeam}
              className="text-sm text-babyblue-600 hover:text-babyblue-700 font-medium flex items-center gap-1 print-hide"
            >
              View All
              <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="divide-y divide-babyblue-50">
            {employees.slice(0, 5).map((employee) => (
              <div
                key={employee.id}
                className="p-4 hover:bg-babyblue-50 transition-colors flex items-center gap-3 print:p-2 avoid-break"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-full flex items-center justify-center flex-shrink-0 print:w-8 print:h-8">
                  <span className="text-white font-medium text-sm print:text-xs">
                    {(employee.name || '').split(' ').map(n => n[0] || '').join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-navy-900 truncate print:text-sm">{employee.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500 capitalize print:text-xs">{(employee.role || '').replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-gray-400">{employee.department || ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-babyblue-100 overflow-hidden print:rounded-none print:border-gray-300">
          <div className="p-5 border-b border-babyblue-100 flex items-center justify-between print:p-3">
            <div>
              <h2 className="font-semibold text-navy-900 print:text-base">Recent Activity</h2>
              <p className="text-sm text-gray-500 print:text-xs">Latest document submissions</p>
            </div>
          </div>
          <div className="divide-y divide-babyblue-50">
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 print:p-4">
                No recent submissions
              </div>
            ) : (
              recentSubmissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 hover:bg-babyblue-50 transition-colors flex items-center gap-3 print:p-2 avoid-break"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 print:w-8 print:h-8">
                    <CheckIcon size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-navy-900 truncate print:text-sm">
                      {submission.document_title || 'Document Submission'}
                    </h3>
                    <p className="text-sm text-gray-500 print:text-xs">
                      {new Date(submission.created_at).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {submission.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>




      {/* Document Categories Quick Access */}
      <div className="bg-white rounded-xl border border-babyblue-100 p-5 print:rounded-none print:border-gray-300 print:p-3">
        <div className="flex items-center justify-between mb-5 print:mb-3">
          <div>
            <h2 className="font-semibold text-navy-900 print:text-base">Document Categories</h2>
            <p className="text-sm text-gray-500 print:text-xs">Quick access to safety document categories</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 print:gap-2 print:grid-cols-4">
          {Object.entries(documentsByCategory).map(([category, docs]) => {
            const Icon = getCategoryIcon(category);
            const colorClass = CATEGORY_COLORS[category as DocumentCategory] || 'bg-gray-500';
            return (
              <button
                key={category}
                onClick={onViewAllDocuments}
                className="p-4 border border-babyblue-100 rounded-xl hover:border-gold-300 hover:shadow-md transition-all text-left group print:p-2 print:rounded-none print:border-gray-300 avoid-break"
              >
                <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center mb-3 print:w-8 print:h-8 print:mb-2`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-medium text-navy-900 text-sm group-hover:text-babyblue-600 transition-colors print:text-xs">
                  {category}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{docs.length} documents</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance Badges */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-xl p-6 text-white print:bg-navy-800 print:rounded-none print:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:gap-2">
          <div>
            <h2 className="text-lg font-semibold mb-1 print:text-base">Canadian Safety Compliance</h2>
            <p className="text-navy-200 text-sm print:text-xs">
              All documents comply with OHSA, CSA, and provincial safety regulations
            </p>
          </div>
          <div className="flex flex-wrap gap-3 print:gap-2">
            <div className="px-4 py-2 bg-babyblue-500/20 rounded-lg text-sm font-medium border border-babyblue-400/30 print:px-2 print:py-1 print:text-xs">
              OHSA Compliant
            </div>
            <div className="px-4 py-2 bg-gold-500/20 rounded-lg text-sm font-medium border border-gold-400/30 print:px-2 print:py-1 print:text-xs">
              CSA Standards
            </div>
            <div className="px-4 py-2 bg-babyblue-500/20 rounded-lg text-sm font-medium border border-babyblue-400/30 print:px-2 print:py-1 print:text-xs">
              WSIB Ready
            </div>
          </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block print-footer mt-8 pt-4 border-t border-gray-300">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <p className="text-babyblue-600 font-medium">Kaiser - Canadian Construction Safety Platform</p>
            <p>OHSA Compliant • CSA Standards • WSIB Ready</p>
          </div>
          <div className="text-right">
            <p>Page 1 of 1</p>
            <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
