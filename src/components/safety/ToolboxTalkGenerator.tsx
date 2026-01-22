import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee, ToolboxTalk, ToolboxTalkSubmission } from '@/types/safety';
import { 
  RefreshIcon, 
  PrinterIcon, 
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  ShieldIcon,
  UsersIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClipboardIcon,
  SendIcon,
  XIcon
} from './Icons';

interface ToolboxTalkGeneratorProps {
  employees?: Employee[];
  currentEmployee?: Employee | null;
  onSendToTeam?: (talk: ToolboxTalk, selectedEmployees: string[], projectSite: string, presenterName: string) => void;
}

const CONSTRUCTION_CATEGORIES = [
  'Fall Protection & Working at Heights',
  'Scaffolding Safety',
  'Ladder Safety',
  'Excavation & Trenching',
  'Crane & Rigging Operations',
  'Steel Erection',
  'Concrete Work Safety',
  'Demolition Safety',
  'Roofing Safety',
  'Electrical Safety on Site',
  'Heavy Equipment Operation',
  'Hand & Power Tools',
  'Welding & Hot Work',
  'Confined Space Entry',
  'Lockout/Tagout (LOTO)',
  'Personal Protective Equipment',
  'Silica Dust Exposure',
  'Asbestos Awareness',
  'Lead Safety',
  'Noise & Hearing Protection',
  'Heat Stress Prevention',
  'Cold Weather Safety',
  'Housekeeping & Site Organization',
  'Material Handling & Storage',
  'Fire Prevention on Site',
  'Traffic Control & Flagging',
  'Struck-By Hazards',
  'Caught-In/Between Hazards',
  'Formwork & Shoring',
  'Masonry Safety'
];

const ToolboxTalkGenerator: React.FC<ToolboxTalkGeneratorProps> = ({
  employees = [],
  currentEmployee,
  onSendToTeam
}) => {
  const [currentTalk, setCurrentTalk] = useState<ToolboxTalk | null>(null);
  const [previousTopics, setPreviousTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    introduction: true,
    hazards: true,
    procedures: true,
    ppe: true,
    dosdonts: true,
    questions: true,
    emergency: true,
    takeaways: true,
    regulation: true
  });
  const [savedTalks, setSavedTalks] = useState<ToolboxTalk[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [projectSite, setProjectSite] = useState('');
  const [presenterName, setPresenterName] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Load saved talks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('constructionToolboxTalks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTalks(parsed);
        setPreviousTopics(parsed.map((t: ToolboxTalk) => t.title));
      } catch (e) {
        console.error('Error loading saved talks:', e);
      }
    }
  }, []);

  // Set default presenter name
  useEffect(() => {
    if (currentEmployee && !presenterName) {
      setPresenterName(currentEmployee.name);
    }
  }, [currentEmployee]);

  const generateTalk = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-toolbox-talk', {
        body: { 
          previousTopics,
          category: selectedCategory || null,
          industry: 'construction'
        }
      });

      if (fnError) throw fnError;

      if (data.success && data.toolboxTalk) {
        setCurrentTalk(data.toolboxTalk);
        
        // Save to history
        const newSavedTalks = [data.toolboxTalk, ...savedTalks].slice(0, 50);
        setSavedTalks(newSavedTalks);
        localStorage.setItem('constructionToolboxTalks', JSON.stringify(newSavedTalks));
        
        // Update previous topics
        setPreviousTopics(prev => [...prev, data.toolboxTalk.title].slice(-30));
      } else {
        throw new Error(data.error || 'Failed to generate toolbox talk');
      }
    } catch (err: any) {
      console.error('Error generating toolbox talk:', err);
      setError(err.message || 'Failed to generate toolbox talk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = async () => {
    if (!currentTalk) return;
    
    const text = formatTalkAsText(currentTalk);
    try {
      await navigator.clipboard.writeText(text);
      alert('Toolbox talk copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTalkAsText = (talk: ToolboxTalk): string => {
    let text = `CONSTRUCTION TOOLBOX TALK: ${talk.title}\n`;
    text += `Category: ${talk.category}\n`;
    text += `Duration: ${talk.duration}\n`;
    text += `Date: ${new Date(talk.generatedAt).toLocaleDateString()}\n\n`;
    
    text += `OBJECTIVE:\n${talk.objective}\n\n`;
    text += `INTRODUCTION:\n${talk.introduction}\n\n`;
    
    text += `KEY HAZARDS:\n`;
    talk.keyHazards?.forEach((h, i) => {
      text += `${i + 1}. ${h.hazard}: ${h.description}\n`;
    });
    
    text += `\nSAFETY PROCEDURES:\n`;
    talk.safetyProcedures?.forEach((p, i) => {
      text += `${i + 1}. ${p}\n`;
    });
    
    text += `\nREQUIRED PPE:\n`;
    talk.requiredPPE?.forEach(p => {
      text += `- ${p}\n`;
    });
    
    text += `\nDO's:\n`;
    talk.dos?.forEach(d => text += `- ${d}\n`);
    
    text += `\nDON'Ts:\n`;
    talk.donts?.forEach(d => text += `- ${d}\n`);
    
    text += `\nDISCUSSION QUESTIONS:\n`;
    talk.discussionQuestions?.forEach((q, i) => text += `${i + 1}. ${q}\n`);
    
    text += `\nEMERGENCY RESPONSE:\n`;
    talk.emergencyResponse?.forEach((s, i) => text += `${i + 1}. ${s}\n`);
    
    text += `\nKEY TAKEAWAYS:\n`;
    talk.keyTakeaways?.forEach(t => text += `- ${t}\n`);
    
    text += `\nREGULATION:\n${talk.regulationReference}\n`;
    
    return text;
  };

  const handleSendToTeam = () => {
    if (!currentTalk || !onSendToTeam) return;
    if (selectedEmployees.length === 0) {
      alert('Please select at least one team member');
      return;
    }
    if (!presenterName.trim()) {
      alert('Please enter the presenter name');
      return;
    }

    onSendToTeam(currentTalk, selectedEmployees, projectSite, presenterName);
    setSendSuccess(true);
    setTimeout(() => {
      setShowSendModal(false);
      setSendSuccess(false);
      setSelectedEmployees([]);
      setProjectSite('');
    }, 2000);
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const SectionHeader: React.FC<{ 
    title: string; 
    section: string; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, section, icon, color }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-2.5 ${color} hover:opacity-90 transition-opacity print:p-2`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <span className="print-hide">
        {expandedSections[section] ? (
          <ChevronDownIcon size={16} className="text-white" />
        ) : (
          <ChevronRightIcon size={16} className="text-white" />
        )}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header - Hidden on print */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-lg flex items-center justify-center">
              <SparklesIcon size={20} className="text-white" />
            </div>
            Construction Toolbox Talk Generator
          </h1>
          <p className="text-gray-500 mt-1">
            Generate unique, print-ready safety talks for your construction site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 border border-babyblue-200 rounded-lg hover:bg-babyblue-50 transition-colors text-sm font-medium text-babyblue-700"
          >
            {showHistory ? 'Hide History' : 'View History'} ({savedTalks.length})
          </button>
        </div>
      </div>

      {/* Generator Controls - Hidden on print */}
      <div className="bg-white rounded-xl border border-babyblue-200 p-6 print-hide">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Select Construction Category (Optional)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 bg-white"
            >
              <option value="">Random Construction Topic</option>
              {CONSTRUCTION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateTalk}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon size={18} />
                  Generate Talk
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <RefreshIcon size={16} />
          <span>Topics generated: {previousTopics.length}</span>
          <span className="mx-2">•</span>
          <span>Each talk is unique and never repeats</span>
        </div>
      </div>

      {/* History Panel - Hidden on print */}
      {showHistory && savedTalks.length > 0 && (
        <div className="bg-white rounded-xl border border-babyblue-200 p-6 print-hide">
          <h2 className="font-semibold text-navy-900 mb-4">Previously Generated Talks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {savedTalks.map((talk, index) => (
              <button
                key={index}
                onClick={() => setCurrentTalk(talk)}
                className={`p-4 border rounded-lg text-left hover:border-babyblue-400 hover:bg-babyblue-50 transition-all ${
                  currentTalk?.title === talk.title ? 'border-babyblue-500 bg-babyblue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium text-navy-900 text-sm truncate">{talk.title}</p>
                <p className="text-xs text-gray-500 mt-1">{talk.category}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(talk.generatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Talk Display - Print-friendly PDF format */}
      {currentTalk && (
        <div ref={printRef} className="toolbox-talk-pdf bg-white" id="toolbox-talk-content">
          {/* PDF Header with Company Branding */}
          <div className="bg-babyblue-600 p-5 text-white print:p-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                    <ShieldIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-babyblue-200 text-xs font-medium uppercase tracking-wider">Construction Site Safety</div>
                    <div className="text-gold-400 text-sm font-semibold">TOOLBOX TALK</div>
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-2">{currentTalk.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-babyblue-100 text-xs">
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <BookOpenIcon size={12} />
                    {currentTalk.category}
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <ClockIcon size={12} />
                    {currentTalk.duration}
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    Date: {new Date(currentTalk.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 print-hide">
                <button
                  onClick={handleCopyToClipboard}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon size={16} />
                </button>
                {onSendToTeam && employees.length > 0 && (
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                    title="Send to team for signatures"
                  >
                    <SendIcon size={16} />
                    Send to Team
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-gold-500 hover:bg-gold-600 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                  title="Print as PDF"
                >
                  <PrinterIcon size={16} />
                  Print PDF
                </button>
              </div>
            </div>
          </div>

          {/* Objective Banner */}
          <div className="bg-gold-50 border-b border-gold-200 p-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon size={12} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gold-800 text-xs uppercase tracking-wide">Learning Objective</p>
                <p className="text-gold-900 text-sm mt-0.5">{currentTalk.objective}</p>
              </div>
            </div>
          </div>

          {/* Content Sections - Compact for printing */}
          <div className="border border-babyblue-200 border-t-0">
            {/* Introduction */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Introduction" 
                section="introduction" 
                icon={<BookOpenIcon size={14} className="text-white" />}
                color="bg-babyblue-600"
              />
              {expandedSections.introduction && (
                <div className="p-3">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {currentTalk.introduction}
                  </p>
                </div>
              )}
            </div>

            {/* Key Hazards */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Key Hazards" 
                section="hazards" 
                icon={<AlertTriangleIcon size={14} className="text-white" />}
                color="bg-red-600"
              />
              {expandedSections.hazards && currentTalk.keyHazards && (
                <div className="p-3">
                  <div className="space-y-2">
                    {currentTalk.keyHazards.map((hazard, index) => (
                      <div key={index} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded p-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-red-800 text-sm">{hazard.hazard}</p>
                          <p className="text-red-700 text-xs">{hazard.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Safety Procedures */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Safety Procedures" 
                section="procedures" 
                icon={<ShieldIcon size={14} className="text-white" />}
                color="bg-babyblue-600"
              />
              {expandedSections.procedures && currentTalk.safetyProcedures && (
                <div className="p-3">
                  <ol className="space-y-1.5">
                    {currentTalk.safetyProcedures.map((procedure, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-5 h-5 bg-babyblue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm">{procedure}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Required PPE */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Required PPE" 
                section="ppe" 
                icon={<ShieldIcon size={14} className="text-white" />}
                color="bg-gold-600"
              />
              {expandedSections.ppe && currentTalk.requiredPPE && (
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {currentTalk.requiredPPE.map((ppe, index) => (
                      <span key={index} className="px-2 py-1 bg-gold-100 text-gold-800 rounded text-sm font-medium border border-gold-200">
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Do's and Don'ts - Side by side for print */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Do's and Don'ts" 
                section="dosdonts" 
                icon={<CheckIcon size={14} className="text-white" />}
                color="bg-navy-600"
              />
              {expandedSections.dosdonts && (
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Do's */}
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <h4 className="font-semibold text-green-800 mb-1.5 text-xs flex items-center gap-1">
                        <CheckIcon size={12} className="text-green-600" />
                        DO
                      </h4>
                      <ul className="space-y-1">
                        {currentTalk.dos?.map((item, index) => (
                          <li key={index} className="flex items-start gap-1.5 text-green-700 text-xs">
                            <CheckIcon size={10} className="text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Don'ts */}
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <h4 className="font-semibold text-red-800 mb-1.5 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        DON'T
                      </h4>
                      <ul className="space-y-1">
                        {currentTalk.donts?.map((item, index) => (
                          <li key={index} className="flex items-start gap-1.5 text-red-700 text-xs">
                            <svg className="w-2.5 h-2.5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discussion Questions */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Discussion Questions" 
                section="questions" 
                icon={<UsersIcon size={14} className="text-white" />}
                color="bg-babyblue-600"
              />
              {expandedSections.questions && currentTalk.discussionQuestions && (
                <div className="p-3">
                  <div className="space-y-1.5">
                    {currentTalk.discussionQuestions.map((question, index) => (
                      <div key={index} className="flex items-start gap-2 bg-babyblue-50 border border-babyblue-100 rounded p-2">
                        <span className="w-4 h-4 bg-babyblue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                          ?
                        </span>
                        <p className="text-babyblue-800 text-sm">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Response */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Emergency Response" 
                section="emergency" 
                icon={<AlertTriangleIcon size={14} className="text-white" />}
                color="bg-red-600"
              />
              {expandedSections.emergency && currentTalk.emergencyResponse && (
                <div className="p-3">
                  <ol className="space-y-1">
                    {currentTalk.emergencyResponse.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-red-800 text-sm">
                        <span className="font-bold text-xs">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Key Takeaways */}
            <div className="border-b border-gray-200 avoid-break">
              <SectionHeader 
                title="Key Takeaways" 
                section="takeaways" 
                icon={<CheckIcon size={14} className="text-white" />}
                color="bg-gold-600"
              />
              {expandedSections.takeaways && currentTalk.keyTakeaways && (
                <div className="p-3">
                  <ul className="space-y-1">
                    {currentTalk.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckIcon size={8} className="text-white" />
                        </div>
                        <span className="text-gold-800 text-sm">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Regulation Reference */}
            <div className="avoid-break">
              <SectionHeader 
                title="Regulation Reference" 
                section="regulation" 
                icon={<BookOpenIcon size={14} className="text-white" />}
                color="bg-navy-600"
              />
              {expandedSections.regulation && currentTalk.regulationReference && (
                <div className="p-3">
                  <p className="text-gray-700 text-sm bg-navy-50 border border-navy-200 rounded p-2">
                    {currentTalk.regulationReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Section - Always visible for print */}
          <div className="p-4 border border-babyblue-200 border-t-0 bg-gray-50 print-page-break">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-babyblue-500 rounded flex items-center justify-center">
                <UsersIcon size={14} className="text-white" />
              </div>
              <h3 className="font-semibold text-navy-900 text-sm">Attendance Record</h3>
            </div>
            <table className="w-full border-collapse attendance-table">
              <thead>
                <tr className="bg-babyblue-100">
                  <th className="border border-babyblue-200 p-2 text-left text-xs font-semibold text-navy-800 w-1/3">Name (Print)</th>
                  <th className="border border-babyblue-200 p-2 text-left text-xs font-semibold text-navy-800 w-1/3">Signature</th>
                  <th className="border border-babyblue-200 p-2 text-left text-xs font-semibold text-navy-800 w-24">Date</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="border border-babyblue-200 p-2 bg-white h-8"></td>
                    <td className="border border-babyblue-200 p-2 bg-white h-8"></td>
                    <td className="border border-babyblue-200 p-2 bg-white h-8"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Presenter Section */}
            <div className="mt-4 pt-3 border-t border-gray-300">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-navy-600 mb-1 font-medium">Presenter Name:</p>
                  <div className="border-b-2 border-navy-400 h-6 signature-line"></div>
                </div>
                <div>
                  <p className="text-xs text-navy-600 mb-1 font-medium">Presenter Signature:</p>
                  <div className="border-b-2 border-navy-400 h-6 signature-line"></div>
                </div>
                <div>
                  <p className="text-xs text-navy-600 mb-1 font-medium">Date:</p>
                  <div className="border-b-2 border-navy-400 h-6 signature-line"></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-500 print-footer">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-babyblue-600 rounded flex items-center justify-center">
                  <img 
                    src="https://d64gsuwffb70l.cloudfront.net/69715207e860303490f3d8ab_1769043905057_b034ee0f.png" 
                    alt="Kaiser Logo" 
                    className="w-6 h-6 rounded object-cover"
                  />
                </div>
                <span>Kaiser - Construction Safety Platform</span>

              </div>
              <div>
                Generated: {new Date(currentTalk.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Hidden on print */}
      {!currentTalk && !loading && (
        <div className="bg-white rounded-xl border border-babyblue-200 p-12 text-center print-hide">
          <div className="w-20 h-20 bg-gradient-to-br from-babyblue-100 to-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon size={40} className="text-babyblue-500" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            Generate Your First Construction Toolbox Talk
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
            Our AI will create a unique, print-ready safety talk specifically for construction sites. Perfect for morning huddles and site safety meetings.
          </p>
          <button
            onClick={generateTalk}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-lg transition-all font-medium inline-flex items-center gap-2 shadow-lg"
          >
            <SparklesIcon size={18} />
            Generate Toolbox Talk
          </button>
        </div>
      )}

      {/* Send to Team Modal */}
      {showSendModal && currentTalk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">Send Toolbox Talk to Team</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentTalk.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XIcon size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {sendSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">Toolbox Talk Sent!</h3>
                <p className="text-gray-500">
                  Team members have been notified and can now sign the attendance.
                </p>
              </div>
            ) : (
              <>
                <div className="p-5 max-h-96 overflow-y-auto space-y-4">
                  {/* Project Site */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Project Site (Optional)
                    </label>
                    <input
                      type="text"
                      value={projectSite}
                      onChange={(e) => setProjectSite(e.target.value)}
                      placeholder="Enter project site name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                    />
                  </div>

                  {/* Presenter Name */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Presenter Name *
                    </label>
                    <input
                      type="text"
                      value={presenterName}
                      onChange={(e) => setPresenterName(e.target.value)}
                      placeholder="Enter presenter name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                    />
                  </div>

                  {/* Team Members */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-navy-700">
                        Select Team Members *
                      </label>
                      <button
                        onClick={selectAllEmployees}
                        className="text-sm text-babyblue-600 hover:text-babyblue-700"
                      >
                        {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {employees.map((employee) => (
                        <label
                          key={employee.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => toggleEmployeeSelection(employee.id)}
                            className="w-4 h-4 text-babyblue-600 rounded border-gray-300 focus:ring-babyblue-500"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-navy-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-navy-900 text-sm">{employee.name}</p>
                              <p className="text-xs text-gray-500">{employee.role}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedEmployees.length} team member(s) selected
                    </p>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendToTeam}
                    disabled={selectedEmployees.length === 0 || !presenterName.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <SendIcon size={18} />
                    Send to Team
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxTalkGenerator;
