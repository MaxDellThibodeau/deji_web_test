"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/ui/card"
import { Button } from "@/ui/button"

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock events data
  const events = [
    {
      id: "event1",
      title: "Techno Tuesday",
      date: new Date(2025, 4, 19), // May 19, 2025
      time: "10:00 PM - 2:00 AM",
      venue: "Underground Club",
      address: "123 Main St, Los Angeles, CA",
      fee: "$500",
      status: "Confirmed",
    },
    {
      id: "event2",
      title: "Weekend Party",
      date: new Date(2025, 4, 24), // May 24, 2025
      time: "11:00 PM - 3:00 AM",
      venue: "Skyline Lounge",
      address: "456 High St, Los Angeles, CA",
      fee: "$750",
      status: "Pending",
    },
    {
      id: "event3",
      title: "Summer Festival",
      date: new Date(2025, 5, 15), // June 15, 2025
      time: "4:00 PM - 6:00 PM",
      venue: "City Park",
      address: "789 Park Ave, Los Angeles, CA",
      fee: "$1,200",
      status: "Confirmed",
    },
  ]

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Create calendar days array
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Get events for the current day
  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      return event.date.getFullYear() === year && event.date.getMonth() === month && event.date.getDate() === day
    })
  }

  // Format month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8 bg-gray-900 text-white">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-semibold">Calendar</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-32 text-center text-lg">
                {monthNames[month]} {year}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-400">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const eventsForDay = day ? getEventsForDay(day) : []
              const hasEvents = eventsForDay.length > 0

              return (
                <div
                  key={index}
                  className={`min-h-24 rounded-lg border ${day ? "border-gray-800" : "border-transparent"} p-1`}
                >
                  {day && (
                    <div className="h-full">
                      <div className="mb-1 flex items-center justify-between p-1">
                        <span className={`text-sm ${hasEvents ? "font-bold text-white" : "text-gray-400"}`}>{day}</span>
                        {hasEvents && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-900 text-xs font-bold text-white">
                            {eventsForDay.length}
                          </span>
                        )}
                      </div>

                      {hasEvents && (
                        <div className="space-y-1">
                          {eventsForDay.map((event) => (
                            <div
                              key={event.id}
                              className={`rounded p-1 text-xs ${
                                event.status === "Confirmed"
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-yellow-900/30 text-yellow-400"
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 text-white">
        <CardContent className="p-6">
          <h2 className="mb-6 text-2xl font-semibold">Upcoming Events</h2>

          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-gray-800 bg-black p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      event.status === "Confirmed"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="mb-3 space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {event.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.venue} - {event.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-400">{event.fee}</span>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
