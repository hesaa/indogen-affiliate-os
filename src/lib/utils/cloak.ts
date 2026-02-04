import { UserAgent } from 'user-agents';
import { getIPReputation } from './ip-reputation';
import { generateSafePage } from './safe-page-generator';

export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reason: string;
  safePageHTML?: string;
}

export interface SafePageConfig {
  targetURL: string;
  brandName: string;
  productTitle: string;
  productImage?: string;
  price?: string;
}

export class CloakUtils {
  /**
   * Analyzes request to detect bot traffic
   */
  static detectBot(request: Request): BotDetectionResult {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || '';

    // User Agent Analysis
    const userAgentInfo = new UserAgent(userAgent);
    const isSuspiciousUA = this.isSuspiciousUserAgent(userAgentInfo);

    // IP Reputation Check
    const ipReputation = getIPReputation(ip);

    // Behavior Pattern Analysis (simplified)
    const isAutomated = this.analyzeBehaviorPattern(request);

    // Calculate confidence score
    const confidence = this.calculateConfidence(
      isSuspiciousUA,
      ipReputation.score,
      isAutomated
    );

    const isBot = confidence > 0.7;

    // Generate safe page if bot detected
    let safePageHTML: string | undefined;
    if (isBot) {
      safePageHTML = generateSafePage({
        targetURL: 'https://example.com', // Would come from database
        brandName: 'Example Brand',
        productTitle: 'Example Product',
        productImage: 'https://example.com/image.jpg',
        price: '$99.99'
      });
    }

    return {
      isBot,
      confidence,
      reason: this.generateReason(isSuspiciousUA, ipReputation, isAutomated),
      safePageHTML
    };
  }

  /**
   * Checks if user agent appears to be from a bot or automation tool
   */
  private static isSuspiciousUserAgent(userAgent: UserAgent): boolean {
    const suspiciousPatterns = [
      'bot',
      'crawl',
      'spider',
      'scrape',
      'curl',
      'wget',
      'python-requests',
      'http-client'
    ];

    const lowerUA = userAgent.toString().toLowerCase();
    return suspiciousPatterns.some(pattern => lowerUA.includes(pattern));
  }

  /**
   * Analyzes request behavior patterns that indicate automation
   */
  private static analyzeBehaviorPattern(request: Request): boolean {
    // Check for missing/referrer headers
    const referrer = request.headers.get('referer');
    if (!referrer) return true;

    // Check request frequency (would need session tracking)
    // Simplified: check if request has certain automation indicators
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html')) {
      return true;
    }

    return false;
  }

  /**
   * Calculates confidence score based on multiple factors
   */
  private static calculateConfidence(
    isSuspiciousUA: boolean,
    ipScore: number,
    isAutomated: boolean
  ): number {
    let score = 0;

    if (isSuspiciousUA) score += 0.4;
    score += ipScore * 0.3;
    if (isAutomated) score += 0.3;

    return Math.min(score, 1);
  }

  /**
   * Generates human-readable reason for bot detection
   */
  private static generateReason(
    isSuspiciousUA: boolean,
    ipReputation: { score: number; tags: string[] },
    isAutomated: boolean
  ): string {
    const reasons: string[] = [];

    if (isSuspiciousUA) reasons.push('Suspicious User Agent');
    if (ipReputation.score > 0.5) reasons.push('Poor IP Reputation');
    if (isAutomated) reasons.push('Automated Behavior Patterns');

    return reasons.join(', ') || 'No specific indicators';
  }
}

// Mock IP reputation service (would connect to real service)
export const getIPReputation = async (ip: string): Promise<{ score: number; tags: string[] }> => {
  // In production, this would call an IP reputation API
  const reputationMap: Record<string, { score: number; tags: string[] }> = {
    '192.168.1.1': { score: 0.9, tags: ['proxy', 'vpn'] },
    '10.0.0.1': { score: 0.8, tags: ['datacenter'] }
  };

  return reputationMap[ip] || { score: 0, tags: [] };
};

// Mock safe page generator
export const generateSafePage = (config: SafePageConfig): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.brandName} - ${config.productTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .product-image { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
        .product-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .brand { color: #666; font-size: 18px; margin-bottom: 20px; }
        .price { font-size: 28px; font-weight: bold; color: #2c5182; margin-bottom: 20px; }
        .description { line-height: 1.6; color: #444; margin-bottom: 30px; }
        .cta-button { display: inline-block; background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .disclaimer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="brand">${config.brandName}</h1>
        ${config.productImage ? `<img src="${config.productImage}" alt="${config.productTitle}" class="product-image">` : ''}
        <h2 class="product-title">${config.productTitle}</h2>
        ${config.price ? `<div class="price">${config.price}</div>` : ''}
        <div class="description">
          Thank you for your interest! Please wait while we prepare your exclusive access link.
        </div>
        <a href="${config.targetURL}" class="cta-button">Get Access</a>
        <div class="disclaimer">
          This page helps protect our affiliate links from being blocked by social platforms.
        </div>
      </div>
    </body>
    </html>
  `;
};