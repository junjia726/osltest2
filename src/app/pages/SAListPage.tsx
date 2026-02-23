import { Link } from "react-router";
import { ArrowRight, Star, MapPin, Search, Loader2, Heart } from "lucide-react";
import { useUser } from "../components/UserContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { toast } from "sonner";

export function SAListPage() {
  const { salesAdvisors, selectSA, selectedSAId, profile, toggleFollow, isLoggedIn } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleFollow = async (saId: string) => {
      if (!isLoggedIn) {
          toast.error("Please login to follow SAs");
          return;
      }
      setLoading(saId);
      try {
          await toggleFollow(saId);
          toast.success(profile.following?.includes(saId) ? "Unfollowed" : "Followed");
      } catch {
          toast.error("Action failed");
      } finally {
          setLoading(null);
      }
  };

  const filteredSAs = salesAdvisors.filter((sa) => {
    const term = searchTerm.toLowerCase();
    return (
      sa.name.toLowerCase().includes(term) ||
      sa.region.toLowerCase().includes(term) ||
      sa.branch.toLowerCase().includes(term)
    );
  });

  return (
    <div className="px-5 py-6 pb-24">
      <h1 className="mb-1">Find Sales Advisor</h1>
      <p className="text-muted-foreground mb-6">
        Connect with our trusted advisors
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, region, or branch"
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {salesAdvisors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-accent/50 rounded-xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium">Loading advisors...</p>
          <p className="text-xs text-muted-foreground mt-1">Checking availability</p>
        </div>
      ) : filteredSAs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-accent rounded-xl">
          <p>No advisors found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSAs.map((sa) => {
            const isSelected = selectedSAId === sa.sa_id;
            return (
              <div
                key={sa.sa_id}
                className={`bg-white rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary ring-1 ring-primary shadow-sm"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={sa.avatar}
                    alt={sa.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate pr-2">
                        {sa.name}
                      </h3>
                      {sa.rating > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] text-amber-600 font-medium shrink-0">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {sa.rating}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{sa.region}</span>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      {sa.branch}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/sa/${sa.sa_id}`}
                    className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 rounded-lg text-xs font-medium transition-colors text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleFollow(sa.sa_id)}
                    disabled={loading === sa.sa_id}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
                      profile.following?.includes(sa.sa_id)
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-white text-muted-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {loading === sa.sa_id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Heart className={`w-3.5 h-3.5 ${profile.following?.includes(sa.sa_id) ? "fill-current" : ""}`} />
                    )}
                  </button>
                  {!isSelected ? (
                    <button
                      onClick={() => selectSA(sa.sa_id)}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      Select
                    </button>
                  ) : (
                    <div className="flex-1 bg-primary/10 text-primary py-2 rounded-lg text-xs font-medium text-center border border-primary/20">
                      Selected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}