"use client"

/**
 * Share Referral Component
 *
 * This client component provides multiple ways for users to share their
 * referral code with friends, including copy to clipboard, email, SMS,
 * and social media sharing.
 *
 * Features:
 * - Copy referral link to clipboard
 * - Share via email with pre-populated template
 * - Share via SMS with pre-populated message
 * - Share via social media platforms
 *
 * @module app/dashboard/_components/share-referral
 */

import { useState } from "react"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatReferralCode } from "@/lib/referral-utils"
import { toast } from "@/components/ui/use-toast"
import {
  Copy,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle2
} from "lucide-react"

interface ShareReferralProps {
  referralCode: string
  name: string
}

export default function ShareReferral({
  referralCode,
  name
}: ShareReferralProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [customMessage, setCustomMessage] = useState(
    `Hey! I just used a great home service and wanted to share a special discount with you. Use my referral code ${formatReferralCode(referralCode)} when you book a service.`
  )

  // Build the referral link
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://tell-a-friend.vercel.app"
  const referralLink = `${baseUrl}/signup?referral=${referralCode}`

  // Handle copying the link to clipboard
  const handleCopyLink = () => {
    copyToClipboard(referralLink)
    toast({
      title: "Link copied!",
      description: "Referral link copied to clipboard"
    })
  }

  // Handle copying the code to clipboard
  const handleCopyCode = () => {
    copyToClipboard(formatReferralCode(referralCode))
    toast({
      title: "Code copied!",
      description: "Referral code copied to clipboard"
    })
  }

  // Handle email share
  const handleEmailShare = () => {
    const subject = encodeURIComponent("Special offer from a friend")
    const body = encodeURIComponent(
      customMessage + `\n\nSign up here: ${referralLink}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  // Handle SMS share
  const handleSMSShare = () => {
    // On mobile, this will open the native SMS app
    // On desktop, this may not work on all browsers
    const message = encodeURIComponent(
      customMessage + `\n\nSign up here: ${referralLink}`
    )
    window.open(`sms:?body=${message}`, "_blank")
  }

  // Handle social media shares
  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      "_blank"
    )
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(referralLink)}`,
      "_blank"
    )
  }

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      "_blank"
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Referral Code</CardTitle>
        <CardDescription>
          Invite friends and earn rewards when they use your referral code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Your Referral Code</h3>
            <div className="flex gap-2">
              <Input
                value={formatReferralCode(referralCode)}
                readOnly
                className="font-mono text-lg"
              />
              <Button onClick={handleCopyCode} variant="outline">
                {isCopied ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Your Referral Link</h3>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline">
                {isCopied ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="message">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="message">Customize Message</TabsTrigger>
              <TabsTrigger value="email-sms">Email & SMS</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>

            <TabsContent value="message" className="space-y-4 pt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Personalize your message
                </h3>
                <Textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message"
                  rows={4}
                />
                <p className="text-muted-foreground text-xs">
                  This message will be used when sharing via email, SMS, or
                  social media.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="email-sms" className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={handleEmailShare}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Mail className="size-4" />
                  Share via Email
                </Button>
                <Button
                  onClick={handleSMSShare}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <MessageSquare className="size-4" />
                  Share via SMS
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="social" className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  onClick={handleFacebookShare}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Facebook className="size-4" />
                  Facebook
                </Button>
                <Button
                  onClick={handleTwitterShare}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Twitter className="size-4" />
                  Twitter
                </Button>
                <Button
                  onClick={handleLinkedInShare}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Linkedin className="size-4" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-muted-foreground text-sm">
          You earn rewards when friends use your code
        </p>
        <Button
          onClick={handleCopyLink}
          className="bg-tell-a-friend-green hover:bg-tell-a-friend-green/90"
        >
          {isCopied ? "Copied!" : "Copy Link"}
        </Button>
      </CardFooter>
    </Card>
  )
}
