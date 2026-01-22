import React, { useState, useRef } from 'react';
import { PrinterIcon, CheckIcon, XIcon, AlertTriangleIcon, ArrowLeftIcon, BuildingIcon, CalendarIcon, UserIcon, SendIcon } from './Icons';
import { EquipmentType, ChecklistSection as ChecklistSectionType, ChecklistItem as ChecklistItemType } from './equipmentChecklistData';

interface ChecklistItemState {
  id: string;
  status: 'pass' | 'fail' | 'na' | null;
  notes: string;
}

interface ChecklistSectionState {
  id: string;
  items: ChecklistItemState[];
}

interface EquipmentChecklistSubmission {
  equipmentType: string;
  equipmentName: string;
  projectInfo: {
    projectName: string;
    projectAddress: string;
    date: string;
    time: string;
    inspectorName: string;
    inspectorCertification: string;
    supervisorName: string;
    weatherConditions: string;
    temperature: string;
    windSpeed: string;
    equipmentId: string;
    manufacturer: string;
    modelNumber: string;
    serialNumber: string;
    hoursReading: string;
  };
  sections: ChecklistSectionState[];
  additionalNotes: string;
  deficienciesFound: boolean;
  correctionRequired: string;
  approvedForUse: boolean | null;
}

interface EquipmentChecklistProps {
  equipment: EquipmentType;
  onBack: () => void;
  onSubmit?: (data: EquipmentChecklistSubmission) => void;
}

const EquipmentChecklist: React.FC<EquipmentChecklistProps> = ({ equipment, onBack, onSubmit }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    projectAddress: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    inspectorName: '',
    inspectorCertification: '',
    supervisorName: '',
    weatherConditions: '',
    temperature: '',
    windSpeed: '',
    equipmentId: '',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    hoursReading: '',
  });

  // Initialize sections state from equipment data
  const initializeSections = (): ChecklistSectionState[] => {
    return equipment.sections.map(section => ({
      id: section.id,
      items: section.items.map(item => ({
        id: item.id,
        status: null,
        notes: '',
      })),
    }));
  };

  const [sections, setSections] = useState<ChecklistSectionState[]>(initializeSections);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [deficienciesFound, setDeficienciesFound] = useState(false);
  const [correctionRequired, setCorrectionRequired] = useState('');
  const [approvedForUse, setApprovedForUse] = useState<boolean | null>(null);

  const handleStatusChange = (sectionId: string, itemId: string, status: 'pass' | 'fail' | 'na') => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, status: item.status === status ? null : status };
            }
            return item;
          }),
        };
      }
      return section;
    }));
  };

  const handleNotesChange = (sectionId: string, itemId: string, notes: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, notes };
            }
            return item;
          }),
        };
      }
      return section;
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getCompletionStats = () => {
    let total = 0;
    let completed = 0;
    let passed = 0;
    let failed = 0;

    sections.forEach(section => {
      section.items.forEach(item => {
        total++;
        if (item.status !== null) {
          completed++;
          if (item.status === 'pass') passed++;
          if (item.status === 'fail') failed++;
        }
      });
    });

    return { total, completed, passed, failed, percentage: Math.round((completed / total) * 100) };
  };

  const stats = getCompletionStats();

  const resetChecklist = () => {
    setSections(initializeSections());
    setProjectInfo({
      projectName: '',
      projectAddress: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      inspectorName: '',
      inspectorCertification: '',
      supervisorName: '',
      weatherConditions: '',
      temperature: '',
      windSpeed: '',
      equipmentId: '',
      manufacturer: '',
      modelNumber: '',
      serialNumber: '',
      hoursReading: '',
    });
    setAdditionalNotes('');
    setDeficienciesFound(false);
    setCorrectionRequired('');
    setApprovedForUse(null);
    setSubmitSuccess(false);
  };

  const getItemStatus = (sectionId: string, itemId: string): ChecklistItemState | undefined => {
    const section = sections.find(s => s.id === sectionId);
    return section?.items.find(i => i.id === itemId);
  };

  const validateForm = (): string | null => {
    if (!projectInfo.projectName.trim()) {
      return 'Project Name is required';
    }
    if (!projectInfo.projectAddress.trim()) {
      return 'Project Address is required';
    }
    if (!projectInfo.inspectorName.trim()) {
      return 'Inspector Name is required';
    }
    if (approvedForUse === null) {
      return 'Please select Approved or Not Approved for use';
    }
    if (stats.completed < stats.total) {
      return `Please complete all checklist items (${stats.completed}/${stats.total} completed)`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    const submissionData: EquipmentChecklistSubmission = {
      equipmentType: equipment.id,
      equipmentName: equipment.name,
      projectInfo,
      sections,
      additionalNotes,
      deficienciesFound,
      correctionRequired,
      approvedForUse,
    };

    try {
      if (onSubmit) {
        await onSubmit(submissionData);
      }
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting checklist:', error);
      alert('Error submitting checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header - Screen Only */}
      <div className="mb-6 print-hide">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-babyblue-100 transition-colors"
            >
              <ArrowLeftIcon size={24} className="text-navy-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{equipment.name} Pre-Use Inspection</h1>
              <p className="text-gray-600 mt-1">{equipment.description} - {equipment.standard} Compliant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetChecklist}
              className="px-4 py-2 border border-babyblue-300 text-babyblue-700 rounded-lg hover:bg-babyblue-50 transition-colors font-medium"
            >
              Reset Form
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-babyblue-500 to-babyblue-600 text-white rounded-lg hover:from-babyblue-600 hover:to-babyblue-700 transition-all shadow-md font-medium"
            >
              <PrinterIcon size={18} />
              Print Checklist
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white rounded-xl p-4 border border-babyblue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-700">Inspection Progress</span>
            <span className="text-sm text-gray-600">{stats.completed} of {stats.total} items checked</span>
          </div>
          <div className="h-3 bg-babyblue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-babyblue-500 to-gold-500 transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Pass: {stats.passed}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">Fail: {stats.failed}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-600">Remaining: {stats.total - stats.completed}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 print-hide">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Checklist Submitted Successfully!</h3>
              <p className="text-sm text-green-600 mt-0.5">Your pre-use inspection has been recorded and saved.</p>
            </div>
            <button
              onClick={() => {
                resetChecklist();
                onBack();
              }}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Printable Content */}
      <div ref={printRef} className="print-content">
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <div className="flex items-center justify-between border-b-2 border-babyblue-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-babyblue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">{equipment.name.toUpperCase()} PRE-USE INSPECTION</h1>
                <p className="text-sm text-gray-600">{equipment.description} - {equipment.standard}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-navy-900">Kaiser</p>
              <p className="text-gray-600">Construction Safety</p>

            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-white rounded-xl border border-babyblue-200 shadow-sm mb-6 print:shadow-none print:border-gray-300">
          <div className="px-6 py-4 border-b border-babyblue-100 bg-gradient-to-r from-babyblue-50 to-gold-50 print:bg-babyblue-50">
            <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
              <BuildingIcon size={20} className="text-babyblue-600" />
              Project & Equipment Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3 print:p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Enter project name"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address *</label>
              <input
                type="text"
                value={projectInfo.projectAddress}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, projectAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Enter site address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={projectInfo.date}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={projectInfo.time}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment ID/Tag #</label>
              <input
                type="text"
                value={projectInfo.equipmentId}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, equipmentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Equipment ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={projectInfo.manufacturer}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Manufacturer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input
                type="text"
                value={projectInfo.modelNumber}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, modelNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Model #"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={projectInfo.serialNumber}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Serial #"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Odometer</label>
              <input
                type="text"
                value={projectInfo.hoursReading}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, hoursReading: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Current reading"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
              <input
                type="text"
                value={projectInfo.inspectorName}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, inspectorName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification #</label>
              <input
                type="text"
                value={projectInfo.inspectorCertification}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, inspectorCertification: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Operator cert #"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name</label>
              <input
                type="text"
                value={projectInfo.supervisorName}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, supervisorName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="Site supervisor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
              <select
                value={projectInfo.weatherConditions}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, weatherConditions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
              >
                <option value="">Select...</option>
                <option value="Clear">Clear</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Overcast">Overcast</option>
                <option value="Light Rain">Light Rain</option>
                <option value="Heavy Rain">Heavy Rain</option>
                <option value="Snow">Snow</option>
                <option value="Fog">Fog</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="text"
                value={projectInfo.temperature}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="e.g., 15°C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wind Speed</label>
              <input
                type="text"
                value={projectInfo.windSpeed}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, windSpeed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="e.g., 20 km/h"
              />
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-300 rounded-xl p-4 mb-6 print:bg-gold-50">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon size={24} className="text-gold-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gold-800">Important Safety Notice</h3>
              <p className="text-sm text-gold-700 mt-1">
                This pre-use inspection must be completed by a competent person before each use. Do NOT operate the equipment if any item fails inspection. 
                All deficiencies must be corrected before use. Follow all manufacturer guidelines and applicable safety standards.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-4">
          {equipment.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-babyblue-200 shadow-sm overflow-hidden print:shadow-none print:border-gray-300 avoid-break">
              <div className="px-6 py-3 border-b border-babyblue-100 bg-gradient-to-r from-babyblue-50 to-white print:bg-babyblue-50">
                <h3 className="font-semibold text-navy-900">
                  {section.title}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, idx) => {
                  const itemState = getItemStatus(section.id, item.id);
                  return (
                    <div key={item.id} className={`px-6 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} print:py-2`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{item.text}</p>
                        </div>
                        <div className="flex items-center gap-2 print:gap-1">
                          <button
                            onClick={() => handleStatusChange(section.id, item.id, 'pass')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all print:px-2 print:py-1 ${
                              itemState?.status === 'pass'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            <CheckIcon size={14} />
                            <span className="print:hidden">Pass</span>
                            <span className="hidden print:inline">P</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(section.id, item.id, 'fail')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all print:px-2 print:py-1 ${
                              itemState?.status === 'fail'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            <XIcon size={14} />
                            <span className="print:hidden">Fail</span>
                            <span className="hidden print:inline">F</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(section.id, item.id, 'na')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all print:px-2 print:py-1 ${
                              itemState?.status === 'na'
                                ? 'bg-gray-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>
                      {/* Notes field for failed items */}
                      {itemState?.status === 'fail' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={itemState.notes}
                            onChange={(e) => handleNotesChange(section.id, item.id, e.target.value)}
                            placeholder="Describe deficiency..."
                            className="w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Deficiencies & Corrective Actions */}
        <div className="mt-6 bg-white rounded-xl border border-babyblue-200 shadow-sm print:shadow-none print:border-gray-300 avoid-break">
          <div className="px-6 py-4 border-b border-babyblue-100 bg-gradient-to-r from-babyblue-50 to-gold-50 print:bg-babyblue-50">
            <h2 className="text-lg font-semibold text-navy-900">Deficiencies & Corrective Actions</h2>
          </div>
          <div className="p-6 space-y-4 print:p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Were any deficiencies found?</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deficiencies"
                  checked={deficienciesFound === true}
                  onChange={() => setDeficienciesFound(true)}
                  className="w-4 h-4 text-babyblue-600 focus:ring-babyblue-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="deficiencies"
                  checked={deficienciesFound === false}
                  onChange={() => setDeficienciesFound(false)}
                  className="w-4 h-4 text-babyblue-600 focus:ring-babyblue-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>

            {deficienciesFound && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corrective Actions Required
                </label>
                <textarea
                  value={correctionRequired}
                  onChange={(e) => setCorrectionRequired(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500"
                  placeholder="Describe corrective actions taken or required before operation..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes/Comments</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500"
                placeholder="Any additional observations or comments..."
              />
            </div>
          </div>
        </div>

        {/* Final Approval */}
        <div className="mt-6 bg-white rounded-xl border border-babyblue-200 shadow-sm print:shadow-none print:border-gray-300 avoid-break">
          <div className="px-6 py-4 border-b border-babyblue-100 bg-gradient-to-r from-babyblue-50 to-gold-50 print:bg-babyblue-50">
            <h2 className="text-lg font-semibold text-navy-900">Final Inspection Approval</h2>
          </div>
          <div className="p-6 print:p-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button
                onClick={() => setApprovedForUse(true)}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  approvedForUse === true
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                }`}
              >
                <CheckIcon size={24} className="inline mr-2" />
                APPROVED FOR USE
              </button>
              <button
                onClick={() => setApprovedForUse(false)}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  approvedForUse === false
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100'
                }`}
              >
                <XIcon size={24} className="inline mr-2" />
                NOT APPROVED - DO NOT USE
              </button>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Inspector Signature</p>
                <div className="h-16 border-b-2 border-gray-400 print:h-12"></div>
                <p className="text-xs text-gray-500 mt-1">Name: {projectInfo.inspectorName || '_________________'}</p>
                <p className="text-xs text-gray-500">Date: {projectInfo.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Supervisor Signature (if required)</p>
                <div className="h-16 border-b-2 border-gray-400 print:h-12"></div>
                <p className="text-xs text-gray-500 mt-1">Name: {projectInfo.supervisorName || '_________________'}</p>
                <p className="text-xs text-gray-500">Date: {projectInfo.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button - Screen Only */}
        {!submitSuccess && (
          <div className="mt-6 print-hide">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <SendIcon size={22} />
                  Submit Pre-Use Inspection
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              By submitting, you confirm that this inspection has been completed accurately and honestly.
            </p>
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block mt-6 pt-4 border-t-2 border-babyblue-600">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>
              <p className="font-semibold">Kaiser - Canadian Construction Safety Platform</p>
              <p>{equipment.standard} Compliant | OHSA Compliant | Form Version 2.0</p>
            </div>
            <div className="text-right">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>Retain for minimum 3 years</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentChecklist;
