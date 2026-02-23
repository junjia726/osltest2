import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye, MessageCircle, TrendingUp, Edit, ArrowLeft, LogOut, LogIn,
  Star, ShoppingCart, FileText, Plus, Trash2, Tag, Megaphone,
  Lightbulb, Image as ImageIcon, Loader2, Building2, ExternalLink,
  AlertTriangle, Bell, Check, Ban, X, Reply, Upload, Car, Crown, History
} from "lucide-react";
import { useUser } from "../components/UserContext";
import { useRealtime } from "../components/RealtimeContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import * as api from "../lib/api";
import { toast } from "sonner";
import type { Transaction } from "../lib/api";
import { getSALevel } from "../lib/levelSystem";

const postTypeOptions = [
  { value: "promotion" as const, label: "Promotion", icon: Tag },
  { value: "announcement" as const, label: "Announcement", icon: Megaphone },
  { value: "tip" as const, label: "Tip", icon: Lightbulb },
  { value: "general" as const, label: "General", icon: FileText },
];

export function SADashboardPage() {
  const { isLoggedIn, role, saProfile, logout, refreshData, profile } = useUser();
  const navigate = useNavigate();
  const {
    posts: allPosts,
    getReviewsBySA,
    getAverageRating,
    getTransactionsBySA,
    createPost,
    updatePost,
    deletePost,
    uploadImage,
    addComment,
  } = useRealtime();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'posts' | 'gallery'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
    if (profile?.email) {
      api.getNotifications(profile.email).then(setNotifications).catch(console.error);
    }
  }, [profile?.email]);

  // Purchase Registration Form
  const [purchaseForm, setPurchaseForm] = useState({
    userEmail: "",
    carModel: "",
    price: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [registering, setRegistering] = useState(false);

  // Posts State
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"promotion" | "announcement" | "tip" | "general">("promotion");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  // Gallery State
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryImage, setGalleryImage] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState("");
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saProfile?.sa_id) {
      setLoading(true);
      getTransactionsBySA(saProfile.sa_id)
        .then(setTransactions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [saProfile?.sa_id]);

  if (!isLoggedIn || role !== "sa" || !saProfile) {
     return <div className="p-10 text-center">Please log in as SA. <Link to="/login" className="text-primary underline">Login</Link></div>;
  }

  // Level Logic
  const salesCount = transactions.filter(t => t.status === 'completed').length;
  const currentLevel = getSALevel(salesCount);
  // Find next level
  const SA_LEVELS = [
    { name: "Rookie", min: 0 },
    { name: "Professional", min: 5 },
    { name: "Elite", min: 15 },
    { name: "Master Advisor", min: 30 },
    { name: "Iconic Advisor", min: 50 },
  ];
  const nextLevel = SA_LEVELS.find(l => l.min > salesCount);
  const progress = nextLevel 
    ? ((salesCount - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 
    : 100;

  // Handle Register Purchase
  const handleRegisterPurchase = async () => {
    if (!purchaseForm.userEmail || !purchaseForm.carModel || !purchaseForm.price) {
        return toast.error("Please fill all fields");
    }
    
    setRegistering(true);
    try {
        await api.registerTransaction({
            sa_id: saProfile.sa_id,
            user_email: purchaseForm.userEmail,
            car_model: purchaseForm.carModel,
            price: parseFloat(purchaseForm.price),
            purchase_date: purchaseForm.date
        });
        
        toast.success("Purchase registered & Points awarded!");
        setPurchaseForm({ userEmail: "", carModel: "", price: "", date: new Date().toISOString().split('T')[0] });
        // Refresh transactions
        const txs = await api.getTransactionsBySA(saProfile.sa_id);
        setTransactions(txs);
    } catch (e) {
        toast.error("Failed to register purchase. Verify email exists.");
    } finally {
        setRegistering(false);
    }
  };

  // ... (Keep existing post/gallery handlers simplified for brevity, assuming standard CRUD)
  // Re-implementing simplified handlers for completeness
  const handlePublish = async () => {
      if (!postTitle || !postContent) return toast.error("Title and content required");
      setPublishing(true);
      try {
          const uploadedUrls: string[] = [];
          for (const file of postImages) {
              uploadedUrls.push(await uploadImage(file));
          }
          if (postImagePreviews.length > 0 && editingPostId && uploadedUrls.length === 0) {
               // Use existing if editing and no new uploads
               uploadedUrls.push(...postImagePreviews);
          }

          const postData = {
              sa_id: saProfile.sa_id,
              sa_name: saProfile.name,
              sa_avatar: saProfile.avatar,
              title: postTitle,
              content: postContent,
              image_url: uploadedUrls[0] || "",
              images: uploadedUrls,
              type: postType
          };

          if (editingPostId) {
              await updatePost(editingPostId, postData);
              toast.success("Post updated");
          } else {
              await createPost(postData);
              toast.success("Post created");
          }
          setShowPostForm(false);
          setEditingPostId(null);
          setPostTitle("");
          setPostContent("");
          setPostImages([]);
          setPostImagePreviews([]);
      } catch (e) { toast.error("Failed to publish"); }
      finally { setPublishing(false); }
  };
  
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          setPostImages(files);
          setPostImagePreviews(files.map(f => URL.createObjectURL(f)));
      }
  };

  const handleUploadGallery = async () => {
    if (!galleryImage || !galleryCaption) return toast.error("Image and caption required");
    setUploadingGallery(true);
    try {
        const url = await uploadImage(galleryImage);
        const newGallery = [{ id: Date.now().toString(), imageUrl: url, caption: galleryCaption, date: new Date().toISOString() }, ...(saProfile.gallery || [])];
        await api.updateSAGallery(saProfile.sa_id, newGallery);
        await refreshData();
        toast.success("Added to gallery");
        setShowGalleryUpload(false);
        setGalleryImage(null);
        setGalleryCaption("");
    } catch (e) { toast.error("Upload failed"); }
    finally { setUploadingGallery(false); }
  };

  const handleDeleteGallery = async (id: string) => {
      if (!confirm("Delete photo?")) return;
      const newGallery = (saProfile.gallery || []).filter((i: any) => i.id !== id);
      await api.updateSAGallery(saProfile.sa_id, newGallery);
      await refreshData();
  };

  const myPosts = allPosts.filter(p => p.sa_id === saProfile.sa_id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 1. SA LEVEL HEADER */}
      <div className="bg-slate-900 text-white pt-8 pb-16 px-5 relative overflow-hidden">
        {/* Abstract metallic background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ImageWithFallback src={saProfile.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-slate-700" />
              <div>
                <h1 className="text-lg font-bold">{saProfile.name}</h1>
                <p className="text-xs text-slate-400">{saProfile.branch}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowNotifications(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    )}
                </button>
                <Link to="/sa-dashboard/edit" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <Edit className="w-5 h-5" />
                </Link>
                <button onClick={() => { logout(); navigate("/"); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Current Rank</p>
                   <h2 className={`text-2xl font-bold ${currentLevel.color.replace('text-', 'text-')}`}>{currentLevel.name}</h2>
                </div>
                <div className={`p-3 rounded-xl bg-white/10 ${currentLevel.color}`}>
                   <Crown className="w-6 h-6" />
                </div>
             </div>
             
             {/* Progress */}
             <div className="mb-2">
                <div className="flex justify-between text-xs mb-1.5">
                   <span className="text-slate-300">{salesCount} Sales</span>
                   <span className="text-slate-500">{nextLevel ? `Target: ${nextLevel.min}` : 'Max Rank'}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
             </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex mt-8 p-1 bg-slate-800/80 rounded-xl backdrop-blur-md">
             {['overview', 'sales', 'posts', 'gallery'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`flex-1 py-2.5 text-xs font-medium rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-6 relative z-20 space-y-5">
         
         {/* TAB: OVERVIEW */}
         {activeTab === 'overview' && (
             <>
               {/* Quick Stats */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-slate-900">{salesCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                          <p className="text-2xl font-bold text-slate-900">{saProfile.rating || "N/A"}</p>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                  </div>
               </div>

               {/* Recent Activity */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-primary" /> Recent Sales
                  </h3>
                  <div className="space-y-4">
                      {transactions.slice(0, 3).map((t, i) => (
                          <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
                              <div>
                                  <p className="font-medium text-slate-800">{t.car_model}</p>
                                  <p className="text-xs text-slate-500">{new Date(t.purchase_date).toLocaleDateString()}</p>
                              </div>
                              <span className="text-sm font-bold text-green-600">+1 Point</span>
                          </div>
                      ))}
                      {transactions.length === 0 && <p className="text-xs text-slate-400 italic">No sales yet.</p>}
                  </div>
               </div>
             </>
         )}

         {/* TAB: SALES REGISTRATION */}
         {activeTab === 'sales' && (
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                 <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                         <ShoppingCart className="w-5 h-5" />
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-900">Register New Sale</h3>
                         <p className="text-xs text-slate-500">Confirm purchase to reward customer</p>
                     </div>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-slate-700 block mb-1.5">Customer Email</label>
                         <input 
                             type="email" 
                             value={purchaseForm.userEmail}
                             onChange={(e) => setPurchaseForm({...purchaseForm, userEmail: e.target.value})}
                             placeholder="customer@email.com"
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                         />
                         <p className="text-[10px] text-slate-400 mt-1">Must match their registered email</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs font-bold text-slate-700 block mb-1.5">Car Model</label>
                             <select 
                                 value={purchaseForm.carModel}
                                 onChange={(e) => setPurchaseForm({...purchaseForm, carModel: e.target.value})}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                             >
                                 <option value="">Select Model</option>
                                 <option value="Axia">Axia</option>
                                 <option value="Bezza">Bezza</option>
                                 <option value="Myvi">Myvi</option>
                                 <option value="Ativa">Ativa</option>
                                 <option value="Alza">Alza</option>
                                 <option value="Aruz">Aruz</option>
                                 <option value="TRAZ">TRAZ</option>
                             </select>
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-700 block mb-1.5">Price (RM)</label>
                             <input 
                                 type="number" 
                                 value={purchaseForm.price}
                                 onChange={(e) => setPurchaseForm({...purchaseForm, price: e.target.value})}
                                 placeholder="50000"
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                             />
                         </div>
                     </div>

                     <div>
                         <label className="text-xs font-bold text-slate-700 block mb-1.5">Purchase Date</label>
                         <input 
                             type="date" 
                             value={purchaseForm.date}
                             onChange={(e) => setPurchaseForm({...purchaseForm, date: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                         />
                     </div>

                     <button 
                         onClick={handleRegisterPurchase}
                         disabled={registering}
                         className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
                     >
                         {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                         Confirm Purchase
                     </button>
                 </div>
             </div>
         )}

         {/* TAB: POSTS */}
         {activeTab === 'posts' && (
             <div className="space-y-4">
                 <button 
                    onClick={() => { setShowPostForm(true); setEditingPostId(null); setPostTitle(""); setPostContent(""); setPostImages([]); }}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                 >
                    <Plus className="w-5 h-5" /> Create New Post
                 </button>

                 {showPostForm && (
                     <div className="bg-white rounded-xl border border-border p-5 shadow-sm animate-in zoom-in-95">
                         <h3 className="font-bold mb-4">{editingPostId ? 'Edit Post' : 'New Post'}</h3>
                         <input 
                             value={postTitle} 
                             onChange={e => setPostTitle(e.target.value)} 
                             placeholder="Post Title" 
                             className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm"
                         />
                         <textarea 
                             value={postContent} 
                             onChange={e => setPostContent(e.target.value)} 
                             placeholder="Write something..." 
                             className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm h-24 resize-none"
                         />
                         <div className="flex gap-2 mb-4">
                             {postTypeOptions.map(opt => (
                                 <button
                                     key={opt.value}
                                     onClick={() => setPostType(opt.value)}
                                     className={`flex-1 py-2 rounded-lg text-xs flex flex-col items-center gap-1 ${postType === opt.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
                                 >
                                     <opt.icon className="w-3 h-3" /> {opt.label}
                                 </button>
                             ))}
                         </div>
                         <div className="mb-4">
                             <input type="file" multiple accept="image/*" onChange={handleImagePick} className="text-xs" />
                         </div>
                         <div className="flex gap-3">
                             <button onClick={() => setShowPostForm(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
                             <button onClick={handlePublish} disabled={publishing} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold">
                                 {publishing ? 'Publishing...' : 'Publish'}
                             </button>
                         </div>
                     </div>
                 )}

                 {myPosts.map(post => (
                     <div key={post.id} className="bg-white rounded-xl border border-border p-4 shadow-sm">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-900">{post.title}</h3>
                             <div className="flex gap-1">
                                 <button onClick={() => { setEditingPostId(post.id); setPostTitle(post.title); setPostContent(post.content); setPostType(post.type as any); setShowPostForm(true); }} className="p-1.5 hover:bg-slate-100 rounded text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
                                 <button onClick={() => handleDeletePost(post.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                         </div>
                         <p className="text-xs text-slate-500 line-clamp-2">{post.content}</p>
                     </div>
                 ))}
             </div>
         )}
         
         {/* TAB: GALLERY */}
         {activeTab === 'gallery' && (
             <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900">Success Gallery</h3>
                    <button onClick={() => setShowGalleryUpload(!showGalleryUpload)} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg">Upload Photo</button>
                </div>
                
                {showGalleryUpload && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                        <input type="file" accept="image/*" onChange={(e) => setGalleryImage(e.target.files?.[0] || null)} className="text-xs mb-3 w-full" />
                        <input value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} placeholder="Caption..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
                        <button onClick={handleUploadGallery} disabled={uploadingGallery} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold">Upload</button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {(saProfile.gallery || []).map((item: any) => (
                        <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square">
                            <ImageWithFallback src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleDeleteGallery(item.id)} className="p-2 bg-white/20 rounded-full text-white hover:bg-red-500 hover:text-white transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-[10px] text-white truncate">{item.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         )}

      </div>
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
                                        : notif.isRead 
                                        ? 'bg-white border-slate-100' 
                                        : 'bg-blue-50 border-blue-100'
                                    } ${notif.link ? 'cursor-pointer hover:shadow-md' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            {notif.type === 'warning' ? (
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                            ) : notif.type === 'error' ? (
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                            ) : notif.type === 'success' ? (
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 pr-6">
                                            {notif.type === 'warning' && <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Warning Issued</p>}
                                            <p className={`text-xs leading-relaxed ${notif.type === 'warning' ? 'text-amber-900 font-medium' : 'text-slate-800'}`}>{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotification(notif.id);
                                            }}
                                            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${
                                                notif.type === 'warning' ? 'text-amber-400 hover:text-amber-700 hover:bg-amber-100' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                            }`}
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
  );
}
