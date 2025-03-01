"use client"

/**
 * My Rewards Component
 *
 * This component displays a customer's rewards history, showing both
 * approved and pending rewards with their status and relevant information.
 *
 * Features:
 * - Shows reward status (pending, approved, rejected)
 * - Displays reward amount and type
 * - Shows date of reward creation
 * - Provides filtering capability
 *
 * @module app/dashboard/_components/my-rewards
 */

import { useState } from "react"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SelectReward } from "@/db/schema/rewards-schema"
import { SelectPurchase } from "@/db/schema/purchases-schema"
import { formatCurrency } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

interface MyRewardsProps {
  rewards: SelectReward[]
  purchases: SelectPurchase[]
}

type FilterStatus = "all" | "pending" | "approved" | "rejected"

export default function MyRewards({ rewards, purchases }: MyRewardsProps) {
  const [filter, setFilter] = useState<FilterStatus>("all")

  // Get the purchase associated with each reward
  const rewardsWithPurchase = rewards.map(reward => {
    const purchase = purchases.find(p => p.id === reward.purchaseId)
    return { ...reward, purchase }
  })

  // Filter rewards based on selected status
  const filteredRewards =
    filter === "all"
      ? rewardsWithPurchase
      : rewardsWithPurchase.filter(reward => reward.status === filter)

  // Sort rewards by date (most recent first)
  const sortedRewards = [...filteredRewards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate total approved rewards value
  const totalApprovedRewardsValue = rewards
    .filter(reward => reward.status === "approved")
    .reduce((sum, reward) => sum + parseFloat(reward.rewardValue), 0)

  // Format date for display
  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <CardTitle>My Rewards</CardTitle>
            <CardDescription>
              View your earned rewards and their status
            </CardDescription>
          </div>
          <div className="mt-4 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 size-4" />
                  Filter: {filter === "all" ? "All" : filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("approved")}>
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedRewards.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {filter === "all"
                ? "You don't have any rewards yet"
                : `No ${filter} rewards found`}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purchase</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRewards.map(reward => (
                <TableRow key={reward.id}>
                  <TableCell>{formatDate(reward.createdAt)}</TableCell>
                  <TableCell>
                    {formatCurrency(parseFloat(reward.rewardValue))}
                  </TableCell>
                  <TableCell className="capitalize">
                    {reward.rewardType}
                  </TableCell>
                  <TableCell>
                    {reward.purchase
                      ? formatCurrency(parseFloat(reward.purchase.amount))
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reward.status === "approved"
                          ? "default"
                          : reward.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                      className={
                        reward.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : ""
                      }
                    >
                      {reward.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-6 rounded-md border p-4">
          <div className="flex justify-between">
            <span className="font-medium">Total Approved Rewards:</span>
            <span className="text-tell-a-friend-green font-bold">
              {formatCurrency(totalApprovedRewardsValue)}
            </span>
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            <p>
              Pending rewards require admin approval before being finalized.
              Approved rewards are ready for redemption.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
