import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { CheckCircle, AlertCircle, User, ArrowRight } from "lucide-react"
import { ProfileCompletion } from "../types/profile-completion"

interface ProfileCompletionProgressProps {
  completion: ProfileCompletion
  onOpenWizard?: () => void
  showMissingFields?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'card' | 'compact' | 'minimal'
  className?: string
}

export function ProfileCompletionProgress({
  completion,
  onOpenWizard,
  showMissingFields = true,
  size = 'md',
  variant = 'card',
  className = ''
}: ProfileCompletionProgressProps) {
  const { percentage, missingFields, isComplete } = completion

  // Color scheme based on completion percentage
  const getProgressColor = () => {
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressBgColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Size variants
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  }

  // Circular progress component
  const CircularProgress = ({ size: circleSize }: { size: number }) => {
    const radius = (circleSize - 8) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={getProgressColor()}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${getProgressColor()}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    )
  }

  // Minimal variant - just the circular progress
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CircularProgress size={size === 'sm' ? 32 : size === 'md' ? 40 : 48} />
        <div className="text-sm text-gray-400">
          Profile {Math.round(percentage)}% complete
        </div>
      </div>
    )
  }

  // Compact variant - progress bar with action
  if (variant === 'compact') {
    return (
      <Card className={`bg-zinc-900 border-zinc-700 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-white">
                  Profile {Math.round(percentage)}% Complete
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                // @ts-ignore - custom progress bar styling
                indicatorClassName={getProgressBgColor()}
              />
              {!isComplete && (
                <p className="text-xs text-gray-400 mt-1">
                  {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
            {!isComplete && onOpenWizard && (
              <Button
                onClick={onOpenWizard}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Complete
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full card variant
  return (
    <Card className={`bg-zinc-900 border-zinc-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5" />
              Profile Completion
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isComplete 
                ? "Your profile is complete!" 
                : `${missingFields.length} field${missingFields.length !== 1 ? 's' : ''} remaining`
              }
            </CardDescription>
          </div>
          <CircularProgress size={size === 'sm' ? 48 : size === 'md' ? 64 : 80} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress bar */}
        <div className="mb-4">
          <Progress 
            value={percentage} 
            className="h-2"
            // @ts-ignore - custom progress bar styling
            indicatorClassName={getProgressBgColor()}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Completion status */}
        <div className="space-y-3">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Profile Complete</span>
            </div>
          ) : (
            <>
              {/* Missing fields */}
              {showMissingFields && missingFields.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">
                    Missing Information:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {missingFields.slice(0, 6).map((field) => (
                      <Badge
                        key={field}
                        variant="outline"
                        className="text-xs border-red-500/50 text-red-400"
                      >
                        {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                    {missingFields.length > 6 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-500 text-gray-400"
                      >
                        +{missingFields.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action button */}
              {onOpenWizard && (
                <Button
                  onClick={onOpenWizard}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Complete Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 