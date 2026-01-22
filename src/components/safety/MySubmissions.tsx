import React, { useState, useMemo } from 'react';
import { DocumentSubmission, SafetyDocument, ToolboxTalkSubmission, CATEGORY_COLORS, DocumentCategory } from '@/types/safety';
import { getEquipmentList } from './equipmentChecklistData';
import { 
  SearchIcon, 
  CheckIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  ChevronDownIcon,
  getCategoryIcon,
  EditIcon,
  CalendarIcon,
  EyeIcon,
  PrinterIcon,
  TruckIcon,
  WrenchIcon,
  UsersIcon,
  DownloadIcon
} from './Icons';

interface MySubmissionsProps {
  submissions: DocumentSubmission[];
  documents: SafetyDocument[];
  toolboxTalkSubmissions?: ToolboxTalkSubmission[];
  onEditSubmission: (submission: DocumentSubmission) => void;
  onViewSubmission: (submission: DocumentSubmission) => void;
  onViewToolboxTalk?: (submission: ToolboxTalkSubmission) => void;
  onSavePDF?: (submission: DocumentSubmission) => void;
  onSaveToolboxTalkPDF?: (submission: ToolboxTalkSubmission) => void;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({
  submissions,
  documents,
  toolboxTalkSubmissions = [],
  onEditSubmission,
  onViewSubmission,
  onViewToolboxTalk,
  onSavePDF,
  onSaveToolboxTalkPDF,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'category'>('date');
  const [activeTab, setActiveTab] = useState<'documents' | 'toolbox'>('documents');

  // Create virtual documents for equipment checklists
  const equipmentList = getEquipmentList();
  const virtualEquipmentDocs: SafetyDocument[] = equipmentList.map(eq => ({
    id: `equipment-checklist-${eq.id}`,
    title: `${eq.name} Pre-Use Inspection`,
    description: eq.description,
    category: 'Equipment',
    form_fields: [],
    is_required: true,
    renewal_period_days: 1,
    version: '1.0',
    created_at: new Date().toISOString(),
  }));

  // Combine real documents with virtual equipment documents
  const allDocuments = [...documents, ...virtualEquipmentDocs];

  const categories = useMemo(() => {
    const cats = new Set(allDocuments.map(d => d.category).filter(Boolean));
    return Array.from(cats).sort((a, b) => (a || '').localeCompare(b || ''));
  }, [allDocuments]);

  const getDocumentForSubmission = (submission: DocumentSubmission): SafetyDocument | undefined => {
    return allDocuments.find(d => d.id === submission.document_id);
  };

  const isEquipmentChecklist = (submission: DocumentSubmission): boolean => {
    return submission.document_id.startsWith('equipment-checklist-');
  };

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const doc = getDocumentForSubmission(s);
        return (doc?.title || '').toLowerCase().includes(query) ||
          (doc?.category || '').toLowerCase().includes(query) ||
          (s.project_site || '').toLowerCase().includes(query) ||
          (s.notes || '').toLowerCase().includes(query);
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterCategory) {
      filtered = filtered.filter(s => {
        const doc = getDocumentForSubmission(s);
        return doc?.category === filterCategory;
      });
    }

    // Sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'status':
        const statusOrder = { submitted: 0, draft: 1, expired: 2 };
        filtered.sort((a, b) => (statusOrder[a.status as keyof typeof statusOrder] || 3) - (statusOrder[b.status as keyof typeof statusOrder] || 3));
        break;
      case 'category':
        filtered.sort((a, b) => {
          const docA = getDocumentForSubmission(a);
          const docB = getDocumentForSubmission(b);
          return (docA?.category || '').localeCompare(docB?.category || '');
        });
        break;
    }

    return filtered;
  }, [submissions, searchQuery, filterStatus, filterCategory, sortBy, allDocuments]);

  const filteredToolboxTalks = useMemo(() => {
    let filtered = [...toolboxTalkSubmissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.toolbox_talk_data.title.toLowerCase().includes(query) ||
        t.toolbox_talk_data.category.toLowerCase().includes(query) ||
        (t.project_site || '').toLowerCase().includes(query) ||
        (t.presenter_name || '').toLowerCase().includes(query)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [toolboxTalkSubmissions, searchQuery, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckIcon size={12} />
            Submitted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-babyblue-100 text-babyblue-700 text-xs font-medium rounded-full">
            <CheckIcon size={12} />
            Completed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
            <ClockIcon size={12} />
            Draft
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
            <ClockIcon size={12} />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-babyblue-100 text-babyblue-700 text-xs font-medium rounded-full">
            <UsersIcon size={12} />
            In Progress
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <AlertTriangleIcon size={12} />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted').length;
    const drafts = submissions.filter(s => s.status === 'draft').length;
    const expiring = submissions.filter(s => {
      if (!s.expires_at) return false;
      const expiryDate = new Date(s.expires_at);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;

    return { total, submitted, drafts, expiring };
  }, [submissions]);

  const toolboxStats = useMemo(() => {
    const total = toolboxTalkSubmissions.length;
    const submitted = toolboxTalkSubmissions.filter(t => t.status === 'submitted').length;
    const pending = toolboxTalkSubmissions.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const completed = toolboxTalkSubmissions.filter(t => t.status === 'completed').length;

    return { total, submitted, pending, completed };
  }, [toolboxTalkSubmissions]);

  const handlePrintList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print-hide">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Submissions</h1>
          <p className="text-gray-500">
            View and manage your submitted safety documents, pre-use checklists, and toolbox talks
          </p>
        </div>
        <button
          onClick={handlePrintList}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors shadow-md"
        >
          <PrinterIcon size={18} />
          Print List
        </button>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print-header mb-4">
        <div className="flex items-center justify-between border-b-2 border-babyblue-500 pb-4">
          <div>
            <h1 className="text-xl font-bold text-navy-900">My Submissions Report</h1>
            <p className="text-sm text-gray-500">Kaiser - Construction Safety Platform</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
            <p>Total Records: {filteredSubmissions.length + filteredToolboxTalks.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 print-hide">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-babyblue-500 text-white'
              : 'bg-white border border-babyblue-200 text-navy-700 hover:bg-babyblue-50'
          }`}
        >
          Documents & Checklists
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'documents' ? 'bg-white/20' : 'bg-babyblue-100'
          }`}>
            {submissions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('toolbox')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'toolbox'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-green-200 text-navy-700 hover:bg-green-50'
          }`}
        >
          Toolbox Talks
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeTab === 'toolbox' ? 'bg-white/20' : 'bg-green-100'
          }`}>
            {toolboxTalkSubmissions.length}
          </span>
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'documents' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-hide">
          <div className="bg-white rounded-xl border border-babyblue-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-babyblue-50 rounded-lg flex items-center justify-center">
                <CalendarIcon size={20} className="text-babyblue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-babyblue-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckIcon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.submitted}</p>
                <p className="text-sm text-gray-500">Submitted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-babyblue-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center">
                <ClockIcon size={20} className="text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.drafts}</p>
                <p className="text-sm text-gray-500">Drafts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-babyblue-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangleIcon size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{stats.expiring}</p>
                <p className="text-sm text-gray-500">Expiring</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-hide">
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <WrenchIcon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{toolboxStats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckIcon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{toolboxStats.submitted}</p>
                <p className="text-sm text-gray-500">Submitted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center">
                <ClockIcon size={20} className="text-gold-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{toolboxStats.pending}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-babyblue-50 rounded-lg flex items-center justify-center">
                <UsersIcon size={20} className="text-babyblue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{toolboxStats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Hidden on print */}
      <div className="bg-white rounded-xl border border-babyblue-100 p-4 print-hide">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'documents' ? "Search submissions..." : "Search toolbox talks..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="appearance-none px-4 py-2.5 pr-10 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 bg-white"
            >
              <option value="">All Status</option>
              {activeTab === 'documents' ? (
                <>
                  <option value="submitted">Submitted</option>
                  <option value="draft">Draft</option>
                  <option value="expired">Expired</option>
                </>
              ) : (
                <>
                  <option value="submitted">Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </>
              )}
            </select>
            <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Filter - Only for documents */}
          {activeTab === 'documents' && (
            <div className="relative">
              <select
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
                className="appearance-none px-4 py-2.5 pr-10 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Sort - Only for documents */}
          {activeTab === 'documents' && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none px-4 py-2.5 pr-10 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="category">Sort by Category</option>
              </select>
              <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Documents Tab Content */}
      {activeTab === 'documents' && (
        <>
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-babyblue-100 p-12 text-center print-hide">
              <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={24} className="text-babyblue-500" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {submissions.length === 0 
                  ? "You haven't submitted any documents yet"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-babyblue-100 overflow-hidden print:border-0 print:rounded-none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-babyblue-50 border-b border-babyblue-100">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Document</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Category</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Project Site</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Submitted</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Expires</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-navy-700 print-hide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-babyblue-50">
                    {filteredSubmissions.map((submission) => {
                      const doc = getDocumentForSubmission(submission);
                      const isEquipment = isEquipmentChecklist(submission);
                      
                      const displayTitle = doc?.title || submission.notes?.split(' - ')[0] || 'Pre-Use Inspection';
                      const displayCategory = doc?.category || 'Equipment';
                      const displayVersion = doc?.version || '1.0';
                      
                      const Icon = isEquipment ? TruckIcon : getCategoryIcon(displayCategory);
                      const colorClass = CATEGORY_COLORS[displayCategory as DocumentCategory] || 'bg-gray-500';
                      
                      return (
                        <tr key={submission.id} className="hover:bg-babyblue-50 transition-colors avoid-break">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0 print:w-6 print:h-6`}>
                                <Icon size={16} className="text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-navy-900 truncate text-sm">{displayTitle}</p>
                                <p className="text-xs text-gray-500">
                                  {isEquipment ? 'Pre-Use Checklist' : `v${displayVersion}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">{displayCategory}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {submission.project_site || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(submission.status)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {submission.submitted_at 
                                ? new Date(submission.submitted_at).toLocaleDateString('en-CA')
                                : '-'
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${
                              submission.expires_at && new Date(submission.expires_at) < new Date()
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {submission.expires_at 
                                ? new Date(submission.expires_at).toLocaleDateString('en-CA')
                                : '-'
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 print-hide">
                            <div className="flex items-center justify-end gap-2">
                              {!isEquipment && (
                                <>
                                  <button
                                    onClick={() => onViewSubmission(submission)}
                                    className="p-2 hover:bg-babyblue-100 rounded-lg transition-colors"
                                    title="View"
                                  >
                                    <EyeIcon size={16} className="text-babyblue-600" />
                                  </button>
                                  {onSavePDF && (
                                    <button
                                      onClick={() => onSavePDF(submission)}
                                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Save as PDF"
                                    >
                                      <DownloadIcon size={16} className="text-green-600" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onViewSubmission(submission)}
                                    className="p-2 hover:bg-babyblue-100 rounded-lg transition-colors"
                                    title="Print"
                                  >
                                    <PrinterIcon size={16} className="text-gray-600" />
                                  </button>
                                </>
                              )}
                              {isEquipment && (
                                <>
                                  <span className="text-xs text-gray-400 px-2">
                                    {submission.notes?.includes('APPROVED') ? (
                                      <span className="text-green-600 font-medium">Approved</span>
                                    ) : (
                                      <span className="text-red-600 font-medium">Not Approved</span>
                                    )}
                                  </span>
                                  {onSavePDF && (
                                    <button
                                      onClick={() => onSavePDF(submission)}
                                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Save as PDF"
                                    >
                                      <DownloadIcon size={16} className="text-green-600" />
                                    </button>
                                  )}
                                </>
                              )}
                              {submission.status === 'draft' && !isEquipment && (
                                <button
                                  onClick={() => onEditSubmission(submission)}
                                  className="p-2 hover:bg-gold-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <EditIcon size={16} className="text-gold-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toolbox Talks Tab Content */}
      {activeTab === 'toolbox' && (
        <>
          {filteredToolboxTalks.length === 0 ? (
            <div className="bg-white rounded-xl border border-green-100 p-12 text-center print-hide">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WrenchIcon size={24} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No toolbox talks found</h3>
              <p className="text-gray-500">
                {toolboxTalkSubmissions.length === 0 
                  ? "No toolbox talks have been sent to you yet"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-green-100 overflow-hidden print:border-0 print:rounded-none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50 border-b border-green-100">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Toolbox Talk</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Category</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Presenter</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Signatures</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-navy-700">Date</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-navy-700 print-hide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {filteredToolboxTalks.map((talk) => (
                      <tr key={talk.id} className="hover:bg-green-50 transition-colors avoid-break">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <WrenchIcon size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-navy-900 truncate text-sm">{talk.toolbox_talk_data.title}</p>
                              <p className="text-xs text-gray-500">{talk.toolbox_talk_data.duration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{talk.toolbox_talk_data.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{talk.presenter_name || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(talk.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {talk.signatures.slice(0, 3).map((sig, idx) => (
                                <div 
                                  key={idx}
                                  className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                                  title={sig.employee_name}
                                >
                                  <span className="text-white text-xs font-medium">
                                    {sig.employee_name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {talk.signatures.length}/{talk.assigned_employees.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {new Date(talk.created_at).toLocaleDateString('en-CA')}
                          </span>
                        </td>
                        <td className="px-4 py-3 print-hide">
                          <div className="flex items-center justify-end gap-2">
                            {onViewToolboxTalk && (
                              <button
                                onClick={() => onViewToolboxTalk(talk)}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-1"
                              >
                                <EyeIcon size={14} />
                                {talk.status === 'pending' || talk.status === 'in_progress' ? 'Sign' : 'View'}
                              </button>
                            )}
                            {onSaveToolboxTalkPDF && (
                              <button
                                onClick={() => onSaveToolboxTalkPDF(talk)}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                title="Save as PDF"
                              >
                                <DownloadIcon size={16} className="text-green-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

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

export default MySubmissions;
