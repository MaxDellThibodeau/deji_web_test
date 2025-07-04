import { UserRole } from '../types/user'
import { ProfileSectionConfig, ProfileFieldConfig } from '../types/profile-completion'

// Common genre options for music-related fields
const GENRE_OPTIONS = [
  { value: 'house', label: 'House' },
  { value: 'techno', label: 'Techno' },
  { value: 'hip-hop', label: 'Hip Hop' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'country', label: 'Country' },
  { value: 'r&b', label: 'R&B' },
  { value: 'latin', label: 'Latin' },
  { value: 'indie', label: 'Indie' },
  { value: 'metal', label: 'Metal' },
  { value: 'funk', label: 'Funk' }
]

const EVENT_TYPE_OPTIONS = [
  { value: 'club', label: 'Club Events' },
  { value: 'festival', label: 'Festivals' },
  { value: 'private', label: 'Private Parties' },
  { value: 'wedding', label: 'Weddings' },
  { value: 'corporate', label: 'Corporate Events' },
  { value: 'concert', label: 'Concerts' },
  { value: 'lounge', label: 'Lounge Events' },
  { value: 'rooftop', label: 'Rooftop Parties' }
]

const VENUE_TYPE_OPTIONS = [
  { value: 'nightclub', label: 'Nightclub' },
  { value: 'bar', label: 'Bar/Lounge' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel/Resort' },
  { value: 'event_hall', label: 'Event Hall' },
  { value: 'outdoor', label: 'Outdoor Venue' },
  { value: 'rooftop', label: 'Rooftop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'other', label: 'Other' }
]

const AMENITIES_OPTIONS = [
  { value: 'sound_system', label: 'Professional Sound System' },
  { value: 'lighting', label: 'Lighting System' },
  { value: 'dj_booth', label: 'DJ Booth' },
  { value: 'stage', label: 'Stage/Performance Area' },
  { value: 'dance_floor', label: 'Dance Floor' },
  { value: 'vip_area', label: 'VIP Area' },
  { value: 'bar', label: 'Full Bar' },
  { value: 'kitchen', label: 'Kitchen/Catering' },
  { value: 'parking', label: 'Parking Available' },
  { value: 'outdoor_space', label: 'Outdoor Space' },
  { value: 'photo_booth', label: 'Photo Booth' },
  { value: 'coat_check', label: 'Coat Check' }
]

// Basic profile section (common to all roles)
const getBasicProfileSection = (): ProfileSectionConfig => ({
  id: 'basic',
  title: 'Basic Information',
  description: 'Tell us about yourself',
  icon: 'User',
  fields: [
    {
      key: 'bio',
      label: 'Bio',
      type: 'textarea',
      required: true,
      placeholder: 'Tell others about yourself...',
      description: 'A brief description about yourself',
      validation: {
        minLength: 20,
        maxLength: 500
      }
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'phone',
      required: false,
      placeholder: '+1 (555) 123-4567',
      description: 'Optional contact number'
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'City, State',
      description: 'Your current location'
    },
    {
      key: 'website',
      label: 'Website',
      type: 'text',
      required: false,
      placeholder: 'https://yourwebsite.com',
      description: 'Your personal or professional website'
    }
  ]
})

// DJ-specific profile sections
const getDJProfileSections = (): ProfileSectionConfig[] => [
  getBasicProfileSection(),
  {
    id: 'professional',
    title: 'Professional Details',
    description: 'Your DJ experience and setup',
    icon: 'Music',
    fields: [
      {
        key: 'stage_name',
        label: 'Stage Name',
        type: 'text',
        required: true,
        placeholder: 'DJ Name',
        description: 'Your professional DJ name'
      },
      {
        key: 'genres',
        label: 'Primary Genres',
        type: 'multiselect',
        required: true,
        description: 'Select your main genres (up to 5)',
        options: GENRE_OPTIONS
      },
      {
        key: 'experience_years',
        label: 'Years of Experience',
        type: 'number',
        required: true,
        description: 'How many years have you been DJing?',
        validation: {
          min: 0,
          max: 50
        }
      },
      {
        key: 'hourly_rate',
        label: 'Hourly Rate ($)',
        type: 'number',
        required: false,
        placeholder: '150',
        description: 'Your typical hourly rate for events',
        validation: {
          min: 0,
          max: 10000
        }
      },
      {
        key: 'equipment_provided',
        label: 'Provide Own Equipment',
        type: 'toggle',
        required: true,
        description: 'Do you bring your own sound equipment?'
      }
    ]
  },
  {
    id: 'social',
    title: 'Social Links',
    description: 'Connect your social media and music platforms',
    icon: 'Share2',
    fields: [
      {
        key: 'social_links.instagram',
        label: 'Instagram',
        type: 'text',
        required: false,
        placeholder: '@yourusername',
        description: 'Your Instagram handle'
      },
      {
        key: 'social_links.soundcloud',
        label: 'SoundCloud',
        type: 'text',
        required: false,
        placeholder: 'soundcloud.com/yourusername',
        description: 'Your SoundCloud profile'
      },
      {
        key: 'social_links.twitter',
        label: 'Twitter',
        type: 'text',
        required: false,
        placeholder: '@yourusername',
        description: 'Your Twitter handle'
      }
    ]
  }
]

// Venue-specific profile sections
const getVenueProfileSections = (): ProfileSectionConfig[] => [
  getBasicProfileSection(),
  {
    id: 'venue_details',
    title: 'Venue Information',
    description: 'Details about your venue',
    icon: 'Building',
    fields: [
      {
        key: 'venue_name',
        label: 'Venue Name',
        type: 'text',
        required: true,
        placeholder: 'The Electric Room',
        description: 'Official name of your venue'
      },
      {
        key: 'venue_type',
        label: 'Venue Type',
        type: 'select',
        required: true,
        description: 'What type of venue is this?',
        options: VENUE_TYPE_OPTIONS
      },
      {
        key: 'capacity',
        label: 'Maximum Capacity',
        type: 'number',
        required: true,
        placeholder: '300',
        description: 'Maximum number of guests',
        validation: {
          min: 1,
          max: 50000
        }
      },
      {
        key: 'address',
        label: 'Full Address',
        type: 'textarea',
        required: true,
        placeholder: '123 Main St, City, State 12345',
        description: 'Complete venue address'
      },
      {
        key: 'booking_email',
        label: 'Booking Email',
        type: 'text',
        required: true,
        placeholder: 'bookings@venue.com',
        description: 'Email for event bookings'
      }
    ]
  },
  {
    id: 'amenities',
    title: 'Venue Features',
    description: 'What amenities does your venue offer?',
    icon: 'Star',
    fields: [
      {
        key: 'amenities',
        label: 'Available Amenities',
        type: 'multiselect',
        required: true,
        description: 'Select all amenities your venue provides',
        options: AMENITIES_OPTIONS
      },
      {
        key: 'description',
        label: 'Venue Description',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your venue atmosphere, style, and unique features...',
        description: 'Detailed description of your venue',
        validation: {
          minLength: 50,
          maxLength: 1000
        }
      }
    ]
  }
]

// Attendee-specific profile sections
const getAttendeeProfileSections = (): ProfileSectionConfig[] => [
  getBasicProfileSection(),
  {
    id: 'preferences',
    title: 'Music Preferences',
    description: 'Help us personalize your experience',
    icon: 'Heart',
    fields: [
      {
        key: 'favorite_genres',
        label: 'Favorite Genres',
        type: 'multiselect',
        required: true,
        description: 'Select your favorite music genres',
        options: GENRE_OPTIONS
      },
      {
        key: 'music_discovery_preference',
        label: 'Music Discovery Style',
        type: 'select',
        required: true,
        description: 'How do you like to discover new music?',
        options: [
          { value: 'popular', label: 'Popular hits and mainstream' },
          { value: 'underground', label: 'Underground and emerging artists' },
          { value: 'balanced', label: 'Mix of both popular and underground' }
        ]
      },
      {
        key: 'preferred_event_types',
        label: 'Preferred Event Types',
        type: 'multiselect',
        required: false,
        description: 'What types of events do you enjoy?',
        options: EVENT_TYPE_OPTIONS
      },
      {
        key: 'typical_budget_range',
        label: 'Typical Event Budget',
        type: 'select',
        required: false,
        description: 'Your usual spending range for events',
        options: [
          { value: 'under_50', label: 'Under $50' },
          { value: '50_100', label: '$50 - $100' },
          { value: '100_200', label: '$100 - $200' },
          { value: '200_plus', label: '$200+' }
        ]
      }
    ]
  }
]

// ROLE_FIELDS object - Direct mapping of roles to their field configurations
export const ROLE_FIELDS: Record<UserRole, ProfileSectionConfig[]> = {
  dj: [
    // Basic Information
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      icon: 'User',
      fields: [
        {
          key: 'bio',
          label: 'Bio',
          type: 'textarea',
          required: true,
          placeholder: 'Tell others about yourself as a DJ...',
          description: 'A brief description about your DJ style and background',
          validation: {
            minLength: 20,
            maxLength: 500
          }
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'phone',
          required: false,
          placeholder: '+1 (555) 123-4567',
          description: 'Contact number for bookings'
        },
        {
          key: 'location',
          label: 'Location',
          type: 'text',
          required: true,
          placeholder: 'City, State',
          description: 'Your current location for gigs'
        },
        {
          key: 'website',
          label: 'Website',
          type: 'text',
          required: false,
          placeholder: 'https://yourdjsite.com',
          description: 'Your professional DJ website'
        }
      ]
    },
    // Professional Details
    {
      id: 'professional',
      title: 'Professional Details',
      description: 'Your DJ experience and setup',
      icon: 'Music',
      fields: [
        {
          key: 'stage_name',
          label: 'Stage Name',
          type: 'text',
          required: true,
          placeholder: 'DJ Phoenix',
          description: 'Your professional DJ name'
        },
        {
          key: 'genres',
          label: 'Primary Genres',
          type: 'multiselect',
          required: true,
          description: 'Select your main genres (up to 5)',
          options: GENRE_OPTIONS
        },
        {
          key: 'experience_years',
          label: 'Years of Experience',
          type: 'number',
          required: true,
          placeholder: '5',
          description: 'How many years have you been DJing professionally?',
          validation: {
            min: 0,
            max: 50
          }
        },
        {
          key: 'hourly_rate',
          label: 'Hourly Rate ($)',
          type: 'number',
          required: false,
          placeholder: '150',
          description: 'Your typical hourly rate for events (optional)',
          validation: {
            min: 0,
            max: 10000
          }
        },
        {
          key: 'equipment_provided',
          label: 'Provide Own Equipment',
          type: 'toggle',
          required: true,
          description: 'Do you bring your own sound equipment to gigs?'
        }
      ]
    },
    // Social & Music Links
    {
      id: 'social',
      title: 'Social & Music Links',
      description: 'Connect your social media and music platforms',
      icon: 'Share2',
      fields: [
        {
          key: 'social_links.instagram',
          label: 'Instagram',
          type: 'text',
          required: false,
          placeholder: '@djphoenix',
          description: 'Your Instagram handle'
        },
        {
          key: 'social_links.soundcloud',
          label: 'SoundCloud',
          type: 'text',
          required: false,
          placeholder: 'soundcloud.com/djphoenix',
          description: 'Your SoundCloud profile URL'
        },
        {
          key: 'social_links.twitter',
          label: 'Twitter/X',
          type: 'text',
          required: false,
          placeholder: '@djphoenix',
          description: 'Your Twitter/X handle'
        },
        {
          key: 'social_links.website',
          label: 'Music Website',
          type: 'text',
          required: false,
          placeholder: 'https://djphoenix.com',
          description: 'Your music portfolio or booking website'
        }
      ]
    }
  ],

  venue: [
    // Basic Information
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us about your venue',
      icon: 'User',
      fields: [
        {
          key: 'bio',
          label: 'Venue Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your venue atmosphere and style...',
          description: 'A brief description about your venue',
          validation: {
            minLength: 20,
            maxLength: 500
          }
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'phone',
          required: true,
          placeholder: '+1 (555) 123-4567',
          description: 'Main contact number for the venue'
        },
        {
          key: 'location',
          label: 'City/Area',
          type: 'text',
          required: true,
          placeholder: 'Downtown Miami',
          description: 'General area or neighborhood'
        },
        {
          key: 'website',
          label: 'Website',
          type: 'text',
          required: false,
          placeholder: 'https://electricroom.com',
          description: 'Your venue website'
        }
      ]
    },
    // Venue Details
    {
      id: 'venue_details',
      title: 'Venue Information',
      description: 'Details about your venue',
      icon: 'Building',
      fields: [
        {
          key: 'venue_name',
          label: 'Venue Name',
          type: 'text',
          required: true,
          placeholder: 'The Electric Room',
          description: 'Official name of your venue'
        },
        {
          key: 'venue_type',
          label: 'Venue Type',
          type: 'select',
          required: true,
          description: 'What type of venue is this?',
          options: VENUE_TYPE_OPTIONS
        },
        {
          key: 'capacity',
          label: 'Maximum Capacity',
          type: 'number',
          required: true,
          placeholder: '300',
          description: 'Maximum number of guests allowed',
          validation: {
            min: 1,
            max: 50000
          }
        },
        {
          key: 'address',
          label: 'Full Address',
          type: 'textarea',
          required: true,
          placeholder: '123 Ocean Drive, Miami Beach, FL 33139',
          description: 'Complete venue address including zip code'
        },
        {
          key: 'booking_email',
          label: 'Booking Email',
          type: 'text',
          required: true,
          placeholder: 'bookings@electricroom.com',
          description: 'Email address for event bookings and inquiries'
        }
      ]
    },
    // Amenities & Features
    {
      id: 'amenities',
      title: 'Venue Features & Amenities',
      description: 'What amenities does your venue offer?',
      icon: 'Star',
      fields: [
        {
          key: 'amenities',
          label: 'Available Amenities',
          type: 'multiselect',
          required: true,
          description: 'Select all amenities your venue provides',
          options: AMENITIES_OPTIONS
        },
        {
          key: 'description',
          label: 'Detailed Venue Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your venue atmosphere, unique features, layout, and what makes it special...',
          description: 'Detailed description highlighting what makes your venue unique',
          validation: {
            minLength: 50,
            maxLength: 1000
          }
        }
      ]
    }
  ],

  attendee: [
    // Basic Information
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      icon: 'User',
      fields: [
        {
          key: 'bio',
          label: 'About You',
          type: 'textarea',
          required: true,
          placeholder: 'Tell others about your music interests and event preferences...',
          description: 'A brief description about yourself and your music taste',
          validation: {
            minLength: 20,
            maxLength: 500
          }
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'phone',
          required: false,
          placeholder: '+1 (555) 123-4567',
          description: 'Optional contact number'
        },
        {
          key: 'location',
          label: 'Location',
          type: 'text',
          required: true,
          placeholder: 'City, State',
          description: 'Your current location for event recommendations'
        },
        {
          key: 'website',
          label: 'Website/Social',
          type: 'text',
          required: false,
          placeholder: 'https://instagram.com/username',
          description: 'Your personal website or main social media'
        }
      ]
    },
    // Music Preferences
    {
      id: 'preferences',
      title: 'Music & Event Preferences',
      description: 'Help us personalize your experience',
      icon: 'Heart',
      fields: [
        {
          key: 'favorite_genres',
          label: 'Favorite Music Genres',
          type: 'multiselect',
          required: true,
          description: 'Select your favorite music genres (choose as many as you like)',
          options: GENRE_OPTIONS
        },
        {
          key: 'music_discovery_preference',
          label: 'Music Discovery Style',
          type: 'select',
          required: true,
          description: 'How do you like to discover new music?',
          options: [
            { value: 'popular', label: 'Popular hits and mainstream tracks' },
            { value: 'underground', label: 'Underground and emerging artists' },
            { value: 'balanced', label: 'Mix of both popular and underground music' }
          ]
        },
        {
          key: 'preferred_event_types',
          label: 'Preferred Event Types',
          type: 'multiselect',
          required: false,
          description: 'What types of events do you enjoy attending? (optional)',
          options: EVENT_TYPE_OPTIONS
        },
        {
          key: 'typical_budget_range',
          label: 'Typical Event Budget',
          type: 'select',
          required: false,
          description: 'Your usual spending range for events and song requests (optional)',
          options: [
            { value: 'under_50', label: 'Under $50 per event' },
            { value: '50_100', label: '$50 - $100 per event' },
            { value: '100_200', label: '$100 - $200 per event' },
            { value: '200_plus', label: '$200+ per event' }
          ]
        }
      ]
    }
  ]
}

// Main function to get profile sections based on role
export const getProfileSectionsForRole = (role: UserRole): ProfileSectionConfig[] => {
  return ROLE_FIELDS[role] || [getBasicProfileSection()]
}

// Helper function to get all required fields for a role
export const getRequiredFieldsForRole = (role: UserRole): string[] => {
  const sections = getProfileSectionsForRole(role)
  const requiredFields: string[] = []
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.required) {
        requiredFields.push(field.key)
      }
    })
  })
  
  return requiredFields
}

// Helper function to get all fields for a role
export const getAllFieldsForRole = (role: UserRole): string[] => {
  const sections = getProfileSectionsForRole(role)
  const allFields: string[] = []
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      allFields.push(field.key)
    })
  })
  
  return allFields
} 