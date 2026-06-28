import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/types';
import { useTheme, spacing, typography, shadows, roundness } from '../theme/theme';
import { getCurrentLocation, reverseGeocode, ILocationCoords } from '../services/location';
import BrandLogo from '../components/BrandLogo';

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MainTabs'>;

// Default to Indore center if GPS is slow/denied
const DEFAULT_COORDS = {
  latitude: 22.7196,
  longitude: 75.8577,
};

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [coords, setCoords] = useState<ILocationCoords>(DEFAULT_COORDS);
  const [address, setAddress] = useState('Locating your position...');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const userCoords = await getCurrentLocation();
        setCoords(userCoords);
        
        // Center map
        mapRef.current?.animateToRegion({
          ...userCoords,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1000);

        // Fetch address name
        const addrName = await reverseGeocode(userCoords.latitude, userCoords.longitude);
        setAddress(addrName);
      } catch (err) {
        console.warn('GPS Fetch error, falling back:', err);
        setAddress('Indore Center (Default)');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Mock nearby E-Ricks
  const nearbyRicks = [
    { id: '1', latitude: coords.latitude + 0.003, longitude: coords.longitude - 0.002 },
    { id: '2', latitude: coords.latitude - 0.002, longitude: coords.longitude + 0.003 },
    { id: '3', latitude: coords.latitude + 0.001, longitude: coords.longitude + 0.004 },
  ];

  const handleSearchPress = () => {
    // Go to destination selection, passing current coords as default pickup
    (navigation as any).navigate('DestinationSelection', {
      pickupAddress: address,
      pickupCoords: coords,
    });
  };

  return (
    <View style={styles.container}>
      {/* MAP VIEW */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...coords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Render nearby EV Rickshaws */}
        {nearbyRicks.map((rick) => (
          <Marker
            key={rick.id}
            coordinate={{ latitude: rick.latitude, longitude: rick.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.rickMarker, { backgroundColor: theme.primary, borderColor: '#FFFFFF' }]}>
              {/* Scale tiny logo for marker */}
              <BrandLogo size={24} primaryColor="#FFFFFF" accentColor={theme.secondary} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* FLOATING HEADER INFO */}
      <View style={[styles.headerContainer, { backgroundColor: theme.surface }, shadows.card]}>
        <View style={styles.headerDot} />
        <View style={styles.headerTextWrapper}>
          <Text style={[styles.headerLabel, { color: theme.textLight }]}>PICKUP LOCATION</Text>
          <Text numberOfLines={1} style={[styles.headerAddress, { color: theme.text }]}>
            {loading ? 'Fetching GPS location...' : address}
          </Text>
        </View>
        {loading && <ActivityIndicator size="small" color={theme.primary} style={styles.headerLoader} />}
      </View>

      {/* BOTTOM SEARCH TRIGGER CARD */}
      <View style={[styles.searchCard, { backgroundColor: theme.surface }, shadows.modal]}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>Where are you going?</Text>
        <Text style={[styles.welcomeSubtext, { color: theme.textLight }]}>
          Book a quick, zero-emission ride instantly
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSearchPress}
          style={[styles.searchBarTrigger, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchTextPlaceholder, { color: theme.placeholder }]}>
            Enter drop-off destination...
          </Text>
        </TouchableOpacity>

        {/* Quick selections */}
        <View style={styles.quickSelectRow}>
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: theme.background }]}
            onPress={handleSearchPress}
          >
            <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>🚉 Indore Station</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: theme.background }]}
            onPress={handleSearchPress}
          >
            <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>✈️ Indore Airport</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  rickMarker: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: roundness.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E', // Green dot for active location
    marginRight: spacing.sm,
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerAddress: {
    ...typography.body,
    fontWeight: '600',
  },
  headerLoader: {
    marginLeft: spacing.xs,
  },
  searchCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: roundness.xxl,
    borderTopRightRadius: roundness.xxl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl + 12 : spacing.xl,
  },
  welcomeText: {
    ...typography.h2,
    fontWeight: '700',
  },
  welcomeSubtext: {
    ...typography.body,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  searchBarTrigger: {
    height: 54,
    borderWidth: 1,
    borderRadius: roundness.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchTextPlaceholder: {
    ...typography.bodyLarge,
    fontWeight: '500',
  },
  quickSelectRow: {
    flexDirection: 'row',
  },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: roundness.xl,
    marginRight: spacing.sm,
  },
});

export default HomeScreen;
