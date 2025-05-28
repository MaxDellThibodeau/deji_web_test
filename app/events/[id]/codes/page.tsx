"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Badge } from "@/ui/badge"
import { Calendar } from "@/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover"
import { CalendarIcon, Copy, Loader2, RefreshCw, XCircle } from "lucide-react"
import { format } from "date-fns"
import { createEventCodes, getEventCodes, deactivateEventCode } from "@/features/events/actions/event-code-actions"
import { useToast } from "@/hooks/use-toast"

export default function EventCodesPage() {
  const { id: eventId } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [codes, setCodes] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [maxUses, setMaxUses] = useState(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const { toast } = useToast()

  // Load event codes
  useEffect(() => {
    async function loadEventCodes() {
      setIsLoading(true)

      try {
        const result = await getEventCodes(eventId)

        if (result.success) {
          setCodes(result.codes)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load event codes",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading event codes:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading event codes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEventCodes()
  }, [eventId, toast])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("eventId", eventId)
      formData.append("quantity", quantity.toString())
      formData.append("maxUses", maxUses.toString())

      if (date) {
        formData.append("expirationDate", date.toISOString())
      }

      const result = await createEventCodes(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Generated ${result.codes.length} event code(s)`,
        })

        // Add the new codes to the list
        setCodes((prevCodes) => [...result.codes, ...prevCodes])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create event codes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating event codes:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating event codes",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle code deactivation
  const handleDeactivateCode = async (codeId: string) => {
    try {
      const result = await deactivateEventCode(codeId, eventId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Event code deactivated",
        })

        // Update the code in the list
        setCodes((prevCodes) => prevCodes.map((code) => (code.id === codeId ? { ...code, isActive: false } : code)))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to deactivate event code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deactivating event code:", error)
      toast({
        title: "Error",
        description: "An error occurred while deactivating the event code",
        variant: "destructive",
      })
    }
  }

  // Handle code copying
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)

    toast({
      title: "Copied",
      description: "Event code copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Event Codes</h1>

      <Tabs defaultValue="generate">
        <TabsList className="mb-6">
          <TabsTrigger value="generate">Generate Codes</TabsTrigger>
          <TabsTrigger value="manage">Manage Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Event Codes</CardTitle>
              <CardDescription>Create unique codes for attendees to access song requests</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-uses">Max Uses Per Code</Label>
                      <Input
                        id="max-uses"
                        type="number"
                        min="1"
                        value={maxUses}
                        onChange={(e) => setMaxUses(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Expiration Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Codes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Event Codes</CardTitle>
              <CardDescription>View, copy, and deactivate event codes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No event codes found. Generate some codes to get started.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-medium">{code.code}</TableCell>
                          <TableCell>
                            {code.isActive ? (
                              <Badge className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge className="bg-zinc-600">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {code.currentUses} / {code.maxUses || "∞"}
                          </TableCell>
                          <TableCell>{code.expiresAt ? format(new Date(code.expiresAt), "PPP") : "Never"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleCopyCode(code.code)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              {code.isActive && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 border-red-500 hover:bg-red-950"
                                  onClick={() => handleDeactivateCode(code.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
