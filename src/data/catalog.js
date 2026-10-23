// Product catalog. Each item has a `q` search phrase used by `npm run images`
// to download a real, licensed photo (Pexels) into public/products/<id>.jpg.
// color = dominant color, f = formality (1 casual .. 3 dressy), w = warmth (1 light .. 3 heavy)
const I = (id, name, cat, color, f, w, q, extra = {}) => ({ id, name, cat, color, f, w, q, ...extra });

export const CATALOG = [
  // Tops
  I('t-white-shirt', 'Crisp white cotton shirt', 'Top', '#F4F1EC', 2, 1, 'woman white cotton shirt fashion'),
  I('t-blush-blouse', 'Blush satin blouse', 'Top', '#F0C4CE', 2, 1, 'woman blush pink satin blouse'),
  I('t-lavender-kurta', 'Lavender cotton kurta', 'Top', '#C9B8E3', 2, 1, 'woman lavender kurta ethnic wear'),
  I('t-black-knit', 'Black fitted knit top', 'Top', '#2A2A2D', 1, 2, 'woman black knit top'),
  I('t-camel-sweater', 'Camel knit sweater', 'Top', '#C19A6B', 1, 3, 'woman camel knit sweater'),
  // Bottoms
  I('b-denim', 'High-waist blue jeans', 'Bottom', '#4A6FA5', 1, 2, 'woman high waist blue jeans'),
  I('b-black-trouser', 'Tailored black trousers', 'Bottom', '#2A2A2E', 2, 2, 'woman tailored black trousers'),
  I('b-beige-skirt', 'Beige pleated midi skirt', 'Bottom', '#D9C3A5', 2, 1, 'woman beige pleated midi skirt'),
  I('b-rose-palazzo', 'Rose palazzo pants', 'Bottom', '#E58FA9', 2, 1, 'woman pink palazzo pants'),
  // Dresses
  I('d-floral', 'Floral wrap midi dress', 'Dress', '#F2A7BF', 2, 1, 'woman floral wrap midi dress'),
  I('d-wine', 'Wine satin evening gown', 'Dress', '#7A2842', 3, 2, 'woman wine red satin evening gown'),
  I('d-emerald', 'Emerald cocktail dress', 'Dress', '#2E7D6B', 3, 1, 'woman emerald green cocktail dress'),
  I('d-saree', 'Silk saree', 'Dress', '#8E2F5A', 3, 2, 'woman silk saree'),
  // Footwear
  I('s-sneakers', 'White leather sneakers', 'Shoes', '#F3F3F3', 1, 1, 'white leather sneakers'),
  I('s-heels', 'Nude block heels', 'Shoes', '#E3C3A8', 3, 1, 'nude block heel shoes'),
  I('s-flats', 'Black ballet flats', 'Shoes', '#26262A', 2, 1, 'black ballet flats'),
  I('s-sandals', 'Tan strappy sandals', 'Shoes', '#C69C6D', 2, 1, 'tan strappy sandals'),
  I('s-boots', 'Chelsea ankle boots', 'Shoes', '#5A3A2A', 2, 3, 'brown chelsea ankle boots women'),
  // Makeup
  I('l-coral', 'Coral lipstick', 'Lipstick', '#E9806E', 1, 1, 'coral lipstick makeup', { under: ['warm'] }),
  I('l-rose', 'Dusty rose lipstick', 'Lipstick', '#C0707C', 1, 1, 'dusty rose lipstick makeup', { under: ['cool', 'neutral'] }),
  I('l-berry', 'Berry lipstick', 'Lipstick', '#B03A63', 2, 1, 'berry lipstick makeup', { under: ['cool'] }),
  I('l-red', 'Classic red lipstick', 'Lipstick', '#C1272D', 3, 1, 'red lipstick makeup', { under: ['warm', 'neutral'] }),
  I('bl-peach', 'Peach blush', 'Blush', '#F4A582', 1, 1, 'peach blush makeup compact', { under: ['warm'] }),
  I('bl-pink', 'Cool pink blush', 'Blush', '#F19AB8', 1, 1, 'pink blush makeup compact', { under: ['cool'] }),
  I('bl-rose', 'Soft rose blush', 'Blush', '#EFA39B', 1, 1, 'rose blush makeup powder', { under: ['neutral'] }),
  I('e-bronze', 'Bronze shimmer eyeshadow', 'Eyes', '#B07A4F', 1, 1, 'bronze eyeshadow palette', { under: ['warm'] }),
  I('e-plum', 'Plum eyeshadow palette', 'Eyes', '#6D3B5C', 1, 1, 'plum purple eyeshadow palette', { under: ['cool'] }),
  I('e-neutral', 'Neutral eyeshadow palette', 'Eyes', '#B58F7A', 1, 1, 'neutral eyeshadow palette', { under: ['neutral'] }),
  // Jewelry
  I('j-gold-hoops', 'Gold hoop earrings', 'Jewelry', '#C9A24B', 1, 1, 'gold hoop earrings', { metal: 'Gold' }),
  I('j-gold-statement', 'Statement drop earrings (gold)', 'Jewelry', '#B8903E', 3, 1, 'gold statement earrings jhumka', { metal: 'Gold' }),
  I('j-silver-pendant', 'Silver pendant necklace', 'Jewelry', '#C0C4CC', 1, 1, 'silver pendant necklace', { metal: 'Silver' }),
  I('j-silver-statement', 'Statement drop earrings (silver)', 'Jewelry', '#B9BEC8', 3, 1, 'silver statement earrings', { metal: 'Silver' }),
  I('j-rose-bracelet', 'Rose gold bracelet', 'Jewelry', '#D99A8C', 1, 1, 'rose gold bracelet', { metal: 'Rose gold' }),
  I('j-pearl', 'Pearl drop necklace', 'Jewelry', '#F1ECE4', 2, 1, 'pearl necklace', { metal: 'Pearl' }),
].map((p) => ({
  ...p,
  group: ['Top', 'Bottom', 'Dress'].includes(p.cat) ? 'Clothing' : p.cat === 'Shoes' ? 'Footwear' : p.cat === 'Jewelry' ? 'Jewelry' : 'Makeup',
}));

export const BY_ID = Object.fromEntries(CATALOG.map((p) => [p.id, p]));
export const GROUPS = ['Clothing', 'Footwear', 'Makeup', 'Jewelry'];
export const WEARABLE = ['Top', 'Bottom', 'Dress', 'Shoes'];
// A starter wardrobe so the Studio works immediately
export const STARTER = ['t-white-shirt', 't-blush-blouse', 't-lavender-kurta', 't-black-knit', 'b-denim', 'b-black-trouser', 'b-beige-skirt', 'b-rose-palazzo', 'd-floral', 'd-wine', 's-sneakers', 's-heels', 's-flats'];
