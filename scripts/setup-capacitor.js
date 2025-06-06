const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up Capacitor for native app development...\n")

try {
  // Check if Capacitor is already initialized
  if (!fs.existsSync("capacitor.config.json")) {
    console.log("📱 Initializing Capacitor...")
    execSync('npx cap init "Modern Borrowing App" "com.modernborrowing.app"', { stdio: "inherit" })
  } else {
    console.log("✅ Capacitor already initialized")
  }

  // Build the web app first
  console.log("\n🔨 Building web app...")
  execSync("npm run build", { stdio: "inherit" })

  // Add Android platform
  if (!fs.existsSync("android")) {
    console.log("\n🤖 Adding Android platform...")
    execSync("npx cap add android", { stdio: "inherit" })
  } else {
    console.log("✅ Android platform already added")
  }

  // Add iOS platform (only on macOS)
  if (process.platform === "darwin") {
    if (!fs.existsSync("ios")) {
      console.log("\n🍎 Adding iOS platform...")
      execSync("npx cap add ios", { stdio: "inherit" })
    } else {
      console.log("✅ iOS platform already added")
    }
  } else {
    console.log("⚠️  iOS platform can only be added on macOS")
  }

  // Sync the web app with native projects
  console.log("\n🔄 Syncing web app with native projects...")
  execSync("npx cap sync", { stdio: "inherit" })

  console.log("\n✅ Capacitor setup complete!")
  console.log("\n📱 Next steps:")
  console.log("   • For Android: npm run build:android")
  console.log("   • For iOS: npm run build:ios (macOS only)")
  console.log("   • To open Android Studio: npm run open:android")
  console.log("   • To open Xcode: npm run open:ios")
} catch (error) {
  console.error("❌ Error setting up Capacitor:", error.message)
  process.exit(1)
}
