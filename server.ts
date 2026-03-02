import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import WhatsApp from 'whatsapp-cloud-api';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { supabase } from "./src/services/supabase/client.ts";

// Type guard to check if Supabase client is properly configured
function isSupabaseConfigured(): boolean {
  // Check if supabase is our mock object
  return typeof supabase.from === 'function' && 
         supabase.from.length > 0; // Real Supabase client has parameters, mock doesn't
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET || !ADMIN_PASSWORD) {
  console.error("CRITICAL ERROR: JWT_SECRET and ADMIN_PASSWORD environment variables must be set.");
  process.exit(1);
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific image formats
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
    }
  }
});

// Lazy initialization of WhatsApp client
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
      // Handle potential ESM/CJS interop issues
      const WhatsAppClass = (WhatsApp as any).default || WhatsApp;
      whatsappClient = new WhatsAppClass(fromPhoneId, token);
    } catch (error) {
      console.error("Failed to initialize WhatsApp client:", error);
      return null;
    }
  }
  return whatsappClient;
}

// JWT Middleware
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    console.log('Login attempt with password:', password, 'Expected:', ADMIN_PASSWORD);
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
      
      // Only include id if provided
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

    console.log("New Lead Saved to Supabase:", lead);

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
        console.log("WhatsApp notification sent successfully.");
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
      console.warn("Supabase not configured, returning empty leads list");
      data = [];
      error = null;
    }

    if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
    
    // Map database fields back to frontend expected fields
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
      console.warn("Supabase not configured, cannot update lead");
      return res.status(500).json({ error: "Supabase not configured" });
    }

    if (error) return res.status(500).json({ error: error.message });

    // Send automated WhatsApp message if status changed to 'booked' and driver details are provided
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
          console.log("Automated booking confirmation sent to customer.");
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

  // Routes Management
  app.get("/api/routes", async (req, res) => {
    let data, error;
    if (isSupabaseConfigured()) {
      const result = await supabase.from('routes').select('*').order('destination');
      data = result.data;
      error = result.error;
    } else {
      console.warn("Supabase not configured, returning empty routes list");
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
      console.warn("Supabase not configured, returning empty routes list");
      data = [];
      error = null;
    }
    if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
    res.json(data);
  });

  app.post("/api/admin/routes", authenticateAdmin, async (req, res) => {
    const route = req.body;
    
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    if (route.id) {
      const { data, error } = await supabase
        .from('routes')
        .update(route)
        .eq('id', route.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('routes')
        .insert([route])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    }
  });

  app.delete("/api/admin/routes/:id", authenticateAdmin, async (req, res) => {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    const { error } = await supabase.from('routes').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Cars Management
  app.get("/api/cars", async (req, res) => {
    let data, error;
    if (isSupabaseConfigured()) {
      const result = await supabase.from('cars').select('*').order('name');
      data = result.data;
      error = result.error;
    } else {
      console.warn("Supabase not configured, returning empty cars list");
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
      console.warn("Supabase not configured, returning empty cars list");
      data = [];
      error = null;
    }
    if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
    res.json(data);
  });

  app.post("/api/admin/cars", authenticateAdmin, async (req, res) => {
    const car = req.body;
    
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    if (car.id) {
      const { data, error } = await supabase
        .from('cars')
        .update(car)
        .eq('id', car.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('cars')
        .insert([car])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    }
  });

  app.delete("/api/admin/cars/:id", authenticateAdmin, async (req, res) => {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    const { error } = await supabase.from('cars').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Rentals Management
  app.get("/api/rentals", async (req, res) => {
    let data, error;
    if (isSupabaseConfigured()) {
      const result = await supabase.from('rentals').select('*').order('city');
      data = result.data;
      error = result.error;
    } else {
      console.warn("Supabase not configured, returning empty rentals list");
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
      console.warn("Supabase not configured, returning empty rentals list");
      data = [];
      error = null;
    }
    if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
    res.json(data);
  });

  app.post("/api/admin/rentals", authenticateAdmin, async (req, res) => {
    const rental = req.body;
    
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    if (rental.id) {
      const { data, error } = await supabase
        .from('rentals')
        .update(rental)
        .eq('id', rental.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('rentals')
        .insert([rental])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    }
  });

  app.delete("/api/admin/rentals/:id", authenticateAdmin, async (req, res) => {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
    const { error } = await supabase.from('rentals').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Roundtrips Management
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

  // Events Management
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

  // Tour Packages Management
  app.get("/api/tour-packages", async (req, res) => {
    let data, error;
    if (isSupabaseConfigured()) {
      const result = await supabase.from('tour_packages').select('*').order('created_at', { ascending: false });
      data = result.data;
      error = result.error;
    } else {
      console.warn("Supabase not configured, returning empty tour packages list");
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
      const result = await supabase
        .from('tour_packages')
        .select('*')
        .eq('id', id)
        .single();
      data = result.data;
      error = result.error;
    } else {
      console.warn("Supabase not configured, cannot fetch tour package");
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
      console.warn("Supabase not configured, returning empty tour packages list");
      data = [];
      error = null;
    }
    if (error) return res.status(500).json({ error: error?.message || 'Supabase not configured' });
    res.json(data);
  });

  app.post("/api/admin/tour-packages", authenticateAdmin, async (req, res) => {
    const pkg = req.body;
    
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
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
    if (!isSupabaseConfigured()) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    
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

      let data, error;
      if (isSupabaseConfigured() && supabase.storage) {
        const result = await supabase.storage
          .from('images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });
        data = result.data;
        error = result.error;
      } else {
        console.warn("Supabase not configured, cannot upload image");
        return res.status(500).json({ error: "Supabase not configured" });
      }

      if (error) throw error;

      let publicUrl;
      if (isSupabaseConfigured() && supabase.storage) {
        const { data: { publicUrl: url } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        publicUrl = url;
      } else {
        console.warn("Supabase not configured, cannot get public URL");
        return res.status(500).json({ error: "Supabase not configured" });
      }

      res.json({ url: publicUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
