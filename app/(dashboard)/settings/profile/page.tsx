"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ExternalLink, Loader2, LogOut, Trash2 } from "lucide-react"

interface UserProfile {
  name: string | null
  email: string
  avatar_url: string | null
  plan: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch("/api/users/profile", { method: "DELETE" })
      if (res.ok) {
        window.location.href = "/"
      }
    } finally {
      setDeleting(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")

  return (
    <div className="space-y-8">
      {/* Profile info */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{user.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Your name and avatar are managed by your Google account.
        </p>
      </div>

      {/* Google access */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold">Google Search Console Access</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          GSCdaddy has read-only access to your Google Search Console data.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 size-3.5" />
            Manage Google permissions
          </a>
        </Button>
      </div>

      {/* Actions */}
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">Account</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Log out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 size-3.5" />
            Log out
          </Button>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 size-3.5" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all connected sites, synced data,
                    recommendations, and subscription. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
