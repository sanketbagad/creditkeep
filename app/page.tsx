import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt, Store, BarChart3, Shield, ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Navbar */}
        <Navbar showAuthButtons={true} />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 p-6 text-center pt-8">
          {/* Floating Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce">
              <Receipt className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
              <Sparkles className="h-3 w-3 text-yellow-800" />
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
              Smart Borrowing
              <br />
              <span className="text-3xl">Made Simple</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed px-2">
              Track your daily borrowings, manage payments, and gain insights into your spending habits with our
              beautiful, intuitive app.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-2xl transform hover:scale-105 transition-all duration-300">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-blue-800">10K+</div>
              <div className="text-xs text-blue-600">Users</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-2xl transform hover:scale-105 transition-all duration-300 delay-100">
              <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-green-800">₹50L+</div>
              <div className="text-xs text-green-600">Tracked</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-2xl transform hover:scale-105 transition-all duration-300 delay-200">
              <Store className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-xs font-semibold text-purple-800">500+</div>
              <div className="text-xs text-purple-600">Shops</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 mb-8">
            <Link href="/signup" className="block">
              <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all duration-300 rounded-2xl group">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="block">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 rounded-2xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
            <Shield className="h-4 w-4" />
            <span>Secure & Private</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 p-6 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything You Need</h2>
            <p className="text-gray-600">Powerful features to manage your finances</p>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Shop Management</h3>
                  <p className="text-sm text-gray-600">Organize and track all your favorite shops in one place</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl delay-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Easy Transaction Tracking</h3>
                  <p className="text-sm text-gray-600">Record borrowings and payments with just a few taps</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl delay-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Powerful Analytics</h3>
                  <p className="text-sm text-gray-600">Get insights into your spending patterns and trends</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl delay-300">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Bank-Level Security</h3>
                  <p className="text-sm text-gray-600">Your data is protected with enterprise-grade encryption</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 p-6 text-center bg-gradient-to-r from-blue-50 to-purple-50 mx-4 rounded-3xl mb-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to get started?</h3>
          <p className="text-gray-600 text-sm mb-4">Join thousands of users who trust us with their finances</p>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
              Start Free Today
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 text-center text-sm text-gray-500 space-y-2">
          <p className="font-medium">Simple. Secure. Reliable.</p>
          <p className="text-xs">© 2024 CreditKeep. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
