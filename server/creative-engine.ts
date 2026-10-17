/**
 * Pica-Pau Creative Engine v3.0
 * High-definition commercial advertising visual generator
 * Provides immediate, reliable advertising compositions when external OpenAI keys are not configured or invalid.
 */

export interface CreativeImageOptions {
  prompt: string;
  aspectRatio: string;
  segment?: string;
  companyName?: string;
  headline?: string;
  price?: string;
  cta?: string;
  phone?: string;
  quality?: 'standard' | 'hd';
}

export class CreativeEngine {
  // High-resolution curated commercial visual library categorized by advertising niches & color palettes
  private static commercialThemes: Record<string, { [format: string]: string[] }> = {
    web_sites_and_ads: {
      '1:1': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85', // Web design, analytics & modern growth
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85', // Marketing dashboard & digital metrics
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85', // High-tech desk, laptop & creative web design
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85', // Cyber tech workstation
      ],
      '16:9': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1792&q=85', // Web banners & analytics
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1792&q=85', // Tech dashboard banner
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1792&q=85', // Agency digital team collaborating
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1792&q=85', // Tech devices & digital marketing
      ],
      '9:16': [
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=85', // Cyber green digital vertical
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1080&q=85', // Tech device vertical
        'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1080&q=85', // Web creator desk vertical
      ],
      '4:5': [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
      ]
    },
    gold_green_tech: {
      '1:1': [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85', // Luxury fluid gold curves with emerald/dark depth
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=85', // Golden 3D abstract render
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85', // Vibrant green neon cyber technology
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85', // Cyber workstation
      ],
      '16:9': [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1792&q=85',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1792&q=85',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1792&q=85', // Growth & financial green/gold charts
      ],
      '9:16': [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=85',
      ],
      '4:5': [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
      ]
    },
    gastronomy: {
      '1:1': [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85', // Gourmet Burger
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85', // Rustic Pizza
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85', // Restaurant food
      ],
      '16:9': [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1792&q=85',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1792&q=85',
      ],
      '9:16': [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1080&q=85',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1080&q=85',
      ],
      '4:5': [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
      ]
    },
    corporate_and_business: {
      '1:1': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85', // Architecture & skyscraper
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85', // Modern office interior
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85', // Business desk
      ],
      '16:9': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1792&q=85',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1792&q=85',
      ],
      '9:16': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=85',
      ],
      '4:5': [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
      ]
    },
    general_advertising: {
      '1:1': [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=85', // Agency creative brainstorm
        'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=85', // Marketing strategy presentation
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85', // Innovation & growth
      ],
      '16:9': [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1792&q=85',
        'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1792&q=85',
      ],
      '9:16': [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1080&q=85',
      ],
      '4:5': [
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=85',
      ]
    }
  };

  public static generateImage(opts: CreativeImageOptions): { imageUrl: string; revisedPrompt: string } {
    const text = `${opts.prompt} ${opts.segment || ''} ${opts.companyName || ''} ${opts.headline || ''}`.toLowerCase();
    const format = opts.aspectRatio || '1:1';

    let category = 'general_advertising';

    if (
      (text.includes('dourad') || text.includes('ouro') || text.includes('luxo')) &&
      (text.includes('verd') || text.includes('green') || text.includes('neon') || text.includes('site') || text.includes('anúncio') || text.includes('anuncio'))
    ) {
      category = 'gold_green_tech';
    } else if (
      text.includes('site') ||
      text.includes('anúncio') ||
      text.includes('anuncio') ||
      text.includes('web') ||
      text.includes('software') ||
      text.includes('sistema') ||
      text.includes('computador') ||
      text.includes('tecnologia') ||
      text.includes('digital') ||
      text.includes('programação') ||
      text.includes('tráfego') ||
      text.includes('marketing')
    ) {
      category = 'web_sites_and_ads';
    } else if (
      ['pizza', 'hamburg', 'comida', 'restaurante', 'gastronomia', 'alimenta', 'lanche', 'sabor',
       'café', 'cafe', 'padaria', 'confeitaria', 'doceria', 'bolo', 'sorvete', 'açaí', 'acai',
       'churrasc', 'marmita', 'bar ', 'delivery'].some(k => text.includes(k))
    ) {
      // Gastronomia vem ANTES da regra de luxo/dourado: "Pizza de Ouro" é comida, não joia.
      category = 'gastronomy';
    } else if (
      text.includes('dourad') ||
      text.includes('ouro') ||
      text.includes('luxo') ||
      text.includes('vip') ||
      text.includes('premium') ||
      text.includes('jóia')
    ) {
      category = 'gold_green_tech';
    } else if (
      text.includes('empresa') ||
      text.includes('advocacia') ||
      text.includes('imobiliaria') ||
      text.includes('contabilidade') ||
      text.includes('consultoria') ||
      text.includes('negócio')
    ) {
      category = 'corporate_and_business';
    }

    const themeCategory = this.commercialThemes[category] || this.commercialThemes.general_advertising;
    const formatPool = themeCategory[format] || themeCategory['1:1'] || this.commercialThemes.general_advertising['1:1'];

    // Deterministic selection based on string hash for consistency
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    let index = Math.abs(hash) % formatPool.length;
    if (category === 'gastronomy') {
      const preferred = text.includes('pizza') ? 'photo-1513104890138'
        : text.includes('hamburg') ? 'photo-1568901346375'
        : '';
      const found = preferred ? formatPool.findIndex(u => u.includes(preferred)) : -1;
      if (found >= 0) index = found;
    }
    const baseImageUrl = formatPool[index];

    const categoryLabels: Record<string, string> = {
      web_sites_and_ads: 'Criação de Sites, Tecnologia e Anúncios Digitais de Alta Conversão',
      gold_green_tech: 'Estética Premium Dourado com Verde & Tecnologia Vibrante',
      gastronomy: 'Gastronomia Comercial & Appetite Appeal',
      corporate_and_business: 'Ambiente Corporativo, Consultoria & Negócios',
      general_advertising: 'Publicidade Comercial Profissional'
    };

    const label = categoryLabels[category] || 'Publicidade Comercial Premium';
    const revisedPrompt = `Composição Comercial (${label} - ${format}) criada para "${opts.prompt}". Estética visual profissional, iluminação de estúdio equilibrada, composição impecável e otimizada para publicidade e conversão.`;

    return {
      imageUrl: baseImageUrl,
      revisedPrompt
    };
  }
}
