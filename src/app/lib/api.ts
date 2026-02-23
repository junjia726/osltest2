import { projectId, publicAnonKey } from "/utils/supabase/info";
import { type UserProfile } from "../data/user";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d9a6e93b`;

const authHeaders = () => ({
  Authorization: `Bearer ${publicAnonKey}`,
  "Content-Type": "application/json",
});

const MAX_RETRIES = 4;
const RETRY_DELAYS = [1500, 3000, 5000, 8000]; // ms backoff

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
          ...authHeaders(),
          ...(options?.headers || {}),
        },
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 404) {
          console.warn(`API [${res.status}] ${path}: ${err}`);
        } else {
          console.error(`API error [${res.status}] ${path}: ${err}`);
        }
        throw new Error(err);
      }
      return await res.json();
    } catch (e: any) {
      lastError = e;
      // Only retry on network-level failures (Failed to fetch / TypeError)
      const isNetworkError =
        e instanceof TypeError || e?.message?.includes("Failed to fetch");
      if (!isNetworkError || attempt >= MAX_RETRIES) {
        throw e;
      }
      const delay = RETRY_DELAYS[attempt] ?? 5000;
      console.log(
        `Retrying ${path} (attempt ${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError!;
}

// ─── Types ─────────────────────────────────────────────

export interface PostComment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
  userEmail?: string;
  tier?: { level: number; label: string; color: string };
}

export interface SAPost {
  id: string;
  sa_id: string;
  sa_name: string;
  sa_avatar: string;
  title: string;
  content: string;
  image_url: string;
  images?: string[];
  type: "promotion" | "announcement" | "tip" | "general";
  likes: string[];
  comments: PostComment[];
  createdAt: string;
}

export interface Review {
  id: string;
  sa_id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  sa_id: string;
  // Old fields
  userName?: string;
  modelName?: string;
  variantName?: string;
  colorName?: string;
  totalPrice?: number;
  
  // New fields
  user_email?: string;
  car_model?: string;
  price?: number;
  purchase_date?: string;
  
  status: "sent" | "completed" | "confirmed";
  created_at?: string;
  createdAt?: string; // Legacy
}

export interface SalesAdvisor {
  sa_id: string;
  name: string;
  avatar: string;
  region: string;
  state: string;
  city: string;
  phone: string;
  whatsapp: string;
  bio: string;
  badge: string;
  rating: number;
  reviewCount: number;
  branch: string;
  googleMapUrl: string;
  followers?: string[];
  kpi: {
    visits: number;
    inquiries: number;
    conversionRate: number;
  };
  gallery?: {
    id: string;
    imageUrl: string;
    caption: string;
    date: string;
  }[];
  assignedUsers: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    threads?: string;
    xiaohongshu?: string;
  };
}

// ─── Follow ─────────────────────────────────────────────

export const followSA = (email: string, saId: string, action: 'follow' | 'unfollow') =>
  request<{ following: string[], followersCount: number }>(`/users/${email}/follow`, { method: "POST", body: JSON.stringify({ saId, action }) });

export interface RefCode {
  code: string;
  status: "active" | "used";
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface UserVoucher {
  id: string;
  user_email: string;
  title: string;
  description: string;
  expiry_date?: string;
  status: "active" | "used" | "expired";
  used_at?: string;
  image_url?: string;
  type: "model-specific" | "all-model" | "partner-voucher";
  valid_models?: string[];
  points_cost?: number; // If redeemable in future
  partner_id?: string;
}

export interface ConsumptionProof {
  id: string;
  user_email: string; // Linking by email for simplicity in this no-SQL setup
  user_name: string;
  voucher_id: string;
  voucher_title: string;
  invoice_amount: number;
  invoice_image: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface SalesTransaction {
  id: string;
  sa_id: string;
  user_email: string;
  car_model: string;
  price: number;
  purchase_date: string;
  status: "confirmed";
  created_at: string;
}

// ─── Vouchers & Levels ─────────────────────────────────

export const getUserVouchers = (email: string) => 
  request<UserVoucher[]>(`/users/${email}/vouchers`);

export const createUserVoucher = (data: Omit<UserVoucher, "id">) =>
  request<UserVoucher>("/vouchers/assign", { method: "POST", body: JSON.stringify(data) });

export const updateUserVoucherStatus = (id: string, status: string) =>
  request<UserVoucher>(`/vouchers/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const submitConsumptionProof = (data: Omit<ConsumptionProof, "id" | "created_at" | "status">) =>
  request<ConsumptionProof>("/consumption-proofs", { method: "POST", body: JSON.stringify(data) });

export const getConsumptionProofs = () => 
  request<ConsumptionProof[]>("/consumption-proofs");

export const getUserConsumptionProofs = (email: string) =>
  request<ConsumptionProof[]>(`/users/${encodeURIComponent(email)}/consumption-proofs`);

export const updateConsumptionProofStatus = (id: string, status: string) =>
  request<ConsumptionProof>(`/consumption-proofs/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const registerTransaction = (data: Omit<SalesTransaction, "id" | "created_at" | "status">) =>
  request<SalesTransaction>("/transactions/register", { method: "POST", body: JSON.stringify(data) });

// ─── Admin Vouchers Definitions (Templates) ─────────────
export interface VoucherTemplate {
  id: string;
  title: string;
  description: string;
  type: "model-specific" | "all-model";
  valid_models?: string[]; // comma separated string or array
  image_url?: string;
  points_required?: number;
}

export const getVoucherTemplates = () => request<VoucherTemplate[]>("/admin/voucher-templates");

export const createVoucherTemplate = (data: Omit<VoucherTemplate, "id">) =>
  request<VoucherTemplate>("/admin/voucher-templates", { method: "POST", body: JSON.stringify(data) });

export const deleteVoucherTemplate = (id: string) =>
  request<void>(`/admin/voucher-templates/${id}`, { method: "DELETE" });

// ─── Seed ──────────────────────────────────────────────

export const seed = () => request<any>("/seed", { method: "POST" });

// ─── Auth ──────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  user?: { name: string; email: string; region: string; role: string; createdAt: string; avatar?: string };
  error?: string;
}

export interface SAAuthResponse {
  message: string;
  sa_id?: string;
  error?: string;
  avatar?: string;
  status?: string;
  name?: string;
  email?: string;
  branch?: string;
  region?: string;
  banReason?: string;
  banDuration?: number;
  bannedAt?: string;
  suspendReason?: string;
  hasAppealed?: boolean;
}

export const authRegister = (data: {
  name: string;
  email: string;
  password: string;
  region: string;
  role?: string;
}) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const authLogin = (data: { email: string; password: string }) =>
  request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) });

export const authSALogin = (data: { sa_id: string; password: string }) =>
  request<SAAuthResponse>("/auth/sa-login", { method: "POST", body: JSON.stringify(data) });

export const authPartnerLogin = (data: { shop_name: string; password: string }) =>
  request<{ message: string; role: string; partner: any }>("/auth/partner-login", { method: "POST", body: JSON.stringify(data) });

export const authSARegister = (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  branch: string;
  region: string;
  referenceCode: string;
}) => request<SAAuthResponse & { user?: any }>("/auth/sa-register", { method: "POST", body: JSON.stringify(data) });

export const getPublicSAs = () => request<SalesAdvisor[]>("/sas/public");

// ─── Posts ─────────────────────────────────────────────

export const getPosts = () => request<SAPost[]>("/posts");

export const getPostsBySA = (saId: string) =>
  request<SAPost[]>(`/posts/sa/${saId}`);

export const createPost = (data: {
  sa_id: string;
  sa_name: string;
  sa_avatar: string;
  title: string;
  content: string;
  image_url?: string;
  images?: string[];
  type: string;
}) => request<SAPost>("/posts", { method: "POST", body: JSON.stringify(data) });

export const updatePost = (id: string, data: Partial<SAPost>) =>
  request<SAPost>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const updateSAGallery = (saId: string, gallery: any[]) =>
  request<any>(`/sas/${saId}/gallery`, { method: "POST", body: JSON.stringify({ gallery }) });


export const deletePost = (id: string) =>
  request<any>(`/posts/${id}`, { method: "DELETE" });

export const toggleLike = (postId: string, userId: string) =>
  request<{ likes: string[] }>(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });

export const addComment = (
  postId: string,
  userName: string,
  text: string,
  userEmail?: string,
  tier?: any
) =>
  request<PostComment>(`/posts/${postId}/comment`, {
    method: "POST",
    body: JSON.stringify({ userName, text, userEmail, tier }),
  });

// ─── Reviews ───────────────────────────────────────────

export const getReviews = () => request<Review[]>("/reviews");

export const getReviewsBySA = (saId: string) =>
  request<Review[]>(`/reviews/sa/${saId}`);

export const createReview = (data: {
  sa_id: string;
  userName: string;
  rating: number;
  comment: string;
}) =>
  request<Review>("/reviews", { method: "POST", body: JSON.stringify(data) });

// ─── Transactions ──────────────────────────────────────

export const getTransactionsBySA = (saId: string) =>
  request<Transaction[]>(`/transactions/sa/${saId}`);

export const createTransaction = (data: {
  sa_id: string;
  userName: string;
  modelName: string;
  variantName: string;
  colorName: string;
  totalPrice: number;
  status: string;
}) =>
  request<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ─── Image Upload ──────────────────────────────────────

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${publicAnonKey}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Upload error: ${err}`);
    throw new Error(err);
  }
  const data = await res.json();
  return data.url;
};

// ─── ADMIN ─────────────────────────────────────────────

export const deleteNotification = (email: string, notifId: string) =>
  request<void>(`/notifications/${notifId}?email=${encodeURIComponent(email)}`, { method: "DELETE" });

export const getUserProfile = (email: string) => request<UserProfile>(`/users/${encodeURIComponent(email)}`);

export const adminGetUsers = () => request<any[]>("/admin/users");

export const adminGetSAs = () => request<any[]>("/admin/sas");

export const adminUpdateUserStatus = (email: string, status: string) =>
  request<any>("/admin/users/status", {
    method: "POST",
    body: JSON.stringify({ email, status }),
  });

export const adminUpdateSAStatus = (
  saId: string, 
  status: string, 
  extras?: { 
    banDuration?: number; 
    reason?: string; 
    title?: string; 
    message?: string 
  }
) =>
  request<any>("/admin/sas/status", {
    method: "POST",
    body: JSON.stringify({ sa_id: saId, status, ...extras }),
  });

export const saAppeal = (saId: string, message: string) =>
  request<any>(`/sas/${saId}/appeal`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

export const deleteAccount = (id: string, type: 'user' | 'sa') =>
  request<any>("/auth/delete", {
    method: "DELETE",
    body: JSON.stringify({ id, type }),
  });

export const adminGetRefCodes = () => request<RefCode[]>("/admin/ref-codes");

export const adminGenerateRefCode = (code?: string) => 
  request<RefCode>("/admin/ref-codes", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

export const adminDeleteRefCode = (code: string) =>
  request<any>(`/admin/ref-codes/${code}`, { method: "DELETE" });

export const adminDeleteReview = (id: string) =>
  request<any>(`/admin/reviews/${id}`, { method: "DELETE" });

export const adminDeleteComment = (postId: string, commentId: string) =>
  request<any>(`/admin/comments/${postId}/${commentId}`, { method: "DELETE" });

export const adminResetData = () => 
  request<any>("/admin/reset-data", { method: "POST" });

export const updateUserProfile = (email: string, data: any) =>
  request<any>(`/users/${email}`, { method: "PUT", body: JSON.stringify(data) });

export const updateSAProfile = (saId: string, data: any) =>
  request<any>(`/sas/${saId}`, { method: "PUT", body: JSON.stringify(data) });

// ─── CARS ──────────────────────────────────────────────

export const getCars = () => request<any[]>("/cars");

export const updateCars = (data: any[]) => 
  request<any[]>("/cars", { method: "POST", body: JSON.stringify(data) });

// ─── NOTIFICATIONS ─────────────────────────────────────

export interface Notification {
  id: string;
  email: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = (email: string) => 
  request<Notification[]>(`/notifications/${encodeURIComponent(email)}`);

export const createNotification = (data: {
  email: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
}) => request<Notification>("/notifications", { method: "POST", body: JSON.stringify(data) });

export const markNotificationRead = (email: string, id: string) =>
  request<any>(`/notifications/${encodeURIComponent(email)}/${id}/read`, { method: "PUT" });

// ─── LEADS ─────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  phone: string;
  region: string;
  model: string;
  timeline: string;
  payment: string;
  score: number;
  status: "HOT" | "WARM" | "COLD";
  createdAt: string;
}

export const createLead = (data: {
  name: string;
  phone: string;
  region: string;
  model: string;
  timeline: string;
  payment: string;
}) => request<Lead>("/leads", { method: "POST", body: JSON.stringify(data) });

export const getLeads = () => request<Lead[]>("/leads");

// ─── PARTNERS ──────────────────────────────────────────

export interface PartnerProduct {
  id: string;
  image_url?: string;
  title: string;
  description?: string;
  discount_info?: string;
  terms_conditions?: string;
  expiry_date?: string;
}

export interface Partner {
  id: string;
  business_name: string;
  logo_url: string;
  short_description: string;
  full_description: string;
  phone: string;
  whatsapp_url: string;
  website_url: string;
  address: string;
  map_url?: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  products?: PartnerProduct[];
}

export const getPartners = () => request<Partner[]>("/partners");

export const getPartnerById = (id: string) => request<Partner>(`/partners/${id}`);

export const createPartner = (data: Omit<Partner, "id" | "created_at">) =>
  request<Partner>("/partners", { method: "POST", body: JSON.stringify(data) });

export const updatePartner = (id: string, data: Partial<Partner>) =>
  request<Partner>(`/partners/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePartner = (id: string) =>
  request<void>(`/partners/${id}`, { method: "DELETE" });

export const adminGetTransactions = () =>
  request<SalesTransaction[]>("/transactions");

export const adminDeleteTransaction = (id: string) =>
  request<void>(`/transactions/${id}`, { method: "DELETE" });

export const adminGetAllVouchers = () => request<UserVoucher[]>("/admin/vouchers");

export const adminReopenVoucher = (id: string) => 
  request<UserVoucher>(`/admin/vouchers/${id}/reopen`, { method: "POST" });

export const adminSetUserPoints = (email: string, points: number) =>
  request<{ ok: boolean; points: number }>(`/admin/users/${encodeURIComponent(email)}/points`, {
    method: "POST",
    body: JSON.stringify({ points }),
  });
