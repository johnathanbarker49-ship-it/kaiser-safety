import React, { useState, useRef, useEffect } from 'react';
import { SafetyDocument, FormField, Employee } from '@/types/safety';
import { ArrowLeftIcon, CheckIcon, XIcon, getCategoryIcon, TrashIcon, PrinterIcon } from './Icons';
import { CATEGORY_COLORS, DocumentCategory } from '@/types/safety';

interface DocumentFormProps {
  document: SafetyDocument;
  employee: Employee | null;
  onSubmit: (formData: Record<string, any>, signature: string) => void;
  onCancel: () => void;
  initialData?: Record<string, any>;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  employee,
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectSite, setProjectSite] = useState('');

  const Icon = getCategoryIcon(document.category);
  const colorClass = CATEGORY_COLORS[document.category as DocumentCategory] || 'bg-gray-500';

  // Parse form_fields if it's a string
  const formFields: FormField[] = typeof document.form_fields === 'string' 
    ? JSON.parse(document.form_fields) 
    : document.form_fields || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1E3A5F';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChecklistChange = (name: string, item: string, checked: boolean) => {
    const currentItems = formData[name] || [];
    if (checked) {
      handleInputChange(name, [...currentItems, item]);
    } else {
      handleInputChange(name, currentItems.filter((i: string) => i !== item));
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx?.beginPath();
      ctx?.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx?.lineTo(x, y);
      ctx?.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignature('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    formFields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        if (field.type === 'checklist') {
          if (!value || value.length === 0) {
            newErrors[field.name] = 'Please select at least one item';
          }
        } else if (!value || value === '') {
          newErrors[field.name] = 'This field is required';
        }
      }
    });

    if (!signature) {
      newErrors['signature'] = 'Signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, project_site: projectSite }, signature);
    }
  };

  const handlePrintBlank = () => {
    window.print();
  };

  const renderField = (field: FormField) => {
    const hasError = errors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all resize-none ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-babyblue-200'
            }`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'checklist':
        return (
          <div className="space-y-2">
            {field.items?.map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 p-3 border border-babyblue-200 rounded-lg hover:bg-babyblue-50 cursor-pointer transition-colors checklist-item"
              >
                <input
                  type="checkbox"
                  checked={(formData[field.name] || []).includes(item)}
                  onChange={(e) => handleChecklistChange(field.name, item, e.target.checked)}
                  className="w-5 h-5 text-babyblue-500 border-babyblue-300 rounded focus:ring-babyblue-500"
                />
                <span className="text-sm text-navy-700">{item}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 to-gold-50/30 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b border-babyblue-200 sticky top-0 z-10 print-hide">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-babyblue-50 rounded-lg transition-colors"
            >
              <ArrowLeftIcon size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-navy-900">{document.title}</h1>
                <p className="text-sm text-gray-500">{document.category} • v{document.version}</p>
              </div>
            </div>
            <button
              onClick={handlePrintBlank}
              className="flex items-center gap-2 px-4 py-2 border border-babyblue-200 text-navy-700 rounded-lg hover:bg-babyblue-50 transition-colors"
            >
              <PrinterIcon size={18} />
              Print Blank Form
            </button>
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block print-header p-6 border-b-2 border-babyblue-500">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center`}>
              <Icon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">{document.title}</h1>
              <p className="text-sm text-gray-500">{document.category} • Version {document.version}</p>
            </div>
          </div>
          <div className="w-16 h-16 border-2 border-babyblue-300 rounded-lg flex items-center justify-center company-logo">
            <span className="text-xs text-babyblue-500 text-center font-medium">Logo</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:px-6 print:py-4 print:max-w-none">
        <form onSubmit={handleSubmit} className="space-y-6 print:space-y-4">
          {/* Document Info Card */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6 print:p-4 print:border-gray-300 avoid-break">
            <h2 className="font-semibold text-navy-900 mb-4 print:mb-3 print:text-base">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2 print:mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employee?.name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-babyblue-50 border border-babyblue-200 rounded-lg text-gray-600 print:py-2 print:bg-white print:border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2 print:mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('en-CA')}
                  disabled
                  className="w-full px-4 py-3 bg-babyblue-50 border border-babyblue-200 rounded-lg text-gray-600 print:py-2 print:bg-white print:border-gray-300"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 mb-2 print:mb-1">
                  Project Site
                </label>
                <input
                  type="text"
                  value={projectSite}
                  onChange={(e) => setProjectSite(e.target.value)}
                  className="w-full px-4 py-3 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all print:py-2 print:border-gray-300"
                  placeholder="Enter project site name or location"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6 print:p-4 print:border-gray-300">
            <h2 className="font-semibold text-navy-900 mb-6 print:mb-4 print:text-base">Form Fields</h2>
            <div className="space-y-6 print:space-y-4">
              {formFields.map((field) => (
                <div key={field.name} className="avoid-break">
                  <label className="block text-sm font-medium text-navy-700 mb-2 print:mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-500 print-hide">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-xl border border-babyblue-100 p-6 print:p-4 print:border-gray-300 avoid-break">
            <div className="flex items-center justify-between mb-4 print:mb-3">
              <h2 className="font-semibold text-navy-900 print:text-base">
                Digital Signature <span className="text-red-500">*</span>
              </h2>
              {signature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 print-hide"
                >
                  <TrashIcon size={16} />
                  Clear
                </button>
              )}
            </div>
            <div className="border-2 border-dashed border-babyblue-200 rounded-lg p-2 print:border-solid print:border-gray-300">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full bg-white cursor-crosshair rounded touch-none print:h-24"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 print-hide">
              Sign above using your mouse or touch screen
            </p>
            {errors['signature'] && (
              <p className="mt-1 text-sm text-red-500 print-hide">{errors['signature']}</p>
            )}
          </div>

          {/* Supervisor Signature - Print only */}
          <div className="hidden print:block bg-white border border-gray-300 p-4 avoid-break">
            <h2 className="font-semibold text-navy-900 mb-3 text-base">Supervisor Approval</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Supervisor Signature:</p>
                <div className="border-b-2 border-navy-400 h-12 signature-line"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-navy-700 mb-2">Date:</p>
                <div className="border-b border-navy-400 h-8"></div>
              </div>
            </div>
          </div>

          {/* Submit Buttons - Hidden on print */}
          <div className="flex items-center justify-end gap-4 print-hide">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-babyblue-200 text-navy-700 rounded-lg hover:bg-babyblue-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-md"
            >
              <CheckIcon size={18} />
              Submit Form
            </button>
          </div>
        </form>

        {/* Print Footer */}
        <div className="hidden print:block print-footer mt-8 pt-4 border-t border-gray-300">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <p className="text-babyblue-600 font-medium">Kaiser - Canadian Construction Safety Platform</p>

              <p>OHSA Compliant • CSA Standards • WSIB Ready</p>
            </div>
            <div className="text-right">
              <p>Document ID: {document.id.slice(0, 8).toUpperCase()}</p>
              <p>Generated: {new Date().toLocaleDateString('en-CA')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
