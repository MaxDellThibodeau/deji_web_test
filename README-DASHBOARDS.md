# DJEI Dashboard System 🎯

## Overview

This system provides comprehensive role-based dashboards for the DJEI platform with three distinct user types:

- **🎧 DJ Dashboard** - Profile management, gig bookings, request queue, earnings tracking
- **🎪 Attendee Dashboard** - Event discovery, tip history, song requests, DJ following
- **🏟️ Venue Dashboard** - DJ bookings, crowd analytics, event calendar, feedback management

## Features

### ✨ **Core Features**
- **Mobile-first responsive design** with Tailwind CSS
- **Role-based authentication** using Supabase auth
- **Real-time data integration** with Supabase database
- **Profile completion tracking** with guided setup
- **Comprehensive analytics** and engagement metrics

### 🎯 **Role-Specific Features**

#### DJ Dashboard
- **Profile Fields**: Stage name, bio, genres, social links, availability, hourly rate
- **Widgets**: Upcoming gigs, live request queue, earnings/tips tracking, track analytics
- **Music Library**: Track management and performance statistics
- **Booking Management**: Gig scheduling and payment tracking

#### Attendee Dashboard  
- **Profile Fields**: Username, favorite genres, music preferences, location
- **Widgets**: RSVP'd events, tip history, song requests, DJ following list
- **Event Discovery**: Browse and RSVP to events
- **Social Features**: Follow DJs and interact with performances

#### Venue Dashboard
- **Profile Fields**: Venue name, description, hours, equipment, capacity, contact info
- **Widgets**: DJ bookings, crowd engagement stats, event calendar, customer feedback
- **Analytics**: Attendance tracking, revenue metrics, performance insights
- **Management**: Event scheduling and DJ booking coordination

## Setup Instructions

### 1. **Database Setup**

Run the SQL scripts in your Supabase dashboard:

```bash
# 1. Create the profile tables
psql -f djei-web/database/profile-tables.sql

# 2. Insert demo data (optional)
psql -f djei-web/database/demo-data.sql
```

### 2. **Component Integration**

The dashboard system is built with these key components:

```typescript
// Main dashboard router
import { Dashboard } from '@/components/Dashboard'

// Individual dashboards
import { DjDashboard } from '@/components/dashboards/DjDashboard'
import { AttendeeDashboard } from '@/components/dashboards/AttendeeDashboard'
import { VenueDashboard } from '@/components/dashboards/VenueDashboard'

// Layout component
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
```

### 3. **Routing Setup**

Add these routes to your React Router configuration:

```typescript
// In your router setup
import { Dashboard } from '@/components/Dashboard'

const routes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    // Will automatically route to role-specific dashboard
  },
  {
    path: '/dj-portal/dashboard',
    element: <DjDashboard />,
  },
  {
    path: '/attendee-portal/dashboard',
    element: <AttendeeDashboard />,
  },
  {
    path: '/venue-portal/dashboard',
    element: <VenueDashboard />,
  },
]
```

### 4. **Environment Variables**

Ensure your `.env` file includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Component Architecture

```
src/
├── components/
│   ├── Dashboard.tsx                 # Main router component
│   └── dashboards/
│       ├── DjDashboard.tsx          # DJ-specific dashboard
│       ├── AttendeeDashboard.tsx    # Attendee-specific dashboard
│       └── VenueDashboard.tsx       # Venue-specific dashboard
├── shared/
│   └── components/
│       └── layout/
│           └── DashboardLayout.tsx  # Reusable layout component
└── database/
    ├── profile-tables.sql           # Database schema
    └── demo-data.sql               # Sample data
```

## Data Models

### Profile Tables
- `dj_profiles` - DJ-specific profile data
- `attendee_profiles` - Attendee-specific profile data  
- `venue_profiles` - Venue-specific profile data

### Activity Tables
- `events` - Event listings and details
- `dj_bookings` - DJ booking records
- `tips` - Tip transactions
- `song_requests` - Song request queue
- `feedback` - Customer feedback and ratings

### Relationship Tables
- `event_attendees` - Event RSVP tracking
- `dj_followers` - DJ following relationships
- `track_analytics` - DJ track performance metrics

## Usage Examples

### Basic Dashboard Usage

```typescript
// Automatic role-based routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Dashboard component will route to appropriate role dashboard */}
      </Routes>
    </Router>
  )
}
```

### Custom Dashboard Integration

```typescript
// Direct role-specific dashboard usage
function CustomDJPortal() {
  return (
    <div>
      <CustomHeader />
      <DjDashboard />
      <CustomFooter />
    </div>
  )
}
```

### Profile Data Access

```typescript
// Access profile data in your components
const { user } = useAuthStore()

// Load role-specific profile
const loadProfile = async () => {
  const { data } = await supabase
    .from('dj_profiles')
    .select('*')
    .eq('profile_id', user.id)
    .single()
  
  return data
}
```

## Customization

### Styling
- All components use Tailwind CSS classes
- Color scheme based on role (DJ: purple, Attendee: blue, Venue: purple-pink)
- Responsive design with mobile-first approach

### Adding New Widgets
1. Create widget component in appropriate dashboard
2. Add data fetching logic
3. Update dashboard layout grid

### Extending Profile Fields
1. Update database schema
2. Add fields to profile forms
3. Update dashboard display components

## Testing

### With Demo Data
1. Create demo accounts using existing auth system
2. Run demo data SQL script
3. Login with demo accounts to test each role

### Manual Testing
1. Test profile completion flow
2. Verify role-based routing
3. Test responsive design on mobile
4. Verify data loading and error states

## Performance Considerations

- **Lazy Loading**: Dashboard components are loaded on-demand
- **Data Caching**: Profile data is cached in auth store
- **Optimistic Updates**: UI updates immediately with rollback on error
- **Image Optimization**: Avatar images are lazy-loaded

## Security

- **Row Level Security**: All database tables have RLS policies
- **Role-based Access**: Users can only access their own data
- **Input Validation**: All forms use Zod validation schemas
- **SQL Injection Prevention**: All queries use parameterized statements

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Push Notifications**: Event reminders and booking confirmations
- **Advanced Analytics**: Enhanced metrics and reporting
- **Mobile App**: React Native dashboard app
- **API Integration**: Third-party music service integration

## Support

For issues or questions:
1. Check the existing auth system integration
2. Verify database schema is properly set up
3. Review component imports and routing
4. Test with demo data first

## Demo Accounts

Use these accounts to test the dashboard system:

- **DJ**: `dj@djei.demo` / `password123`
- **Attendee**: `attendee@djei.demo` / `password123`  
- **Venue**: `venue@djei.demo` / `password123`

Each account will show the appropriate dashboard with sample data populated. 