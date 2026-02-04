import { ProductReview, SocialProofData } from '@/types'

/**
 * Mock social proof scraper for Shopee/Tokopedia
 * In production, this would make HTTP requests to scrape actual data
 * For MVP, we return simulated data to demonstrate functionality
 */
export class SocialProofScraper {
  /**
   * Scrape product data from a given URL
   * @param url - Product URL from Shopee or Tokopedia
   * @returns Mocked social proof data
   */
  static async scrape(url: string): Promise<SocialProofData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data based on URL pattern
    const isShopee = url.includes('shopee')
    const isTokopedia = url.includes('tokopedia')

    // Generate mock product ID from URL
    const productId = this.extractProductId(url)

    // Return mock social proof data
    return {
      platform: isShopee ? 'Shopee' : isTokopedia ? 'Tokopedia' : 'Unknown',
      productId,
      productName: this.generateProductName(productId),
      price: this.generatePrice(),
      rating: this.generateRating(),
      reviewCount: this.generateReviewCount(),
      reviews: this.generateReviews(),
      sellerInfo: this.generateSellerInfo(),
      stockStatus: this.generateStockStatus(),
      discount: this.generateDiscount(),
      badges: this.generateBadges(),
      images: this.generateImages(),
      specifications: this.generateSpecifications(),
      url
    }
  }

  /**
   * Extract product ID from URL
   * @param url - Product URL
   * @returns Extracted product ID
   */
  private static extractProductId(url: string): string {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const parts = pathname.split('/').filter(Boolean)

    // Common patterns for product IDs
    if (parts.length >= 2) {
      return parts[parts.length - 1] // Last part is usually product ID
    }

    return 'mock-product-id'
  }

  /**
   * Generate mock product name
   * @param productId - Product ID
   * @returns Generated product name
   */
  private static generateProductName(productId: string): string {
    const adjectives = ['Premium', 'Luxury', 'High-Quality', 'Best', 'Top', 'Exclusive']
    const products = ['Smartphone', 'Laptop', 'Headphones', 'Watch', 'Shoes', 'Bag']
    const brands = ['BrandX', 'TechPro', 'StyleMax', 'ProGear', 'Elite', 'Trendy']

    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${products[Math.floor(Math.random() * products.length)]} ${brands[Math.floor(Math.random() * brands.length)]} ${productId}`
  }

  /**
   * Generate mock price
   * @returns Generated price
   */
  private static generatePrice(): number {
    return Math.floor(Math.random() * 9000) + 1000 // 1000-10000
  }

  /**
   * Generate mock rating
   * @returns Generated rating (0-5)
   */
  private static generateRating(): number {
    return Math.round((Math.random() * 4 + 1) * 10) / 10 // 1.0-5.0
  }

  /**
   * Generate mock review count
   * @returns Generated review count
   */
  private static generateReviewCount(): number {
    return Math.floor(Math.random() * 5000) + 100 // 100-5100
  }

  /**
   * Generate mock reviews
   * @returns Array of mock reviews
   */
  private static generateReviews(): ProductReview[] {
    const reviewTexts = [
      'Very good quality, fast delivery!',
      'Product as described, satisfied with purchase.',
      'Excellent product, highly recommended!',
      'Good value for money.',
      'Fast shipping, product in good condition.',
      'Satisfied with the quality and service.',
      'Great product, will buy again.',
      'As expected, no issues.',
      'Good communication with seller.',
      'Product arrived on time.'
    ]

    const starRatings = [5, 4, 4, 5, 3, 4, 5, 4, 5, 4]

    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
      id: `review-${Date.now()}-${i}`,
      username: `user${Math.floor(Math.random() * 1000)}`,
      rating: starRatings[i],
      text: reviewTexts[i],
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      verified: Math.random() > 0.3 // 70% chance of being verified
    }))
  }

  /**
   * Generate mock seller info
   * @returns Mock seller information
   */
  private static generateSellerInfo() {
    const sellerNames = ['TopSeller', 'TrustedShop', 'PremiumStore', 'OfficialStore', 'BestSeller']
    const sellerTypes = ['Official Store', 'Top Rated Shop', 'Trusted Seller', 'Premium Seller']

    return {
      name: sellerNames[Math.floor(Math.random() * sellerNames.length)],
      type: sellerTypes[Math.floor(Math.random() * sellerTypes.length)],
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
      feedbackCount: Math.floor(Math.random() * 10000) + 1000,
      responseRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      responseTime: Math.floor(Math.random() * 24) + 1 // 1-24 hours
    }
  }

  /**
   * Generate mock stock status
   * @returns Mock stock status
   */
  private static generateStockStatus() {
    const statuses = ['In Stock', 'Limited Stock', 'Out of Stock']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return {
      status: randomStatus,
      quantity: randomStatus === 'In Stock' ? Math.floor(Math.random() * 100) + 1 : 0,
      restockDate: randomStatus === 'Out of Stock' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
    }
  }

  /**
   * Generate mock discount
   * @returns Mock discount information
   */
  private static generateDiscount() {
    if (Math.random() > 0.3) { // 70% chance of having discount
      return {
        percentage: Math.floor(Math.random() * 50) + 10, // 10-60%
        originalPrice: this.generatePrice() * 1.2, // 20% higher than current price
        until: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Expires within 7 days
      }
    }

    return null
  }

  /**
   * Generate mock badges
   * @returns Array of mock badges
   */
  private static generateBadges() {
    const badges = ['Hot Sale', 'Flash Deal', 'Free Shipping', 'Official Store', 'Top Rated', 'Best Seller']
    const randomBadges = []

    for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
      randomBadges.push(badges[Math.floor(Math.random() * badges.length)])
    }

    return [...new Set(randomBadges)] // Remove duplicates
  }

  /**
   * Generate mock product images
   * @returns Array of mock image URLs
   */
  private static generateImages() {
    const imageCount = Math.floor(Math.random() * 5) + 1 // 1-5 images
    return Array.from({ length: imageCount }, (_, i) => ({
      url: `https://picsum.photos/seed/${Math.random().toString(36).substr(2, 9)}-${i}/400/400.jpg`,
      alt: `Product image ${i + 1}`
    }))
  }

  /**
   * Generate mock specifications
   * @returns Mock product specifications
   */
  private static generateSpecifications() {
    const specs = {
      color: ['Black', 'White', 'Blue', 'Red', 'Silver', 'Gold'],
      size: ['Small', 'Medium', 'Large', 'X-Large'],
      material: ['Plastic', 'Metal', 'Leather', 'Fabric', 'Glass'],
      weight: ['Lightweight', 'Standard', 'Heavy-duty'],
      compatibility: ['Universal', 'Android', 'iOS', 'Windows', 'Mac']
    }

    return {
      color: specs.color[Math.floor(Math.random() * specs.color.length)],
      size: specs.size[Math.floor(Math.random() * specs.size.length)],
      material: specs.material[Math.floor(Math.random() * specs.material.length)],
      weight: specs.weight[Math.floor(Math.random() * specs.weight.length)],
      compatibility: specs.compatibility[Math.floor(Math.random() * specs.compatibility.length)]
    }
  }
}

/**
 * Type definitions for social proof data
 */
export interface SocialProofData {
  platform: string
  productId: string
  productName: string
  price: number
  rating: number
  reviewCount: number
  reviews: ProductReview[]
  sellerInfo: SellerInfo
  stockStatus: StockStatus
  discount?: Discount
  badges: string[]
  images: Image[]
  specifications: Specifications
  url: string
}

export interface ProductReview {
  id: string
  username: string
  rating: number
  text: string
  date: string
  verified: boolean
}

export interface SellerInfo {
  name: string
  type: string
  rating: number
  feedbackCount: number
  responseRate: number
  responseTime: number
}

export interface StockStatus {
  status: string
  quantity: number
  restockDate: string | null
}

export interface Discount {
  percentage: number
  originalPrice: number
  until: string
}

export interface Image {
  url: string
  alt: string
}

export interface Specifications {
  color: string
  size: string
  material: string
  weight: string
  compatibility: string
}