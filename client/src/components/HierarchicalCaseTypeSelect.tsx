import { useState, useRef, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseType {
  id: number;
  value: string;
  label: string;
  labelEs: string | null;
  description: string;
  descriptionEs: string | null;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

interface HierarchicalCaseTypeSelectProps {
  caseTypes: CaseType[];
  value: string;
  onValueChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  isSpanish?: boolean;
}

export default function HierarchicalCaseTypeSelect({
  caseTypes,
  value,
  onValueChange,
  loading,
  placeholder = "Choose case type...",
  isSpanish = false
}: HierarchicalCaseTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Spanish category translations
  const getCategoryLabel = (category: string) => {
    if (!isSpanish) return category;
    
    const translations: { [key: string]: string } = {
      'Family-Based Immigration': 'Visa de Inmigrante Basada en Familia',
      'Family-Based Immigrant Visa': 'Visa de Inmigrante Basada en Familia',
      'Fiancé Visa': 'Visa K-1 de Prometido(a)',
      'K-1 Fiancé(e) Visa': 'Visa K-1 de Prometido(a)',
      'Citizenship & Naturalization': 'Ciudadanía y Naturalización',
      'Asylum': 'Asilo',
      'Deportation Defense': 'Defensa de Deportación',
      'Deportation Defense / Removal Proceedings': 'Defensa de Deportación',
      'Violence Against Women Act': 'Ley de Violencia Contra las Mujeres (VAWA)',
      'Violence Against Women Act (VAWA)': 'Ley de Violencia Contra las Mujeres (VAWA)',
      'Other': 'Otro'
    };
    
    return translations[category] || category;
  };

  // Group case types by category
  const groupedCaseTypes = caseTypes.reduce((acc: any, caseType: CaseType) => {
    const category = caseType.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(caseType);
    return acc;
  }, {});

  // Sort categories and case types by displayOrder
  const sortedCategories = Object.keys(groupedCaseTypes).sort((a, b) => {
    const aMinOrder = Math.min(...groupedCaseTypes[a].map((ct: CaseType) => ct.displayOrder));
    const bMinOrder = Math.min(...groupedCaseTypes[b].map((ct: CaseType) => ct.displayOrder));
    return aMinOrder - bMinOrder;
  });

  // Sort case types within each category
  Object.keys(groupedCaseTypes).forEach(category => {
    groupedCaseTypes[category].sort((a: CaseType, b: CaseType) => a.displayOrder - b.displayOrder);
  });

  // Get the label for the selected value
  const selectedCaseType = caseTypes.find(ct => ct.value === value);
  const selectedLabel = selectedCaseType ? 
    (isSpanish && selectedCaseType.labelEs ? selectedCaseType.labelEs : selectedCaseType.label) : 
    placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryHover = (category: string) => {
    setActiveCategory(category);
  };

  const handleCaseTypeSelect = (caseTypeValue: string) => {
    onValueChange(caseTypeValue);
    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
        disabled={loading}
      >
        <span className="truncate">{loading ? "Loading..." : selectedLabel}</span>
        <ChevronRight className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-90")} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 flex rounded-md border bg-popover text-popover-foreground shadow-lg">
          {/* Categories List */}
          <div className="min-w-[280px] max-h-80 overflow-y-auto border-r">
            <div className="p-1">
              {sortedCategories.map((category) => (
                <div
                  key={category}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                    activeCategory === category && "bg-accent text-accent-foreground"
                  )}
                  onMouseEnter={() => handleCategoryHover(category)}
                >
                  <span className="font-medium">{getCategoryLabel(category)}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories List */}
          {activeCategory && (
            <div className="min-w-[320px] max-h-80 overflow-y-auto">
              <div className="p-1">
                {groupedCaseTypes[activeCategory].map((caseType: CaseType) => (
                  <div
                    key={caseType.id}
                    className={cn(
                      "flex items-start px-3 py-3 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                      value === caseType.value && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleCaseTypeSelect(caseType.value)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isSpanish && caseType.labelEs ? caseType.labelEs : caseType.label}
                        </span>
                        {value === caseType.value && <Check className="h-4 w-4" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {isSpanish && caseType.descriptionEs ? caseType.descriptionEs : caseType.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}