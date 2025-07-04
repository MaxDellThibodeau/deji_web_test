import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Switch } from "@/shared/components/ui/switch"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { toast } from "sonner"
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User, 
  Music, 
  Building, 
  Heart, 
  Star, 
  Share2,
  Loader2,
  X
} from "lucide-react"

import { useAuthStore } from "../stores/auth-store"
import { getProfileSectionsForRole, getRequiredFieldsForRole } from "../utils/profile-field-configs"
import { getSectionValidationSchema } from "../utils/profile-validation"
import { createClientClient } from "@/shared/services/client"
import { ProfileSectionConfig, ProfileFieldConfig, ProfileWizardData } from "../types/profile-completion"

interface ProfileCompletionWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  initialStep?: string
}

// Icon mapping for sections
const iconMap = {
  User,
  Music,
  Building,
  Heart,
  Star,
  Share2
}

export function ProfileCompletionWizard({
  isOpen,
  onClose,
  onComplete,
  initialStep
}: ProfileCompletionWizardProps) {
  const { user, refreshUser } = useAuthStore()
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProfileWizardData>({})
  
  const userRole = user?.role || 'attendee'
  const sections = getProfileSectionsForRole(userRole)
  const currentSection = sections[currentSectionIndex]
  
  // Set initial step if provided
  useEffect(() => {
    if (initialStep) {
      const stepIndex = sections.findIndex(section => section.id === initialStep)
      if (stepIndex !== -1) {
        setCurrentSectionIndex(stepIndex)
      }
    }
  }, [initialStep, sections])

  // Form setup with validation
  const validationSchema = currentSection 
    ? getSectionValidationSchema(userRole, currentSection.id)
    : undefined
    
  const form = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    defaultValues: formData,
    mode: 'onChange'
  })

  // Load existing user data into form
  useEffect(() => {
    if (user && isOpen) {
      const existingData: ProfileWizardData = {
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        // Add other fields as they exist in user object
      }
      setFormData(existingData)
      form.reset(existingData)
    }
  }, [user, isOpen, form])

  // Calculate progress
  const requiredFields = getRequiredFieldsForRole(userRole)
  const completedFields = requiredFields.filter(field => {
    const value = formData[field as keyof ProfileWizardData]
    return value !== undefined && value !== null && value !== ''
  })
  const progressPercentage = (completedFields.length / requiredFields.length) * 100

  // Navigate between sections
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  // Handle section completion
  const handleSectionSubmit = async (data: any) => {
    const updatedFormData = { ...formData, ...data }
    setFormData(updatedFormData)

    // Save current section data to backend
    await saveProfileData(updatedFormData)

    // If this is the last section, complete the wizard
    if (currentSectionIndex === sections.length - 1) {
      await handleWizardComplete()
    } else {
      goToNextSection()
    }
  }

  // Save profile data to Supabase
  const saveProfileData = async (data: ProfileWizardData) => {
    try {
      const supabase = createClientClient()
      if (!supabase || !user) return

      // Prepare data for database update
      const profileUpdate = {
        bio: data.bio,
        phone: data.phone,
        location: data.location,
        website: data.website,
        updated_at: new Date().toISOString()
      }

      // Update main profile
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to save profile data')
        return
      }

      // Handle role-specific data
      await saveRoleSpecificData(data)

    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile data')
    }
  }

  // Save role-specific data to appropriate tables
  const saveRoleSpecificData = async (data: ProfileWizardData) => {
    const supabase = createClientClient()
    if (!supabase || !user) return

    try {
      if (userRole === 'dj') {
        // Save DJ-specific data
        const djData = {
          profile_id: user.id,
          stage_name: data.stage_name,
          genres: data.genres,
          experience_years: data.experience_years,
          hourly_rate: data.hourly_rate,
          equipment_provided: data.equipment_provided,
          social_links: data.social_links,
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('dj_profiles')
          .upsert(djData)

      } else if (userRole === 'venue') {
        // Save venue-specific data
        const venueData = {
          profile_id: user.id,
          venue_name: data.venue_name,
          venue_type: data.venue_type,
          capacity: data.capacity,
          address: data.address,
          booking_email: data.booking_email,
          description: data.description,
          amenities: data.amenities,
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('venue_profiles')
          .upsert(venueData)

      } else if (userRole === 'attendee') {
        // Save attendee-specific data
        const attendeeData = {
          profile_id: user.id,
          favorite_genres: data.favorite_genres,
          music_discovery_preference: data.music_discovery_preference,
          preferred_event_types: data.preferred_event_types,
          typical_budget_range: data.typical_budget_range,
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('attendee_profiles')
          .upsert(attendeeData)
      }
    } catch (error) {
      console.error('Error saving role-specific data:', error)
    }
  }

  // Complete the wizard
  const handleWizardComplete = async () => {
    setIsSubmitting(true)
    try {
      await refreshUser()
      toast.success('Profile completed successfully!')
      onComplete()
      onClose()
    } catch (error) {
      console.error('Error completing wizard:', error)
      toast.error('Failed to complete profile setup')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render form field based on type
  const renderFormField = (field: ProfileFieldConfig) => {
    const { key, label, type, placeholder, description, options, required } = field

    return (
      <FormField
        key={key}
        control={form.control}
        name={key}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel className="text-white">
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {type === 'text' && (
                <Input 
                  placeholder={placeholder}
                  {...formField}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              )}
              {type === 'textarea' && (
                <Textarea 
                  placeholder={placeholder}
                  {...formField}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
                />
              )}
              {type === 'phone' && (
                <Input 
                  type="tel"
                  placeholder={placeholder}
                  {...formField}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              )}
              {type === 'number' && (
                <Input 
                  type="number"
                  placeholder={placeholder}
                  {...formField}
                  onChange={(e) => formField.onChange(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              )}
              {type === 'select' && (
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {type === 'multiselect' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-zinc-800 border border-zinc-700 rounded-md">
                    {formField.value?.length > 0 ? (
                      formField.value.map((selectedValue: string) => {
                        const option = options?.find(opt => opt.value === selectedValue)
                        return (
                          <Badge
                            key={selectedValue}
                            variant="secondary"
                            className="bg-purple-600 text-white"
                          >
                            {option?.label || selectedValue}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => {
                                const newValue = formField.value.filter((v: string) => v !== selectedValue)
                                formField.onChange(newValue)
                              }}
                            />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-gray-400 text-sm">Select {label.toLowerCase()}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formField.value?.includes(option.value) || false}
                          onCheckedChange={(checked) => {
                            const currentValue = formField.value || []
                            if (checked) {
                              formField.onChange([...currentValue, option.value])
                            } else {
                              formField.onChange(currentValue.filter((v: string) => v !== option.value))
                            }
                          }}
                        />
                        <label className="text-sm text-white">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {type === 'toggle' && (
                <Switch
                  checked={formField.value || false}
                  onCheckedChange={formField.onChange}
                />
              )}
            </FormControl>
            {description && (
              <FormDescription className="text-gray-400">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
        <DialogHeader className="border-b border-zinc-700 pb-4">
          <DialogTitle className="text-white text-xl">
            Complete Your {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile
          </DialogTitle>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </DialogHeader>

        {/* Section navigation tabs */}
        <Tabs value={currentSection?.id} className="w-full">
          <TabsList className="grid w-full bg-zinc-800" style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}>
            {sections.map((section, index) => {
              const IconComponent = iconMap[section.icon as keyof typeof iconMap] || User
              const isCompleted = index < currentSectionIndex
              const isCurrent = index === currentSectionIndex
              
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={`data-[state=active]:bg-purple-600 ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-400'
                  }`}
                  onClick={() => setCurrentSectionIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{section.title}</span>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Current section content */}
          <TabsContent value={currentSection?.id || ''} className="mt-6">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">{currentSection?.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {currentSection?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSectionSubmit)} className="space-y-6">
                    {/* Form fields for current section */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {currentSection?.fields.map(renderFormField)}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-6 border-t border-zinc-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousSection}
                        disabled={currentSectionIndex === 0}
                        className="border-zinc-600 text-white hover:bg-zinc-700"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          className="border-zinc-600 text-white hover:bg-zinc-700"
                        >
                          Save & Exit
                        </Button>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : currentSectionIndex === sections.length - 1 ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2" />
                          )}
                          {currentSectionIndex === sections.length - 1 ? 'Complete Profile' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 