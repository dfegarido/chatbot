// Image matching service to find relevant images based on user queries
import { imageConfig, responseTemplates, imageRequestKeywords } from '@/config/images';

export interface ImageItem {
  filename: string;
  path: string;
  keywords: string[];
  description: string;
  category?: string;
  prices?: {
    [key: string]: number | string | {
      base_price?: number | string;
      pull_apart_charge?: number;
      fondant_board_charge?: number;
      [key: string]: any;
    };
  };
}

// Get the correct base path for images based on environment
const getBasePath = (): string => {
  if (typeof window !== 'undefined') {
    // In production (GitHub Pages), use /chatbot/ prefix
    if (window.location.hostname === 'dfegarido.github.io') {
      return '/chatbot';
    }
    // In development (localhost), check if we're using the base path
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Otherwise, we're in development mode with no base path
      return '';
    }
  }
  // Fallback for production builds
  return '/chatbot';
};

// Generate images with dynamic paths using configuration
const getAvailableImages = (): ImageItem[] => {
  const basePath = getBasePath();
  return imageConfig.map(item => ({
    filename: item.filename,
    path: `${window.location.origin}${basePath}/${item.filename}`,
    keywords: item.keywords,
    description: item.description,
    category: item.category || 'general',
    prices: item.prices
  }));
};

// Export as a getter function
export const availableImages = getAvailableImages();

export class ImageMatchingService {
  /**
   * Find relevant images based on user query
   */
  findRelevantImages(query: string, maxResults: number = 3): ImageItem[] {
    const lowerQuery = query.toLowerCase();
    const matches: { image: ImageItem; score: number }[] = [];
    const images = getAvailableImages(); // Get fresh images with current paths

    for (const image of images) {
      let score = 0;
      
      // Check for exact keyword matches
      for (const keyword of image.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += keyword.length === lowerQuery.length ? 10 : 5; // Bonus for exact match
        }
      }
      
      // Check for partial matches in description
      if (lowerQuery.includes(image.description.toLowerCase()) || 
          image.description.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }
      
      // Check for word boundaries to avoid false positives
      const words = lowerQuery.split(/\s+/);
      for (const word of words) {
        for (const keyword of image.keywords) {
          if (word === keyword.toLowerCase()) {
            score += 8;
          }
        }
      }
      
      if (score > 0) {
        matches.push({ image, score });
      }
    }
    
    // Sort by score (highest first) and return top results
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(match => match.image);
  }

  /**
   * Check if a query is asking for images/photos
   */
  isImageRequest(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return imageRequestKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Check if a query is asking about specific products, pricing, or detailed product information
   */
  isProductSpecificQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    const productKeywords = [
      'cupcake', 'cake', 'price', 'pricing', 'cost', 'how much', 'flavor', 'flavors',
      'order', 'ordering', 'buy', 'purchase', 'delivery', 'pickup', 'custom', 'design',
      'size', 'sizes', 'menu', 'available', 'options', 'diy', 'kit', 'red velvet',
      'chocolate', 'vanilla', 'minimum', 'lead time', 'ingredient', 'allergen'
    ];
    
    return productKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Generate a response message with images
   */
  generateImageResponse(query: string): { content: string; images: string[] } | null {
    const relevantImages = this.findRelevantImages(query);
    
    if (relevantImages.length === 0) {
      return null;
    }

    const isExplicitImageRequest = this.isImageRequest(query);
    const isProductQuery = this.isProductSpecificQuery(query);
    
    // Only return images if explicitly requested or for specific product queries
    if (!isExplicitImageRequest && !isProductQuery) {
      return null;
    }
    
    const imagePaths = relevantImages.map(img => img.path);
    
    let content = '';
    
    if (isExplicitImageRequest) {
      if (relevantImages.length === 1) {
        content = `Here's an image of ${relevantImages[0].description}:`;
      } else {
        content = `Here are some images from our menu:\n${relevantImages.map(img => `• ${img.description}`).join('\n')}`;
      }
    } else {
      // Generate detailed response using ImageDefinition data
      content = this.generateDetailedResponse(query, relevantImages);
    }
    
    return {
      content,
      images: imagePaths
    };
  }

  /**
   * Generate detailed response based on ImageDefinition data
   */
  private generateDetailedResponse(query: string, images: ImageItem[]): string {
    // Check if query is asking about prices
    if (this.isPriceQuery(query)) {
      return this.generatePriceResponse(images);
    }
    
    // Check if query is asking about specific products/flavors
    if (this.isProductQuery(query)) {
      return this.generateProductResponse(images, query);
    }
    
    // Check if query is asking about availability or options
    if (this.isAvailabilityQuery(query)) {
      return this.generateAvailabilityResponse(images);
    }
    
    // Default to category-based response with additional details
    const imageCategories = [...new Set(images.map(img => img.category || 'general'))];
    const primaryCategory = imageCategories[0] as keyof typeof responseTemplates;
    
    let baseResponse = responseTemplates[primaryCategory] || responseTemplates.general;
    
    // Add specific product mentions if relevant
    if (images.length === 1) {
      const image = images[0];
      baseResponse += `\n\n${this.getImageSummary(image)}`;
    } else if (images.length <= 3) {
      baseResponse += `\n\nHere are some specific options that match your query:`;
      images.forEach(img => {
        baseResponse += `\n• ${this.getImageSummary(img)}`;
      });
    }
    
    return baseResponse;
  }

  /**
   * Check if query is asking about prices
   */
  private isPriceQuery(query: string): boolean {
    const priceKeywords = ['price', 'cost', 'how much', 'pricing', 'rate', 'fee', 'charge', 'expensive', 'cheap', 'budget'];
    const lowerQuery = query.toLowerCase();
    return priceKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Check if query is asking about specific products
   */
  private isProductQuery(query: string): boolean {
    const productKeywords = ['flavor', 'flavors', 'type', 'types', 'kind', 'option', 'options', 'available', 'what do you have'];
    const lowerQuery = query.toLowerCase();
    return productKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Check if query is asking about availability
   */
  private isAvailabilityQuery(query: string): boolean {
    const availabilityKeywords = ['available', 'do you have', 'can you make', 'offer', 'menu', 'selection'];
    const lowerQuery = query.toLowerCase();
    return availabilityKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Generate price-focused response
   */
  private generatePriceResponse(images: ImageItem[]): string {
    let response = "Here are the current prices for our products:\n\n";
    
    images.forEach(img => {
      if (img.prices && Object.keys(img.prices).length > 0) {
        response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
        response += this.formatPrices(img.prices);
        response += "\n";
      }
    });
    
    response += "\n*Prices are in Philippine Pesos (₱)*\n";
    response += "*For custom orders, please contact us for a personalized quote!*";
    
    return response;
  }

  /**
   * Generate product-focused response
   */
  private generateProductResponse(images: ImageItem[], _query: string): string {
    let response = "Here are the products that match your query:\n\n";
    
    images.forEach(img => {
      response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
      response += `${img.description}\n\n`;
      
      if (img.prices && Object.keys(img.prices).length > 0) {
        response += "Available options:\n";
        response += this.formatPrices(img.prices);
        response += "\n";
      }
    });
    
    return response;
  }

  /**
   * Generate availability-focused response
   */
  private generateAvailabilityResponse(images: ImageItem[]): string {
    const categories = [...new Set(images.map(img => img.category))];
    
    let response = "Yes, we have these available:\n\n";
    
    categories.forEach(category => {
      const categoryImages = images.filter(img => img.category === category);
      response += `**${this.getCategoryDisplayName(category)}:**\n`;
      
      categoryImages.forEach(img => {
        if (img.prices) {
          const productNames = Object.keys(img.prices);
          if (productNames.length > 0) {
            response += `• ${productNames.slice(0, 3).join(', ')}`;
            if (productNames.length > 3) {
              response += ` and ${productNames.length - 3} more options`;
            }
            response += "\n";
          }
        }
      });
      response += "\n";
    });
    
    response += "*Contact us for custom requests and personalized designs!*";
    
    return response;
  }

  /**
   * Get a summary of an image's key information
   */
  private getImageSummary(image: ImageItem): string {
    let summary = image.description.split('.')[0]; // First sentence
    
    if (image.prices && Object.keys(image.prices).length > 0) {
      const priceEntries = Object.entries(image.prices);
      if (priceEntries.length > 0) {
        summary += ` (Starting from ₱${this.getLowestPrice(image.prices)})`;
      }
    }
    
    return summary;
  }

  /**
   * Format prices for display
   */
  private formatPrices(prices: any): string {
    let formatted = "";
    
    Object.entries(prices).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        formatted += `• ${key.replace(/_/g, ' ')}:\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          formatted += `  - ${subKey.replace(/_/g, ' ')}: ₱${subValue}\n`;
        });
      } else {
        formatted += `• ${key.replace(/_/g, ' ')}: ₱${value}\n`;
      }
    });
    
    return formatted;
  }

  /**
   * Get the lowest price from a prices object
   */
  private getLowestPrice(prices: any): number {
    let lowest = Infinity;
    
    const extractNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const num = parseFloat(value.toString().replace(/[^\d.]/g, ''));
        return isNaN(num) ? Infinity : num;
      }
      if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(subValue => {
          const num = extractNumber(subValue);
          if (num < lowest) lowest = num;
        });
      }
      return Infinity;
    };
    
    Object.values(prices).forEach(value => {
      const price = extractNumber(value);
      if (price < lowest) lowest = price;
    });
    
    return lowest === Infinity ? 0 : lowest;
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category?: string): string {
    const displayNames: { [key: string]: string } = {
      'cupcakes': 'Cupcakes',
      'cakes': 'Cakes',
      'baking-equipment': 'Baking Equipment',
      'diy-kits': 'DIY Kits',
      'cake tins': 'Cake Tins',
      'general': 'Products'
    };
    
    return displayNames[category || 'general'] || 'Products';
  }

  /**
   * Get all available images (for testing or browsing)
   */
  getAllImages(): ImageItem[] {
    return getAvailableImages();
  }

  /**
   * Answer specific questions about products using ImageDefinition details
   */
  answerProductQuestion(query: string): { content: string; images: string[] } | null {
    // Only answer if the query is actually about products
    if (!this.isProductSpecificQuery(query)) {
      return null;
    }
    
    const relevantImages = this.findRelevantImages(query, 5); // Get more results for comprehensive answers
    
    if (relevantImages.length === 0) {
      return null;
    }

    const lowerQuery = query.toLowerCase();
    let response = "";
    const imagePaths = relevantImages.map(img => img.path);

    // Handle specific question types
    if (this.isIngredientQuestion(query)) {
      response = this.answerIngredientQuestion(relevantImages, lowerQuery);
    } else if (this.isSizeQuestion(query)) {
      response = this.answerSizeQuestion(relevantImages);
    } else if (this.isFlavorQuestion(query)) {
      response = this.answerFlavorQuestion(relevantImages);
    } else if (this.isCustomizationQuestion(query)) {
      response = this.answerCustomizationQuestion(relevantImages);
    } else if (this.isDeliveryQuestion(query)) {
      response = this.answerDeliveryQuestion(relevantImages);
    } else if (this.isOrderingQuestion(query)) {
      response = this.answerOrderingQuestion(relevantImages);
    } else {
      // Provide detailed product information
      response = this.provideDetailedProductInfo(relevantImages, lowerQuery);
    }

    return {
      content: response,
      images: imagePaths.slice(0, 3) // Limit to 3 images for better UX
    };
  }

  /**
   * Check if query is about ingredients
   */
  private isIngredientQuestion(query: string): boolean {
    const keywords = ['ingredient', 'ingredients', 'made of', 'contains', 'what\'s in', 'recipe', 'allergen', 'allergy'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Check if query is about sizes
   */
  private isSizeQuestion(query: string): boolean {
    const keywords = ['size', 'sizes', 'how big', 'how large', 'dimension', 'inches', 'inch', '"'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Check if query is about flavors
   */
  private isFlavorQuestion(query: string): boolean {
    const keywords = ['flavor', 'flavors', 'taste', 'tastes', 'what flavors'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Check if query is about customization
   */
  private isCustomizationQuestion(query: string): boolean {
    const keywords = ['custom', 'customize', 'personalize', 'design', 'decoration', 'topper', 'add'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Check if query is about delivery
   */
  private isDeliveryQuestion(query: string): boolean {
    const keywords = ['delivery', 'deliver', 'pickup', 'pick up', 'shipping', 'transport'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Check if query is about ordering
   */
  private isOrderingQuestion(query: string): boolean {
    const keywords = ['order', 'ordering', 'how to order', 'minimum', 'lead time', 'advance', 'book'];
    return keywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  /**
   * Answer ingredient-related questions
   */
  private answerIngredientQuestion(images: ImageItem[], _query: string): string {
    let response = "Here's information about ingredients and allergens:\n\n";
    
    // Look for specific ingredient mentions in descriptions
    images.forEach(img => {
      const description = img.description.toLowerCase();
      if (description.includes('cream cheese') || description.includes('chocolate') || 
          description.includes('ube') || description.includes('carrot') || 
          description.includes('coffee') || description.includes('bacon')) {
        
        response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
        response += `${img.description}\n\n`;
      }
    });

    response += "*For specific allergen information and detailed ingredient lists, please contact us directly as we want to ensure we provide the most accurate and up-to-date information for your safety.*\n\n";
    response += "*Common allergens in our products may include: eggs, dairy, wheat, nuts, and soy.*";

    return response;
  }

  /**
   * Answer size-related questions
   */
  private answerSizeQuestion(images: ImageItem[]): string {
    let response = "Here are the available sizes:\n\n";
    
    images.forEach(img => {
      if (img.prices) {
        const sizeInfo = this.extractSizeInfo(img.prices);
        if (sizeInfo.length > 0) {
          response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
          sizeInfo.forEach(info => {
            response += `• ${info}\n`;
          });
          response += "\n";
        }
      }
    });

    response += "*Cake serving guide: 6\" serves 8-10 people, 8\" serves 12-15 people, 10\" serves 20-25 people*\n";
    response += "*All basic cakes have 2 layers*";

    return response;
  }

  /**
   * Answer flavor-related questions
   */
  private answerFlavorQuestion(images: ImageItem[]): string {
    let response = "Here are our available flavors:\n\n";
    
    images.forEach(img => {
      if (img.prices && img.category === 'cupcakes') {
        response += `**Cupcake Flavors:**\n`;
        Object.keys(img.prices).forEach(flavor => {
          response += `• ${flavor}\n`;
        });
        response += "\n";
        return; // Only show cupcake flavors once
      } else if (img.description.includes('Red Velvet') || img.description.includes('Chocolate') || 
                 img.description.includes('Ube') || img.description.includes('Carrot')) {
        response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
        response += `${img.description.split('.')[0]}\n\n`;
      }
    });

    response += "*We can also create custom flavors for special orders with advance notice!*";

    return response;
  }

  /**
   * Answer customization-related questions
   */
  private answerCustomizationQuestion(images: ImageItem[]): string {
    let response = "Here are our customization options:\n\n";
    
    images.forEach(img => {
      if (img.description.includes('custom') || img.description.includes('topper') || 
          img.description.includes('decoration') || img.description.includes('design')) {
        response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
        response += `${img.description}\n\n`;
        
        if (img.prices) {
          response += "Customization pricing:\n";
          response += this.formatPrices(img.prices);
          response += "\n";
        }
      }
    });

    response += "*Custom designs require 7-day lead time*\n";
    response += "*Contact us to discuss your specific design requirements!*";

    return response;
  }

  /**
   * Answer delivery-related questions
   */
  private answerDeliveryQuestion(_images: ImageItem[]): string {
    return `**Delivery & Pickup Information:**

🚗 **Pickup:** Free pickup from our location
🚚 **Delivery:** Available with rates depending on location
🎂 **For cakes:** We recommend car pickup/delivery for best results

**Lead Times:**
• Basic items: Can often be prepared same day or next day
• Custom designs: 7-day advance notice required
• Large orders: Please contact us for scheduling

**Areas we deliver to:** Metro Manila and nearby areas
*Delivery fees vary by distance - contact us for exact rates*

*For special events and large orders, we can arrange special delivery arrangements.*`;
  }

  /**
   * Answer ordering-related questions
   */
  private answerOrderingQuestion(images: ImageItem[]): string {
    let response = "**How to Order:**\n\n";
    
    // Extract minimum order info from images
    images.forEach(img => {
      if (img.description.includes('minimum') || img.description.includes('Minimum')) {
        const minOrderMatch = img.description.match(/minimum[^.]*[.]/i);
        if (minOrderMatch) {
          response += `• ${minOrderMatch[0]}\n`;
        }
      }
    });

    response += `
**Ordering Process:**
1. Browse our menu and decide what you'd like
2. Contact us via message or call
3. Discuss customization details if needed
4. Confirm your order and payment method
5. We'll prepare your delicious treats!

**Payment:** We accept cash, bank transfer, and major payment methods
**Lead Time:** 
• Regular items: Same day or next day
• Custom designs: 7 days advance notice
• Large orders: Contact us for scheduling

*Contact us directly to place your order and discuss any special requirements!*`;

    return response;
  }

  /**
   * Provide detailed product information
   */
  private provideDetailedProductInfo(images: ImageItem[], _query: string): string {
    let response = "Here's detailed information about our products:\n\n";
    
    images.slice(0, 2).forEach(img => { // Limit to 2 detailed descriptions to avoid overwhelming
      response += `**${this.getCategoryDisplayName(img.category)}:**\n`;
      response += `${img.description}\n\n`;
      
      if (img.prices && Object.keys(img.prices).length > 0) {
        response += "Pricing:\n";
        response += this.formatPrices(img.prices);
        response += "\n";
      }
    });

    response += "*All prices are in Philippine Pesos (₱)*\n";
    response += "*For custom orders and special requests, please contact us for personalized quotes!*";

    return response;
  }

  /**
   * Extract size information from prices object
   */
  private extractSizeInfo(prices: any): string[] {
    const sizeInfo: string[] = [];
    
    Object.entries(prices).forEach(([key, value]) => {
      if (key.includes('"') || key.includes('inch')) {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            sizeInfo.push(`${key} ${subKey}: ₱${subValue}`);
          });
        } else {
          sizeInfo.push(`${key}: ₱${value}`);
        }
      }
    });
    
    return sizeInfo;
  }
}
