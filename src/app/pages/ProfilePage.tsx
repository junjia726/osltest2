import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  User, Mail, Phone, MessageCircle, MapPin, Home, ChevronRight,
  Car, LogOut, Pencil, Check, X, Shield, Send, Trash2, Award,
  Users, Loader2, Image as ImageIcon, Bell, CheckCheck, Ticket,
  Upload, AlertCircle, Clock, QrCode
} from "lucide-react";
import { useUser } from "../components/UserContext";
import { useRealtime } from "../components/RealtimeContext";
import {
  getProfileCompletion,
  malaysianDistrictsByState,
  statesByRegion,
  citiesByState,
  generateWhatsAppMessage,
} from "../data/user";
import * as api from "../lib/api";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SASelectionModal } from "../components/SASelectionModal";
import { getUserLevel, getNextUserLevel } from "../lib/levelSystem";

// Reusing existing ProfileField component logic inline or from original if it was exported (it wasn't, so redefining)
const ProfileField = ({ icon, label, value, editValue, isEditing, onChange, placeholder, type = "text", error }: any) => (
  <div className="flex items-center gap-3 p-3">
    <div className="text-muted-foreground shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      {isEditing ? (
        <div>
          <input
            type={type}
            value={editValue || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-input-background px-2 py-1.5 rounded-lg border ${error ? 'border-red-300 focus:border-red-500' : 'border-border focus:border-primary'} text-sm focus:outline-none transition-all`}
            placeholder={placeholder}
          />
          {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
      ) : (
        <p className="text-sm font-medium text-gray-900 truncate">{value || "-"}</p>
      )}
    </div>
  </div>
);

export function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, profile, savedConfigs, updateProfile, logout, selectedSA, switchMode, saProfile, role, refreshUserProfile } = useUser();
  const { uploadImage } = useRealtime();

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'profile' | 'vouchers'>('profile');
  const [vouchers, setVouchers] = useState<api.UserVoucher[]>([]);
  const [partners, setPartners] = useState<api.Partner[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  
  // Level Calculation
  const points = profile?.points || 0;
  const currentLevel = getUserLevel(points);
  const nextLevel = getNextUserLevel(points);
  const progress = nextLevel 
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 
    : 100;

  // Voucher Use Modal
  const [selectedVoucher, setSelectedVoucher] = useState<api.UserVoucher | null>(null);
  const [useConfirmation, setUseConfirmation] = useState("");
  const [processingVoucher, setProcessingVoucher] = useState(false);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (role === 'external_partner') {
        navigate('/partner-panel');
        return;
    }
    if (profile?.email) {
      loadDashboardData();
    }
  }, [profile?.email, role, navigate]);

  const loadDashboardData = async () => {
    if (!profile?.email || role === 'external_partner') return;
    try {
      setLoadingVouchers(true);
      // Ensure points are up to date
      await refreshUserProfile();
      
      const [vouchersData, notifsData, partnersData] = await Promise.all([
        api.getUserVouchers(profile.email),
        api.getNotifications(profile.email),
        api.getPartners(),
      ]);
      setVouchers(vouchersData || []);
      setNotifications(notifsData || []);
      setPartners(partnersData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const handleUseVoucher = async () => {
    if (useConfirmation.toUpperCase() !== "USE" || !selectedVoucher) return;
    
    setProcessingVoucher(true);
    try {
      await api.updateUserVoucherStatus(selectedVoucher.id, "used");
      
      // Find partner
      const partner = partners.find(p => p.id === selectedVoucher.partner_id);
      
      // Generate WhatsApp Message
      const message = `*REDEEM VOUCHER*\n\nUser: ${profile.name}\nPhone: ${profile.phone}\nVoucher: ${selectedVoucher.title}\nCode: ${selectedVoucher.id.slice(0, 8).toUpperCase()}`;
      
      let waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      if (partner) {
           let phone = "";
           // Prefer WhatsApp specific number/url if available
           if (partner.whatsapp_url) {
               phone = partner.whatsapp_url;
           } else if (partner.phone) {
               phone = partner.phone;
           }

           if (phone) {
               // Clean phone number: remove non-digits
               phone = phone.replace(/\D/g, '');
               // Ensure 60 prefix for Malaysia
               if (phone.startsWith('0')) {
                   phone = '6' + phone;
               } else if (!phone.startsWith('60')) {
                   // If it doesn't start with 60 (and we already handled 0 case), assume it might need 60 if it looks like a mobile number?
                   // Safest is to just prepend 60 if it's not there, but let's stick to 0 replacement or existing 60.
                   // Actually, if user enters '123456789', we might want to prepend 60. 
                   // But standard format usually starts with 0 or 60.
               }
               
               waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
           }
      }
      
      window.open(waLink, '_blank');
      
      // Update local state
      setVouchers(prev => prev.map(v => v.id === selectedVoucher.id ? { ...v, status: 'used', used_at: new Date().toISOString() } : v));
      setSelectedVoucher(null);
      setUseConfirmation("");
      
      const code = selectedVoucher.id.slice(0, 8).toUpperCase();
      toast.success(`Voucher Redeemed! Code: ${code}`, {
          description: "Show this code to the partner if needed.",
          duration: 10000
      });
    } catch (e) {
      toast.error("Failed to redeem voucher");
    } finally {
      setProcessingVoucher(false);
    }
  };

  // Standard Profile Functions
  const startEditing = () => {
    setEditData({ ...profile });
    setAvatarPreview(profile.avatar || "");
    setAvatarFile(null);
    setErrors({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditData({ ...profile });
    setErrors({});
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(profile.avatar || "");
  };

  const saveEdits = async () => {
    setUploading(true);
    try {
      let avatarUrl = profile.avatar;
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      updateProfile({ ...editData, avatar: avatarUrl });
      setIsEditing(false);
      setAvatarFile(null);
      toast.success("Profile updated!");
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleEditChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  const handleDeleteNotification = async (id: string) => {
    if (!profile?.email) return;
    try {
        await api.deleteNotification(profile.email, id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Notification deleted");
    } catch {
        toast.error("Failed to delete notification");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
     return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 1. LEVEL HEADER CARD */}
      <div className="bg-slate-900 text-white pt-8 pb-16 px-5 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-medium text-slate-300">{profile?.name || "My Dashboard"}</h1>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowNotifications(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  )}
                </button>
                <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className={`w-24 h-24 rounded-full border-4 ${currentLevel.border} ${currentLevel.bg} flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] relative`}>
              <Car className={`w-10 h-10 ${currentLevel.color}`} />
              <div className="absolute -bottom-2 px-3 py-1 bg-white text-slate-900 text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                {currentLevel.name}
              </div>
            </div>

            <div className="mt-2 mb-6">
               <h2 className="text-3xl font-bold font-mono tracking-tight">{points.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">PTS</span></h2>
               {nextLevel ? (
                 <p className="text-xs text-slate-400 mt-1">{nextLevel.min - points} points to {nextLevel.name}</p>
               ) : (
                 <p className="text-xs text-amber-400 mt-1 font-bold">MAX LEVEL ACHIEVED</p>
               )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8 relative">
                <div 
                  className={`h-full ${currentLevel.bg.replace('bg-', 'bg-gradient-to-r from-primary to-')} transition-all duration-1000 ease-out`}
                  style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-800/50 rounded-xl w-full backdrop-blur-sm max-w-xs mx-auto">
               <button 
                 onClick={() => setActiveTab('profile')}
                 className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 Profile
               </button>
               <button 
                 onClick={() => setActiveTab('vouchers')}
                 className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${activeTab === 'vouchers' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 My Vouchers
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-6 relative z-20 space-y-4">
        
        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
           <>
              {/* SA Switch */}
              {(saProfile || role === 'sa') && (
                <button
                    onClick={() => { switchMode("sa"); navigate("/sa-dashboard"); }}
                    className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm hover:bg-slate-50"
                >
                    <Users className="w-4 h-4" /> Switch to SA Dashboard
                </button>
              )}

              {/* Basic Info Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <User className="w-4 h-4 text-primary" /> Personal Details
                    </h3>
                    <button 
                        onClick={() => isEditing ? cancelEditing() : startEditing()}
                        className="text-xs text-primary font-medium px-3 py-1 bg-primary/5 rounded-full"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                 </div>
                 
                 <div className="divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-center bg-slate-50/50">
                        <div className="relative group cursor-pointer" onClick={() => isEditing && fileRef.current?.click()}>
                           <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                               {avatarPreview ? (
                                   <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                               ) : (
                                   <div className="w-full h-full bg-slate-200 flex items-center justify-center"><User className="w-8 h-8 text-slate-400" /></div>
                               )}
                           </div>
                           {isEditing && (
                               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                   <Pencil className="w-6 h-6 text-white" />
                               </div>
                           )}
                           <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </div>
                    </div>

                    <ProfileField icon={<User className="w-4 h-4" />} label="Name" value={profile.name} editValue={editData.name} isEditing={isEditing} onChange={(v: string) => handleEditChange("name", v)} />
                    <ProfileField icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} editValue={editData.email} isEditing={isEditing} onChange={(v: string) => handleEditChange("email", v)} />
                    <ProfileField icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone} editValue={editData.phone} isEditing={isEditing} onChange={(v: string) => handleEditChange("phone", v)} />
                 </div>
                 
                 {isEditing && (
                    <div className="p-4 bg-slate-50 flex justify-end">
                       <button onClick={saveEdits} disabled={uploading} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                          {uploading ? 'Saving...' : 'Save Changes'}
                       </button>
                    </div>
                 )}
              </div>
           </>
        )}

        {/* TAB: VOUCHERS */}
        {activeTab === 'vouchers' && (
            <div className="space-y-4">
               {vouchers.filter(v => v.status === 'active').length === 0 && !loadingVouchers && (
                   <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                       <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                       <h3 className="text-slate-900 font-medium">No Active Vouchers</h3>
                       <p className="text-xs text-slate-500 mt-1">Purchase a car or join events to earn privileges.</p>
                   </div>
               )}

               {vouchers.filter(v => v.status === 'active').map(voucher => {
                   const partner = partners.find(p => p.id === voucher.partner_id);
                   return (
                   <div key={voucher.id} className={`bg-white rounded-xl border p-4 relative overflow-hidden transition-all ${voucher.status === 'used' ? 'border-slate-100 opacity-60 grayscale' : 'border-slate-200 hover:shadow-md hover:border-primary/30'}`}>
                       {/* Left decorative strip */}
                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${voucher.status === 'used' ? 'bg-slate-300' : 'bg-gradient-to-b from-primary to-blue-600'}`}></div>
                       
                       <div className="flex gap-4 pl-2">
                           <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                               {partner?.logo_url ? (
                                   <ImageWithFallback src={partner.logo_url} alt="" className="w-full h-full object-cover" />
                               ) : voucher.image_url ? (
                                   <ImageWithFallback src={voucher.image_url} alt="" className="w-full h-full object-cover" />
                               ) : (
                                   <Ticket className="w-8 h-8 text-slate-400" />
                               )}
                           </div>
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start">
                                  <div>
                                      {partner && <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">{partner.business_name}</p>}
                                      <h3 className="font-bold text-slate-900 truncate pr-2">{voucher.title}</h3>
                                  </div>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${voucher.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                      {voucher.status}
                                  </span>
                               </div>
                               
                               {partner && (
                                   <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                       <MapPin className="w-3 h-3" />
                                       <span className="truncate">{partner.address}</span>
                                   </div>
                               )}
                               
                               <p className="text-xs text-slate-500 line-clamp-2 mt-1">{voucher.description}</p>
                               
                               {voucher.status === 'active' ? (
                                   <button 
                                      onClick={() => setSelectedVoucher(voucher)}
                                      className="mt-3 text-xs bg-slate-900 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-black transition-colors"
                                   >
                                      Redeem Privilege
                                   </button>
                               ) : (
                                   <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                                      <CheckCheck className="w-3 h-3" /> Used on {new Date(voucher.used_at!).toLocaleDateString()}
                                   </p>
                               )}
                           </div>
                       </div>
                   </div>
                   );
               })}
            </div>
        )}

        {/* Modal for Voucher Redemption */}
        {selectedVoucher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Use Voucher?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Type <span className="font-bold text-slate-900">USE</span> below to confirm redemption. This action cannot be undone.
                        </p>
                        
                        <input 
                            type="text" 
                            value={useConfirmation}
                            onChange={(e) => setUseConfirmation(e.target.value.toUpperCase())}
                            className="w-full text-center border-2 border-slate-200 rounded-xl py-3 font-bold text-lg tracking-widest uppercase focus:border-primary focus:outline-none mb-4"
                            placeholder="Type USE"
                        />

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedVoucher(null)} 
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUseVoucher}
                                disabled={useConfirmation !== "USE" || processingVoucher}
                                className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                            >
                                {processingVoucher && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Notifications Modal */}
        {showNotifications && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" /> Notifications
                        </h3>
                        <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => {
                                        if (notif.link) {
                                            navigate(notif.link);
                                            setShowNotifications(false);
                                        }
                                    }}
                                    className={`p-3 rounded-xl border relative group transition-all ${
                                        notif.type === 'warning' 
                                            ? 'bg-amber-50 border-amber-200 shadow-sm' 
                                            : notif.type === 'error'
                                            ? 'bg-red-50 border-red-200 shadow-sm'
                                            : notif.type === 'success'
                                            ? 'bg-green-50 border-green-200 shadow-sm'
                                            : notif.isRead 
                                            ? 'bg-white border-slate-100' 
                                            : 'bg-blue-50 border-blue-100'
                                    } ${notif.link ? 'cursor-pointer hover:shadow-md' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            {notif.type === 'warning' ? (
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                            ) : notif.type === 'error' ? (
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                            ) : notif.type === 'success' ? (
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <CheckCheck className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <p className={`text-xs leading-relaxed ${notif.type === 'warning' ? 'text-amber-900 font-medium' : 'text-slate-800'}`}>{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotification(notif.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
