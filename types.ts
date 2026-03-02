
export interface RoutePrice {
  destination: string;
  time: string;
  distance: string;
  sedan: number;
  ertiga: number;
}

export type TripType = 'One Way' | 'Round Trip' | 'Local Rental' | 'Event Cabs';

export interface BookingState {
  from: string;
  to: string;
  date: string;
  time: string;
  tripType: TripType;
  event?: string;
  rentalHours?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string;
  vehicleType: 'Sedan' | 'SUV';
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

export interface TourPackage {
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
