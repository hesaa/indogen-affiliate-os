import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getLandingPage } from '@/lib/api-client'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Star, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const [landingPage, setLandingPage] = useState<any>(null)
  const [timer, setTimer] = useState<number | null>(null)

  useEffect(() => {
    loadLandingPage()
  }, [params.slug, pathname])

  useEffect(() => {
    if (landingPage?.expiresAt) {
      const interval = setInterval(() => {
        const distance = new Date(landingPage.expiresAt).getTime() - Date.now()
        setTimer(distance)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [landingPage])

  const loadLandingPage = async () => {
    try {
      const response = await getLandingPage(params.slug)
      setLandingPage(response.data)
    } catch (error) {
      console.error('Failed to load landing page:', error)
      router.push('/404')
    }
  }

  if (!landingPage) {
    return <div>Loading...</div>
  }

  const formatTimer = (milliseconds: number) => {
    if (milliseconds <= 0) return 'Expired'
    const distance = Math.floor(milliseconds / 1000)
    const days = Math.floor(distance / (60 * 60 * 24))
    const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((distance % (60 * 60)) / 60)
    const seconds = distance % 60

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{landingPage.productName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Offer ends in:</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-semibold text-blue-600 shadow-sm">
                {timer !== null ? formatTimer(timer) : 'Loading...'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={landingPage.productImage || '/placeholder-product.jpg'}
                alt={landingPage.productName}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">{landingPage.rating || '4.8'} â˜… ({landingPage.reviewsCount || '1.2k'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details & CTA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Social Proof Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose This Product?</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Join {landingPage.salesCount || '5,432'}+ happy customers</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>{landingPage.dailySales || '234'} sold today</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>Limited stock available</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span>Free shipping on orders over ${landingPage.freeShipping || '50'}</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Highlights</h3>
              <div className="space-y-3 text-gray-700">
                {landingPage.highlights?.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">${landingPage.price || '49.99'}</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-sm font-semibold">
                  {timer !== null ? formatTimer(timer) : 'Loading...'}
                </div>
              </div>
              <p className="text-sm text-white/90 mb-6">
                {landingPage.discount || '50%'} OFF for the next {landingPage.discountHours || '24'} hours only!
              </p>
              <button
                onClick={() => window.open(landingPage.productUrl, '_blank')}
                className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-2xl hover:bg-blue-50 transition-colors"
              >
                Get This Deal Now
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            This is an affiliate page. By purchasing through our link, you support our service at no extra cost to you.
          </p>
        </footer>
      </div>
    </div>
  )
}