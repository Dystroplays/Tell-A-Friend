"use client"

/**
 * Reward Approval Component
 *
 * This client component provides an interface for admins to approve or reject
 * pending rewards. It displays reward details along with associated purchase
 * information to help admins make informed decisions.
 *
 * Features:
 * - Displays pending rewards with purchase information
 * - Allows approving or rejecting rewards with optional notes
 * - Shows reward type and value
 * - Provides filtering and sorting capabilities
 * - Sends notifications upon approval or rejection
 *
 * @module app/admin/_components/reward-approval
 */

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import {
  getPendingRewardsAction,
  updateRewardStatusAction
} from "@/actions/db/rewards-actions"
import { sendRewardApprovedNotificationAction } from "@/actions/notifications/send-notification-action"
import { toast } from "@/components/ui/use-toast"
import { SelectReward } from "@/db/schema/rewards-schema"
import { formatCurrency } from "@/lib/utils"

/**
 * Interface for rewards with extended information from related tables
 */
interface ExtendedReward extends SelectReward {
  purchase?: {
    amount: string
    createdAt: Date
    customer?: {
      name: string
      email: string
    }
  }
  referrer?: {
    name: string
    email: string
    phone: string
  }
}

export default function RewardApproval() {
  // State for rewards and UI elements
  const [pendingRewards, setPendingRewards] = useState<ExtendedReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<ExtendedReward | null>(
    null
  )
  const [reviewNotes, setReviewNotes] = useState("")
  const [actionInProgress, setActionInProgress] = useState(false)

  // Fetch pending rewards on component mount
  useEffect(() => {
    const fetchPendingRewards = async () => {
      try {
        setIsLoading(true)
        const result = await getPendingRewardsAction()

        if (result.isSuccess) {
          setPendingRewards(result.data as ExtendedReward[])
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error fetching pending rewards:", error)
        toast({
          title: "Error",
          description: "Failed to load pending rewards",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingRewards()
  }, [])

  /**
   * Handle approving or rejecting a reward
   *
   * @param rewardId - ID of the reward to update
   * @param status - "approved" or "rejected"
   * @param notes - Optional review notes
   */
  const handleUpdateRewardStatus = async (
    rewardId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setActionInProgress(true)

      // Get the reward details before updating
      const reward = pendingRewards.find(r => r.id === rewardId)
      if (!reward) {
        throw new Error("Reward not found")
      }

      // Update the reward status
      const result = await updateRewardStatusAction(
        rewardId,
        status,
        reviewNotes
      )

      if (result.isSuccess) {
        // Update the local state to remove the processed reward
        setPendingRewards(prevRewards =>
          prevRewards.filter(reward => reward.id !== rewardId)
        )

        // Send notification to the referrer if approved
        if (status === "approved" && reward.referrer) {
          // Send notification about the approved reward
          await sendRewardApprovedNotificationAction(
            reward.referrerId,
            reward.referrer.name,
            reward.referrer.email,
            reward.referrer.phone,
            reward.rewardType,
            parseFloat(reward.rewardValue)
          )
        }

        toast({
          title: "Success",
          description: `Reward ${status === "approved" ? "approved" : "rejected"} successfully`
        })

        setSelectedReward(null)
        setReviewNotes("")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error ${status} reward:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} reward`,
        variant: "destructive"
      })
    } finally {
      setActionInProgress(false)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reward Approval</CardTitle>
        <CardDescription>
          Review and manage pending reward requests
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-muted-foreground mr-2 size-8 animate-spin" />
            <p className="text-muted-foreground">Loading pending rewards...</p>
          </div>
        ) : pendingRewards.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No pending rewards to review
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Purchase Amount</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRewards.map(reward => (
                <TableRow key={reward.id}>
                  <TableCell>{formatDate(reward.createdAt)}</TableCell>
                  <TableCell>{reward.referrer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {reward.purchase?.customer?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {reward.purchase
                      ? formatCurrency(parseFloat(reward.purchase.amount))
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10">
                      {formatCurrency(parseFloat(reward.rewardValue))} (
                      {reward.rewardType})
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReward(reward)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>

                      {selectedReward && selectedReward.id === reward.id && (
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Review Reward</DialogTitle>
                            <DialogDescription>
                              Review details and approve or reject this reward.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div>
                              <h3 className="mb-2 font-medium">
                                Reward Details
                              </h3>
                              <div className="rounded-md border p-3">
                                <div className="grid gap-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Type:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {reward.rewardType}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Value:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {formatCurrency(
                                        parseFloat(reward.rewardValue)
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Referrer:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {reward.referrer?.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Customer:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {reward.purchase?.customer?.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Purchase Date:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {reward.purchase
                                        ? formatDate(reward.purchase.createdAt)
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">
                                      Purchase Amount:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {reward.purchase
                                        ? formatCurrency(
                                            parseFloat(reward.purchase.amount)
                                          )
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="mb-2 font-medium">Review Notes</h3>
                              <Textarea
                                placeholder="Add optional notes explaining your decision..."
                                value={reviewNotes}
                                onChange={e => setReviewNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex sm:justify-between">
                            <Button
                              variant="destructive"
                              disabled={actionInProgress}
                              onClick={() =>
                                handleUpdateRewardStatus(reward.id, "rejected")
                              }
                            >
                              {actionInProgress ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 size-4" />
                              )}
                              Reject
                            </Button>

                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                disabled={actionInProgress}
                              >
                                Cancel
                              </Button>
                            </DialogClose>

                            <Button
                              variant="default"
                              className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90"
                              disabled={actionInProgress}
                              onClick={() =>
                                handleUpdateRewardStatus(reward.id, "approved")
                              }
                            >
                              {actionInProgress ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 size-4" />
                              )}
                              Approve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="justify-between border-t pt-5">
        <p className="text-muted-foreground text-sm">
          Total pending rewards: {pendingRewards.length}
        </p>

        <Button
          variant="outline"
          disabled={isLoading || pendingRewards.length === 0}
          onClick={() => window.location.reload()}
        >
          Refresh List
        </Button>
      </CardFooter>
    </Card>
  )
}
