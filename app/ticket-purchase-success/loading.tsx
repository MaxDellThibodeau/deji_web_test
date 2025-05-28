import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"

export default function TicketPurchaseSuccessLoading() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <Card className="border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
          </div>
          <CardTitle className="text-center text-2xl">Processing Your Purchase</CardTitle>
          <CardDescription className="text-center">Please wait while we confirm your payment...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex justify-center">
          <div className="h-32 flex items-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
