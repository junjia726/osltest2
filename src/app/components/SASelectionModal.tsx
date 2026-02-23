import { useState, useMemo } from "react";
import { useUser } from "./UserContext";
import { useRealtime } from "./RealtimeContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  X,
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Award,
  Check,
} from "lucide-react";
import type { SalesAdvisor } from "../lib/api";

interface SASelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (sa: SalesAdvisor) => void;
}

const ratingOptions = [
  { label: "All", value: 0 },
  { label: "4.5+", value: 4.5 },
  { label: "4.7+", value: 4.7 },
  { label: "4.9+", value: 4.9 },
  { label: "5.0", value: 5.0 },
];

export function SASelectionModal({
  isOpen,
  onClose,
  onSelect,
}: SASelectionModalProps) {
  const { selectedSAId, selectSA, profile, salesAdvisors } = useUser();
  const { getAverageRating } = useRealtime();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState(profile.region || "");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique SA states for region filter
  const saStates = useMemo(() => {
    return [...new Set(salesAdvisors.map((sa) => sa.state))].filter(Boolean);
  }, [salesAdvisors]);

  const filtered = useMemo(() => {
    let results = [...salesAdvisors];

    // Name search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(
        (sa) =>
          sa.name.toLowerCase().includes(q) ||
          sa.city.toLowerCase().includes(q) ||
          sa.state.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (filterRegion) {
      results = results.filter((sa) => sa.state === filterRegion);
    }

    // Rating filter
    if (minRating > 0) {
      results = results.filter((sa) => (sa.rating || 0) >= minRating);
    }

    // Sort by rating descending
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return results;
  }, [searchQuery, filterRegion, minRating, salesAdvisors]);

  const activeFilterCount =
    (filterRegion ? 1 : 0) + (minRating > 0 ? 1 : 0);

  if (!isOpen) return null;

  const handleSelect = (sa: SalesAdvisor) => {
    selectSA(sa.sa_id);
    onSelect?.(sa);
    onClose();
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRegion("");
    setMinRating(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3>Select Your Sales Advisor</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose an SA to assist you
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, or state..."
              className="w-full bg-accent pl-9 pr-10 py-2.5 rounded-xl border border-border text-sm focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
            />
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-primary text-white"
                  : "bg-transparent text-muted-foreground hover:bg-border"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center border-2 border-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="px-5 pb-3 space-y-3 border-b border-border">
            {/* Region Filter */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Region
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setFilterRegion("")}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                    filterRegion === ""
                      ? "bg-primary text-white"
                      : "bg-accent text-foreground hover:bg-border"
                  }`}
                >
                  All
                </button>
                {saStates.map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      setFilterRegion(filterRegion === r ? "" : r)
                    }
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                      filterRegion === r
                        ? "bg-primary text-white"
                        : "bg-accent text-foreground hover:bg-border"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Minimum Rating
              </p>
              <div className="flex gap-1.5">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMinRating(opt.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
                      minRating === opt.value
                        ? "bg-primary text-white"
                        : "bg-accent text-foreground hover:bg-border"
                    }`}
                  >
                    {opt.value > 0 && (
                      <Star className="w-3 h-3 fill-current" />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="px-5 py-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} advisor{filtered.length !== 1 ? "s" : ""} found
          </p>
          {activeFilterCount > 0 && !showFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* SA List */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No advisors match your search.
              </p>
              <button
                onClick={clearAllFilters}
                className="text-primary text-sm mt-2"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((sa) => {
              const isSelected = selectedSAId === sa.sa_id;
              return (
                <button
                  key={sa.sa_id}
                  onClick={() => handleSelect(sa)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ImageWithFallback
                      src={sa.avatar}
                      alt={sa.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 w-full">
                        <p className="text-sm font-semibold truncate flex-1 min-w-0 text-gray-900">{sa.name}</p>
                        {sa.badge && (
                          <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Award className="w-3 h-3" />
                            {sa.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{sa.city}, {sa.state}</span>
                        </div>
                      </div>
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const displayRating = sa.rating || 0;
                            return (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= Math.round(displayRating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200 fill-gray-200"
                              }`}
                            />
                          );})}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {sa.rating || 0} ({sa.reviewCount || 0})
                        </span>
                      </div>
                      {/* Bio / Description */}
                      <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {sa.bio}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}