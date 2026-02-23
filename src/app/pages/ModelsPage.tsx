import { Link } from "react-router";
import { useUser } from "../components/UserContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SASelectionStrip } from "../components/SASelectionStrip";
import { Loader2 } from "lucide-react";

export function ModelsPage() {
  const { cars: carModels } = useUser();

  return (
    <div className="px-5 py-6">
      <h1 className="mb-1">Our Models</h1>
      <p className="text-muted-foreground mb-6">
        Explore our full lineup of 7 models
      </p>

      {/* SA Selection Strip */}
      <div className="mb-6">
        <SASelectionStrip compact label="Your Sales Advisor" />
      </div>

      {carModels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-accent/50 rounded-xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium">Loading models...</p>
          <p className="text-xs text-muted-foreground mt-1">Fetching latest data</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carModels.map((car) => (
            <Link
              key={car.id}
              to={`/models/${car.id}`}
              className="block bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <ImageWithFallback
                src={car.image}
                alt={car.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3>{car.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {car.priceRange}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {car.tagline}
                </p>
                <div className="mt-3">
                  <span className="bg-primary text-white px-4 py-2 rounded-xl text-sm inline-block">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}