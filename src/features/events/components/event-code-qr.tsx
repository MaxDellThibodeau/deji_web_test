"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card"
import { Button } from "@/ui/button"
import { Download, Share2 } from "lucide-react"
import QRCode from "qrcode"

interface EventCodeQRProps {
  eventId: string
  eventName: string
  code: string
}

export function EventCodeQR({ eventId, eventName, code }: EventCodeQRProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    // Generate QR code
    async function generateQRCode() {
      try {
        // Create a URL that will redirect to the event page with the code
        const url = `${window.location.origin}/events/${eventId}/songs?code=${code}`

        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: "#ffffff",
            light: "#000000",
          },
        })

        setQrCodeUrl(dataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQRCode()
  }, [eventId, code])

  // Handle QR code download
  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `event-code-${code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle QR code sharing
  const handleShare = async () => {
    if (!qrCodeUrl || !navigator.share) return

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

      // Create file from blob
      const file = new File([blob], `event-code-${code}.png`, { type: "image/png" })

      // Share file
      await navigator.share({
        title: `Event Code for ${eventName}`,
        text: `Use code ${code} to access song requests`,
        files: [file],
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
    }
  }

  return (
    <Card className="w-full max-w-xs mx-auto bg-zinc-900 border-zinc-800">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Event Code</CardTitle>
        <CardDescription>Scan to access song requests</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qrCodeUrl ? (
          <div className="bg-black p-4 rounded-lg">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt={`QR Code for event code ${code}`}
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="w-full aspect-square bg-zinc-800 rounded-lg animate-pulse" />
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-400">Code:</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{code}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrCodeUrl}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {navigator.share && (
          <Button variant="outline" size="sm" onClick={handleShare} disabled={!qrCodeUrl}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
