import React, { useState } from 'react';
import { 
  BuildingIcon, 
  UsersIcon, 
  BellIcon, 
  DocumentIcon,
  CheckIcon,
  ChevronRightIcon
} from './Icons';

interface SettingsProps {
  onSave: (settings: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSave }) => {
  const [companyName, setCompanyName] = useState('SafeBuild Construction');
  const [companyEmail, setCompanyEmail] = useState('admin@safebuild.ca');
  const [notifyExpiring, setNotifyExpiring] = useState(true);
  const [notifyDays, setNotifyDays] = useState(7);
  const [autoReminders, setAutoReminders] = useState(true);
  const [requireSignature, setRequireSignature] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      companyName,
      companyEmail,
      notifyExpiring,
      notifyDays,
      autoReminders,
      requireSignature,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingsSections = [
    {
      id: 'company',
      title: 'Company Information',
      icon: BuildingIcon,
      description: 'Manage your company details and branding',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      description: 'Configure alerts and reminder settings',
    },
    {
      id: 'documents',
      title: 'Document Settings',
      icon: DocumentIcon,
      description: 'Customize document requirements and defaults',
    },
    {
      id: 'team',
      title: 'Team Settings',
      icon: UsersIcon,
      description: 'Manage roles and permissions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your safety compliance platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Settings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{section.description}</p>
                    </div>
                    <ChevronRightIcon size={18} className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Expiring Document Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified when documents are about to expire</p>
                </div>
                <button
                  onClick={() => setNotifyExpiring(!notifyExpiring)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifyExpiring ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifyExpiring ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {notifyExpiring && (
                <div className="ml-0 pl-0 border-l-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days before expiry to notify
                  </label>
                  <select
                    value={notifyDays}
                    onChange={(e) => setNotifyDays(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Automatic Reminders</h3>
                  <p className="text-sm text-gray-500">Send automatic reminders for pending documents</p>
                </div>
                <button
                  onClick={() => setAutoReminders(!autoReminders)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoReminders ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoReminders ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Document Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Document Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Require Digital Signature</h3>
                  <p className="text-sm text-gray-500">All documents must be signed before submission</p>
                </div>
                <button
                  onClick={() => setRequireSignature(!requireSignature)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    requireSignature ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      requireSignature ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckIcon size={18} />
                <span className="text-sm font-medium">Settings saved!</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
