import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, ILocationCoords } from '../navigation/types';
import { useTheme, spacing, typography, roundness, shadows } from '../theme/theme';
import Input from '../components/Input';

type DestinationRouteProp = RouteProp<AppStackParamList, 'DestinationSelection'>;
type DestinationNavigationProp = StackNavigationProp<AppStackParamList, 'DestinationSelection'>;

// Preset landmarks in Indore for robust mock autocomplete
const LANDMARKS = [
  { name: 'Indore Junction Railway Station', latitude: 22.7258, longitude: 75.8640 },
  { name: '12, Saket Nagar, Indore', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Vijay Nagar Square, Indore', latitude: 22.7533, longitude: 75.8984 },
  { name: 'Devi Ahilyabai Holkar International Airport', latitude: 22.7224, longitude: 75.8011 },
  { name: 'Rajwada Palace, Indore', latitude: 22.7185, longitude: 75.8522 },
  { name: 'Treasure Island Mall, Indore', latitude: 22.7247, longitude: 75.8778 },
  { name: 'Palasia Square, Indore', latitude: 22.7226, longitude: 75.8856 },
  { name: 'Khajrana Ganesh Temple, Indore', latitude: 22.7291, longitude: 75.9017 },
];

// Haversine formula to compute distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d * 1.35; // Apply a road coefficient factor of 1.35
};

export const DestinationSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<DestinationNavigationProp>();
  const route = useRoute<DestinationRouteProp>();
  
  // Params passed from HomeScreen
  const initialPickupAddress = route.params?.pickupAddress || 'Current Location';
  const initialPickupCoords = route.params?.pickupCoords || { latitude: 22.7196, longitude: 75.8577 };

  const [pickupText, setPickupText] = useState(initialPickupAddress);
  const [pickupCoords, setPickupCoords] = useState<ILocationCoords>(initialPickupCoords);
  
  const [destText, setDestText] = useState('');
  const [destCoords, setDestCoords] = useState<ILocationCoords | null>(null);

  const [focusedField, setFocusedField] = useState<'pickup' | 'destination'>('destination');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLandmarks = LANDMARKS.filter(landmark => 
    landmark.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLandmark = (landmark: typeof LANDMARKS[0]) => {
    const coordsObj: ILocationCoords = { latitude: landmark.latitude, longitude: landmark.longitude };

    if (focusedField === 'pickup') {
      setPickupText(landmark.name);
      setPickupCoords(coordsObj);
      setFocusedField('destination'); // automatically focus destination next
      setSearchQuery('');
    } else {
      setDestText(landmark.name);
      setDestCoords(coordsObj);
      
      // Calculate distance and navigate to BookingPreferences
      const dist = calculateDistance(
        pickupCoords.latitude,
        pickupCoords.longitude,
        landmark.latitude,
        landmark.longitude
      );

      // Route parameters should align with screen expectations
      (navigation as any).navigate('BookingPreferences', {
        pickupAddress: pickupText,
        pickupCoords,
        destinationAddress: landmark.name,
        destinationCoords: coordsObj,
        distance: dist,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Input panel */}
        <View style={[styles.inputPanel, { backgroundColor: theme.surface }, shadows.card]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: theme.text }}>← Back</Text>
          </TouchableOpacity>

          <Input
            label="Pickup Location"
            value={pickupText}
            onChangeText={(text) => {
              setPickupText(text);
              setSearchQuery(text);
            }}
            onFocus={() => {
              setFocusedField('pickup');
              setSearchQuery(pickupText);
            }}
            inputStyle={{ borderColor: focusedField === 'pickup' ? theme.primary : theme.border }}
          />

          <Input
            label="Where To?"
            value={destText}
            placeholder="Search destination landmark..."
            autoFocus
            onChangeText={(text) => {
              setDestText(text);
              setSearchQuery(text);
            }}
            onFocus={() => {
              setFocusedField('destination');
              setSearchQuery(destText);
            }}
            inputStyle={{ borderColor: focusedField === 'destination' ? theme.primary : theme.border }}
          />
        </View>

        {/* Suggestion list */}
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          <Text style={[styles.listLabel, { color: theme.textLight }]}>LANDMARKS & STATIONS</Text>
          {filteredLandmarks.map((landmark, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => handleSelectLandmark(landmark)}
              style={[styles.listItem, { borderBottomColor: theme.border }]}
            >
              <Text style={styles.listItemIcon}>📍</Text>
              <View style={styles.listItemTextWrapper}>
                <Text style={[styles.listItemName, { color: theme.text }]}>{landmark.name}</Text>
                <Text style={[styles.listItemSub, { color: theme.textLight }]}>Indore, Madhya Pradesh</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  inputPanel: {
    padding: spacing.md,
    borderBottomLeftRadius: roundness.lg,
    borderBottomRightRadius: roundness.lg,
    elevation: 3,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  listLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  listItemIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  listItemTextWrapper: {
    flex: 1,
  },
  listItemName: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  listItemSub: {
    ...typography.caption,
    marginTop: 2,
  },
});

export default DestinationSelectionScreen;
