export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  LanguageSelection: undefined;
  Login: undefined;
  OtpVerification: { phone: string; role: string };
  ProfileSetup: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  PickupSelection: undefined;
  DestinationSelection: undefined;
  BookingPreferences: undefined;
  DriverOffers: { rideId: string };
  DriverDetails: { driverId: string };
  WaitingForDriver: { rideId: string };
  LiveRideTracking: { rideId: string };
  RideCompleted: { rideId: string };
  Rating: { rideId: string; driverId: string };
  RideHistory: undefined;
  DeliveryBooking: undefined;
  DeliveryTracking: { deliveryId: string };
  Complaint: { rideId?: string };
  LostAndFound: undefined;
  SOS: { rideId?: string };
  Settings: undefined;
  Notifications: undefined;
  SavedPlaces: undefined;
  EmergencyContacts: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  DeliveryTab: undefined;
  SavedPlacesTab: undefined;
  ProfileTab: undefined;
};
