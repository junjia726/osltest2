import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Award,
  Send,
  Star,
  MessageSquare,
  ShoppingCart,
  FileText,
  Tag,
  Megaphone,
  Lightbulb,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  Building2,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Image as ImageIcon,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useUser } from "../components/UserContext";
import { useRealtime } from "../components/RealtimeContext";
import { generateWhatsAppMessage } from "../data/user";
import { toast } from "sonner";
import type { Transaction, SAPost as SAPostType } from "../lib/api";

type Tab = "posts" | "reviews" | "transactions" | "gallery";

const postTypeIcons: Record<string, any> = {
  promotion: Tag,
  announcement: Megaphone,
  tip: Lightbulb,
  general: FileText,
};
const postTypeColors: Record<string, string> = {
  promotion: "bg-green-50 text-green-600",
  announcement: "bg-blue-50 text-blue-600",
  tip: "bg-amber-50 text-amber-600",
  general: "bg-gray-50 text-gray-600",
};

export function SAProfilePage() {
  const { saId } = useParams<{ saId: string }>();
  const navigate = useNavigate();
  const { profile, selectSA, clearSA, selectedSAId, isLoggedIn, salesAdvisors, toggleFollow } = useUser();
  const {
    posts: allPosts,
    getReviewsBySA,
    getAverageRating,
    addReview,
    getTransactionsBySA,
    toggleLike,
    addComment,
  } = useRealtime();

  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState(profile.name || "");
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  // Comment state per post
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const advisor = saId ? salesAdvisors.find(s => s.sa_id === saId) : undefined;
  const isAuthor = isLoggedIn && advisor && profile.id === advisor.sa_id;

  useEffect(() => {
    if (activeTab === "transactions" && saId) {
      setTxnLoading(true);
      getTransactionsBySA(saId)
        .then(setTransactions)
        .catch(() => {})
        .finally(() => setTxnLoading(false));
    }
  }, [activeTab, saId, getTransactionsBySA]);

  if (!advisor) {
    return (
      <div className="px-5 py-12 text-center">
        <h2>Advisor not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-primary mt-4 inline-block"
        >
          Go back
        </button>
      </div>
    );
  }

  const isSelected = selectedSAId === advisor.sa_id;
  const isFollowing = profile.following?.includes(advisor.sa_id);
  const reviews = getReviewsBySA(advisor.sa_id);
  const { avg, count } = getAverageRating(advisor.sa_id);
  const saPosts = allPosts.filter((p) => p.sa_id === advisor.sa_id);
  const completedDeals = transactions.filter(
    (t) => t.status === "completed"
  ).length;
  const gallery = (advisor as any).gallery || [];
  
  // Calculate Honors
  const totalLikes = saPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalFollowers = advisor.followers?.length || 0;

  const handleWhatsApp = () => {
    const msg = generateWhatsAppMessage(profile);
    const waNumber = (advisor.whatsapp || advisor.phone).replace(
      /[\s\-\+]/g,
      ""
    );
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  const handleSelectSA = () => {
    selectSA(advisor.sa_id);
    toast.success(`${advisor.name} is now your Sales Advisor!`);
  };

  const handleFollow = async () => {
      if (!isLoggedIn) {
          toast.error("Please login to follow");
          return;
      }
      try {
          await toggleFollow(advisor.sa_id);
          toast.success(isFollowing ? "Unfollowed" : "Followed");
      } catch {
          toast.error("Action failed");
      }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim() || !reviewName.trim()) {
      return toast.error("Please fill in name and comment.");
    }
    setSubmitting(true);
    try {
      await addReview({
        sa_id: advisor.sa_id,
        userName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success("Review submitted!");
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tier Helper
  const getTier = (points: number) => {
      if (points >= 600000) return { level: 5, label: "Diamond", color: "bg-cyan-100 text-cyan-800 border-cyan-200" };
      if (points >= 300000) return { level: 4, label: "Platinum", color: "bg-slate-100 text-slate-800 border-slate-200" };
      if (points >= 150000) return { level: 3, label: "Gold", color: "bg-amber-100 text-amber-800 border-amber-200" };
      if (points >= 70000) return { level: 2, label: "Silver", color: "bg-gray-100 text-gray-800 border-gray-200" };
      if (points >= 30000) return { level: 1, label: "Bronze", color: "bg-orange-100 text-orange-800 border-orange-200" };
      return { level: 0, label: "Member", color: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  const handlePostComment = async (postId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to comment", {
        action: { label: "Login", onClick: () => navigate("/login") },
      });
      return;
    }
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    try {
      const tier = getTier(profile.points || 0);
      await addComment(postId, profile.name || "Guest", text, profile.email, tier);
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch {
      toast.error("Failed");
    }
  };

  const handleReplyToUser = (postId: string, userName: string) => {
      setOpenCommentId(postId);
      setCommentTexts(prev => ({ ...prev, [postId]: `@${userName} ` }));
  };

  const handleSharePost = (post: SAPostType) => {
    const waNumber = (advisor.whatsapp || advisor.phone).replace(
      /[\s\-\+]/g,
      ""
    );
    const text = encodeURIComponent(
      `Check out ${advisor.name}'s post!\n\n*${post.title}*\n${post.content}\n\nContact: wa.me/${waNumber}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "posts", label: "Posts", count: saPosts.length },
    { key: "gallery", label: "Gallery", count: gallery.length },
    { key: "reviews", label: "Reviews", count: reviews.length },
    { key: "transactions", label: "Deals", count: transactions.length },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  const userId = profile.id || "anon";

  return (
    <div className="pb-6">
      {/* Back */}
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="text-center px-5">
        <div className="relative inline-block">
          <ImageWithFallback
            src={advisor.avatar}
            alt={advisor.name}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary/20"
          />
          {advisor.badge && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 whitespace-nowrap">
              <Award className="w-3 h-3" />
              {advisor.badge}
            </div>
          )}
        </div>

        <h1 className="mt-5 text-lg">{advisor.name}</h1>
        <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs">
            {advisor.city}, {advisor.state}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(count > 0 ? avg : advisor.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {count > 0 ? avg : advisor.rating} ({count > 0 ? count : advisor.reviewCount})
          </span>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-4 mt-4 overflow-x-auto pb-2 px-2">
          <div className="text-center min-w-[50px]">
            <p className="text-base text-primary font-semibold">{totalFollowers}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</p>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="text-center min-w-[50px]">
            <p className="text-base text-primary font-semibold">{totalLikes}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes</p>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="text-center min-w-[50px]">
            <p className="text-base text-primary font-semibold">{saPosts.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Posts</p>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="text-center min-w-[50px]">
            <p className="text-base text-primary font-semibold">{count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reviews</p>
          </div>
          <div className="w-px bg-border h-8 self-center" />
          <div className="text-center min-w-[50px]">
            <p className="text-base text-primary font-semibold">{completedDeals}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deals</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mx-5 mt-5 bg-accent rounded-xl p-4">
        <p className="text-sm text-foreground">{advisor.bio}</p>
      </div>

      {/* Social Media */}
      {advisor.socialMedia && Object.values(advisor.socialMedia).some(v => v) && (
        <div className="flex justify-center gap-3 mt-4">
          {advisor.socialMedia.facebook && (
            <a href={advisor.socialMedia.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {advisor.socialMedia.instagram && (
            <a href={advisor.socialMedia.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {advisor.socialMedia.linkedin && (
            <a href={advisor.socialMedia.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {advisor.socialMedia.twitter && (
            <a href={advisor.socialMedia.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2]/20 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {advisor.socialMedia.tiktok && (
            <a href={advisor.socialMedia.tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black/5 text-black flex items-center justify-center hover:bg-black/10 transition-colors">
              <span className="font-bold text-[10px]">TikTok</span>
            </a>
          )}
        </div>
      )}

      {/* Branch Info */}
      <div className="mx-5 mt-3 bg-white rounded-xl border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Perodua Branch</p>
            <p className="text-sm">{advisor.branch}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{advisor.city}, {advisor.state}</p>
          </div>
        </div>
        <a
          href={advisor.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${advisor.branch} ${advisor.city} ${advisor.state}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 py-2.5 rounded-xl text-sm hover:bg-blue-100 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          View on Google Maps
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Select / CTA */}
      <div className="px-5 mt-4 flex gap-2">
        {!isSelected ? (
          <button
            onClick={handleSelectSA}
            className="flex-1 bg-primary/10 text-primary py-2.5 rounded-xl text-center text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Select as My SA
          </button>
        ) : (
          <button
            onClick={() => {
                clearSA();
                toast.success("Unselected SA");
            }}
            className="group flex-1 relative overflow-hidden bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-center text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
             <span className="flex items-center justify-center gap-2 group-hover:translate-y-full transition-transform absolute inset-0">
                <CheckCircle2 className="w-4 h-4" />
                Your SA
             </span>
             <span className="flex items-center justify-center gap-2 -translate-y-full group-hover:translate-y-0 transition-transform absolute inset-0">
                Unselect
             </span>
             {/* Spacer to maintain height */}
             <span className="opacity-0">Your SA</span>
          </button>
        )}
        <button
          onClick={handleFollow}
          className={`px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors border ${isFollowing ? "bg-red-50 text-red-600 border-red-100" : "bg-white border-border text-muted-foreground hover:bg-accent"}`}
        >
          <Heart className={`w-4 h-4 ${isFollowing ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 font-medium hover:bg-[#20bd5a] transition-colors"
        >
          <Send className="w-4 h-4" />
          WhatsApp
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-5 border-b border-border">
        <div className="flex px-5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[80px] pb-3 text-xs text-center border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/10"
                    : "bg-accent"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5 mt-4">
        {/* POSTS */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {saPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              </div>
            ) : (
              saPosts.map((post) => {
                const PIcon = postTypeIcons[post.type] || FileText;
                const pColor = postTypeColors[post.type] || postTypeColors.general;
                const liked = post.likes.includes(userId);
                const showCmts = openCommentId === post.id;
                
                const images = (post.images && post.images.length > 0) ? post.images : post.image_url ? [post.image_url] : [];

                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-border overflow-hidden"
                  >
                    <div className="p-4 pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${pColor}`}>
                          <PIcon className="w-2.5 h-2.5" />
                          {post.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-sm mb-1">{post.title}</h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>
                    
                    {/* Multi Image Carousel */}
                    {images.length > 0 && (
                        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                            <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scrollbar-hide">
                                {images.map((img, idx) => (
                                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                                        <ImageWithFallback
                                            src={img}
                                            alt={`${post.title} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            {images.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                    1/{images.length}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between px-4 py-1.5 text-[10px] text-muted-foreground">
                      <span>{post.likes.length} likes</span>
                      <span>{post.comments.length} comments</span>
                    </div>
                    {/* Actions */}
                    <div className="flex border-t border-border text-[10px]">
                      <button
                        onClick={() => toggleLike(post.id, userId)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 hover:bg-accent/50 transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <Heart className={`w-3 h-3 ${liked ? "fill-primary" : ""}`} />
                        Like
                      </button>
                      <button
                        onClick={() => setOpenCommentId(showCmts ? null : post.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-muted-foreground hover:bg-accent/50 transition-colors border-x border-border"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Comment
                      </button>
                      <button
                        onClick={() => handleSharePost(post)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-muted-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </button>
                    </div>
                    {/* Comments */}
                    {showCmts && (
                      <div className="border-t border-border">
                        {post.comments.length > 0 && (
                          <div className="px-4 py-2 space-y-2 max-h-40 overflow-y-auto">
                            {post.comments.map((cmt) => {
                              const isSAComment = cmt.userName === advisor.name;
                              return (
                                <div key={cmt.id} className={`flex gap-2 p-2 rounded-lg ${isSAComment ? "bg-primary/5 border border-primary/10" : ""}`}>
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] shrink-0 mt-0.5 ${isSAComment ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                    {isSAComment ? <Award className="w-3 h-3" /> : cmt.userName[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                      <span className="text-[10px] font-medium">{cmt.userName}</span>
                                      {isSAComment && <span className="text-[8px] bg-primary text-white px-1.5 rounded-full font-medium">Author</span>}
                                      {!isSAComment && cmt.tier && cmt.tier.level > 0 && (
                                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border ${cmt.tier.color}`}>
                                              {cmt.tier.label}
                                          </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{cmt.text}</p>
                                    
                                    {/* Reply Button for Author */}
                                    {isAuthor && !isSAComment && (
                                      <button 
                                        onClick={() => handleReplyToUser(post.id, cmt.userName)}
                                        className="text-[9px] text-primary mt-1 hover:underline"
                                      >
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex gap-2 p-3 bg-accent/50">
                          {isLoggedIn ? (
                            <>
                              <input
                                type="text"
                                value={commentTexts[post.id] || ""}
                                onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handlePostComment(post.id)}
                                className="flex-1 bg-white px-3 py-1.5 rounded-full text-[10px] border border-border focus:border-primary focus:outline-none"
                                placeholder="Write a comment..."
                              />
                              <button
                                onClick={() => handlePostComment(post.id)}
                                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <Link
                              to="/login"
                              className="flex-1 text-center text-[10px] text-primary py-1.5 bg-primary/5 rounded-full"
                            >
                              Login to comment
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* GALLERY */}
        {activeTab === "gallery" && (
            <div className="grid grid-cols-2 gap-3">
                {gallery.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No photos yet.</p>
                    </div>
                ) : (
                    gallery.map((item: any) => (
                        <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                            <ImageWithFallback src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex items-end p-2">
                                <p className="text-[10px] text-white font-medium line-clamp-2">{item.caption}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl mb-4 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            )}
            {showReviewForm && (
              <div className="bg-accent rounded-xl p-4 mb-4 space-y-3">
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:outline-none"
                  placeholder="Your name"
                />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} className="p-0.5">
                      <Star className={`w-6 h-6 ${s <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:outline-none min-h-[70px] resize-none"
                  placeholder="Share your experience..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 bg-white border border-border py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                          {rev.userName[0]}
                        </div>
                        <div>
                          <p className="text-xs">{rev.userName}</p>
                          <p className="text-[9px] text-muted-foreground">{formatDate(rev.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div>
            {txnLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No deals recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="bg-white rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px]">
                          {txn.userName[0]}
                        </div>
                        <div>
                          <p className="text-xs">{txn.userName}</p>
                          <p className="text-[9px] text-muted-foreground">{formatDate(txn.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${txn.status === "completed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {txn.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {txn.status === "completed" ? "Done" : "Sent"}
                      </span>
                    </div>
                    <div className="bg-accent rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Vehicle</p>
                          <p className="text-xs font-medium">{txn.modelName} {txn.variantName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase">Price</p>
                          <p className="text-xs font-medium">RM {txn.totalPrice.toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}