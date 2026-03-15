import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import WhatsApp from 'whatsapp-cloud-api';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { supabase } from "../src/services/supabase/client";
import * as dotenv from 'dotenv';

// Load environment variables for local development
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
  console.warn("WARNING: JWT_SECRET or ADMIN_PASSWORD environment variables are not set. Admin features will be limited.");
}

// Type guard to check if Supabase client is properly configured
function isSupabaseConfigured(): boolean {
  return typeof supabase.from === 'function' && 
         supabase.from.length > 0;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
    }
  }
});

let whatsappClient: any = null;

function getWhatsAppClient() {
  if (!whatsappClient) {
    const token = process.env.WHATSAPP_TOKEN;
    const fromPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !fromPhoneId) {
      console.warn("WhatsApp Cloud API credentials missing. Messages will not be sent.");
      return null;
    }
    
    try {
      const WhatsAppClass = (WhatsApp as any).default || WhatsApp;
      whatsappClient = new WhatsAppClass(fromPhoneId, token);
    } catch (error) {
      console.error("Failed to initialize WhatsApp client:", error);
      return null;
    }
  }
  return whatsappClient;
}

const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

const app = express();
app.use(express.json());

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Admin password not configured on server" });
  }
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// API routes
app.post("/api/leads", async (req, res) => {
  const { name, phone, address, vehicleType, bookingDetails, id, source } = req.body;
  
  let lead, error;
  if (isSupabaseConfigured()) {
    const leadData: any = {
      name,
      phone,
      address,
      vehicle_type: vehicleType,
      status: 'new',
      booking_details: bookingDetails,
      source: source || 'Website'
    };
    
    if (id) {
      leadData.id = id;
    }
    
    const result = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();
    
    lead = result.data;
    error = result.error;
  } else {
    console.warn("Supabase not configured, skipping lead save");
    lead = { id: id || Date.now(), name, phone, address, vehicle_type: vehicleType, status: 'new', booking_details: bookingDetails, source: source || 'Website' };
    error = null;
  }

  if (error) {
    console.error("Error saving lead to Supabase:", error);
    return res.status(500).json({ error: "Failed to save lead" });
  }

  const wa = getWhatsAppClient();
  const recipient = process.env.WHATSAPP_RECIPIENT_PHONE;

  if (wa && recipient) {
    try {
      const message = `🚀 *New Booking Inquiry - Go Bokaro Cabs*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Phone:* ${phone}\n` +
        `📍 *Address:* ${address}\n` +
        `🚗 *Vehicle:* ${vehicleType}\n\n` +
        `🗺️ *Route:* ${bookingDetails.from} to ${bookingDetails.to}\n` +
        `📅 *Date:* ${bookingDetails.date}\n` +
        `⏰ *Time:* ${bookingDetails.time}\n` +
        `🏷️ *Type:* ${bookingDetails.tripType}${bookingDetails.event ? ` (${bookingDetails.event})` : ''}\n` +
        `🌐 *Source:* ${source || 'Website'}\n\n` +
        `Please contact the customer immediately.`;

      await wa.sendText(recipient, message);
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
    }
  }
  
  res.json({ 
    success: true, 
    message: "Lead received successfully. We will contact you soon!" 
  });
});

app.get("/api/admin/leads", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }

  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  
  const mappedLeads = data.map(l => ({
    ...l,
    vehicleType: l.vehicle_type,
    createdAt: l.created_at,
    bookingDetails: l.booking_details
  }));

  res.json(mappedLeads);
});

app.patch("/api/admin/leads/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, driver_details } = req.body;
  
  let data, error;
  if (isSupabaseConfigured()) {
    const updateData: any = { status };
    if (driver_details) updateData.driver_details = driver_details;

    const result = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    data = result.data;
    error = result.error;
  } else {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  if (error) return res.status(500).json({ error: error.message });

  if (status === 'booked' && data && data.driver_details && data.phone) {
    const wa = getWhatsAppClient();
    if (wa) {
      try {
        const message = `🎉 *Booking Confirmed! - Go Bokaro Cabs*\n\n` +
          `Hello ${data.name},\nYour ride is confirmed.\n\n` +
          `🚗 *Driver Details:*\n` +
          `Name: ${data.driver_details.name}\n` +
          `Phone: ${data.driver_details.phone}\n` +
          `Vehicle No: ${data.driver_details.vehicle_no}\n\n` +
          `Have a safe journey!`;

        await wa.sendText(data.phone, message);
      } catch (waError) {
        console.error("Failed to send automated confirmation:", waError);
      }
    }
  }

  res.json(data);
});

app.delete("/api/admin/leads/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/routes", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('routes').select('*').order('destination');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/admin/routes", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('routes').select('*').order('destination');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/routes", authenticateAdmin, async (req, res) => {
  const route = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  
  if (route.id) {
    const { data, error } = await supabase.from('routes').update(route).eq('id', route.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('routes').insert([route]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/routes/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('routes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/cars", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('cars').select('*').order('name');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/admin/cars", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('cars').select('*').order('name');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/cars", authenticateAdmin, async (req, res) => {
  const car = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  
  if (car.id) {
    const { data, error } = await supabase.from('cars').update(car).eq('id', car.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('cars').insert([car]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/cars/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('cars').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/rentals", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('rentals').select('*').order('city');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/admin/rentals", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('rentals').select('*').order('city');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/rentals", authenticateAdmin, async (req, res) => {
  const rental = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  
  if (rental.id) {
    const { data, error } = await supabase.from('rentals').update(rental).eq('id', rental.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('rentals').insert([rental]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/rentals/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('rentals').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/roundtrips", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('roundtrips').select('*').order('destination');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/admin/roundtrips", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('roundtrips').select('*').order('destination');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/roundtrips", authenticateAdmin, async (req, res) => {
  const roundtrip = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  if (roundtrip.id) {
    const { data, error } = await supabase.from('roundtrips').update(roundtrip).eq('id', roundtrip.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('roundtrips').insert([roundtrip]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/roundtrips/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('roundtrips').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/events", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('events').select('*').order('name');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/admin/events", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('events').select('*').order('name');
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/events", authenticateAdmin, async (req, res) => {
  const event = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  if (event.id) {
    const { data, error } = await supabase.from('events').update(event).eq('id', event.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('events').insert([event]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/events/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('events').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/tour-packages", async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('tour_packages').select('*').order('created_at', { ascending: false });
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.get("/api/tour-packages/:id", async (req, res) => {
  const { id } = req.params;
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('tour_packages').select('*').eq('id', id).single();
    data = result.data;
    error = result.error;
  } else {
    return res.status(500).json({ error: "Supabase not configured" });
  }
  if (error) return res.status(404).json({ error: "Package not found" });
  res.json(data);
});

app.get("/api/admin/tour-packages", authenticateAdmin, async (req, res) => {
  let data, error;
  if (isSupabaseConfigured()) {
    const result = await supabase.from('tour_packages').select('*').order('created_at', { ascending: false });
    data = result.data;
    error = result.error;
  } else {
    data = [];
    error = null;
  }
  if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
  res.json(data);
});

app.post("/api/admin/tour-packages", authenticateAdmin, async (req, res) => {
  const pkg = req.body;
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  if (pkg.id) {
    const { data, error } = await supabase.from('tour_packages').update(pkg).eq('id', pkg.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    const { data, error } = await supabase.from('tour_packages').insert([pkg]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
});

app.delete("/api/admin/tour-packages/:id", authenticateAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabase.from('tour_packages').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/admin/upload-image", authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `tour-packages/${fileName}`;

    if (isSupabaseConfigured() && supabase.storage) {
      const { data, error } = await supabase.storage.from('images').upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      res.json({ url: publicUrl });
    } else {
      res.status(500).json({ error: "Supabase storage not configured" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Production serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: "API route not found" });
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
} else {
  // Use dynamic import for Vite to avoid issues in production bundles
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

// Export for Vercel
export default app;

// Local development server
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
