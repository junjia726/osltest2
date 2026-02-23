import { useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Tag,
  Megaphone,
  Lightbulb,
  FileText,
  Image as ImageIcon,
  Loader2,
  User,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Link as LinkIcon,
  AtSign,
  Book,
} from "lucide-react";
import { useUser } from "../components/UserContext";
import { useRealtime } from "../components/RealtimeContext";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { malaysianDistrictsByState, statesByRegion, citiesByState } from "../data/user";

const postTypeOptions = [
  { value: "promotion" as const, label: "Promotion", icon: Tag },
  { value: "announcement" as const, label: "Announcement", icon: Megaphone },
  { value: "tip" as const, label: "Tip", icon: Lightbulb },
  { value: "general" as const, label: "General", icon: FileText },
];

const postTypeColors: Record<string, string> = {
  promotion: "bg-green-50 text-green-600",
  announcement: "bg-blue-50 text-blue-600",
  tip: "bg-amber-50 text-amber-600",
  general: "bg-gray-50 text-gray-600",
};

export function SAProfileEditPage() {
  const navigate = useNavigate();
  const { role, saProfile, updateSAProfile } = useUser();
  const { posts: allPosts, createPost, deletePost, uploadImage } = useRealtime();

  const [formData, setFormData] = useState({
    name: saProfile?.name || "",
    email: (saProfile as any)?.email || "",
    phone: saProfile?.phone || "",
    whatsapp: saProfile?.whatsapp || "",
    bio: saProfile?.bio || "",
    region: saProfile?.region || "",
    state: saProfile?.state || "",
    city: saProfile?.city || "",
    branch: saProfile?.branch || "", // Using branch as address
    googleMapUrl: saProfile?.googleMapUrl || "",
    socialMedia: {
      facebook: saProfile?.socialMedia?.facebook || "",
      instagram: saProfile?.socialMedia?.instagram || "",
      linkedin: saProfile?.socialMedia?.linkedin || "",
      twitter: saProfile?.socialMedia?.twitter || "",
      tiktok: saProfile?.socialMedia?.tiktok || "",
      threads: saProfile?.socialMedia?.threads || "",
      xiaohongshu: saProfile?.socialMedia?.xiaohongshu || "",
    }
  });

  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"promotion" | "announcement" | "tip" | "general">("promotion");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState("");
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(saProfile?.avatar || "");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (role !== "sa" || !saProfile) {
    return (
      <div className="px-5 py-12 text-center">
        <h2>Access denied</h2>
        <p className="text-muted-foreground mt-2">
          You must be logged in as a Sales Advisor.
        </p>
        <button
          onClick={() => navigate("/sa-dashboard")}
          className="text-primary mt-4 inline-block"
        >
          Go to SA Dashboard
        </button>
      </div>
    );
  }

  const myPosts = allPosts.filter((p) => p.sa_id === saProfile.sa_id);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "region") { updated.state = ""; updated.city = ""; }
      if (field === "state") { updated.city = ""; }
      return updated;
    });
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value
      }
    }));
  };


  const statesForRegion = formData.region ? statesByRegion[formData.region] || [] : [];
  const citiesForState = formData.state ? citiesByState[formData.state] || [] : [];

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = saProfile.avatar;
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      await updateSAProfile({ ...formData, avatar: avatarUrl });
      toast.success("Profile updated!", {
        description: "Changes visible in real-time.",
      });
      navigate("/sa-dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImage(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    if (!postTitle.trim() || !postContent.trim()) return toast.error("Title and content required.");
    setPublishing(true);
    try {
      let imageUrl = "";
      if (postImage) {
        imageUrl = await uploadImage(postImage);
      }
      await createPost({
        sa_id: saProfile.sa_id,
        sa_name: saProfile.name,
        sa_avatar: saProfile.avatar,
        title: postTitle.trim(),
        content: postContent.trim(),
        image_url: imageUrl,
        type: postType,
      });
      toast.success("Post published!");
      setShowPostForm(false);
      setPostTitle("");
      setPostContent("");
      setPostImage(null);
      setPostImagePreview("");
    } catch {
      toast.error("Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  };

  return (
    <div className="px-5 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1>Edit Profile</h1>
          <p className="text-xs text-muted-foreground">Update your public SA profile</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="text-center mb-6">
        <div 
          className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-accent border-4 border-white shadow-sm cursor-pointer group"
          onClick={() => avatarFileRef.current?.click()}
        >
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Avatar" 
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User className="w-8 h-8" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-[10px] text-primary mt-2">Tap photo to change</p>
        <input 
          type="file" 
          ref={avatarFileRef} 
          onChange={handleAvatarChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium">Email Address</label>
          <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Phone Number</label>
          <input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">WhatsApp Number / Link</label>
          <input type="text" value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="e.g. 60123456789 or full link" className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Bio / Introduction</label>
          <textarea value={formData.bio} onChange={(e) => handleChange("bio", e.target.value)} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm min-h-[80px] resize-none" maxLength={300} />
          <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{formData.bio.length}/300</p>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Google Map Link</label>
          <input type="url" value={formData.googleMapUrl} onChange={(e) => handleChange("googleMapUrl", e.target.value)} placeholder="https://maps.google.com/..." className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
        </div>

        {/* Location & Address */}
        <div className="border-t border-border pt-4">
          <h4 className="mb-3 text-xs text-muted-foreground uppercase tracking-wide font-bold">Location & Coverage</h4>
          <div className="space-y-3">
             <div>
                <label className="block mb-1 text-xs text-slate-500">Branch / Showroom Address</label>
                <input type="text" value={formData.branch} onChange={(e) => handleChange("branch", e.target.value)} placeholder="e.g. Perodua Sales Center, Jalan ABC..." className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" />
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block mb-1 text-xs text-slate-500">Region</label>
                    <select value={formData.region} onChange={(e) => handleChange("region", e.target.value)} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm appearance-none">
                      <option value="">Select region</option>
                      {Object.entries(malaysianDistrictsByState).map(([state, districts]) => (
                        <optgroup key={state} label={state}>
                          {districts.map((d) => (
                            <option key={`${d}-${state}`} value={`${d}, ${state}`}>{d}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                </div>
                <div>
                     <label className="block mb-1 text-xs text-slate-500">State</label>
                     <select value={formData.state} onChange={(e) => handleChange("state", e.target.value)} disabled={!formData.region} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm appearance-none disabled:opacity-50">
                      <option value="">{formData.region ? "Select state" : "-"}</option>
                      {statesForRegion.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
             </div>
             <div>
                 <label className="block mb-1 text-xs text-slate-500">City</label>
                 <select value={formData.city} onChange={(e) => handleChange("city", e.target.value)} disabled={!formData.state} className="w-full bg-accent px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm appearance-none disabled:opacity-50">
                  <option value="">{formData.state ? "Select city" : "-"}</option>
                  {citiesForState.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-border pt-4">
            <h4 className="mb-3 text-xs text-muted-foreground uppercase tracking-wide">Social Media Links</h4>
            <div className="space-y-3">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Facebook className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.facebook} 
                        onChange={(e) => handleSocialChange("facebook", e.target.value)} 
                        placeholder="Facebook URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Instagram className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.instagram} 
                        onChange={(e) => handleSocialChange("instagram", e.target.value)} 
                        placeholder="Instagram URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Linkedin className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.linkedin} 
                        onChange={(e) => handleSocialChange("linkedin", e.target.value)} 
                        placeholder="LinkedIn URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Twitter className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.twitter} 
                        onChange={(e) => handleSocialChange("twitter", e.target.value)} 
                        placeholder="X (Twitter) URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs w-4 text-center">
                        TT
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.tiktok} 
                        onChange={(e) => handleSocialChange("tiktok", e.target.value)} 
                        placeholder="TikTok URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <AtSign className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.threads} 
                        onChange={(e) => handleSocialChange("threads", e.target.value)} 
                        placeholder="Threads URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Book className="w-4 h-4" />
                    </div>
                    <input 
                        type="url" 
                        value={formData.socialMedia.xiaohongshu} 
                        onChange={(e) => handleSocialChange("xiaohongshu", e.target.value)} 
                        placeholder="Xiaohongshu (Little Red Book) URL" 
                        className="w-full bg-accent pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:outline-none text-sm" 
                    />
                </div>
            </div>
        </div>

        {/* Posts Management */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wide">Posts & Content</h4>
            <button onClick={() => setShowPostForm(!showPostForm)} className="flex items-center gap-1 text-xs text-primary">
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          </div>

          {showPostForm && (
            <div className="bg-accent rounded-xl p-4 mb-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {postTypeOptions.map((opt) => (
                  <button key={opt.value} onClick={() => setPostType(opt.value)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] ${postType === opt.value ? "bg-primary text-white" : "bg-white border border-border"}`}>
                    <opt.icon className="w-3 h-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
              <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className="w-full bg-white px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:outline-none" placeholder="Title" maxLength={100} />
              <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} className="w-full bg-white px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:outline-none min-h-[70px] resize-none" placeholder="Content..." maxLength={1000} />
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
                {postImagePreview ? (
                  <div className="relative">
                    <img src={postImagePreview} alt="" className="w-full h-28 object-cover rounded-lg" />
                    <button onClick={() => { setPostImage(null); setPostImagePreview(""); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px]">×</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="w-3.5 h-3.5" /> Add Image
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handlePublish} disabled={publishing} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm disabled:opacity-60 flex items-center justify-center gap-1">
                  {publishing && <Loader2 className="w-3 h-3 animate-spin" />} Publish
                </button>
                <button onClick={() => { setShowPostForm(false); setPostImage(null); setPostImagePreview(""); }} className="px-3 bg-white border border-border py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {myPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {myPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${postTypeColors[post.type] || ""}`}>{post.type}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</span>
                    </div>
                    <button onClick={() => handleDeletePost(post.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm">{post.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="mt-6">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-xl text-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}