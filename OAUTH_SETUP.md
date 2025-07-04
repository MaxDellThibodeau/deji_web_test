# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your DJEI application.

## Prerequisites

1. A Supabase project
2. A Google Cloud Console project
3. Your React app running on localhost:3000 (or your preferred port)

## Step 1: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
   - Save the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to configure
4. Enable Google provider
5. Enter your Google OAuth **Client ID** and **Client Secret**
6. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Set Environment Variables

Create a `.env` file in your `djei-web` directory with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project:
- Go to **Settings** > **API**
- Copy the **Project URL** and **Project API Key (anon public)**

## Step 4: Test the Integration

1. Start your React development server:
   ```bash
   cd djei-web
   pnpm dev
   ```

2. Navigate to `/login`
3. Click the "Continue with Google" button
4. Complete the OAuth flow
5. New users should be redirected to `/onboarding`
6. Existing users should be redirected to their role-based dashboard

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Cloud Console matches exactly: `https://your-project-ref.supabase.co/auth/v1/callback`

2. **Environment variables not loading**
   - Make sure your `.env` file is in the `djei-web` directory
   - Restart your development server after adding environment variables
   - Ensure variables start with `VITE_` prefix

3. **Authentication not persisting**
   - Check that Supabase is properly configured with `persistSession: true`
   - Verify that your domain is in the allowed origins in Supabase

4. **OAuth callback not working**
   - Ensure the `/auth/callback` route is properly configured in your React Router
   - Check browser console for any JavaScript errors

### Development vs Production

For **development**, use:
- Redirect URI: `http://localhost:3000/auth/callback`

For **production**, use:
- Redirect URI: `https://your-domain.com/auth/callback`

Make sure to add both URIs to your Google Cloud Console OAuth configuration.

## Security Notes

- Never commit your `.env` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your API keys and secrets
- Monitor your OAuth usage in Google Cloud Console

## Features Implemented

✅ Google OAuth sign-in button with loading states  
✅ Automatic redirect handling after OAuth success  
✅ New user onboarding flow with role selection  
✅ Existing user role-based dashboard redirects  
✅ Error handling with toast notifications  
✅ Session persistence using Supabase  
✅ Integration with existing Zustand auth store  

## Next Steps

- [ ] Add Facebook OAuth (if needed)
- [ ] Add profile completion for OAuth users
- [ ] Add email verification for OAuth users
- [ ] Add account linking for users with multiple auth methods 

## **📊 Current Status Summary**

### **✅ COMPLETED Tasks:**

**Multi-role user system** - **DONE** ✅
- ✅ 4 user roles: `attendee`, `dj`, `venue`, `admin`
- ✅ User registration with role selection
- ✅ Database schema with profiles table
- ✅ Zustand store integration

**Social login (Google)** - **DONE** ✅ 
- ✅ Google OAuth via Supabase *(just implemented)*
- ✅ OAuth callback handling
- ✅ New user onboarding flow
- ✅ Session persistence

**Role-based permissions** - **DONE** ✅
- ✅ Protected routes (`ProtectedRoute`, `AdminRoute`)
- ✅ Role-based dashboard redirects
- ✅ Admin privilege system

**Basic profile customization** - **PARTIALLY DONE** ⚠️
- ✅ Core profile fields (name, email, bio, phone, location)
- ✅ Role-specific profile extensions
- ✅ Profile update actions

### **❌ NOT COMPLETED Tasks:**

**Facebook social login** - **NOT DONE** ❌
- Missing Facebook OAuth integration
- Missing Facebook provider setup

**Enhanced profile customization** - **PARTIALLY DONE** ⚠️
- ❌ Profile image upload
- ❌ Profile completion wizard
- ❌ Enhanced role-specific customization
- ❌ Profile privacy settings

---

## **🎯 Next Priority Recommendations**

### **🔥 IMMEDIATE PRIORITY (This Week)**

**1. Profile Image Upload System**
```typescript
// What you need to implement:
- File upload component with image preview
- Image optimization and validation
- Supabase Storage integration
- Avatar display throughout the app
```

**Why prioritize this:**
- High visual impact for users
- Completes the profile system
- Builds on existing profile infrastructure

### **🟡 MEDIUM PRIORITY (Next 1-2 Weeks)**

**2. Profile Completion Wizard**
```typescript
// Implementation needed:
- Multi-step onboarding for new users
- Progressive profile enhancement
- Completion percentage tracking
- Role-specific required fields
```

**3. Facebook OAuth (if required)**
```typescript
// Similar to Google implementation:
- Facebook provider setup in Supabase
- Facebook OAuth button component
- Update OAuth callback handler
```

### **🟢 LOWER PRIORITY (Next 2-4 Weeks)**

**4. Enhanced Role-Specific Profiles**
- DJ: Portfolio, music samples, equipment lists
- Venue: Capacity, amenities, photo galleries  
- Attendee: Music preferences, event history

**5. Advanced Profile Features**
- Profile privacy controls
- Profile sharing/public views
- Profile verification badges

---

## **🚀 Immediate Action Plan (Next 3 Days)**

### **Day 1: Profile Image Upload Foundation**
```bash
# Tasks:
□ Set up Supabase Storage bucket
□ Configure upload policies and security
□ Create basic file upload utility functions
□ Test upload/download functionality
```

### **Day 2: Image Upload UI Components**
```bash
# Tasks:
□ Create ImageUpload component with drag/drop
□ Add image preview and crop functionality
□ Implement upload progress indicators
□ Add image validation (size, format)
```

### **Day 3: Integration & Testing**
```bash
# Tasks:
□ Update profile forms to include image upload
□ Update avatar displays throughout app
□ Test upload flow end-to-end
□ Add error handling and user feedback
```

---

## **📋 Specific Implementation Checklist**

### **Profile Image Upload System**
```typescript
// Components to create:
├── ProfileImageUpload.tsx
├── AvatarDisplay.tsx  
├── ImageCropModal.tsx
└── upload-utils.ts

// Services to implement:
├── Image optimization
├── File type validation
├── Progress tracking
└── Error handling
```

### **Files that need updates:**
```typescript
// Update these existing files:
├── ProfileScreen.tsx (add image upload)
├── UserProfileDisplay.tsx (show uploaded avatars)
├── OnboardingScreen.tsx (optional profile image step)
└── All dashboard headers (display user avatars)
```

---

## **🎯 Success Metrics**

**This Week's Goals:**
- ✅ Users can upload profile images
- ✅ Images display consistently across the app
- ✅ Upload errors are handled gracefully
- ✅ Images are optimized for performance

**Next Sprint Goals:**
- ✅ Profile completion wizard implemented
- ✅ Facebook OAuth (if needed)
- ✅ Enhanced role-specific profiles

---

## **🔧 Quick Start Commands**

Want to start with profile image upload? I can help you implement:

1. **Supabase Storage setup** (buckets, policies)
2. **Image upload component** (drag/drop, preview, crop)
3. **Avatar integration** (display throughout app)

Which would you like to tackle first? The profile image upload system would give you the biggest visual impact and user satisfaction boost right now.