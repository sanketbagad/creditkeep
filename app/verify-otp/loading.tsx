import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

export default function VerifyOTPLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <Navbar showAuthButtons={false} />

        <div className="relative z-10 p-6 pt-8">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <div className="h-8 w-8 bg-white/30 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 border-2 border-gray-200 rounded-xl animate-pulse bg-gray-100"
                  ></div>
                ))}
              </div>
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="text-center space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse mx-auto w-32"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse mx-auto w-24"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
