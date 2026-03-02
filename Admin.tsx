import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Car as CarIcon, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Calendar,
  X,
  Image as ImageIcon,
  Map,
  Upload,
  Download,
  ArrowRightLeft,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// --- Types ---

interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  vehicleType: string;
  status: 'new' | 'contacted' | 'booked' | 'cancelled';
  createdAt: string;
  source?: string;
  driver_details?: {
    name: string;
    phone: string;
    vehicle_no: string;
  };
  bookingDetails: {
    from: string;
    to: string;
    date: string;
    time: string;
    tripType: string;
    event?: string;
  };
}

interface RoutePrice {
  id: string;
  from: string;
  destination: string;
  time: string;
  distance: string;
  sedan: number;
  ertiga: number;
}

interface RentalPrice {
  id: string;
  city: string;
  hr: string;
  km: string;
  rate: number;
}

interface Car {
  id: string;
  name: string;
  models: string;
  capacity: string;
  type: string;
}

interface TourPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  image_url?: string;
  created_at?: string;
  location_pricing?: Array<{from: string, to: string, price: number}>;
  primary_from?: string;
  primary_to?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Components ---

const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative bg-white w-full ${maxWidth} rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}
        >
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white z-10">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Admin: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [routes, setRoutes] = useState<RoutePrice[]>([]);
  const [rentals, setRentals] = useState<RentalPrice[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'calendar' | 'routes' | 'rentals' | 'cars' | 'tours'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Bulk & Driver States
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedLeadForDriver, setSelectedLeadForDriver] = useState<string | null>(null);
  const [driverDetails, setDriverDetails] = useState({ name: '', phone: '', vehicle_no: '' });

  // Form states
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Partial<RoutePrice> | null>(null);
  const [editingRental, setEditingRental] = useState<Partial<RentalPrice> | null>(null);
  const [editingCar, setEditingCar] = useState<Partial<Car> | null>(null);
  const [editingTour, setEditingTour] = useState<Partial<TourPackage> | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');
  
  // Calculator States
  const [calcKm, setCalcKm] = useState<string>('');
  const [calcRateSedan, setCalcRateSedan] = useState<number>(12);
  const [calcRateSUV, setCalcRateSUV] = useState<number>(16);
  const [calcBuffer, setCalcBuffer] = useState<number>(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<Pick<Lead, 'name' | 'phone' | 'address' | 'vehicleType' | 'bookingDetails'>>({ 
    name: '',
    phone: '',
    address: '',
    vehicleType: 'Sedan',
    bookingDetails: {
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      tripType: 'One Way'
    }
  });
  const [locationPricing, setLocationPricing] = useState<Array<{from: string, to: string, price: number}>>([]);

  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [token]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [leadsRes, routesRes, rentalsRes, carsRes, toursRes] = await Promise.all([
        fetch('/api/admin/leads', { headers }),
        fetch('/api/admin/routes', { headers }),
        fetch('/api/admin/rentals', { headers }),
        fetch('/api/admin/cars', { headers }),
        fetch('/api/admin/tour-packages', { headers })
      ]);

      if (leadsRes.status === 403 || leadsRes.status === 401) {
        handleLogout();
        return;
      }

      if (!leadsRes.ok) throw new Error((await leadsRes.json()).error || 'Leads fetch failed');
      if (!routesRes.ok) throw new Error((await routesRes.json()).error || 'Routes fetch failed');
      if (!rentalsRes.ok) throw new Error((await rentalsRes.json()).error || 'Rentals fetch failed');
      if (!carsRes.ok) throw new Error((await carsRes.json()).error || 'Cars fetch failed');
      if (!toursRes.ok) throw new Error((await toursRes.json()).error || 'Tours fetch failed');

      setLeads(await leadsRes.json());
      setRoutes(await routesRes.json());
      setRentals(await rentalsRes.json());
      setCars(await carsRes.json());
      setTourPackages(await toursRes.json());
    } catch (err: any) {
      addNotification(err.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string, driver_details?: any) => {
    if (status === 'booked' && !driver_details) {
      setSelectedLeadForDriver(id);
      setIsDriverModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, driver_details })
      });
      if (response.ok) {
        addNotification('Status updated', 'success');
        fetchData();
        if (driver_details) {
          setIsDriverModalOpen(false);
          setDriverDetails({ name: '', phone: '', vehicle_no: '' });
          setSelectedLeadForDriver(null);
        }
      }
    } catch (err) {
      addNotification('Failed to update status', 'error');
    }
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;
    try {
      const response = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRoute)
      });
      if (response.ok) {
        addNotification(editingRoute.id ? 'Route updated' : 'Route added', 'success');
        setIsRouteModalOpen(false);
        setEditingRoute(null);
        fetchData();
      }
    } catch (err) {
      addNotification('Failed to save route', 'error');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      const response = await fetch(`/api/admin/routes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('Route deleted', 'success');
        fetchData();
      } else {
        const err = await response.json();
        addNotification(err.error || 'Failed to delete route', 'error');
      }
    } catch (err) {
      addNotification('Network error during deletion', 'error');
    }
  };

  const handleSaveRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRental) return;
    try {
      const response = await fetch('/api/admin/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRental)
      });
      if (response.ok) {
        addNotification(editingRental.id ? 'Rental updated' : 'Rental added', 'success');
        setIsRentalModalOpen(false);
        setEditingRental(null);
        fetchData();
      }
    } catch (err) {
      addNotification('Failed to save rental', 'error');
    }
  };

  const handleDeleteRental = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rental?')) return;
    try {
      const response = await fetch(`/api/admin/rentals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('Rental deleted', 'success');
        fetchData();
      } else {
        const err = await response.json();
        addNotification(err.error || 'Failed to delete rental', 'error');
      }
    } catch (err) {
      addNotification('Network error during deletion', 'error');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkData.trim()) {
      addNotification('Please enter route data', 'error');
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      const routesToAdd: any[] = [];
      
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 6) {
          routesToAdd.push({
            from: parts[0],
            destination: parts[1],
            time: parts[2],
            distance: parts[3],
            sedan: parseInt(parts[4]),
            ertiga: parseInt(parts[5])
          });
        }
      }

      if (routesToAdd.length === 0) {
        addNotification('No valid routes found in the data (need 6 columns: From, To, Time, Dist, Sedan, SUV)', 'error');
        return;
      }

      // Add routes one by one
      let successCount = 0;
      for (const route of routesToAdd) {
        try {
          const response = await fetch('/api/admin/routes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(route)
          });
          
          if (response.ok) {
            successCount++;
          }
        } catch (err) {
          console.error('Failed to add route:', route.destination, err);
        }
      }

      addNotification(`Successfully added ${successCount} routes`, 'success');
      setIsBulkUploadModalOpen(false);
      setBulkData('');
      fetchData();
    } catch (err) {
      addNotification('Failed to process bulk upload', 'error');
    }
  };

  // Export to CSV helper function
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || row[header.toLowerCase()] || row[header.replace(' ', '')];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export leads to CSV
  const exportLeadsToCSV = () => {
    setIsDownloading(true);
    const headers = ['ID', 'Name', 'Phone', 'Address', 'Vehicle Type', 'Status', 'Created At', 'From', 'To', 'Date', 'Time', 'Trip Type'];
    const formattedData = leads.map(lead => ({
      'ID': lead.id,
      'Name': lead.name,
      'Phone': lead.phone,
      'Address': lead.address,
      'Vehicle Type': lead.vehicleType,
      'Status': lead.status,
      'Created At': new Date(lead.createdAt).toLocaleString(),
      'From': lead.bookingDetails.from,
      'To': lead.bookingDetails.to,
      'Date': lead.bookingDetails.date,
      'Time': lead.bookingDetails.time,
      'Trip Type': lead.bookingDetails.tripType
    }));
    
    exportToCSV(formattedData, `leads-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    addNotification('Leads exported successfully!', 'success');
    setIsDownloading(false);
  };

  // Export routes to CSV
  const exportRoutesToCSV = () => {
    setIsDownloading(true);
    const headers = ['ID', 'From', 'Destination', 'Time', 'Distance', 'Sedan Price', 'SUV Price'];
    const formattedData = routes.map(route => ({
      'ID': route.id,
      'From': route.from || 'Bokaro',
      'Destination': route.destination,
      'Time': route.time,
      'Distance': route.distance,
      'Sedan Price': route.sedan,
      'SUV Price': route.ertiga
    }));
    
    exportToCSV(formattedData, `routes-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    addNotification('Routes exported successfully!', 'success');
    setIsDownloading(false);
  };

  // Export cars to CSV
  const exportCarsToCSV = () => {
    setIsDownloading(true);
    const headers = ['ID', 'Name', 'Models', 'Capacity', 'Type'];
    const formattedData = cars.map(car => ({
      'ID': car.id,
      'Name': car.name,
      'Models': car.models,
      'Capacity': car.capacity,
      'Type': car.type
    }));
    
    exportToCSV(formattedData, `cars-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    addNotification('Cars exported successfully!', 'success');
    setIsDownloading(false);
  };

  // Export tour packages to CSV
  const exportToursToCSV = () => {
    setIsDownloading(true);
    const headers = ['ID', 'Title', 'Description', 'Price', 'Duration', 'Image URL', 'Created At'];
    const formattedData = tourPackages.map(pkg => ({
      'ID': pkg.id,
      'Title': pkg.title,
      'Description': pkg.description,
      'Price': pkg.price,
      'Duration': pkg.duration,
      'Image URL': pkg.image_url || '',
      'Created At': pkg.created_at || ''
    }));
    
    exportToCSV(formattedData, `tour-packages-${new Date().toISOString().slice(0, 10)}.csv`, headers);
    addNotification('Tour packages exported successfully!', 'success');
    setIsDownloading(false);
  };

  // Generate customer ID
  const generateCustomerId = (index?: number) => {
    const nextIndex = index !== undefined ? index : leads.length + 1;
    return `C${nextIndex.toString().padStart(3, '0')}`;
  };

  // Add new lead manually
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const customerId = generateCustomerId();
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          id: customerId // Add the generated customer ID
        })
      });
      
      if (response.ok) {
        addNotification('Lead added successfully!', 'success');
        setIsAddLeadModalOpen(false);
        setNewLead({
          name: '',
          phone: '',
          address: '',
          vehicleType: 'Sedan',
          bookingDetails: {
            from: '',
            to: '',
            date: new Date().toISOString().split('T')[0],
            time: '12:00',
            tripType: 'One Way'
          }
        });
        fetchData();
      } else {
        const errorData = await response.json();
        addNotification(errorData.error || 'Failed to add lead', 'error');
      }
    } catch (err) {
      addNotification('Failed to add lead', 'error');
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    try {
      const response = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingCar)
      });
      if (response.ok) {
        addNotification(editingCar.id ? 'Car updated' : 'Car added', 'success');
        setIsCarModalOpen(false);
        setEditingCar(null);
        fetchData();
      }
    } catch (err) {
      addNotification('Failed to save car', 'error');
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      const response = await fetch(`/api/admin/cars/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('Car deleted', 'success');
        fetchData();
      } else {
        const err = await response.json();
        addNotification(err.error || 'Failed to delete car', 'error');
      }
    } catch (err) {
      addNotification('Network error during deletion', 'error');
    }
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    try {
      // Create a copy of the tour object with location pricing added
      const tourData = {
        ...editingTour,
        location_pricing: locationPricing
      };
      
      const response = await fetch('/api/admin/tour-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tourData)
      });
      if (response.ok) {
        addNotification(editingTour.id ? 'Tour updated' : 'Tour added', 'success');
        setIsTourModalOpen(false);
        setEditingTour(null);
        setLocationPricing([]);
        fetchData();
      }
    } catch (err) {
      addNotification('Failed to save tour', 'error');
    }
  };

  // Function to add a new location pricing entry
  const addLocationPricing = () => {
    setLocationPricing([...locationPricing, { from: '', to: '', price: 0 }]);
  };

  // Function to update a location pricing entry
  const updateLocationPricing = (index: number, field: string, value: string | number) => {
    const updated = [...locationPricing];
    updated[index] = { ...updated[index], [field]: value };
    setLocationPricing(updated);
  };

  // Function to remove a location pricing entry
  const removeLocationPricing = (index: number) => {
    const updated = [...locationPricing];
    updated.splice(index, 1);
    setLocationPricing(updated);
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour package?')) return;
    try {
      const response = await fetch(`/api/admin/tour-packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('Tour deleted', 'success');
        fetchData();
      }
    } catch (err) {
      addNotification('Failed to delete tour', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const { url } = await response.json();
        setEditingTour(prev => ({ ...prev, image_url: url }));
        addNotification('Image uploaded successfully', 'success');
      } else {
        addNotification('Upload failed', 'error');
      }
    } catch (err) {
      addNotification('Upload error', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        addNotification('Welcome back, Admin', 'success');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShieldCheck className="text-[#A3E635]" size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Go Bokaro Cabs Management</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 font-bold text-gray-900 focus:border-black focus:bg-white outline-none transition-all text-center tracking-widest"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-xs font-black text-center uppercase tracking-wider"
              >
                {error}
              </motion.p>
            )}
            <button 
              type="submit"
              className="w-full py-5 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
      
      {/* Notifications */}
      <div className="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                n.type === 'success' ? 'bg-white border-lime-100 text-lime-600' :
                n.type === 'error' ? 'bg-white border-red-100 text-red-600' :
                'bg-white border-blue-100 text-blue-600'
              }`}
            >
              {n.type === 'success' ? <CheckCircle size={18} /> : 
               n.type === 'error' ? <AlertCircle size={18} /> : <RefreshCw size={18} />}
              <span className="text-sm font-black uppercase tracking-wider">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-black text-white flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-[#A3E635] rounded-2xl flex items-center justify-center text-black font-black text-xl">GB</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter">ADMIN</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Control Panel</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'leads', label: 'Inquiries', icon: Users },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'routes', label: 'Intercity Pricing', icon: MapPin },
            { id: 'rentals', label: 'Rental Pricing', icon: Clock },
            { id: 'cars', label: 'Fleet', icon: CarIcon },
            { id: 'tours', label: 'Tours', icon: Map },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                activeTab === item.id 
                ? 'bg-[#A3E635] text-black shadow-[0_10px_20px_-5px_rgba(163,230,53,0.3)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-black text-white p-6 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A3E635] rounded-xl flex items-center justify-center text-black font-black">GB</div>
          <h1 className="text-lg font-black tracking-tight uppercase">{activeTab}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-white"><RefreshCw size={20} /></button>
          <button onClick={handleLogout} className="p-2 text-red-400"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex gap-1 shadow-2xl overflow-x-auto">
        {[
          { id: 'dashboard', icon: TrendingUp },
          { id: 'leads', icon: Users },
          { id: 'calendar', icon: Calendar },
          { id: 'routes', icon: MapPin },
          { id: 'rentals', icon: Clock },
          { id: 'cars', icon: CarIcon },
          { id: 'tours', icon: Map },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === item.id ? 'bg-[#A3E635] text-black' : 'text-gray-500'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 pb-32 md:pb-12">
        
        {/* Tab Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight capitalize">
              {activeTab === 'leads' ? 'Booking Inquiries' : 
               activeTab === 'routes' ? 'Intercity Pricing' : 
               activeTab === 'rentals' ? 'Rental Pricing' : 
               activeTab === 'cars' ? 'Fleet Management' : 'Tour Packages'}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
              {activeTab === 'leads' ? 'Manage customer requests and status' : 
               activeTab === 'routes' ? 'Update intercity travel fares' : 
               activeTab === 'rentals' ? 'Update local city rental rates' : 
               activeTab === 'cars' ? 'Manage available vehicles' : 'Create and manage tour packages'}
            </p>
          </div>
          
          {activeTab === 'leads' && (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddLeadModalOpen(true)}
                className="bg-black text-[#A3E635] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Add Inquiry
              </button>
              <button 
                onClick={exportLeadsToCSV}
                disabled={isDownloading}
                className="bg-[#A3E635] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                <Download size={18} />
                Export Leads
              </button>
            </div>
          )}
          
          {activeTab === 'routes' && (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setEditingRoute({});
                  setIsRouteModalOpen(true);
                }}
                className="bg-black text-[#A3E635] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Add Route
              </button>
              <button 
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="bg-[#A3E635] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <Upload size={18} />
                Bulk Upload
              </button>
              <button 
                onClick={exportRoutesToCSV}
                disabled={isDownloading}
                className="bg-[#A3E635] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                <Download size={18} />
                Export Routes
              </button>
            </div>
          )}
          
          {activeTab === 'cars' && (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setEditingCar({});
                  setIsCarModalOpen(true);
                }}
                className="bg-black text-[#A3E635] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Add Car
              </button>
              <button 
                onClick={exportCarsToCSV}
                disabled={isDownloading}
                className="bg-[#A3E635] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all disabled:opacity-50"
              >
                <Download size={18} />
                Export Cars
              </button>
            </div>
          )}
          
          {activeTab === 'rentals' && (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setEditingRental({ city: 'Bokaro', hr: '', km: '', rate: 0 });
                  setIsRentalModalOpen(true);
                }}
                className="bg-black text-[#A3E635] px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Add Rental Rate
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          
          {activeTab === 'dashboard' && (() => {
            // Analytics Data Prep
            const last7Days = Array.from({length: 7}, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return d.toISOString().split('T')[0];
            }).reverse();

            const chartData = last7Days.map(date => {
              return {
                date: date.substring(5), // MM-DD
                Leads: leads.filter(l => l.createdAt && l.createdAt.startsWith(date)).length,
                Booked: leads.filter(l => l.createdAt && l.createdAt.startsWith(date) && l.status === 'booked').length
              };
            });

            const conversionRate = leads.length > 0 
              ? Math.round((leads.filter(l => l.status === 'booked').length / leads.length) * 100) 
              : 0;

            const popularRoutes = leads.reduce((acc, lead) => {
              const route = `${lead.bookingDetails.from.split(' ')[0]} to ${lead.bookingDetails.to.split(' ')[0]}`;
              acc[route] = (acc[route] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            const topRoutes = Object.entries(popularRoutes).sort((a, b) => b[1] - a[1]).slice(0, 3);

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <TrendingUp className="text-lime-500 mb-4" size={32} />
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{conversionRate}%</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Conversion Rate</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <Map className="text-blue-500 mb-4" size={32} />
                    <div className="space-y-3 mt-4">
                      {topRoutes.length > 0 ? topRoutes.map(([route, count]) => (
                        <div key={route} className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">{route}</span>
                          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-black">{count} bookings</span>
                        </div>
                      )) : <p className="text-sm text-gray-400">No route data yet</p>}
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Top Routes</p>
                  </div>
                  <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl">
                    <h3 className="text-xl font-black tracking-tight mb-2">Quick Actions</h3>
                    <p className="text-xs text-gray-400 mb-6">Manage your fleet and pricing</p>
                    <div className="space-y-3">
                      <button onClick={() => setActiveTab('leads')} className="w-full bg-[#A3E635] text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-between items-center hover:scale-[1.02] transition-transform">
                        View New Leads <ChevronRight size={14} />
                      </button>
                      <button onClick={() => setIsAddLeadModalOpen(true)} className="w-full bg-white/10 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-between items-center hover:bg-white/20 transition-all">
                        Manual Booking <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Lead Volume (Last 7 Days)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                        <Tooltip 
                          cursor={{fill: '#f9fafb'}}
                          contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="Leads" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Booked" fill="#A3E635" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'calendar' && (() => {
            const calendarEvents = leads
              .filter(l => l.status === 'booked' && l.bookingDetails.date)
              .map(l => ({
                title: `${l.name} - ${l.bookingDetails.from.split(' ')[0]} to ${l.bookingDetails.to.split(' ')[0]}`,
                start: new Date(`${l.bookingDetails.date}T${l.bookingDetails.time || '12:00'}`),
                end: new Date(new Date(`${l.bookingDetails.date}T${l.bookingDetails.time || '12:00'}`).getTime() + 60 * 60 * 1000), // 1 hour duration approx
                allDay: false,
                resource: l
              }));

            return (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-[700px]">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                  <Calendar size={28} className="text-[#A3E635]" /> Confirmed Bookings
                </h3>
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 550 }}
                  views={['month', 'week', 'day']}
                  defaultView="week"
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: '#A3E635',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      padding: '4px'
                    }
                  })}
                />
              </div>
            );
          })()}
          
          {activeTab === 'leads' && (
            <>
              {/* Stats Bento */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Total', value: leads.length, icon: Users, color: 'text-gray-400' },
                  { label: 'New', value: leads.filter(l => l.status === 'new').length, icon: Clock, color: 'text-lime-500' },
                  { label: 'Booked', value: leads.filter(l => l.status === 'booked').length, icon: CheckCircle, color: 'text-blue-500' },
                  { label: 'Cancelled', value: leads.filter(l => l.status === 'cancelled').length, icon: XCircle, color: 'text-red-500' },
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={stat.label} 
                    className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between"
                  >
                    <stat.icon className={`${stat.color} mb-4`} size={24} />
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label} Leads</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bulk Actions */}
              <AnimatePresence>
                {selectedLeads.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black text-white px-6 py-4 rounded-[1.5rem] flex items-center justify-between shadow-xl sticky top-24 z-40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="bg-[#A3E635] text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">
                        {selectedLeads.length}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Leads Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        onChange={(e) => {
                          const status = e.target.value;
                          if (status) {
                            if (confirm(`Change status of ${selectedLeads.length} leads to ${status}?`)) {
                              selectedLeads.forEach(id => updateLeadStatus(id, status));
                              setSelectedLeads([]);
                            }
                          }
                        }}
                        className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white/20 transition-all appearance-none"
                      >
                        <option value="">Bulk Update Status...</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => setSelectedLeads([])}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Leads List */}
              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No Inquiries Yet</h3>
                    <p className="text-gray-400 font-medium mt-2">New leads will appear here automatically.</p>
                  </div>
                ) : (
                  leads.map((lead, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={lead.id} 
                      className={`bg-white rounded-[2.5rem] p-6 md:p-8 border ${selectedLeads.includes(lead.id) ? 'border-[#A3E635] shadow-md bg-lime-50/20' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all group relative`}
                    >
                      <div className="absolute top-8 left-6 md:left-8 z-10">
                        <input 
                          type="checkbox" 
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeads(prev => [...prev, lead.id]);
                            else setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                          }}
                          className="w-5 h-5 accent-black cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 pl-8 md:pl-10">
                        {/* Customer Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">{lead.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              lead.status === 'new' ? 'bg-lime-100 text-lime-600' :
                              lead.status === 'contacted' ? 'bg-blue-100 text-blue-600' :
                              lead.status === 'booked' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Phone size={14} /> {lead.phone}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                          </div>
                          {lead.source && (
                            <div className="mt-2 text-[10px] font-black text-lime-600 uppercase tracking-widest bg-lime-50 w-fit px-2 py-1 rounded-md">
                              Source: {lead.source}
                            </div>
                          )}
                        </div>

                        {/* Route Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From</span>
                              <span className="font-black text-gray-900">{lead.bookingDetails.from.split(' ')[0]}</span>
                            </div>
                            <ChevronRight className="text-gray-300" size={20} />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To</span>
                              <span className="font-black text-gray-900">{lead.bookingDetails.to.split(' ')[0]}</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {lead.bookingDetails.tripType} • {lead.bookingDetails.date} @ {lead.bookingDetails.time}
                          </p>
                        </div>

                        {/* Vehicle & Actions */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle</span>
                            <span className="font-black text-gray-900 uppercase tracking-tighter">{lead.vehicleType}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <select 
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-black transition-all"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="booked">Booked</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            
                            <div className="flex gap-2">
                              <a href={`tel:${lead.phone}`} className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all">
                                <Phone size={18} />
                              </a>
                              <a 
                                href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, this is Go Bokaro Cabs. We received your inquiry for a trip from ${lead.bookingDetails.from} to ${lead.bookingDetails.to} on ${lead.bookingDetails.date} at ${lead.bookingDetails.time}. How can we help you today?`)}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#128C7E] transition-all shadow-sm"
                              >
                                <MessageSquare size={18} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'routes' && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Route Pricing Management</h3>
                <p className="text-gray-400 text-sm mt-1">Manage intercity travel fares and pricing</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {routes.map((route, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={route.id} 
                    className="p-6 hover:bg-gray-50/50 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Route Info */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 bg-[#A3E635] rounded-xl flex items-center justify-center text-black">
                            <MapPin size={18} />
                          </div>
                          <h4 className="text-lg font-black text-gray-900 tracking-tight">
                            {route.from || 'Bokaro'} <span className="text-gray-300 mx-2">→</span> {route.destination}
                          </h4>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-13">{route.distance} • {route.time}</p>
                      </div>
                      
                      {/* Pricing Cards */}
                      <div className="flex gap-3">
                        <div className="bg-gray-50 rounded-xl p-4 min-w-[120px] text-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sedan</span>
                          <span className="text-xl font-black text-gray-900">₹{route.sedan}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 min-w-[120px] text-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">SUV</span>
                          <span className="text-xl font-black text-gray-900">₹{route.ertiga}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 justify-end md:justify-start">
                        <button 
                          onClick={() => {
                            setEditingRoute(route);
                            setIsRouteModalOpen(true);
                          }}
                          className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-black hover:text-[#A3E635] transition-all"
                          title="Edit Route"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoute(route.id)}
                          className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Route"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {routes.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <MapPin size={24} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2">No Routes Found</h4>
                  <p className="text-gray-400 text-sm">Add your first route to get started with pricing management.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rentals' && (
            <div className="space-y-6">
              {Object.entries(
                rentals.reduce((acc, rental) => {
                  if (!acc[rental.city]) acc[rental.city] = [];
                  acc[rental.city].push(rental);
                  return acc;
                }, {} as Record<string, RentalPrice[]>)
              ).map(([city, cityRentals], i) => (
                <div key={city} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{city}</h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">{cityRentals.length} Packages Available</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingRental({ city, hr: '', km: '', rate: 0 });
                        setIsRentalModalOpen(true);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest bg-black text-[#A3E635] px-4 py-2 rounded-xl hover:scale-105 transition-all"
                    >
                      Add Package
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {cityRentals.map((rental, j) => (
                      <div key={rental.id} className="p-6 hover:bg-gray-50/30 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 tracking-tight">{rental.hr} / {rental.km}</p>
                            <p className="text-[10px] font-black text-[#A3E635] uppercase tracking-widest">Rate: ₹{rental.rate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingRental(rental);
                              setIsRentalModalOpen(true);
                            }}
                            className="w-9 h-9 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-black hover:text-[#A3E635] transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRental(rental.id)}
                            className="w-9 h-9 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {rentals.length === 0 && (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Clock size={24} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2">No Rentals Found</h4>
                  <p className="text-gray-400 text-sm">Add your first city and rental rate to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={car.id} 
                  className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-[#A3E635] transition-all duration-500">
                      <CarIcon size={24} />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingCar(car);
                          setIsCarModalOpen(true);
                        }}
                        className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-black hover:text-[#A3E635] transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCar(car.id)}
                        className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{car.name}</h3>
                  <p className="text-gray-400 font-bold text-sm mb-6">{car.models}</p>
                  
                  <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-300" />
                      <span className="text-xs font-black text-gray-900">{car.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-gray-300" />
                      <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{car.type}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tourPackages.map((pkg, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={pkg.id} 
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="relative h-48 bg-gray-100">
                    {pkg.image_url ? (
                      <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingTour(pkg);
                          setLocationPricing(pkg.location_pricing || []);
                          setIsTourModalOpen(true);
                        }}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-[#A3E635] transition-all shadow-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTour(pkg.id)}
                        className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight">{pkg.title}</h3>
                      <span className="text-[#A3E635] font-black">₹{pkg.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{pkg.description}</p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">{pkg.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- Modals --- */}

      {/* Route Modal */}
      <Modal 
        isOpen={isRouteModalOpen} 
        onClose={() => {
          setIsRouteModalOpen(false);
          setShowCalculator(false);
        }} 
        title={editingRoute?.id ? 'Edit Intercity Route' : 'New Intercity Route'}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <form onSubmit={handleSaveRoute} className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From (Origin)</label>
                <input 
                  required
                  type="text" 
                  value={editingRoute?.from || ''}
                  onChange={(e) => setEditingRoute(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="e.g. Bokaro"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To (Destination)</label>
                <input 
                  required
                  type="text" 
                  value={editingRoute?.destination || ''}
                  onChange={(e) => setEditingRoute(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="e.g. Ranchi"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Distance</label>
                <input 
                  required
                  type="text" 
                  value={editingRoute?.distance || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingRoute(prev => ({ ...prev, distance: val }));
                    if (!calcKm) setCalcKm(val.replace(/[^0-9.]/g, ''));
                  }}
                  placeholder="e.g. 120 km"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Travel Time</label>
                <input 
                  required
                  type="text" 
                  value={editingRoute?.time || ''}
                  onChange={(e) => setEditingRoute(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="e.g. 3h 15m"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sedan Price (₹)</label>
                <input 
                  required
                  type="number" 
                  value={editingRoute?.sedan || ''}
                  onChange={(e) => setEditingRoute(prev => ({ ...prev, sedan: Number(e.target.value) }))}
                  placeholder="e.g. 2500"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SUV Price (₹)</label>
                <input 
                  required
                  type="number" 
                  value={editingRoute?.ertiga || ''}
                  onChange={(e) => setEditingRoute(prev => ({ ...prev, ertiga: Number(e.target.value) }))}
                  placeholder="e.g. 3500"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-black text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${showCalculator ? 'bg-black text-[#A3E635]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
              >
                <Calculator size={16} />
                {showCalculator ? 'Hide Calculator' : 'Use Calculator'}
              </button>
              <button 
                type="submit" 
                className="flex-[2] py-4 bg-[#A3E635] text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {editingRoute?.id ? 'Update Route' : 'Create Route'}
              </button>
            </div>
          </form>

          {showCalculator && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:w-72 bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6 self-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-[#A3E635]">
                  <Calculator size={14} />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest">Price Helper</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Distance (KM)</label>
                  <input 
                    type="number" 
                    value={calcKm}
                    onChange={(e) => setCalcKm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Sedan Rate</label>
                    <input 
                      type="number" 
                      value={calcRateSedan}
                      onChange={(e) => setCalcRateSedan(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">SUV Rate</label>
                    <input 
                      type="number" 
                      value={calcRateSUV}
                      onChange={(e) => setCalcRateSUV(Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Buffer/Toll (₹)</label>
                  <input 
                    type="number" 
                    value={calcBuffer}
                    onChange={(e) => setCalcBuffer(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Est. Sedan:</span>
                  <span className="font-black text-gray-900">₹{Math.round(Number(calcKm) * calcRateSedan + calcBuffer)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Est. SUV:</span>
                  <span className="font-black text-gray-900">₹{Math.round(Number(calcKm) * calcRateSUV + calcBuffer)}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setEditingRoute(prev => ({
                      ...prev,
                      sedan: Math.round(Number(calcKm) * calcRateSedan + calcBuffer),
                      ertiga: Math.round(Number(calcKm) * calcRateSUV + calcBuffer)
                    }));
                    addNotification('Prices applied!', 'info');
                  }}
                  className="w-full py-3 bg-black text-[#A3E635] rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all mt-2"
                >
                  Apply to Form
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>
      {/* Rental Modal */}
      <Modal 
        isOpen={isRentalModalOpen} 
        onClose={() => setIsRentalModalOpen(false)} 
        title={editingRental?.id ? 'Edit Rental Rate' : 'New Rental Rate'}
      >
        <form onSubmit={handleSaveRental} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
            <input 
              required
              type="text" 
              value={editingRental?.city || ''}
              onChange={(e) => setEditingRental(prev => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Bokaro"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hours</label>
              <input 
                required
                type="text" 
                value={editingRental?.hr || ''}
                onChange={(e) => setEditingRental(prev => ({ ...prev, hr: e.target.value }))}
                placeholder="e.g. 4 hrs"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kms</label>
              <input 
                required
                type="text" 
                value={editingRental?.km || ''}
                onChange={(e) => setEditingRental(prev => ({ ...prev, km: e.target.value }))}
                placeholder="e.g. 40 km"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rate (₹)</label>
            <input 
              required
              type="number" 
              value={editingRental?.rate || ''}
              onChange={(e) => setEditingRental(prev => ({ ...prev, rate: Number(e.target.value) }))}
              placeholder="e.g. 1200"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-5 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {editingRental?.id ? 'Update Rate' : 'Add Rate'}
          </button>
        </form>
      </Modal>

      {/* Car Modal */}
      <Modal 
        isOpen={isCarModalOpen} 
        onClose={() => setIsCarModalOpen(false)} 
        title={editingCar?.id ? 'Edit Vehicle' : 'New Vehicle'}
      >
        <form onSubmit={handleSaveCar} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle Class</label>
            <input 
              required
              type="text" 
              value={editingCar?.name || ''}
              onChange={(e) => setEditingCar(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Premium Sedan"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Models</label>
            <input 
              required
              type="text" 
              value={editingCar?.models || ''}
              onChange={(e) => setEditingCar(prev => ({ ...prev, models: e.target.value }))}
              placeholder="e.g. Honda City / Verna"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
              <input 
                required
                type="text" 
                value={editingCar?.capacity || ''}
                onChange={(e) => setEditingCar(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="e.g. 4+1"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={editingCar?.type || 'Sedan'}
                onChange={(e) => setEditingCar(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black appearance-none cursor-pointer"
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-5 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {editingCar?.id ? 'Update Vehicle' : 'Add to Fleet'}
          </button>
        </form>
      </Modal>

      {/* Tour Modal */}
      <Modal 
        isOpen={isTourModalOpen} 
        onClose={() => setIsTourModalOpen(false)} 
        title={editingTour?.id ? 'Edit Tour Package' : 'New Tour Package'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveTour} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tour Title</label>
                <input 
                  required
                  type="text" 
                  value={editingTour?.title || ''}
                  onChange={(e) => setEditingTour(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Weekend Getaway to Parasnath"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Origin (From)</label>
                  <input 
                    type="text" 
                    value={editingTour?.primary_from || ''}
                    onChange={(e) => setEditingTour(prev => ({ ...prev, primary_from: e.target.value }))}
                    placeholder="e.g. Bokaro"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Destination (To)</label>
                  <input 
                    type="text" 
                    value={editingTour?.primary_to || ''}
                    onChange={(e) => setEditingTour(prev => ({ ...prev, primary_to: e.target.value }))}
                    placeholder="e.g. Parasnath"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={editingTour?.price || ''}
                    onChange={(e) => setEditingTour(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    placeholder="2500"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration</label>
                  <input 
                    required
                    type="text" 
                    value={editingTour?.duration || ''}
                    onChange={(e) => setEditingTour(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 2 Days / 1 Night"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={editingTour?.description || ''}
                  onChange={(e) => setEditingTour(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the tour package details..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-5 font-bold text-gray-900 outline-none focus:border-black transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Image</label>
                <div className="relative group">
                  <div className={`w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all ${isUploading ? 'opacity-50' : 'hover:border-[#A3E635]'}`}>
                    {editingTour?.image_url ? (
                      <img src={editingTour.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="text-gray-300 mb-2" size={32} />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload main image</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Location Pricing Section */}
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Route-Wise Pricing</label>
                  <button 
                    type="button" 
                    onClick={addLocationPricing}
                    className="text-[#A3E635] font-black text-[10px] uppercase tracking-widest flex items-center gap-1 bg-black px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
                  >
                    <Plus size={10} />
                    Add Route
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {locationPricing.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No routes added</p>
                    </div>
                  ) : (
                    locationPricing.map((loc, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3 relative group">
                        <button 
                          type="button" 
                          onClick={() => removeLocationPricing(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X size={10} />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            value={loc.from}
                            onChange={(e) => updateLocationPricing(index, 'from', e.target.value)}
                            placeholder="From"
                            className="bg-gray-50 border border-gray-100 rounded-lg p-2 font-bold text-gray-900 outline-none text-xs"
                          />
                          <input 
                            type="text" 
                            value={loc.to}
                            onChange={(e) => updateLocationPricing(index, 'to', e.target.value)}
                            placeholder="To"
                            className="bg-gray-50 border border-gray-100 rounded-lg p-2 font-bold text-gray-900 outline-none text-xs"
                          />
                        </div>
                        <input 
                          type="number" 
                          value={loc.price}
                          onChange={(e) => updateLocationPricing(index, 'price', parseInt(e.target.value) || 0)}
                          placeholder="Route Price"
                          className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 font-bold text-gray-900 outline-none text-xs"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-5 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all text-xs"
          >
            {editingTour?.id ? 'Update Tour Package' : 'Publish Tour Package'}
          </button>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal 
        isOpen={isBulkUploadModalOpen} 
        onClose={() => {
          setIsBulkUploadModalOpen(false);
          setBulkData('');
        }} 
        title="Bulk Route Upload"
      >
        <form onSubmit={handleBulkUpload} className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Add multiple routes at once. Enter one route per line in this format:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl text-xs font-mono">
              <div className="text-gray-400">// Format: From, Destination, Time, Distance, Sedan Price, SUV Price</div>
              <div>Bokaro, Kolkata, 6h 19m, 317 km, 6500, 7500</div>
              <div>Ranchi, Jamshedpur, 2h 30m, 130 km, 2000, 3000</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Route Data</label>
            <textarea
              required
              rows={8}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Enter your routes here, one per line...
Example:
Bokaro, Kolkata, 6h 19m, 317 km, 6500, 7500
Ranchi, Jamshedpur, 2h 30m, 130 km, 2000, 3000"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-medium text-gray-900 outline-none focus:border-black transition-all resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => {
                setBulkData(`Bokaro, Kolkata, 6h 19m, 317 km, 6500, 7500
Bokaro, Ranchi, 3h 0m, 112 km, 1699, 2499
Ranchi, Jamshedpur, 2h 30m, 130 km, 2000, 3000
Dhanbad, Asansol, 1h 30m, 60 km, 1200, 1800`);
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
            >
              Load Sample Data
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Upload Routes
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Lead Modal */}
      <Modal 
        isOpen={isAddLeadModalOpen} 
        onClose={() => {
          setIsAddLeadModalOpen(false);
          setNewLead({
            name: '',
            phone: '',
            address: '',
            vehicleType: 'Sedan',
            bookingDetails: {
              from: '',
              to: '',
              date: new Date().toISOString().split('T')[0],
              time: '12:00',
              tripType: 'One Way'
            }
          });
        }} 
        title="Add New Inquiry"
      >
        <form onSubmit={handleAddLead} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
              <input 
                required
                type="text" 
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                placeholder="Enter customer name"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                required
                type="tel" 
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                placeholder="Enter phone number"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
              <textarea 
                required
                value={newLead.address}
                onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                placeholder="Enter pickup address"
                rows={2}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all resize-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle Type</label>
              <select 
                value={newLead.vehicleType}
                onChange={(e) => setNewLead({...newLead, vehicleType: e.target.value as 'Sedan' | 'SUV'})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Type</label>
              <select 
                value={newLead.bookingDetails.tripType}
                onChange={(e) => setNewLead({...newLead, bookingDetails: {...newLead.bookingDetails, tripType: e.target.value}})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              >
                <option value="One Way">One Way</option>
                <option value="Round Trip">Round Trip</option>
                <option value="Local Rental">Local Rental</option>
                <option value="Event Cabs">Event Cabs</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From</label>
              <input 
                required
                type="text" 
                value={newLead.bookingDetails.from}
                onChange={(e) => setNewLead({...newLead, bookingDetails: {...newLead.bookingDetails, from: e.target.value}})}
                placeholder="Origin city"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
              <input 
                required
                type="text" 
                value={newLead.bookingDetails.to}
                onChange={(e) => setNewLead({...newLead, bookingDetails: {...newLead.bookingDetails, to: e.target.value}})}
                placeholder="Destination city"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
              <input 
                required
                type="date" 
                value={newLead.bookingDetails.date}
                onChange={(e) => setNewLead({...newLead, bookingDetails: {...newLead.bookingDetails, date: e.target.value}})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
              <input 
                required
                type="time" 
                value={newLead.bookingDetails.time}
                onChange={(e) => setNewLead({...newLead, bookingDetails: {...newLead.bookingDetails, time: e.target.value}})}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-5 bg-black text-[#A3E635] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Add Inquiry
          </button>
        </form>
      </Modal>

      {/* Driver Details Modal */}
      <Modal 
        isOpen={isDriverModalOpen} 
        onClose={() => {
          setIsDriverModalOpen(false);
          setDriverDetails({ name: '', phone: '', vehicle_no: '' });
          setSelectedLeadForDriver(null);
        }} 
        title="Assign Driver & Confirm Booking"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedLeadForDriver) {
            updateLeadStatus(selectedLeadForDriver, 'booked', driverDetails);
          }
        }} className="space-y-6">
          <div className="bg-lime-50 p-4 rounded-xl border border-lime-100 mb-6">
            <p className="text-lime-800 text-sm font-bold">
              Providing these details will automatically send a WhatsApp booking confirmation to the customer.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Driver Name</label>
              <input 
                required
                type="text" 
                value={driverDetails.name}
                onChange={(e) => setDriverDetails({...driverDetails, name: e.target.value})}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Driver Phone</label>
              <input 
                required
                type="tel" 
                value={driverDetails.phone}
                onChange={(e) => setDriverDetails({...driverDetails, phone: e.target.value})}
                placeholder="e.g. 9876543210"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle Number</label>
              <input 
                required
                type="text" 
                value={driverDetails.vehicle_no}
                onChange={(e) => setDriverDetails({...driverDetails, vehicle_no: e.target.value})}
                placeholder="e.g. JH09 AW 1234"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-900 outline-none focus:border-black transition-all uppercase"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-5 bg-[#A3E635] text-black rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Confirm & Send WhatsApp
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Admin;
