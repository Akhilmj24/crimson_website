import { FAQItem, Review, GalleryItem, Product } from '../types'
// Import assets
import bananaChipsImg from '../assets/product-banana-chips.png'
import bananaChipsDetailsImg from '../assets/product-banana-chips-details.png'
import sharkaraUpperiImg from '../assets/product-sharkara-upperi.png'
import comboPackImg from '../assets/product-combo-pack.png'
// import businessCardImg from '../assets/business-card-banner.jpg'

// Products Data
export const PRODUCTS_DATA: Product[] = [
  {
    id: 'banana-chips',
    name: 'Kerala Banana Chips',
    tagline: 'Crispy & Delicious',
    shortDescription: 'Premium crispy banana chips made using authentic Kerala bananas and pure coconut oil.',
    description: 'Our signature Kerala Banana Chips are crafted from hand-picked raw bananas (Nendran variety) grown in the fertile soils of Kerala. Sliced thin and cooked in 100% pure coconut oil, these chips are light, crispy, and seasoned with a touch of sea salt for the perfect traditional taste.',
    weight: '200g',
    price: 180,
    ingredients: ['Raw Banana (Nendran)', 'Pure Coconut Oil', 'Iodized Salt', 'Turmeric Powder'],
    shelfLife: '3 Months (from manufacturing date)',
    storageInstructions: 'Store in a cool, dry place away from direct sunlight. Once opened, transfer to an airtight container to retain crispness.',
    packagingInfo: 'Premium food-grade stand-up pouch with zip lock to preserve freshness.',
    nutritionInfo: {
      calories: '540 kcal',
      totalFat: '34 g',
      saturatedFat: '28 g',
      transFat: '0 g',
      cholesterol: '0 mg',
      sodium: '300 mg',
      totalCarbohydrate: '53 g',
      dietaryFiber: '3 g',
      totalSugars: '1 g',
      protein: '2 g',
    },
    features: ['100% Kerala Bananas', 'Made in Coconut Oil', 'No Artificial Colors', 'No Preservatives', 'Gluten Free'],
    imageUrl: bananaChipsImg,
    detailsImageUrl: bananaChipsDetailsImg,
    whatsappMessage: `Hello Crimson,\n\nI would like to order the "Kerala Banana Chips (200g)" for ₹180. Please share payment and delivery details.`,
  },
  {
    id: 'sharkara-upperi',
    name: 'Sharkara Upperi',
    tagline: 'Traditional Sweet & Crispy',
    shortDescription: 'Traditional thick-cut sweet banana chips coated in organic jaggery, ginger, and cardamom.',
    description: 'A classic festival delicacy of Kerala, our Sharkara Upperi features thick-cut banana chunks, slow-cooked in pure coconut oil and coated with highly aromatic organic jaggery (sharkara). Infused with dry ginger (chukku), cardamom (elakka), and cumin, it offers a sweet, spicy, and earthy taste that melts in your mouth.',
    weight: '200g',
    price: 150,
    ingredients: ['Raw Banana (Nendran)', 'Organic Jaggery', 'Pure Coconut Oil', 'Dry Ginger Powder', 'Cardamom Powder', 'Cumin Powder'],
    shelfLife: '3 Months (from manufacturing date)',
    storageInstructions: 'Store in a cool, dry place. Keep away from humidity and moisture. Keep in airtight containers.',
    packagingInfo: 'Eco-friendly premium zip-lock stand-up pouch.',
    nutritionInfo: {
      calories: '495 kcal',
      totalFat: '24 g',
      saturatedFat: '18 g',
      transFat: '0 g',
      cholesterol: '0 mg',
      sodium: '110 mg',
      totalCarbohydrate: '67 g',
      dietaryFiber: '4 g',
      totalSugars: '32 g',
      protein: '2 g',
    },
    features: ['Traditional Recipe', 'Coated in Organic Jaggery', 'Infused with Ginger & Cardamom', 'No Preservatives', '100% Authentic Kerala Taste'],
    imageUrl: sharkaraUpperiImg,
    whatsappMessage: `Hello Crimson,\n\nI would like to order the "Sharkara Upperi (200g)" for ₹190. Please share payment and delivery details.`,
  },
  {
    id: 'combo-pack',
    name: 'Celebrate Onam Combo Pack',
    tagline: 'A Gift of Tradition & Happiness',
    shortDescription: 'An elegant gift combo containing our signature savory Banana Chips and sweet Sharkara Upperi.',
    description: 'Perfect for festivals, corporate gifting, and family get-togethers. This premium gift combo brings together the best of both worlds: 200g of crispy salted Banana Chips and 100g of sweet jaggery-coated Sharkara Upperi. Gift your loved ones the authentic flavors of a Kerala sadhya.',
    weight: 'Banana Chips (200g) + Upperi (100g)',
    price: 390,
    ingredients: ['Raw Banana', 'Pure Coconut Oil', 'Organic Jaggery', 'Dry Ginger', 'Cardamom', 'Sea Salt', 'Turmeric'],
    shelfLife: '3 Months',
    storageInstructions: 'Store in dry conditions. Once unsealed, keep the pouches zipped to preserve crunchiness.',
    packagingInfo: 'Stunning heritage-designed rigid gift box containing separate zip-lock pouches.',
    nutritionInfo: {
      calories: '518 kcal (Average)',
      totalFat: '29 g',
      saturatedFat: '23 g',
      transFat: '0 g',
      cholesterol: '0 mg',
      sodium: '205 mg',
      totalCarbohydrate: '60 g',
      dietaryFiber: '3.5 g',
      totalSugars: '16 g',
      protein: '2 g',
    },
    features: ['Perfect for Gifting', 'Handcrafted Assortment', 'Beautiful Festive Box', 'A Taste of Kerala Tradition'],
    imageUrl: comboPackImg,
    whatsappMessage: `Hello Crimson,\n\nI would like to order the "Celebrate Onam Combo Pack" for ₹390. Please share payment and delivery details.`,
  },
]

// FAQ Data
export const FAQ_DATA: FAQItem[] = [
  {
    question: 'What is the shelf life of Crimson snacks?',
    answer: 'All our products have a shelf life of 3 months from the date of manufacturing. To maintain optimal crunchiness and flavor, store them in a cool, dry place and reseal the zip-lock pack or keep them in an airtight container.',
  },
  {
    question: 'How do you deliver, and do you ship outside Kerala?',
    answer: 'We deliver all across India using reliable courier partners (DHL, BlueDart, DTDC, and Speed Post). Delivery typically takes 2-4 working days within Kerala and 5-7 working days for other states.',
  },
  {
    question: 'How are the chips packaged to prevent breakage during transit?',
    answer: 'We use high-barrier food-grade stand-up zip pouches that protect the chips from moisture and air. During shipping, they are packed inside sturdy outer corrugated boxes with adequate cushioning material to prevent crushing.',
  },
  {
    question: 'Do you accept corporate gifting and wholesale orders?',
    answer: 'Yes! We specialize in premium corporate gifting, wedding favors, and wholesale distributions. We offer custom branding options on our gift box combo designs. Please contact us via the form or WhatsApp for wholesale pricing tables.',
  },
  {
    question: 'What oil is used for frying?',
    answer: 'We use 100% pure, filtered edible coconut oil sourced locally from Kerala mills. We never reuse oil or blend it with palm, cotton, or sunflower oil, which ensures our snacks taste authentic and do not develop any stale odor.',
  },
]

// Reviews Data
export const REVIEWS_DATA: Review[] = [
  {
    id: '1',
    name: 'Anjali Menon',
    location: 'Kochi, Kerala',
    rating: 5,
    text: 'These banana chips are exceptionally thin and crispy! They have a distinct, fresh aroma of pure coconut oil. Tastes exactly like home-cooked chips. Outstanding packaging too!',
    date: 'July 12, 2026',
  },
  {
    id: '2',
    name: 'Madhavan Nair',
    location: 'Bangalore, Karnataka',
    rating: 5,
    text: 'The Sharkara Upperi took me back to my childhood Onam celebrations. The coating of jaggery is perfect—not overly sweet, with just the right hit of dried ginger and cardamom.',
    date: 'June 28, 2026',
  },
  {
    id: '3',
    name: 'Rahul Sharma',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    text: 'Ordered the Combo Pack for corporate gifting, and my clients absolutely loved it. The boxes look extremely premium, and the taste is unparalleled compared to mass-market brands.',
    date: 'July 18, 2026',
  },
  {
    id: '4',
    name: 'Devika Pillai',
    location: 'Trivandrum, Kerala',
    rating: 5,
    text: 'Highly recommend Crimson. You can feel the quality of raw bananas used. They are not greasy at all, which shows how carefully they are fried and drained. Definitely ordering again!',
    date: 'July 24, 2026',
  },
  {
    id: '5',
    name: 'Suresh Kumar',
    location: 'Chennai, Tamil Nadu',
    rating: 4,
    text: 'Superb quality chips. They arrived in Chennai completely fresh and without getting crushed. The WhatsApp ordering process was smooth and delivery was prompt.',
    date: 'July 05, 2026',
  },
]

// Gallery Data
export const GALLERY_DATA: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Crimson Premium Box Combo',
    category: 'packaging',
    imageUrl: comboPackImg,
  },
  {
    id: 'g2',
    title: 'Fresh Salted Banana Chips Bag',
    category: 'packaging',
    imageUrl: bananaChipsImg,
  },
  {
    id: 'g3',
    title: 'Traditional Sweet Sharkara Upperi Bag',
    category: 'packaging',
    imageUrl: sharkaraUpperiImg,
  },
  // {
  //   id: 'g4',
  //   title: 'Crimson Brand Identity & Address Detail',
  //   category: 'culture',
  //   imageUrl: businessCardImg,
  // },
  // {
  //   id: 'g5',
  //   title: 'Double Pouch Product Showcase',
  //   category: 'closeup',
  //   imageUrl: bananaChipsDetailsImg,
  // },
  // {
  //   id: 'g6',
  //   title: 'Yellow Slate Banana Chips',
  //   category: 'closeup',
  //   imageUrl: bananaChipsImg,
  // },
]

// Process Timeline Stages
export const PROCESS_STAGES = [
  {
    step: '01',
    title: 'Ethical Farming',
    description: 'We source high-grade Nendran bananas directly from organic farmers across Wayanad and Thrissur, ensuring fair pricing and sustainable practices.',
  },
  {
    step: '02',
    title: 'Strict Quality Sort',
    description: 'Bananas are carefully inspected and sorted. Only fruits at the precise maturity level are chosen to achieve the ideal starch-to-sweetness balance.',
  },
  {
    step: '03',
    title: 'Traditional Preparation',
    description: 'Thinly sliced in traditional fryers and slow-cooked in 100% pure coconut oil. Sweet varieties are coated in melted organic jaggery infused with local spices.',
  },
  {
    step: '04',
    title: 'Hygienic Airtight Packing',
    description: 'Every batch is packed in premium food-grade, airtight pouches to lock in freshness, preserve crispness, and protect the chips from moisture. The resealable packaging makes it easy to enjoy and store while maintaining quality.',
  },
  {
    step: '05',
    title: 'Doorstep Delivery',
    description: 'Dispatched in reinforced carton packs via fast delivery networks to ensure they reach your home fresh and completely intact.',
  },
]
