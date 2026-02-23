import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, UserPlus, User, Users, Loader2 } from "lucide-react";
import { useUser } from "../components/UserContext";
import { malaysianDistrictsByState } from "../data/user";
import { toast } from "sonner";

type RegisterRole = "user" | "sa";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerAsSA } = useUser();
  const [role, setRole] = useState<RegisterRole>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [region, setRegion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // SA-specific fields
  const [saPhone, setSaPhone] = useState("");
  const [saBranch, setSaBranch] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!region) newErrors.region = "Please select a region";
    if (role === "sa") {
      if (!saPhone.trim()) newErrors.saPhone = "Phone number is required";
      if (!saBranch.trim()) newErrors.saBranch = "Branch is required";
      if (!referenceCode.trim()) newErrors.referenceCode = "Reference Code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");

    // Simulate sending email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    
    // Simulate delay
    setTimeout(() => {
        setLoading(false);
        setStep("verify");
        toast.info("Verification code sent to " + email);
        // For prototype purposes, show code in console and toast
        console.log("Verification Code:", code);
        toast.success(`Your code is: ${code}`, { duration: 10000 });
    }, 1500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== sentCode) {
        setGeneralError("Invalid verification code");
        return;
    }

    setLoading(true);
    setGeneralError("");

    if (role === "user") {
      const result = await register(name, email, password, region);
      setLoading(false);
      if (result.success) {
        toast.success("Account created!", {
          description: "Welcome to OSL AUTOSALES.",
        });
        navigate("/profile");
      } else {
        setGeneralError(result.error || "Registration failed");
      }
    } else {
      const result = await registerAsSA({
        name,
        email,
        password,
        phone: saPhone,
        branch: saBranch,
        region,
        referenceCode,
      });
      setLoading(false);
      if (result.success) {
        toast.success("SA Account created!", {
          description:
            "Welcome to OSL AUTOSALES. Login as SA to manage your profile.",
        });
        navigate("/login");
      } else {
        setGeneralError(result.error || "Registration failed");
      }
    }
  };

  if (step === "verify") {
      return (
        <div className="px-5 py-8 min-h-screen flex flex-col justify-center">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-primary mb-1">Verify Email</h1>
                <p className="text-muted-foreground text-sm">
                    Enter the code sent to {email}
                </p>
            </div>

            {/* Demo Environment Hint - Only for prototype/testing */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl p-3 mb-4">
                <p className="font-semibold mb-1">🚧 Demo Environment Note</p>
                <p>Real email services are not connected in this preview.</p>
                <p className="mt-1">Your verification code is: <span className="font-mono font-bold text-lg ml-1 select-all">{sentCode}</span></p>
            </div>

            {generalError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3 mb-4">
                    <p>{generalError}</p>
                    {generalError.toLowerCase().includes("exists") && (
                        <div className="mt-2 flex gap-3">
                            <Link to="/login" className="font-semibold underline hover:opacity-80">
                                Login instead
                            </Link>
                            <button 
                                onClick={() => {
                                    setStep("form");
                                    setGeneralError("");
                                }} 
                                className="underline hover:opacity-80"
                            >
                                Change Email
                            </button>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label className="block mb-1.5 text-sm">Verification Code</label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none text-center text-2xl tracking-widest"
                        placeholder="000000"
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                        </>
                    ) : (
                        "Verify & Register"
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="w-full text-sm text-muted-foreground py-2"
                >
                    Back to Form
                </button>
            </form>
        </div>
      );
  }

  return (
    <div className="px-5 py-8 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-primary mb-1">Create Account</h1>
        <p className="text-muted-foreground text-sm">
          Join OSL AUTOSALES today
        </p>
      </div>

      {/* Role Toggle */}
      <div className="flex bg-accent rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => setRole("user")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
            role === "user"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          User
        </button>
        <button
          type="button"
          onClick={() => setRole("sa")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
            role === "sa"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Sales Advisor
        </button>
      </div>

      {/* Role Description */}
      <div className="bg-accent/60 rounded-xl p-3 mb-4">
        <p className="text-xs text-muted-foreground text-center">
          {role === "user"
            ? "Browse different brands, configure cars, and connect with Sales Advisors."
            : "Manage your profile, post promotions, and connect with customers."}
        </p>
      </div>

      {generalError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3 mb-4">
          {generalError}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-sm">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
              errors.name
                ? "border-destructive"
                : "border-border focus:border-primary"
            }`}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="text-destructive text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
              errors.email
                ? "border-destructive"
                : "border-border focus:border-primary"
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1.5 text-sm">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors pr-12 ${
                errors.password
                  ? "border-destructive"
                  : "border-border focus:border-primary"
              }`}
              placeholder="Create password (min 6 chars)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-1.5 text-sm">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors pr-12 ${
                errors.confirmPassword
                  ? "border-destructive"
                  : "border-border focus:border-primary"
              }`}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Region — organized by state with optgroup */}
        <div>
          <label className="block mb-1.5 text-sm">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors appearance-none ${
              errors.region
                ? "border-destructive"
                : "border-border focus:border-primary"
            }`}
          >
            <option value="">Select your region</option>
            {Object.entries(malaysianDistrictsByState).map(
              ([state, districts]) => (
                <optgroup key={state} label={state}>
                  {districts.map((d) => (
                    <option key={`${d}-${state}`} value={`${d}, ${state}`}>
                      {d}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </select>
          {errors.region && (
            <p className="text-destructive text-xs mt-1">{errors.region}</p>
          )}
        </div>

        {/* SA-specific fields */}
        {role === "sa" && (
          <>
            <div>
              <label className="block mb-1.5 text-sm">Phone / WhatsApp</label>
              <input
                type="tel"
                value={saPhone}
                onChange={(e) => setSaPhone(e.target.value)}
                className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.saPhone
                    ? "border-destructive"
                    : "border-border focus:border-primary"
                }`}
                placeholder="+60XX-XXX XXXX"
              />
              {errors.saPhone && (
                <p className="text-destructive text-xs mt-1">
                  {errors.saPhone}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-1.5 text-sm">Car brands and branch</label>
              <input
                type="text"
                value={saBranch}
                onChange={(e) => setSaBranch(e.target.value)}
                className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.saBranch
                    ? "border-destructive"
                    : "border-border focus:border-primary"
                }`}
                placeholder="e.g. Perodua KL, Jalan Sultan Ismail"
              />
              {errors.saBranch && (
                <p className="text-destructive text-xs mt-1">
                  {errors.saBranch}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-sm">Reference Code</label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                className={`w-full bg-input-background px-4 py-3 rounded-xl border focus:outline-none transition-colors ${
                  errors.referenceCode
                    ? "border-destructive"
                    : "border-border focus:border-primary"
                }`}
                placeholder="Enter Reference Code"
              />
              {errors.referenceCode && (
                <p className="text-destructive text-xs mt-1">
                  {errors.referenceCode}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Need a Reference Code? Contact admin at <a href="mailto:feedback@oslautosales.com" className="text-primary hover:underline">feedback@oslautosales.com</a>
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : role === "user" ? (
            "Create User Account"
          ) : (
            "Create SA Account"
          )}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground mt-4 px-6">
        {role === "user"
          ? "You can complete your full profile after signing up."
          : "After registration, login as SA from the Login page to manage posts and profile."}
      </p>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}
