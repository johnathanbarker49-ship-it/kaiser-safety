import React, { useState } from 'react';
import { Employee } from '@/types/safety';
import { SearchIcon, UserIcon, CheckIcon, XIcon } from './Icons';

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee) => void;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select Employee</h2>
            <p className="text-sm text-gray-500">Choose who is filling out this form</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    onSelectEmployee(employee);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedEmployee?.id === employee.id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-navy-500 to-navy-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{employee.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                    <p className="text-xs text-gray-400 capitalize mt-1">
                      {employee.role.replace('_', ' ')} • {employee.department}
                    </p>
                  </div>
                  {selectedEmployee?.id === employee.id && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelector;
