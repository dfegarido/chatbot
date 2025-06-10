# Image Configuration Guide

This guide explains how to update the chatbot's image responses by editing the configuration file.

## Configuration File Location
`src/config/images.ts`

## Current Available Images

The chatbot currently includes these 14 images from the `public/` folder:

### Cupcakes
- `1-cupcakes.jpeg` - Classic cupcakes
- `2-custom-cupcakes.jpeg` - Custom decorated cupcakes  
- `3-custom-cupcakes.jpeg` - Red Velvet and custom cupcakes

### Cakes
- `4-basic-cakes.jpeg` - Classic basic cakes
- `5-basic-cakes.jpeg` - More basic cake options
- `6-basic-cakes.jpeg` - Additional basic cake varieties
- `8-custom-cakes-3.jpeg` - Elegant custom designed cakes
- `11-custom-cakes-2.jpeg` - Stunning custom cake designs
- `12-custom-cakes.jpeg` - Beautiful custom occasion cakes

### Equipment & Kits
- `7-cake-tins.jpeg` - Professional cake tins and baking pans
- `15-diy-kits.jpeg` - DIY baking kits for home baking

### Other Products
- `9-packages.jpeg` - Cupcake packages and gift sets
- `10-packages-2.jpeg` - More package options
- `13-other-desserts.jpeg` - Specialty desserts and treats
- `14-chewy-cookies.jpeg` - Soft and chewy cookies

## Adding New Images

### 1. Add Image File
First, place your image file in the `public/` folder.

### 2. Update Configuration
Add a new entry to the `imageConfig` array in `src/config/images.ts`:

```typescript
{
  filename: 'your-new-image.jpg',
  keywords: [
    'keyword1', 'keyword2', 'keyword3'
    // Add words that should trigger this image
  ],
  description: 'A clear description of what the image shows',
  category: 'cupcakes' // or 'baking-equipment', 'cakes', 'diy-kits', 'general'
}
```

### 3. Categories and Response Templates

Available categories:
- `cupcakes` - For cupcake products
- `baking-equipment` - For tools and equipment
- `cakes` - For cake products
- `diy-kits` - For DIY baking kits
- `general` - For any other images

Each category has a corresponding response template in `responseTemplates` that you can customize.

## Customizing Response Templates

Edit the `responseTemplates` object to change how the chatbot responds when showing images from each category:

```typescript
export const responseTemplates = {
  cupcakes: `Your custom message for cupcakes...`,
  'baking-equipment': `Your custom message for equipment...`,
  // etc.
};
```

## Adding Image Request Keywords

To add new phrases that trigger image responses, update the `imageRequestKeywords` array:

```typescript
export const imageRequestKeywords = [
  'show me', 'picture', 'photo', 'image',
  'your-new-keyword', 'another-trigger-phrase'
];
```

## Example: Adding a New Cake Image

1. Add `birthday-cake.jpg` to the `public/` folder
2. Add this to `imageConfig`:

```typescript
{
  filename: 'birthday-cake.jpg',
  keywords: ['birthday', 'cake', 'celebration', 'party', 'custom cake'],
  description: 'Beautiful birthday cake with custom decorations',
  category: 'cakes'
}
```

3. The chatbot will now show this image when users ask about birthday cakes, celebrations, or use related keywords.

## Tips

- Use specific keywords that users might naturally type
- Include variations and synonyms in keywords
- Keep descriptions clear and engaging
- Test your changes by asking the chatbot questions using your keywords
- Images are automatically served with the correct paths for both development and production

## File Structure
```
src/
  config/
    images.ts          # Main configuration file
  services/
    imageMatching.ts   # Service that uses the config (don't edit directly)
public/
  your-images.jpg      # Image files go here
```
