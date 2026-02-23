import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  type UserProfile,
  type SavedConfiguration,
  emptyProfile,
} from "../data/user";
import * as api from "../lib/api";

export type UserRole = "user" | "sa" | "external_partner";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface UserContextValue {
  // Auth
  isLoggedIn: boolean;
  role: UserRole;
  profile: UserProfile;
  savedConfigs: SavedConfiguration[];
  login: (email: string, password: string, remember?: boolean) => Promise<AuthResult>;
  partnerLogin: (shopName: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    region: string
  ) => Promise<AuthResult>;
  loginAsSA: (saId: string, password: string, remember?: boolean) => Promise<AuthResult>;
  partnerLogin: (shopName: string, password: string) => Promise<AuthResult>;
  registerAsSA: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    branch: string;
    region: string;
    referenceCode: string;
  }) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSAProfile: (updates: Partial<api.SalesAdvisor>) => Promise<void>;
  saveConfiguration: (
    config: Omit<SavedConfiguration, "id" | "savedAt">
  ) => void;
  deleteConfiguration: (id: string) => void;

  // SA Selection (session-based)
  selectedSAId: string;
  selectedSA: api.SalesAdvisor | undefined;
  salesAdvisors: api.SalesAdvisor[];
  selectSA: (saId: string) => void;
  clearSA: () => void;

  // SA auth info
  saProfile: api.SalesAdvisor | undefined;

  // Cars
  cars: api.CarModel[];
  refreshData: () => Promise<void>;
  
  // Follow
  toggleFollow: (saId: string) => Promise<void>;

  // Role Switching
  switchMode: (role: UserRole) => void;
  
  refreshUserProfile: () => Promise<void>;
}

const noopAsync = async (): Promise<AuthResult> => ({
  success: false,
  error: "Not initialized",
});
const noop = () => {};

const defaultContextValue: UserContextValue = {
  isLoggedIn: false,
  role: "user",
  profile: emptyProfile,
  savedConfigs: [],
  login: noopAsync,
  register: noopAsync,
  loginAsSA: noopAsync,
  partnerLogin: noopAsync,
  registerAsSA: noopAsync,
  logout: noop,
  updateProfile: noop as any,
  updateSAProfile: async () => {},
  saveConfiguration: noop as any,
  deleteConfiguration: noop as any,
  selectedSAId: "",
  selectedSA: undefined,
  salesAdvisors: [],
  selectSA: noop as any,
  clearSA: noop,
  saProfile: undefined,
  cars: [],
  refreshData: async () => {},
  switchMode: noop,
  refreshUserProfile: async () => {},
};

const UserContext = createContext<UserContextValue>(defaultContextValue);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>("user");
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [selectedSAId, setSelectedSAId] = useState("");
  const [saProfileId, setSaProfileId] = useState("");
  
  // Dynamic SA Profile State
  const [salesAdvisors, setSalesAdvisors] = useState<api.SalesAdvisor[]>([]);
  const [saProfileState, setSaProfileState] = useState<api.SalesAdvisor | undefined>(undefined);
  const [cars, setCars] = useState<api.CarModel[]>([]);

  // Partner Profile State
  const [partnerProfile, setPartnerProfile] = useState<any>(undefined);

  const refreshData = useCallback(async () => {
    try {
      const [newSAs, newCars] = await Promise.all([
        api.getPublicSAs(),
        api.getCars()
      ]);
      setSalesAdvisors(newSAs);
      setCars(newCars);
      return { hasSAs: newSAs.length > 0, hasCars: newCars.length > 0 };
    } catch (error) {
      console.error("Failed to refresh data", error);
      return { hasSAs: false, hasCars: false };
    }
  }, []);
  
  const refreshUserProfile = useCallback(async () => {
    if (!profile.email) return;
    // Do not fetch user profile for Partners or SAs (SAs are loaded via public list)
    if (role === 'external_partner' || role === 'sa') return;

    try {
        const freshProfile = await api.getUserProfile(profile.email);
        if (freshProfile) {
             setProfile(prev => ({ ...prev, ...freshProfile }));
        }
    } catch (e: any) {
        // Handle "User not found" specifically - usually means user was deleted
        const errorMsg = e.message || "";
        if (errorMsg.includes("User not found")) {
            console.warn("User profile not found, clearing session.");
            setIsLoggedIn(false);
            setProfile(emptyProfile);
            setSavedConfigs([]);
            setSelectedSAId("");
            setSaProfileId("");
            setSaProfileState(undefined);
            localStorage.removeItem("osl_remember_me");
            return;
        }
        console.error("Failed to refresh user profile", e);
    }
  }, [profile.email, role]);

  // Fetch SAs and Cars on mount with retry
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    
    const fetchData = async () => {
      const { hasSAs, hasCars } = await refreshData();
      
      // If data is missing and we haven't exceeded retries, try again
      if ((!hasSAs || !hasCars) && attempts < maxAttempts) {
        attempts++;
        setTimeout(fetchData, 2000); // Retry every 2 seconds
      }
    };
    
    fetchData();
  }, [refreshData]);

  const selectedSA = selectedSAId ? salesAdvisors.find(s => s.sa_id === selectedSAId) : undefined;
  const saProfile = saProfileState;

  // Sync static data to state when ID changes or salesAdvisors update
  useEffect(() => {
    if (saProfileId) {
      const sa = salesAdvisors.find(s => s.sa_id === saProfileId);
      if (sa) {
        setSaProfileState(sa);
      } else {
        // If SA is not found in public list (e.g. banned/suspended), don't reset to undefined if we already have it
        // This allows loginAsSA to set the initial state from the login response
        setSaProfileState(prev => prev && prev.sa_id === saProfileId ? prev : undefined);
      }
    } else {
      setSaProfileState(undefined);
    }
  }, [saProfileId, salesAdvisors]);

  // Persistence: Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("osl_remember_me");
    if (storedUser) {
      try {
        const session = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setRole(session.role || "user");
        
        if (session.role === "user") {
             setProfile(session.profile);
        } else if (session.role === "external_partner") {
             setPartnerProfile(session.partnerProfile);
             setProfile({
                ...emptyProfile,
                id: session.partnerProfile.id,
                name: session.partnerProfile.business_name,
                avatar: session.partnerProfile.logo_url || "",
                email: `partner-${session.partnerProfile.id}@osl.my`
             });
        } else if (session.role === "sa" && session.saProfileId) {
            setSaProfileId(session.saProfileId);
            if (session.saProfileState) {
                setSaProfileState(session.saProfileState);
                // Reconstruct basic profile from SA state for header display
                setProfile({
                    ...emptyProfile,
                    id: session.saProfileState.sa_id,
                    name: session.saProfileState.name,
                    email: (session.saProfileState as any).email || "",
                    avatar: session.saProfileState.avatar,
                    createdAt: new Date().toISOString(),
                });
            }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem("osl_remember_me");
      }
    }
  }, []);

  // Helper to save session
  const saveSession = (role: UserRole, profile: UserProfile, saId?: string, saState?: any) => {
    localStorage.setItem("osl_user_session", JSON.stringify({
        role,
        profile,
        saProfileId: saId,
        saProfileState: saState
    }));
  };

  // User login — validates against backend
  const login = useCallback(
    async (email: string, password: string, remember?: boolean): Promise<AuthResult> => {
      try {
        const res = await api.authLogin({ email, password });
        if (res.user) {
          setIsLoggedIn(true);
          setRole("user");
          const userProfile = {
            ...emptyProfile,
            id: "user-" + Date.now(),
            email: res.user!.email,
            name: res.user!.name || email.split("@")[0],
            region: res.user!.region || "",
            avatar: res.user!.avatar || "",
            createdAt: res.user!.createdAt || new Date().toISOString(),
          };
          setProfile(userProfile);
          
          if (remember) {
             localStorage.setItem("osl_remember_me", JSON.stringify({
                 role: "user",
                 profile: userProfile
             }));
          } else {
             localStorage.removeItem("osl_remember_me");
          }

          setSavedConfigs([
            {
              id: "cfg-1",
              modelId: "myvi",
              modelName: "Myvi",
              variantName: "1.5 AV AT",
              colorName: "Cranberry Red",
              accessories: ["Body Kit", "Dash Cam"],
              totalPrice: 60750,
              savedAt: "2026-02-15T10:30:00Z",
            },
            {
              id: "cfg-2",
              modelId: "ativa",
              modelName: "Ativa",
              variantName: "1.0T H",
              colorName: "Ocean Blue",
              accessories: ["Side Step Bar"],
              totalPrice: 68700,
              savedAt: "2026-02-18T14:00:00Z",
            },
          ]);
          return { success: true };
        }
        return { success: false, error: "Login failed" };
      } catch (e: any) {
        // Parse error from backend JSON response
        let errorMsg = "Login failed. Please try again.";
        try {
          const parsed = JSON.parse(e.message);
          if (parsed.error) errorMsg = parsed.error;
        } catch {
          if (e.message) errorMsg = e.message;
        }
        console.error("Login error:", errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // User register — creates account on backend
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      region: string
    ): Promise<AuthResult> => {
      try {
        const res = await api.authRegister({
          name,
          email,
          password,
          region,
          role: "user",
        });
        if (res.user) {
          setIsLoggedIn(true);
          setRole("user");
          const userProfile = {
            ...emptyProfile,
            id: "user-" + Date.now(),
            name: res.user.name,
            email: res.user.email,
            region: res.user.region,
            avatar: res.user.avatar,
            createdAt: res.user.createdAt,
          };
          setProfile(userProfile);
          setSavedConfigs([]);
          return { success: true };
        }
        return { success: false, error: "Registration failed" };
      } catch (e: any) {
        let errorMsg = "Registration failed. Please try again.";
        try {
          const parsed = JSON.parse(e.message);
          if (parsed.error) errorMsg = parsed.error;
        } catch {
          if (e.message) errorMsg = e.message;
        }
        console.error("Register error:", errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // SA login — validates password against backend
  const loginAsSA = useCallback(
    async (saId: string, password: string, remember?: boolean): Promise<AuthResult> => {
      try {
        const res = await api.authSALogin({ sa_id: saId, password });
        setIsLoggedIn(true);
        setRole("sa");
        setSaProfileId(saId);
        
        let saProfileData: api.SalesAdvisor | undefined;

        // Find SA in current list
        const sa = salesAdvisors.find(s => s.sa_id === saId);
        
        if (sa) {
          saProfileData = {
            ...sa,
            avatar: res.avatar || sa.avatar
          };
          setSaProfileState(saProfileData);
          
          // Also set user profile for display
          setProfile({
            ...emptyProfile,
            id: sa.sa_id,
            name: sa.name,
            email: `${sa.name.toLowerCase().replace(/\s/g, ".")}@osl.my`,
            phone: sa.phone,
            whatsapp: sa.whatsapp,
            region: sa.region,
            state: sa.state,
            city: sa.city,
            createdAt: new Date().toISOString(),
          });
        } else if (res.status === 'banned' || res.status === 'suspended') {
          // Construct profile for banned/suspended user who is not in public list
          // res contains: sa_id, avatar, status, banReason, etc. (and now name, email, etc. from our update)
          const restrictedSA: api.SalesAdvisor = {
            sa_id: res.sa_id!,
            name: (res as any).name || "Sales Advisor",
            avatar: res.avatar || "",
            region: (res as any).region || "",
            state: "",
            city: "",
            phone: "",
            whatsapp: "",
            bio: "",
            badge: "",
            rating: 0,
            reviewCount: 0,
            branch: (res as any).branch || "",
            googleMapUrl: "",
            kpi: { visits: 0, inquiries: 0, conversionRate: 0 },
            assignedUsers: [],
            // Add status fields which will be used by dashboard
            ...res
          } as any;

          saProfileData = restrictedSA;
          setSaProfileState(restrictedSA);
          
          // Also set user profile for display
          setProfile({
            ...emptyProfile,
            id: restrictedSA.sa_id,
            name: restrictedSA.name,
            email: (res as any).email || "",
            avatar: restrictedSA.avatar,
            createdAt: new Date().toISOString(),
          });
        }
        
        if (remember && saProfileData) {
            localStorage.setItem("osl_remember_me", JSON.stringify({
                 role: "sa",
                 saProfileId: saId,
                 // We store the profile state so we can restore it even if banned (not in public list)
                 saProfileState: saProfileData
            }));
        } else {
            localStorage.removeItem("osl_remember_me");
        }

        return { success: true };
      } catch (e: any) {
        let errorMsg = "SA Login failed. Please try again.";
        try {
          const parsed = JSON.parse(e.message);
          if (parsed.error) errorMsg = parsed.error;
        } catch {
          if (e.message) errorMsg = e.message;
        }
        console.error("SA Login error:", errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [salesAdvisors]
  );


  // SA register
  const registerAsSA = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone: string;
      branch: string;
      region: string;
      referenceCode: string;
    }): Promise<AuthResult> => {
      try {
        const res = await api.authSARegister(data);
        // After SA register, log them in as user first
        setIsLoggedIn(true);
        setRole("user");
        setProfile({
          ...emptyProfile,
          id: "user-" + Date.now(),
          name: data.name,
          email: data.email,
          region: data.region,
          avatar: res.user?.avatar,
          createdAt: new Date().toISOString(),
        });
        setSavedConfigs([]);
        
        // Refresh SA list
        api.getPublicSAs().then(setSalesAdvisors);
        
        return { success: true };
      } catch (e: any) {
        let errorMsg = "SA Registration failed. Please try again.";
        try {
          const parsed = JSON.parse(e.message);
          if (parsed.error) errorMsg = parsed.error;
        } catch {
          if (e.message) errorMsg = e.message;
        }
        console.error("SA Register error:", errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  // Partner Login
  const partnerLogin = useCallback(async (shopName: string, password: string): Promise<AuthResult> => {
    try {
      const res = await api.authPartnerLogin({ shop_name: shopName, password });
      
      setIsLoggedIn(true);
      setRole("external_partner");
      setPartnerProfile(res.partner);
      
      // Set basic profile for header display
      setProfile({
        ...emptyProfile,
        id: res.partner.id,
        name: res.partner.business_name,
        avatar: res.partner.logo_url || "",
        // Use business name as 'email' for unique ID in profile context if needed
        email: `partner-${res.partner.id}@osl.my`
      });
      
      // Save session
      localStorage.setItem("osl_remember_me", JSON.stringify({
         role: "external_partner",
         partnerProfile: res.partner
      }));

      return { success: true };
    } catch (e: any) {
      let errorMsg = "Partner Login failed.";
      try {
        const parsed = JSON.parse(e.message);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        if (e.message) errorMsg = e.message;
      }
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRole("user");
    setProfile(emptyProfile);
    setSavedConfigs([]);
    setSelectedSAId("");
    setSaProfileId("");
    setSaProfileState(undefined);
    setPartnerProfile(undefined);
    localStorage.removeItem("osl_remember_me");
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      // Sync to backend if email exists
      if (next.email) {
        api.updateUserProfile(next.email, updates).catch(console.error);
      }
      return next;
    });
  }, []);

  const updateSAProfile = useCallback(async (updates: Partial<api.SalesAdvisor>) => {
    if (!saProfileState) return;
    try {
      await api.updateSAProfile(saProfileState.sa_id, updates);
      setSaProfileState(prev => prev ? { ...prev, ...updates } : undefined);
      // Refresh public list so changes are visible on Profile Page
      await refreshData();
    } catch (e) {
      console.error("Failed to update SA profile", e);
      throw e;
    }
  }, [saProfileState, refreshData]);

  const saveConfiguration = useCallback(
    (config: Omit<SavedConfiguration, "id" | "savedAt">) => {
      const newConfig: SavedConfiguration = {
        ...config,
        id: "cfg-" + Date.now(),
        savedAt: new Date().toISOString(),
      };
      setSavedConfigs((prev) => [newConfig, ...prev]);
    },
    []
  );

  const deleteConfiguration = useCallback((id: string) => {
    setSavedConfigs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const selectSA = useCallback((saId: string) => {
    setSelectedSAId(saId);
  }, []);

  const clearSA = useCallback(() => {
    setSelectedSAId("");
  }, []);

  const switchMode = useCallback((newRole: UserRole) => {
    if (isLoggedIn) {
      setRole(newRole);
    }
  }, [isLoggedIn]);

  const toggleFollow = useCallback(async (saId: string) => {
    if (!isLoggedIn || role !== 'user' || !profile.email) {
        throw new Error("Please login to follow");
    }
    
    const isFollowing = profile.following?.includes(saId);
    const action = isFollowing ? 'unfollow' : 'follow';
    
    try {
        const res = await api.followSA(profile.email, saId, action);
        
        // Update local profile
        setProfile(prev => ({
            ...prev,
            following: res.following
        }));
        
        // Update SA list with new follower count
        setSalesAdvisors(prev => prev.map(s => {
            if (s.sa_id === saId) {
                // We don't have the full list of followers in the SA list item usually, just count
                // But let's assume we might want to update it if we track it
                // For now, refreshing data is safer but slower. 
                // Let's just rely on local profile update for the button state.
                return s; 
            }
            return s;
        }));
        
        return;
    } catch (e) {
        console.error("Toggle follow failed", e);
        throw e;
    }
  }, [isLoggedIn, role, profile]);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        role,
        profile,
        savedConfigs,
        login,
        register,
        loginAsSA,
        registerAsSA,
        partnerLogin,
        logout,
        updateProfile,
        updateSAProfile,
        saveConfiguration,
        deleteConfiguration,
        selectedSAId,
        selectedSA,
        salesAdvisors,
        selectSA,
        clearSA,
        saProfile,
        cars,
        refreshData,
        toggleFollow,
        switchMode,
        refreshUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}