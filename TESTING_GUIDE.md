# MedixAI Quick Testing Guide

## Prerequisites
- MongoDB running and connected
- Cloudinary credentials configured in `.env.local`
- Project dependencies installed (`npm install`)

## Starting the Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Test Scenario 1: Admin User Creation & Access

### Step 1: Create Admin Account
1. Go to `/signup`
2. Fill in details:
   - Name: Admin User
   - Email: admin@medixai.com
   - Password: SecurePassword123
   - Role: **Select "admin"** from dropdown
3. Click "Sign Up"

### Step 2: Access Admin Dashboard
1. After login, should auto-redirect to `/dashboard/admin`
2. Verify you see:
   - ✅ Six stat cards (Patients, Doctors, Appointments, Revenue, Pending, Completed)
   - ✅ Monthly chart with trends
   - ✅ User Management section with table

### Step 3: Test User Management
1. **Filter by Role**: Use dropdown to filter (All/Patients/Doctors/Admins)
2. **View Users**: Should see user list with:
   - Avatar (gradient fallback if no image)
   - Name and email
   - Role badge
   - Status (Active/Inactive)
   - Join date
3. **Pagination**: Click Previous/Next to navigate pages
4. **Delete User**: Click trash icon (test with non-admin user)

---

## Test Scenario 2: Profile Image Upload

### Step 1: Prepare Test Image
- File: Any JPEG, PNG, or WebP image
- Size: Less than 5MB (try with larger to test validation)
- Suggested: Use a photo of appropriate size

### Step 2: Upload Avatar
1. Navigate to `/profile`
2. Click camera icon on avatar
3. Select image file
4. **Check**: Image preview appears before upload
5. **Check**: Loading spinner shows during upload
6. **Verify**: Avatar updates on profile after success
7. **Toast notification**: Success message appears

### Step 3: Verify Avatar Display
- Check avatar shows in:
  - ✅ Profile page
  - ✅ Dashboard sidebar user card
  - ✅ Dashboard header user profile
  - ✅ Admin dashboard user management table

---

## Test Scenario 3: Role-Based Access Control

### Step 1: Create Patient Account
1. Go to `/signup` (or logout first)
2. Fill details with role = "patient"
3. After login, verify redirect to `/dashboard/patient`

### Step 2: Test Access Restrictions
1. Try accessing `/dashboard/admin`
2. **Expected**: Should redirect to `/dashboard/patient`
3. Try accessing `/api/users/analytics` via browser console:
   ```javascript
   fetch('/api/users/analytics').then(r => r.json()).then(console.log)
   ```
4. **Expected**: 403 Forbidden error

### Step 3: Create Doctor Account
1. Similar to patient but role = "doctor"
2. Verify redirect to `/dashboard/doctor`
3. Confirm cannot access admin features

---

## Test Scenario 4: File Upload Validation

### Test Invalid File Type
1. Try uploading a .pdf, .txt, or other non-image file
2. **Expected**: Error message "Invalid file type"

### Test Large File
1. Try uploading image > 5MB
2. **Expected**: Error message "File size must be less than 5MB"

### Test Valid Upload
1. Upload valid image < 5MB
2. **Expected**: Success, avatar updates

---

## Test Scenario 5: Admin User Deletion

### Step 1: Get User IDs
1. Open Admin Dashboard
2. View user list
3. Click on a non-admin user's delete (trash) icon

### Step 2: Confirm Deletion
1. Confirmation dialog appears
2. Click confirm
3. **Expected**: User removed from list, toast notification

### Step 3: Verify Database
In MongoDB:
```javascript
db.users.find({ email: "deleted@user.com" })
// Should return empty
```

---

## Test Scenario 6: Image Preview Before Upload

### Step 1: Select Image
1. Click camera icon on profile
2. Select image file
3. **Check**: Preview shows immediately before upload completes

### Step 2: Cancel Upload
1. If needed, you can select another file
2. Previous preview should be replaced

### Step 3: Upload Completes
1. After upload succeeds
2. Avatar persists in all locations

---

## Common Testing Issues

### Issue: "File too large" at wrong size
- **Cause**: Might be browser/network issue
- **Fix**: Check file actually < 5MB

### Issue: Avatar not showing
- **Cause**: Cloudinary credentials missing or incorrect
- **Check**: Verify in `.env.local`:
  ```
  CLOUDINARY_CLOUD_NAME=xxxx
  CLOUDINARY_API_KEY=xxxx
  CLOUDINARY_API_SECRET=xxxx
  ```

### Issue: Cannot access admin dashboard
- **Cause**: Not logged in or not admin user
- **Fix**: Create new admin account with role="admin" in signup

### Issue: User delete not working
- **Cause**: Not admin user
- **Fix**: Ensure logged in as admin

---

## Expected Behavior

### Admin Dashboard Load Time
- Initial load: Stats + chart data fetches
- Expected: < 2 seconds for typical setup

### Image Upload Speed
- Typical 2-3MB image: 2-5 seconds to Cloudinary
- Depends on network speed
- Should show loading spinner during upload

### User List Pagination
- First load: Fetches 10 users
- Pagination: Click next/previous to load more
- Filter: Dropdown changes update instantly

---

## Browser Console Tests

```javascript
// Check JWT token
localStorage.getItem('medixai-auth')

// Test API (as admin)
fetch('/api/users?page=1&limit=10').then(r => r.json()).then(console.log)

// Test upload (would need FormData)
const fd = new FormData()
fd.append('file', fileInput.files[0])
fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json()).then(console.log)
```

---

## Success Indicators

✅ **All working correctly when**:
- [ ] Admin can access dashboard
- [ ] User management table shows users
- [ ] Image upload works
- [ ] Avatar displays in multiple locations
- [ ] Patient/Doctor cannot access admin dashboard
- [ ] File validation works (rejects invalid files)
- [ ] User deletion works (admin only)
- [ ] Pagination works
- [ ] Filters work
- [ ] No console errors

---

## Rollback Instructions

If issues occur:

1. **Undo profile changes**: Reset profile form state
2. **Delete uploaded images**: Handled automatically via Cloudinary
3. **Restore user**: Re-signup deleted user
4. **Clear cache**: Ctrl+F5 in browser

---

## Next Steps

After successful testing:
1. [ ] Deploy to staging
2. [ ] Run full test suite
3. [ ] Load testing for image uploads
4. [ ] Security audit for admin features
5. [ ] Update API documentation
6. [ ] Train admins on new features
