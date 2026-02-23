import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  LogIn,
  Users,
  User,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";
import { useUser } from "../components/UserContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

type LoginMode = "user" | "sa";

export const ADMIN_ID = "OSLDEVELOPteamadmin980121";
export const ADMIN_PASS = "9khh81ni.ll";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsSA, partnerLogin, salesAdvisors } = useUser();
  const [mode, setMode] = useState<LoginMode>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // SA password modal state
  const [selectedSA, setSelectedSA] = useState<string | null>(null);
  const [saPassword, setSaPassword] = useState("");
  const [showSAPassword, setShowSAPassword] = useState(false);
  const [saError, setSaError] = useState("");
  const [saLoading, setSaLoading] = useState(false);

  const selectedSAData = selectedSA
    ? salesAdvisors.find((s) => s.sa_id === selectedSA)
    : null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Allow Admin ID without email format check
    if (email === ADMIN_ID) {
      // noop
    } else {
      if (!email.trim()) newErrors.email = "Email or Shop Name is required";
      // Removed email format check to allow shop names
    }

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Admin Login Check
    if (email === ADMIN_ID && password === ADMIN_PASS) {
      sessionStorage.setItem("osl_admin_auth", "true");
      toast.success("Welcome Admin");
      navigate("/admin");
      return;
    }

    setLoading(true);
    setGeneralError("");

    let result;
    
    // Check if input looks like an email -> User Login
    if (email.includes("@")) {
       result = await login(email.trim(), password, remember);
       if (result.success) {
         toast.success("Welcome back!", { description: "You are now logged in." });
         navigate("/profile");
       }
    } else {
       // Assume Partner Login (Shop Name)
       result = await partnerLogin(email.trim(), password);
       if (result.success) {
         toast.success("Welcome Partner!", { description: "Logged in as External Partner." });
         navigate("/partner-panel");
       }
    }

    setLoading(false);

    if (!result?.success) {
      const isUser = email.includes("@");
      setGeneralError(
          result?.error || 
          (isUser ? "Login failed. Check your password." : "Partner login failed.")
      );
      
      if (result?.error === "Incorrect password. Please try again." && isUser) {
          // Add hint
          toast.error("Incorrect password", {
              description: "If you are a Partner trying to login via email, please use your Shop Name instead."
          });
      }
    }
  };

  const handleSASelect = (saId: string) => {
    setSelectedSA(saId);
    setSaPassword("");
    setSaError("");
    setShowSAPassword(false);
  };

  const handleSALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSA) return;
    if (!saPassword) {
      setSaError("Password is required");
      return;
    }
    if (saPassword.length < 6) {
      setSaError("Password must be at least 6 characters");
      return;
    }

    setSaLoading(true);
    setSaError("");

    // SA Login needs a remember me checkbox or we use the same one?
    // The UI only shows remember me for User login.
    // Let's add it to SA login too if needed, or assume default false?
    // The user requirement said "login remember me no reaction". It likely refers to the main login form.
    // But let's check if there is a remember me checkbox for SA in the existing code.
    // There isn't one. I'll add one.
    
    const result = await loginAsSA(selectedSA, saPassword, true); // Auto remember for SA for now? Or add checkbox.
    // Let's just pass `true` for now as SAs usually want to stay logged in on their device.
    // OR better, add a checkbox to the modal.
    
    setSaLoading(false);

    if (result.success) {
      toast.success("Welcome back!", {
        description: "Logged in as Sales Advisor.",
      });
      navigate("/sa-dashboard");
    } else {
      setSaError(result.error || "Incorrect password");
    }
  };

  return (
    <div className="px-5 py-8 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-primary mb-1">OSL AUTOSALES</h1>
        <p className="text-muted-foreground text-sm">Welcome back!</p>
      </div>

      {/* Role Toggle */}
      <div className="flex bg-accent rounded-xl p-1 mb-6">
        <button
          onClick={() => {
            setMode("user");
            setGeneralError("");
            setSelectedSA(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
            mode === "user"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          User
        </button>
        <button
          onClick={() => {
            setMode("sa");
            setGeneralError("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
            mode === "sa"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Sales Advisor
        </button>
      </div>

      {mode === "user" ? (
        /* User Login Form */
        <>
          {generalError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3 mb-4">
              {generalError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm">Email, Shop Name, or Admin ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
                placeholder="Email or Shop Name"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block mb-1.5 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors pr-12"
                  placeholder="Enter password"
                  required
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
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary">
              Register
            </Link>
          </p>
        </>
      ) : (
        /* SA Login */
        <>
          {/* SA Password Modal */}
          {selectedSA && selectedSAData ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedSA(null);
                  setSaPassword("");
                  setSaError("");
                }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to SA list
              </button>

              <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                <ImageWithFallback
                  src={selectedSAData.avatar}
                  alt={selectedSAData.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{selectedSAData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSAData.branch}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedSAData.region} — {selectedSAData.city}
                  </p>
                </div>
              </div>

              {saError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl p-3">
                  {saError}
                </div>
              )}

              <form onSubmit={handleSALogin} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm">
                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                    Enter Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSAPassword ? "text" : "password"}
                      value={saPassword}
                      onChange={(e) => setSaPassword(e.target.value)}
                      className="w-full bg-input-background px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors pr-12"
                      placeholder="Enter SA password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSAPassword(!showSAPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showSAPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saLoading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Login as SA"
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-muted-foreground">
                Default password for demo SA accounts:{" "}
                <span className="font-mono bg-accent px-1.5 py-0.5 rounded">
                  osl123456
                </span>
              </p>
            </div>
          ) : (
            /* SA Profile Selection */
            <>
              <div className="bg-accent rounded-xl p-4 mb-4">
                <p className="text-sm text-center text-muted-foreground">
                  Select your Sales Advisor profile, then enter your password
                </p>
              </div>

              <div className="space-y-3">
                {salesAdvisors.map((sa) => (
                  <button
                    key={sa.sa_id}
                    onClick={() => handleSASelect(sa.sa_id)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <ImageWithFallback
                      src={sa.avatar}
                      alt={sa.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium">{sa.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sa.branch}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {sa.region} — {sa.city}
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary">
                  Register
                </Link>
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}