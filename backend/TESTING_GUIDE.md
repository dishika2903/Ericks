# E-Ricks Backend Testing Guide

This document describes how to test the E-Ricks backend REST APIs, WebSocket events, and database logic.

---

## 🧪 1. Local Simulation Script (Automated)

We have created an automated integration test script in `src/test/simulation.ts` that mocks a complete ride booking transaction (registration, document uploading, admin verification, booking creation, driver bidding, wait charge additions, OTP verification, and final completion checks).

Run the simulation:
```bash
npx ts-node src/test/simulation.ts
```

---

## 📮 2. Testing with Postman (Manual API Verification)

An environment-ready Postman collection is generated in **[e_ricks_postman_collection.json](file:///d:/Ericks/backend/e_ricks_postman_collection.json)**.

### Steps to import:
1. Open Postman.
2. Click **Import** in the top-left corner.
3. Select the file `d:\Ericks\backend\e_ricks_postman_collection.json` and upload.
4. Set up a **Postman Environment** containing these variables:
   - `base_url`: `http://localhost:5000`
   - `passenger_token`: *(Leave blank initially)*
   - `driver_token`: *(Leave blank initially)*
   - `admin_token`: *(Leave blank initially)*
   - `active_ride_id`: *(Leave blank)*
   - `active_delivery_id`: *(Leave blank)*
   - `target_driver_id`: *(Leave blank)*
   - `target_complaint_id`: *(Leave blank)*
   - `target_sos_id`: *(Leave blank)*

---

## 🚶 3. Manual Testing Workflow Checklist

Follow this workflow to manually verify the APIs:

### Phase A: Authentication & Profiles
1. **Send OTP**: Send a POST to `/api/auth/send-otp` with `{ "phone": "+919876543210" }`. Retrieve the simulated OTP code from the console (or response).
2. **Verify OTP (Passenger)**: Send a POST to `/api/auth/verify-otp` with the phone, OTP code, and `role: "passenger"`. Copy the returned `token` to your Postman environment as `passenger_token`.
3. **Register Passenger**: Send a POST to `/api/auth/register` to complete passenger name details.
4. **Repeat for Driver**: Run step 1 & 2 using a different phone number and `role: "driver"`. Copy the returned `token` to your environment as `driver_token`.

### Phase B: Driver Configuration
1. **Upload Documents**: Use `driver_token` to post KYC documents to `/api/driver/documents`.
2. **Update Vehicle Specs**: Post vehicle make and model to `/api/driver/vehicle`.
3. **Approve Driver (Admin)**:
   - Verify OTP with `role: "admin"` and phone `+919999911111` (OTP: `1234`). Copy the token as `admin_token`.
   - Hit `/api/admin/drivers/pending` to get the pending driver ID.
   - Send a POST request to `/api/admin/drivers/:id/verify` with `{"status": "verified"}` to verify the driver.
4. **Online Status**: Send a status update to `/api/driver/status` with `{"status": "online"}` using `driver_token`.
5. **Driver Location**: Send coordinates to `/api/driver/location` using `driver_token`.

### Phase C: Ride Matching Cycle
1. **Request Ride**: Post pickup and destination to `/api/rides/request` using `passenger_token`. Copy the ride `_id` to your environment as `active_ride_id`.
2. **Retrieve Details**: Check ride details and bidding status using `/api/rides/:id`.
3. **Simulate Bid & Accept**:
   - The bidding and negotiation flows are completed over WebSocket. Connect a WebSocket client to `http://localhost:5000` with the driver token.
   - Emit `ride:submit_bid` with `{ "rideId": "...", "fareOffer": 45, "etaMinutes": 4 }`.
   - From the passenger client, emit `ride:accept_bid` with `{ "rideId": "...", "driverId": "..." }`.
4. **Start Ride (OTP)**: Hit `/api/rides/:id/verify-start` using `driver_token` with OTP `1234`.
5. **Complete Ride (OTP)**: Hit `/api/rides/:id/verify-complete` using `driver_token` with OTP `1234`.
