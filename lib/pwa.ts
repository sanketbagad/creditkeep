"use client"

// PWA installation and offline utilities
export class PWAManager {
  private deferredPrompt: any = null
  private isInstalled = false

  constructor() {
    if (typeof window !== "undefined") {
      this.init()
    }
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      this.deferredPrompt = e
    })

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true
      this.deferredPrompt = null
    })

    // Register service worker
    this.registerServiceWorker()
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered:", registration)

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateAvailable()
              }
            })
          }
        })
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false

    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice

      if (outcome === "accepted") {
        this.isInstalled = true
        this.deferredPrompt = null
        return true
      }
      return false
    } catch (error) {
      console.error("Installation failed:", error)
      return false
    }
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    window.addEventListener("online", () => callback(true))
    window.addEventListener("offline", () => callback(false))
  }

  private showUpdateAvailable() {
    // You can implement a toast or notification here
    console.log("New version available! Please refresh.")
  }
}

// Offline storage utilities
export class OfflineStorage {
  private dbName = "creditkeep-offline"
  private version = 1
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores for offline data
        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true })
          transactionStore.createIndex("timestamp", "timestamp")
          transactionStore.createIndex("synced", "synced")
        }

        if (!db.objectStoreNames.contains("shops")) {
          const shopStore = db.createObjectStore("shops", { keyPath: "id", autoIncrement: true })
          shopStore.createIndex("timestamp", "timestamp")
          shopStore.createIndex("synced", "synced")
        }
      }
    })
  }

  async storeOfflineTransaction(transaction: any) {
    if (!this.db) await this.init()

    const tx = this.db!.transaction(["transactions"], "readwrite")
    const store = tx.objectStore("transactions")

    const offlineTransaction = {
      ...transaction,
      timestamp: Date.now(),
      synced: false,
      offline: true,
    }

    return store.add(offlineTransaction)
  }

  async getUnsyncedTransactions() {
    if (!this.db) await this.init()

    const tx = this.db!.transaction(["transactions"], "readonly")
    const store = tx.objectStore("transactions")
    const index = store.index("synced")

    return new Promise<any[]>((resolve, reject) => {
      const request = index.getAll(false)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markTransactionSynced(id: number) {
    if (!this.db) await this.init()

    const tx = this.db!.transaction(["transactions"], "readwrite")
    const store = tx.objectStore("transactions")

    const request = store.get(id)
    request.onsuccess = () => {
      const transaction = request.result
      if (transaction) {
        transaction.synced = true
        store.put(transaction)
      }
    }
  }
}
