import React, { useState, useMemo } from 'react';
import { SafetyDocument, DocumentSubmission, CATEGORY_COLORS, DocumentCategory } from '@/types/safety';
import DocumentCard from './DocumentCard';
import { SearchIcon, FilterIcon, ChevronDownIcon, getCategoryIcon, FileTextIcon, ClipboardListIcon, PrinterIcon, ChevronRightIcon } from './Icons';
import { getEquipmentList } from './equipmentChecklistData';

interface DocumentLibraryProps {
  documents: SafetyDocument[];
  selectedCategory: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFillForm: (document: SafetyDocument) => void;
  onViewDetails: (document: SafetyDocument) => void;
  onViewPDF?: (document: SafetyDocument, submission?: DocumentSubmission) => void;
  onOpenEquipmentChecklist?: (equipmentId: string) => void;
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onFillForm,
  onViewDetails,
  onViewPDF,
  onOpenEquipmentChecklist,
}) => {

  const [sortBy, setSortBy] = useState<'title' | 'category' | 'required'>('category');
  const [showFilters, setShowFilters] = useState(false);
  const [filterRequired, setFilterRequired] = useState<boolean | null>(null);
  const [filterRenewal, setFilterRenewal] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(documents.map(d => d.category).filter(Boolean));
    return Array.from(cats).sort((a, b) => (a || '').localeCompare(b || ''));
  }, [documents]);

  // Get equipment checklists
  const equipmentChecklists = getEquipmentList();

  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        (d.title || '').toLowerCase().includes(query) ||
        (d.description || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query)
      );
    }

    // Filter by required
    if (filterRequired !== null) {
      filtered = filtered.filter(d => d.is_required === filterRequired);
    }

    // Filter by renewal period
    if (filterRenewal) {
      switch (filterRenewal) {
        case 'daily':
          filtered = filtered.filter(d => d.renewal_period_days === 1);
          break;
        case 'weekly':
          filtered = filtered.filter(d => d.renewal_period_days === 7);
          break;
        case 'monthly':
          filtered = filtered.filter(d => d.renewal_period_days && d.renewal_period_days <= 31 && d.renewal_period_days > 7);
          break;
        case 'annual':
          filtered = filtered.filter(d => d.renewal_period_days && d.renewal_period_days >= 365);
          break;
        case 'none':
          filtered = filtered.filter(d => !d.renewal_period_days);
          break;
      }
    }

    // Sort with null safety
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'category':
        filtered.sort((a, b) => {
          const catCompare = (a.category || '').localeCompare(b.category || '');
          if (catCompare !== 0) return catCompare;
          return (a.title || '').localeCompare(b.title || '');
        });
        break;
      case 'required':
        filtered.sort((a, b) => (b.is_required ? 1 : 0) - (a.is_required ? 1 : 0));
        break;
    }

    return filtered;
  }, [documents, selectedCategory, searchQuery, filterRequired, filterRenewal, sortBy]);

  // Filter equipment checklists by search
  const filteredEquipmentChecklists = useMemo(() => {
    if (!searchQuery) return equipmentChecklists;
    const query = searchQuery.toLowerCase();
    return equipmentChecklists.filter(eq =>
      eq.name.toLowerCase().includes(query) ||
      eq.description.toLowerCase().includes(query) ||
      eq.standard.toLowerCase().includes(query)
    );
  }, [equipmentChecklists, searchQuery]);

  const clearFilters = () => {
    setFilterRequired(null);
    setFilterRenewal(null);
    onSearchChange('');
  };

  const hasActiveFilters = filterRequired !== null || filterRenewal !== null || searchQuery;

  // Check if we should show equipment checklists
  const showEquipmentChecklists = selectedCategory === 'Equipment' || (!selectedCategory && !searchQuery);
  const isEquipmentCategory = selectedCategory === 'Equipment';

  // Equipment icon mapping
  const getEquipmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'swing-stage':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 5v14M20 5v14M4 19h16M8 9h8M8 13h8" />
          </svg>
        );
      case 'scissor-lift':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M6 16h12M8 12h8M10 8h4M11 4h2" />
          </svg>
        );
      case 'boom-lift':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h4M8 20v-4M8 16l8-8M16 8h4v4" />
          </svg>
        );
      case 'forklift':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16h12M4 16v-4h8v4M16 16v-8h4v8M8 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'ladder':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v16M16 4v16M8 8h8M8 12h8M8 16h8" />
          </svg>
        );
      case 'scaffold':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16M20 4v16M4 8h16M4 12h16M4 16h16M8 4v4M16 4v4M8 12v4M16 12v4" />
          </svg>
        );
      case 'excavator':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h8M4 16h4v4M8 16l4-4M12 12l4-6M16 6h4v4M6 20a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'telehandler':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16h12M4 16v-4h8v4M16 16l4-8v8M6 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'crane':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h4M6 20V8M6 8l10-4M16 4v8M16 12l-4 4M12 16v4M16 12h4" />
          </svg>
        );
      case 'skid-steer':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h12v4H4zM16 14v4h4v-4zM6 18a2 2 0 100-4 2 2 0 000 4zM14 18a2 2 0 100-4 2 2 0 000 4zM4 14V8h8v6M12 8l4-4h4v10" />
          </svg>
        );
      default:
        return <ClipboardListIcon size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            {selectedCategory || 'All Documents'}
          </h1>
          <p className="text-gray-500">
            {isEquipmentCategory 
              ? `${filteredEquipmentChecklists.length} pre-use checklist${filteredEquipmentChecklists.length !== 1 ? 's' : ''} available`
              : `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 's' : ''} available`
            }
          </p>

        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-babyblue-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none px-4 py-2.5 pr-10 border border-babyblue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-babyblue-500 bg-white"
            >
              <option value="category">Sort by Category</option>
              <option value="title">Sort by Title</option>
              <option value="required">Sort by Required</option>
            </select>
            <ChevronDownIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-gold-500 bg-gold-50 text-gold-700'
                : 'border-babyblue-200 hover:border-babyblue-300'
            }`}
          >
            <FilterIcon size={18} />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-babyblue-100">
            <div className="flex flex-wrap gap-4">
              {/* Required Filter */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Required Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterRequired(filterRequired === true ? null : true)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      filterRequired === true
                        ? 'border-gold-500 bg-gold-50 text-gold-700'
                        : 'border-babyblue-200 hover:border-babyblue-300'
                    }`}
                  >
                    Required
                  </button>
                  <button
                    onClick={() => setFilterRequired(filterRequired === false ? null : false)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      filterRequired === false
                        ? 'border-gold-500 bg-gold-50 text-gold-700'
                        : 'border-babyblue-200 hover:border-babyblue-300'
                    }`}
                  >
                    Optional
                  </button>
                </div>
              </div>

              {/* Renewal Period Filter */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Renewal Period
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'annual', label: 'Annual' },
                    { value: 'none', label: 'One-time' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterRenewal(filterRenewal === option.value ? null : option.value)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        filterRenewal === option.value
                          ? 'border-gold-500 bg-gold-50 text-gold-700'
                          : 'border-babyblue-200 hover:border-babyblue-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Pills (when no category selected) */}
      {!selectedCategory && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            const colorClass = CATEGORY_COLORS[category as DocumentCategory] || 'bg-gray-500';
            const count = documents.filter(d => d.category === category).length;
            return (
              <button
                key={category}
                onClick={() => onSearchChange('')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-babyblue-100 rounded-lg hover:border-gold-300 hover:shadow-sm transition-all"
              >
                <div className={`w-6 h-6 ${colorClass} rounded flex items-center justify-center`}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-navy-700">{category}</span>
                <span className="text-xs text-gray-400 bg-babyblue-50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Equipment Pre-Use Checklists Section */}
      {isEquipmentCategory && filteredEquipmentChecklists.length > 0 && (
        <div className="space-y-6">
          {/* Swing Stage Section */}
          {filteredEquipmentChecklists.filter(eq => eq.id === 'swing-stage').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-500 rounded-lg flex items-center justify-center">
                  <ClipboardListIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">Swing Stage</h2>
                  <p className="text-sm text-gray-500">Suspended scaffold pre-use inspection checklist</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipmentChecklists.filter(eq => eq.id === 'swing-stage').map((equipment) => (
                  <div
                    key={equipment.id}
                    onClick={() => onOpenEquipmentChecklist?.(equipment.id)}
                    className="bg-white rounded-xl border border-babyblue-100 p-4 hover:border-gold-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-babyblue-100 to-babyblue-200 rounded-lg flex items-center justify-center text-babyblue-600 group-hover:from-gold-100 group-hover:to-gold-200 group-hover:text-gold-600 transition-all">
                        {getEquipmentIcon(equipment.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 group-hover:text-gold-700 transition-colors">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{equipment.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-babyblue-50 text-babyblue-700 px-2 py-0.5 rounded-full font-medium">
                            {equipment.standard}
                          </span>
                          <span className="text-xs text-gray-400">
                            {equipment.sectionCount} sections • {equipment.itemCount} items
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <PrinterIcon size={14} />
                        Print-ready format
                      </span>
                      <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                        Pre-Use
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elevated Work Platforms Section */}
          {filteredEquipmentChecklists.filter(eq => eq.id === 'scissor-lift' || eq.id === 'boom-lift').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-babyblue-400 to-babyblue-500 rounded-lg flex items-center justify-center">
                  <ClipboardListIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">Elevated Work Platforms</h2>
                  <p className="text-sm text-gray-500">Mobile elevating work platform pre-use inspection checklists</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipmentChecklists.filter(eq => eq.id === 'scissor-lift' || eq.id === 'boom-lift').map((equipment) => (
                  <div
                    key={equipment.id}
                    onClick={() => onOpenEquipmentChecklist?.(equipment.id)}
                    className="bg-white rounded-xl border border-babyblue-100 p-4 hover:border-gold-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-babyblue-100 to-babyblue-200 rounded-lg flex items-center justify-center text-babyblue-600 group-hover:from-gold-100 group-hover:to-gold-200 group-hover:text-gold-600 transition-all">
                        {getEquipmentIcon(equipment.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 group-hover:text-gold-700 transition-colors">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{equipment.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-babyblue-50 text-babyblue-700 px-2 py-0.5 rounded-full font-medium">
                            {equipment.standard}
                          </span>
                          <span className="text-xs text-gray-400">
                            {equipment.sectionCount} sections • {equipment.itemCount} items
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <PrinterIcon size={14} />
                        Print-ready format
                      </span>
                      <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                        Pre-Use
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Equipment Section */}
          {filteredEquipmentChecklists.filter(eq => !['swing-stage', 'scissor-lift', 'boom-lift'].includes(eq.id)).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-navy-400 to-navy-500 rounded-lg flex items-center justify-center">
                  <ClipboardListIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">Other Equipment</h2>
                  <p className="text-sm text-gray-500">Additional equipment pre-use inspection checklists</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipmentChecklists.filter(eq => !['swing-stage', 'scissor-lift', 'boom-lift'].includes(eq.id)).map((equipment) => (
                  <div
                    key={equipment.id}
                    onClick={() => onOpenEquipmentChecklist?.(equipment.id)}
                    className="bg-white rounded-xl border border-babyblue-100 p-4 hover:border-gold-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-babyblue-100 to-babyblue-200 rounded-lg flex items-center justify-center text-babyblue-600 group-hover:from-gold-100 group-hover:to-gold-200 group-hover:text-gold-600 transition-all">
                        {getEquipmentIcon(equipment.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 group-hover:text-gold-700 transition-colors">
                          {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{equipment.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-babyblue-50 text-babyblue-700 px-2 py-0.5 rounded-full font-medium">
                            {equipment.standard}
                          </span>
                          <span className="text-xs text-gray-400">
                            {equipment.sectionCount} sections • {equipment.itemCount} items
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon size={20} className="text-gray-300 group-hover:text-gold-500 transition-colors" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <PrinterIcon size={14} />
                        Print-ready format
                      </span>
                      <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                        Pre-Use
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Documents Grid - Don't show for Equipment category */}
      {!isEquipmentCategory && (
        <>
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-xl border border-babyblue-100 p-12 text-center">
              <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={24} className="text-babyblue-500" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onFillForm={onFillForm}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state for Equipment category when no checklists found */}
      {isEquipmentCategory && filteredEquipmentChecklists.length === 0 && (
        <div className="bg-white rounded-xl border border-babyblue-100 p-12 text-center">
          <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon size={24} className="text-babyblue-500" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No equipment checklists found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria
          </p>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default DocumentLibrary;
