"use client"

/**
 * Notification Bell Component
 *
 * This client component displays a notification bell with an unread count
 * and dropdown menu showing recent notifications.
 *
 * Features:
 * - Shows notification count badge for unread items
 * - Displays dropdown with recent notifications
 * - Provides quick mark-as-read functionality
 * - Links to full notification center
 */

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  getUserNotificationsAction,
  markNotificationReadAction
} from "@/actions/db/notifications-actions"
import { SelectNotification } from "@/db/schema/notifications-schema"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface NotificationBellProps {
  userId: string
  dashboardPath: string
}

export default function NotificationBell({
  userId,
  dashboardPath
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<SelectNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getUserNotificationsAction(userId, 5, false)
        if (result.isSuccess) {
          setNotifications(result.data)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Refresh notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000)

    return () => clearInterval(intervalId)
  }, [userId])

  // Handle marking a notification as read
  const handleMarkRead = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation() // Prevent dropdown from closing

    try {
      const result = await markNotificationReadAction(notificationId)

      if (result.isSuccess) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(
            notification => notification.id !== notificationId
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Format notification time
  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {notifications.length > 0 && (
            <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-xs font-bold">
              {notifications.length > 9 ? "9+" : notifications.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <span className="bg-primary text-primary-foreground ml-2 flex size-5 items-center justify-center rounded-full text-xs font-bold">
              {notifications.length}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <DropdownMenuItem disabled>Loading notifications...</DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        ) : (
          <>
            {notifications.slice(0, 5).map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className="focus:bg-accent flex flex-col items-start p-3"
              >
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={e => handleMarkRead(notification.id, e)}
                  >
                    Dismiss
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  {notification.message}
                </p>
                <span className="text-muted-foreground mt-1 text-xs">
                  {formatTime(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${dashboardPath}?tab=notifications`}
                className="cursor-pointer justify-center"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
