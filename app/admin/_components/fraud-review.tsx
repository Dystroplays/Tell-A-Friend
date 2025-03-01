"use client"

/**
 * Fraud Review Component
 *
 * This client component displays potentially fraudulent transactions for admin review.
 * It provides tools for administrators to investigate and make decisions on flagged
 * transactions based on various fraud indicators.
 *
 * Features:
 * - Displays transactions flagged by the fraud detection system
 * - Shows details about each flagged transaction including fraud indicators
 * - Provides options to approve, reject, or investigate further
 * - Visualizes fraud patterns and statistics
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFraudStatisticsAction } from "@/actions/fraud/fraud-detection-actions"
import { updatePurchaseStatusAction } from "@/actions/db/purchases-actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  Check,
  FileBadge,
  Shield,
  AlertTriangle,
  Loader2
} from "lucide-react"

/**
 * Mock data for flagged transactions
 * This would be replaced with actual data from the database in a real implementation
 */
const mockFlaggedTransactions = [
  {
    id: "1",
    date: "2023-09-15",
    amount: "$125.00",
    customerName: "John Smith",
    referrerName: "Mary Johnson",
    flagReason: "Multiple accounts from same IP",
    ipAddress: "192.168.1.1",
    status: "flagged"
  },
  {
    id: "2",
    date: "2023-09-14",
    amount: "$250.00",
    customerName: "Alice Brown",
    referrerName: "David Wilson",
    flagReason: "Unverified email address",
    ipAddress: "192.168.2.45",
    status: "flagged"
  },
  {
    id: "3",
    date: "2023-09-13",
    amount: "$75.00",
    customerName: "Robert Davis",
    referrerName: "Susan Miller",
    flagReason: "Potential self-referral",
    ipAddress: "192.168.3.22",
    status: "flagged"
  }
]

/**
 * Main fraud review component for the admin dashboard
 */
export default function FraudReview() {
  const [isLoading, setIsLoading] = useState(true)
  const [flaggedTransactions, setFlaggedTransactions] = useState(
    mockFlaggedTransactions
  )
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof mockFlaggedTransactions)[0] | null
  >(null)
  const [fraudStats, setFraudStats] = useState({
    flaggedTransactions: 0,
    totalReviewed: 0,
    averageFraudScore: 0
  })
  const [actionInProgress, setActionInProgress] = useState(false)

  // Fetch fraud statistics on mount
  useEffect(() => {
    const loadFraudStats = async () => {
      try {
        setIsLoading(true)
        const result = await getFraudStatisticsAction()

        if (result.isSuccess) {
          setFraudStats(result.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load fraud statistics",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error loading fraud stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFraudStats()
  }, [])

  /**
   * Handle approving a flagged transaction
   * This overrides the fraud detection system and allows the transaction
   *
   * @param id - ID of the transaction to approve
   */
  const handleApproveTransaction = async (id: string) => {
    try {
      setActionInProgress(true)

      // In a real implementation, this would call a server action to update the purchase
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the local state to reflect the change
      setFlaggedTransactions(prev =>
        prev.filter(transaction => transaction.id !== id)
      )

      toast({
        title: "Transaction Approved",
        description: "The transaction has been approved and will be processed",
        variant: "default"
      })

      setSelectedTransaction(null)
    } catch (error) {
      console.error("Error approving transaction:", error)
      toast({
        title: "Error",
        description: "Failed to approve transaction",
        variant: "destructive"
      })
    } finally {
      setActionInProgress(false)
    }
  }

  /**
   * Handle rejecting a flagged transaction
   * This confirms the transaction as fraudulent and blocks it
   *
   * @param id - ID of the transaction to reject
   */
  const handleRejectTransaction = async (id: string) => {
    try {
      setActionInProgress(true)

      // In a real implementation, this would call a server action to update the purchase
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the local state to reflect the change
      setFlaggedTransactions(prev =>
        prev.filter(transaction => transaction.id !== id)
      )

      toast({
        title: "Transaction Rejected",
        description: "The transaction has been rejected as fraudulent",
        variant: "default"
      })

      setSelectedTransaction(null)
    } catch (error) {
      console.error("Error rejecting transaction:", error)
      toast({
        title: "Error",
        description: "Failed to reject transaction",
        variant: "destructive"
      })
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Prevention</CardTitle>
        <CardDescription>
          Review and manage flagged transactions
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="flagged">
          <TabsList className="mb-4">
            <TabsTrigger value="flagged">Flagged Transactions</TabsTrigger>
            <TabsTrigger value="stats">Fraud Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="flagged">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-muted-foreground mr-2 size-8 animate-spin" />
                <p className="text-muted-foreground">
                  Loading flagged transactions...
                </p>
              </div>
            ) : flaggedTransactions.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center space-y-2">
                <Shield className="text-tell-a-friend-green size-12" />
                <p className="text-muted-foreground">
                  No flagged transactions to review
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.customerName}</TableCell>
                      <TableCell>{transaction.referrerName}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700"
                        >
                          {transaction.flagReason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          {selectedTransaction &&
                            selectedTransaction.id === transaction.id && (
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center">
                                    <AlertCircle className="mr-2 size-5 text-red-500" />
                                    Flagged Transaction
                                  </DialogTitle>
                                  <DialogDescription>
                                    Review the details of this flagged
                                    transaction
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <h3 className="text-sm font-medium">
                                      Transaction Details
                                    </h3>
                                    <div className="rounded-md border p-3">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground text-sm">
                                          Date:
                                        </div>
                                        <div className="text-sm">
                                          {transaction.date}
                                        </div>

                                        <div className="text-muted-foreground text-sm">
                                          Amount:
                                        </div>
                                        <div className="text-sm">
                                          {transaction.amount}
                                        </div>

                                        <div className="text-muted-foreground text-sm">
                                          Customer:
                                        </div>
                                        <div className="text-sm">
                                          {transaction.customerName}
                                        </div>

                                        <div className="text-muted-foreground text-sm">
                                          Referrer:
                                        </div>
                                        <div className="text-sm">
                                          {transaction.referrerName}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid gap-2">
                                    <h3 className="text-sm font-medium">
                                      Fraud Indicators
                                    </h3>
                                    <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                      <div className="flex items-start">
                                        <AlertTriangle className="mr-2 mt-0.5 size-4 text-red-500" />
                                        <div>
                                          <p className="text-sm font-medium text-red-600">
                                            {transaction.flagReason}
                                          </p>
                                          <p className="text-muted-foreground text-xs">
                                            IP Address: {transaction.ipAddress}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter className="flex sm:justify-between">
                                  <Button
                                    variant="destructive"
                                    disabled={actionInProgress}
                                    onClick={() =>
                                      handleRejectTransaction(transaction.id)
                                    }
                                  >
                                    {actionInProgress ? (
                                      <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                      <AlertTriangle className="mr-2 size-4" />
                                    )}
                                    Reject as Fraud
                                  </Button>

                                  <Button
                                    variant="default"
                                    className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90"
                                    disabled={actionInProgress}
                                    onClick={() =>
                                      handleApproveTransaction(transaction.id)
                                    }
                                  >
                                    {actionInProgress ? (
                                      <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                      <Check className="mr-2 size-4" />
                                    )}
                                    Approve Transaction
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
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <FileBadge className="mr-2 size-4" />
                    Flagged Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fraudStats.flaggedTransactions}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Transactions flagged for review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <AlertCircle className="mr-2 size-4" />
                    Total Reviewed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fraudStats.totalReviewed}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Transactions manually reviewed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <Shield className="mr-2 size-4" />
                    Average Fraud Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fraudStats.averageFraudScore.toFixed(2)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Higher scores indicate likely fraud
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 rounded-md border p-4">
              <h3 className="mb-2 text-sm font-medium">
                Fraud Prevention Tips
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Review flagged transactions promptly to minimize false
                    positives
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Multiple accounts from the same IP address are a common
                    indicator of fraud
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Self-referrals often involve the same person creating
                    multiple accounts
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Verify email addresses and phone numbers for suspicious
                    patterns
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="justify-between border-t pt-5">
        <p className="text-muted-foreground text-sm">
          All flagged transactions require manual review
        </p>

        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  )
}
