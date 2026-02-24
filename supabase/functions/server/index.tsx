import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Supabase client for storage
const supabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

// Idempotently create storage bucket on first request
let bucketReady = false;
const BUCKET = "make-d9a6e93b-images";

async function ensureBucket() {
  if (bucketReady) return;
  try {
    const sb = supabase();
    const { data: buckets } = await sb.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === BUCKET);
    if (!exists) {
      // Changed to public: true for profile images
      await sb.storage.createBucket(BUCKET, { public: true });
      console.log(`Created bucket: ${BUCKET}`);
    } else {
        // If it exists, we try to update it to public (might not work if already created as private, but worth a try or just rely on public URL working if it was created public)
        // Since we can't easily update bucket public status via JS SDK without recreating, we assume it's fine or user deletes it manually if issues.
        // But for new deployments, this ensures public.
        // Actually, let's just update the bucket to be public if possible or ignore.
        await sb.storage.updateBucket(BUCKET, { public: true });
    }
    bucketReady = true;
  } catch (e) {
    console.log(`Bucket init error: ${e}`);
  }
}

async function retry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Operation failed, retrying (${i + 1}/${retries}): ${err}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed");
}

// ─── Health ────────────────────────────────────────────
app.get("/make-server-d9a6e93b/health", (c) => c.json({ status: "ok" }));

// ─── AUTH ───────────────────────────��──────────────────

// Register user
app.post("/make-server-d9a6e93b/auth/register", async (c) => {
  try {
    const { name, email: rawEmail, password, region, role, avatar } = await c.req.json();
    if (!rawEmail || !password || !name) {
      return c.json({ error: "Name, email, and password are required" }, 400);
    }
    const email = rawEmail.trim().toLowerCase();
    
    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }
    // Check if user already exists
    const existing = await kv.get(`user-auth:${email}`);
    if (existing) {
      return c.json({ error: "An account with this email already exists" }, 409);
    }
    
    // Check if email is used by an SA
    const allSAs = await kv.getByPrefix("sa-auth:");
    const saExists = allSAs.some((s: any) => s.email?.toLowerCase() === email);
    if (saExists) {
        return c.json({ error: "This email is associated with an SA account. Please use SA Login." }, 409);
    }

    // Check for Pending Points
    const pendingKey = `pending-points:${email}`;
    const pendingPoints = await kv.get(pendingKey);
    let initialPoints = 0;
    
    if (pendingPoints) {
        initialPoints = pendingPoints.points || 0;
        await kv.del(pendingKey); // Clear pending record
    }

    const user = {
      name,
      email: email,
      password, // prototype — in production, hash this
      region: region || "",
      role: role || "user",
      avatar: avatar || "",
      status: "active",
      following: [],
      points: initialPoints,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`user-auth:${email}`, user);
    return c.json(
      {
        message: "Registered successfully",
        user: {
          name: user.name,
          email: user.email,
          region: user.region,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          points: user.points
        },
      },
      201
    );
  } catch (e) {
    console.log(`Register error: ${e}`);
    return c.json({ error: `Registration failed: ${e}` }, 500);
  }
});

// Login user
app.post("/make-server-d9a6e93b/auth/login", async (c) => {
  try {
    const { email: rawEmail, password } = await c.req.json();
    if (!rawEmail || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const email = rawEmail.trim().toLowerCase();
    const user = await kv.get(`user-auth:${email}`);
    if (!user) {
      return c.json(
        { error: "No account found with this email. Please register first." },
        404
      );
    }
    if (user.password !== password) {
      return c.json({ error: "Incorrect password. Please try again." }, 401);
    }
    
    // Check if ban expired
    if (user.status === 'banned' && user.bannedAt && user.banDuration) {
        const bannedTime = new Date(user.bannedAt).getTime();
        const now = new Date().getTime();
        const durationMs = user.banDuration * 3600 * 1000; // stored in hours
        
        if (now > bannedTime + durationMs) {
            // Unban automatically
            user.status = 'active';
            user.banReason = null;
            user.banDuration = null;
            user.bannedAt = null;
            await kv.set(`user-auth:${email.toLowerCase()}`, user);
        }
    }

    if (user.status === 'banned') {
       return c.json({ error: "Your account has been banned." }, 403);
    }
    if (user.status === 'suspended') {
       return c.json({ error: "Your account is suspended." }, 403);
    }
    return c.json(
      {
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          region: user.region,
          role: user.role,
          avatar: user.avatar,
          following: user.following || [],
          createdAt: user.createdAt,
        },
      }
    );
  } catch (e) {
    console.log(`Login error: ${e}`);
    return c.json({ error: `Login failed: ${e}` }, 500);
  }
});

// Follow SA endpoint
app.post("/make-server-d9a6e93b/users/:email/follow", async (c) => {
  try {
    const email = c.req.param("email");
    const { saId, action } = await c.req.json(); // action: 'follow' | 'unfollow'
    
    // Get user
    const userKey = `user-auth:${email.toLowerCase()}`;
    const user = await kv.get(userKey);
    if (!user) return c.json({ error: "User not found" }, 404);
    
    // Get SA
    const saKey = `sa-auth:${saId}`;
    const sa = await kv.get(saKey);
    if (!sa) return c.json({ error: "SA not found" }, 404);
    
    // Update following list
    const following = user.following || [];
    const followers = sa.followers || [];
    const userId = user.email; // Using email as user ID for now as seen in other endpoints
    
    if (action === 'follow') {
        if (!following.includes(saId)) following.push(saId);
        if (!followers.includes(userId)) followers.push(userId);
    } else {
        const idx = following.indexOf(saId);
        if (idx > -1) following.splice(idx, 1);
        
        const fIdx = followers.indexOf(userId);
        if (fIdx > -1) followers.splice(fIdx, 1);
    }
    
    user.following = following;
    sa.followers = followers;
    
    await kv.set(userKey, user);
    await kv.set(saKey, sa);
    
    return c.json({ following: user.following, followersCount: sa.followers.length });
  } catch (e) {
    return c.json({ error: `Follow action failed: ${e}` }, 500);
  }
});

// SA Login (with password)
app.post("/make-server-d9a6e93b/auth/sa-login", async (c) => {
  try {
    const { sa_id, password } = await c.req.json();
    if (!sa_id || !password) {
      return c.json({ error: "SA ID and password are required" }, 400);
    }
    const saAuth = await kv.get(`sa-auth:${sa_id}`);
    if (!saAuth) {
      return c.json(
        { error: "SA account not found. Please register first." },
        404
      );
    }
    if (saAuth.password !== password) {
      return c.json({ error: "Incorrect password. Please try again." }, 401);
    }
    
    // Check if ban expired
    if (saAuth.status === 'banned' && saAuth.bannedAt && saAuth.banDuration) {
        const bannedTime = new Date(saAuth.bannedAt).getTime();
        const now = new Date().getTime();
        const durationMs = saAuth.banDuration * 3600 * 1000; // stored in hours
        
        if (now > bannedTime + durationMs) {
            // Unban automatically
            saAuth.status = 'active';
            saAuth.banReason = null;
            saAuth.banDuration = null;
            saAuth.bannedAt = null;
            saAuth.hasAppealed = false;
            saAuth.appealMessage = null;
            await kv.set(`sa-auth:${sa_id}`, saAuth);
        }
    }

    if (saAuth.status === 'banned') {
      return c.json({ error: "Your SA account has been banned." }, 403);
    }
    if (saAuth.status === 'suspended') {
      return c.json({ error: "Your SA account is suspended." }, 403);
    }
    
    // Check if banned - return specific info for dashboard
    if (saAuth.status === 'banned') {
      // Allow login so they can see the ban screen and appeal
      return c.json({ 
        message: "SA Login successful (Banned)", 
        sa_id: saAuth.sa_id,
        name: saAuth.name,
        email: saAuth.email,
        avatar: saAuth.avatar,
        branch: saAuth.branch,
        region: saAuth.region,
        status: 'banned',
        banReason: saAuth.banReason,
        banDuration: saAuth.banDuration,
        bannedAt: saAuth.bannedAt,
        hasAppealed: saAuth.hasAppealed
      });
    }

    // Check if suspended - allow login to see suspend screen
    if (saAuth.status === 'suspended') {
       return c.json({ 
        message: "SA Login successful (Suspended)", 
        sa_id: saAuth.sa_id,
        name: saAuth.name,
        email: saAuth.email,
        avatar: saAuth.avatar,
        branch: saAuth.branch,
        region: saAuth.region,
        status: 'suspended',
        suspendReason: saAuth.suspendReason,
        hasAppealed: saAuth.hasAppealed
      });
    }

    return c.json({ 
      message: "SA Login successful", 
      sa_id: saAuth.sa_id,
      avatar: saAuth.avatar,
      status: saAuth.status
    });
  } catch (e) {
    console.log(`SA Login error: ${e}`);
    return c.json({ error: `SA Login failed: ${e}` }, 500);
  }
});

// SA Register
app.post("/make-server-d9a6e93b/auth/sa-register", async (c) => {
  try {
    const { name, email, password, phone, branch, region, avatar, referenceCode } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Name, email, and password are required" }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }
    
    // Verify Reference Code
    if (!referenceCode) {
      return c.json({ error: "Reference code is required" }, 400);
    }
    const refKey = `ref-code:${referenceCode}`;
    const refData = await kv.get(refKey);
    if (!refData || refData.status !== 'active') {
      return c.json({ error: "Invalid or used reference code" }, 400);
    }

    // Check if email already used by a User
    const existingUser = await kv.get(`user-auth:${email.toLowerCase()}`);
    if (existingUser) {
      return c.json({ error: "Email is already registered as a User" }, 409);
    }
    
    // Check if phone or email already used by ANY SA (including suspended)
    const allSAs = await kv.getByPrefix("sa-auth:");
    const phoneExists = allSAs.some((s: any) => s.phone === phone);
    const emailExists = allSAs.some((s: any) => s.email.toLowerCase() === email.toLowerCase());

    if (phoneExists) {
      return c.json({ error: "Phone number already registered to another account" }, 409);
    }
    if (emailExists) {
      return c.json({ error: "Email already registered to another SA account" }, 409);
    }
    
    // Create SA auth record
    const saId = `sa-${Date.now()}`;
    await kv.set(`sa-auth:${saId}`, { 
      sa_id: saId, 
      email: email.toLowerCase(), 
      password, 
      name, 
      status: "active",
      avatar: avatar || "",
      branch: branch || "",
      region: region || "",
      phone: phone || "",
      followers: [],
      googleMapUrl: "",
      createdAt: new Date().toISOString(),
    });

    // Mark reference code as used
    refData.status = 'used';
    refData.usedBy = saId;
    refData.usedAt = new Date().toISOString();
    await kv.set(refKey, refData);

    return c.json(
      {
        message: "SA registered successfully",
        sa_id: saId,
        // Return a user-like object for frontend compatibility if needed, but it's not stored in user-auth
        user: {
          name,
          email: email.toLowerCase(),
          region: region || "",
          avatar: avatar || "",
          role: "sa"
        },
      },
      201
    );
  } catch (e) {
    console.log(`SA Register error: ${e}`);
    return c.json({ error: `SA Registration failed: ${e}` }, 500);
  }
});

// Update user profile (including avatar)
app.put("/make-server-d9a6e93b/users/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const updates = await c.req.json();
    const key = `user-auth:${email.toLowerCase()}`;
    const user = await kv.get(key);
    if (!user) return c.json({ error: "User not found" }, 404);
    
    const updated = { ...user, ...updates };
    await kv.set(key, updated);
    return c.json(updated);
  } catch (e) {
    return c.json({ error: `Update user error: ${e}` }, 500);
  }
});

// Update SA profile
app.put("/make-server-d9a6e93b/sas/:saId", async (c) => {
  try {
    const saId = c.req.param("saId");
    const updates = await c.req.json();
    const key = `sa-auth:${saId}`;
    const sa = await kv.get(key);
    if (!sa) return c.json({ error: "SA not found" }, 404);
    
    const updated = { ...sa, ...updates };
    await kv.set(key, updated);
    return c.json(updated);
  } catch (e) {
    return c.json({ error: `Update SA error: ${e}` }, 500);
  }
});

// Update SA Gallery
app.post("/make-server-d9a6e93b/sas/:saId/gallery", async (c) => {
  try {
    const saId = c.req.param("saId");
    const { gallery } = await c.req.json();
    const key = `sa-auth:${saId}`;
    const sa = await kv.get(key);
    if (!sa) return c.json({ error: "SA not found" }, 404);
    
    sa.gallery = gallery;
    await kv.set(key, sa);
    return c.json({ ok: true, gallery });
  } catch (e) {
    return c.json({ error: `Update gallery error: ${e}` }, 500);
  }
});

// Partner Login
app.post("/make-server-d9a6e93b/auth/partner-login", async (c) => {
  try {
    const { shop_name, password } = await c.req.json();
    if (!shop_name || !password) {
      return c.json({ error: "Shop Name and Password are required" }, 400);
    }
    
    // Fetch all partners to find matching name
    // (Since we don't have a direct key for shop name, and names are unique enough usually)
    // Ideally we should index by shop name, but for now scan is fine.
    const partners = await kv.getByPrefix("partner:");
    const partner = partners.find((p: any) => 
        p.business_name?.toLowerCase().trim() === shop_name.toLowerCase().trim()
    );

    if (!partner) {
      return c.json({ error: "Partner not found" }, 404);
    }
    
    // Check password (default to 'osl123456' if not set, for migration)
    const validPass = partner.password || "osl123456";
    
    if (password !== validPass) {
      return c.json({ error: "Incorrect password" }, 401);
    }

    if (!partner.is_active) {
        return c.json({ error: "Account is inactive" }, 403);
    }
    
    return c.json({
      message: "Login successful",
      role: "external_partner",
      partner: {
        id: partner.id,
        business_name: partner.business_name,
        logo_url: partner.logo_url
      }
    });
  } catch (e) {
    return c.json({ error: `Login failed: ${e}` }, 500);
  }
});

// ─── ADMIN ─────────────────────────────────────────────

app.get("/make-server-d9a6e93b/admin/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user-auth:");
    const filtered = users.filter((u: any) => u.role !== 'sa');
    return c.json(filtered);
  } catch (e) {
    return c.json({ error: `Failed to fetch users: ${e}` }, 500);
  }
});

app.get("/make-server-d9a6e93b/admin/sas", async (c) => {
  try {
    const sas = await kv.getByPrefix("sa-auth:");
    return c.json(sas);
  } catch (e) {
    return c.json({ error: `Failed to fetch SAs: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/admin/users/status", async (c) => {
  try {
    const { email, status } = await c.req.json();
    const key = `user-auth:${email.toLowerCase()}`;
    const user = await kv.get(key);
    if (!user) return c.json({ error: "User not found" }, 404);
    user.status = status;
    await kv.set(key, user);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to update user status: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/admin/sas/status", async (c) => {
  try {
    const { sa_id, status, banDuration, reason, title, message } = await c.req.json();
    const key = `sa-auth:${sa_id}`;
    const sa = await kv.get(key);
    if (!sa) return c.json({ error: "SA not found" }, 404);
    
    // Handle Warning
    if (status === 'warning') {
        const warning = {
            id: `warn-${Date.now()}`,
            title: title || "Warning",
            message: message || "You have received a warning.",
            date: new Date().toISOString(),
            read: false
        };
        sa.warnings = sa.warnings ? [warning, ...sa.warnings] : [warning];
        await kv.set(key, sa);
        return c.json({ ok: true, warning });
    }

    // Handle Status Change
    sa.status = status;
    
    if (status === 'banned') {
        sa.banReason = reason || "Violation of terms";
        sa.banDuration = banDuration || 7;
        sa.bannedAt = new Date().toISOString();
        // Reset appeal if new ban? Requirement says "can appeal once". 
        // Assuming once per ban instance. 
        sa.hasAppealed = false; 
        sa.appealMessage = null;
    } else if (status === 'suspended') {
        sa.suspendReason = reason || "Severe violation";
        sa.suspendedAt = new Date().toISOString();
        sa.hasAppealed = false;
        sa.appealMessage = null;
    } else if (status === 'active') {
        // Clear restrictions
        sa.banReason = null;
        sa.banDuration = null;
        sa.bannedAt = null;
        sa.suspendReason = null;
        sa.suspendedAt = null;
    }
    
    await kv.set(key, sa);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to update SA status: ${e}` }, 500);
  }
});

// SA Appeal
app.post("/make-server-d9a6e93b/sas/:saId/appeal", async (c) => {
  try {
    const saId = c.req.param("saId");
    const { message } = await c.req.json();
    const key = `sa-auth:${saId}`;
    const sa = await kv.get(key);
    
    if (!sa) return c.json({ error: "SA not found" }, 404);
    if (sa.status !== 'banned' && sa.status !== 'suspended') {
        return c.json({ error: "Account is not restricted" }, 400);
    }
    if (sa.hasAppealed) {
        return c.json({ error: "You have already appealed this decision." }, 400);
    }
    
    sa.hasAppealed = true;
    sa.appealMessage = message;
    sa.appealDate = new Date().toISOString();
    
    await kv.set(key, sa);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Appeal failed: ${e}` }, 500);
  }
});

// Delete Own Account (User/SA)
app.delete("/make-server-d9a6e93b/auth/delete", async (c) => {
  try {
    const { id, type } = await c.req.json(); // type: 'user' | 'sa'
    if (!id) return c.json({ error: "ID required" }, 400);
    
    let key, data;
    if (type === 'sa') {
        key = `sa-auth:${id}`;
        data = await kv.get(key);
    } else {
        // For regular users, ID might be passed, or we look up by email if needed
        // Assuming ID is passed correctly or we scan. 
        // But user auth keys are `user-auth:email`. 
        // If frontend passes email as ID for users, good.
        // Let's assume frontend passes the correct key suffix or we find it.
        // Actually, user context uses `user-timestamp` as ID, but key is email.
        // We need the email to delete.
        // Let's expect `email` in body for users.
        return c.json({ error: "Please provide email for user deletion" }, 400);
    }

    if (!data) return c.json({ error: "Account not found" }, 404);
    
    if (data.status === 'suspended') {
        return c.json({ error: "Suspended accounts cannot be deleted." }, 403);
    }
    
    await kv.del(key);
    
    // If SA, we might want to keep the email blocked? 
    // Requirement: "email and phone cannot be create account".
    // If we delete the record, they CAN create account again unless we add to a blacklist.
    // So we shouldn't DELETE, we should mark as `deleted`.
    
    data.status = 'deleted';
    data.deletedAt = new Date().toISOString();
    // Remove personal data but keep record to prevent reuse?
    // Or just rely on "deleted" status.
    await kv.set(key, data);
    
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Deletion failed: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/auth/delete-user", async (c) => {
    try {
        const { email } = await c.req.json();
        const key = `user-auth:${email.toLowerCase()}`;
        const user = await kv.get(key);
        
        if (!user) return c.json({ error: "User not found" }, 404);
        if (user.status === 'suspended') {
             return c.json({ error: "Suspended accounts cannot be deleted." }, 403);
        }
        
        // Soft delete to prevent email reuse? 
        // Or actually delete? Requirement: "email and phone cannot be create account" refers to Banned/Suspended.
        // "User and SA can delete account". 
        // If they delete, usually they want to disappear. 
        // But if banned/suspended, they CANNOT delete.
        
        // Let's just DELETE for normal users. 
        await kv.del(key);
        return c.json({ ok: true });
    } catch(e) {
        return c.json({ error: e.message }, 500);
    }
});

// ─── ADMIN: REFERENCE CODES ────────────────────────────

app.get("/make-server-d9a6e93b/admin/ref-codes", async (c) => {
  try {
    const codes = await kv.getByPrefix("ref-code:");
    return c.json(codes);
  } catch (e) {
    return c.json({ error: `Failed to fetch codes: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/admin/ref-codes", async (c) => {
  try {
    const { code } = await c.req.json(); // optional code
    const finalCode = code || Math.random().toString(36).substring(2, 10).toUpperCase();
    const refKey = `ref-code:${finalCode}`;
    
    // Check if exists
    const existing = await kv.get(refKey);
    if (existing) {
      return c.json({ error: "Code already exists" }, 400);
    }
    
    const data = {
      code: finalCode,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    await kv.set(refKey, data);
    return c.json(data, 201);
  } catch (e) {
    return c.json({ error: `Failed to create code: ${e}` }, 500);
  }
});

app.delete("/make-server-d9a6e93b/admin/ref-codes/:code", async (c) => {
  try {
    const code = c.req.param("code");
    await kv.del(`ref-code:${code}`);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete code: ${e}` }, 500);
  }
});

// ─── ADMIN: CONTENT MODERATION ─────────────────────────

app.delete("/make-server-d9a6e93b/admin/reviews/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`review:${id}`);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete review: ${e}` }, 500);
  }
});

app.delete("/make-server-d9a6e93b/admin/comments/:postId/:commentId", async (c) => {
  try {
    const { postId, commentId } = c.req.param();
    const post = await kv.get(`post:${postId}`);
    if (!post) return c.json({ error: "Post not found" }, 404);
    
    if (post.comments) {
      post.comments = post.comments.filter((cmt: any) => cmt.id !== commentId);
      await kv.set(`post:${postId}`, post);
    }
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete comment: ${e}` }, 500);
  }
});


// ─── ADMIN: RESET DATA ───────────────────────────────

app.post("/make-server-d9a6e93b/admin/reset-data", async (c) => {
  try {
    const targets = ["sa-001", "sa-002", "sa-003", "sa-004", "sa-005"];
    
    // Delete SA auth records
    for (const saId of targets) {
        await kv.del(`sa-auth:${saId}`);
    }
    
    // Also delete associated posts
    const allPosts = await kv.getByPrefix("post:");
    const postsToDelete = allPosts.filter((p: any) => targets.includes(p.sa_id));
    for (const p of postsToDelete) {
        await kv.del(`post:${p.id}`);
    }
    
    // And reviews
    const allReviews = await kv.getByPrefix("review:");
    const reviewsToDelete = allReviews.filter((r: any) => targets.includes(r.sa_id));
    for (const r of reviewsToDelete) {
        await kv.del(`review:${r.id}`);
    }

    return c.json({ ok: true, message: "Legacy SAs deleted" });
  } catch (e) {
    return c.json({ error: `Reset failed: ${e}` }, 500);
  }
});

// ─── PUBLIC SA LIST (With Ratings) ─────────────────────

app.get("/make-server-d9a6e93b/sas/public", async (c) => {
  try {
    const [sas, reviews] = await Promise.all([
      kv.getByPrefix("sa-auth:"),
      kv.getByPrefix("review:")
    ]);
    
    // Calculate ratings
    const saMap = sas
      .filter((sa: any) => sa.status !== 'banned' && sa.status !== 'suspended')
      .map((sa: any) => {
        const saReviews = reviews.filter((r: any) => r.sa_id === sa.sa_id);
        const reviewCount = saReviews.length;
      const totalRating = saReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
      const rating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;
      
      return {
        ...sa,
        password: undefined, // remove sensitive data
        rating,
        reviewCount,
        // Ensure fields exist for frontend compatibility
        region: sa.region || "",
        state: sa.region ? sa.region.split(", ").pop() : "",
        city: sa.region ? sa.region.split(", ")[0] : "",
        bio: sa.bio || "Perodua Sales Advisor",
        whatsapp: sa.phone || "",
        kpi: sa.kpi || { visits: 0, inquiries: 0, conversionRate: 0 },
        badge: sa.badge || "",
        googleMapUrl: sa.googleMapUrl || ""
      };
    });
    
    return c.json(saMap);
  } catch (e) {
    return c.json({ error: `Failed to fetch public SAs: ${e}` }, 500);
  }
});

// ─── POSTS MANAGEMENT ──────────────────────────────────

app.get("/make-server-d9a6e93b/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");
    // sort by createdAt desc
    posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json(posts);
  } catch (e) {
    return c.json({ error: `Failed to fetch posts: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/posts", async (c) => {
  try {
    const data = await c.req.json();
    const id = `post-${Date.now()}`;
    const newPost = {
      ...data,
      id,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    await kv.set(`post:${id}`, newPost);
    return c.json(newPost);
  } catch (e) {
    return c.json({ error: `Failed to create post: ${e}` }, 500);
  }
});

app.put("/make-server-d9a6e93b/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const post = await kv.get(`post:${id}`);
    if (!post) return c.json({ error: "Post not found" }, 404);
    
    const updated = { ...post, ...updates };
    await kv.set(`post:${id}`, updated);
    return c.json(updated);
  } catch (e) {
    return c.json({ error: `Failed to update post: ${e}` }, 500);
  }
});

app.delete("/make-server-d9a6e93b/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`post:${id}`);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete post: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/posts/:id/like", async (c) => {
  try {
    const id = c.req.param("id");
    const { userId } = await c.req.json();
    const post = await kv.get(`post:${id}`);
    if (!post) return c.json({ error: "Post not found" }, 404);
    
    const likes = post.likes || [];
    const idx = likes.indexOf(userId);
    if (idx === -1) likes.push(userId);
    else likes.splice(idx, 1);
    
    post.likes = likes;
    await kv.set(`post:${id}`, post);
    return c.json({ likes });
  } catch (e) {
    return c.json({ error: `Failed to toggle like: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/posts/:id/comment", async (c) => {
  try {
    const id = c.req.param("id");
    const { userName, text } = await c.req.json();
    const post = await kv.get(`post:${id}`);
    if (!post) return c.json({ error: "Post not found" }, 404);
    
    const comment = {
      id: `cmt-${Date.now()}`,
      userName,
      text,
      createdAt: new Date().toISOString(),
    };
    
    post.comments = [...(post.comments || []), comment];
    await kv.set(`post:${id}`, post);
    return c.json(comment);
  } catch (e) {
    return c.json({ error: `Failed to add comment: ${e}` }, 500);
  }
});

app.get("/make-server-d9a6e93b/reviews", async (c) => {
    try {
        const reviews = await kv.getByPrefix("review:");
        // sort by date desc
        reviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return c.json(reviews);
    } catch(e) {
        return c.json({ error: e }, 500);
    }
});

app.post("/make-server-d9a6e93b/reviews", async (c) => {
    try {
        const data = await c.req.json();
        const id = `rev-${Date.now()}`;
        const newReview = { ...data, id, createdAt: new Date().toISOString() };
        await kv.set(`review:${id}`, newReview);
        return c.json(newReview);
    } catch(e) {
        return c.json({ error: e }, 500);
    }
});

app.get("/make-server-d9a6e93b/transactions/sa/:saId", async (c) => {
    try {
        const saId = c.req.param("saId");
        const txns = await kv.getByPrefix("txn:");
        const filtered = txns.filter((t: any) => t.sa_id === saId);
        // sort by date desc
        filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return c.json(filtered);
    } catch(e) {
        return c.json({ error: e }, 500);
    }
});

app.post("/make-server-d9a6e93b/transactions", async (c) => {
    try {
        const data = await c.req.json();
        const id = `txn-${Date.now()}`;
        const newTxn = { ...data, id, createdAt: new Date().toISOString() };
        await kv.set(`txn:${id}`, newTxn);
        return c.json(newTxn);
    } catch(e) {
        return c.json({ error: e }, 500);
    }
});

app.post("/make-server-d9a6e93b/upload", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body["file"];
        if (!file || !(file instanceof File)) {
             return c.json({ error: "No file uploaded" }, 400);
        }
        
        await ensureBucket();
        const sb = supabase();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
        
        // Upload
        const { data, error } = await sb.storage
            .from(BUCKET)
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            });
            
        if (error) throw error;
        
        const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(fileName);
        return c.json({ url: publicUrl });
    } catch(e: any) {
        return c.json({ error: `Upload failed: ${e.message}` }, 500);
    }
});

// ─── CARS MANAGEMENT ───────────────────────────────────

const INITIAL_CARS = [
  {
    id: "myvi",
    name: "Myvi",
    tagline: "The King of the Road",
    priceRange: "RM 46,800 - RM 58,800",
    startingPrice: 46800,
    image: "https://images.unsplash.com/photo-1746393673612-2bf0e811ce79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzZWRhbiUyMGNhciUyMG1vZGVybiUyMHNob3dyb29tfGVufDF8fHx8MTc3MTUyMjM5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "myvi-g", name: "1.3G MT", price: 46800 },
      { id: "myvi-x", name: "1.3X AT", price: 49800 },
      { id: "myvi-h", name: "1.5H AT", price: 53800 },
      { id: "myvi-av", name: "1.5 AV AT", price: 58800 },
    ],
    colors: [
      { id: "c1", name: "Cranberry Red", hex: "#8B1A1A" },
      { id: "c2", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c3", name: "Ivory White", hex: "#FFFFF0" },
      { id: "c4", name: "Granite Grey", hex: "#676767" },
      { id: "c5", name: "Lava Red", hex: "#CF1020" },
    ],
    accessories: [
      { id: "a1", name: "Body Kit", price: 1500 },
      { id: "a2", name: "Tinted Windows", price: 800 },
      { id: "a3", name: "Dash Cam", price: 450 },
      { id: "a4", name: "Floor Mat Set", price: 250 },
    ],
  },
  {
    id: "axia",
    name: "Axia",
    tagline: "Smart Entry Level Choice",
    priceRange: "RM 22,000 - RM 38,600",
    startingPrice: 22000,
    image: "https://images.unsplash.com/photo-1767949374162-5cbb31071b8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrJTIwY2FyJTIwd2hpdGV8ZW58MXx8fHwxNzcxNTIyMzk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "axia-e", name: "1.0E MT", price: 22000 },
      { id: "axia-g", name: "1.0G AT", price: 31400 },
      { id: "axia-se", name: "1.0 SE AT", price: 35000 },
      { id: "axia-av", name: "1.0 AV AT", price: 38600 },
    ],
    colors: [
      { id: "c1", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c2", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c3", name: "Midnight Blue", hex: "#003366" },
      { id: "c4", name: "Passion Red", hex: "#FF0000" },
    ],
    accessories: [
      { id: "a1", name: "Spoiler", price: 600 },
      { id: "a2", name: "Door Visor", price: 200 },
      { id: "a3", name: "Seat Cover", price: 350 },
    ],
  },
  {
    id: "bezza",
    name: "Bezza",
    tagline: "Sedan Comfort Redefined",
    priceRange: "RM 34,580 - RM 49,980",
    startingPrice: 34580,
    image: "https://images.unsplash.com/photo-1763888709588-87beb443e10f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWx2ZXIlMjBzZWRhbiUyMGNhciUyMGNpdHklMjBkcml2aW5nfGVufDF8fHx8MTc3MTUyMjQwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "bezza-g", name: "1.0G MT", price: 34580 },
      { id: "bezza-x", name: "1.0X AT", price: 40580 },
      { id: "bezza-av", name: "1.3 AV AT", price: 49980 },
    ],
    colors: [
      { id: "c1", name: "Crystal White", hex: "#F8F8FF" },
      { id: "c2", name: "Jet Black", hex: "#0A0A0A" },
      { id: "c3", name: "Ocean Blue", hex: "#4682B4" },
      { id: "c4", name: "Rose Gold", hex: "#B76E79" },
    ],
    accessories: [
      { id: "a1", name: "Chrome Garnish", price: 400 },
      { id: "a2", name: "Leather Wrap Steering", price: 550 },
      { id: "a3", name: "Trunk Tray", price: 180 },
    ],
  },
  {
    id: "alza",
    name: "Alza",
    tagline: "Space for Everyone",
    priceRange: "RM 62,500 - RM 75,500",
    startingPrice: 62500,
    image: "https://images.unsplash.com/photo-1744424846144-d57267a19ee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBNUFYlMjBjYXIlMjBzZXZlbiUyMHNlYXRlcnxlbnwxfHx8fDE3NzE1MjI0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "alza-x", name: "1.5X AT", price: 62500 },
      { id: "alza-h", name: "1.5H AT", price: 68000 },
      { id: "alza-av", name: "1.5 AV AT", price: 75500 },
    ],
    colors: [
      { id: "c1", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c2", name: "Ivory White", hex: "#FFFFF0" },
      { id: "c3", name: "Granite Grey", hex: "#676767" },
    ],
    accessories: [
      { id: "a1", name: "Roof Rack", price: 900 },
      { id: "a2", name: "Sun Shade", price: 250 },
      { id: "a3", name: "Cargo Net", price: 150 },
    ],
  },
  {
    id: "ativa",
    name: "Ativa",
    tagline: "Born to Stand Out",
    priceRange: "RM 62,500 - RM 73,400",
    startingPrice: 62500,
    image: "https://images.unsplash.com/photo-1767949374180-e5895daa1990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwU1VWJTIwY3Jvc3NvdmVyJTIwbW9kZXJufGVufDF8fHx8MTc3MTUyMjQwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "ativa-x", name: "1.0T X", price: 62500 },
      { id: "ativa-h", name: "1.0T H", price: 67500 },
      { id: "ativa-av", name: "1.0T AV", price: 73400 },
    ],
    colors: [
      { id: "c1", name: "Passion Red", hex: "#FF0000" },
      { id: "c2", name: "Ocean Blue", hex: "#4682B4" },
      { id: "c3", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c4", name: "Jet Black", hex: "#0A0A0A" },
    ],
    accessories: [
      { id: "a1", name: "Side Step Bar", price: 1200 },
      { id: "a2", name: "Cargo Tray", price: 200 },
      { id: "a3", name: "Door Edge Guard", price: 150 },
    ],
  },
  {
    id: "aruz",
    name: "Aruz",
    tagline: "Adventure Awaits",
    priceRange: "RM 68,000 - RM 77,900",
    startingPrice: 68000,
    image: "https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwU1VWJTIwcHJlbWl1bSUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzcxNTIyNDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "aruz-x", name: "1.5X AT", price: 68000 },
      { id: "aruz-av", name: "1.5 AV AT", price: 77900 },
    ],
    colors: [
      { id: "c1", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c2", name: "Granite Grey", hex: "#676767" },
      { id: "c3", name: "Pearl White", hex: "#F5F5F0" },
    ],
    accessories: [
      { id: "a1", name: "Bull Bar", price: 1800 },
      { id: "a2", name: "Roof Box", price: 2500 },
      { id: "a3", name: "LED Light Bar", price: 800 },
    ],
  },
  {
    id: "alza-hybrid",
    name: "Alza Hybrid",
    tagline: "Future Forward Drive",
    priceRange: "RM 78,000 - RM 85,000",
    startingPrice: 78000,
    image: "https://images.unsplash.com/photo-1665519448191-f73fc16d5a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWJyaWQlMjBjYXIlMjBlY28lMjBncmVlbiUyMG1vZGVybnxlbnwxfHx8fDE3NzE1MjI0MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "alzah-h", name: "Hybrid H", price: 78000 },
      { id: "alzah-av", name: "Hybrid AV", price: 85000 },
    ],
    colors: [
      { id: "c1", name: "Eco Green", hex: "#2E8B57" },
      { id: "c2", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c3", name: "Titanium Grey", hex: "#808080" },
    ],
    accessories: [
      { id: "a1", name: "EV Charger Home Kit", price: 3000 },
      { id: "a2", name: "Solar Film Premium", price: 1200 },
      { id: "a3", name: "Premium Floor Mat", price: 350 },
    ],
  },
];

app.get("/make-server-d9a6e93b/cars", async (c) => {
  try {
    const cars = await kv.get("cars_data");
    if (!cars) {
        await kv.set("cars_data", INITIAL_CARS);
        return c.json(INITIAL_CARS);
    }
    return c.json(cars);
  } catch (e) {
    return c.json({ error: `Failed to fetch cars: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/cars", async (c) => {
  try {
    const cars = await c.req.json();
    await kv.set("cars_data", cars);
    return c.json(cars);
  } catch (e) {
    return c.json({ error: `Failed to update cars: ${e}` }, 500);
  }
});

// ─── SEED DATA ──────────────────────��──────────────────
app.post("/make-server-d9a6e93b/seed", async (c) => {
  try {
    // Check if already seeded
    const existing = await kv.get("seeded_v4");
    if (existing) return c.json({ message: "Already seeded" });
    
    // Seed cars if needed (though the getter does it too)
    await kv.set("cars_data", INITIAL_CARS);

    const now = new Date();
    const posts = [
      {
        id: "post-1",
        sa_id: "sa-001",
        sa_name: "Ahmad Razak",
        sa_avatar:
          "https://images.unsplash.com/photo-1614468500745-9bc401dbf0ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "CNY 2026 Special Offer!",
        content:
          "Enjoy up to RM3,000 rebate on all Myvi variants this Chinese New Year! Limited time offer until March 2026. DM me for details!",
        image_url: "",
        type: "promotion",
        likes: ["user-4", "user-5", "user-7"],
        comments: [
          {
            id: "cmt-1",
            userName: "Sarah L.",
            text: "Great deal! Just messaged you on WhatsApp 🙌",
            createdAt: new Date(now.getTime() - 3600000).toISOString(),
          },
          {
            id: "cmt-2",
            userName: "David W.",
            text: "Is this applicable for the AV variant too?",
            createdAt: new Date(now.getTime() - 1800000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
      },
      {
        id: "post-2",
        sa_id: "sa-002",
        sa_name: "Nurul Aisyah",
        sa_avatar:
          "https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "New Ativa Hybrid — Register Interest!",
        content:
          "The all-new Ativa Hybrid is coming soon to Malaysia! Be the first to know when it launches. Register your interest with me today.",
        image_url: "",
        type: "announcement",
        likes: ["user-1", "user-2"],
        comments: [
          {
            id: "cmt-3",
            userName: "Ahmad R.",
            text: "Can't wait! When is the expected launch date?",
            createdAt: new Date(now.getTime() - 7200000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
      },
      {
        id: "post-3",
        sa_id: "sa-001",
        sa_name: "Ahmad Razak",
        sa_avatar:
          "https://images.unsplash.com/photo-1614468500745-9bc401dbf0ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "Free Tinted Film Package",
        content:
          "Every purchase this month comes with a FREE premium tinted film package worth RM800. Don't miss out! 🚗✨",
        image_url: "",
        type: "promotion",
        likes: ["user-3", "user-6", "user-8", "user-1"],
        comments: [],
        createdAt: new Date(now.getTime() - 259200000).toISOString(),
      },
      {
        id: "post-4",
        sa_id: "sa-003",
        sa_name: "Kevin Tan",
        sa_avatar:
          "https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "Car Maintenance Tips for Perodua Owners",
        content:
          "Keep your Perodua running smooth:\n1) Change oil every 10,000km\n2) Check tire pressure monthly\n3) Service on schedule\n\nContact me for service bookings in JB area!",
        image_url: "",
        type: "tip",
        likes: ["user-2"],
        comments: [
          {
            id: "cmt-4",
            userName: "Mei Ling C.",
            text: "Thanks Kevin! Very helpful tips 👍",
            createdAt: new Date(now.getTime() - 3600000 * 5).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 345600000).toISOString(),
      },
      {
        id: "post-5",
        sa_id: "sa-005",
        sa_name: "Jessica Wong",
        sa_avatar:
          "https://images.unsplash.com/photo-1532964821867-98851c797461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "Visit Our Renovated KK Showroom!",
        content:
          "We've just renovated our Kota Kinabalu showroom! Come visit for a test drive and exclusive walk-in deals. Open 7 days a week. 🏢",
        image_url: "",
        type: "announcement",
        likes: ["user-7", "user-8"],
        comments: [],
        createdAt: new Date(now.getTime() - 432000000).toISOString(),
      },
      {
        id: "post-6",
        sa_id: "sa-004",
        sa_name: "Siti Fatimah",
        sa_avatar:
          "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        title: "Bezza 2026 — Best Value Sedan",
        content:
          "Looking for a reliable sedan under RM50k? The Perodua Bezza is your best bet! Come test drive at our Kuantan branch. I'll personally guide you through all the variants.",
        image_url: "",
        type: "general",
        likes: [],
        comments: [],
        createdAt: new Date(now.getTime() - 518400000).toISOString(),
      },
    ];

    const reviews = [
      {
        id: "rev-1",
        sa_id: "sa-001",
        userName: "Sarah L.",
        rating: 5,
        comment:
          "Ahmad was incredibly helpful! He walked me through every option and got me the best deal on my Myvi.",
        createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      },
      {
        id: "rev-2",
        sa_id: "sa-001",
        userName: "John K.",
        rating: 5,
        comment: "Very patient and knowledgeable. Smooth process.",
        createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      },
      {
        id: "rev-3",
        sa_id: "sa-001",
        userName: "Lisa T.",
        rating: 4,
        comment: "Good service overall. Responded quickly on WhatsApp.",
        createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      },
      {
        id: "rev-4",
        sa_id: "sa-002",
        userName: "Ahmad R.",
        rating: 5,
        comment: "Nurul is the best! Super friendly and professional.",
        createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      },
      {
        id: "rev-5",
        sa_id: "sa-003",
        userName: "Mei Ling C.",
        rating: 5,
        comment: "Kevin went above and beyond. Thanks Kevin!",
        createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      },
      {
        id: "rev-6",
        sa_id: "sa-005",
        userName: "Jason T.",
        rating: 5,
        comment: "Jessica is amazing! Fluent in 3 languages.",
        createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      },
    ];

    const transactions = [
      {
        id: "txn-1",
        sa_id: "sa-001",
        userName: "Sarah L.",
        modelName: "Myvi",
        variantName: "1.5 AV AT",
        colorName: "Cranberry Red",
        totalPrice: 60750,
        status: "completed",
        createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      },
      {
        id: "txn-2",
        sa_id: "sa-001",
        userName: "John K.",
        modelName: "Ativa",
        variantName: "1.0T H",
        colorName: "Ocean Blue",
        totalPrice: 68700,
        status: "sent",
        createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      },
      {
        id: "txn-3",
        sa_id: "sa-002",
        userName: "Ahmad R.",
        modelName: "Axia",
        variantName: "1.0 AV AT",
        colorName: "Glittering Silver",
        totalPrice: 44190,
        status: "completed",
        createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      },
      {
        id: "txn-4",
        sa_id: "sa-003",
        userName: "Mei Ling C.",
        modelName: "Bezza",
        variantName: "1.3 AV AT",
        colorName: "Granite Grey",
        totalPrice: 49980,
        status: "completed",
        createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      },
    ];

    // Save all
    const keys: string[] = [];
    const values: any[] = [];
    for (const p of posts) {
      keys.push(`post:${p.id}`);
      values.push(p);
    }
    for (const r of reviews) {
      keys.push(`review:${r.id}`);
      values.push(r);
    }
    for (const t of transactions) {
      keys.push(`txn:${t.id}`);
      values.push(t);
    }
    await kv.mset(keys, values);
    await kv.set("seeded_v4", true);

    // Seed SA auth records with default passwords
    const saDefaults = [
      { sa_id: "sa-001", name: "Ahmad Razak", password: "osl123456", region: "Kuala Lumpur, WP Kuala Lumpur", branch: "Perodua KL", avatar: "https://images.unsplash.com/photo-1614468500745-9bc401dbf0ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", googleMapUrl: "" },
      { sa_id: "sa-002", name: "Nurul Aisyah", password: "osl123456", region: "Timur Laut, Penang", branch: "Perodua Penang", avatar: "https://images.unsplash.com/photo-1736939678218-bd648b5ef3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", googleMapUrl: "" },
      { sa_id: "sa-003", name: "Kevin Tan", password: "osl123456", region: "Johor Bahru, Johor", branch: "Perodua JB", avatar: "https://images.unsplash.com/photo-1742569184536-77ff9ae46c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", googleMapUrl: "" },
      { sa_id: "sa-004", name: "Siti Fatimah", password: "osl123456", region: "Kuantan, Pahang", branch: "Perodua Kuantan", avatar: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", googleMapUrl: "" },
      { sa_id: "sa-005", name: "Jessica Wong", password: "osl123456", region: "Petaling, Selangor", branch: "Perodua Subang", avatar: "https://images.unsplash.com/photo-1532964821867-98851c797461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", googleMapUrl: "" },
    ];
    const saKeys = saDefaults.map((sa) => `sa-auth:${sa.sa_id}`);
    const saValues = saDefaults.map((sa) => ({
      sa_id: sa.sa_id,
      name: sa.name,
      password: sa.password,
      status: "active",
      avatar: sa.avatar,
      region: sa.region,
      branch: sa.branch,
      phone: "+60123456789",
      googleMapUrl: sa.googleMapUrl,
    }));
    await kv.mset(saKeys, saValues);

    return c.json({ message: "Seeded", counts: { posts: posts.length, reviews: reviews.length, transactions: transactions.length } });
  } catch (e) {
    console.log(`Seed error: ${e}`);
    return c.json({ error: `Seed error: ${e}` }, 500);
  }
});

// ─── POSTS ─────────────────────────────────────────────

// Get all posts (feed)
app.get("/make-server-d9a6e93b/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");
    posts.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json(posts);
  } catch (e) {
    console.log(`Get posts error: ${e}`);
    return c.json({ error: `Get posts error: ${e}` }, 500);
  }
});

// Get posts by SA
app.get("/make-server-d9a6e93b/posts/sa/:saId", async (c) => {
  try {
    const saId = c.req.param("saId");
    const posts = await kv.getByPrefix("post:");
    const filtered = posts
      .filter((p: any) => p.sa_id === saId)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return c.json(filtered);
  } catch (e) {
    console.log(`Get SA posts error: ${e}`);
    return c.json({ error: `Get SA posts error: ${e}` }, 500);
  }
});

// Create post
app.post("/make-server-d9a6e93b/posts", async (c) => {
  try {
    const body = await c.req.json();
    const id = `post-${Date.now()}`;
    const post = {
      id,
      sa_id: body.sa_id,
      sa_name: body.sa_name,
      sa_avatar: body.sa_avatar,
      title: body.title || "",
      content: body.content || "",
      image_url: body.image_url || "",
      type: body.type || "general",
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    await kv.set(`post:${id}`, post);
    return c.json(post, 201);
  } catch (e) {
    console.log(`Create post error: ${e}`);
    return c.json({ error: `Create post error: ${e}` }, 500);
  }
});

// Delete post
app.delete("/make-server-d9a6e93b/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`post:${id}`);
    return c.json({ ok: true });
  } catch (e) {
    console.log(`Delete post error: ${e}`);
    return c.json({ error: `Delete post error: ${e}` }, 500);
  }
});

// Like / unlike post
app.post("/make-server-d9a6e93b/posts/:id/like", async (c) => {
  try {
    const id = c.req.param("id");
    const { userId } = await c.req.json();
    const post = await kv.get(`post:${id}`);
    if (!post) return c.json({ error: "Post not found" }, 404);

    const likes: string[] = post.likes || [];
    const idx = likes.indexOf(userId);
    if (idx === -1) {
      likes.push(userId);
    } else {
      likes.splice(idx, 1);
    }
    post.likes = likes;
    await kv.set(`post:${id}`, post);
    return c.json({ likes: post.likes });
  } catch (e) {
    console.log(`Like post error: ${e}`);
    return c.json({ error: `Like post error: ${e}` }, 500);
  }
});

// Add comment to post
app.post("/make-server-d9a6e93b/posts/:id/comment", async (c) => {
  try {
    const id = c.req.param("id");
    const { userName, text, userEmail, tier } = await c.req.json();
    const post = await kv.get(`post:${id}`);
    if (!post) return c.json({ error: "Post not found" }, 404);

    const comment = {
      id: `cmt-${Date.now()}`,
      userName,
      userEmail, // Store email for linking
      tier,      // Store tier snapshot
      text,
      createdAt: new Date().toISOString(),
    };
    post.comments = post.comments || [];
    post.comments.push(comment);
    await kv.set(`post:${id}`, post);
    return c.json(comment, 201);
  } catch (e) {
    console.log(`Comment error: ${e}`);
    return c.json({ error: `Comment error: ${e}` }, 500);
  }
});

// ─── REVIEWS ───────────────────────────────────────────

app.get("/make-server-d9a6e93b/reviews/sa/:saId", async (c) => {
  try {
    const saId = c.req.param("saId");
    const reviews = await kv.getByPrefix("review:");
    const filtered = reviews
      .filter((r: any) => r.sa_id === saId)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return c.json(filtered);
  } catch (e) {
    console.log(`Get reviews error: ${e}`);
    return c.json({ error: `Get reviews error: ${e}` }, 500);
  }
});

app.get("/make-server-d9a6e93b/reviews", async (c) => {
  try {
    const reviews = await kv.getByPrefix("review:");
    reviews.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return c.json(reviews);
  } catch (e) {
    console.log(`Get all reviews error: ${e}`);
    return c.json({ error: `Get all reviews error: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const id = `rev-${Date.now()}`;
    const review = {
      id,
      sa_id: body.sa_id,
      userName: body.userName,
      rating: body.rating,
      comment: body.comment,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`review:${id}`, review);
    return c.json(review, 201);
  } catch (e) {
    console.log(`Create review error: ${e}`);
    return c.json({ error: `Create review error: ${e}` }, 500);
  }
});

// ─── TRANSACTIONS ──────────────────────────────────────

app.get("/make-server-d9a6e93b/transactions/sa/:saId", async (c) => {
  try {
    const saId = c.req.param("saId");
    const txns = await kv.getByPrefix("txn:");
    const filtered = txns
      .filter((t: any) => t.sa_id === saId)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return c.json(filtered);
  } catch (e) {
    console.log(`Get transactions error: ${e}`);
    return c.json({ error: `Get transactions error: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/transactions", async (c) => {
  try {
    const body = await c.req.json();
    const id = `txn-${Date.now()}`;
    const txn = {
      id,
      sa_id: body.sa_id,
      userName: body.userName,
      modelName: body.modelName,
      variantName: body.variantName,
      colorName: body.colorName,
      totalPrice: body.totalPrice,
      status: body.status || "sent",
      createdAt: new Date().toISOString(),
    };
    await kv.set(`txn:${id}`, txn);
    return c.json(txn, 201);
  } catch (e) {
    console.log(`Create transaction error: ${e}`);
    return c.json({ error: `Create transaction error: ${e}` }, 500);
  }
});

// ─── IMAGE UPLOAD ──────────────────────────────────────

app.post("/make-server-d9a6e93b/upload", async (c) => {
  try {
    await ensureBucket();
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return c.json({ error: "No file provided" }, 400);

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const sb = supabase();

    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) {
      console.log(`Upload error: ${uploadError.message}`);
      return c.json({ error: `Upload error: ${uploadError.message}` }, 500);
    }

    // CHANGED: Get Public URL instead of Signed URL
    const { data: publicData } = sb.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return c.json({ url: publicData.publicUrl, fileName });
  } catch (e) {
    console.log(`Upload handler error: ${e}`);
    return c.json({ error: `Upload handler error: ${e}` }, 500);
  }
});

// ─── NOTIFICATIONS ─────────────────────────────────────

app.get("/make-server-d9a6e93b/notifications/:email", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const key = `notifications:${email.toLowerCase()}`;
    const notifications = await kv.get(key) || [];
    notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json(notifications);
  } catch (e) {
    return c.json({ error: `Failed to fetch notifications: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/notifications", async (c) => {
  try {
    const { email, message, type, link } = await c.req.json();
    const key = `notifications:${email.toLowerCase()}`;
    const notifications = await kv.get(key) || [];
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      email,
      message,
      type: type || "info",
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    if (notifications.length > 50) notifications.pop();
    
    await kv.set(key, notifications);
    return c.json(newNotification);
  } catch (e) {
    return c.json({ error: `Failed to create notification: ${e}` }, 500);
  }
});

app.delete("/make-server-d9a6e93b/notifications/:email/:id", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const id = c.req.param("id");
    const key = `notifications:${email.toLowerCase()}`;
    const notifications = await kv.get(key) || [];
    const updated = notifications.filter((n: any) => n.id !== id);
    await kv.set(key, updated);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete notification: ${e}` }, 500);
  }
});

app.put("/make-server-d9a6e93b/notifications/:email/:id/read", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email"));
    const id = c.req.param("id");
    const key = `notifications:${email.toLowerCase()}`;
    const notifications = await kv.get(key) || [];
    const updated = notifications.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
    await kv.set(key, updated);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to mark read: ${e}` }, 500);
  }
});

// ─── LEADS ─────────────────────────────────────────────

app.post("/make-server-d9a6e93b/leads", async (c) => {
  try {
    const { name, phone, region, model, timeline, payment } = await c.req.json();
    if (!name || !phone || !region || !model || !timeline || !payment) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    // Calculate Score
    let score = 0;
    if (timeline === "1 month") score += 50;
    else if (timeline === "3 months") score += 30; // Implicit warm score
    
    if (payment === "Loan") score += 20;
    if (model) score += 10;
    
    let status = "COLD";
    if (score > 60) status = "HOT";
    else if (score >= 30) status = "WARM";
    
    const id = `lead-${Date.now()}`;
    const lead = {
      id,
      name,
      phone,
      region,
      model,
      timeline,
      payment,
      score,
      status,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`lead:${id}`, lead);
    return c.json(lead, 201);
  } catch (e) {
    return c.json({ error: `Failed to create lead: ${e}` }, 500);
  }
});

app.get("/make-server-d9a6e93b/leads", async (c) => {
  try {
    const leads = await kv.getByPrefix("lead:");
    leads.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json(leads);
  } catch (e) {
    return c.json({ error: `Failed to fetch leads: ${e}` }, 500);
  }
});

// ─── PARTNERS ──────────────────────────────────────────

app.get("/make-server-d9a6e93b/partners", async (c) => {
  try {
    const partners = await kv.getByPrefix("partner:");
    return c.json(partners);
  } catch (e) {
    return c.json({ error: `Failed to fetch partners: ${e}` }, 500);
  }
});

app.get("/make-server-d9a6e93b/partners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const partner = await kv.get(`partner:${id}`);
    if (!partner) return c.json({ error: "Partner not found" }, 404);
    return c.json(partner);
  } catch (e) {
    return c.json({ error: `Failed to fetch partner: ${e}` }, 500);
  }
});

app.post("/make-server-d9a6e93b/partners", async (c) => {
  try {
    const data = await c.req.json();
    const id = `partner-${Date.now()}`;
    const newPartner = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    await kv.set(`partner:${id}`, newPartner);
    return c.json(newPartner);
  } catch (e) {
    return c.json({ error: `Failed to create partner: ${e}` }, 500);
  }
});

app.put("/make-server-d9a6e93b/partners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const partner = await kv.get(`partner:${id}`);
    if (!partner) return c.json({ error: "Partner not found" }, 404);
    
    const updated = { ...partner, ...updates };
    await kv.set(`partner:${id}`, updated);
    return c.json(updated);
  } catch (e) {
    return c.json({ error: `Failed to update partner: ${e}` }, 500);
  }
});

app.delete("/make-server-d9a6e93b/partners/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`partner:${id}`);
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: `Failed to delete partner: ${e}` }, 500);
  }
});

// ─── LOYALTY SYSTEM (Points, Vouchers, Proofs) ────────

// Get User Vouchers
app.get("/make-server-d9a6e93b/users/:email/vouchers", async (c) => {
  try {
    const email = c.req.param("email").toLowerCase();
    const allVouchers = await kv.getByPrefix("voucher:");
    const userVouchers = allVouchers.filter((v: any) => v.user_email === email);
    return c.json(userVouchers);
  } catch (e) {
    return c.json({ error: `Failed to fetch vouchers: ${e}` }, 500);
  }
});

// Update Voucher Status
app.put("/make-server-d9a6e93b/vouchers/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const key = `voucher:${id}`;
    
    // Add retry logic for database operations
    const voucher = await retry(async () => await kv.get(key));
    
    if (!voucher) return c.json({ error: "Voucher not found" }, 404);
    
    voucher.status = status;
    if (status === 'used') {
        voucher.used_at = new Date().toISOString();
    }
    
    // Add retry logic for database operations
    await retry(async () => await kv.set(key, voucher));
    return c.json(voucher);
  } catch (e) {
    return c.json({ error: `Update failed: ${e}` }, 500);
  }
});

// Register Transaction (Sale) -> Awards Points & Vouchers
app.post("/make-server-d9a6e93b/transactions/register", async (c) => {
  try {
    const { sa_id, user_email, car_model, price, purchase_date } = await c.req.json();
    const email = user_email.toLowerCase();
    
    // 1. Create Transaction Record
    const txId = `txn-${Date.now()}`;
    const transaction = {
        id: txId,
        sa_id,
        user_email: email,
        car_model,
        price,
        purchase_date,
        status: 'completed',
        created_at: new Date().toISOString()
    };
    await kv.set(`txn:${txId}`, transaction);
    
    // 2. Update User Points
    const userKey = `user-auth:${email}`;
    const user = await kv.get(userKey);
    const pointsAwarded = Math.floor(price);
    
    if (user) {
        // User exists, add points
        user.points = (user.points || 0) + pointsAwarded;
        await kv.set(userKey, user);
    } else {
        // User does not exist, store in pending
        const pendingKey = `pending-points:${email}`;
        const existingPending = await kv.get(pendingKey);
        const newPoints = (existingPending?.points || 0) + pointsAwarded;
        
        await kv.set(pendingKey, {
            email: email,
            points: newPoints,
            lastUpdated: new Date().toISOString()
        });
    }
    
    // 3. Issue Voucher (Based on Partners & Supported Models per Product)
    // Fetch all partners
    const partners = await kv.getByPrefix("partner:");
    const activePartners = partners.filter((p: any) => p.is_active);

    const issuedVouchers = [];
    const KNOWN_MODELS = ["Axia", "Bezza", "Myvi", "Ativa", "Alza", "Aruz", "TRAZ"];

    for (const partner of activePartners) {
        // Iterate through partner products
        const products = partner.products || [];
        
        if (products.length > 0) {
            for (const product of products) {
                // Determine supported models with heuristic for legacy/incomplete data
                let supportedModels = product.supported_models;
                
                if (!supportedModels || supportedModels.length === 0) {
                    // If not explicitly set, try to infer from title
                    const titleLower = (product.title || "").toLowerCase();
                    const inferredModels = KNOWN_MODELS.filter(m => titleLower.includes(m.toLowerCase()));
                    
                    if (inferredModels.length > 0) {
                        supportedModels = inferredModels;
                    } else {
                        supportedModels = ["All"];
                    }
                }

                // Check if product supports the car model
                const isSupported = supportedModels.includes("All") || supportedModels.some((m: string) => m.toLowerCase() === car_model.toLowerCase());
                
                if (isSupported) {
                    const voucherId = `v-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    const voucher = {
                        id: voucherId,
                        user_email: email,
                        title: product.title || `${partner.business_name} Privilege`,
                        description: product.description || partner.short_description || `Exclusive benefits at ${partner.business_name}`,
                        status: 'active',
                        type: 'partner-voucher',
                        valid_models: supportedModels,
                        image_url: product.image_url || partner.logo_url,
                        partner_id: partner.id,
                        product_id: product.id,
                        created_at: new Date().toISOString(),
                        expiry_date: product.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                    };
                    await kv.set(`voucher:${voucherId}`, voucher);
                    issuedVouchers.push(voucher);
                }
            }
        }
    }
    
    // 4. Create Notification for User
    const notifKey = `notifications:${email}`;
    const notifications = await kv.get(notifKey) || [];
    const newNotification = {
      id: `notif-${Date.now()}`,
      email,
      message: `Congratulations on your new ${car_model}! You have earned ${pointsAwarded} points and ${issuedVouchers.length} new privileges.`,
      type: "success",
      link: "/profile",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotification);
    if (notifications.length > 50) notifications.pop();
    await kv.set(notifKey, notifications);

    // 5. Create Notification for SA
    // We need to find SA email first
    const allSAs = await kv.getByPrefix("sa:");
    const sa = allSAs.find((s: any) => s.sa_id === sa_id);
    if (sa && sa.email) {
         const saNotifKey = `notifications:${sa.email.toLowerCase()}`;
         const saNotifs = await kv.get(saNotifKey) || [];
         const saNotification = {
            id: `notif-sa-${Date.now()}`,
            email: sa.email,
            message: `Sale registered successfully! ${car_model} for ${user_email}. Points awarded: ${pointsAwarded}.`,
            type: "success",
            isRead: false,
            createdAt: new Date().toISOString()
         };
         saNotifs.unshift(saNotification);
         if (saNotifs.length > 50) saNotifs.pop();
         await kv.set(saNotifKey, saNotifs);
    }
    
    return c.json({ ok: true, transaction, points_added: pointsAwarded, vouchers_issued: issuedVouchers.length });
  } catch (e) {
    return c.json({ error: `Transaction failed: ${e}` }, 500);
  }
});

// Admin: Get All Transactions
app.get("/make-server-d9a6e93b/transactions", async (c) => {
    try {
        const txs = await kv.getByPrefix("txn:");
        return c.json(txs);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Admin: Delete Transaction
app.delete("/make-server-d9a6e93b/transactions/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const txnKey = `txn:${id}`;
        const txn = await kv.get(txnKey);
        
        if (!txn) return c.json({ error: "Transaction not found" }, 404);
        
        // Revert Points
        const points = Math.floor(txn.price || 0);
        
        if (txn.user_email) {
            const email = txn.user_email.toLowerCase();
            const userKey = `user-auth:${email}`;
            const user = await kv.get(userKey);
            
            if (user) {
                user.points = Math.max(0, (user.points || 0) - points);
                await kv.set(userKey, user);
            } else {
                // Check pending
                const pendingKey = `pending-points:${email}`;
                const pending = await kv.get(pendingKey);
                if (pending) {
                    pending.points = Math.max(0, (pending.points || 0) - points);
                    await kv.set(pendingKey, pending);
                }
            }
        }
        
        // Delete Transaction Record
        await kv.del(txnKey);
        
        return c.json({ ok: true });
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Get Transactions by SA
app.get("/make-server-d9a6e93b/sas/:saId/transactions", async (c) => {
    try {
        const saId = c.req.param("saId");
        const allTx = await kv.getByPrefix("tx:");
        const saTx = allTx.filter((t: any) => t.sa_id === saId);
        // sort desc
        saTx.sort((a: any, b: any) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
        return c.json(saTx);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Consumption Proofs - LIST
app.get("/make-server-d9a6e93b/consumption-proofs", async (c) => {
  try {
    const proofs = await kv.getByPrefix("proof:");
    // Sort by date desc
    proofs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json(proofs);
  } catch (e) {
    return c.json({ error: `Failed to fetch proofs: ${e}` }, 500);
  }
});

// Consumption Proofs - LIST BY USER
app.get("/make-server-d9a6e93b/users/:email/consumption-proofs", async (c) => {
  try {
    const email = c.req.param("email").toLowerCase();
    const proofs = await kv.getByPrefix("proof:");
    const userProofs = proofs.filter((p: any) => p.user_email?.toLowerCase() === email);
    // Sort by date desc
    userProofs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json(userProofs);
  } catch (e) {
    return c.json({ error: `Failed to fetch user proofs: ${e}` }, 500);
  }
});

// Consumption Proofs - CREATE
app.post("/make-server-d9a6e93b/consumption-proofs", async (c) => {
  try {
    const data = await c.req.json();
    const id = `proof-${Date.now()}`;
    const proof = {
        ...data,
        id,
        user_email: data.user_email?.toLowerCase(),
        status: 'pending',
        created_at: new Date().toISOString()
    };
    await kv.set(`proof:${id}`, proof);
    return c.json(proof, 201);
  } catch (e) {
    return c.json({ error: `Failed to submit proof: ${e}` }, 500);
  }
});

// Consumption Proofs - UPDATE STATUS (Approve/Reject)
app.put("/make-server-d9a6e93b/consumption-proofs/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json(); // approved | rejected
    
    const key = `proof:${id}`;
    const proof = await kv.get(key);
    
    if (!proof) return c.json({ error: "Proof not found" }, 404);
    
    // If approving and not already approved
    if (status === 'approved' && proof.status !== 'approved') {
        // Award points
        const userKey = `user-auth:${proof.user_email.toLowerCase()}`;
        const user = await kv.get(userKey);
        
        if (user) {
            // Logic: 1 point per RM1
            const points = Math.floor(proof.invoice_amount || 0);
            user.points = (user.points || 0) + points;
            await kv.set(userKey, user);
        }
    }
    
    proof.status = status;
    proof.updated_at = new Date().toISOString();
    
    await kv.set(key, proof);
    return c.json(proof);
  } catch (e) {
    return c.json({ error: `Update failed: ${e}` }, 500);
  }
});

// Delete Notification
app.delete("/make-server-d9a6e93b/notifications/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const email = c.req.query("email");
        if (!email) return c.json({ error: "Email required" }, 400);
        
        const key = `notifications:${email}`;
        const notifications = (await kv.get(key)) || [];
        // Filter out the notification with the matching id
        const newNotifications = notifications.filter((n: any) => n.id !== id);
        
        await kv.set(key, newNotifications);
        return c.json({ ok: true });
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Get User Profile
app.get("/make-server-d9a6e93b/users/:email", async (c) => {
    try {
        const email = c.req.param("email").toLowerCase();
        const user = await kv.get(`user-auth:${email}`);
        if (!user) return c.json({ error: "User not found" }, 404);
        // Remove password
        const { password, ...safeUser } = user;
        return c.json(safeUser);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});


// Admin: Get All Vouchers
app.get("/make-server-d9a6e93b/admin/vouchers", async (c) => {
  try {
    const vouchers = await kv.getByPrefix("voucher:");
    // Sort by created_at desc
    vouchers.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json(vouchers);
  } catch (e) {
    return c.json({ error: `Failed to fetch vouchers: ${e}` }, 500);
  }
});

// Admin: Reopen Voucher
app.post("/make-server-d9a6e93b/admin/vouchers/:id/reopen", async (c) => {
  try {
    const id = c.req.param("id");
    const key = `voucher:${id}`;
    const voucher = await kv.get(key);
    
    if (!voucher) return c.json({ error: "Voucher not found" }, 404);
    
    voucher.status = 'active';
    voucher.used_at = null; // Clear usage date
    
    await kv.set(key, voucher);
    return c.json(voucher);
  } catch (e) {
    return c.json({ error: `Reopen failed: ${e}` }, 500);
  }
});

// Admin: Set User Points
app.post("/make-server-d9a6e93b/admin/users/:email/points", async (c) => {
  try {
    const email = decodeURIComponent(c.req.param("email")).toLowerCase();
    const { points } = await c.req.json();
    
    const key = `user-auth:${email}`;
    const user = await kv.get(key);
    
    if (!user) return c.json({ error: "User not found" }, 404);
    
    user.points = Number(points);
    
    await kv.set(key, user);
    return c.json({ ok: true, points: user.points });
  } catch (e) {
    return c.json({ error: `Set points failed: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);