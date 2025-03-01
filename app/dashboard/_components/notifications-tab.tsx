"use client"

/**
 * Notifications Tab Component
 *
 * This client component displays the user's notifications in the dashboard.
 * It shows recent notifications and provides options to view more or mark them as read.
 *
 * Features:
 * - Displays recent notifications with visual indicators for unread items
 * - Integrates with the notification system
 * - Shows empty states when no notifications exist
 */

import { useState } from "react"
import { SelectNotification } from "@/db/schema/notifications-schema"
import { SelectUser } from "@/db/schema/users-schema"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotificationList from "@/components/notification/notification-list"

interface NotificationsTabProps {
  user: SelectUser
  initialNotifications?: SelectNotification[]
}

export default function NotificationsTab({
  user,
  initialNotifications = []
}: NotificationsTabProps) {
  const [notificationType, setNotificationType] = useState<"all" | "unread">(
    "unread"
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Notifications</CardTitle>
        <CardDescription>
          Stay updated with your referral activity and rewards
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs
          defaultValue="unread"
          onValueChange={value =>
            setNotificationType(value as "all" | "unread")
          }
          className="w-full"
        >
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="mt-0">
            <NotificationList userId={user.id} includeRead={false} limit={10} />
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <NotificationList userId={user.id} includeRead={true} limit={20} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
