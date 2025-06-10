// Image configuration for Cupcake Lab chatbot
// This file contains all image definitions and can be easily updated without touching the core service

export interface ImageDefinition {
  filename: string;
  keywords: string[];
  description: string;
  category?: 'cupcakes' | 'baking-equipment' | 'cakes' | 'diy-kits' | 'general' | 'cake tins';
  prices?: {
    [key: string]: number | string | {
      base_price?: number | string;
      pull_apart_charge?: number;
      fondant_board_charge?: number;
      [key: string]: any;
    };
  };
}

export const imageConfig: ImageDefinition[] = [
  // Cupcakes
  {
    filename: '1-cupcakes.jpeg',
    keywords: [
      'cupcake', 'cupcakes', 'basic', 'simple', 'classic', 'dessert', 'sweet', 
      'baking', 'cake', 'frosting', 'treat', 'party', 'celebration', 'menu', 'products'
    ],
    description: 'CupcakeLab 2025 cupcake menu with updated regular and mini cupcake prices and flavors.',
    prices: {
      "Banana Crumb": { regular: 70, mini: 30 },
      "Chocolate + buttercream": { regular: 95, mini: 40 },
      "Red Velvet + buttercream": { regular: 95, mini: 40 },
      "Butter cake + Lemon curd + BC": { regular: 100, mini: 40 },
      "Red Velvet + cream cheese": { regular: 110, mini: 45 },
      "Almond Brownie": { regular: 95, mini: 40 },
      "Peanut Butter Smores": { regular: 95, mini: 40 },
      "Lemon Butter + buttercream": { regular: 95, mini: 40 },
      "Oreo Surprise": { regular: 115, mini: 45 },
      "Ube + Ube Mascarpone": { regular: 120, mini: 50 },
      "Carrot + Cream cheese": { regular: 120, mini: 50 },
      "Green Tea": { regular: 120, mini: 50 },
      "Strawberry Lava": { regular: 140, mini: 50 },
      "Tiramisu": { regular: 130, mini: 55 },
      "Cheesecake": { regular: 120, mini: 55 },
      "Chocolate Caramel": { regular: 140, mini: 60 },
      "Oreo Red Velvet": { regular: 120, mini: 60 },
      "Chocolate Chip": { regular: 140, mini: 60 },
      "Orange Liqueur": { regular: 130, mini: 60 },
      "Ferrero": { regular: 140, mini: 60 },
      "Reese's": { regular: 130, mini: 60 },
      "Jack Black": { regular: 140, mini: 60 }
    },
    category: 'cupcakes'
  },
  {
  "filename": "2-custom-cupcakes.jpeg",
  "keywords": [
    "cupcake", "custom cupcakes", "buttercream", "tinting", "2D topper", 
    "3D topper", "icing sheet", "fondant", "decoration", "treat", 
    "celebration", "party", "cake topper", "personalized", "menu", "add-ons"
  ],
  "description": "CupcakeLab 2025 custom cupcake menu featuring buttercream decoration, 2D and 3D toppers, edible icing sheet toppers, and additional options like candles, greeting cards, and individual boxes.",
  "prices": {
    "buttercream_tinting": 25,
    "2d_topper": 70,
    "3d_topper": {
      "starting_price": 90
    },
    "edible_icing_sheet_topper": 60,
    "additional_options": {
      "cardstock_topper": 150,
      "acrylic_topper": 350,
      "fondant_letters": 100,
      "candle": 10,
      "greeting_card": 15,
      "individual_box_top_window": 10,
      "individual_box_showcase": 15
    }
  },
  "category": "cupcakes"
},
  {
  "filename": "3-custom-cupcakes.jpeg",
  "keywords": [
    "cupcake", "custom cupcakes", "red velvet", "dessert", "sweet", "baking", "cake", "frosting", "menu"
  ],
  "description": `CupcakeLab 2025 Custom Cupcakes Menu

• Pull-Apart Letter/Number: Quoted based on design. Choose your cupcake flavor and let us know your desired design!
• Monogram Cupcakes: 5-7 cupcakes in your choice of colors, letter or number, mixed with cake pops and chocolates. Flavors: red velvet, chocolate, or butter. P2,000.00 per letter or number.
  - Price: Cupcake + Design + Php500 pull-apart charge for board base; Php1200 for fondant board.
• Cupcake Bouquet: 12 cupcakes (max 2 flavors), color scheme of your choice, with ribbon and card. Flavors: red velvet, chocolate, or butter. P2,000.00.
• Cupcake Bouquet 3D: 7 cupcakes (1 flavor), color scheme of your choice, boxed with ribbon and card. Flavors: red velvet, chocolate, or butter. P2,000.00.

*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*`,
  "prices": {
    "monogram_cupcakes": 2000,
    "pull_apart_letter_number": {
      "base_price": "quoted based on design",
      "pull_apart_charge": 500,
      "fondant_board_charge": 1200
    },
    "cupcake_bouquet": 2000,
    "cupcake_bouquet_3d": 2000
  },
  "category": "cupcakes"
},


  // Basic Cakes
  {
    filename: '4-basic-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'basic', 'simple', 'classic', 'dessert', 'sweet', 
      'baking', 'birthday', 'celebration', 'party', 'round', 'layer'
    ],
    description: `CupcakeLab 2025 Basic Cakes Menu

• Red Velvet Cake: Our best-seller! Ultra moist red velvet cake, cream cheese frosting, topped with white chocolate shavings.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00
• Chocolate Chip Cake: Chocolate chip cake, cookie dough buttercream, topped with chocolate chip cookies.
  6" P1,500.00 | 8" P1,850.00 | 10" P2,350.00
• Chocolate Cake: Our take on the classic chocolate cake. Decadent cake with rich chocolate frosting.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00
• Carrot Cake: Moist carrot cake with cream cheese frosting and walnuts, topped with sugar carrot decorations.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00

*Each basic cake has 2 layers of cake. Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*`,
    prices: {
      "Red Velvet Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Chocolate Chip Cake": { "6\"": 1500, "8\"": 1850, "10\"": 2350 },
      "Chocolate Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Carrot Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 }
    },
    category: 'cakes'
  },
  {
    filename: '5-basic-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'basic', 'ube', 'coffee', 'bibingka', 'bacon', 'cheesecake', 'dessert', 'sweet', 
      'baking', 'birthday', 'celebration', 'party', 'round', 'layer'
    ],
    description: `CupcakeLab 2025 Basic Cakes Menu

• Ube Halaya: Moist yet fluffy ube cake, filled with swiss buttercream and ube halaya, frosted with ube swiss buttercream and ube cake crumbs.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00
• Dark Roast Coffee: Moist coffee cake made from coffee extract house-made from Sagada beans, covered in a smooth Mexican frosting.
  6" P1,500.00 | 8" P1,850.00 | 10" P2,350.00
• Bibingka Cheesecake: Fluffy and creamy cheesecake, with a graham crust, topped with duck egg / pulang itlog.
  6" P1,200.00
• Bacon Butter: Brown sugar pound cake, studded with fried country bacon, frosted with swiss buttercream and cheddar cheese.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00

*Each basic cake has 2 layers of cake. Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*`,
    prices: {
      "Ube Halaya": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Dark Roast Coffee": { "6\"": 1500, "8\"": 1850, "10\"": 2350 },
      "Bibingka Cheesecake": { "6\"": 1200 },
      "Bacon Butter": { "6\"": 1200, "8\"": 1600, "10\"": 2000 }
    },
    category: 'cakes'
  },
  {
    filename: '6-basic-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'basic', 'chocolate bacon', 'mini cake sampler', 'sento cakes', 'individual packaging', 'dessert', 'sweet', 
      'baking', 'birthday', 'celebration', 'party', 'round', 'layer', '2025 menu'
    ],
    description: `CupcakeLab 2025 Basic Cakes Menu\n\n• Chocolate Bacon: Brown sugar pound cake, studded with fried country bacon, frosted with soft and silky chocolate frosting.\n  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00\n• Mini Cake Sampler: Four inch cakes of our best-selling flavors, Red Velvet, Carrot, Chocolate and Chocolate Chip.\n  P2,000.00\n• Sento Cakes (Individual Packaging):\n  Lemon Butter P500 | Ube Halaya P600 | Red Velvet P550 | Dark Roast Coffee P500 | Chocolate Yema P500 | Matcha P600 | Carrot P600 | Butter Bacon P600 | Chocolate Chip P600 | Chocolate Bacon P600\n\n*Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*`,
    prices: {
      "Chocolate Bacon": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Mini Cake Sampler": 2000,
      "Sento Cakes": {
        "Lemon Butter": 500,
        "Ube Halaya": 600,
        "Red Velvet": 550,
        "Dark Roast Coffee": 500,
        "Chocolate Yema": 500,
        "Matcha": 600,
        "Carrot": 600,
        "Butter Bacon": 600,
        "Chocolate Chip": 600,
        "Chocolate Bacon": 600
      }
    },
    category: 'cakes'
  },

  {
  "filename": "7-cake-tins.jpeg",
  "keywords": [
    "cake", "cake tins", "tiramisu", "red velvet", "chocolate chip", 
    "matcha", "ube", "dark roast", "butter bacon", "chocolate bacon", 
    "brownie", "party cake", "sharing size", "solo size", 
    "cupcake lab", "menu", "2025", "dessert", "car pickup"
  ],
  "description": "CupcakeLab 2025 Cake Tins Menu featuring a variety of flavors in Solo (300ml), Sharing (1000ml), and Party (3000ml) sizes with pricing and delivery information.",
  "prices": {
    "Tiramisu": {
      "solo": 350,
      "sharing": 750,
      "party": 2500
    },
    "Lemon Butter": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Red Velvet": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Chocolate Chip": {
      "solo": 500,
      "sharing": 1000,
      "party": 4000
    },
    "Chocolate Caramel": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Carrot": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Matcha": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Ube Halaya": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Dark Roast Coffee": {
      "solo": 350,
      "sharing": 750,
      "party": 2500
    },
    "Butter Bacon": {
      "solo": 450,
      "sharing": 1000,
      "party": 4000
    },
    "Chocolate Bacon": {
      "solo": 450,
      "sharing": 1000,
      "party": 4000
    },
    "The Brownie": {
      "solo": 500,
      "sharing": 1000,
      "party": 4000
    }
  },
  "category": "cake tins"
},


  // Custom Cakes
  {
    filename: '8-custom-cakes-3.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', 'fondant', 'ganache', 'buttercream', 'dummy', 'styro', '3d character', 'gravity-defying', 'flavor options'
    ],
    description: `CupcakeLab 2025 Custom Cakes Menu\n\nFondant/Ganache (per layer):\n• 6": P9,000.00\n• 8": P10,000.00\n• 9": P11,500.00\n• 10": P12,500.00\n• 12": P14,000.00\n• 14": P15,500.00\n\nButtercream (per layer):\n• 8": P9,000.00\n• 10": P10,000.00\n• 12": P11,500.00\n• 14": P11,500.00\n\nDummy/Styro Layer (per layer):\n• 6": P5,000.00\n• 8": P6,000.00\n• 10": P7,000.00\n• 12": P8,000.00\n• 14": P9,500.00\n\nAdditional 3D Character: P500.00\nConvert to 3-Dimensional: ×1.3 of the layer rate\nConvert to gravity-defying: ×1.3 of the layer rate\n\nFlavor options: Red Velvet, Chocolate Caramel, Chocolate Chip, Lemon Butter, Butter, Choco Yema, Ube, Dark Roast Coffee\n\n*Each layer comes with 1 piece 3D character.*`,
    prices: {
      fondant_ganache: {
        "6\"": 9000,
        "8\"": 10000,
        "9\"": 11500,
        "10\"": 12500,
        "12\"": 14000,
        "14\"": 15500
      },
      buttercream: {
        "8\"": 9000,
        "10\"": 10000,
        "12\"": 11500,
        "14\"": 11500
      },
      dummy_styro: {
        "6\"": 5000,
        "8\"": 6000,
        "10\"": 7000,
        "12\"": 8000,
        "14\"": 9500
      },
      additional_3d_character: 500,
      convert_3d: '×1.3 of the layer rate',
      convert_gravity_defying: '×1.3 of the layer rate'
    },
    category: 'cakes'
  },
  {
    filename: '11-custom-cakes-2.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', 'bento', 'dessert box', 'cake bouquet', '2d topper', 'pinata', 'sugar cookies', 'cakesicle', 'marshmallows', 'meringue', 'heart-shaped', 'bouquet', 'buttercream', '2025 menu'
    ],
    description: `CupcakeLab 2025 Custom Cakes & Party Sets\n\n• Bento Party: A custom decorated set of 4\" bento cake + 8 cupcakes. Choose 1 flavor for the bento and another for the cupcakes! Design includes 4 2D toppers. Flavors: red velvet, chocolate, carrot, and chocolate chip.\n  P2,000.00\n• Dessert Box: Heart-shaped pinata with a heart-shaped cake inside, 4 sugar cookies, 2 chocolate covered Oreos, and one cakesicle, surrounded with marshmallows, sprinkles, and meringue! Cake flavors: red velvet, chocolate, carrot, and chocolate chip.\n  P3,000.00\n• Cake Bouquet: Buttercream cake, wrapped and packaged like a bouquet. Flavors: Chocolate, Red Velvet, Chocolate Chip, or Carrot.\n  6\" round: P3,500.00 | 8\" round: P4,500.00\n\n*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*`,
    prices: {
      bento_party: 2000,
      dessert_box: 3000,
      cake_bouquet: { "6\" round": 3500, "8\" round": 4500 }
    },
    category: 'cakes'
  },
  {
    filename: '12-custom-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'customizable', 'bento', 'pinata', 'number cake', 'letter cake', 'jumbo cupcake', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', '2025 menu'
    ],
    description: `CupcakeLab 2025 Customizable Cakes Menu\n\n• Bento Cakes: Adorable mini cakes with designs that are customizable to fit any theme. Flavors: chocolate, chocolate chip, red velvet, and butter. Individually packed (1pc cake): P500.00 | Box of 4 bento cakes: P3,000.00\n• Pinata Cake: A unique dessert that comes with a wooden mallet for you to smash the cake and find goodies and treats inside! P2,300.00\n• Number/Letter Cake: A whole cake sliced to form your desired number or letter, perfect for birthdays or anniversaries! Buttercream: P5,000.00 | Fondant: P6,500.00\n• 6\" Jumbo Cupcake: Christmas decorated 6\" cupcake-shaped cake. Flavors: Chocolate, Red Velvet, Carrot & Butter. 6\": P2,500.00\n\n*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*`,
    prices: {
      bento_cake: { individual: 500, box_of_4: 3000 },
      pinata_cake: 2300,
      number_letter_cake: { buttercream: 5000, fondant: 6500 },
      jumbo_cupcake_6in: 2500
    },
    category: 'cakes'
  },
  {
    "filename": "13-other-desserts.jpeg",
    "keywords": [
      "dessert", "desserts", "treats", "sweets", "pastry", "specialty", "variety", "menu", "options", "delicious", "sugar cookies", "cake pops", "cakesicle", "baked donuts", "brownies", "cookies", "2025 menu"
    ],
    "description": `CupcakeLab 2025 Other Desserts Menu\n\n• Sugar Cookies: Decorated to match your event theme. Minimum: 12pcs. Price subject to design.\n  2\"x2\": P60.00 each | 3\"x3\": P80.00 each | 4\"x4\": P100.00 each\n• Cake Pops: Round cake pops covered in chocolate, themed. Flavors: red velvet or chocolate. Minimum: 12pcs.\n  Color & Sprinkles: P75.00 each | 3D Character: P100.00 each | Cupcake Bouquet of 6: P700.00\n• Cakesicles: Popsicle-shaped cake pops, themed. Flavors: red velvet or chocolate. Minimum: 12pcs.\n  Color & Sprinkles: P120.00 each | 3D Character: P140.00 each\n• Baked Donuts: With chocolate or maple glaze, themed. Minimum: 12pcs.\n  Color & Sprinkles: P70.00 each | 2D Design: P90.00 each | 3D Design: P120.00 each\n• Other Desserts:\n  Fudge Brownies 2x2: P40.00 each, min 12pcs\n  Chocolate Dipped Brownies: P50.00 each, min 12pcs\n  Double Chocolate Oatmeal Cookies: P35.00 each, min 6pcs`,
    "prices": {
      sugar_cookies: {
        '2x2': 60,
        '3x3': 80,
        '4x4': 100,
        minimum: 12,
        note: 'Price subject to design'
      },
      cake_pops: {
        color_sprinkles: 75,
        character_3d: 100,
        bouquet_6: 700,
        minimum: 12
      },
      cakesicles: {
        color_sprinkles: 120,
        character_3d: 140,
        minimum: 12
      },
      baked_donuts: {
        color_sprinkles: 70,
        design_2d: 90,
        design_3d: 120,
        minimum: 12
      },
      fudge_brownies_2x2: { price: 40, minimum: 12 },
      chocolate_dipped_brownies: { price: 50, minimum: 12 },
      double_chocolate_oatmeal_cookies: { price: 35, minimum: 6 }
    },
    category: 'general'
  },
  {
    "filename": "14-chewy-cookies.jpeg",
    "keywords": [
      "cookie", "cookies", "chewy", "soft", "baked", "treats", "dessert", "sweet", "snack", "chocolate chip", "red velvet", "oreo", "stuffed", "homemade", "2025 menu"
    ],
    "description": `CupcakeLab 2025 Chewy Cookies Menu\n\n• Red Velvet Chewy Choco Chip Cookies: Bite-size portions, studded with Hershey’s cream cheese chocolate chips.\n• Chewy Choco Chip Cookies: Bite-size portions, studded with Hershey’s semi-sweet chocolate chips.\n  Box of 12 (3.5\"x5\"x1\"): P150\n  12pcs/120g/300ml (4\"x3\"): P170\n  25pcs/250g/500ml (5\"x3.5\"): P350\n  50pcs/500g/1L (5\"x4.75\"): P650\n• Oreo Stuffed Cookies: Chewy choco chip cookies, stuffed with a whole Oreo.\n• Oreo Stuffed Red Velvet Cookies: Chewy red velvet cookies, stuffed with a whole Oreo.\n  7pcs/250g: P350\n  15pcs/500g: P650\n  45pcs/2kg: P1,950`,
    prices: {
      red_velvet_chewy_choco_chip: {
        box_12: 150,
        pack_12_120g_300ml: 170,
        pack_25_250g_500ml: 350,
        pack_50_500g_1l: 650
      },
      chewy_choco_chip: {
        box_12: 150,
        pack_12_120g_300ml: 170,
        pack_25_250g_500ml: 350,
        pack_50_500g_1l: 650
      },
      oreo_stuffed_cookies: {
        pack_7_250g: 350,
        pack_15_500g: 650,
        pack_45_2kg: 1950
      },
      oreo_stuffed_red_velvet: {
        pack_7_250g: 350,
        pack_15_500g: 650,
        pack_45_2kg: 1950
      }
    },
    category: 'general'
  },
  {
    "filename": "15-diy-kits.jpeg",
    "keywords": [
      "diy", "kit", "kits", "do it yourself", "home baking", "baking kit", "learn", "tutorial", "ingredients", "instructions", "family fun", "cupcake kit", "pinata kit", "2025 menu"
    ],
    "description": `CupcakeLab 2025 DIY Kits Menu\n\n• 2-Cupcake DIY Kit: Minimum 5 kits. Each kit includes 2 cupcakes, 2 fondant toppers (2 colors), 2 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P350.00\n• 4-Cupcake DIY Kit: Minimum 5 kits. Each kit includes 4 cupcakes, 4 fondant toppers (4 colors), 3 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P550.00\n• DIY Pinata Kit: Minimum 5 kits. Each kit includes 1 chocolate pinata, wooden mallet, marshmallows & meringue, 4 cupcakes, 4 fondant toppers (4 colors), 3 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P1,100.00\n\n*Minimum of 5 kits for customized kits. Final price will depend on agreed upon design.*`,
    "prices": {
      diy_2cupcake_kit: { min_order: 5, price: 350 },
      diy_4cupcake_kit: { min_order: 5, price: 550 },
      diy_pinata_kit: { min_order: 5, price: 1100 },
      custom_kit: { min_order: 5, price: 'depends on design' }
    },
    "category": "diy-kits"
  }
];

// Response templates for different image categories
export const responseTemplates = {
  cupcakes: `Welcome to Cupcake Lab! 🧁 We specialize in custom decorated cupcakes that are perfect for any celebration. Here are some examples of our beautiful creations:

*Minimum order: 6 pcs for regular cupcakes (same flavor)*
*We make one of the best Red Velvets in Manila!* 😊

Feel free to ask about our flavors and custom designs!`,

  cakes: `Check out our beautiful cakes! 🎂 We create both basic and custom cakes for all occasions:

*Basic cakes: Available in various sizes and flavors*
*Custom designs available with 7-day lead time*
*Perfect for weddings, birthdays, and special celebrations!*

What type of cake are you looking for?`,

  'baking-equipment': `Great question about baking! 👩‍🍳 We also offer professional baking equipment and tools:

*Professional-grade cake tins and baking pans*
*Perfect for achieving bakery-quality results at home*
*Available for purchase or as part of our DIY kits*

Interested in our baking supplies?`,

  'diy-kits': `Love baking at home? 👩‍🍳 Our DIY kits make it easy and fun:

*Minimum order: 5 kits per order*
*Everything you need to create delicious treats at home!*
*Includes ingredients, tools, and step-by-step instructions*
*Perfect for family bonding and learning new skills*

Which DIY kit interests you most?`,

  general: `Here are some wonderful options from our Cupcake Lab collection! 🍰

We offer a wide variety of treats including:
• Custom cupcakes and cakes
• Gift packages and corporate orders
• Specialty desserts and cookies
• DIY baking kits

What would you like to know more about?`
};

// Keywords that indicate explicit image requests
export const imageRequestKeywords = [
  'show me', 'picture', 'photo', 'image', 'images', 'see', 'look', 'view', 'display',
  'what does', 'how does', 'what do', 'how do', 'example', 'examples', 'sample', 'samples',
  'can i see', 'let me see', 'show', 'showcase', 'gallery', 'portfolio',
  'what looks like', 'appearance', 'visual', 'design', 'style'
];

export const allImagesMetadata = [
  {
    "filename": "1-cupcakes.jpeg",
    "keywords": [
      "cupcake", "cupcakes", "basic", "simple", "classic", "dessert", "sweet", 
      "baking", "cake", "frosting", "treat", "party", "celebration", "menu", "products"
    ],
    "description": "CupcakeLab 2025 cupcake menu with updated regular and mini cupcake prices and flavors.",
    "prices": {
      "Banana Crumb": { "regular": 70, "mini": 30 },
      "Chocolate + buttercream": { "regular": 95, "mini": 40 },
      "Red Velvet + buttercream": { "regular": 95, "mini": 40 },
      "Butter cake + Lemon curd + BC": { "regular": 100, "mini": 40 },
      "Red Velvet + cream cheese": { "regular": 110, "mini": 45 },
      "Almond Brownie": { "regular": 95, "mini": 40 },
      "Peanut Butter Smores": { "regular": 95, "mini": 40 },
      "Lemon Butter + buttercream": { "regular": 95, "mini": 40 },
      "Oreo Surprise": { "regular": 115, "mini": 45 },
      "Ube + Ube Mascarpone": { "regular": 120, "mini": 50 },
      "Carrot + Cream cheese": { "regular": 120, "mini": 50 },
      "Green Tea": { "regular": 120, "mini": 50 },
      "Strawberry Lava": { "regular": 140, "mini": 50 },
      "Tiramisu": { "regular": 130, "mini": 55 },
      "Cheesecake": { "regular": 120, "mini": 55 },
      "Chocolate Caramel": { "regular": 140, "mini": 60 },
      "Oreo Red Velvet": { "regular": 120, "mini": 60 },
      "Chocolate Chip": { "regular": 140, "mini": 60 },
      "Orange Liqueur": { "regular": 130, "mini": 60 },
      "Ferrero": { "regular": 140, "mini": 60 },
      "Reese's": { "regular": 130, "mini": 60 },
      "Jack Black": { "regular": 140, "mini": 60 }
    },
    "category": "cupcakes"
  },
  {
    "filename": "2-custom-cupcakes.jpeg",
    "keywords": [
      "cupcake", "custom cupcakes", "buttercream", "tinting", "2D topper", 
      "3D topper", "icing sheet", "fondant", "decoration", "treat", 
      "celebration", "party", "cake topper", "personalized", "menu", "add-ons"
    ],
    "description": "CupcakeLab 2025 custom cupcake menu featuring buttercream decoration, 2D and 3D toppers, edible icing sheet toppers, and additional options like candles, greeting cards, and individual boxes.",
    "prices": {
      "buttercream_tinting": 25,
      "2d_topper": 70,
      "3d_topper": {
        "starting_price": 90
      },
      "edible_icing_sheet_topper": 60,
      "additional_options": {
        "cardstock_topper": 150,
        "acrylic_topper": 350,
        "fondant_letters": 100,
        "candle": 10,
        "greeting_card": 15,
        "individual_box_top_window": 10,
        "individual_box_showcase": 15
      }
    },
    "category": "cupcakes"
  },
  {
    "filename": "3-custom-cupcakes.jpeg",
    "keywords": [
      "cupcake", "custom cupcakes", "red velvet", "dessert", "sweet", "baking", "cake", "frosting", "menu"
    ],
    "description": "CupcakeLab 2025 Custom Cupcakes Menu\n\n• Pull-Apart Letter/Number: Quoted based on design. Choose your cupcake flavor and let us know your desired design!\n• Monogram Cupcakes: 5-7 cupcakes in your choice of colors, letter or number, mixed with cake pops and chocolates. Flavors: red velvet, chocolate, or butter. P2,000.00 per letter or number.\n  - Price: Cupcake + Design + Php500 pull-apart charge for board base; Php1200 for fondant board.\n• Cupcake Bouquet: 12 cupcakes (max 2 flavors), color scheme of your choice, with ribbon and card. Flavors: red velvet, chocolate, or butter. P2,000.00.\n• Cupcake Bouquet 3D: 7 cupcakes (1 flavor), color scheme of your choice, boxed with ribbon and card. Flavors: red velvet, chocolate, or butter. P2,000.00.\n\n*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*",
    "prices": {
      "monogram_cupcakes": 2000,
      "pull_apart_letter_number": {
        "base_price": "quoted based on design",
        "pull_apart_charge": 500,
        "fondant_board_charge": 1200
      },
      "cupcake_bouquet": 2000,
      "cupcake_bouquet_3d": 2000
    },
    "category": "cupcakes"
  },
  {
    "filename": "4-basic-cakes.jpeg",
    "keywords": [
      "cake", "cakes", "basic", "simple", "classic", "dessert", "sweet", 
      "baking", "birthday", "celebration", "party", "round", "layer"
    ],
    "description": "CupcakeLab 2025 Basic Cakes Menu\n\n• Red Velvet Cake: Our best-seller! Ultra moist red velvet cake, cream cheese frosting, topped with white chocolate shavings.\n  6\" P1,200.00 | 8\" P1,600.00 | 10\" P2,000.00\n• Chocolate Chip Cake: Chocolate chip cake, cookie dough buttercream, topped with chocolate chip cookies.\n  6\" P1,500.00 | 8\" P1,850.00 | 10\" P2,350.00\n• Chocolate Cake: Our take on the classic chocolate cake. Decadent cake with rich chocolate frosting.\n  6\" P1,200.00 | 8\" P1,600.00 | 10\" P2,000.00\n• Carrot Cake: Moist carrot cake with cream cheese frosting and walnuts, topped with sugar carrot decorations.\n  6\" P1,200.00 | 8\" P1,600.00 | 10\" P2,000.00\n\n*Each basic cake has 2 layers of cake. Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*",
    "prices": {
      "Red Velvet Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Chocolate Chip Cake": { "6\"": 1500, "8\"": 1850, "10\"": 2350 },
      "Chocolate Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Carrot Cake": { "6\"": 1200, "8\"": 1600, "10\"": 2000 }
    },
    category: 'cakes'
  },
  {
    "filename": "5-basic-cakes.jpeg",
    "keywords": [
      "cake", "cakes", "basic", "ube", "coffee", "bibingka", "bacon", "cheesecake", "dessert", "sweet", 
      "baking", "birthday", "celebration", "party", "round", "layer"
    ],
    "description": `CupcakeLab 2025 Basic Cakes Menu

• Ube Halaya: Moist yet fluffy ube cake, filled with swiss buttercream and ube halaya, frosted with ube swiss buttercream and ube cake crumbs.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00
• Dark Roast Coffee: Moist coffee cake made from coffee extract house-made from Sagada beans, covered in a smooth Mexican frosting.
  6" P1,500.00 | 8" P1,850.00 | 10" P2,350.00
• Bibingka Cheesecake: Fluffy and creamy cheesecake, with a graham crust, topped with duck egg / pulang itlog.
  6" P1,200.00
• Bacon Butter: Brown sugar pound cake, studded with fried country bacon, frosted with swiss buttercream and cheddar cheese.
  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00

*Each basic cake has 2 layers of cake. Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*`,
    "prices": {
      "Ube Halaya": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Dark Roast Coffee": { "6\"": 1500, "8\"": 1850, "10\"": 2350 },
      "Bibingka Cheesecake": { "6\"": 1200 },
      "Bacon Butter": { "6\"": 1200, "8\"": 1600, "10\"": 2000 }
    },
    category: 'cakes'
  },
  {
    filename: '6-basic-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'basic', 'chocolate bacon', 'mini cake sampler', 'sento cakes', 'individual packaging', 'dessert', 'sweet', 
      'baking', 'birthday', 'celebration', 'party', 'round', 'layer', '2025 menu'
    ],
    description: `CupcakeLab 2025 Basic Cakes Menu\n\n• Chocolate Bacon: Brown sugar pound cake, studded with fried country bacon, frosted with soft and silky chocolate frosting.\n  6" P1,200.00 | 8" P1,600.00 | 10" P2,000.00\n• Mini Cake Sampler: Four inch cakes of our best-selling flavors, Red Velvet, Carrot, Chocolate and Chocolate Chip.\n  P2,000.00\n• Sento Cakes (Individual Packaging):\n  Lemon Butter P500 | Ube Halaya P600 | Red Velvet P550 | Dark Roast Coffee P500 | Chocolate Yema P500 | Matcha P600 | Carrot P600 | Butter Bacon P600 | Chocolate Chip P600 | Chocolate Bacon P600\n\n*Delivery rate will depend on location, pickup is free. For cakes, we recommend car pickup/delivery.*`,
    prices: {
      "Chocolate Bacon": { "6\"": 1200, "8\"": 1600, "10\"": 2000 },
      "Mini Cake Sampler": 2000,
      "Sento Cakes": {
        "Lemon Butter": 500,
        "Ube Halaya": 600,
        "Red Velvet": 550,
        "Dark Roast Coffee": 500,
        "Chocolate Yema": 500,
        "Matcha": 600,
        "Carrot": 600,
        "Butter Bacon": 600,
        "Chocolate Chip": 600,
        "Chocolate Bacon": 600
      }
    },
    category: 'cakes'
  },

  {
  "filename": "7-cake-tins.jpeg",
  "keywords": [
    "cake", "cake tins", "tiramisu", "red velvet", "chocolate chip", 
    "matcha", "ube", "dark roast", "butter bacon", "chocolate bacon", 
    "brownie", "party cake", "sharing size", "solo size", 
    "cupcake lab", "menu", "2025", "dessert", "car pickup"
  ],
  "description": "CupcakeLab 2025 Cake Tins Menu featuring a variety of flavors in Solo (300ml), Sharing (1000ml), and Party (3000ml) sizes with pricing and delivery information.",
  "prices": {
    "Tiramisu": {
      "solo": 350,
      "sharing": 750,
      "party": 2500
    },
    "Lemon Butter": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Red Velvet": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Chocolate Chip": {
      "solo": 500,
      "sharing": 1000,
      "party": 4000
    },
    "Chocolate Caramel": {
      "solo": 300,
      "sharing": 700,
      "party": 2500
    },
    "Carrot": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Matcha": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Ube Halaya": {
      "solo": 350,
      "sharing": 750,
      "party": 3000
    },
    "Dark Roast Coffee": {
      "solo": 350,
      "sharing": 750,
      "party": 2500
    },
    "Butter Bacon": {
      "solo": 450,
      "sharing": 1000,
      "party": 4000
    },
    "Chocolate Bacon": {
      "solo": 450,
      "sharing": 1000,
      "party": 4000
    },
    "The Brownie": {
      "solo": 500,
      "sharing": 1000,
      "party": 4000
    }
  },
  "category": "cake tins"
},


  // Custom Cakes
  {
    filename: '8-custom-cakes-3.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', 'fondant', 'ganache', 'buttercream', 'dummy', 'styro', '3d character', 'gravity-defying', 'flavor options'
    ],
    description: `CupcakeLab 2025 Custom Cakes Menu\n\nFondant/Ganache (per layer):\n• 6": P9,000.00\n• 8": P10,000.00\n• 9": P11,500.00\n• 10": P12,500.00\n• 12": P14,000.00\n• 14": P15,500.00\n\nButtercream (per layer):\n• 8": P9,000.00\n• 10": P10,000.00\n• 12": P11,500.00\n• 14": P11,500.00\n\nDummy/Styro Layer (per layer):\n• 6": P5,000.00\n• 8": P6,000.00\n• 10": P7,000.00\n• 12": P8,000.00\n• 14": P9,500.00\n\nAdditional 3D Character: P500.00\nConvert to 3-Dimensional: ×1.3 of the layer rate\nConvert to gravity-defying: ×1.3 of the layer rate\n\nFlavor options: Red Velvet, Chocolate Caramel, Chocolate Chip, Lemon Butter, Butter, Choco Yema, Ube, Dark Roast Coffee\n\n*Each layer comes with 1 piece 3D character.*`,
    prices: {
      fondant_ganache: {
        "6\"": 9000,
        "8\"": 10000,
        "9\"": 11500,
        "10\"": 12500,
        "12\"": 14000,
        "14\"": 15500
      },
      buttercream: {
        "8\"": 9000,
        "10\"": 10000,
        "12\"": 11500,
        "14\"": 11500
      },
      dummy_styro: {
        "6\"": 5000,
        "8\"": 6000,
        "10\"": 7000,
        "12\"": 8000,
        "14\"": 9500
      },
      additional_3d_character: 500,
      convert_3d: '×1.3 of the layer rate',
      convert_gravity_defying: '×1.3 of the layer rate'
    },
    category: 'cakes'
  },
  {
    filename: '11-custom-cakes-2.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', 'bento', 'dessert box', 'cake bouquet', '2d topper', 'pinata', 'sugar cookies', 'cakesicle', 'marshmallows', 'meringue', 'heart-shaped', 'bouquet', 'buttercream', '2025 menu'
    ],
    description: `CupcakeLab 2025 Custom Cakes & Party Sets\n\n• Bento Party: A custom decorated set of 4\" bento cake + 8 cupcakes. Choose 1 flavor for the bento and another for the cupcakes! Design includes 4 2D toppers. Flavors: red velvet, chocolate, carrot, and chocolate chip.\n  P2,000.00\n• Dessert Box: Heart-shaped pinata with a heart-shaped cake inside, 4 sugar cookies, 2 chocolate covered Oreos, and one cakesicle, surrounded with marshmallows, sprinkles, and meringue! Cake flavors: red velvet, chocolate, carrot, and chocolate chip.\n  P3,000.00\n• Cake Bouquet: Buttercream cake, wrapped and packaged like a bouquet. Flavors: Chocolate, Red Velvet, Chocolate Chip, or Carrot.\n  6\" round: P3,500.00 | 8\" round: P4,500.00\n\n*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*`,
    prices: {
      bento_party: 2000,
      dessert_box: 3000,
      cake_bouquet: { "6\" round": 3500, "8\" round": 4500 }
    },
    category: 'cakes'
  },
  {
    filename: '12-custom-cakes.jpeg',
    keywords: [
      'cake', 'cakes', 'custom', 'customizable', 'bento', 'pinata', 'number cake', 'letter cake', 'jumbo cupcake', 'special', 'decorated', 'design', 'wedding', 
      'birthday', 'celebration', 'anniversary', 'party', 'elegant', 'beautiful', '2025 menu'
    ],
    description: `CupcakeLab 2025 Customizable Cakes Menu\n\n• Bento Cakes: Adorable mini cakes with designs that are customizable to fit any theme. Flavors: chocolate, chocolate chip, red velvet, and butter. Individually packed (1pc cake): P500.00 | Box of 4 bento cakes: P3,000.00\n• Pinata Cake: A unique dessert that comes with a wooden mallet for you to smash the cake and find goodies and treats inside! P2,300.00\n• Number/Letter Cake: A whole cake sliced to form your desired number or letter, perfect for birthdays or anniversaries! Buttercream: P5,000.00 | Fondant: P6,500.00\n• 6\" Jumbo Cupcake: Christmas decorated 6\" cupcake-shaped cake. Flavors: Chocolate, Red Velvet, Carrot & Butter. 6\": P2,500.00\n\n*Additional charge for flavors outside of the ones listed. Please refer to cupcake charges for options for additional decorations.*`,
    prices: {
      bento_cake: { individual: 500, box_of_4: 3000 },
      pinata_cake: 2300,
      number_letter_cake: { buttercream: 5000, fondant: 6500 },
      jumbo_cupcake_6in: 2500
    },
    category: 'cakes'
  },
  {
    "filename": "13-other-desserts.jpeg",
    "keywords": [
      "dessert", "desserts", "treats", "sweets", "pastry", "specialty", "variety", "menu", "options", "delicious", "sugar cookies", "cake pops", "cakesicle", "baked donuts", "brownies", "cookies", "2025 menu"
    ],
    "description": `CupcakeLab 2025 Other Desserts Menu\n\n• Sugar Cookies: Decorated to match your event theme. Minimum: 12pcs. Price subject to design.\n  2\"x2\": P60.00 each | 3\"x3\": P80.00 each | 4\"x4\": P100.00 each\n• Cake Pops: Round cake pops covered in chocolate, themed. Flavors: red velvet or chocolate. Minimum: 12pcs.\n  Color & Sprinkles: P75.00 each | 3D Character: P100.00 each | Cupcake Bouquet of 6: P700.00\n• Cakesicles: Popsicle-shaped cake pops, themed. Flavors: red velvet or chocolate. Minimum: 12pcs.\n  Color & Sprinkles: P120.00 each | 3D Character: P140.00 each\n• Baked Donuts: With chocolate or maple glaze, themed. Minimum: 12pcs.\n  Color & Sprinkles: P70.00 each | 2D Design: P90.00 each | 3D Design: P120.00 each\n• Other Desserts:\n  Fudge Brownies 2x2: P40.00 each, min 12pcs\n  Chocolate Dipped Brownies: P50.00 each, min 12pcs\n  Double Chocolate Oatmeal Cookies: P35.00 each, min 6pcs`,
    "prices": {
      sugar_cookies: {
        '2x2': 60,
        '3x3': 80,
        '4x4': 100,
        minimum: 12,
        note: 'Price subject to design'
      },
      cake_pops: {
        color_sprinkles: 75,
        character_3d: 100,
        bouquet_6: 700,
        minimum: 12
      },
      cakesicles: {
        color_sprinkles: 120,
        character_3d: 140,
        minimum: 12
      },
      baked_donuts: {
        color_sprinkles: 70,
        design_2d: 90,
        design_3d: 120,
        minimum: 12
      },
      fudge_brownies_2x2: { price: 40, minimum: 12 },
      chocolate_dipped_brownies: { price: 50, minimum: 12 },
      double_chocolate_oatmeal_cookies: { price: 35, minimum: 6 }
    },
    category: 'general'
  },
  {
    "filename": "14-chewy-cookies.jpeg",
    "keywords": [
      "cookie", "cookies", "chewy", "soft", "baked", "treats", "dessert", "sweet", "snack", "chocolate chip", "red velvet", "oreo", "stuffed", "homemade", "2025 menu"
    ],
    "description": `CupcakeLab 2025 Chewy Cookies Menu\n\n• Red Velvet Chewy Choco Chip Cookies: Bite-size portions, studded with Hershey’s cream cheese chocolate chips.\n• Chewy Choco Chip Cookies: Bite-size portions, studded with Hershey’s semi-sweet chocolate chips.\n  Box of 12 (3.5\"x5\"x1\"): P150\n  12pcs/120g/300ml (4\"x3\"): P170\n  25pcs/250g/500ml (5\"x3.5\"): P350\n  50pcs/500g/1L (5\"x4.75\"): P650\n• Oreo Stuffed Cookies: Chewy choco chip cookies, stuffed with a whole Oreo.\n• Oreo Stuffed Red Velvet Cookies: Chewy red velvet cookies, stuffed with a whole Oreo.\n  7pcs/250g: P350\n  15pcs/500g: P650\n  45pcs/2kg: P1,950`,
    prices: {
      red_velvet_chewy_choco_chip: {
        box_12: 150,
        pack_12_120g_300ml: 170,
        pack_25_250g_500ml: 350,
        pack_50_500g_1l: 650
      },
      chewy_choco_chip: {
        box_12: 150,
        pack_12_120g_300ml: 170,
        pack_25_250g_500ml: 350,
        pack_50_500g_1l: 650
      },
      oreo_stuffed_cookies: {
        pack_7_250g: 350,
        pack_15_500g: 650,
        pack_45_2kg: 1950
      },
      oreo_stuffed_red_velvet: {
        pack_7_250g: 350,
        pack_15_500g: 650,
        pack_45_2kg: 1950
      }
    },
    category: 'general'
  },
  {
    "filename": "15-diy-kits.jpeg",
    "keywords": [
      "diy", "kit", "kits", "do it yourself", "home baking", "baking kit", "learn", "tutorial", "ingredients", "instructions", "family fun", "cupcake kit", "pinata kit", "2025 menu"
    ],
    "description": `CupcakeLab 2025 DIY Kits Menu\n\n• 2-Cupcake DIY Kit: Minimum 5 kits. Each kit includes 2 cupcakes, 2 fondant toppers (2 colors), 2 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P350.00\n• 4-Cupcake DIY Kit: Minimum 5 kits. Each kit includes 4 cupcakes, 4 fondant toppers (4 colors), 3 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P550.00\n• DIY Pinata Kit: Minimum 5 kits. Each kit includes 1 chocolate pinata, wooden mallet, marshmallows & meringue, 4 cupcakes, 4 fondant toppers (4 colors), 3 kinds of sprinkles, buttercream, design guide, kit checklist. Starts at P1,100.00\n\n*Minimum of 5 kits for customized kits. Final price will depend on agreed upon design.*`,
    "prices": {
      diy_2cupcake_kit: { min_order: 5, price: 350 },
      diy_4cupcake_kit: { min_order: 5, price: 550 },
      diy_pinata_kit: { min_order: 5, price: 1100 },
      custom_kit: { min_order: 5, price: 'depends on design' }
    },
    "category": "diy-kits"
  }
];
