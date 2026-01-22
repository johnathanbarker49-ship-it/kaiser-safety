import React from 'react';
import { SafetyDocument, CATEGORY_COLORS, DocumentCategory, FormField } from '@/types/safety';
import { 
  ArrowLeftIcon, 
  getCategoryIcon, 
  ClockIcon, 
  CheckIcon,
  DocumentIcon,
  ShareIcon,
  DownloadIcon,
  FileTextIcon,
  PrinterIcon
} from './Icons';

interface DocumentDetailsProps {
  document: SafetyDocument;
  onBack: () => void;
  onFillForm: (document: SafetyDocument) => void;
  onViewPDF?: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  document,
  onBack,
  onFillForm,
  onViewPDF,
}) => {

  const Icon = getCategoryIcon(document.category);
  const colorClass = CATEGORY_COLORS[document.category as DocumentCategory] || 'bg-gray-500';

  // Parse form_fields if it's a string
  const formFields: FormField[] = typeof document.form_fields === 'string' 
    ? JSON.parse(document.form_fields) 
    : document.form_fields || [];

  const getRenewalText = () => {
    if (!document.renewal_period_days) return 'One-time completion';
    
    if (document.renewal_period_days === 1) return 'Daily renewal required';
    if (document.renewal_period_days === 7) return 'Weekly renewal required';
    if (document.renewal_period_days === 30) return 'Monthly renewal required';
    if (document.renewal_period_days === 90) return 'Quarterly renewal required';
    if (document.renewal_period_days === 365) return 'Annual renewal required';
    if (document.renewal_period_days === 1095) return 'Renewal every 3 years';
    return `Renewal every ${document.renewal_period_days} days`;
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Text Input';
      case 'textarea': return 'Long Text';
      case 'select': return 'Dropdown Selection';
      case 'date': return 'Date Picker';
      case 'datetime': return 'Date & Time';
      case 'number': return 'Number Input';
      case 'checklist': return 'Checklist';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-babyblue-50 rounded-lg transition-colors"
        >
          <ArrowLeftIcon size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-900">{document.title}</h1>
          <p className="text-gray-500">{document.category} • Version {document.version}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Overview */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 ${colorClass} rounded-xl flex items-center justify-center`}>
                <Icon size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-navy-900 mb-2">{document.title}</h2>
                <p className="text-gray-600">{document.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-babyblue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="font-medium text-navy-900">{document.category}</p>
              </div>
              <div className="p-4 bg-babyblue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Version</p>
                <p className="font-medium text-navy-900">{document.version}</p>
              </div>
              <div className="p-4 bg-babyblue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-medium text-navy-900">
                  {document.is_required ? (
                    <span className="text-red-600">Required</span>
                  ) : (
                    <span className="text-gray-600">Optional</span>
                  )}
                </p>
              </div>
              <div className="p-4 bg-babyblue-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Renewal</p>
                <p className="font-medium text-navy-900 text-sm">{getRenewalText()}</p>
              </div>
            </div>
          </div>

          {/* Form Fields Preview */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Form Fields</h3>
            <p className="text-sm text-gray-500 mb-6">
              This document contains {formFields.length} field{formFields.length !== 1 ? 's' : ''} to complete.
            </p>
            <div className="space-y-4">
              {formFields.map((field, index) => (
                <div
                  key={field.name}
                  className="p-4 border border-babyblue-100 rounded-lg hover:border-babyblue-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-babyblue-100 rounded-full flex items-center justify-center text-xs font-medium text-babyblue-600">
                        {index + 1}
                      </span>
                      <h4 className="font-medium text-navy-900">{field.label}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-babyblue-50 text-babyblue-600 text-xs rounded">
                        {getFieldTypeLabel(field.type)}
                      </span>
                      {field.required && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded font-medium">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {field.type === 'select' && field.options && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Options:</p>
                      <div className="flex flex-wrap gap-2">
                        {field.options.map((option) => (
                          <span
                            key={option}
                            className="px-2 py-1 bg-babyblue-50 text-gray-600 text-xs rounded"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {field.type === 'checklist' && field.items && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Checklist Items:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {field.items.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-4 h-4 border border-babyblue-300 rounded" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onFillForm(document)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium rounded-lg transition-colors shadow-md"
              >
                <DocumentIcon size={18} />
                Fill Out Form
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-babyblue-200 hover:border-babyblue-300 hover:bg-babyblue-50 text-navy-700 font-medium rounded-lg transition-colors">
                <ShareIcon size={18} />
                Share Document
              </button>
              {onViewPDF && (
                <button 
                  onClick={onViewPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-babyblue-200 hover:border-babyblue-300 hover:bg-babyblue-50 text-navy-700 font-medium rounded-lg transition-colors"
                >
                  <PrinterIcon size={18} />
                  View as PDF / Print
                </button>
              )}
            </div>

          </div>

          {/* Compliance Info */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-3">Compliance Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckIcon size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-navy-100">OHSA Compliant</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-navy-100">CSA Standards</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-navy-100">Provincial Regulations</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gold-50 rounded-xl p-6 border border-gold-100">
            <h3 className="font-semibold text-gold-900 mb-3">Tips for Completion</h3>
            <ul className="space-y-2 text-sm text-gold-800">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                <span>Fill out all required fields marked with *</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                <span>Provide accurate and complete information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                <span>Sign the document with your digital signature</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                <span>Submit before the renewal deadline</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
