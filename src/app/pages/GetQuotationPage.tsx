import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { motion } from "motion/react";
import { 
  CheckCircle, 
  ChevronRight, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Users, 
  BadgeCheck 
} from "lucide-react";
import { Toaster, toast } from "sonner";
import * as api from "../lib/api";
import { malaysianStates } from "../data/user";

// Images from Unsplash
const HERO_IMAGE = "https://images.unsplash.com/photo-1585245726113-305630598b84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920";
const HANDSHAKE_IMAGE = "https://images.unsplash.com/photo-1591527292000-95f01a0d1496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

type FormValues = {
  name: string;
  phone: string;
  region: string;
  model: string;
  timeline: string;
  payment: string;
};

export function GetQuotationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(0);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [loanPeriod, setLoanPeriod] = useState<number>(9);
  const [interestRate, setInterestRate] = useState<number>(3.0);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>();
  const selectedModel = watch("model");

  useEffect(() => {
    api.getCars().then(setCars).catch(console.error);
  }, []);

  // Update calculator when model changes
  useEffect(() => {
    if (selectedModel && cars.length > 0) {
      const car = cars.find(c => c.name === selectedModel);
      if (car) {
        setCalcPrice(car.startingPrice);
        setDownPayment(car.startingPrice * 0.1); // Default 10%
      }
    }
  }, [selectedModel, cars]);

  // Recalculate installment
  useEffect(() => {
    if (calcPrice > 0) {
      const loanAmount = calcPrice - downPayment;
      const totalInterest = loanAmount * (interestRate / 100) * loanPeriod;
      const totalRepayment = loanAmount + totalInterest;
      const monthly = totalRepayment / (loanPeriod * 12);
      setMonthlyInstallment(monthly);
    }
  }, [calcPrice, downPayment, loanPeriod, interestRate]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await api.createLead(data);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Toaster />
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Your Request Has Been Sent</h1>
          <p className="text-muted-foreground mb-8">
            A sales advisor will contact you shortly to provide a personalized purchase plan tailored to your needs.
          </p>
          <Link 
            to="/" 
            className="block w-full bg-primary text-white font-medium py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        
        <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Get Your Personalized Car Purchase Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Compare offers from trusted sales advisors in your area and receive tailored purchase recommendations.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={scrollToForm}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Get Free Quotation
          </motion.button>
        </div>
      </section>

      {/* Why Use Our Platform */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Use Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We connect you with the best independent sales advisors to ensure you get the most value out of your purchase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Compare Advisors", desc: "Access multiple sales advisors to find the one that suits your needs best." },
              { icon: Calculator, title: "Personalized Calculation", desc: "Get accurate monthly installment estimates based on your deposit." },
              { icon: Clock, title: "Faster Response", desc: "Our network of advisors are committed to quick response times." },
              { icon: ShieldCheck, title: "No Obligation", desc: "Free consultation with no pressure to buy immediately." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Loan Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 w-full">
              <div className="bg-primary/5 rounded-3xl p-8 md:p-10 border border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold">Smart Loan Calculator</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Car Price (RM)</label>
                    <input 
                      type="number" 
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g. 50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Down Payment (RM)</label>
                    <input 
                      type="number" 
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <div className="flex gap-2 mt-2">
                      {[0, 10, 20].map(pct => (
                        <button 
                          key={pct}
                          onClick={() => setDownPayment(calcPrice * (pct / 100))}
                          className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-primary hover:text-primary transition-colors"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Loan Period</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[5, 7, 9].map(year => (
                        <button
                          key={year}
                          onClick={() => setLoanPeriod(year)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            loanPeriod === year 
                              ? "bg-primary text-white shadow-md" 
                              : "bg-white border border-gray-200 hover:border-primary/50 text-gray-600"
                          }`}
                        >
                          {year} Years
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Installment</p>
                    <div className="flex items-end gap-1">
                      <span className="text-sm font-medium text-primary mb-1">RM</span>
                      <span className="text-4xl font-bold text-gray-900">
                        {Math.round(monthlyInstallment).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      *Simulation only. Actual rates may vary based on bank approval.
                    </p>
                  </div>

                  <button 
                    onClick={scrollToForm}
                    className="w-full bg-white text-primary border border-primary font-semibold py-3 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    Get Detailed Plan
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full lg:pl-10">
               <h2 className="text-3xl font-bold mb-6">Plan Your Budget with Confidence</h2>
               <p className="text-lg text-muted-foreground mb-8">
                 Use our smart calculator to estimate your monthly commitments. When you're ready, request a detailed quotation to get the exact figures including insurance and road tax.
               </p>
               <ul className="space-y-4">
                 {[
                   "Accurate interest rate estimates",
                   "Hidden cost breakdown available upon request",
                   "Compare bank offers via sales advisors",
                   "Fast loan eligibility check"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3">
                     <BadgeCheck className="w-5 h-5 text-green-500 shrink-0" />
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="py-20 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-gray-900">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Get Your Free Quotation</h2>
              <p className="text-muted-foreground">
                Fill in your details below and we'll connect you with a verified Sales Advisor.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input 
                    {...register("name", { required: "Name is required" })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none transition-all"
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    {...register("phone", { required: "Phone number is required" })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none transition-all"
                    placeholder="012-345 6789"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <div className="relative">
                    <select 
                      {...register("region", { required: "Region is required" })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none transition-all appearance-none"
                    >
                      <option value="">Select your state</option>
                      {malaysianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                  </div>
                  {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Car Model</label>
                  <div className="relative">
                    <select 
                      {...register("model", { required: "Model is required" })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none transition-all appearance-none"
                    >
                      <option value="">Select model</option>
                      {cars.map(car => (
                        <option key={car.id} value={car.name}>{car.name}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                  </div>
                  {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Timeline</label>
                  <div className="relative">
                    <select 
                      {...register("timeline", { required: "Timeline is required" })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none transition-all appearance-none"
                    >
                      <option value="">When do you plan to buy?</option>
                      <option value="1 month">Within 1 month</option>
                      <option value="3 months">Within 3 months</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                    <ChevronRight className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                  </div>
                  {errors.timeline && <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Preference</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        value="Loan" 
                        {...register("payment", { required: "Payment type is required" })}
                        className="peer sr-only"
                      />
                      <div className="w-full text-center py-3 border border-gray-200 rounded-xl peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                        Loan
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        value="Cash" 
                        {...register("payment", { required: "Payment type is required" })}
                        className="peer sr-only"
                      />
                      <div className="w-full text-center py-3 border border-gray-200 rounded-xl peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                        Cash
                      </div>
                    </label>
                  </div>
                  {errors.payment && <p className="text-red-500 text-xs mt-1">{errors.payment.message}</p>}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Get Detailed Quotation"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                By submitting this form, you agree to be contacted by our registered sales advisors.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="bg-gray-50 py-10 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            This platform connects customers with independent sales advisors. We are not affiliated with any car manufacturer. All quotations and offers are provided directly by the respective sales advisors.
          </p>
        </div>
      </footer>
    </div>
  );
}