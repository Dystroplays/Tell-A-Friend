"use client"

/**
 * Referral Statistics Component
 *
 * This client component displays detailed statistics about a customer's referrals
 * and rewards, including charts and tables for visualization.
 *
 * Features:
 * - Displays referrals over time
 * - Shows reward status breakdown
 * - Lists recent referral activity
 *
 * @module app/dashboard/_components/referral-stats
 */

import { SelectPurchase } from "@/db/schema/purchases-schema"
import { SelectReward } from "@/db/schema/rewards-schema"
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
import { format } from "date-fns"
import { TrendingUp, Award, DollarSign } from "lucide-react"

interface ReferralStatsProps {
  purchases: SelectPurchase[]
  rewards: SelectReward[]
}

export default function ReferralStats({
  purchases,
  rewards
}: ReferralStatsProps) {
  // Sort purchases by date (most recent first)
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate total reward value
  const totalRewardValue = rewards
    .filter(reward => reward.status === "approved")
    .reduce((sum, reward) => sum + Number(reward.rewardValue), 0)

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral Performance</CardTitle>
          <CardDescription>
            Detailed statistics about your referrals and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-md border p-4">
              <TrendingUp className="text-tell-a-friend-green size-10" />
              <h3 className="text-lg font-medium">Referral Rate</h3>
              <p className="text-3xl font-bold">
                {purchases.length > 0
                  ? (
                      (purchases.filter(p => p.status === "completed").length /
                        purchases.length) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </p>
              <p className="text-muted-foreground text-sm">
                of referrals converted
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 rounded-md border p-4">
              <Award className="text-tell-a-friend-green size-10" />
              <h3 className="text-lg font-medium">Rewards</h3>
              <p className="text-3xl font-bold">
                {rewards.filter(r => r.status === "approved").length} /{" "}
                {rewards.length}
              </p>
              <p className="text-muted-foreground text-sm">
                approved / total rewards
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2 rounded-md border p-4">
              <DollarSign className="text-tell-a-friend-green size-10" />
              <h3 className="text-lg font-medium">Earnings</h3>
              <p className="text-3xl font-bold">
                ${totalRewardValue.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-sm">total earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Referral Activity</CardTitle>
          <CardDescription>Your most recent referral purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPurchases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPurchases.slice(0, 5).map(purchase => {
                  // Find associated reward if any
                  const relatedReward = rewards.find(
                    r => r.purchaseId === purchase.id
                  )

                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {format(new Date(purchase.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        ${Number(purchase.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            purchase.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : purchase.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {relatedReward ? (
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              relatedReward.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : relatedReward.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {relatedReward.status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center">No referral activity yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
