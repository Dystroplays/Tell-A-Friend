"use client"

/**
 * Admin Notifications Component
 *
 * This client component displays notifications for administrators,
 * focusing on alerts that require attention such as pending referrals
 * and reward approvals.
 *
 * Features:
 * - Displays system notifications for admins
 * - Highlights pending approval requests
 * - Allows marking notifications as read
 * - Provides quick access to relevant sections of the admin dashboard
 */

import { useState, useEffect } from "react"
import {
  getUserNotificationsAction,
  markAllNotificationsReadAction
} from "@/actions/db/notifications-actions"
import { SelectNotification } from "@/db/schema/notifications-schema"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotificationList from "@/components/notification/notification-list"
import { toast } from "@/components/ui/use-toast"

interface AdminNotificationsProps {
  adminId: string
  className?: string
}

export default function AdminNotifications({
  adminId,
  className = ""
}: AdminNotificationsProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  // Fetch unread notification count when component mounts
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await getUserNotificationsAction(adminId, 100, false)
        if (result.isSuccess) {
          setUnreadCount(result.data.length)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnreadCount()
  }, [adminId])

  // Handle marking all notifications as read
  const handleMarkAllRead = async () => {
    try {
      setIsMarkingRead(true)
      const result = await markAllNotificationsReadAction(adminId)

      if (result.isSuccess) {
        setUnreadCount(0)
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
      console.error("Error marking notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      })
    } finally {
      setIsMarkingRead(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Admin Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-6 px-2">
                {unreadCount}
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingRead}
            >
              {isMarkingRead ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 size-4" />
              )}
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          System notifications and approval requests
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="unread">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <span className="bg-tell-a-friend-green ml-2 flex size-6 items-center justify-center rounded-full text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            <NotificationList userId={adminId} includeRead={false} limit={20} />
          </TabsContent>

          <TabsContent value="all">
            <NotificationList userId={adminId} includeRead={true} limit={30} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t p-4">
        <p className="text-muted-foreground text-sm">
          Notifications are automatically generated for new referrals, rewards
          pending approval, and system events.
        </p>
      </CardFooter>
    </Card>
  )
}
