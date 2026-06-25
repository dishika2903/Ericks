# E-Ricks Backend Architecture

This document outlines the technical design, architectural patterns, directory organization, and data structures implemented in the **E-Ricks** backend.

---

## 🏗️ Architectural Overview

The backend uses a modular monolithic structure written in **TypeScript** using **Express.js** and **Socket.io**, backed by a **MongoDB** database managed via the **Mongoose** ODM.

```mermaid
graph TD
    subgraph Clients
        P[Passenger App]
        D[Driver App]
        A[Admin Dashboard]
    end

    subgraph Entrypoints
        S[server.ts]
        W[socketService.ts]
    end

    subgraph Middleware
        Auth[JWT & Role Guard]
        Val[Payload Validator]
        Err[Global Error Handler]
    end

    subgraph Routing Layers
        AR[Auth Routes]
        DR[Driver Routes]
        RR[Ride Routes]
        DeR[Delivery Routes]
        AdR[Admin Routes]
    end

    subgraph Controllers
        AC[Auth Controller]
        DC[Driver Controller]
        RC[Ride Controller]
        DeC[Delivery Controller]
        AdC[Admin Controller]
    end

    subgraph Models
        M[Mongoose Models]
    end

    Clients <-->|HTTP / WebSockets| Entrypoints
    S --> Routing Layers
    Routing Layers --> Middleware
    Middleware --> Controllers
    Controllers --> M
    M <--> DB[(MongoDB)]
    W <--> M
```

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/            # Environment configurations (db.ts, swagger.json)
│   ├── controllers/       # HTTP Request & business logic handler controllers
│   ├── middleware/        # JWT Auth, Role Gates, Field Validation, Error Handling
│   ├── models/            # Mongoose Schemas & TypeScript Interfaces
│   ├── routes/            # Express Router mappings
│   ├── seeder/            # Database mock seeder script
│   ├── services/          # Socket.io connection and event services
│   ├── test/              # Simulation and verification tests
│   └── server.ts          # Express App bootstrap entrypoint
├── package.json
└── tsconfig.json
```

---

## 🛡️ Security & Authorization

### 1. JWT Authentication
Authentication is stateless and managed via JWTs. Upon OTP verification, a token is issued containing the user ID and role, valid for 30 days.

The **[auth.ts](file:///d:/Ericks/backend/src/middleware/auth.ts)** middleware intercepts requests, extracts the bearer token, retrieves the active user record, and appends it to the `req.user` context.

### 2. Role-Based Access Control (RBAC)
Endpoints are restricted using role guards:
```typescript
router.post('/vehicle', authenticate, authorizeRoles('driver'), updateVehicle);
router.get('/analytics', authenticate, authorizeRoles('admin'), getAnalytics);
```

---

## 📡 Real-Time WebSockets (`Socket.io`)

Real-time processes (e.g. driver coordinates tracking and bidding loops) are handled asynchronously over Socket.io in **[socketService.ts](file:///d:/Ericks/backend/src/services/socketService.ts)**.

### Bidding Loop Negotiation
1. **Request Broadcast**: When a passenger creates a ride, a geo-query finds online, verified drivers within a 5km radius and emits a broadcast packet containing the suggested fare.
2. **Driver Bidding**: Drivers submit bids with their custom price offer. The system verifies that the offer falls within ±20% of the suggested fare. Bids are logged and dispatched to the passenger.
3. **30s Expiry**: Bids are flagged as expired if not accepted within 30 seconds.
4. **Acceptance**: Passenger accepts a bid. The system assigns the driver to the ride, flags other bids as expired, and notifies both parties.

---

## 🗺️ Geospatial Indexing

The backend leverages MongoDB's **2dsphere** index to support rapid geospatial queries:
- **`location`** coordinate objects inside the `Driver` model are indexed to allow queries using the `$near` operator:
  ```typescript
  DriverSchema.index({ location: '2dsphere' });
  ```
- This powers the matching logic, identifying the nearest 4-6 online drivers from the passenger's pickup coordinates:
  ```typescript
  const nearestDrivers = await Driver.find({
    status: 'online',
    verificationStatus: 'verified',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: pickupCoords },
        $maxDistance: 5000 // 5km max
      }
    }
  }).limit(6);
  ```

---

## 💵 Ride Fare & Waiting Charge Formula

- **Suggested Ride Fare**: `30 INR Base + 12 INR per km` (Calculated using the Haversine distance formula between coordinates).
- **Suggested Delivery Fare**: `40 INR Base + 15 INR per km` (Slight premium to account for package handling).
- **Waiting Charges**: First 5 minutes of waiting (after driver arrival) are free. Thereafter, a fee of `2 INR per minute` is added to the final ride total.
