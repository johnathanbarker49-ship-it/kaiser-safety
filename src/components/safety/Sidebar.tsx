import React from 'react';
import { 
  HomeIcon, 
  DocumentIcon, 
  UsersIcon, 
  CalendarIcon, 
  SettingsIcon,
  XIcon,
  getCategoryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingIcon,
  SparklesIcon,
  GraduationCapIcon,
} from './Icons';
import { DocumentCategory, CATEGORY_COLORS } from '@/types/safety';

type ViewType = 'dashboard' | 'documents' | 'team' | 'submissions' | 'settings' | 'toolbox-generator' | 'training-records';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  documentCounts: Record<string, number>;
}

const categories: DocumentCategory[] = [
  'Fall Protection',
  'WHMIS',
  'Hazard Assessment',
  'Emergency Response',
  'Toolbox Talks',
  'JHSC',
  'Permits',
  'Equipment',
  'PPE',
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  selectedCategory,
  onCategorySelect,
  documentCounts,
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(true);

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: HomeIcon },
    { id: 'documents' as ViewType, label: 'Documents', icon: DocumentIcon },
    { id: 'toolbox-generator' as ViewType, label: 'Toolbox Talks', icon: SparklesIcon, highlight: true, badge: 'AI' },
    { id: 'training-records' as ViewType, label: 'Training Records', icon: GraduationCapIcon },
    { id: 'team' as ViewType, label: 'Team', icon: UsersIcon },
    { id: 'submissions' as ViewType, label: 'My Submissions', icon: CalendarIcon },
  ];

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    if (view !== 'documents') {
      onCategorySelect(null);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };



  const handleCategoryClick = (category: string) => {
    onCategorySelect(selectedCategory === category ? null : category);
    onViewChange('documents');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print-hide"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-babyblue-200 transform transition-transform duration-300 ease-in-out lg:transform-none print-hide ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-babyblue-200">
            <div className="flex items-center gap-3">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/69715207e860303490f3d8ab_1769043905057_b034ee0f.png" 
                alt="Kaiser Logo" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-lg font-bold text-navy-900">Kaiser</h1>
                <p className="text-xs text-gray-500">Construction Safety</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-babyblue-50 transition-colors"
            >
              <XIcon size={20} className="text-gray-600" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-babyblue-100 text-babyblue-700'
                        : item.highlight
                        ? 'text-gold-700 hover:bg-gold-50 hover:text-gold-800'
                        : 'text-gray-600 hover:bg-babyblue-50 hover:text-navy-900'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-babyblue-600' : item.highlight ? 'text-gold-500' : ''} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                        item.badge === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-gold-100 text-gold-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

            </div>

            {/* Document Categories */}
            <div className="mt-6">
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                <span>Categories</span>
                {categoriesExpanded ? (
                  <ChevronDownIcon size={16} />
                ) : (
                  <ChevronRightIcon size={16} />
                )}
              </button>

              {categoriesExpanded && (
                <div className="mt-2 space-y-1">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category);
                    const isActive = selectedCategory === category;
                    const count = documentCounts[category] || 0;
                    const colorClass = CATEGORY_COLORS[category];

                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-babyblue-100 text-navy-900'
                            : 'text-gray-600 hover:bg-babyblue-50 hover:text-navy-900'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClass}`}>
                          <Icon size={14} className="text-white" />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium truncate">
                          {category}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-babyblue-200">
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                currentView === 'settings'
                  ? 'bg-babyblue-100 text-babyblue-700'
                  : 'text-gray-600 hover:bg-babyblue-50 hover:text-navy-900'
              }`}
            >
              <SettingsIcon size={20} />
              <span className="font-medium text-sm">Settings</span>
            </button>

            {/* Company Info */}
            <div className="mt-4 p-3 bg-gradient-to-br from-babyblue-50 to-gold-50 rounded-lg border border-babyblue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-babyblue-500 to-babyblue-600 rounded-lg flex items-center justify-center">
                  <BuildingIcon size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">
                    SafeBuild Construction
                  </p>
                  <p className="text-xs text-gray-500">8 team members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
