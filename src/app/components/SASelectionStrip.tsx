import { useState } from "react";
import { Check, Award, MapPin, ChevronRight, Star } from "lucide-react";
import { useUser } from "./UserContext";
import { useRealtime } from "./RealtimeContext";
import { SASelectionModal } from "./SASelectionModal";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SASelectionStripProps {
  compact?: boolean;
  label?: string;
}

export function SASelectionStrip({
  compact = false,
  label = "Your Sales Advisor",
}: SASelectionStripProps) {
  const { selectedSAId, selectedSA, selectSA, salesAdvisors } = useUser();
  const { getAverageRating } = useRealtime();
  const [showModal, setShowModal] = useState(false);

  // If SA is already selected, show selected card
  if (selectedSA) {
    return (
      <>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-primary flex items-center gap-0.5"
            >
              Change
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={selectedSA.avatar}
              alt={selectedSA.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{selectedSA.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {selectedSA.city}
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <SASelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Show horizontal scrollable strip
  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-accent rounded-xl p-4 text-center hover:bg-border transition-colors"
        >
          <p className="text-sm text-muted-foreground">
            No Sales Advisor selected
          </p>
          <p className="text-primary text-sm mt-1">Tap to select one</p>
        </button>
        <SASelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-primary flex items-center gap-0.5"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {salesAdvisors.map((sa) => {
            const isSelected = selectedSAId === sa.sa_id;
            return (
              <button
                key={sa.sa_id}
                onClick={() => selectSA(sa.sa_id)}
                className={`flex-shrink-0 w-[140px] text-center p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <ImageWithFallback
                  src={sa.avatar}
                  alt={sa.name}
                  className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                />
                <p className="text-xs truncate">{sa.name}</p>
                <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {sa.state}
                </div>
                {/* Rating */}
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-muted-foreground">
                    {(() => {
                      // Use backend rating if available, else fallback
                      const lr = getAverageRating(sa.sa_id);
                      return lr.count > 0 ? lr.avg : (sa.rating || 0);
                    })()}
                  </span>
                </div>
                {sa.badge && (
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-primary mt-1">
                    <Award className="w-2.5 h-2.5" />
                    <span className="truncate">{sa.badge}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <SASelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}