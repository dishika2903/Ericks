import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme, spacing, roundness, typography } from '../theme/theme';
import Button from './Button';

// 1. DRIVER CARD
interface DriverCardProps {
  name: string;
  rating: number;
  vehiclePlate: string;
  vehicleModel: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  name,
  rating,
  vehiclePlate,
  vehicleModel,
  avatarUrl,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.border }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Text style={{ color: theme.textLight, fontWeight: 'bold' }}>
              {name.substring(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.details}>
          <Text style={[styles.title, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>
            ★ {rating.toFixed(1)} • {vehicleModel}
          </Text>
          <View style={[styles.plateBadge, { backgroundColor: theme.border }]}>
            <Text style={[styles.plateText, { color: theme.text }]}>{vehiclePlate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 2. OFFER CARD (Driver Bid Offer)
interface OfferCardProps {
  driverName: string;
  driverRating: number;
  vehiclePlate: string;
  fareOffer: number;
  etaMinutes: number;
  onAccept: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  driverName,
  driverRating,
  vehiclePlate,
  fareOffer,
  etaMinutes,
  onAccept,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.border }]}>
            <Text style={{ color: theme.textLight }}>★</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.title, { color: theme.text }]}>{driverName}</Text>
            <Text style={[styles.subtitle, { color: theme.textLight }]}>
              ★ {driverRating.toFixed(1)} • {vehiclePlate}
            </Text>
            <Text style={[styles.etaText, { color: theme.primary }]}>Arrives in {etaMinutes} mins</Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <Text style={[styles.fareText, { color: theme.text }]}>₹{fareOffer}</Text>
          <Button
            title="Accept"
            onPress={onAccept}
            style={styles.acceptBtn}
            textStyle={{ fontSize: 13 }}
          />
        </View>
      </View>
    </View>
  );
};

// 3. RIDE HISTORY CARD
interface RideCardProps {
  pickup: string;
  destination: string;
  date: string;
  fare: number;
  status: string;
  onPress?: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({
  pickup,
  destination,
  date,
  fare,
  status,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.dateText, { color: theme.textLight }]}>{date}</Text>
        <Text
          style={[
            styles.statusText,
            { color: status === 'completed' ? theme.success : theme.error },
          ]}
        >
          {status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.routeContainer}>
        <Text numberOfLines={1} style={[styles.addressText, { color: theme.text }]}>
          🟢 {pickup}
        </Text>
        <Text numberOfLines={1} style={[styles.addressText, { color: theme.text, marginTop: spacing.xs }]}>
          🔴 {destination}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.fareLabel, { color: theme.textLight }]}>Total Paid</Text>
        <Text style={[styles.fareValue, { color: theme.text }]}>₹{fare}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: roundness.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: roundness.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: roundness.round,
  },
  details: {
    flex: 1,
  },
  title: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  plateBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: roundness.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  plateText: {
    ...typography.caption,
    fontWeight: '600',
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  fareText: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  acceptBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: roundness.md,
  },
  etaText: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  dateText: {
    ...typography.caption,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  routeContainer: {
    marginVertical: spacing.md,
  },
  addressText: {
    ...typography.body,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // Default light divider
    paddingTop: spacing.sm,
  },
  fareLabel: {
    ...typography.caption,
  },
  fareValue: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
});
