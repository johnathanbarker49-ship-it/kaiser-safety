import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SafetyDocument, Employee, DocumentSubmission, Notification, ToolboxTalk, ToolboxTalkSubmission } from '@/types/safety';
import { v4 as uuidv4 } from 'uuid';
import { generateDocumentPDF, generateToolboxTalkPDF, generateEquipmentChecklistPDF } from '@/lib/pdfGenerator';

// Import components
import Header from './safety/Header';
import Sidebar from './safety/Sidebar';
import Dashboard from './safety/Dashboard';
import DocumentLibrary from './safety/DocumentLibrary';
import DocumentForm from './safety/DocumentForm';
import DocumentDetails from './safety/DocumentDetails';
import TeamManagement from './safety/TeamManagement';
import MySubmissions from './safety/MySubmissions';
import EmployeeSelector from './safety/EmployeeSelector';
import Settings from './safety/Settings';
import ToolboxTalkGenerator from './safety/ToolboxTalkGenerator';
import ToolboxTalkSignatureComponent from './safety/ToolboxTalkSignature';
import PDFViewer from './safety/PDFViewer';
import EquipmentChecklist from './safety/EquipmentChecklist';
import TrainingRecords from './safety/TrainingRecords';
import { getEquipmentById, getEquipmentList, EquipmentType } from './safety/equipmentChecklistData';

type ViewType = 'dashboard' | 'documents' | 'team' | 'submissions' | 'settings' | 'form' | 'details' | 'toolbox-generator' | 'pdf-view' | 'equipment-checklist' | 'toolbox-signature' | 'training-records';

const AppLayout: React.FC = () => {

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  

  // Data state
  const [documents, setDocuments] = useState<SafetyDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toolboxTalkSubmissions, setToolboxTalkSubmissions] = useState<ToolboxTalkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedDocument, setSelectedDocument] = useState<SafetyDocument | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [selectedToolboxTalkSubmission, setSelectedToolboxTalkSubmission] = useState<ToolboxTalkSubmission | null>(null);

  // Load toolbox talk submissions from localStorage
  const loadToolboxTalkSubmissions = useCallback(() => {
    const saved = localStorage.getItem('toolboxTalkSubmissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToolboxTalkSubmissions(parsed);
      } catch (e) {
        console.error('Error loading toolbox talk submissions:', e);
      }
    }
  }, []);

  // Save toolbox talk submissions to localStorage
  const saveToolboxTalkSubmissions = (submissions: ToolboxTalkSubmission[]) => {
    localStorage.setItem('toolboxTalkSubmissions', JSON.stringify(submissions));
    setToolboxTalkSubmissions(submissions);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('safety_documents')
        .select('*')
        .order('category', { ascending: true });
      
      if (docsError) throw docsError;
      setDocuments(docsData || []);

      // Fetch employees
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      
      if (empError) throw empError;
      setEmployees(empData || []);

      // Fetch submissions
      const { data: subData, error: subError } = await supabase
        .from('document_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subError) throw subError;
      setSubmissions(subData || []);

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!notifError && notifData) {
        setNotifications(notifData);
      }

      // Load toolbox talk submissions from localStorage
      loadToolboxTalkSubmissions();

      // Set default employee if available
      if (empData && empData.length > 0 && !selectedEmployee) {
        setSelectedEmployee(empData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate document counts by category (including equipment checklists)
  const documentCounts = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add equipment checklist count to Equipment category
  const equipmentList = getEquipmentList();
  documentCounts['Equipment'] = (documentCounts['Equipment'] || 0) + equipmentList.length;

  // Handlers
  const handleFillForm = (document: SafetyDocument) => {
    setSelectedDocument(document);
    if (!selectedEmployee) {
      setShowEmployeeSelector(true);
    } else {
      setCurrentView('form');
    }
  };

  const handleViewDetails = (document: SafetyDocument) => {
    setSelectedDocument(document);
    setCurrentView('details');
  };

  const handleViewPDF = (document: SafetyDocument, submission?: DocumentSubmission) => {
    setSelectedDocument(document);
    if (submission) {
      setSelectedSubmission(submission);
    }
    setCurrentView('pdf-view');
  };

  const handleOpenEquipmentChecklist = (equipmentId: string) => {
    const equipment = getEquipmentById(equipmentId);
    if (equipment) {
      setSelectedEquipment(equipment);
      setCurrentView('equipment-checklist');
    }
  };

  const handleEquipmentChecklistSubmit = async (data: any) => {
    if (!selectedEmployee) {
      alert('Please select an employee first');
      return;
    }

    try {
      // Create a virtual document ID for equipment checklists
      const virtualDocId = `equipment-checklist-${data.equipmentType}`;
      
      const { error } = await supabase
        .from('document_submissions')
        .insert({
          document_id: virtualDocId,
          employee_id: selectedEmployee.id,
          form_data: data,
          signature: data.projectInfo.inspectorName,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Daily expiry for pre-use checklists
          project_site: data.projectInfo.projectName,
          notes: `${data.equipmentName} Pre-Use Inspection - ${data.approvedForUse ? 'APPROVED' : 'NOT APPROVED'}`,
        });

      if (error) throw error;

      // Refresh submissions
      const { data: subData } = await supabase
        .from('document_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subData) {
        setSubmissions(subData);
      }
    } catch (error) {
      console.error('Error submitting equipment checklist:', error);
      throw error;
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>, signature: string) => {
    if (!selectedDocument || !selectedEmployee) return;

    try {
      const renewalDays = selectedDocument.renewal_period_days;
      const expiresAt = renewalDays 
        ? new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('document_submissions')
        .insert({
          document_id: selectedDocument.id,
          employee_id: selectedEmployee.id,
          form_data: formData,
          signature: signature,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          expires_at: expiresAt,
          project_site: formData.project_site || null,
        });

      if (error) throw error;

      // Refresh submissions
      const { data: subData } = await supabase
        .from('document_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subData) {
        setSubmissions(subData);
      }

      // Go back to documents view
      setCurrentView('documents');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setCurrentView(selectedDocument ? 'details' : 'documents');
    setSelectedDocument(null);
  };

  const handleNotificationRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeSelector(false);
    if (selectedDocument) {
      setCurrentView('form');
    }
  };

  const handleShareDocument = async (employee: Employee, document: SafetyDocument) => {
    // Create a notification for the employee
    try {
      await supabase
        .from('notifications')
        .insert({
          employee_id: employee.id,
          title: 'New Document Shared',
          message: `You have been assigned to complete: ${document.title}`,
          type: 'info',
          related_document_id: document.id,
        });

      alert(`Document "${document.title}" has been shared with ${employee.name}`);
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  // Handle sending toolbox talk to team
  const handleSendToolboxTalkToTeam = (
    talk: ToolboxTalk, 
    selectedEmployeeIds: string[], 
    projectSite: string, 
    presenterName: string
  ) => {
    const newSubmission: ToolboxTalkSubmission = {
      id: uuidv4(),
      toolbox_talk_id: uuidv4(),
      toolbox_talk_data: talk,
      created_by: selectedEmployee?.id || '',
      assigned_employees: selectedEmployeeIds,
      signatures: [],
      status: 'pending',
      project_site: projectSite || undefined,
      presenter_name: presenterName,
      conducted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const updatedSubmissions = [newSubmission, ...toolboxTalkSubmissions];
    saveToolboxTalkSubmissions(updatedSubmissions);

    // Create notifications for assigned employees
    selectedEmployeeIds.forEach(async (empId) => {
      const emp = employees.find(e => e.id === empId);
      if (emp) {
        try {
          await supabase
            .from('notifications')
            .insert({
              employee_id: empId,
              title: 'New Toolbox Talk',
              message: `You have been assigned to sign: ${talk.title}`,
              type: 'info',
            });
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
    });
  };

  // Handle viewing a toolbox talk submission
  const handleViewToolboxTalk = (submission: ToolboxTalkSubmission) => {
    setSelectedToolboxTalkSubmission(submission);
    setCurrentView('toolbox-signature');
  };

  // Handle signing a toolbox talk
  const handleSignToolboxTalk = (signature: string) => {
    if (!selectedToolboxTalkSubmission || !selectedEmployee) return;

    const newSignature = {
      employee_id: selectedEmployee.id,
      employee_name: selectedEmployee.name,
      signature: signature,
      signed_at: new Date().toISOString(),
    };

    const updatedSubmission = {
      ...selectedToolboxTalkSubmission,
      signatures: [...selectedToolboxTalkSubmission.signatures, newSignature],
      status: selectedToolboxTalkSubmission.signatures.length + 1 >= selectedToolboxTalkSubmission.assigned_employees.length
        ? 'completed' as const
        : 'in_progress' as const,
      updated_at: new Date().toISOString(),
    };

    const updatedSubmissions = toolboxTalkSubmissions.map(s => 
      s.id === selectedToolboxTalkSubmission.id ? updatedSubmission : s
    );

    saveToolboxTalkSubmissions(updatedSubmissions);
    setSelectedToolboxTalkSubmission(updatedSubmission);
  };

  // Handle submitting a completed toolbox talk
  const handleSubmitToolboxTalk = () => {
    if (!selectedToolboxTalkSubmission) return;

    const updatedSubmission = {
      ...selectedToolboxTalkSubmission,
      status: 'submitted' as const,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedSubmissions = toolboxTalkSubmissions.map(s => 
      s.id === selectedToolboxTalkSubmission.id ? updatedSubmission : s
    );

    saveToolboxTalkSubmissions(updatedSubmissions);
    setSelectedToolboxTalkSubmission(updatedSubmission);
    
    alert('Toolbox talk submitted successfully!');
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'form' && view !== 'details' && view !== 'pdf-view' && view !== 'equipment-checklist' && view !== 'toolbox-signature') {
      setSelectedDocument(null);
      setSelectedSubmission(null);
      setSelectedEquipment(null);
      setSelectedToolboxTalkSubmission(null);
    }
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Settings saved:', settings);
    // In a real app, this would save to the database
  };

  // Get toolbox talk submissions for current employee
  const getEmployeeToolboxTalkSubmissions = () => {
    if (!selectedEmployee) return [];
    return toolboxTalkSubmissions.filter(t => 
      t.assigned_employees.includes(selectedEmployee.id) || t.created_by === selectedEmployee.id
    );
  };

  // Handle saving document submission as PDF
  const handleSavePDF = (submission: DocumentSubmission) => {
    const isEquipment = submission.document_id.startsWith('equipment-checklist-');
    
    if (isEquipment) {
      generateEquipmentChecklistPDF(submission, selectedEmployee || undefined);
    } else {
      const doc = documents.find(d => d.id === submission.document_id);
      generateDocumentPDF(submission, doc, selectedEmployee || undefined);
    }
  };

  // Handle saving toolbox talk as PDF
  const handleSaveToolboxTalkPDF = (submission: ToolboxTalkSubmission) => {
    generateToolboxTalkPDF(submission, employees);
  };



  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-babyblue-500 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading safety documents...</p>
        </div>
      </div>
    );
  }

  // Render form view
  if (currentView === 'form' && selectedDocument) {
    return (
      <DocumentForm
        document={selectedDocument}
        employee={selectedEmployee}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        initialData={selectedSubmission?.form_data}
      />
    );
  }

  // Render PDF view
  if (currentView === 'pdf-view' && selectedDocument) {
    return (
      <PDFViewer
        document={selectedDocument}
        submission={selectedSubmission || undefined}
        employee={selectedEmployee || undefined}
        onBack={() => {
          setCurrentView('documents');
          setSelectedDocument(null);
          setSelectedSubmission(null);
        }}
      />
    );
  }

  // Render equipment checklist view
  if (currentView === 'equipment-checklist' && selectedEquipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 to-gold-50/30 p-4 lg:p-6">
        <EquipmentChecklist
          equipment={selectedEquipment}
          onBack={() => {
            setCurrentView('documents');
            setSelectedCategory('Equipment');
            setSelectedEquipment(null);
          }}
          onSubmit={handleEquipmentChecklistSubmit}
        />
      </div>
    );
  }

  // Render toolbox talk signature view
  if (currentView === 'toolbox-signature' && selectedToolboxTalkSubmission) {
    return (
      <ToolboxTalkSignatureComponent
        submission={selectedToolboxTalkSubmission}
        currentEmployee={selectedEmployee}
        employees={employees}
        onBack={() => {
          setCurrentView('submissions');
          setSelectedToolboxTalkSubmission(null);
        }}
        onSign={handleSignToolboxTalk}
        onSubmit={handleSubmitToolboxTalk}
      />
    );
  }

  // Render main layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 to-gold-50/30">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView === 'form' || currentView === 'details' || currentView === 'pdf-view' || currentView === 'equipment-checklist' || currentView === 'toolbox-signature' ? 'documents' : currentView}
          onViewChange={handleViewChange}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          documentCounts={documentCounts}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          {/* Header */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={notifications}
            onNotificationRead={handleNotificationRead}
            currentUser={selectedEmployee ? { name: selectedEmployee.name, role: selectedEmployee.role } : null}
          />

          {/* Content Area */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {currentView === 'dashboard' && (
              <Dashboard
                documents={documents}
                employees={employees}
                submissions={submissions}
                onFillForm={handleFillForm}
                onViewAllDocuments={() => setCurrentView('documents')}
                onViewTeam={() => setCurrentView('team')}
              />
            )}

            {currentView === 'documents' && (
              <DocumentLibrary
                documents={documents}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFillForm={handleFillForm}
                onViewDetails={handleViewDetails}
                onViewPDF={handleViewPDF}
                onOpenEquipmentChecklist={handleOpenEquipmentChecklist}
              />
            )}

            {currentView === 'details' && selectedDocument && (
              <DocumentDetails
                document={selectedDocument}
                onBack={() => setCurrentView('documents')}
                onFillForm={handleFillForm}
                onViewPDF={() => handleViewPDF(selectedDocument)}
              />
            )}

            {currentView === 'team' && (
              <TeamManagement
                employees={employees}
                submissions={submissions}
                documents={documents}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                  // Could navigate to employee detail view
                }}
                onShareDocument={handleShareDocument}
              />
            )}

            {currentView === 'submissions' && (
              <MySubmissions
                submissions={submissions.filter(s => s.employee_id === selectedEmployee?.id)}
                documents={documents}
                toolboxTalkSubmissions={getEmployeeToolboxTalkSubmissions()}
                onEditSubmission={(sub) => {
                  const doc = documents.find(d => d.id === sub.document_id);
                  if (doc) {
                    setSelectedDocument(doc);
                    setSelectedSubmission(sub);
                    setCurrentView('form');
                  }
                }}
                onViewSubmission={(sub) => {
                  const doc = documents.find(d => d.id === sub.document_id);
                  if (doc) {
                    handleViewPDF(doc, sub);
                  }
                }}
                onViewToolboxTalk={handleViewToolboxTalk}
                onSavePDF={handleSavePDF}
                onSaveToolboxTalkPDF={handleSaveToolboxTalkPDF}
              />
            )}

            {currentView === 'training-records' && (
              <TrainingRecords employees={employees} />
            )}

            {currentView === 'toolbox-generator' && (
              <ToolboxTalkGenerator
                employees={employees}
                currentEmployee={selectedEmployee}
                onSendToTeam={handleSendToolboxTalkToTeam}
              />
            )}

            {currentView === 'settings' && (
              <Settings onSave={handleSaveSettings} />
            )}

          </main>


          {/* Footer */}
          <footer className="bg-white border-t border-babyblue-200 py-4 px-6 print-hide">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/69715207e860303490f3d8ab_1769043905057_b034ee0f.png" 
                  alt="Kaiser Logo" 
                  className="w-8 h-8 rounded-lg shadow-sm object-cover"
                />
                <span className="text-navy-700">Kaiser - Canadian Construction Safety Platform</span>
              </div>
              <div className="flex items-center gap-4 text-navy-500">
                <span>OHSA Compliant</span>
                <span className="text-gold-400">•</span>
                <span>CSA Standards</span>
                <span className="text-gold-400">•</span>
                <span>WSIB Ready</span>
              </div>
            </div>
          </footer>

        </div>
      </div>

      {/* Employee Selector Modal */}
      <EmployeeSelector
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={handleSelectEmployee}
        isOpen={showEmployeeSelector}
        onClose={() => setShowEmployeeSelector(false)}
      />
    </div>
  );
};

export default AppLayout;
