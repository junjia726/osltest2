import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Store, 
  Settings, 
  Package, 
  CreditCard, 
  LogOut, 
  Save, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  ImageIcon, 
  X,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Calendar,
  Search,
  Menu,
  FileText,
  Star
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useUser } from "../components/UserContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";
import * as api from "../lib/api";

export function PartnerPanel() {
  const navigate = useNavigate();
  const { role, profile, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'products' | 'redemptions' | 'points'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Partner Data State
  const [partnerData, setPartnerData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  
  // Vouchers & Points Data
  const [vouchers, setVouchers] = useState<api.UserVoucher[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([
      { id: "tx-101", user_email: "ali@example.com", amount: 150.00, points: 150, date: "2024-02-20T10:00:00Z" },
      { id: "tx-102", user_email: "sara@example.com", amount: 340.50, points: 340, date: "2024-02-21T14:30:00Z" },
  ]);
  
  // Forms
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<any>({});
  const [showMinPointsWarning, setShowMinPointsWarning] = useState(false);
  
  // Issue Points Form
  const [showIssuePoints, setShowIssuePoints] = useState(false);
  const [issueForm, setIssueForm] = useState({ email: "", amount: "" });

  useEffect(() => {
    if (role !== 'external_partner') {
      navigate('/login');
      return;
    }
    fetchPartnerData();
  }, [role, navigate, profile.id]);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const data = await api.getPartnerById(profile.id);
      setPartnerData(data);
      setOriginalData(JSON.parse(JSON.stringify(data))); 

      const allVouchers = await api.adminGetAllVouchers();
      const myVouchers = allVouchers.filter(v => v.partner_id === profile.id);
      setVouchers(myVouchers);
      
    } catch (e) {
      console.error("Failed to fetch partner data", e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!partnerData) return;
    setSaving(true);
    try {
      await api.updatePartner(partnerData.id, partnerData);
      setOriginalData(JSON.parse(JSON.stringify(partnerData)));
      toast.success("Changes saved successfully!");
    } catch (e) {
      console.error("Save failed", e);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val}"` : val;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export successful!");
  };

  const handleIssuePoints = async () => {
      if (!issueForm.email || !issueForm.amount) {
          toast.error("Please fill in all fields");
          return;
      }
      
      const amount = parseFloat(issueForm.amount);
      const pointsToAdd = Math.floor(amount); // 1 RM = 1 Point logic
      
      setLoading(true);
      try {
          // 1. Get User Profile to check existence and current points
          const userProfile = await api.getUserProfile(issueForm.email);
          if (!userProfile) {
              toast.error("User not found");
              setLoading(false);
              return;
          }

          // 2. Calculate new total
          const currentPoints = userProfile.points || 0;
          const newTotal = currentPoints + pointsToAdd;

          // 3. Update User Points
          await api.adminSetUserPoints(issueForm.email, newTotal);

          // 4. Update Local History
          const newTx = {
              id: `tx-${Date.now()}`,
              user_email: issueForm.email,
              amount: amount,
              points: pointsToAdd,
              date: new Date().toISOString()
          };
          
          setPointsHistory([newTx, ...pointsHistory]);
          setIssueForm({ email: "", amount: "" });
          setShowIssuePoints(false);
          toast.success(`Successfully issued ${pointsToAdd} points to ${newTx.user_email}`);
      } catch (e) {
          console.error("Failed to issue points", e);
          toast.error("Failed to issue points. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleProductSave = () => {
    if (!productForm.title) {
        toast.error("Product title is required");
        return;
    }

    const newProducts = [...(partnerData.products || [])];
    
    if (editingProduct?.id) {
        const index = newProducts.findIndex(p => p.id === editingProduct.id);
        if (index !== -1) {
            newProducts[index] = { ...productForm, id: editingProduct.id };
        }
    } else {
        newProducts.push({
            ...productForm,
            id: `prod-${Date.now()}`
        });
    }
    
    setPartnerData({ ...partnerData, products: newProducts });
    setEditingProduct(null);
    setProductForm({});
    setShowMinPointsWarning(false);
  };

  const handleDeleteProduct = (prodId: string) => {
      if (confirm("Are you sure you want to delete this product?")) {
          const newProducts = (partnerData.products || []).filter((p: any) => p.id !== prodId);
          setPartnerData({ ...partnerData, products: newProducts });
      }
  };
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await api.uploadImage(file);
      setPartnerData({ ...partnerData, logo_url: url });
    } catch (error) {
      toast.error("Failed to upload logo");
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await api.uploadImage(file);
      setProductForm({ ...productForm, image_url: url });
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const totalRedemptions = vouchers.filter(v => v.status === 'used').length;
  const activeRedemptions = vouchers.filter(v => v.status === 'active').length;
  const totalProducts = partnerData?.products?.length || 0;
  
  const chartData = [
    { name: 'Mon', redemptions: 4 },
    { name: 'Tue', redemptions: 3 },
    { name: 'Wed', redemptions: 7 },
    { name: 'Thu', redemptions: 5 },
    { name: 'Fri', redemptions: 8 },
    { name: 'Sat', redemptions: 12 },
    { name: 'Sun', redemptions: 10 },
  ];

  if (loading || !partnerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const hasChanges = JSON.stringify(partnerData) !== JSON.stringify(originalData);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header (Clean & Minimal) */}
      <div className="md:hidden bg-white border-b border-slate-100 p-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Store className="w-4 h-4" />
              </div>
              <div>
                  <h1 className="font-bold text-lg text-slate-900 leading-none">PartnerHub</h1>
                  <p className="text-[10px] text-slate-400">Enterprise</p>
              </div>
          </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
            
            {/* Drawer Content */}
            <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
                 <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                            <Store className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 leading-none">PartnerHub</h1>
                            <p className="text-[10px] text-slate-400">v2.4.0</p>
                        </div>
                     </div>
                     <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                     </button>
                 </div>
                 
                 <nav className="space-y-2 flex-1">
                     <button 
                        onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <Activity className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-red-600' : 'text-slate-400'}`} /> Dashboard
                     </button>
                     <button 
                        onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <Settings className={`w-5 h-5 ${activeTab === 'profile' ? 'text-red-600' : 'text-slate-400'}`} /> Shop Profile
                     </button>
                     <button 
                        onClick={() => { setActiveTab('products'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <Package className={`w-5 h-5 ${activeTab === 'products' ? 'text-red-600' : 'text-slate-400'}`} /> Products & Offers
                     </button>
                     <button 
                        onClick={() => { setActiveTab('redemptions'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'redemptions' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <QrCode className={`w-5 h-5 ${activeTab === 'redemptions' ? 'text-red-600' : 'text-slate-400'}`} /> Redemptions
                     </button>
                     <button 
                        onClick={() => { setActiveTab('points'); setIsMenuOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'points' ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <TrendingUp className={`w-5 h-5 ${activeTab === 'points' ? 'text-red-600' : 'text-slate-400'}`} /> Points Issued
                     </button>
                 </nav>
    
                 <div className="pt-6 border-t border-slate-100 pb-4">
                     <button 
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                     >
                        <LogOut className="w-5 h-5 text-slate-400" /> Sign Out
                     </button>
                 </div>
            </div>
        </div>
      )}

      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-shrink-0 z-40 sticky top-0 h-screen flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <Store className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">Partner<span className="text-primary">Hub</span></h1>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">v2.4.0 • Enterprise</p>
                </div>
            </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
                <Activity className="w-5 h-5" /> Dashboard
             </button>
             <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
                <Settings className="w-5 h-5" /> Shop Profile
             </button>
             <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
                <Package className="w-5 h-5" /> Products & Offers
             </button>
             <button 
                onClick={() => setActiveTab('redemptions')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'redemptions' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
                <QrCode className="w-5 h-5" /> Redemptions
                {activeRedemptions > 0 && (
                    <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{activeRedemptions}</span>
                )}
             </button>
             <button 
                onClick={() => setActiveTab('points')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'points' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
                <TrendingUp className="w-5 h-5" /> Points History
             </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
             <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
             >
                <LogOut className="w-5 h-5" /> Sign Out
             </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                      {activeTab === 'dashboard' && 'Overview'}
                      {activeTab === 'profile' && 'Shop Settings'}
                      {activeTab === 'products' && 'Product Management'}
                      {activeTab === 'redemptions' && 'Redemption History'}
                      {activeTab === 'points' && 'Points Issued'}
                  </h2>
                  <p className="text-sm text-slate-500">Welcome back, {partnerData.business_name}</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all duration-300 ${
                        hasChanges 
                            ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5' 
                            : 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                    }`}
                 >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {hasChanges ? 'Save Changes' : 'All Changes Saved'}
                 </button>
              </div>
          </div>

          {/* --- DASHBOARD TAB --- */}
          {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-100 transition-colors">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                          <div className="relative z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Redemptions</p>
                              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalRedemptions}</h3>
                          </div>
                          <div className="relative z-10 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                              <TrendingUp className="w-3 h-3" /> +12% this month
                          </div>
                      </div>
                      
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-amber-100 transition-colors">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                          <div className="relative z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Vouchers</p>
                              <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeRedemptions}</h3>
                          </div>
                          <div className="relative z-10 flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-lg">
                              <Clock className="w-3 h-3" /> Pending use
                          </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-100 transition-colors">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                          <div className="relative z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</p>
                              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalProducts}</h3>
                          </div>
                          <div className="relative z-10 flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded-lg">
                              <Package className="w-3 h-3" /> Live now
                          </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-rose-100 transition-colors">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
                          <div className="relative z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
                              <h3 className="text-3xl font-bold text-slate-900 mt-1">4.9</h3>
                          </div>
                          <div className="relative z-10 flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-lg">
                              <Users className="w-3 h-3" /> From 124 reviews
                          </div>
                      </div>
                  </div>

                  {/* Charts Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                          <div className="flex items-center justify-between mb-6">
                              <div>
                                  <h3 className="font-bold text-slate-900">Redemption Activity</h3>
                                  <p className="text-xs text-slate-500">Weekly performance</p>
                              </div>
                              <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-600 outline-none">
                                  <option>Last 7 Days</option>
                                  <option>Last 30 Days</option>
                              </select>
                          </div>
                          <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={chartData}>
                                      <defs>
                                          <linearGradient id="colorRedemptions" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                          </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                      <Tooltip 
                                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                          cursor={{stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 4'}}
                                      />
                                      <Area type="monotone" dataKey="redemptions" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRedemptions)" />
                                  </AreaChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                          <h3 className="font-bold text-slate-900 mb-4">Top Products</h3>
                          <div className="space-y-4">
                              {(partnerData.products || []).slice(0, 4).map((p: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                          <ImageWithFallback src={p.image_url} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-bold text-slate-900 truncate">{p.title}</h4>
                                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                              <div className="bg-primary h-1.5 rounded-full" style={{width: `${Math.random() * 60 + 20}%`}}></div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                              {(partnerData.products || []).length === 0 && (
                                  <p className="text-sm text-slate-400 italic">No products yet.</p>
                              )}
                          </div>
                          <button 
                             onClick={() => setActiveTab('products')}
                             className="w-full mt-6 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                              View All Products
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* --- PROFILE TAB --- */}
          {activeTab === 'profile' && (
              <div className="max-w-4xl bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                       {/* Left Column */}
                       <div className="space-y-6">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
                               <input 
                                   type="text" 
                                   value={partnerData.business_name}
                                   onChange={(e) => setPartnerData({...partnerData, business_name: e.target.value})}
                                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Bio</label>
                               <input 
                                   type="text" 
                                   value={partnerData.short_description}
                                   onChange={(e) => setPartnerData({...partnerData, short_description: e.target.value})}
                                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                   placeholder="e.g. Premium Auto Detailing Center"
                               />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Description</label>
                               <textarea 
                                   value={partnerData.full_description}
                                   onChange={(e) => setPartnerData({...partnerData, full_description: e.target.value})}
                                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                   placeholder="Tell customers about your business..."
                               />
                           </div>
                       </div>

                       {/* Right Column */}
                       <div className="space-y-6">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Details</label>
                               <div className="grid grid-cols-2 gap-4">
                                   <input 
                                       type="text" 
                                       value={partnerData.phone}
                                       onChange={(e) => setPartnerData({...partnerData, phone: e.target.value})}
                                       className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                       placeholder="Phone"
                                   />
                                   <input 
                                       type="text" 
                                       value={partnerData.whatsapp_url}
                                       onChange={(e) => setPartnerData({...partnerData, whatsapp_url: e.target.value.replace(/\D/g, '')})}
                                       className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                       placeholder="WhatsApp (No +60)"
                                   />
                               </div>
                           </div>
                           
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                               <textarea 
                                   value={partnerData.address}
                                   onChange={(e) => setPartnerData({...partnerData, address: e.target.value})}
                                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                                   placeholder="Full Address"
                                />
                               <input 
                                   type="text" 
                                   value={partnerData.map_url}
                                   onChange={(e) => setPartnerData({...partnerData, map_url: e.target.value})}
                                   className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                   placeholder="Google Maps Link"
                               />
                           </div>

                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                               <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                   {partnerData.logo_url ? (
                                       <ImageWithFallback src={partnerData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                   ) : (
                                       <ImageIcon className="w-6 h-6 text-slate-300" />
                                   )}
                               </div>
                               <div className="flex-1">
                                   <label className="block text-xs font-bold text-slate-900 mb-1">Update Logo</label>
                                   <input 
                                       type="file" 
                                       accept="image/*"
                                       onChange={handleLogoUpload}
                                       className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                                   />
                               </div>
                           </div>
                       </div>
                  </div>
              </div>
          )}

          {/* --- PRODUCTS TAB --- */}
          {activeTab === 'products' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="relative w-96">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                              type="text" 
                              placeholder="Search products..." 
                              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                      </div>
                      <button 
                          onClick={() => {
                              setEditingProduct({});
                              setProductForm({});
                              setShowMinPointsWarning(false);
                          }}
                          className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                      >
                          <Plus className="w-4 h-4" /> Add New Product
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(partnerData.products || []).map((prod: any) => (
                          <div key={prod.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:border-primary/30 transition-all hover:shadow-md">
                              <div className="h-48 bg-slate-100 relative overflow-hidden">
                                  {prod.image_url ? (
                                      <ImageWithFallback src={prod.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                                          <ImageIcon className="w-12 h-12" />
                                      </div>
                                  )}
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                          onClick={() => {
                                              setEditingProduct(prod);
                                              setProductForm(prod);
                                              setShowMinPointsWarning(false);
                                          }}
                                          className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-primary rounded-lg shadow-sm"
                                      >
                                          <Pencil className="w-4 h-4" />
                                      </button>
                                      <button 
                                          onClick={() => handleDeleteProduct(prod.id)}
                                          className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-red-600 rounded-lg shadow-sm"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                              <div className="p-5">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-slate-900 line-clamp-1 text-lg">{prod.title}</h3>
                                      {prod.discount_info && (
                                          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100 whitespace-nowrap ml-2">
                                              {prod.discount_info}
                                          </span>
                                      )}
                                  </div>
                                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{prod.description}</p>
                                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Min Points: {prod.min_points_requirement ? prod.min_points_requirement.toLocaleString() : '0'}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Add/Edit Modal */}
                  {editingProduct && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                  <h3 className="font-bold text-lg">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
                                  <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                      <X className="w-5 h-5 text-slate-500" />
                                  </button>
                              </div>
                              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                      <input 
                                          value={productForm.title || ''}
                                          onChange={e => setProductForm({...productForm, title: e.target.value})}
                                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                      <textarea 
                                          value={productForm.description || ''}
                                          onChange={e => setProductForm({...productForm, description: e.target.value})}
                                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                      />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discount Label</label>
                                          <input 
                                              value={productForm.discount_info || ''}
                                              onChange={e => setProductForm({...productForm, discount_info: e.target.value})}
                                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                              placeholder="e.g. 50% OFF"
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Points</label>
                                          <input 
                                              type="number"
                                              value={productForm.min_points_requirement || ''}
                                              onChange={e => {
                                                  const val = parseInt(e.target.value) || 0;
                                                  setProductForm({...productForm, min_points_requirement: val});
                                                  setShowMinPointsWarning(val > 0 && val < 20000);
                                              }}
                                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                          />
                                      </div>
                                  </div>
                                  
                                  {showMinPointsWarning && (
                                      <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex items-start gap-2">
                                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                          <p>Setting low points requirement might result in high redemption volume. Make sure your inventory can handle it.</p>
                                      </div>
                                  )}

                                  <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Image</label>
                                       <input type="file" onChange={handleProductImageUpload} className="w-full text-xs text-slate-500" />
                                  </div>
                              </div>
                              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                                  <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all">Cancel</button>
                                  <button onClick={handleProductSave} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Save Product</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* --- REDEMPTIONS TAB --- */}
          {activeTab === 'redemptions' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-lg text-slate-900">Recent Transactions</h3>
                          <div className="flex gap-2">
                              <button 
                                onClick={() => handleExportCSV(vouchers, 'redemptions')}
                                className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                              >
                                  <FileText className="w-3.5 h-3.5" /> Export CSV
                              </button>
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                  <tr>
                                      <th className="px-6 py-4">Voucher ID</th>
                                      <th className="px-6 py-4">Customer</th>
                                      <th className="px-6 py-4">Product</th>
                                      <th className="px-6 py-4">Status</th>
                                      <th className="px-6 py-4 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {vouchers.map((voucher) => (
                                      <tr key={voucher.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                              #{voucher.id.slice(0, 8).toUpperCase()}
                                          </td>
                                          <td className="px-6 py-4 font-medium text-slate-900">
                                              {voucher.user_email}
                                          </td>
                                          <td className="px-6 py-4 text-slate-600">
                                              {voucher.title}
                                          </td>
                                          <td className="px-6 py-4">
                                              {voucher.status === 'active' ? (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                      <Clock className="w-3 h-3" /> Pending
                                                  </span>
                                              ) : (
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                      <CheckCircle2 className="w-3 h-3" /> Redeemed
                                                  </span>
                                              )}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              {voucher.status === 'active' ? (
                                                  <button className="text-xs font-bold text-primary hover:text-primary/80 hover:underline">
                                                      Verify
                                                  </button>
                                              ) : (
                                                  <span className="text-xs text-slate-400">Archived</span>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                                  {vouchers.length === 0 && (
                                      <tr>
                                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                              No redemptions found.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* --- POINTS HISTORY TAB --- */}
          {activeTab === 'points' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <div>
                          <h3 className="font-bold text-lg text-slate-900">Issued Points</h3>
                          <p className="text-xs text-slate-500">Track points rewarded to customers.</p>
                      </div>
                      <div className="flex gap-3">
                          <button 
                            onClick={() => handleExportCSV(pointsHistory, 'points_history')}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                              <FileText className="w-3.5 h-3.5" /> Export CSV
                          </button>
                          <button 
                            onClick={() => setShowIssuePoints(true)}
                            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                          >
                              <Plus className="w-3.5 h-3.5" /> Issue Points
                          </button>
                      </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                  <tr>
                                      <th className="px-6 py-4">Transaction ID</th>
                                      <th className="px-6 py-4">Customer Email</th>
                                      <th className="px-6 py-4">Purchase Amount</th>
                                      <th className="px-6 py-4">Points Given</th>
                                      <th className="px-6 py-4 text-right">Date</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {pointsHistory.map((tx) => (
                                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                              {tx.id}
                                          </td>
                                          <td className="px-6 py-4 font-medium text-slate-900">
                                              {tx.user_email}
                                          </td>
                                          <td className="px-6 py-4 text-slate-600">
                                              RM {tx.amount.toFixed(2)}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                  +{tx.points} pts
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right text-xs text-slate-400">
                                              {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </td>
                                      </tr>
                                  ))}
                                  {pointsHistory.length === 0 && (
                                      <tr>
                                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                              No points issued yet.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}
          
          {/* Issue Points Modal */}
          {showIssuePoints && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-lg">Issue Points</h3>
                          <button onClick={() => setShowIssuePoints(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                              <X className="w-5 h-5 text-slate-500" />
                          </button>
                      </div>
                      <div className="p-6 space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Email</label>
                              <input 
                                  type="email"
                                  value={issueForm.email}
                                  onChange={e => setIssueForm({...issueForm, email: e.target.value})}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                  placeholder="customer@example.com"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purchase Amount (RM)</label>
                              <input 
                                  type="number"
                                  value={issueForm.amount}
                                  onChange={e => setIssueForm({...issueForm, amount: e.target.value})}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                  placeholder="0.00"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">Rate: RM 1 = 1 Point</p>
                          </div>
                      </div>
                      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                          <button onClick={() => setShowIssuePoints(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all">Cancel</button>
                          <button onClick={handleIssuePoints} className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                              Issue {issueForm.amount ? Math.floor(parseFloat(issueForm.amount)) : 0} Pts
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
}
