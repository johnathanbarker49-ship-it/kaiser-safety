import React from 'react';
import { SafetyDocument, CATEGORY_COLORS, DocumentCategory } from '@/types/safety';
import { getCategoryIcon, ClockIcon, ChevronRightIcon, CheckIcon } from './Icons';

interface DocumentCardProps {
  document: SafetyDocument;
  onFillForm: (document: SafetyDocument) => void;
  onViewDetails: (document: SafetyDocument) => void;
  completionStatus?: 'completed' | 'pending' | 'expired' | null;
  lastSubmission?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onFillForm,
  onViewDetails,
  completionStatus,
  lastSubmission,
}) => {
  const Icon = getCategoryIcon(document.category);
  const colorClass = CATEGORY_COLORS[document.category as DocumentCategory] || 'bg-gray-500';

  const getStatusBadge = () => {
    if (!completionStatus) return null;
    
    switch (completionStatus) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckIcon size={12} />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
            <ClockIcon size={12} />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getRenewalText = () => {
    if (!document.renewal_period_days) return null;
    
    if (document.renewal_period_days === 1) {
      return 'Daily';
    } else if (document.renewal_period_days === 7) {
      return 'Weekly';
    } else if (document.renewal_period_days === 30) {
      return 'Monthly';
    } else if (document.renewal_period_days === 90) {
      return 'Quarterly';
    } else if (document.renewal_period_days === 365) {
      return 'Annually';
    } else if (document.renewal_period_days === 1095) {
      return 'Every 3 years';
    }
    return `Every ${document.renewal_period_days} days`;
  };

  return (
    <div className="bg-white rounded-xl border border-babyblue-100 hover:border-gold-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center shadow-sm`}>
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            {document.is_required && (
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                Required
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-navy-900 mb-2 line-clamp-2 group-hover:text-babyblue-600 transition-colors">
          {document.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {document.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="inline-flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${colorClass}`} />
            {document.category}
          </span>
          {getRenewalText() && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={12} />
              {getRenewalText()}
            </span>
          )}
          <span>v{document.version}</span>
        </div>

        {lastSubmission && (
          <p className="text-xs text-gray-400 mb-4">
            Last submitted: {new Date(lastSubmission).toLocaleDateString('en-CA')}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFillForm(document)}
            className="flex-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Fill Out Form
          </button>
          <button
            onClick={() => onViewDetails(document)}
            className="p-2.5 border border-babyblue-200 hover:border-babyblue-300 hover:bg-babyblue-50 rounded-lg transition-colors"
          >
            <ChevronRightIcon size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
