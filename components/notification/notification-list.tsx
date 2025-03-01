"use client"

/**
 * Notification List Component
 *
 * This client component displays in-app notifications for the user.
 * It fetches notifications from the server and allows users to mark them as read.
 *
 * Features:
 * - Displays pending notifications with unread indicators
 * - Allows marking individual or all notifications as read
 * - Provides a clean, organized interface for viewing notifications
 * - Handles empty states and loading states
 */

import { useState, useEffect } from "react"
import {
  getUserNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction
} from "@/actions/db/notifications-actions"
import { SelectNotification } from "@/db/schema/notifications-schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Bell, BellOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

interface NotificationListProps {
  userId: string
  limit?: number
  includeRead?: boolean
  className?: string
}

export default function NotificationList({
  userId,
  limit = 10,
  includeRead = false,
  className = ""
}: NotificationListProps) {
  // State for notifications and loading status
  const [notifications, setNotifications] = useState<SelectNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  // Fetch notifications when component mounts or dependencies change
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const result = await getUserNotificationsAction(
          userId,
          limit,
          includeRead
        )
        if (result.isSuccess) {
          setNotifications(result.data)
        } else {
          console.error("Failed to fetch notifications:", result.message)
          toast({
            title: "Error",
            description: "Failed to load notifications",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [userId, limit, includeRead])

  // Handle marking a notification as read
  const handleMarkRead = async (notificationId: string) => {
    try {
      setIsMarkingRead(true)
      const result = await markNotificationReadAction(notificationId)

      if (result.isSuccess) {
        // Update local state to show the notification as read
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, status: "read" }
              : notification
          )
        )

        toast({
          title: "Success",
          description: "Notification marked as read"
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      })
    } finally {
      setIsMarkingRead(false)
    }
  }

  // Handle marking all notifications as read
  const handleMarkAllRead = async () => {
    try {
      setIsMarkingRead(true)
      const result = await markAllNotificationsReadAction(userId)

      if (result.isSuccess) {
        // Update local state to show all notifications as read
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            status: "read"
          }))
        )

        toast({
          title: "Success",
          description: "All notifications marked as read"
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      })
    } finally {
      setIsMarkingRead(false)
    }
  }

  // Format the notification time
  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  // Check if there are any pending (unread) notifications
  const hasPendingNotifications = notifications.some(
    notification => notification.status === "pending"
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Stay updated with important events
            </CardDescription>
          </div>
          {hasPendingNotifications && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingRead || isLoading}
            >
              <Check className="mr-2 size-4" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BellOff className="text-muted-foreground mb-2 size-10" />
            <p className="text-muted-foreground">No notifications to display</p>
          </div>
        ) : (
          // Notification list
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`relative flex items-start gap-4 rounded-lg p-3 transition-colors ${
                  notification.status === "pending" ? "bg-primary/5" : ""
                }`}
              >
                <Bell
                  className={`size-8 shrink-0 ${
                    notification.status === "pending"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />

                <div className="flex-1">
                  <h4 className="font-medium leading-tight">
                    {notification.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {notification.message}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>

                {notification.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={isMarkingRead}
                    className="absolute right-2 top-2"
                  >
                    <Check className="size-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-muted-foreground text-xs">
          {notifications.length}{" "}
          {notifications.length === 1 ? "notification" : "notifications"}
        </div>
        {notifications.length > 0 && !includeRead && (
          <Button variant="link" size="sm" className="h-auto p-0">
            View all notifications
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
