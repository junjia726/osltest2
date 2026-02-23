import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Settings, Calculator, MessageCircle } from "lucide-react";
import { useUser } from "../components/UserContext";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SASelectionStrip } from "../components/SASelectionStrip";
import { WhatsAppFAB } from "../components/WhatsAppFAB";

export function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cars: carModels } = useUser();
  const car = carModels.find((c) => c.id === id);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // Reset selected variant when car changes
  useEffect(() => {
    setSelectedVariant(0);
  }, [id]);

  if (!car) {
    return (
      <div className="px-5 py-12 text-center">
        <h2>Model not found</h2>
        <Link to="/models" className="text-primary mt-4 inline-block">
          Back to Models
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <ImageWithFallback
          src={car.image}
          alt={car.name}
          className="w-full h-64 object-cover"
        />
      </div>

      {/* Info */}
      <div className="px-5 py-6">
        <h1>{car.name}</h1>
        <p className="text-muted-foreground mt-1">{car.tagline}</p>
        <p className="text-primary mt-2">{car.priceRange}</p>

        {/* Variant Selector */}
        <div className="mt-6">
          <h4 className="mb-3">Select Variant</h4>
          <div className="flex flex-wrap gap-2">
            {car.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(i)}
                className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                  selectedVariant === i
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary/50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <div className="mt-3 bg-accent rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Selected price</p>
            <p className="text-xl text-foreground">
              RM {car.variants[selectedVariant].price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* SA Selection */}
        <div className="mt-6">
          <SASelectionStrip label="Select Sales Advisor" />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            to={`/configurator/${car.id}`}
            className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
          >
            <Settings className="w-5 h-5" />
            Configure This Car
          </Link>
          <Link
            to={`/calculator?price=${car.variants[selectedVariant].price}`}
            className="flex items-center justify-center gap-2 w-full bg-secondary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
          >
            <Calculator className="w-5 h-5" />
            Calculate Loan
          </Link>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <WhatsAppFAB
        configData={{
          modelName: car.name,
          variantName: car.variants[selectedVariant].name,
          totalPrice: car.variants[selectedVariant].price,
        }}
      />
    </div>
  );
}
