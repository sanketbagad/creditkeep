"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { PWAManager, OfflineStorage } from "@/lib/pwa"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Wifi, WifiOff, X } from "lucide-react"

interface PWAContextType {
  isOnline: boolean
  canInstall: boolean
  install: () => Promise<boolean>
  offlineStorage: OfflineStorage
  refreshSession: () => Promise<void>
}

const PWAContext = createContext<PWAContextType | null>(null)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error("usePWA must be used within PWAProvider")
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(false)
  const [pwaManager] = useState(() => new PWAManager())
  const [offlineStorage] = useState(() => new OfflineStorage())

  useEffect(() => {
    // Initialize offline storage
    offlineStorage.init()

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    pwaManager.onOnlineStatusChange((online) => {
      setIsOnline(online)
      if (online) {
        setShowOnlineIndicator(true)
        // Hide online indicator after 3 seconds
        setTimeout(() => setShowOnlineIndicator(false), 3000)
        // Refresh session when coming back online
        refreshSession()
      }
    })

    // Check if app can be installed
    const checkInstallability = () => {
      setCanInstall(pwaManager.canInstall())
    }

    // Check periodically for install prompt
    const interval = setInterval(checkInstallability, 1000)

    // Show install prompt after 30 seconds if available
    const installPromptTimer = setTimeout(() => {
      if (pwaManager.canInstall()) {
        setShowInstallPrompt(true)
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(installPromptTimer)
    }
  }, [pwaManager, offlineStorage])

  const handleInstall = async () => {
    const success = await pwaManager.install()
    if (success) {
      setShowInstallPrompt(false)
      setCanInstall(false)
    }
    return success
  }

  const refreshSession = async () => {
    try {
      await fetch("/api/auth/me", { credentials: "include" })
    } catch (error) {
      console.error("Failed to refresh session:", error)
    }
  }

  const contextValue: PWAContextType = {
    isOnline,
    canInstall,
    install: handleInstall,
    offlineStorage,
    refreshSession,
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            You're offline - some features may be limited
          </div>
        </div>
      )}

      {/* Online Indicator (brief) */}
     

      {/* Install Prompt */}
      {showInstallPrompt && canInstall && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Install CreditKeep</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Install our app for a better experience and offline access
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleInstall} className="bg-blue-600 hover:bg-blue-700">
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowInstallPrompt(false)}
                      className="border-blue-300 text-blue-700"
                    >
                      Later
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-blue-600 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PWAContext.Provider>
  )
}
