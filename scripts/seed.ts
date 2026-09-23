import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, onnotice: () => {} });

// With --if-empty (used on every deploy) a table is only seeded when it has no rows,
// so prices or articles edited in the live database are never overwritten.
const ifEmpty = process.argv.includes("--if-empty");

async function shouldSeed(table: "products" | "posts") {
  if (!ifEmpty) return true;
  const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM ${sql(table)}`;
  if (count > 0) console.log(`• ${table} already has ${count} rows — skipping`);
  return count === 0;
}

// NOTE: prices are placeholders (in pesewas, GH₵1 = 100) until the shop confirms its price list.
const products = [
  {
    slug: "aman-rock-activated-charcoal",
    name: "Activated Charcoal Powder",
    brand: "Aman-Rock",
    description:
      "Fine, food-grade activated charcoal powder. Popular for natural teeth whitening and as part of a gentle detox routine.",
    size: "50g",
    category: "detox",
    price: 6000,
    image: "/images/products/charcoal.jpg",
    badge: "Restocked",
  },
  {
    slug: "badia-cayenne-pepper",
    name: "Cayenne Pepper",
    brand: "Badia",
    description:
      "Bold, warming ground cayenne. A kitchen staple for circulation-friendly teas, tonics and everyday cooking.",
    size: "113.4g",
    category: "spices",
    price: 5500,
    image: "/images/products/cayenne.jpg",
    badge: "Restocked",
  },
  {
    slug: "badia-turmeric",
    name: "Turmeric Powder",
    brand: "Badia",
    description:
      "Golden, earthy turmeric powder. Pair with a pinch of black pepper in golden milk, soups and stews.",
    size: "56.7g",
    category: "spices",
    price: 4500,
    image: "/images/products/turmeric.jpg",
    badge: "Restocked",
  },
  {
    slug: "badia-black-pepper",
    name: "Ground Black Pepper",
    brand: "Badia",
    description:
      "Premium ground black pepper with a clean, sharp bite. Turmeric's best friend.",
    size: "56.7g",
    category: "spices",
    price: 4500,
    image: "/images/products/black-pepper.jpg",
    badge: "Restocked",
  },
  {
    slug: "skinners-vaporizing-salve",
    name: "Vaporizing Salve",
    brand: "Skinner's",
    description:
      "Soothing menthol-and-eucalyptus chest rub for congestion relief during colds and catarrh season.",
    size: "99.2g",
    category: "balms",
    price: 5000,
    image: "/images/products/skinners-salve.jpg",
    badge: null,
  },
  {
    slug: "chia-seeds",
    name: "Chia Seeds",
    brand: null,
    description:
      "Fibre-rich chia seeds for smoothies, porridge and puddings. Available in bulk for resellers.",
    size: "500g",
    category: "nuts-seeds",
    price: 7000,
    image: null,
    badge: "Wholesale",
    wholesale: true,
  },
  {
    slug: "flax-seeds",
    name: "Flax Seeds",
    brand: null,
    description:
      "Whole golden flax seeds — grind fresh and add to cereal, bread or drinks. Bulk bags available.",
    size: "500g",
    category: "nuts-seeds",
    price: 5000,
    image: null,
    badge: "Wholesale",
    wholesale: true,
  },
  {
    slug: "raw-cashew-nuts",
    name: "Raw Cashew Nuts",
    brand: null,
    description:
      "Creamy, unsalted Ghanaian cashews. Perfect for snacking or making plant milk. Wholesale prices on request.",
    size: "500g",
    category: "nuts-seeds",
    price: 8500,
    image: null,
    badge: "Wholesale",
    wholesale: true,
  },
];

const posts = [
  {
    slug: "natural-support-for-piles",
    title: "Piles (Haemorrhoids): Gentle, Natural Support",
    category: "Digestive health",
    readMinutes: 4,
    excerpt:
      "Piles are common and very manageable. Here is how diet, water and a few daily habits can bring real relief.",
    body: `Piles — swollen veins around the anus — are one of the most common complaints we see at the retreat. The good news: for most people, simple changes to diet and daily habits make a big difference.

## Why piles happen
- Straining on the toilet, usually because of constipation
- Low-fibre diets heavy on refined flour and processed food
- Not drinking enough water
- Sitting for long hours, pregnancy and heavy lifting

## What helps
- **Fibre, every day.** Build meals around vegetables, fruit, beans, oats and whole grains. A spoon of freshly ground flax or soaked chia seeds in porridge is an easy start.
- **Water.** Aim for 8 glasses a day — fibre needs water to work.
- **Don't strain or delay.** Go when your body tells you to, and don't sit on the toilet scrolling your phone.
- **Warm sitz baths.** Sitting in warm water for 10–15 minutes can ease discomfort.
- **Move.** A daily walk keeps the bowels regular.

## When to see a doctor
Bleeding from the back passage should always be checked by a qualified health professional, especially if you are over 40, the blood is dark, or you notice weight loss or a change in bowel habits. Natural care works best alongside a proper diagnosis.

Book a consultation with ND William Owusu to talk through a plan that fits you.`,
  },
  {
    slug: "caring-for-your-skin-naturally",
    title: "Clear, Calm Skin Starts From the Inside",
    category: "Skin conditions",
    readMinutes: 5,
    excerpt:
      "Eczema, rashes, acne and dark spots often reflect what is happening inside the body. Our approach to skin care starts on the plate.",
    body: `Skin is your largest organ, and it often tells the story of what is happening inside. At Natural Health Retreat we look at the whole person — diet, sleep, stress and hygiene — not just the rash.

## Everyday foundations
- **Hydrate.** Dry, itchy skin is often thirsty skin.
- **Eat the rainbow.** Leafy greens, carrots, pawpaw, oranges and garden eggs supply the vitamins skin needs to repair.
- **Cut back on sugar and fried food**, which many people find make breakouts worse.
- **Sleep 7–8 hours.** Skin does much of its repair work overnight.

## Kitchen helpers
- **Turmeric** has been used for generations in traditional skin care. Take it in food with a pinch of black pepper, which helps the body absorb it.
- **Activated charcoal** is popular in face masks for oily skin. Use sparingly — once a week is plenty — and patch-test first.

## Know when to get help
Skin that is weeping, spreading quickly, very painful, or accompanied by fever needs prompt medical attention. Long-standing conditions such as eczema or psoriasis deserve a proper assessment — come and see us, and keep your doctor in the loop.`,
  },
  {
    slug: "prayer-and-healing",
    title: "Prayer, Rest and the Healing Journey",
    category: "Faith & wellbeing",
    readMinutes: 3,
    excerpt:
      "Healing is not only physical. A quiet heart, gratitude and prayer are part of how we care for the whole person.",
    body: `We believe the body, mind and spirit are connected. Stress, worry and grief can show up as poor sleep, headaches, high blood pressure and a weak appetite. Caring for the spirit is part of caring for health.

## A simple daily rhythm
- **Begin the day in stillness.** Five quiet minutes of prayer or reflection before reaching for your phone.
- **Give thanks.** Write down three things you are grateful for each evening.
- **Rest one day a week.** Your body was designed for rhythm — work and rest.
- **Walk in the morning sun.** Fresh air, light and gentle movement lift the mood.

## You are not alone
If you are carrying a heavy burden, talk to someone — family, your pastor or imam, or a counsellor. At the retreat we are always happy to pray with you and to listen.

*"Choose Health, Choose Life."*`,
  },
  {
    slug: "turmeric-and-black-pepper",
    title: "Why Turmeric Loves Black Pepper",
    category: "Kitchen remedies",
    readMinutes: 2,
    excerpt:
      "Two restocked favourites that work better together. Plus our simple golden milk recipe.",
    body: `Turmeric's golden colour comes from curcumin, which the body struggles to absorb on its own. Piperine, found in black pepper, helps. That is why traditional recipes so often pair the two.

## Golden milk (serves 1)
- 1 cup of milk or plant milk
- ½ teaspoon Badia turmeric powder
- A pinch of Badia black pepper
- A small piece of fresh ginger, or a pinch of cayenne for warmth
- Honey to taste

Warm everything gently for 5 minutes (don't boil), strain and enjoy before bed.

Turmeric can interact with blood-thinning and diabetes medicines. If you take regular medication or are pregnant, check with a health professional before using it in large amounts.`,
  },
];

async function main() {
  if (await shouldSeed("products")) await seedProducts();
  if (await shouldSeed("posts")) await seedPosts();
  await sql.end();
}

async function seedProducts() {
  for (const [i, p] of products.entries()) {
    await sql`
      INSERT INTO products (slug, name, brand, description, size, category, price_pesewas,
                            image, badge, wholesale, sort_order)
      VALUES (${p.slug}, ${p.name}, ${p.brand}, ${p.description}, ${p.size}, ${p.category},
              ${p.price}, ${p.image}, ${p.badge}, ${p.wholesale ?? false}, ${i})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name, brand = EXCLUDED.brand, description = EXCLUDED.description,
        size = EXCLUDED.size, category = EXCLUDED.category, price_pesewas = EXCLUDED.price_pesewas,
        image = EXCLUDED.image, badge = EXCLUDED.badge, wholesale = EXCLUDED.wholesale,
        sort_order = EXCLUDED.sort_order`;
  }
  console.log(`✓ Seeded ${products.length} products`);
}

async function seedPosts() {
  for (const [i, p] of posts.entries()) {
    const publishedAt = new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000);
    await sql`
      INSERT INTO posts (slug, title, excerpt, body, category, read_minutes, published_at)
      VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${p.body}, ${p.category}, ${p.readMinutes}, ${publishedAt})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, body = EXCLUDED.body,
        category = EXCLUDED.category, read_minutes = EXCLUDED.read_minutes`;
  }
  console.log(`✓ Seeded ${posts.length} remedy articles`);
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
