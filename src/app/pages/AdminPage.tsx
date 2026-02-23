import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Shield,
  FileText,
  LogOut,
  Trash2,
  Ban,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
  Lock,
  Eye,
  EyeOff,
  Key,
  MessageSquare,
  Plus,
  Copy,
  Car,
  Pencil,
  X,
  Save,
  Trash,
  Image as ImageIcon,
  Star,
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import * as api from "../lib/api";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ADMIN_ID, ADMIN_PASS } from "./LoginPage";

import { Ticket, ClipboardCheck } from "lucide-react";

type Tab = "users" | "sas" | "posts" | "codes" | "feedback" | "cars" | "leads" | "partners" | "approvals" | "vouchers" | "sales";

import { useUser } from "../components/UserContext";

export function AdminPage() {
  const { refreshData } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<any[]>([]);
  const [sas, setSAs] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // User Points Edit State
  const [editingPointsUser, setEditingPointsUser] = useState<any>(null);
  const [pointsValue, setPointsValue] = useState<number>(0);
  
  // Car Edit State
  const [editingCar, setEditingCar] = useState<any>(null);
  const [carForm, setCarForm] = useState<any>(null);

  // Partner Edit State
  const [editingPartner, setEditingPartner] = useState<boolean>(false);
  const [partnerForm, setPartnerForm] = useState<any>({
      id: "",
      business_name: "",
      logo_url: "",
      short_description: "",
      full_description: "",
      phone: "",
      whatsapp_url: "",
      website_url: "",
      address: "",
      map_url: "",
      display_order: 0,
      is_active: true,
      is_featured: false,
      products: []
  });
  
  // Product Edit State (Nested in Partner)
  const [editingProduct, setEditingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<any>({
      id: "",
      image_url: "",
      title: "",
      description: "",
      discount_info: "",
      terms_conditions: "",
      expiry_date: "",
      supported_models: ["All"]
  });

  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lockId, setLockId] = useState("");
  const [lockPass, setLockPass] = useState("");
  const [showLockPass, setShowLockPass] = useState(false);
  const [lockError, setLockError] = useState("");
  
  // Code generation state
  const [newCode, setNewCode] = useState("");

  // Action Modals State
  const [actionSA, setActionSA] = useState<any>(null);
  const [actionType, setActionType] = useState<"ban" | "suspend" | "warning" | null>(null);
  const [actionForm, setActionForm] = useState({ duration: 7, reason: "", title: "", message: "" });
  
  // Gallery Modal State
  const [gallerySA, setGallerySA] = useState<any>(null);
  
  // Analytics Modal State
  const [analyticsSA, setAnalyticsSA] = useState<any>(null);
  const [analyticsForm, setAnalyticsForm] = useState<any>({ visits: 0, inquiries: 0 });

  useEffect(() => {
    const auth = sessionStorage.getItem("osl_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockId === ADMIN_ID && lockPass === ADMIN_PASS) {
      sessionStorage.setItem("osl_admin_auth", "true");
      setIsAuthenticated(true);
      setLockError("");
      loadData();
      toast.success("Admin Panel Unlocked");
    } else {
      setLockError("Invalid Admin ID or Password");
      toast.error("Access Denied");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, sasData, postsData, codesData, reviewsData, carsData, leadsData, partnersData, proofsData, transactionsData, vouchersData] = await Promise.all([
        api.adminGetUsers(),
        api.adminGetSAs(),
        api.getPosts(),
        api.adminGetRefCodes(),
        api.getReviews(),
        api.getCars(),
        api.getLeads(),
        api.getPartners(),
        api.getConsumptionProofs(),
        api.adminGetTransactions(),
        api.adminGetAllVouchers()
      ]);
      setUsers(usersData);
      setSAs(sasData);
      setPosts(postsData);
      setCodes(codesData);
      setReviews(reviewsData);
      setCars(carsData);
      setLeads(leadsData);
      setPartners(partnersData);
      setProofs(proofsData);
      setTransactions(transactionsData);
      setVouchers(vouchersData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem("osl_admin_auth");
    setIsAuthenticated(false);
    toast.info("Admin Panel Locked");
  };

  const openActionModal = (sa: any, type: "ban" | "suspend" | "warning") => {
    setActionSA(sa);
    setActionType(type);
    setActionForm({ duration: 24, reason: "", title: "Warning", message: "" });
  };

  const closeActionModal = () => {
    setActionSA(null);
    setActionType(null);
  };

  const submitAction = async () => {
    if (!actionSA || !actionType) return;
    
    try {
        if (actionType === 'warning') {
            if (!actionForm.title || !actionForm.message) {
                return toast.error("Title and message required");
            }
            await api.adminUpdateSAStatus(actionSA.sa_id, 'warning', {
                title: actionForm.title,
                message: actionForm.message
            });
            
            // Send Notification
            if (actionSA.email) {
                await api.createNotification({
                    email: actionSA.email,
                    message: `${actionForm.title}: ${actionForm.message}`,
                    type: "warning"
                });
            }
            
            toast.success("Warning sent to SA");
        } else if (actionType === 'ban') {
            if (!actionForm.reason) return toast.error("Reason required");
            await api.adminUpdateSAStatus(actionSA.sa_id, 'banned', {
                banDuration: Number(actionForm.duration),
                reason: actionForm.reason
            });
            setSAs(prev => prev.map(s => s.sa_id === actionSA.sa_id ? { ...s, status: 'banned' } : s));
            toast.success("SA Banned");
        } else if (actionType === 'suspend') {
            if (!actionForm.reason) return toast.error("Reason required");
            await api.adminUpdateSAStatus(actionSA.sa_id, 'suspended', {
                reason: actionForm.reason
            });
            setSAs(prev => prev.map(s => s.sa_id === actionSA.sa_id ? { ...s, status: 'suspended' } : s));
            toast.success("SA Suspended");
        }
        closeActionModal();
    } catch (e) {
        toast.error("Action failed");
        console.error(e);
    }
  };

  const updateUserStatus = async (email: string, status: string) => {
    try {
      await api.adminUpdateUserStatus(email, status);
      setUsers((prev) =>
        prev.map((u) => (u.email === email ? { ...u, status } : u))
      );
      toast.success(`User ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updateSAStatus = async (saId: string, status: string) => {
    try {
      await api.adminUpdateSAStatus(saId, status);
      setSAs((prev) =>
        prev.map((s) => (s.sa_id === saId ? { ...s, status } : s))
      );
      toast.success(`SA ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };
  
  const handleGenerateCode = async () => {
    try {
      const res = await api.adminGenerateRefCode(newCode);
      setCodes(prev => [res, ...prev]);
      setNewCode("");
      toast.success("Reference code generated");
    } catch {
      toast.error("Failed to generate code");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.adminDeleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!confirm("Delete this code?")) return;
    try {
      await api.adminDeleteRefCode(code);
      setCodes(prev => prev.filter(c => c.code !== code));
      toast.success("Code deleted");
    } catch {
      toast.error("Failed to delete code");
    }
  };

  const copyText = (text: string, label: string) => {
    // Attempt legacy execCommand copy first as it's more robust in some embedded environments
    // and doesn't trigger the Permissions Policy blocks that writeText does.
    const legacyCopy = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure it's not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.setAttribute("readonly", ""); // Avoid keyboard popping up on mobile
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
      } catch (err) {
        console.error("Legacy copy failed", err);
        return false;
      }
    };

    // Try legacy first
    if (legacyCopy()) {
      toast.success(`${label} copied to clipboard`);
      return;
    }

    // Fallback to modern API if legacy fails (and if API exists)
    if (navigator.clipboard && navigator.clipboard.writeText) {
       navigator.clipboard.writeText(text)
        .then(() => toast.success(`${label} copied to clipboard`))
        .catch((err) => {
           console.error("All clipboard methods failed", err);
           toast.error(`Could not copy ${label.toLowerCase()}. Please copy manually.`);
        });
    } else {
       toast.error(`Could not copy ${label.toLowerCase()}. Please copy manually.`);
    }
  };

  const handleCopyCode = (code: string) => {
    copyText(code, "Code");
  };

  const handleEditCar = (car: any) => {
    setEditingCar(car);
    setCarForm(JSON.parse(JSON.stringify(car)));
  };

  const handleSaveCar = async () => {
    try {
      const updatedCars = cars.map(c => c.id === carForm.id ? carForm : c);
      await api.updateCars(updatedCars);
      setCars(updatedCars);
      setEditingCar(null);
      await refreshData();
      toast.success("Car updated successfully");
    } catch {
      toast.error("Failed to update car");
    }
  };
  
  const handleDeleteGalleryImage = async (saId: string, imageId: string) => {
      if (!confirm("Delete this image?")) return;
      try {
          const sa = sas.find(s => s.sa_id === saId);
          if (!sa) return;
          
          const currentGallery = sa.gallery || [];
          const updatedGallery = currentGallery.filter((i: any) => i.id !== imageId);
          
          await api.updateSAGallery(saId, updatedGallery);
          
          // Update local state
          const updatedSA = { ...sa, gallery: updatedGallery };
          setSAs(prev => prev.map(s => s.sa_id === saId ? updatedSA : s));
          
          // If modal open, update modal data
          if (gallerySA && gallerySA.sa_id === saId) {
              setGallerySA(updatedSA);
          }
          
          toast.success("Image deleted");
      } catch {
          toast.error("Failed to delete image");
      }
  };

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
          const url = await api.uploadImage(file);
          setCarForm((prev: any) => ({ ...prev, image: url }));
          toast.success("Image uploaded");
      } catch (error) {
          toast.error("Failed to upload image");
      }
  };

  const handleAddAccessory = () => {
      const name = prompt("Enter accessory name:");
      if (!name) return;
      const priceStr = prompt("Enter price (RM):");
      if (!priceStr) return;
      
      const price = parseFloat(priceStr);
      if (isNaN(price)) return toast.error("Invalid price");
      
      const newAcc = { id: `a-${Date.now()}`, name, price };
      setCarForm((prev: any) => ({
          ...prev,
          accessories: [...(prev.accessories || []), newAcc]
      }));
  };

  const handleAddVariant = () => {
      const newVariant = { 
          id: `var-${Date.now()}`, 
          name: "New Variant", 
          price: 0 
      };
      setCarForm((prev: any) => ({
          ...prev,
          variants: [...(prev.variants || []), newVariant]
      }));
  };

  const handleUpdateVariant = (id: string, field: "name" | "price", value: string) => {
      setCarForm((prev: any) => ({
          ...prev,
          variants: prev.variants.map((v: any) => {
              if (v.id === id) {
                  return {
                      ...v,
                      [field]: field === "price" ? parseFloat(value) || 0 : value
                  };
              }
              return v;
          })
      }));
  };

  const handleRemoveVariant = (id: string) => {
      if (!confirm("Delete this variant?")) return;
      setCarForm((prev: any) => ({
          ...prev,
          variants: prev.variants.filter((v: any) => v.id !== id)
      }));
  };

  const handleAnalyticsOpen = (sa: any) => {
    setAnalyticsSA(sa);
    const kpi = sa.kpi || { visits: 0, inquiries: 0 };
    setAnalyticsForm({
      visits: kpi.visits || 0,
      inquiries: kpi.inquiries || 0
    });
  };

  const handleUpdateKPI = async () => {
      if (!analyticsSA) return;
      try {
          const visits = Number(analyticsForm.visits);
          const inquiries = Number(analyticsForm.inquiries);
          const newKPI = {
              visits,
              inquiries,
              conversionRate: visits > 0 ? Number(((inquiries / visits) * 100).toFixed(1)) : 0
          };
          
          await api.updateSAProfile(analyticsSA.sa_id, { kpi: newKPI });
          
          // Update local state
          const updatedSA = { ...analyticsSA, kpi: newKPI };
          setSAs(prev => prev.map(s => s.sa_id === analyticsSA.sa_id ? updatedSA : s));
          setAnalyticsSA(updatedSA);
          toast.success("KPI updated");
      } catch (e) {
          toast.error("Failed to update KPI");
      }
  };

  const handleExportAnalytics = () => {
    if (!analyticsSA) return;
    const kpi = analyticsSA.kpi || { visits: 0, inquiries: 0, conversionRate: 0 };
    const report = `OSL AUTOSALES - SA PERFORMANCE REPORT
-------------------------------------
Name: ${analyticsSA.name}
ID: ${analyticsSA.sa_id}
Branch: ${analyticsSA.branch}
Date: ${new Date().toLocaleDateString()}

METRICS:
- Profile Visits: ${kpi.visits}
- Leads/Inquiries: ${kpi.inquiries}
- Conversion Rate: ${kpi.conversionRate}%
- Followers: ${analyticsSA.followers?.length || 0}
- Rating: ${analyticsSA.rating || "N/A"} (${analyticsSA.reviewCount || 0} reviews)

SUMMARY:
The Sales Advisor has accumulated ${kpi.visits} profile visits and generated ${kpi.inquiries} leads.
Current conversion rate stands at ${kpi.conversionRate}%.`.trim();
    
    copyText(report, "Report");
  };

  const handleRemoveAccessory = (id: string) => {
      setCarForm((prev: any) => ({
          ...prev,
          accessories: prev.accessories.filter((a: any) => a.id !== id)
      }));
  };

  const handleEditPartner = (partner?: any) => {
    if (partner) {
      setPartnerForm({ ...partner, products: partner.products || [], supported_models: partner.supported_models || ["All"] });
    } else {
      setPartnerForm({
        id: "",
        business_name: "",
        logo_url: "",
        short_description: "",
        full_description: "",
        phone: "",
        whatsapp_url: "",
        website_url: "",
        address: "",
        map_url: "",
        display_order: partners.length + 1,
        is_active: true,
        is_featured: false,
        products: [],
        supported_models: ["All"]
      });
    }
    setEditingPartner(true);
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setProductForm({
        id: `prod-${Date.now()}`,
        image_url: "",
        title: "",
        description: "",
        discount_info: "",
        terms_conditions: "",
        expiry_date: "",
        supported_models: ["All"]
    });
    setEditingProduct(true);
  };

  const handleEditProduct = (product: any) => {
    setProductForm({ ...product });
    setEditingProduct(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.title) return toast.error("Product title is required");

    setPartnerForm((prev: any) => {
        const existingProducts = prev.products || [];
        const index = existingProducts.findIndex((p: any) => p.id === productForm.id);
        
        let newProducts;
        if (index >= 0) {
            newProducts = [...existingProducts];
            newProducts[index] = productForm;
        } else {
            newProducts = [...existingProducts, productForm];
        }
        
        return { ...prev, products: newProducts };
    });
    setEditingProduct(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm("Remove this product?")) return;
    setPartnerForm((prev: any) => ({
        ...prev,
        products: (prev.products || []).filter((p: any) => p.id !== productId)
    }));
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const url = await api.uploadImage(file);
          setProductForm((prev: any) => ({ ...prev, image_url: url }));
          toast.success("Product image uploaded");
      } catch {
          toast.error("Failed to upload image");
      }
  };


  const handleSavePartner = async () => {
    if (!partnerForm.business_name) {
        return toast.error("Business name is required");
    }
    // Remove logo requirement as per user request (or fallback)
    
    try {
      if (partnerForm.id) {
        await api.updatePartner(partnerForm.id, partnerForm);
        toast.success("Partner updated");
      } else {
        const { id, ...data } = partnerForm;
        await api.createPartner(data);
        toast.success("Partner created");
      }
      const data = await api.getPartners();
      setPartners(data);
      setEditingPartner(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save partner");
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    try {
      await api.deletePartner(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success("Partner deleted");
    } catch {
      toast.error("Failed to delete partner");
    }
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadImage(file);
      setPartnerForm((prev: any) => ({ ...prev, logo_url: url }));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    }
  };

  const handleProofAction = async (id: string, action: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${action} this proof?`)) return;
    try {
        await api.updateConsumptionProofStatus(id, action);
        setProofs(prev => prev.map(p => p.id === id ? { ...p, status: action } : p));
        toast.success(`Proof ${action}`);
    } catch {
        toast.error("Action failed");
    }
  };

  const handleReopenVoucher = async (id: string) => {
    if (!confirm("Are you sure you want to reopen this voucher? It will become active again.")) return;
    try {
        await api.adminReopenVoucher(id);
        setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: 'active', used_at: null } : v));
        toast.success("Voucher reopened");
    } catch {
        toast.error("Failed to reopen voucher");
    }
  };

  const handleUpdateUserPoints = async () => {
    if (!editingPointsUser) return;
    try {
        await api.adminSetUserPoints(editingPointsUser.email, pointsValue);
        setUsers(prev => prev.map(u => u.email === editingPointsUser.email ? { ...u, points: pointsValue } : u));
        setEditingPointsUser(null);
        toast.success("Points updated");
    } catch {
        toast.error("Failed to update points");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure? This will remove the sale record. Points may need manual adjustment.")) return;
    try {
        await api.adminDeleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast.success("Transaction deleted");
    } catch {
        toast.error("Failed to delete transaction");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSAs = sas.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.sa_id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLeads = leads.filter((l) =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search) ||
    l.region?.toLowerCase().includes(search.toLowerCase()) ||
    l.model?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase()) ||
    p.sa_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) =>
    t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.userName?.toLowerCase().includes(search.toLowerCase()) ||
    t.car_model?.toLowerCase().includes(search.toLowerCase()) ||
    t.modelName?.toLowerCase().includes(search.toLowerCase()) ||
    t.sa_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Locked</h1>
          <p className="text-muted-foreground mb-8">Please enter your admin credentials to unlock.</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            {lockError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {lockError}
              </div>
            )}
            
            <div className="text-left">
              <label className="block text-sm font-medium mb-1.5 ml-1">Admin ID</label>
              <input
                type="text"
                value={lockId}
                onChange={(e) => setLockId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:border-primary focus:outline-none"
                placeholder="Enter Admin ID"
              />
            </div>

            <div className="text-left">
              <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showLockPass ? "text" : "password"}
                  value={lockPass}
                  onChange={(e) => setLockPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:border-primary focus:outline-none pr-12"
                  placeholder="Enter Password"
                />
                <button
                  type="button"
                  onClick={() => setShowLockPass(!showLockPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium mt-4 hover:bg-primary/90 transition-colors"
            >
              Unlock Admin Panel
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Return to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">OSL Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLock}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                title="Lock Panel"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Lock</span>
              </button>
              <button
                onClick={() => {
                    sessionStorage.removeItem("osl_admin_auth");
                    navigate("/login");
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto pb-1 scrollbar-hide -mx-1">
            <div className="flex bg-white/10 p-1 rounded-xl gap-1 min-w-full sm:min-w-0">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "users" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("sas")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "sas" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Advisors
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "leads" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "posts" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab("codes")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "codes" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Codes
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "feedback" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("cars")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "cars" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Cars
              </button>
              <button
                onClick={() => setActiveTab("partners")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "partners" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Partners
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "sales" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveTab("approvals")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "approvals" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Approvals
                {proofs.filter(p => p.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {proofs.filter(p => p.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("vouchers")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === "vouchers" ? "bg-white text-primary shadow-sm" : "text-white/70 hover:bg-white/5"
                }`}
              >
                Vouchers
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-5 sm:p-8">
        {/* Search */}
        {activeTab !== 'codes' && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
             {/* Retry Button if empty and no users (likely error) */}
             {users.length === 0 && sas.length === 0 && leads.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-border">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-sm font-medium mb-1">No Data Found</h3>
                    <p className="text-xs text-muted-foreground mb-4">The database is empty or the connection failed.</p>
                    <div className="flex justify-center gap-2">
                        <button 
                            onClick={loadData}
                            className="px-4 py-2 bg-white border border-border text-foreground rounded-lg text-xs"
                        >
                            Retry Loading
                        </button>
                        <button 
                            onClick={async () => {
                                if (!confirm("This will reset the database to initial seed data. Continue?")) return;
                                try {
                                    setLoading(true);
                                    await api.seed();
                                    toast.success("Database seeded!");
                                    loadData();
                                } catch {
                                    toast.error("Seeding failed");
                                    setLoading(false);
                                }
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-xs"
                        >
                            Reset / Seed Data
                        </button>
                    </div>
                </div>
             )}

            {/* LEADS TAB */}
            {activeTab === "leads" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 truncate">{lead.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            lead.status === "HOT" ? "bg-red-100 text-red-600" :
                            lead.status === "WARM" ? "bg-orange-100 text-orange-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        <p className="text-sm text-muted-foreground">{lead.region}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{lead.model}</p>
                        <p className="text-xs text-muted-foreground">{lead.timeline}</p>
                        <p className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600 mt-1 inline-block">{lead.payment}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border flex gap-2">
                        <a 
                            href={`https://wa.me/6${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors font-medium"
                        >
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp
                        </a>
                        <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center">
                      Submitted: {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {filteredLeads.length === 0 && (
                    <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium text-gray-400">No leads found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                    </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.email} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-muted-foreground break-all">{user.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {user.points || 0} Points
                            </p>
                            <button 
                                onClick={() => {
                                    setEditingPointsUser(user);
                                    setPointsValue(user.points || 0);
                                }}
                                className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded"
                                title="Edit Points"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full capitalize font-medium ${
                        user.status === "banned" ? "bg-red-100 text-red-700" :
                        user.status === "suspended" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {user.status || "active"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
                      {user.status !== "active" && (
                        <button
                          onClick={() => updateUserStatus(user.email, "active")}
                          className="py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium"
                        >
                          Activate
                        </button>
                      )}
                      {user.status !== "suspended" && (
                        <button
                          onClick={() => updateUserStatus(user.email, "suspended")}
                          className="py-1.5 text-xs bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-medium"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status !== "banned" && (
                        <button
                          onClick={() => updateUserStatus(user.email, "banned")}
                          className="py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SAs TAB */}
            {activeTab === "sas" && (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete all legacy SAs (SA-001 to SA-005)? This cannot be undone.")) {
                         try {
                           await api.adminResetData();
                           toast.success("Legacy SAs deleted");
                           loadData();
                         } catch {
                           toast.error("Failed to delete data");
                         }
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Legacy SAs
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSAs.map((sa) => (
                  <div key={sa.sa_id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      {sa.avatar ? (
                        <ImageWithFallback src={sa.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                           <Users className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-bold text-gray-900">{sa.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{sa.email}</p>
                             </div>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                                sa.status === "banned" ? "bg-red-100 text-red-700" :
                                sa.status === "suspended" ? "bg-amber-100 text-amber-700" :
                                "bg-green-100 text-green-700"
                              }`}>
                                {sa.status || "active"}
                              </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{sa.branch}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{sa.sa_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 p-3 rounded-lg text-center">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Rating</p>
                            <p className="font-bold text-gray-900 flex items-center justify-center gap-1">
                                {sa.rating || 0} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Visits</p>
                            <p className="font-bold text-gray-900">{sa.kpi?.visits || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Leads</p>
                            <p className="font-bold text-gray-900">{sa.kpi?.inquiries || 0}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => openActionModal(sa, "warning")}
                            className="flex items-center justify-center gap-2 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning
                        </button>
                        <button
                            onClick={() => handleAnalyticsOpen(sa)}
                            className="flex items-center justify-center gap-2 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Analytics
                        </button>
                        
                        {sa.status !== "suspended" ? (
                             <button
                                onClick={() => openActionModal(sa, "suspend")}
                                className="flex items-center justify-center gap-2 py-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                             >
                                <Ban className="w-3.5 h-3.5" /> Suspend
                             </button>
                        ) : (
                             <button
                                onClick={() => updateSAStatus(sa.sa_id, "active")}
                                className="flex items-center justify-center gap-2 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                             >
                                <CheckCircle className="w-3.5 h-3.5" /> Activate
                             </button>
                        )}
                        
                        {sa.status !== "banned" ? (
                             <button
                                onClick={() => openActionModal(sa, "ban")}
                                className="flex items-center justify-center gap-2 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                             >
                                <LogOut className="w-3.5 h-3.5" /> Ban
                             </button>
                        ) : (
                             <button
                                onClick={() => updateSAStatus(sa.sa_id, "active")}
                                className="flex items-center justify-center gap-2 py-2 text-xs bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                             >
                                <CheckCircle className="w-3.5 h-3.5" /> Unban
                             </button>
                        )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* POSTS TAB */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex gap-3 mb-3">
                      <ImageWithFallback src={post.sa_avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{post.sa_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-bold mb-2 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-grow">{post.content}</p>
                    
                    {post.images && post.images.length > 0 && (
                        <div className="h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
                             <ImageWithFallback src={post.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    {!post.images && post.image_url && (
                        <div className="h-32 mb-4 rounded-lg overflow-hidden bg-gray-100">
                             <ImageWithFallback src={post.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 font-medium transition-colors mt-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                         <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                         <p className="text-sm">No posts found</p>
                    </div>
                )}
              </div>
            )}
            
            {/* CODES TAB */}
            {activeTab === "codes" && (
              <>
                <div className="bg-white p-4 rounded-xl border border-border mb-4">
                  <h3 className="text-sm font-medium mb-3">Generate Reference Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="Optional Custom Code"
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm uppercase"
                    />
                    <button
                      onClick={handleGenerateCode}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {codes.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No codes generated yet</p>}
                  {codes.map((code, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-lg">{code.code}</p>
                          <button onClick={() => handleCopyCode(code.code)} className="p-1 hover:bg-gray-100 rounded" title="Copy Code">
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Created: {new Date(code.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                          code.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {code.status}
                        </span>
                        {code.usedBy && (
                           <p className="text-[10px] text-muted-foreground">Used by: {code.usedBy}</p>
                        )}
                        {code.status === 'used' && (
                          <button onClick={() => handleDeleteCode(code.code)} className="text-red-500 text-[10px] hover:underline flex items-center gap-1">
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                        {code.status === 'active' && (
                             <button onClick={() => handleDeleteCode(code.code)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                             </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        For: <span className="text-primary font-medium">{sas.find(s => s.sa_id === review.sa_id)?.name || review.sa_id}</span>
                                    </p>
                                 </div>
                                 <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                    ))}
                                 </div>
                             </div>
                             
                             <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic mb-3 relative">
                                <span className="absolute top-1 left-1.5 text-gray-300 text-xl font-serif">"</span>
                                <p className="px-2">{review.comment}</p>
                             </div>
                             
                             <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Delete Review"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                             <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                             <p className="text-sm">No feedback received yet</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* PARTNERS TAB */}
            {activeTab === 'partners' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-sm">Automotive Service Partners</h3>
                        <button
                            onClick={() => handleEditPartner()}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Partner
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partners.sort((a,b) => a.display_order - b.display_order).map((partner) => (
                            <div key={partner.id} className="bg-white p-4 rounded-xl border border-border hover:shadow-md transition-all flex gap-4">
                                <div className="w-20 h-20 shrink-0 rounded-lg border border-border p-1 bg-gray-50 flex items-center justify-center">
                                    <ImageWithFallback src={partner.logo_url} alt="" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900 truncate">{partner.business_name}</h4>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleEditPartner(partner)} 
                                                className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePartner(partner.id)} 
                                                className="p-1.5 hover:bg-gray-100 rounded text-red-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{partner.short_description}</p>
                                    <div className="mt-auto flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${partner.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {partner.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            Order: {partner.display_order}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {partners.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                                <p>No partners added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CARS TAB */}
            {activeTab === 'cars' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {cars.map(car => (
                        <div key={car.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5">
                            <div className="w-full sm:w-40 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <ImageWithFallback 
                                    src={car.image} 
                                    alt={car.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{car.name}</h3>
                                        <p className="text-xs text-muted-foreground">{car.bodyType} · {car.variants?.length || 0} variants</p>
                                    </div>
                                    <button 
                                        onClick={() => handleEditCar(car)}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                </div>
                                
                                <div className="mt-2 mb-3">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Starting Price</p>
                                    <p className="font-bold text-primary text-lg">
                                        RM {car.startingPrice?.toLocaleString()}
                                    </p>
                                </div>
                                
                                {car.variants && car.variants.length > 0 && (
                                    <div className="mt-auto flex flex-wrap gap-1.5">
                                        {car.variants.slice(0, 3).map((v: any, idx: number) => (
                                            <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium truncate max-w-[100px]">
                                                {v.name}
                                            </span>
                                        ))}
                                        {car.variants.length > 3 && (
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                +{car.variants.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VOUCHERS TAB */}
            {activeTab === 'vouchers' && (
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">All Vouchers ({vouchers.length})</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vouchers.map(voucher => (
                            <div key={voucher.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-all relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0">
                                            {voucher.image_url ? (
                                                <ImageWithFallback src={voucher.image_url} alt="" className="w-full h-full object-contain" />
                                            ) : (
                                                <Ticket className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{voucher.title}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{voucher.user_email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                                        voucher.status === 'active' ? 'bg-green-100 text-green-700' :
                                        voucher.status === 'used' ? 'bg-gray-100 text-gray-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                        {voucher.status}
                                    </span>
                                </div>
                                
                                <p className="text-xs text-gray-600 line-clamp-2 mb-3 bg-gray-50 p-2 rounded-lg min-h-[3rem]">
                                    {voucher.description}
                                </p>
                                
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-auto">
                                    <span>Created: {new Date(voucher.created_at || voucher.createdAt || Date.now()).toLocaleDateString()}</span>
                                    {voucher.used_at && (
                                        <span>Used: {new Date(voucher.used_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                                
                                {voucher.status === 'used' && (
                                    <button
                                        onClick={() => handleReopenVoucher(voucher.id)}
                                        className="w-full mt-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <LogOut className="w-3.5 h-3.5 rotate-180" /> Reopen Voucher
                                    </button>
                                )}
                            </div>
                        ))}
                        {vouchers.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No vouchers found</p>
                            </div>
                        )}
                     </div>
                </div>
            )}

            {/* SALES TAB */}
            {activeTab === 'sales' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTransactions.map((tx) => {
                            const sa = sas.find(s => s.sa_id === tx.sa_id);
                            const date = new Date(tx.purchase_date || tx.created_at || tx.createdAt || Date.now());
                            
                            return (
                                <div key={tx.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 overflow-hidden">
                                                {sa ? (sa.avatar ? <ImageWithFallback src={sa.avatar} alt="" className="w-full h-full object-cover" /> : sa.name.charAt(0)) : "?"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{sa?.name || "Unknown SA"}</p>
                                                <p className="text-[10px] text-muted-foreground">{tx.sa_id}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                                            tx.status === 'confirmed' || tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                    
                                    <div className="py-3 border-t border-dashed border-gray-100 space-y-2 flex-grow">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Customer</p>
                                            <p className="text-sm font-medium text-gray-900">{tx.userName || tx.user_email || "N/A"}</p>
                                            {tx.user_email && tx.userName && <p className="text-xs text-muted-foreground">{tx.user_email}</p>}
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Vehicle</p>
                                            <p className="text-sm font-bold text-primary">{tx.modelName || tx.car_model || "Unknown Model"}</p>
                                            {(tx.variantName || tx.colorName) && (
                                                <p className="text-xs text-muted-foreground">
                                                    {[tx.variantName, tx.colorName].filter(Boolean).join(" • ")}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Price</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                RM {(tx.totalPrice || tx.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
                                        <p className="text-[10px] text-muted-foreground">
                                            {date.toLocaleDateString()}
                                        </p>
                                        <button 
                                            onClick={() => handleDeleteTransaction(tx.id)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {filteredTransactions.length === 0 && (
                            <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-lg font-medium text-gray-400">No sales records found</p>
                                <p className="text-sm text-gray-400">Transactions submitted by SAs will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
                <div className="space-y-4">
                     <h3 className="font-bold text-gray-800">Pending Approvals ({proofs.length})</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proofs.map(proof => (
                            <div key={proof.id} className="bg-white p-5 rounded-xl border border-border hover:shadow-md transition-shadow relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-gray-900">{proof.user_name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                                        proof.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        proof.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {proof.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{proof.user_email}</p>
                                
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                                    <p className="text-xs font-bold text-gray-700 mb-1">{proof.voucher_title}</p>
                                    <p className="text-xs text-muted-foreground">Invoice: RM {proof.invoice_amount.toLocaleString()}</p>
                                    {proof.notes && <p className="text-xs text-gray-500 italic mt-1">"{proof.notes}"</p>}
                                </div>
                                
                                {proof.invoice_image && (
                                    <div className="h-40 mb-3 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group cursor-pointer" onClick={() => window.open(proof.invoice_image, '_blank')}>
                                        <ImageWithFallback src={proof.invoice_image} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                            View Full Image
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-4">
                                    <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                {proof.status === 'pending' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleProofAction(proof.id, 'rejected')}
                                            className="py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => handleProofAction(proof.id, 'approved')}
                                            className="py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {proofs.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-2xl">
                                <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No proofs pending</p>
                            </div>
                        )}
                     </div>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal (Warning/Ban/Suspend) */}
      {actionSA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 capitalize">{actionType} Sales Advisor</h3>
              <button onClick={closeActionModal} className="p-1 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <ImageWithFallback src={actionSA.avatar} alt="" className="w-12 h-12 rounded-full border border-gray-200" />
                <div>
                  <p className="font-bold text-gray-900">{actionSA.name}</p>
                  <p className="text-xs text-muted-foreground">{actionSA.branch}</p>
                </div>
              </div>

              {actionType === 'warning' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Warning Title</label>
                    <input 
                      type="text" 
                      value={actionForm.title} 
                      onChange={(e) => setActionForm({...actionForm, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      placeholder="e.g. Policy Violation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
                    <textarea 
                      value={actionForm.message} 
                      onChange={(e) => setActionForm({...actionForm, message: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:border-primary focus:outline-none"
                      placeholder="Explain the issue..."
                    />
                  </div>
                </>
              )}

              {(actionType === 'ban' || actionType === 'suspend') && (
                <>
                  {actionType === 'ban' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ban Duration (Days)</label>
                      <input 
                        type="number" 
                        value={actionForm.duration} 
                        onChange={(e) => setActionForm({...actionForm, duration: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reason (Required)</label>
                    <textarea 
                      value={actionForm.reason} 
                      onChange={(e) => setActionForm({...actionForm, reason: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:border-primary focus:outline-none"
                      placeholder={`Why is this SA being ${actionType}ed?`}
                    />
                  </div>
                </>
              )}
              
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  {actionType === 'warning' ? 'This warning will be sent to the SA immediately.' : 
                   actionType === 'ban' ? 'Banned SAs cannot log in or access their dashboard.' : 
                   'Suspended SAs are hidden from the public list but can still log in.'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
              <button onClick={closeActionModal} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button 
                onClick={submitAction} 
                className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow-sm ${
                  actionType === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionType === 'warning' ? 'Warning' : actionType === 'ban' ? 'Ban' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {gallerySA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-bold">Gallery: {gallerySA.name}</h3>
                      <button onClick={() => setGallerySA(null)} className="p-1 hover:bg-gray-100 rounded-full">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-4 overflow-y-auto flex-1">
                      {(!gallerySA.gallery || gallerySA.gallery.length === 0) ? (
                          <div className="text-center py-10 text-muted-foreground">
                              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                              <p>No photos in gallery</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {gallerySA.gallery.map((item: any) => (
                                  <div key={item.id} className="relative group rounded-lg overflow-hidden aspect-square border border-border">
                                      <ImageWithFallback src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                          <p className="text-[10px] text-white line-clamp-2 mb-2">{item.caption}</p>
                                          <button 
                                              onClick={() => handleDeleteGalleryImage(gallerySA.sa_id, item.id)}
                                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Edit Car Modal */}
      {editingCar && carForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-white">
                      <h3 className="font-bold">Edit Car: {editingCar.modelName}</h3>
                      <button onClick={() => setEditingCar(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto flex-1 space-y-4">
                      {/* Basic Info */}
                      <div className="space-y-3">
                          <h4 className="text-sm font-bold border-b pb-1">Basic Info</h4>
                          <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Model Name</label>
                              <input 
                                  type="text" 
                                  value={carForm.name || ""} 
                                  onChange={(e) => setCarForm({...carForm, name: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                           <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Tagline</label>
                              <input 
                                  type="text" 
                                  value={carForm.tagline || ""} 
                                  onChange={(e) => setCarForm({...carForm, tagline: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Price Range</label>
                              <input 
                                  type="text" 
                                  value={carForm.priceRange || ""} 
                                  onChange={(e) => setCarForm({...carForm, priceRange: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                      </div>

                      {/* Variants / Specs */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center border-b pb-1">
                              <h4 className="text-sm font-bold">Specs / Variants</h4>
                              <button 
                                  onClick={handleAddVariant}
                                  className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 flex items-center gap-1"
                              >
                                  <Plus className="w-3 h-3" /> Add Variant
                              </button>
                          </div>
                          
                          {(!carForm.variants || carForm.variants.length === 0) ? (
                              <p className="text-xs text-muted-foreground italic text-center py-2">No variants added.</p>
                          ) : (
                              <div className="space-y-2">
                                  {carForm.variants.map((variant: any) => (
                                      <div key={variant.id} className="bg-accent/30 p-2.5 rounded-lg border border-border flex items-center gap-2">
                                          <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                                              <div>
                                                  <label className="text-[10px] text-muted-foreground block">Name</label>
                                                  <input 
                                                      type="text"
                                                      value={variant.name}
                                                      onChange={(e) => handleUpdateVariant(variant.id, "name", e.target.value)}
                                                      className="w-full text-xs px-2 py-1 border border-border rounded bg-white"
                                                  />
                                              </div>
                                              <div>
                                                  <label className="text-[10px] text-muted-foreground block">Price (RM)</label>
                                                  <input 
                                                      type="number"
                                                      value={variant.price}
                                                      onChange={(e) => handleUpdateVariant(variant.id, "price", e.target.value)}
                                                      className="w-full text-xs px-2 py-1 border border-border rounded bg-white"
                                                  />
                                              </div>
                                          </div>
                                          <button 
                                              onClick={() => handleRemoveVariant(variant.id)}
                                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors self-end mb-0.5"
                                              title="Delete Variant"
                                          >
                                              <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Image */}
                      <div className="space-y-3">
                          <h4 className="text-sm font-bold border-b pb-1">Image</h4>
                          <div className="flex gap-4 items-center">
                              <ImageWithFallback src={carForm.image} alt="" className="w-24 h-16 rounded-lg object-cover bg-gray-100 border border-border" />
                              <div className="flex-1">
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Change Image</label>
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={handleCarImageUpload}
                                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full"
                                  />
                                  <p className="text-[10px] text-muted-foreground mt-1">Upload a new image to replace the current one.</p>
                              </div>
                          </div>
                      </div>

                      {/* Accessories */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center border-b pb-1">
                              <h4 className="text-sm font-bold">Accessories</h4>
                              <button 
                                  onClick={handleAddAccessory}
                                  className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 flex items-center gap-1"
                              >
                                  <Plus className="w-3 h-3" /> Add New
                              </button>
                          </div>
                          
                          {(!carForm.accessories || carForm.accessories.length === 0) ? (
                              <p className="text-xs text-muted-foreground italic text-center py-2">No accessories added.</p>
                          ) : (
                              <div className="grid grid-cols-1 gap-2">
                                  {carForm.accessories.map((acc: any) => (
                                      <div key={acc.id} className="flex justify-between items-center bg-accent/50 p-2 rounded-lg border border-border">
                                          <div>
                                              <p className="text-xs font-medium">{acc.name}</p>
                                              <p className="text-[10px] text-muted-foreground">RM {acc.price.toLocaleString()}</p>
                                          </div>
                                          <button 
                                              onClick={() => handleRemoveAccessory(acc.id)}
                                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                          >
                                              <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
                      <button 
                          onClick={() => setEditingCar(null)}
                          className="px-4 py-2 border border-border bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveCar}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                          <Save className="w-4 h-4" />
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}

      {analyticsSA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-white">
                      <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          <h3 className="font-bold">Analytics: {analyticsSA.name}</h3>
                      </div>
                      <button onClick={() => setAnalyticsSA(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto flex-1 space-y-6">
                      {/* KPI Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium mb-1">Profile Visits</p>
                              <p className="text-xl font-bold text-blue-900">{analyticsSA.kpi?.visits || 0}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                              <p className="text-xs text-green-600 font-medium mb-1">Leads / Inquiries</p>
                              <p className="text-xl font-bold text-green-900">{analyticsSA.kpi?.inquiries || 0}</p>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                              <p className="text-xs text-amber-600 font-medium mb-1">Conversion Rate</p>
                              <p className="text-xl font-bold text-amber-900">{analyticsSA.kpi?.conversionRate || 0}%</p>
                          </div>
                           <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                              <p className="text-xs text-purple-600 font-medium mb-1">Followers</p>
                              <p className="text-xl font-bold text-purple-900">{analyticsSA.followers?.length || 0}</p>
                          </div>
                      </div>

                      {/* Charts Area */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-border">
                          <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              Traffic vs Leads
                          </h4>
                          <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                      { name: 'Visits', value: analyticsSA.kpi?.visits || 0 },
                                      { name: 'Inquiries', value: analyticsSA.kpi?.inquiries || 0 },
                                      { name: 'Conv. %', value: analyticsSA.kpi?.conversionRate || 0 }
                                  ]}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                      <RechartsTooltip 
                                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                      />
                                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Manual Data Entry */}
                      <div className="bg-white border border-border p-4 rounded-xl">
                          <h4 className="text-sm font-bold mb-3">Update Performance Data (Manual Entry)</h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">Total Visits</label>
                                  <input 
                                      type="number" 
                                      value={analyticsForm.visits}
                                      onChange={(e) => setAnalyticsForm({...analyticsForm, visits: e.target.value})}
                                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">Total Inquiries</label>
                                  <input 
                                      type="number" 
                                      value={analyticsForm.inquiries}
                                      onChange={(e) => setAnalyticsForm({...analyticsForm, inquiries: e.target.value})}
                                      className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                                  />
                              </div>
                          </div>
                          <button 
                              onClick={handleUpdateKPI}
                              className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                              Update KPI Data
                          </button>
                      </div>
                  </div>

                  <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
                      <button 
                          onClick={handleExportAnalytics}
                          className="px-4 py-2 bg-white border border-border text-foreground rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                          <Share2 className="w-4 h-4" />
                          Export Report
                      </button>
                      <button 
                          onClick={() => setAnalyticsSA(null)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
            {/* SALES TAB */}
      {activeTab === 'sales' && (
          <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                  <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                      <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-slate-900 font-medium">No Sales Found</h3>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search.</p>
                  </div>
              )}
              
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-medium">
                              <tr>
                                  <th className="px-4 py-3">Date</th>
                                  <th className="px-4 py-3">Customer</th>
                                  <th className="px-4 py-3">SA</th>
                                  <th className="px-4 py-3">Car Model</th>
                                  <th className="px-4 py-3">Price</th>
                                  <th className="px-4 py-3 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {filteredTransactions.sort((a,b) => new Date(b.purchase_date || b.createdAt).getTime() - new Date(a.purchase_date || a.createdAt).getTime()).map((txn: any) => (
                                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(txn.purchase_date || txn.createdAt).toLocaleDateString()}</td>
                                      <td className="px-4 py-3 font-medium text-slate-900">{txn.user_email || txn.userName}</td>
                                      <td className="px-4 py-3 text-slate-600">{sas.find(s => s.sa_id === txn.sa_id)?.name || txn.sa_id}</td>
                                      <td className="px-4 py-3">
                                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{txn.car_model || txn.modelName}</span>
                                      </td>
                                      <td className="px-4 py-3 font-medium text-slate-900">RM {(txn.price || txn.totalPrice)?.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-right">
                                          <button 
                                              onClick={() => handleDeleteTransaction(txn.id)}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                              title="Delete Transaction"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </td>
                              </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
      {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
                <div className="space-y-4">
                    {proofs.length === 0 && (
                        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                            <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-slate-900 font-medium">No Proofs Submitted</h3>
                            <p className="text-xs text-slate-500 mt-1">Wait for users to submit receipts.</p>
                        </div>
                    )}
                    
                    {proofs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(proof => (
                        <div key={proof.id} className="bg-white p-5 rounded-xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900">{proof.user_name}</h4>
                                        <span className="text-xs text-slate-400">({proof.user_email})</span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Submitted for <span className="font-medium text-primary">{proof.voucher_title}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Submitted on {new Date(proof.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                    proof.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    proof.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {proof.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Amount</p>
                                    <p className="text-lg font-bold text-slate-900">RM {proof.invoice_amount?.toFixed(2)}</p>
                                    
                                    {proof.notes && (
                                        <>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1 mt-3">Notes</p>
                                            <p className="text-sm text-slate-600 italic">"{proof.notes}"</p>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Receipt Image</p>
                                    {proof.invoice_image ? (
                                        <a href={proof.invoice_image} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-lg h-32 w-full bg-white border border-slate-200">
                                            <ImageWithFallback src={proof.invoice_image} alt="Receipt" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                Click to view
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">No Image</div>
                                    )}
                                </div>
                            </div>

                            {proof.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleProofAction(proof.id, 'rejected')}
                                        className="flex-1 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleProofAction(proof.id, 'approved')}
                                        className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Approve & Add Points
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
      {/* Edit Partner Modal */}
      {editingPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-white">
                      <h3 className="font-bold">{partnerForm.id ? 'Edit Partner' : 'New Partner'}</h3>
                      <button onClick={() => setEditingPartner(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto flex-1 space-y-4">
                      {/* Logo */}
                      <div className="flex gap-4 items-center">
                          <div className="w-24 h-24 border border-border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                              {partnerForm.logo_url ? (
                                  <ImageWithFallback src={partnerForm.logo_url} alt="" className="w-full h-full object-contain" />
                              ) : (
                                  <ImageIcon className="w-8 h-8 text-gray-300" />
                              )}
                          </div>
                          <div className="flex-1 space-y-2">
                              <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Upload Logo</label>
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={handlePartnerLogoUpload}
                                      className="text-xs w-full"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Or Logo URL</label>
                                  <input 
                                      type="text" 
                                      value={partnerForm.logo_url} 
                                      onChange={(e) => setPartnerForm({...partnerForm, logo_url: e.target.value})}
                                      className="w-full border border-border rounded-lg px-3 py-2 text-xs"
                                      placeholder="https://..."
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Business Name</label>
                              <input 
                                  type="text" 
                                  value={partnerForm.business_name} 
                                  onChange={(e) => setPartnerForm({...partnerForm, business_name: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Short Description</label>
                              <input 
                                  type="text" 
                                  value={partnerForm.short_description} 
                                  onChange={(e) => setPartnerForm({...partnerForm, short_description: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Full Description</label>
                              <textarea 
                                  value={partnerForm.full_description} 
                                  onChange={(e) => setPartnerForm({...partnerForm, full_description: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm h-24 resize-none"
                              />
                          </div>
                          
                          <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
                              <input 
                                  type="text" 
                                  value={partnerForm.phone} 
                                  onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">WhatsApp Number</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">+60</span>
                                  <input 
                                      type="text" 
                                      value={partnerForm.whatsapp_url} 
                                      onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          setPartnerForm({...partnerForm, whatsapp_url: val.startsWith('60') ? val : (val.startsWith('0') ? '6' + val : val)});
                                      }}
                                      className="w-full pl-10 border border-border rounded-lg px-3 py-2 text-sm"
                                      placeholder="123456789"
                                  />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Enter number only (e.g. 123456789). Will be formatted as +60...</p>
                          </div>
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Address</label>
                              <textarea 
                                  value={partnerForm.address} 
                                  onChange={(e) => setPartnerForm({...partnerForm, address: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Google Maps Link</label>
                              <input 
                                  type="text" 
                                  value={partnerForm.map_url} 
                                  onChange={(e) => setPartnerForm({...partnerForm, map_url: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                                  placeholder="https://maps.google.com/..."
                              />
                          </div>
                          <div>
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Website URL</label>
                              <input 
                                  type="text" 
                                  value={partnerForm.website_url} 
                                  onChange={(e) => setPartnerForm({...partnerForm, website_url: e.target.value})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          
                          <div className="col-span-2 border-t border-border pt-4 mt-2">
                              <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-gray-900">Products & Promotions</h4>
                                  <button 
                                      onClick={handleAddProduct}
                                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors"
                                  >
                                      <Plus className="w-3.5 h-3.5" /> Add Product
                                  </button>
                              </div>
                              
                              <div className="space-y-3">
                                  {(!partnerForm.products || partnerForm.products.length === 0) && (
                                      <p className="text-xs text-muted-foreground text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                          No products added yet.
                                      </p>
                                  )}
                                  
                                  {(partnerForm.products || []).map((prod: any) => (
                                      <div key={prod.id} className="flex gap-3 bg-white p-3 rounded-xl border border-border items-start group hover:border-primary/30 transition-colors">
                                          <div className="w-12 h-12 bg-gray-50 rounded-lg border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                              {prod.image_url ? (
                                                  <ImageWithFallback src={prod.image_url} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                  <ImageIcon className="w-5 h-5 text-gray-300" />
                                              )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="text-sm font-bold text-gray-900 truncate">{prod.title}</p>
                                              <p className="text-xs text-muted-foreground line-clamp-1">{prod.description || "No description"}</p>
                                              {prod.discount_info && (
                                                  <span className="inline-block mt-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 font-medium">
                                                      {prod.discount_info}
                                                  </span>
                                              )}
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button 
                                                  onClick={() => handleEditProduct(prod)}
                                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              >
                                                  <Pencil className="w-3.5 h-3.5" />
                                              </button>
                                              <button 
                                                  onClick={() => handleDeleteProduct(prod.id)}
                                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                              >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>


                          <div className="col-span-2 border-t border-border pt-4 mt-2">
                              <h4 className="text-sm font-bold mb-3 text-gray-900">Settings</h4>
                          </div>
                          
                          <div className="col-span-2">
                              <label className="text-xs font-medium text-muted-foreground block mb-1">Display Order</label>
                              <input 
                                  type="number" 
                                  value={partnerForm.display_order} 
                                  onChange={(e) => setPartnerForm({...partnerForm, display_order: parseInt(e.target.value) || 0})}
                                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              />
                          </div>

                          <div className="flex items-center gap-2">
                              <input 
                                  type="checkbox" 
                                  id="p_active"
                                  checked={partnerForm.is_active} 
                                  onChange={(e) => setPartnerForm({...partnerForm, is_active: e.target.checked})}
                              />
                              <label htmlFor="p_active" className="text-sm">Active</label>
                          </div>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="checkbox" 
                                  id="p_featured"
                                  checked={partnerForm.is_featured} 
                                  onChange={(e) => setPartnerForm({...partnerForm, is_featured: e.target.checked})}
                              />
                              <label htmlFor="p_featured" className="text-sm">Featured</label>
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
                      <button 
                          onClick={() => setEditingPartner(false)}
                          className="px-4 py-2 border border-border bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSavePartner}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                          <Save className="w-4 h-4" />
                          Save Partner
                      </button>
                  </div>
              </div>
          </div>
      )}
      {/* Product Edit Modal */}
      {editingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-white text-gray-900">
                      <h3 className="font-bold">Edit Product</h3>
                      <button onClick={() => setEditingProduct(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto flex-1 space-y-4">
                      <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Product Image</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  value={productForm.image_url || ""} 
                                  onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                                  className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                                  placeholder="https://..."
                              />
                              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg border border-border transition-colors flex items-center justify-center min-w-[44px]">
                                  <ImageIcon className="w-4 h-4 text-gray-600" />
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={handleProductImageUpload}
                                      className="hidden" 
                                  />
                              </label>
                          </div>
                          {productForm.image_url && (
                              <div className="mt-2 w-full h-32 bg-gray-50 rounded-lg border border-border overflow-hidden relative group">
                                  <ImageWithFallback src={productForm.image_url} alt="Preview" className="w-full h-full object-contain" />
                                  <button 
                                      onClick={() => setProductForm({...productForm, image_url: ""})}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <X className="w-3 h-3" />
                                  </button>
                              </div>
                          )}
                      </div>

                      <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Title</label>
                          <input 
                              type="text" 
                              value={productForm.title || ""} 
                              onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              placeholder="e.g. Free Tinting Voucher"
                          />
                      </div>

                      <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                          <textarea 
                              value={productForm.description || ""} 
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm h-20 resize-none"
                              placeholder="Details..."
                          />
                      </div>

                      <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Discount Label</label>
                          <input 
                              type="text" 
                              value={productForm.discount_info || ""} 
                              onChange={(e) => setProductForm({...productForm, discount_info: e.target.value})}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                              placeholder="e.g. 20% OFF"
                          />
                      </div>

                      <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Supported Car Models (Voucher Eligibility)</label>
                          <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-lg border border-border">
                              <label className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded border border-gray-200 hover:border-primary transition-colors">
                                  <input 
                                      type="checkbox"
                                      checked={(productForm.supported_models || ["All"]).includes("All")}
                                      onChange={(e) => {
                                          if (e.target.checked) {
                                              setProductForm({...productForm, supported_models: ["All"]});
                                          } else {
                                              setProductForm({...productForm, supported_models: []});
                                          }
                                      }}
                                      className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                                  />
                                  <span className="text-sm font-medium">All Models</span>
                              </label>
                              
                              {cars.map((car: any) => (
                                  <label key={car.id} className={`flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded border border-gray-200 hover:border-primary transition-colors ${(productForm.supported_models || ["All"]).includes("All") ? 'opacity-50 pointer-events-none' : ''}`}>
                                      <input 
                                          type="checkbox"
                                          checked={(productForm.supported_models || []).includes(car.name) && !(productForm.supported_models || []).includes("All")}
                                          onChange={(e) => {
                                              const current = productForm.supported_models || [];
                                              let newModels = [...current];
                                              if (newModels.includes("All")) newModels = [];

                                              if (e.target.checked) {
                                                  if (!newModels.includes(car.name)) newModels.push(car.name);
                                              } else {
                                                  newModels = newModels.filter((m: string) => m !== car.name);
                                              }
                                              setProductForm({...productForm, supported_models: newModels});
                                          }}
                                          disabled={(productForm.supported_models || ["All"]).includes("All")}
                                          className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 disabled:opacity-50"
                                      />
                                      <span className="text-sm">{car.name}</span>
                                  </label>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Expiry Date</label>
                          <input 
                              type="date" 
                              value={productForm.expiry_date || ""} 
                              onChange={(e) => setProductForm({...productForm, expiry_date: e.target.value})}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                          />
                      </div>

                      <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Terms & Conditions</label>
                          <textarea 
                              value={productForm.terms_conditions || ""} 
                              onChange={(e) => setProductForm({...productForm, terms_conditions: e.target.value})}
                              className="w-full border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none"
                              placeholder="Specific terms..."
                          />
                      </div>
                  </div>

                  <div className="p-4 border-t border-border bg-gray-50 flex justify-end gap-2">
                      <button 
                          onClick={() => setEditingProduct(false)}
                          className="px-4 py-2 border border-border bg-white rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveProduct}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                      >
                          Save Product
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Edit Points Modal */}
      {editingPointsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                  <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">Edit User Points</h3>
                      <button onClick={() => setEditingPointsUser(null)} className="p-1 hover:bg-gray-200 rounded-full">
                          <X className="w-5 h-5 text-gray-500" />
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="flex items-center gap-3 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {editingPointsUser.name ? editingPointsUser.name.charAt(0) : 'U'}
                          </div>
                          <div>
                                <p className="font-bold text-sm text-gray-900">{editingPointsUser.name}</p>
                                <p className="text-xs text-blue-600">{editingPointsUser.email}</p>
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Points Balance</label>
                              <div className="relative">
                                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 fill-amber-400" />
                                  <input 
                                      type="number" 
                                      value={pointsValue}
                                      onChange={(e) => setPointsValue(parseInt(e.target.value) || 0)}
                                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:border-primary focus:bg-white focus:outline-none transition-all"
                                  />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2">
                                  Adjusting points will immediately update the user's balance. Use with caution.
                              </p>
                          </div>
                          
                          <button 
                              onClick={handleUpdateUserPoints}
                              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                          >
                              Update Balance
                          </button>
                      </div>
                  </div>
             </div>
        </div>
      )}
    </div>
  );
}