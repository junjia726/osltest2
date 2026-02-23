import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useUser } from "../components/UserContext";
import { useRealtime } from "../components/RealtimeContext";
import { generateWhatsAppMessage } from "../data/user";
import { toast } from "sonner";
import { SASelectionModal } from "../components/SASelectionModal";

export function ConfiguratorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, profile, saveConfiguration, selectedSA, cars: carModels } = useUser();
  const { addTransaction } = useRealtime();
  const car = carModels.find((c) => c.id === id);

  const [step, setStep] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showSAModal, setShowSAModal] = useState(false);

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

  const toggleAccessory = (id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const accessoryTotal = car.accessories
    .filter((a) => selectedAccessories.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const totalPrice = car.variants[selectedVariant].price + accessoryTotal;

  const accessoryNames = car.accessories
    .filter((a) => selectedAccessories.includes(a.id))
    .map((a) => a.name);

  const handleSendToSA = () => {
    if (!selectedSA) {
      setShowSAModal(true);
      return;
    }

    // Record transaction in Supabase
    addTransaction({
      sa_id: selectedSA.sa_id,
      userName: profile.name || "Guest",
      modelName: car.name,
      variantName: car.variants[selectedVariant].name,
      colorName: car.colors[selectedColor].name,
      totalPrice,
      status: "sent",
    }).catch(() => {});

    const msg = generateWhatsAppMessage(profile, {
      modelName: car.name,
      variantName: car.variants[selectedVariant].name,
      colorName: car.colors[selectedColor].name,
      accessories: accessoryNames,
      totalPrice,
    });
    const waNumber = (selectedSA.whatsapp || selectedSA.phone).replace(
      /[\s\-\+]/g,
      ""
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");

    toast.success("Configuration sent!", {
      description: `Sent to ${selectedSA.name} — visible on their profile now.`,
    });
  };

  const handleSendToSAAfterSelect = () => {
    // Will be called after SA is selected in the modal
    // We need to re-read selectedSA from context, but since
    // the modal closes and re-renders, we just call handleSendToSA again
    // via setTimeout to let state update
    setTimeout(() => {
      handleSendToSA();
    }, 100);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-white sticky top-0 z-10">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3>Configure {car.name}</h3>
          <p className="text-xs text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Step 1: Variant */}
        {step === 1 && (
          <div>
            <h2 className="mb-1">Select Variant</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Choose the variant that fits your needs
            </p>
            <div className="space-y-3">
              {car.variants.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    selectedVariant === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">{v.name}</p>
                      <p className="text-muted-foreground text-sm">
                        RM {v.price.toLocaleString()}
                      </p>
                    </div>
                    {selectedVariant === i && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white py-3.5 rounded-xl mt-6 transition-opacity hover:opacity-90"
            >
              Next: Select Color
            </button>
          </div>
        )}

        {/* Step 2: Color */}
        {step === 2 && (
          <div>
            <h2 className="mb-1">Select Color</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Pick your favourite color
            </p>
            <div className="space-y-3">
              {car.colors.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-colors ${
                    selectedColor === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-border shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-foreground flex-1">{c.name}</p>
                  {selectedColor === i && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-primary text-white py-3.5 rounded-xl mt-6 transition-opacity hover:opacity-90"
            >
              Next: Accessories
            </button>
          </div>
        )}

        {/* Step 3: Accessories */}
        {step === 3 && (
          <div>
            <h2 className="mb-1">Add Accessories</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Optional add-ons for your car
            </p>
            <div className="space-y-3">
              {car.accessories.map((a) => {
                const isSelected = selectedAccessories.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAccessory(a.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">{a.name}</p>
                        <p className="text-muted-foreground text-sm">
                          + RM {a.price.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 space-y-3">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    saveConfiguration({
                      modelId: car.id,
                      modelName: car.name,
                      variantName: car.variants[selectedVariant].name,
                      colorName: car.colors[selectedColor].name,
                      accessories: accessoryNames,
                      totalPrice,
                    });
                    toast.success("Configuration saved to your profile!", {
                      description: `${car.name} — ${car.variants[selectedVariant].name}`,
                    });
                  }}
                  className="w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
                >
                  Save Configuration
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
                >
                  Login to Save Configuration
                </Link>
              )}
              <button
                onClick={handleSendToSA}
                className="block w-full text-center bg-[#25D366] text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
              >
                {selectedSA
                  ? `Send to ${selectedSA.name} via WhatsApp`
                  : "Select SA & Send via WhatsApp"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Price Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-20">
        <div className="max-w-[430px] mx-auto px-5 pb-2">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Price</p>
                <p className="text-xl text-foreground">
                  RM {totalPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{car.name}</p>
                <p className="text-sm text-foreground">
                  {car.variants[selectedVariant].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {car.colors[selectedColor].name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SA Selection Modal */}
      <SASelectionModal
        isOpen={showSAModal}
        onClose={() => setShowSAModal(false)}
        onSelect={() => handleSendToSAAfterSelect()}
      />
    </div>
  );
}