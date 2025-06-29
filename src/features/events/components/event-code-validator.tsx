"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface EventCodeValidatorProps {
  eventId: string
  onValidated: () => void
}

export function EventCodeValidator({ eventId, onValidated }: EventCodeValidatorProps) {
  const [code, setCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const value = e.target.value.toUpperCase().replace(/\s/g, "")
    setCode(value)

    // Reset validation result when code changes
    if (validationResult) {
      setValidationResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code) {
      setValidationResult({
        isValid: false,
        message: "Please enter an event code",
      })
      return
    }

    setIsValidating(true)

    try {
      // In a real implementation, this would validate against a database
      // For now, just simulate validation with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For testing, accept any 6-character code
      const isValid = code.length >= 4

      if (isValid) {
        setValidationResult({
          isValid: true,
          message: "Event code validated successfully!",
        })

        // Call the onValidated callback after a short delay
        setTimeout(() => {
          onValidated()
        }, 1500)
      } else {
        setValidationResult({
          isValid: false,
          message: "Invalid event code. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error validating event code:", error)
      setValidationResult({
        isValid: false,
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Enter Event Code</CardTitle>
        <CardDescription>Please enter the event code provided by the DJ or event organizer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-code">Event Code</Label>
              <Input
                id="event-code"
                placeholder="Enter code (e.g. ABC123)"
                value={code}
                onChange={handleCodeChange}
                className="text-center text-lg tracking-wider uppercase bg-zinc-800 border-zinc-700"
                maxLength={10}
                disabled={isValidating || validationResult?.isValid}
              />
            </div>

            {validationResult && (
              <Alert
                className={
                  validationResult.isValid ? "bg-green-900/20 border-green-500" : "bg-red-900/20 border-red-500"
                }
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{validationResult.isValid ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{validationResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isValidating || !code || validationResult?.isValid}
          onClick={handleSubmit}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : validationResult?.isValid ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Validated
            </>
          ) : (
            "Validate Code"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
