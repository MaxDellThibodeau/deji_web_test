import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { X, AlertCircle, CheckCircle, User } from "lucide-react"

import { useAuthStore } from "../stores/auth-store"
import { ProfileCompletionWizard } from "./profile-completion-wizard"
import { ProfileCompletionProgress } from "./profile-completion-progress"
import { calculateProfileCompletion, shouldShowCompletionPrompt, getCompletionStatusMessage, getNextRecommendedAction } from "../utils/profile-completion-tracker"

interface ProfileCompletionPromptProps {
  showDismiss?: boolean
  variant?: 'banner' | 'card' | 'inline'
  className?: string
}

export function ProfileCompletionPrompt({ 
  showDismiss = true, 
  variant = 'banner',
  className = '' 
}: ProfileCompletionPromptProps) {
  const { user } = useAuthStore()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (!user || isDismissed) return null

  // Calculate profile completion
  const completion = calculateProfileCompletion(user)
  
  // Don't show if profile is complete or if we shouldn't show prompt
  if (!shouldShowCompletionPrompt(completion)) return null

  const statusMessage = getCompletionStatusMessage(completion)
  const nextAction = getNextRecommendedAction(completion, user.role)

  const handleOpenWizard = () => {
    setIsWizardOpen(true)
  }

  const handleWizardComplete = () => {
    setIsDismissed(true)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Banner variant - for top of dashboard
  if (variant === 'banner') {
    return (
      <>
        <Alert className={`bg-purple-900/20 border-purple-500/50 ${className}`}>
          <AlertCircle className="h-4 w-4 text-purple-400" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-white font-medium">{statusMessage}</span>
              <span className="text-gray-300 ml-2">{nextAction}</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-purple-300">
                {Math.round(completion.percentage)}% complete
              </span>
              <Button 
                size="sm" 
                onClick={handleOpenWizard}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Complete Profile
              </Button>
              {showDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <ProfileCompletionWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      </>
    )
  }

  // Card variant - for sidebar or dashboard cards
  if (variant === 'card') {
    return (
      <>
        <Card className={`bg-zinc-900 border-zinc-700 ${className}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base text-white">Profile Setup</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {statusMessage}
              </CardDescription>
            </div>
            {showDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ProfileCompletionProgress
              completion={completion}
              onOpenWizard={handleOpenWizard}
              variant="compact"
              showMissingFields={false}
            />
          </CardContent>
        </Card>

        <ProfileCompletionWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      </>
    )
  }

  // Inline variant - for profile pages
  return (
    <>
      <div className={`flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-700 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-full">
            <User className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">{statusMessage}</p>
            <p className="text-gray-400 text-sm">{nextAction}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-purple-300">
              {Math.round(completion.percentage)}% complete
            </p>
            <p className="text-xs text-gray-400">
              {completion.missingFields.length} field{completion.missingFields.length !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <Button 
            onClick={handleOpenWizard}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Complete
          </Button>
        </div>
      </div>

      <ProfileCompletionWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </>
  )
}

// Hook for easy integration
export function useProfileCompletionPrompt() {
  const { user } = useAuthStore()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const completion = user ? calculateProfileCompletion(user) : null
  const shouldShow = completion ? shouldShowCompletionPrompt(completion) : false

  const openWizard = () => setIsWizardOpen(true)
  const closeWizard = () => setIsWizardOpen(false)

  return {
    completion,
    shouldShow,
    isWizardOpen,
    openWizard,
    closeWizard,
    WizardComponent: () => user ? (
      <ProfileCompletionWizard
        isOpen={isWizardOpen}
        onClose={closeWizard}
        onComplete={closeWizard}
      />
    ) : null
  }
} 