import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import * as api from "../lib/api";
import type { SAPost, Review, Transaction } from "../lib/api";

interface RealtimeContextValue {
  // Posts
  posts: SAPost[];
  postsLoading: boolean;
  refreshPosts: () => Promise<void>;
  createPost: typeof api.createPost;
  updatePost: (id: string, data: Partial<SAPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (
    postId: string,
    userName: string,
    text: string,
    userEmail?: string,
    tier?: any
  ) => Promise<void>;

  // Reviews
  allReviews: Review[];
  getReviewsBySA: (saId: string) => Review[];
  addReview: (data: {
    sa_id: string;
    userName: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
  getAverageRating: (saId: string) => { avg: number; count: number };
  refreshReviews: () => Promise<void>;

  // Transactions
  getTransactionsBySA: (saId: string) => Promise<Transaction[]>;
  addTransaction: (data: {
    sa_id: string;
    userName: string;
    modelName: string;
    variantName: string;
    colorName: string;
    totalPrice: number;
    status: string;
  }) => Promise<void>;

  // Image
  uploadImage: (file: File) => Promise<string>;
}

const noop = () => {};
const noopAsync = async () => {};
const emptyArr: any[] = [];

const defaultValue: RealtimeContextValue = {
  posts: emptyArr,
  postsLoading: true,
  refreshPosts: noopAsync,
  createPost: (() => Promise.resolve({})) as any,
  updatePost: noopAsync,
  deletePost: noopAsync,
  toggleLike: noopAsync,
  addComment: noopAsync,
  allReviews: emptyArr,
  getReviewsBySA: () => emptyArr,
  addReview: noopAsync,
  getAverageRating: () => ({ avg: 0, count: 0 }),
  refreshReviews: noopAsync,
  getTransactionsBySA: async () => emptyArr,
  addTransaction: noopAsync,
  uploadImage: async () => "",
};

const RealtimeContext = createContext<RealtimeContextValue>(defaultValue);

const POLL_INTERVAL = 10000; // 10 seconds

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SAPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const initDone = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch posts (silent = don't update loading state, used for polling)
  const refreshPosts = useCallback(async (silent = false) => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (e) {
      if (!silent) console.error("Failed to refresh posts:", e);
    } finally {
      if (!silent) setPostsLoading(false);
    }
  }, []);

  // Fetch reviews
  const refreshReviews = useCallback(async () => {
    try {
      const data = await api.getReviews();
      setAllReviews(data);
    } catch (e) {
      // silently ignore polling errors
    }
  }, []);

  // Seed → then initial fetch → then start polling
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    let cancelled = false;

    async function init() {
      // Step 1: Seed the database (idempotent, retries built into request())
      try {
        await api.seed();
      } catch {
        // seed might already exist, or it retried and eventually failed — proceed anyway
      }

      if (cancelled) return;

      // Step 2: Fetch initial data (also has built-in retries)
      await Promise.all([refreshPosts(false), refreshReviews()]);

      if (cancelled) return;

      // Step 3: Start polling only after first successful load
      pollRef.current = setInterval(() => {
        refreshPosts(true);
        refreshReviews();
      }, POLL_INTERVAL);
    }

    init();

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshPosts, refreshReviews]);

  // Post actions (optimistic updates)
  const handleCreatePost: typeof api.createPost = useCallback(
    async (data) => {
      const newPost = await api.createPost(data);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    []
  );

  const handleUpdatePost = useCallback(async (id: string, data: Partial<SAPost>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    await api.updatePost(id, data);
  }, []);

  const handleDeletePost = useCallback(async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await api.deletePost(id);
  }, []);

  const handleToggleLike = useCallback(
    async (postId: string, userId: string) => {
      // Optimistic
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const likes = [...p.likes];
          const idx = likes.indexOf(userId);
          if (idx === -1) likes.push(userId);
          else likes.splice(idx, 1);
          return { ...p, likes };
        })
      );
      await api.toggleLike(postId, userId);
    },
    []
  );

  const handleAddComment = useCallback(
    async (postId: string, userName: string, text: string, userEmail?: string, tier?: any) => {
      const comment = await api.addComment(postId, userName, text, userEmail, tier);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, comment] }
            : p
        )
      );
    },
    []
  );

  // Review helpers
  const getReviewsBySA = useCallback(
    (saId: string) => allReviews.filter((r) => r.sa_id === saId),
    [allReviews]
  );

  const getAverageRating = useCallback(
    (saId: string) => {
      const revs = allReviews.filter((r) => r.sa_id === saId);
      if (revs.length === 0) return { avg: 0, count: 0 };
      const sum = revs.reduce((acc, r) => acc + r.rating, 0);
      return {
        avg: Math.round((sum / revs.length) * 10) / 10,
        count: revs.length,
      };
    },
    [allReviews]
  );

  const handleAddReview = useCallback(
    async (data: {
      sa_id: string;
      userName: string;
      rating: number;
      comment: string;
    }) => {
      const rev = await api.createReview(data);
      setAllReviews((prev) => [rev, ...prev]);
    },
    []
  );

  // Transaction helpers
  const handleGetTransactionsBySA = useCallback(async (saId: string) => {
    return api.getTransactionsBySA(saId);
  }, []);

  const handleAddTransaction = useCallback(
    async (data: {
      sa_id: string;
      userName: string;
      modelName: string;
      variantName: string;
      colorName: string;
      totalPrice: number;
      status: string;
    }) => {
      await api.createTransaction(data);
    },
    []
  );

  return (
    <RealtimeContext.Provider
      value={{
        posts,
        postsLoading,
        refreshPosts: () => refreshPosts(false),
        createPost: handleCreatePost,
        updatePost: handleUpdatePost,
        deletePost: handleDeletePost,
        toggleLike: handleToggleLike,
        addComment: handleAddComment,
        allReviews,
        getReviewsBySA,
        addReview: handleAddReview,
        getAverageRating,
        refreshReviews,
        getTransactionsBySA: handleGetTransactionsBySA,
        addTransaction: handleAddTransaction,
        uploadImage: api.uploadImage,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}