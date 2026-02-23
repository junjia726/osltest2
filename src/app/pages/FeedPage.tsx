import { useState } from "react";
import { Link } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  Award,
  Shield,
  FileText,
  Megaphone,
  Lightbulb,
  Tag,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useRealtime } from "../components/RealtimeContext";
import { useUser } from "../components/UserContext";
import { toast } from "sonner";
import { SAPost } from "../lib/api";

const typeIcons: Record<string, any> = {
  promotion: Tag,
  announcement: Megaphone,
  tip: Lightbulb,
  general: FileText,
};
const typeColors: Record<string, string> = {
  promotion: "bg-rose-50 text-rose-600 border-rose-100",
  announcement: "bg-blue-50 text-blue-600 border-blue-100",
  tip: "bg-amber-50 text-amber-600 border-amber-100",
  general: "bg-slate-50 text-slate-600 border-slate-100",
};

function PostCard({ post }: { post: SAPost }) {
  const { profile, isLoggedIn, salesAdvisors } = useUser();
  const { toggleLike, addComment } = useRealtime();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userId = profile.id || `anon-${Math.random().toString(36).slice(2)}`;
  const liked = post.likes.includes(userId);
  const Icon = typeIcons[post.type] || FileText;
  const colorClass = typeColors[post.type] || typeColors.general;

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to like posts", {
        action: { label: "Login", onClick: () => (window.location.href = "/login") },
      });
      return;
    }
    try {
      await toggleLike(post.id, userId);
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to comment", {
        action: { label: "Login", onClick: () => (window.location.href = "/login") },
      });
      return;
    }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const name = profile.name || "Guest";
      await addComment(post.id, name, commentText.trim());
      setCommentText("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const saInfo = salesAdvisors.find((s) => s.sa_id === post.sa_id);
    const waNumber = saInfo
      ? (saInfo.whatsapp || saInfo.phone).replace(/[\s\-\+]/g, "")
      : "";
    const text = encodeURIComponent(
      `Check out this post from ${post.sa_name} at OSL AUTOSALES!\n\n*${post.title}*\n${post.content}\n\nContact: wa.me/${waNumber}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  };
  
  const images = (post.images && post.images.length > 0) ? post.images : post.image_url ? [post.image_url] : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`/sa/${post.sa_id}`} className="relative">
          <ImageWithFallback
            src={post.sa_avatar}
            alt={post.sa_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-white">
             <Award className="w-2.5 h-2.5" />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/sa/${post.sa_id}`}
            className="text-sm font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-1 truncate"
          >
            {post.sa_name}
          </Link>
          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
            <span>{formatDate(post.createdAt)}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-medium uppercase tracking-wider ${colorClass}`}>
                {post.type}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {images.length > 0 && (
          <div className="relative w-full bg-gray-100 overflow-hidden group-hover:opacity-95 transition-opacity cursor-pointer" onClick={() => setShowComments(!showComments)}>
              {images.length === 1 ? (
                 <ImageWithFallback
                    src={images[0]}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-[400px]"
                />
              ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-[300px] scrollbar-hide">
                  {images.map((img, idx) => (
                      <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                          <ImageWithFallback
                              src={img}
                              alt={`${post.title} ${idx + 1}`}
                              className="w-full h-full object-cover"
                          />
                      </div>
                  ))}
                   <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
                      1 / {images.length}
                   </div>
                </div>
              )}
          </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-4">
             <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    liked ? "text-rose-500" : "text-gray-500 hover:text-rose-500"
                }`}
             >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{post.likes.length}</span>
             </button>
             <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
             >
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments.length}</span>
             </button>
        </div>
        <button
            onClick={handleShare}
            className="text-gray-400 hover:text-[#25D366] transition-colors p-1"
        >
            <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-3 animate-in slide-in-from-top-2 duration-200">
          {post.comments.length > 0 ? (
            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {post.comments.map((cmt) => {
                const isAuthor = cmt.userName === post.sa_name;
                const isSA = salesAdvisors.some(s => s.name === cmt.userName);
                
                return (
                    <div key={cmt.id} className="flex gap-2 text-sm">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${isAuthor ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>
                        {isAuthor ? <Award className="w-3 h-3" /> : cmt.userName[0]}
                      </div>
                      <div className="flex-1 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                         <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-gray-900 flex items-center gap-1">
                                {cmt.userName}
                                {isAuthor && <span className="text-[8px] bg-primary/10 text-primary px-1 rounded">Author</span>}
                            </span>
                            <span className="text-[9px] text-gray-400">{formatDate(cmt.createdAt)}</span>
                         </div>
                         <p className="text-xs text-gray-600">{cmt.text}</p>
                      </div>
                    </div>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-4 text-xs text-muted-foreground italic">
                No comments yet. Be the first!
             </div>
          )}

          <div className="flex gap-2">
            {isLoggedIn ? (
              <div className="flex-1 flex gap-2 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1 bg-white px-3 py-2 rounded-xl text-xs border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm pr-8"
                  placeholder="Write a comment..."
                />
                <button
                  onClick={handleComment}
                  disabled={submitting || !commentText.trim()}
                  className="absolute right-1 top-1 w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 disabled:bg-gray-300 transition-all hover:scale-105 active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex-1 text-center text-xs text-primary font-medium py-2 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors"
              >
                Log in to join the discussion
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FeedPage() {
  const { posts, postsLoading, profile } = useRealtime();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filters = [
    { id: "all", label: "All Posts" },
    { id: "following", label: "Following" },
    { id: "promotion", label: "Promotions" },
    { id: "announcement", label: "News" },
    { id: "tip", label: "Car Tips" },
    { id: "general", label: "General" },
  ];

  const filteredPosts = posts.filter(p => {
      // 1. Text Search
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.sa_name.toLowerCase().includes(q);
          if (!matches) return false;
      }
      
      // 2. Category Filter
      if (activeFilter === "all") return true;
      if (activeFilter === "following") return profile.following?.includes(p.sa_id);
      return p.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 pt-4 pb-2 px-5">
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                 <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                 </Link>
                 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Community Feed</h1>
             </div>
             <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                 <Filter className="w-4 h-4" />
             </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search updates, agents, or topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
            />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === f.id
                  ? "bg-black text-white shadow-md shadow-black/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {postsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading community updates...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No posts found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
            </p>
            <button 
                onClick={() => {setActiveFilter('all'); setSearchQuery('');}}
                className="mt-6 text-sm font-medium text-primary hover:underline"
            >
                Clear all filters
            </button>
          </div>
        ) : (
          <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
            <Masonry gutter="16px">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </div>
    </div>
  );
}
