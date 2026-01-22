import React, { useState, useRef } from 'react';
import { ToolboxTalk, ToolboxTalkSubmission, ToolboxTalkSignature as TBSignature, Employee } from '@/types/safety';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  ShieldIcon,
  UsersIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PrinterIcon,
  SendIcon,
  XIcon
} from './Icons';

interface ToolboxTalkSignatureProps {
  submission: ToolboxTalkSubmission;
  currentEmployee: Employee | null;
  employees: Employee[];
  onBack: () => void;
  onSign: (signature: string) => void;
  onSubmit: () => void;
}

const ToolboxTalkSignatureComponent: React.FC<ToolboxTalkSignatureProps> = ({
  submission,
  currentEmployee,
  employees,
  onBack,
  onSign,
  onSubmit,
}) => {
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
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const talk = submission.toolbox_talk_data;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasCurrentUserSigned = currentEmployee 
    ? submission.signatures.some(s => s.employee_id === currentEmployee.id)
    : false;

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.name || 'Unknown';
  };

  const signedCount = submission.signatures.length;
  const totalAssigned = submission.assigned_employees.length;
  const allSigned = signedCount === totalAssigned && totalAssigned > 0;

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSignSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureName.trim()) return;
    
    const signatureData = canvas.toDataURL();
    onSign(signatureData);
    setShowSignatureModal(false);
    setSignatureName('');
    clearSignature();
  };

  const SectionHeader: React.FC<{ 
    title: string; 
    section: string; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, section, icon, color }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-2.5 ${color} hover:opacity-90 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <span>
        {expandedSections[section] ? (
          <ChevronDownIcon size={16} className="text-white" />
        ) : (
          <ChevronRightIcon size={16} className="text-white" />
        )}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 to-gold-50/30 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon size={24} className="text-navy-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Sign Toolbox Talk</h1>
            <p className="text-gray-500">
              {signedCount} of {totalAssigned} team members have signed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasCurrentUserSigned && currentEmployee && (
            <button
              onClick={() => setShowSignatureModal(true)}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckIcon size={18} />
              Sign Attendance
            </button>
          )}
          {allSigned && submission.status !== 'submitted' && (
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <SendIcon size={18} />
              Submit Toolbox Talk
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-babyblue-200 hover:bg-babyblue-50 rounded-lg font-medium transition-colors flex items-center gap-2 text-babyblue-700"
          >
            <PrinterIcon size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-xl border ${
        submission.status === 'submitted' 
          ? 'bg-green-50 border-green-200' 
          : allSigned 
            ? 'bg-gold-50 border-gold-200'
            : 'bg-babyblue-50 border-babyblue-200'
      }`}>
        <div className="flex items-center gap-3">
          {submission.status === 'submitted' ? (
            <>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Toolbox Talk Submitted</p>
                <p className="text-sm text-green-600">
                  Submitted on {new Date(submission.submitted_at || '').toLocaleString()}
                </p>
              </div>
            </>
          ) : allSigned ? (
            <>
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                <CheckIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gold-800">All Team Members Have Signed</p>
                <p className="text-sm text-gold-600">Ready to submit this toolbox talk</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-babyblue-500 rounded-full flex items-center justify-center">
                <ClockIcon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-babyblue-800">Awaiting Signatures</p>
                <p className="text-sm text-babyblue-600">
                  {totalAssigned - signedCount} team member(s) still need to sign
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toolbox Talk Content */}
      <div className="bg-white rounded-xl border border-babyblue-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-babyblue-600 p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
              <ShieldIcon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-babyblue-200 text-xs font-medium uppercase tracking-wider">Construction Site Safety</div>
              <div className="text-gold-400 text-sm font-semibold">TOOLBOX TALK</div>
            </div>
          </div>
          <h2 className="text-xl font-bold mt-2">{talk.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-babyblue-100 text-xs">
            <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <BookOpenIcon size={12} />
              {talk.category}
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <ClockIcon size={12} />
              {talk.duration}
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              Date: {new Date(talk.generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Objective */}
        <div className="bg-gold-50 border-b border-gold-200 p-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckIcon size={12} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gold-800 text-xs uppercase tracking-wide">Learning Objective</p>
              <p className="text-gold-900 text-sm mt-0.5">{talk.objective}</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="border border-babyblue-200 border-t-0">
          {/* Introduction */}
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="Introduction" 
              section="introduction" 
              icon={<BookOpenIcon size={14} className="text-white" />}
              color="bg-babyblue-600"
            />
            {expandedSections.introduction && (
              <div className="p-3">
                <p className="text-gray-700 text-sm leading-relaxed">{talk.introduction}</p>
              </div>
            )}
          </div>

          {/* Key Hazards */}
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="Key Hazards" 
              section="hazards" 
              icon={<AlertTriangleIcon size={14} className="text-white" />}
              color="bg-red-600"
            />
            {expandedSections.hazards && talk.keyHazards && (
              <div className="p-3">
                <div className="space-y-2">
                  {talk.keyHazards.map((hazard, index) => (
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
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="Safety Procedures" 
              section="procedures" 
              icon={<ShieldIcon size={14} className="text-white" />}
              color="bg-babyblue-600"
            />
            {expandedSections.procedures && talk.safetyProcedures && (
              <div className="p-3">
                <ol className="space-y-1.5">
                  {talk.safetyProcedures.map((procedure, index) => (
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
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="Required PPE" 
              section="ppe" 
              icon={<ShieldIcon size={14} className="text-white" />}
              color="bg-gold-600"
            />
            {expandedSections.ppe && talk.requiredPPE && (
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {talk.requiredPPE.map((ppe, index) => (
                    <span key={index} className="px-2 py-1 bg-gold-100 text-gold-800 rounded text-sm font-medium border border-gold-200">
                      {ppe}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Do's and Don'ts */}
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="Do's and Don'ts" 
              section="dosdonts" 
              icon={<CheckIcon size={14} className="text-white" />}
              color="bg-navy-600"
            />
            {expandedSections.dosdonts && (
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <h4 className="font-semibold text-green-800 mb-1.5 text-xs flex items-center gap-1">
                      <CheckIcon size={12} className="text-green-600" />
                      DO
                    </h4>
                    <ul className="space-y-1">
                      {talk.dos?.map((item, index) => (
                        <li key={index} className="flex items-start gap-1.5 text-green-700 text-xs">
                          <CheckIcon size={10} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <h4 className="font-semibold text-red-800 mb-1.5 text-xs flex items-center gap-1">
                      <XIcon size={12} className="text-red-600" />
                      DON'T
                    </h4>
                    <ul className="space-y-1">
                      {talk.donts?.map((item, index) => (
                        <li key={index} className="flex items-start gap-1.5 text-red-700 text-xs">
                          <XIcon size={10} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Takeaways */}
          <div>
            <SectionHeader 
              title="Key Takeaways" 
              section="takeaways" 
              icon={<CheckIcon size={14} className="text-white" />}
              color="bg-gold-600"
            />
            {expandedSections.takeaways && talk.keyTakeaways && (
              <div className="p-3">
                <ul className="space-y-1">
                  {talk.keyTakeaways.map((takeaway, index) => (
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
        </div>
      </div>

      {/* Attendance/Signatures Section */}
      <div className="bg-white rounded-xl border border-babyblue-200 overflow-hidden">
        <div className="p-4 border-b border-babyblue-100 bg-babyblue-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-babyblue-500 rounded-lg flex items-center justify-center">
              <UsersIcon size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Attendance Record</h3>
              <p className="text-sm text-gray-500">{signedCount} of {totalAssigned} signed</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Presenter Info */}
          {submission.presenter_name && (
            <div className="mb-4 p-3 bg-gold-50 border border-gold-200 rounded-lg">
              <p className="text-sm font-medium text-gold-800">Presenter</p>
              <p className="text-gold-900">{submission.presenter_name}</p>
              {submission.conducted_at && (
                <p className="text-xs text-gold-600 mt-1">
                  Conducted: {new Date(submission.conducted_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Signatures List */}
          <div className="space-y-3">
            {submission.assigned_employees.map((empId) => {
              const signature = submission.signatures.find(s => s.employee_id === empId);
              const employeeName = getEmployeeName(empId);
              const isCurrentUser = currentEmployee?.id === empId;

              return (
                <div 
                  key={empId}
                  className={`p-3 rounded-lg border ${
                    signature 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        signature ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {signature ? (
                          <CheckIcon size={20} className="text-white" />
                        ) : (
                          <span className="text-white font-medium text-sm">
                            {employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${signature ? 'text-green-800' : 'text-gray-700'}`}>
                          {employeeName}
                          {isCurrentUser && <span className="text-xs ml-2 text-babyblue-600">(You)</span>}
                        </p>
                        {signature ? (
                          <p className="text-xs text-green-600">
                            Signed: {new Date(signature.signed_at).toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">Awaiting signature</p>
                        )}
                      </div>
                    </div>
                    {!signature && isCurrentUser && (
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Sign Now
                      </button>
                    )}
                  </div>
                  {signature && signature.signature && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <img 
                        src={signature.signature} 
                        alt="Signature" 
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-navy-900">Sign Attendance</h2>
              <p className="text-sm text-gray-500">
                Confirm your attendance at this toolbox talk
              </p>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Print Name
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Signature
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="w-full bg-white rounded cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <button
                  onClick={clearSignature}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear signature
                </button>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSignatureName('');
                  clearSignature();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignSubmit}
                disabled={!signatureName.trim()}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckIcon size={18} />
                Confirm Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolboxTalkSignatureComponent;
