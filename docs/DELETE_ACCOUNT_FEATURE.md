# Delete Account Feature

A comprehensive account deletion feature has been implemented for EcoRide, allowing users to permanently delete their accounts and all associated data.

## Features

### Backend Implementation

1. **Delete Account Endpoint**
   - Route: `DELETE /api/auth/account`
   - Authentication: Required (JWT token)
   - Location: [backend/src/routes/authRoutes.ts:484](../backend/src/routes/authRoutes.ts#L484)

2. **Delete Account Service**
   - Location: [backend/src/services/authService.ts:303-372](../backend/src/services/authService.ts#L303-L372)
   - Handles cascading deletion of:
     - User bookings (as passenger)
     - Bookings for user's rides (as driver)
     - User's rides
     - Notifications
     - Wallet transactions
     - Wallet
     - Vehicles
     - OTP records
     - User account

3. **Data Deletion Order**
   The service carefully deletes data in the correct order to handle foreign key constraints:
   ```
   1. Bookings (as passenger)
   2. Bookings for user's rides
   3. Rides
   4. Notifications
   5. Wallet transactions
   6. Wallet
   7. Vehicles
   8. OTP records
   9. User account
   ```

### Frontend Implementation

1. **Profile Page Danger Zone**
   - Location: [pages/Profile.tsx:264-281](../pages/Profile.tsx#L264-L281)
   - Red-bordered section with warning message
   - "Delete Account" button to trigger deletion flow

2. **Confirmation Modal**
   - Location: [pages/Profile.tsx:284-344](../pages/Profile.tsx#L284-L344)
   - Features:
     - Clear warning about permanent deletion
     - List of data that will be deleted
     - Text confirmation (user must type "DELETE")
     - Confirmation and cancel buttons
     - Loading state during deletion

3. **Backend Service Method**
   - Location: [services/backendService.ts:399-412](../services/backendService.ts#L399-L412)
   - Calls the delete endpoint
   - Automatically logs out user after deletion

## User Flow

1. User navigates to Profile page
2. Scrolls to "Danger Zone" section at the bottom
3. Clicks "Delete Account" button
4. Modal appears with:
   - Warning about permanent deletion
   - List of data to be deleted
   - Text input requiring "DELETE" confirmation
5. User types "DELETE" in the input field
6. "Delete My Account" button becomes enabled
7. User clicks button
8. Account and all data are deleted from backend
9. User is automatically logged out
10. User is redirected to login page

## Safety Features

### User Protection
- **Double Confirmation**: Button + text input confirmation
- **Clear Warning**: Explicit messaging about permanence
- **Data List**: Shows exactly what will be deleted
- **Disabled State**: Button disabled until "DELETE" is typed correctly

### Technical Safety
- **Authentication Required**: Only authenticated users can delete their own account
- **Transaction Safety**: All deletions are performed in a try-catch block
- **Cascading Delete**: Properly handles all related data
- **Foreign Key Handling**: Deletes in correct order to avoid constraint violations

### Undo Prevention
- **No Soft Delete**: Account is permanently deleted from database
- **Immediate Logout**: User session is terminated
- **Data Purge**: All associated data is removed

## API Configuration

The delete endpoint is configured in:
- [services/apiConfig.ts:33](../services/apiConfig.ts#L33)
- Endpoint: `DELETE_ACCOUNT: ${API_BASE_URL}/api/auth/account`

## Testing the Feature

### Manual Testing Steps

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Create a test account:**
   - Sign up with a new phone number or Google account
   - Create some test data (rides, bookings, etc.)

3. **Delete the account:**
   - Go to Profile page
   - Scroll to Danger Zone
   - Click "Delete Account"
   - Type "DELETE" in the confirmation input
   - Click "Delete My Account"

4. **Verify deletion:**
   - Check that you're logged out
   - Try to login with the same credentials (should fail)
   - Check database to confirm all related data is removed

### Database Verification

After deletion, verify in your database that the following are removed:
```sql
-- Replace 'user-id' with the actual user ID
SELECT * FROM "User" WHERE id = 'user-id';
SELECT * FROM "Booking" WHERE "passengerId" = 'user-id';
SELECT * FROM "Ride" WHERE "driverId" = 'user-id';
SELECT * FROM "Wallet" WHERE "userId" = 'user-id';
SELECT * FROM "Vehicle" WHERE "userId" = 'user-id';
```

All queries should return 0 rows.

## Error Handling

The feature handles errors gracefully:

1. **Backend Errors**
   - Database connection issues
   - Foreign key constraint violations
   - User not found

2. **Frontend Errors**
   - Network errors
   - Authentication errors
   - User feedback via alerts

3. **Recovery**
   - If deletion fails, user remains logged in
   - Error message displayed to user
   - No partial deletions (transaction safety)

## UI/UX Considerations

1. **Visibility**: Danger Zone is clearly marked with red borders
2. **Warning**: Multiple warnings about permanence
3. **Clarity**: Explicit list of what will be deleted
4. **Protection**: Requires typing "DELETE" to prevent accidents
5. **Feedback**: Loading states and success/error messages
6. **Accessibility**: Clear labels and semantic HTML

## Security Considerations

1. **Authentication**: Endpoint requires valid JWT token
2. **Authorization**: Users can only delete their own account
3. **No Recovery**: Deleted accounts cannot be recovered
4. **Data Privacy**: All user data is completely removed
5. **GDPR Compliance**: Supports right to erasure

## Future Enhancements

Potential improvements:
- Email confirmation before deletion
- Grace period (account deactivation before permanent deletion)
- Export user data before deletion
- Detailed deletion report
- Admin override for account recovery (within time window)
- Audit log of deletion events

## Related Files

### Backend
- [backend/src/controllers/authController.ts](../backend/src/controllers/authController.ts#L144-L151)
- [backend/src/services/authService.ts](../backend/src/services/authService.ts#L303-L372)
- [backend/src/routes/authRoutes.ts](../backend/src/routes/authRoutes.ts#L484)

### Frontend
- [pages/Profile.tsx](../pages/Profile.tsx)
- [services/backendService.ts](../services/backendService.ts#L399-L412)
- [services/apiConfig.ts](../services/apiConfig.ts#L33)

### Documentation
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - Related authentication feature
