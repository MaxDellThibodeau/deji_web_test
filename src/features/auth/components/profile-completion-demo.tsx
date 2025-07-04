import React from 'react'
import { useProfileCompletion } from '../hooks/use-profile-completion'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'

/**
 * Demo component showing how to use the Zustand profile completion features
 * This demonstrates the various hooks and computed values available
 */
export const ProfileCompletionDemo: React.FC = () => {
  const {
    // State
    user,
    profileCompletion,
    roleSpecificData,
    
    // Computed values
    percentage,
    isComplete,
    shouldShowPrompt,
    missingFields,
    prioritizedMissingFields,
    statusMessage,
    nextAction,
    
    // Actions
    updateCompletion,
    loadRoleData,
    refresh,
    
    // Utilities
    getProgressColor,
    getProgressVariant,
  } = useProfileCompletion()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please log in to see profile completion.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Status</CardTitle>
          <CardDescription>
            Current completion for {user.name} ({user.role})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Status Message */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{statusMessage}</p>
          </div>

          {/* Next Action */}
          <div className="p-3 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Next:</strong> {nextAction}
            </p>
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? 'default' : 'secondary'}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Badge>
            <Badge variant={shouldShowPrompt ? 'destructive' : 'outline'}>
              {shouldShowPrompt ? 'Show Prompt' : 'No Prompt'}
            </Badge>
            <Badge variant="outline" className={`border-${getProgressColor()}-500`}>
              {getProgressVariant()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Fields ({missingFields.length})</CardTitle>
            <CardDescription>
              Fields that need to be completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">All Missing:</h4>
                <div className="flex flex-wrap gap-1">
                  {missingFields.map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Prioritized:</h4>
                <div className="flex flex-wrap gap-1">
                  {prioritizedMissingFields.map((field, index) => (
                    <Badge 
                      key={field} 
                      variant={index < 3 ? 'destructive' : 'outline'} 
                      className="text-xs"
                    >
                      {index + 1}. {field}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Profile Completion:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(profileCompletion, null, 2)}
              </pre>
            </div>
            
            {roleSpecificData && (
              <div>
                <h4 className="text-sm font-medium mb-2">Role-Specific Data:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(roleSpecificData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={refresh} variant="outline" size="sm">
              Refresh Completion
            </Button>
            <Button onClick={loadRoleData} variant="outline" size="sm">
              Load Role Data
            </Button>
            <Button 
              onClick={() => updateCompletion()} 
              variant="outline" 
              size="sm"
            >
              Update Completion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 