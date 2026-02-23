import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Calculator, Save, MessageCircle } from "lucide-react";
import { useUser } from "../components/UserContext";
import { generateWhatsAppMessage } from "../data/user";
import { toast } from "sonner";
import { SASelectionModal } from "../components/SASelectionModal";

export function CalculatorPage() {
  const [searchParams] = useSearchParams();
  const initialPrice = searchParams.get("price") || "50000";
  const { isLoggedIn, profile, selectedSA } = useUser();
  const [showSAModal, setShowSAModal] = useState(false);

  const [carPrice, setCarPrice] = useState(initialPrice);
  const [downpayment, setDownpayment] = useState("5000");
  const [interestRate, setInterestRate] = useState("3.5");
  const [tenure, setTenure] = useState("9");

  // Logic: Automatically calculate 10% downpayment when car price changes
  useEffect(() => {
    const price = parseFloat(carPrice);
    if (!isNaN(price)) {
      setDownpayment((price * 0.10).toFixed(0));
    }
  }, [carPrice]);

  const result = useMemo(() => {
    const price = parseFloat(carPrice) || 0;
    const dp = parseFloat(downpayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(tenure) || 1;

    const loanAmount = price - dp;
    const totalInterest = loanAmount * (rate / 100) * years;
    const totalPayment = loanAmount + totalInterest;
    const monthly = totalPayment / (years * 12);

    return {
      loanAmount: Math.max(0, loanAmount),
      totalInterest: Math.max(0, totalInterest),
      totalPayment: Math.max(0, totalPayment),
      monthly: Math.max(0, monthly),
    };
  }, [carPrice, downpayment, interestRate, tenure]);

  // Logic: Tenure options 3-9 years
  const tenureOptions = [3, 4, 5, 6, 7, 8, 9];

  const handleContactSA = () => {
    if (!selectedSA) {
      setShowSAModal(true);
      return;
    }

    const msg = generateWhatsAppMessage(profile, {
      modelName: "Loan Inquiry",
      variantName: `RM ${parseFloat(carPrice).toLocaleString()} car`,
      totalPrice: result.monthly,
    });
    const waNumber = (selectedSA.whatsapp || selectedSA.phone).replace(
      /[\s\-\+]/g,
      ""
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1>Loan Calculator</h1>
          <p className="text-muted-foreground text-sm">
            Estimate your monthly payment
          </p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm">Car Price (RM)</label>
          <input
            type="number"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value)}
            className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
            placeholder="e.g. 50000"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm">Downpayment (RM)</label>
          <input
            type="number"
            value={downpayment}
            onChange={(e) => setDownpayment(e.target.value)}
            className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
            placeholder="e.g. 5000"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm">Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
            placeholder="e.g. 3.5"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm">Loan Tenure (Years)</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {tenureOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTenure(String(t))}
                className={`py-3 rounded-xl text-center border-2 transition-colors text-sm ${
                  tenure === String(t)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 bg-accent rounded-xl p-5 space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Monthly Payment</p>
          <p className="text-3xl text-primary mt-1">
            RM {result.monthly.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">Loan Amount</p>
          <p className="text-sm">RM {result.loanAmount.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">Total Interest</p>
          <p className="text-sm">
            RM {result.totalInterest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">Total Payment</p>
          <p className="text-sm">
            RM {result.totalPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => {
            if (!isLoggedIn) {
              toast.info("Please login to save your calculations.", {
                description: "Create an account to keep track of your plans.",
              });
              return;
            }
            toast.success("Calculation saved!", {
              description: `Monthly: RM ${result.monthly.toFixed(0)}`,
            });
          }}
          className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
        >
          <Save className="w-5 h-5" />
          Save Calculation
        </button>
        <button
          onClick={handleContactSA}
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3.5 rounded-xl transition-opacity hover:opacity-90"
        >
          <MessageCircle className="w-5 h-5" />
          {selectedSA
            ? `Contact ${selectedSA.name}`
            : "Select SA & Contact"}
        </button>
      </div>

      {/* SA Selection Modal */}
      <SASelectionModal
        isOpen={showSAModal}
        onClose={() => setShowSAModal(false)}
        onSelect={(sa) => {
          const msg = generateWhatsAppMessage(profile, {
            modelName: "Loan Inquiry",
            variantName: `RM ${parseFloat(carPrice).toLocaleString()} car`,
            totalPrice: result.monthly,
          });
          const waNumber = (sa.whatsapp || sa.phone).replace(
            /[\s\-\+]/g,
            ""
          );
          window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
        }}
      />
    </div>
  );
}