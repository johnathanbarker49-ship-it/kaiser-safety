import React, { useState, useMemo } from 'react';
import { Employee, DocumentSubmission, SafetyDocument } from '@/types/safety';
import { 
  SearchIcon, 
  UserIcon, 
  ChevronDownIcon, 
  CheckIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  PlusIcon,
  EditIcon,
  ShareIcon
} from './Icons';

interface TeamManagementProps {
  employees: Employee[];
  submissions: DocumentSubmission[];
  documents: SafetyDocument[];
  onSelectEmployee: (employee: Employee) => void;
  onShareDocument: (employee: Employee, document: SafetyDocument) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  employees,
  submissions,
  documents,
  onSelectEmployee,
  onShareDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const roles = useMemo(() => {
    const roleSet = new Set(employees.map(e => e.role).filter(Boolean));
    return Array.from(roleSet).sort((a, b) => (a || '').localeCompare(b || ''));
  }, [employees]);

  const departments = useMemo(() => {
    const deptSet = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(deptSet).sort((a, b) => (a || '').localeCompare(b || '')) as string[];
  }, [employees]);


  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name || '').toLowerCase().includes(query) ||
        (e.email || '').toLowerCase().includes(query) ||
        (e.department || '').toLowerCase().includes(query)
      );
    }


    if (filterRole) {
      filtered = filtered.filter(e => e.role === filterRole);
    }

    if (filterDepartment) {
      filtered = filtered.filter(e => e.department === filterDepartment);
    }

    return filtered;
  }, [employees, searchQuery, filterRole, filterDepartment]);

  const getEmployeeStats = (employeeId: string) => {
    const employeeSubmissions = submissions.filter(s => s.employee_id === employeeId);
    const completed = employeeSubmissions.filter(s => s.status === 'submitted').length;
    const pending = documents.filter(d => d.is_required).length - completed;
    const expiring = employeeSubmissions.filter(s => {
      if (!s.expires_at) return false;
      const expiryDate = new Date(s.expires_at);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;

    return { completed, pending: Math.max(0, pending), expiring };
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'supervisor':
        return 'bg-purple-100 text-purple-700';
      case 'safety_officer':
        return 'bg-green-100 text-green-700';
      case 'foreman':
        return 'bg-blue-100 text-blue-700';
      case 'admin':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleShareClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowShareModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500">
            {employees.length} team member{employees.length !== 1 ? 's' : ''} • Manage compliance and share documents
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
          <PlusIcon size={18} />
          Add Team Member
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={filterRole || ''}
              onChange={(e) => setFilterRole(e.target.value || null)}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={filterDepartment || ''}
              onChange={(e) => setFilterDepartment(e.target.value || null)}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Team Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const stats = getEmployeeStats(employee.id);
            return (
              <div
                key={employee.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5">
                  {/* Employee Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-navy-500 to-navy-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {(employee.name || '').split(' ').map(n => n[0] || '').join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{employee.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500 truncate">{employee.email || ''}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(employee.role || '')}`}>
                          {(employee.role || '').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Employee Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {employee.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Department</span>
                        <span className="text-gray-900 font-medium">{employee.department}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-gray-900">{employee.phone}</span>
                      </div>
                    )}
                    {employee.hire_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Hire Date</span>
                        <span className="text-gray-900">
                          {new Date(employee.hire_date).toLocaleDateString('en-CA')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Compliance Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <CheckIcon size={14} />
                        <span className="font-bold">{stats.completed}</span>
                      </div>
                      <span className="text-xs text-green-600">Completed</span>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                        <ClockIcon size={14} />
                        <span className="font-bold">{stats.pending}</span>
                      </div>
                      <span className="text-xs text-yellow-600">Pending</span>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <AlertTriangleIcon size={14} />
                        <span className="font-bold">{stats.expiring}</span>
                      </div>
                      <span className="text-xs text-red-600">Expiring</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectEmployee(employee)}
                      className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleShareClick(employee)}
                      className="p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Share Document"
                    >
                      <ShareIcon size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Document Modal */}
      {showShareModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Share Document with {selectedEmployee.name}
              </h2>
              <p className="text-sm text-gray-500">
                Select a document to share for completion
              </p>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onShareDocument(selectedEmployee, doc);
                      setShowShareModal(false);
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-500">{doc.category}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
