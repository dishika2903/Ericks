# E-Ricks Database Seeder Guide

This document describes how to populate the database with realistic Indian demo data for testing and local development.

---

## 🚀 Commands

### 1. Seed Database (Append)
Inserts demo data. If records already exist, it will add new ones alongside them.
```bash
npm run seed
```

### 2. Reset and Reseed (Recommended)
Clears existing collections (Users, Drivers, Rides, Deliveries, Complaints, SOSAlerts) and seeds a clean set of fresh documents.
```bash
npm run seed:reset
```

---

## 📊 Seeded Data Statistics

The seeder populates the database with the following distribution of documents:

| Collection | Count | Description |
| :--- | :--- | :--- |
| **Users (Admin)** | 1 | Phone: `+919999911111` |
| **Users (Passengers)** | 20 | Indian names, emergency contacts, saved home addresses |
| **Users (Drivers)** | 30 | Associated driver profiles, vehicle specs, document URLs |
| **Drivers (Verified)** | 30 | Plate numbers, battery statuses (40%-100%), verified status |
| **Rides (Completed)** | 10 | Completed passenger rides with historical timestamps and fares |
| **Rides (Ongoing)** | 5 | Active rides in varying states (`accepted`, `arrived`, `started`) |
| **Deliveries** | 8 | Grocery, medicine, documents, parcel, and other shipments |
| **Complaints** | 5 | Logs of customer issues (overcharging, behavior, etc.) |
| **SOS Alerts** | 3 | Real-time safety triggers linked to rides (1 active, 2 resolved) |

---

## 📍 Geospatial Context

All geolocation coordinates are offset dynamically by up to 3km from **Saket Nagar, Indore, Madhya Pradesh (`22.7196, 75.8577`)**.
This ensures that:
- Nearest driver searches find matching results within realistic town boundaries.
- Map coordinates load appropriately on front-end testing screens.

---

## 🚜 Implementation Details

The seeding logic resides in **[seed.ts](file:///d:/Ericks/backend/src/seeder/seed.ts)**:
- Uses standard Mongoose schemas.
- Incorporates realistic phone numbers (`+919800000100` to `+919800000119` for passengers, `+919700000100` to `+919700000129` for drivers).
- Creates a default admin account with email `admin@ericks.com`.
- Simulates historical ride completion pricing calculations.
