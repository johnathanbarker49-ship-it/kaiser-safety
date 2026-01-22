import React, { useState, useRef } from 'react';
import { PrinterIcon, CheckIcon, XIcon, AlertTriangleIcon, ClipboardIcon, CalendarIcon, UserIcon, BuildingIcon } from './Icons';

interface ChecklistItem {
  id: string;
  text: string;
  status: 'pass' | 'fail' | 'na' | null;
  notes: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const SwingStageChecklist: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
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
    swingStageId: '',
    manufacturer: '',
    modelNumber: '',
    maxCapacity: '',
    lastInspectionDate: '',
  });

  const initialSections: ChecklistSection[] = [
    {
      id: 'pre-use',
      title: '1. Pre-Use Documentation & Qualifications',
      icon: <ClipboardIcon size={20} className="text-babyblue-600" />,
      items: [
        { id: 'pre-1', text: 'Valid swing stage operator certification on file', status: null, notes: '' },
        { id: 'pre-2', text: 'Fall protection training completed and documented', status: null, notes: '' },
        { id: 'pre-3', text: 'Equipment inspection log reviewed', status: null, notes: '' },
        { id: 'pre-4', text: 'Manufacturer\'s operating manual available on site', status: null, notes: '' },
        { id: 'pre-5', text: 'Engineering drawings/specifications available (if required)', status: null, notes: '' },
        { id: 'pre-6', text: 'Rescue plan documented and communicated', status: null, notes: '' },
        { id: 'pre-7', text: 'Workers briefed on emergency procedures', status: null, notes: '' },
        { id: 'pre-8', text: 'Site-specific hazard assessment completed', status: null, notes: '' },
      ],
    },
    {
      id: 'rigging',
      title: '2. Rigging & Suspension System',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
      items: [
        { id: 'rig-1', text: 'Roof rigging/outriggers properly installed and secured', status: null, notes: '' },
        { id: 'rig-2', text: 'Counterweights adequate and properly secured', status: null, notes: '' },
        { id: 'rig-3', text: 'Parapet clamps/tie-backs properly installed', status: null, notes: '' },
        { id: 'rig-4', text: 'Roof anchors inspected and certified', status: null, notes: '' },
        { id: 'rig-5', text: 'Wire ropes free of kinks, bird caging, or broken strands', status: null, notes: '' },
        { id: 'rig-6', text: 'Wire rope clips properly installed (U-bolt on dead end)', status: null, notes: '' },
        { id: 'rig-7', text: 'Thimbles installed at all connection points', status: null, notes: '' },
        { id: 'rig-8', text: 'Secondary/safety wire ropes in place', status: null, notes: '' },
        { id: 'rig-9', text: 'All shackles, hooks, and hardware in good condition', status: null, notes: '' },
        { id: 'rig-10', text: 'Load capacity clearly marked and not exceeded', status: null, notes: '' },
      ],
    },
    {
      id: 'platform',
      title: '3. Platform/Deck Inspection',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>,
      items: [
        { id: 'plat-1', text: 'Platform deck in good condition (no cracks, holes, rot)', status: null, notes: '' },
        { id: 'plat-2', text: 'Platform level and properly aligned', status: null, notes: '' },
        { id: 'plat-3', text: 'All platform sections securely connected', status: null, notes: '' },
        { id: 'plat-4', text: 'Stirrups/hangers properly attached to platform', status: null, notes: '' },
        { id: 'plat-5', text: 'No excessive debris or materials on platform', status: null, notes: '' },
        { id: 'plat-6', text: 'Platform width adequate for work being performed', status: null, notes: '' },
        { id: 'plat-7', text: 'End gates/access points secure', status: null, notes: '' },
      ],
    },
    {
      id: 'guardrails',
      title: '4. Guardrails & Fall Protection',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      items: [
        { id: 'guard-1', text: 'Top rail at 1.0m - 1.1m (39" - 42") height', status: null, notes: '' },
        { id: 'guard-2', text: 'Mid rail installed at approximately half height', status: null, notes: '' },
        { id: 'guard-3', text: 'Toeboards minimum 100mm (4") height installed', status: null, notes: '' },
        { id: 'guard-4', text: 'All guardrail connections secure', status: null, notes: '' },
        { id: 'guard-5', text: 'Guardrails on all open sides of platform', status: null, notes: '' },
        { id: 'guard-6', text: 'Independent lifelines properly installed', status: null, notes: '' },
        { id: 'guard-7', text: 'Lifeline anchors rated for fall arrest loads', status: null, notes: '' },
        { id: 'guard-8', text: 'Rope grabs/fall arresters functioning properly', status: null, notes: '' },
      ],
    },
    {
      id: 'hoisting',
      title: '5. Hoisting Equipment',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>,
      items: [
        { id: 'hoist-1', text: 'Hoists securely mounted to stirrups', status: null, notes: '' },
        { id: 'hoist-2', text: 'Hoist motors in good working condition', status: null, notes: '' },
        { id: 'hoist-3', text: 'Primary brake functioning properly', status: null, notes: '' },
        { id: 'hoist-4', text: 'Secondary/emergency brake functioning', status: null, notes: '' },
        { id: 'hoist-5', text: 'Upper and lower limit switches operational', status: null, notes: '' },
        { id: 'hoist-6', text: 'Control switches clearly labeled and functional', status: null, notes: '' },
        { id: 'hoist-7', text: 'Emergency stop button accessible and working', status: null, notes: '' },
        { id: 'hoist-8', text: 'Hoist rated capacity clearly marked', status: null, notes: '' },
        { id: 'hoist-9', text: 'Hoists synchronized for level operation', status: null, notes: '' },
      ],
    },
    {
      id: 'electrical',
      title: '6. Electrical Systems',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      items: [
        { id: 'elec-1', text: 'Power supply adequate for equipment load', status: null, notes: '' },
        { id: 'elec-2', text: 'GFCI protection in place', status: null, notes: '' },
        { id: 'elec-3', text: 'Power cables in good condition (no cuts, fraying)', status: null, notes: '' },
        { id: 'elec-4', text: 'Cables properly secured and protected', status: null, notes: '' },
        { id: 'elec-5', text: 'Electrical connections weatherproof', status: null, notes: '' },
        { id: 'elec-6', text: 'Minimum clearance from power lines maintained', status: null, notes: '' },
        { id: 'elec-7', text: 'Control pendant in good condition', status: null, notes: '' },
      ],
    },
    {
      id: 'ppe',
      title: '7. Personal Protective Equipment',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      items: [
        { id: 'ppe-1', text: 'CSA-approved full body harness worn', status: null, notes: '' },
        { id: 'ppe-2', text: 'Harness inspected and in good condition', status: null, notes: '' },
        { id: 'ppe-3', text: 'Shock-absorbing lanyard or SRL connected', status: null, notes: '' },
        { id: 'ppe-4', text: 'Lanyard connected to independent lifeline', status: null, notes: '' },
        { id: 'ppe-5', text: 'Hard hat worn at all times', status: null, notes: '' },
        { id: 'ppe-6', text: 'Safety footwear worn', status: null, notes: '' },
        { id: 'ppe-7', text: 'High-visibility vest worn', status: null, notes: '' },
        { id: 'ppe-8', text: 'Additional PPE as required (gloves, eye protection)', status: null, notes: '' },
      ],
    },
    {
      id: 'weather',
      title: '8. Weather & Environmental Conditions',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
      items: [
        { id: 'weath-1', text: 'Wind speed within safe operating limits (typically <40 km/h)', status: null, notes: '' },
        { id: 'weath-2', text: 'No lightning or electrical storms in area', status: null, notes: '' },
        { id: 'weath-3', text: 'Visibility adequate for safe operation', status: null, notes: '' },
        { id: 'weath-4', text: 'Platform not icy or slippery', status: null, notes: '' },
        { id: 'weath-5', text: 'No heavy rain or snow affecting operation', status: null, notes: '' },
        { id: 'weath-6', text: 'Temperature within equipment operating range', status: null, notes: '' },
      ],
    },
    {
      id: 'site',
      title: '9. Site Conditions & Hazards',
      icon: <AlertTriangleIcon size={20} className="text-babyblue-600" />,
      items: [
        { id: 'site-1', text: 'Area below platform barricaded/controlled', status: null, notes: '' },
        { id: 'site-2', text: 'Warning signs posted at ground level', status: null, notes: '' },
        { id: 'site-3', text: 'No obstructions in travel path', status: null, notes: '' },
        { id: 'site-4', text: 'Building features/projections identified', status: null, notes: '' },
        { id: 'site-5', text: 'Communication system in place', status: null, notes: '' },
        { id: 'site-6', text: 'Spotter/ground person assigned if required', status: null, notes: '' },
        { id: 'site-7', text: 'Emergency access route identified', status: null, notes: '' },
      ],
    },
    {
      id: 'operational',
      title: '10. Operational Test',
      icon: <svg className="w-5 h-5 text-babyblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      items: [
        { id: 'op-1', text: 'Platform raised and lowered through full range', status: null, notes: '' },
        { id: 'op-2', text: 'Platform remains level during operation', status: null, notes: '' },
        { id: 'op-3', text: 'Brakes tested and holding properly', status: null, notes: '' },
        { id: 'op-4', text: 'Limit switches tested and functioning', status: null, notes: '' },
        { id: 'op-5', text: 'Emergency stop tested', status: null, notes: '' },
        { id: 'op-6', text: 'No unusual sounds or vibrations', status: null, notes: '' },
        { id: 'op-7', text: 'Manual descent procedure verified', status: null, notes: '' },
      ],
    },
  ];

  const [sections, setSections] = useState<ChecklistSection[]>(initialSections);
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
    setSections(initialSections);
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
      swingStageId: '',
      manufacturer: '',
      modelNumber: '',
      maxCapacity: '',
      lastInspectionDate: '',
    });
    setAdditionalNotes('');
    setDeficienciesFound(false);
    setCorrectionRequired('');
    setApprovedForUse(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header - Screen Only */}
      <div className="mb-6 print-hide">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Swing Stage Pre-Use Inspection Checklist</h1>
            <p className="text-gray-600 mt-1">Suspended Scaffold Safety Inspection - CSA Z271 Compliant</p>
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

      {/* Printable Content */}
      <div ref={printRef} className="print-content">
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <div className="flex items-center justify-between border-b-2 border-babyblue-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-babyblue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">SWING STAGE PRE-USE INSPECTION</h1>
                <p className="text-sm text-gray-600">Suspended Scaffold Safety Checklist - CSA Z271</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-navy-900">Kaiser</p>

              <p className="text-gray-600">Canadian Construction Safety</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Swing Stage ID/Tag #</label>
              <input
                type="text"
                value={projectInfo.swingStageId}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, swingStageId: e.target.value }))}
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
                placeholder="e.g., Sky Climber, Spider"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (lbs/kg)</label>
              <input
                type="text"
                value={projectInfo.maxCapacity}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, maxCapacity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-babyblue-500 print:border-gray-400 print:py-1"
                placeholder="e.g., 1500 lbs"
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
                This inspection must be completed by a competent person before each use. Do NOT operate the swing stage if any item fails inspection. 
                All deficiencies must be corrected before use. Workers must wear fall protection connected to an independent lifeline at all times.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-babyblue-200 shadow-sm overflow-hidden print:shadow-none print:border-gray-300 avoid-break">
              <div className="px-6 py-3 border-b border-babyblue-100 bg-gradient-to-r from-babyblue-50 to-white print:bg-babyblue-50">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, idx) => (
                  <div key={item.id} className={`px-6 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} print:py-2`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.text}</p>
                      </div>
                      <div className="flex items-center gap-2 print:gap-1">
                        <button
                          onClick={() => handleStatusChange(section.id, item.id, 'pass')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all print:px-2 print:py-1 ${
                            item.status === 'pass'
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
                            item.status === 'fail'
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
                            item.status === 'na'
                              ? 'bg-gray-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                    {/* Notes field for failed items */}
                    {item.status === 'fail' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleNotesChange(section.id, item.id, e.target.value)}
                          placeholder="Describe deficiency..."
                          className="w-full px-3 py-1.5 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                        />
                      </div>
                    )}
                  </div>
                ))}
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

        {/* Print Footer */}
        <div className="hidden print:block mt-6 pt-4 border-t-2 border-babyblue-600">
          <div className="flex justify-between items-center text-xs text-gray-600">
              <p className="font-semibold">Kaiser - Canadian Construction Safety Platform</p>

              <p className="font-semibold">SafetyCompliance - Canadian Construction Safety Platform</p>
              <p>CSA Z271 Compliant | OHSA Compliant | Form Version 2.0</p>
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

export default SwingStageChecklist;
