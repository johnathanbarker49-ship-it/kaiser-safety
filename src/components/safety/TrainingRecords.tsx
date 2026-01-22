import React, { useState, useRef, useCallback } from 'react';
import { Employee } from '@/types/safety';
import {
  GraduationCapIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  CheckIcon,
  CalendarIcon,
  UserIcon,
  SearchIcon,
  DownloadIcon,
} from './Icons';

// Upload icon
const UploadIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// Image icon
const ImageIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

// Eye icon for viewing
const EyeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

interface TrainingCertification {
  id: string;
  name: string;
  type: 'whmis' | 'fall_protection' | 'first_aid' | 'confined_space' | 'forklift' | 'crane' | 'scaffold' | 'electrical' | 'other';
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  imageUrl?: string;
}

interface EmployeeTrainingRecord {
  employeeId: string;
  certifications: TrainingCertification[];
}

interface TrainingRecordsProps {
  employees: Employee[];
}

const CERTIFICATION_TYPES = [
  { value: 'whmis', label: 'WHMIS' },
  { value: 'fall_protection', label: 'Fall Protection' },
  { value: 'first_aid', label: 'First Aid/CPR' },
  { value: 'confined_space', label: 'Confined Space' },
  { value: 'forklift', label: 'Forklift Operator' },
  { value: 'crane', label: 'Crane Operator' },
  { value: 'scaffold', label: 'Scaffold Safety' },
  { value: 'electrical', label: 'Electrical Safety' },
  { value: 'other', label: 'Other' },
];

const TrainingRecords: React.FC<TrainingRecordsProps> = ({ employees }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [trainingRecords, setTrainingRecords] = useState<EmployeeTrainingRecord[]>(() => {
    const saved = localStorage.getItem('trainingRecords');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [newCertification, setNewCertification] = useState<Partial<TrainingCertification>>({
    type: 'whmis',
    issueDate: '',
    expiryDate: '',
    name: '',
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage whenever records change
  const saveRecords = (records: EmployeeTrainingRecord[]) => {
    localStorage.setItem('trainingRecords', JSON.stringify(records));
    setTrainingRecords(records);
  };

  // Get certifications for an employee
  const getEmployeeCertifications = (employeeId: string): TrainingCertification[] => {
    const record = trainingRecords.find(r => r.employeeId === employeeId);
    return record?.certifications || [];
  };

  // Calculate certification status
  const getCertificationStatus = (expiryDate: string): 'valid' | 'expiring_soon' | 'expired' => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (expiry < now) return 'expired';
    if (expiry < thirtyDaysFromNow) return 'expiring_soon';
    return 'valid';
  };

  // Handle file drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (JPG, PNG) or PDF');
    }
  };

  // Add new certification
  const handleAddCertification = () => {
    if (!selectedEmployee || !newCertification.name || !newCertification.issueDate || !newCertification.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    const certification: TrainingCertification = {
      id: `cert-${Date.now()}`,
      name: newCertification.name || CERTIFICATION_TYPES.find(t => t.value === newCertification.type)?.label || 'Certificate',
      type: newCertification.type as TrainingCertification['type'],
      issueDate: newCertification.issueDate,
      expiryDate: newCertification.expiryDate,
      status: getCertificationStatus(newCertification.expiryDate),
      imageUrl: uploadedImage || undefined,
    };

    const existingRecord = trainingRecords.find(r => r.employeeId === selectedEmployee.id);
    
    if (existingRecord) {
      const updatedRecords = trainingRecords.map(r => 
        r.employeeId === selectedEmployee.id 
          ? { ...r, certifications: [...r.certifications, certification] }
          : r
      );
      saveRecords(updatedRecords);
    } else {
      saveRecords([...trainingRecords, {
        employeeId: selectedEmployee.id,
        certifications: [certification],
      }]);
    }

    // Reset form
    setNewCertification({ type: 'whmis', issueDate: '', expiryDate: '', name: '' });
    setUploadedImage(null);
    setShowAddModal(false);
  };

  // Delete certification
  const handleDeleteCertification = (employeeId: string, certId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    const updatedRecords = trainingRecords.map(r => 
      r.employeeId === employeeId 
        ? { ...r, certifications: r.certifications.filter(c => c.id !== certId) }
        : r
    ).filter(r => r.certifications.length > 0);

    saveRecords(updatedRecords);
  };

  // View image
  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Filter employees by search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCapIcon size={24} className="text-white" />
            </div>
            Training Records
          </h1>
          <p className="text-gray-500 mt-1">
            Manage team certifications and upload training card images
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Team Training Records Grid */}
      <div className="grid gap-6">
        {filteredEmployees.map((employee) => {
          const certifications = getEmployeeCertifications(employee.id);
          const validCount = certifications.filter(c => c.status === 'valid').length;
          const expiringCount = certifications.filter(c => c.status === 'expiring_soon').length;
          const expiredCount = certifications.filter(c => c.status === 'expired').length;

          return (
            <div key={employee.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Employee Header */}
              <div className="bg-gradient-to-r from-babyblue-50 to-gold-50 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.role} • {employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {validCount > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {validCount} Valid
                      </span>
                    )}
                    {expiringCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        {expiringCount} Expiring
                      </span>
                    )}
                    {expiredCount > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {expiredCount} Expired
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowAddModal(true);
                      }}
                      className="ml-2 px-3 py-1.5 bg-babyblue-500 text-white text-sm font-medium rounded-lg hover:bg-babyblue-600 transition-colors flex items-center gap-1"
                    >
                      <PlusIcon size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              <div className="p-4">
                {certifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <GraduationCapIcon size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No training records yet</p>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowAddModal(true);
                      }}
                      className="mt-2 text-babyblue-500 hover:text-babyblue-600 text-sm font-medium"
                    >
                      Add first certification
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-babyblue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-navy-900 text-sm">{cert.name}</h4>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(cert.status)}`}>
                              {getStatusLabel(cert.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {cert.imageUrl && (
                              <button
                                onClick={() => handleViewImage(cert.imageUrl!)}
                                className="p-1.5 text-gray-400 hover:text-babyblue-500 hover:bg-babyblue-50 rounded transition-colors"
                                title="View Image"
                              >
                                <EyeIcon size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCertification(employee.id, cert.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon size={12} />
                            <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon size={12} />
                            <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {cert.imageUrl && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-babyblue-500">
                            <ImageIcon size={12} />
                            <span>Card image attached</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Certification Modal */}
      {showAddModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy-900">Add Training Record</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setUploadedImage(null);
                    setNewCertification({ type: 'whmis', issueDate: '', expiryDate: '', name: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XIcon size={20} className="text-gray-500" />
                </button>
              </div>
              <p className="text-gray-500 mt-1">Adding record for {selectedEmployee.name}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Certification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Type
                </label>
                <select
                  value={newCertification.type}
                  onChange={(e) => setNewCertification({
                    ...newCertification,
                    type: e.target.value as TrainingCertification['type'],
                    name: CERTIFICATION_TYPES.find(t => t.value === e.target.value)?.label || '',
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                >
                  {CERTIFICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Name (for "Other" type) */}
              {newCertification.type === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    placeholder="Enter certification name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={newCertification.issueDate}
                  onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Card Image (Optional)
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-babyblue-500 bg-babyblue-50'
                      : 'border-gray-300 hover:border-babyblue-400'
                  }`}
                >
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <img
                        src={uploadedImage}
                        alt="Uploaded card"
                        className="max-h-40 mx-auto rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-1">
                        Drag and drop your training card image here
                      </p>
                      <p className="text-sm text-gray-400 mb-3">
                        or click to browse (JPG, PNG, PDF)
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-babyblue-500 text-white text-sm font-medium rounded-lg hover:bg-babyblue-600 transition-colors"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadedImage(null);
                  setNewCertification({ type: 'whmis', issueDate: '', expiryDate: '', name: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-babyblue-500 text-white font-medium rounded-lg hover:bg-babyblue-600 transition-colors flex items-center gap-2"
              >
                <CheckIcon size={18} />
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Training card"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 right-4">
              <a
                href={selectedImage}
                download="training-card.png"
                className="px-4 py-2 bg-white text-navy-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadIcon size={18} />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingRecords;
