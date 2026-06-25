# E-Ricks API Documentation

This document describes all REST API routes, schemas, and Socket.io events for the **E-Ricks** backend service.

Swagger UI is integrated and available dynamically at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🔑 Authentication Headers
Endpoints that require user authentication expect a JSON Web Token (JWT) in the HTTP `Authorization` header:
```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 1. REST API Route Directory

### 0. Root & System Health
* **GET `/`** - Returns service welcome meta and links to docs and health checks.
* **GET `/health`** - Evaluates backend health, uptime, and MongoDB connection status.

### 1. Authentication (`/api/auth`)
* **POST `/send-otp`** - Triggers a simulated 4-digit code dispatched to the phone number.
  * *Request Body:* `{"phone": "+919999999999"}`
  * *Response:* `{"success": true, "message": "OTP sent successfully", "otp": "1234"}`
* **POST `/verify-otp`** - Verifies code, logs user in, and returns JWT token.
  * *Request Body:* `{"phone": "+919999999999", "otp": "1234", "role": "passenger"}`
  * *Response:* `{"success": true, "token": "...", "user": {...}, "isNewUser": false}`
* **POST `/register`** - Registers new profile attributes (name, email, language). *Requires JWT Auth.*
* **GET `/profile`** - Fetches authenticated profile credentials. *Requires JWT Auth.*
* **PUT `/profile`** - Updates saved addresses, language, and SOS emergency contacts. *Requires JWT Auth.*

### 2. Drivers (`/api/driver`)
* *All endpoints below require JWT authentication and the `driver` user role.*
* **POST `/documents`** - Uploads Aadhaar, license, vehicle RC plate papers, and a selfie.
* **POST `/vehicle`** - Saves e-rickshaw make/model, registration plate, capacity (4 or 6), and closed weather body indicators.
* **POST `/status`** - Sets online status (`online`, `offline`, `break`). Online state is locked until admin verification.
* **POST `/location`** - Telemetry coordinates update and estimated battery capacity percentages.
* **GET `/details`** - Returns penalty tracking, vehicle info, and ratings score.

### 3. Ride Booking & Matching (`/api/rides`)
* *All endpoints below require JWT authentication.*
* **POST `/request`** - Passenger creates a ride booking request. Computes suggested pricing based on distance (30 INR base + 12 INR/km). *Requires Passenger Role.*
  * *Request Body:*
    ```json
    {
      "pickup": {
        "address": "12, Saket Nagar, Indore",
        "location": { "type": "Point", "coordinates": [75.8577, 22.7196] }
      },
      "destination": {
        "address": "Indore Junction Railway Station",
        "location": { "type": "Point", "coordinates": [75.8640, 22.7258] }
      },
      "poolingAllowed": false,
      "passengerCount": 1
    }
    ```
* **GET `/:id`** - Returns status of the ride, assigned driver details, and current bidding offers array.
* **POST `/:id/cancel`** - Cancels booking. Enforces passenger penalty rules (20 INR cancellation fee if driver is assigned and moving) or driver penalty scores.
* **POST `/:id/verify-start`** - Driver verifies passenger's pickup OTP to start the ride tracking.
* **POST `/:id/verify-complete`** - Driver verifies passenger's completion OTP to end the ride. Calculates waiting fees (first 5 minutes free, then 2 INR/minute).

### 4. Deliveries (`/api/deliveries`)
* *All endpoints below require JWT authentication.*
* **POST `/request`** - Creates a single package delivery (medicine, grocery, documents, parcel, other) with fragile option, suggested pricing, and a handover OTP. *Requires Passenger Role.*
* **GET `/:id`** - Fetches status, bids, and assigned driver details.
* **POST `/:id/verify-handover`** - Driver verifies receiver's OTP to hand over package and complete billing. *Requires Driver Role.*

### 5. Administration (`/api/admin`)
* *All endpoints below require JWT authentication and the `admin` user role.*
* **GET `/drivers/pending`** - Returns driver records awaiting document audit.
* **POST `/drivers/:id/verify`** - Approves or rejects driver documents.
* **GET `/analytics`** - Compiles platform statistics: active drivers, bookings, open complaints, active SOS alerts, and gross revenue.
* **GET `/complaints`** - Returns registered complaints log.
* **POST `/complaints/:id/resolve`** - Resolves complaint with resolution logs.
* **GET `/sos`** - Returns active SOS emergency signals list.
* **POST `/sos/:id/resolve`** - Resolves SOS alert.

---

## 📡 2. Socket.io Real-Time Interface

Real-time matches, bargaining bids, and coordinates telemetry are piped through persistent WebSockets:

### Client Emits (Requests)
1. **`ride:request`** (Passenger -> Server)
   - *Payload:* `{"rideId": "..."}`
   - *Logic:* Server finds 4-6 closest online, verified drivers within a 5km radius and broadcasts request.
2. **`ride:submit_bid`** (Driver -> Server)
   - *Payload:* `{"rideId": "...", "fareOffer": 45, "etaMinutes": 4}`
   - *Logic:* Driver bids on request. Fare offer must be within range (suggested price +/- 20%). Emits bid expiry in 30 seconds.
3. **`ride:accept_bid`** (Passenger -> Server)
   - *Payload:* `{"rideId": "...", "driverId": "..."}`
   - *Logic:* Passenger locks in a bid, changing ride status to `accepted`.
4. **`ride:driver_arrived`** (Driver -> Server)
   - *Payload:* `{"rideId": "..."}`
   - *Logic:* Signals driver has arrived at pickup; wait timer starts.
5. **`location:update`** (Driver -> Server)
   - *Payload:* `{"latitude": 22.72, "longitude": 75.858, "heading": 90, "batteryLevel": 85}`
   - *Logic:* Updates driver's live geocoordinates.
6. **`sos:trigger`** (Passenger/Driver -> Server)
   - *Payload:* `{"rideId": "...", "latitude": 22.72, "longitude": 75.858}`
   - *Logic:* Immediately raises emergency panic flag and notifies admin channels.

### Server Emits (Broadcasts)
1. **`ride:broadcast_request`** (To Drivers in Zone)
   - *Payload:* Contains ride coordinates, destination, suggested fare, passenger name, and rating.
2. **`ride:bid_received`** (To Passenger Room)
   - *Payload:* Contains bid offer details, driver profile, rating, and vehicle plate.
3. **`ride:bid_accepted`** (To Driver Room)
   - *Payload:* Notifies driver their bid was accepted; contains pickup location and OTP code.
4. **`location:driver_moved`** (To Passenger Room)
   - *Payload:* Contains updated driver coordinates for live UI navigation mapping.
5. **`ride:status_changed`** (To Passenger Room)
   - *Payload:* Notifies client of state transitions (arrived, started, completed).
6. **`sos:alert_received`** (To Admin Room)
   - *Payload:* Relays coordinates of emergency alert.
