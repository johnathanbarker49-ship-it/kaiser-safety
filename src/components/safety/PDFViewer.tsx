import React, { useRef } from 'react';
import { SafetyDocument, DocumentSubmission, Employee, FormField } from '@/types/safety';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  DownloadIcon, 
  CheckIcon,
  getCategoryIcon
} from './Icons';
import { CATEGORY_COLORS, DocumentCategory } from '@/types/safety';

interface PDFViewerProps {
  document: SafetyDocument;
  submission?: DocumentSubmission;
  employee?: Employee;
  onBack: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  document,
  submission,
  employee,
  onBack
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const Icon = getCategoryIcon(document.category);
  const colorClass = CATEGORY_COLORS[document.category as DocumentCategory] || 'bg-gray-500';

  // Parse form_fields if it's a string
  const formFields: FormField[] = typeof document.form_fields === 'string' 
    ? JSON.parse(document.form_fields) 
    : document.form_fields || [];

  const handlePrint = () => {
    window.print();
  };

  const getFieldValue = (fieldName: string) => {
    if (!submission?.form_data) return null;
    return submission.form_data[fieldName];
  };

  const renderFieldValue = (field: FormField) => {
    const value = getFieldValue(field.name);
    
    if (field.type === 'checklist') {
      const checkedItems = value || [];
      return (
        <div className="space-y-1">
          {field.items?.map((item, idx) => {
            const isChecked = checkedItems.includes(item);
            return (
              <div key={idx} className="flex items-start gap-2 checklist-item">
                <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {isChecked && <CheckIcon size={12} className="text-white" />}
                </div>
                <span className={`text-sm ${isChecked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    if (!value) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    return <span className="text-gray-900">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-babyblue-50">
      {/* Toolbar - Hidden on print */}
      <div className="bg-white border-b border-babyblue-200 sticky top-0 z-10 print-hide">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-babyblue-50 rounded-lg transition-colors"
              >
                <ArrowLeftIcon size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="font-semibold text-navy-900">{document.title}</h1>
                <p className="text-sm text-gray-500">Print-Ready Document</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors shadow-md print-button"
              >
                <PrinterIcon size={18} />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="py-8 print:py-0 print:bg-white">
        <div 
          ref={printRef}
          className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none pdf-content"
        >
          {/* PDF Header */}
          <div className="p-8 border-b-4 border-babyblue-500 print:p-6 print:border-b-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center`}>
                  <Icon size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy-900 print:text-xl">{document.title}</h1>
                  <p className="text-gray-500 mt-1">{document.category} • Version {document.version}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 border-2 border-babyblue-300 rounded-lg flex items-center justify-center bg-gradient-to-br from-babyblue-50 to-gold-50 company-logo">
                  <span className="text-xs text-babyblue-500 text-center font-medium">Company<br/>Logo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="p-6 bg-babyblue-50 border-b border-babyblue-200 print:bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="avoid-break">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Document ID</p>
                <p className="text-sm font-mono text-navy-900 mt-1">{document.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="avoid-break">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date</p>
                <p className="text-sm text-navy-900 mt-1">
                  {submission?.submitted_at 
                    ? new Date(submission.submitted_at).toLocaleDateString('en-CA')
                    : new Date().toLocaleDateString('en-CA')
                  }
                </p>
              </div>
              <div className="avoid-break">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Employee</p>
                <p className="text-sm text-navy-900 mt-1">{employee?.name || '___________________'}</p>
              </div>
              <div className="avoid-break">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
                <p className={`text-sm mt-1 font-medium ${
                  submission?.status === 'approved' ? 'text-green-600' :
                  submission?.status === 'submitted' ? 'text-babyblue-600' :
                  submission?.status === 'expired' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {submission?.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'Blank Form'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-babyblue-100 avoid-break">
            <h2 className="text-lg font-semibold text-navy-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{document.description}</p>
          </div>

          {/* Form Fields */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Form Fields</h2>
            <div className="space-y-4">
              {formFields.map((field, index) => (
                <div key={index} className="border-b border-babyblue-100 pb-4 last:border-0 avoid-break">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-sm font-medium text-navy-700">
                      {index + 1}. {field.label}
                    </span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*Required</span>
                    )}
                  </div>
                  
                  {submission ? (
                    <div className="pl-4">
                      {renderFieldValue(field)}
                    </div>
                  ) : (
                    <div className="pl-4">
                      {field.type === 'checklist' ? (
                        <div className="space-y-2">
                          {field.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 checklist-item">
                              <div className="w-4 h-4 border border-gray-400 rounded" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === 'select' ? (
                        <div className="space-y-1">
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-gray-400 rounded-full" />
                              <span className="text-sm text-gray-700">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === 'textarea' ? (
                        <div className="border border-gray-300 rounded h-20 bg-gray-50" />
                      ) : (
                        <div className="border-b border-gray-400 h-8" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div className="p-6 bg-babyblue-50 border-t border-babyblue-200 print:bg-gray-50 avoid-break">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Certification & Signature</h2>
            <p className="text-sm text-gray-600 mb-6">
              I certify that I have read and understood the contents of this document. 
              I agree to comply with all safety requirements and procedures outlined herein.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Employee Signature</p>
                {submission?.signature ? (
                  <div className="border border-babyblue-200 rounded-lg p-2 bg-white h-20">
                    <img 
                      src={submission.signature} 
                      alt="Signature" 
                      className="h-full w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="border-b-2 border-navy-400 h-16 signature-line" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Date Signed</p>
                <p className="text-navy-900">
                  {submission?.submitted_at 
                    ? new Date(submission.submitted_at).toLocaleDateString('en-CA')
                    : '___________________'
                  }
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Supervisor Signature</p>
                <div className="border-b-2 border-navy-400 h-16 signature-line" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Date</p>
                <div className="border-b border-navy-400 h-8" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-babyblue-200 print-footer">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div>
                <p className="text-babyblue-600 font-medium">Kaiser - Canadian Construction Safety Platform</p>

                <p className="mt-1">OHSA Compliant • CSA Standards • WSIB Ready</p>
              </div>
              <div className="text-right">
                <p>Page 1 of 1</p>
                <p className="mt-1">Generated: {new Date().toLocaleDateString('en-CA')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
