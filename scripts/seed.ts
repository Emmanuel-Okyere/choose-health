import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
  if (count > 0) console.log(`• ${table} already has ${count} rows, skipping`);
  return count === 0;
}

// NOTE: prices are placeholders (in pesewas, GH₵1 = 100) until the shop confirms its price list.
const products = [
  {
    slug: "aman-rock-activated-charcoal",
    name: "Activated Charcoal Powder",
    brand: "Aman-Rock",
    description: "Food-grade activated charcoal powder. Many customers use it to whiten teeth and as part of a detox routine.",
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
    description: "Hot ground cayenne for cooking, teas and tonics.",
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
    description: "Ground turmeric for soups, stews and golden milk. Take it with a little black pepper.",
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
    description: "Ground black pepper for everyday cooking. Goes well with turmeric.",
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
    description: "Menthol and eucalyptus chest rub. Helps with a blocked nose and chest during colds and catarrh.",
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
    description: "High in fibre. Add to smoothies, porridge or water. Also sold in bulk.",
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
    description: "Whole golden flax seeds. Grind them just before use and add to cereal, bread or drinks. Bulk bags available.",
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
    description: "Unsalted Ghanaian cashews for snacking or making cashew milk. Ask us for wholesale prices.",
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
    title: "Managing piles naturally",
    category: "Digestive health",
    readMinutes: 3,
    excerpt: "Piles are very common. For most people, changes to diet and toilet habits bring real relief.",
    body: `Piles (haemorrhoids) are swollen veins around the anus. We see them often at the retreat, and for most people they get better with changes to diet and daily habits.

## Common causes
- Straining on the toilet, usually because of constipation
- Eating a lot of refined flour and processed food, and not much fibre
- Not drinking enough water
- Sitting for long hours, pregnancy and heavy lifting

## What helps
- Eat fibre every day. Vegetables, fruit, beans, oats and whole grains all count. A spoon of ground flax or soaked chia seeds in your porridge is an easy start.
- Drink about 8 glasses of water a day. Fibre needs water to work.
- Go to the toilet when you feel the urge, and don't strain or sit there for long.
- Sit in a bowl of warm water for 10 to 15 minutes to ease the pain.
- Take a walk every day. It keeps the bowels moving.

## When to see a doctor
Always get bleeding from the back passage checked by a doctor, especially if you are over 40, the blood is dark, or you have lost weight or noticed a change in your bowel habits.

If you would like a plan made for you, book a consultation with ND William Owusu.`,
  },
  {
    slug: "caring-for-your-skin-naturally",
    title: "Caring for your skin from the inside",
    category: "Skin conditions",
    readMinutes: 4,
    excerpt: "Eczema, rashes, pimples and dark spots are often linked to diet, sleep and stress. Here is where we start.",
    body: `When someone comes to us with a skin problem, we ask about their food, sleep, stress and washing habits as well as the rash itself. These often make a big difference.

## Everyday habits
- Drink enough water. Dry, itchy skin is often a sign you need more.
- Eat plenty of vegetables and fruit. Kontomire, carrots, pawpaw, oranges and garden eggs are good choices.
- Eat less sugar and fried food. Many people find their pimples get better when they do.
- Sleep 7 to 8 hours a night.

## From the kitchen
- Turmeric has been used on skin for a long time. Take it in your food with a pinch of black pepper, which helps your body absorb it.
- Some people use activated charcoal in a face mask for oily skin. Once a week is enough, and try it on a small patch of skin first.

## When to get help quickly
See a doctor straight away if the skin is weeping, spreading fast, very painful, or you have a fever. Eczema and psoriasis that keep coming back should be checked properly. You are welcome to see us too, and please keep your doctor informed.`,
  },
  {
    slug: "prayer-and-healing",
    title: "Prayer, rest and healing",
    category: "Faith and wellbeing",
    readMinutes: 2,
    excerpt: "Worry and stress affect the body. Prayer and rest are part of how we care for our patients.",
    body: `We believe the body, mind and spirit are connected. Stress, worry and grief can show up as poor sleep, headaches, high blood pressure or loss of appetite, so we pay attention to them.

## A simple daily routine
- Spend five quiet minutes in prayer or reflection before you pick up your phone in the morning.
- Each evening, write down three things you are thankful for.
- Take one day of rest every week.
- Walk in the morning sun when you can.

## Talk to someone
If something is weighing on you, talk to your family, your pastor or imam, or a counsellor. At the retreat we are always happy to listen and to pray with you.

Choose Health, Choose Life.`,
  },
  {
    slug: "turmeric-and-black-pepper",
    title: "Why we take turmeric with black pepper",
    category: "Kitchen remedies",
    readMinutes: 2,
    excerpt: "Black pepper helps your body absorb turmeric. Here is our golden milk recipe.",
    body: `Turmeric gets its colour from curcumin, which the body does not absorb well on its own. Piperine, found in black pepper, helps with this. That is why many traditional recipes use the two together.

## Golden milk (1 cup)
- 1 cup of milk or plant milk
- Half a teaspoon of Badia turmeric powder
- A pinch of Badia black pepper
- A small piece of fresh ginger, or a pinch of cayenne
- Honey to taste

Warm everything on low heat for 5 minutes without boiling. Strain it and drink before bed.

Turmeric can affect blood thinners and diabetes medicine. If you take medicine every day or you are pregnant, ask a health professional before taking large amounts.`,
  },
];

async function main() {
  if (await shouldSeed("products")) await seedProducts();
  if (await shouldSeed("posts")) await seedPosts();
  await moveStaticImagesIntoDb();
  await sql.end();
}

// Older products point at a file in /public. Copy those into product_images so every photo
// can be managed from the admin. Only touches products that have no uploaded photos yet.
async function moveStaticImagesIntoDb() {
  const rows = await sql<{ id: number; image: string }[]>`
    SELECT p.id, p.image FROM products p
    WHERE p.image LIKE '/images/%'
      AND NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)`;
  for (const row of rows) {
    const ext = row.image.split(".").pop()?.toLowerCase();
    const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    try {
      const data = await readFile(join(process.cwd(), "public", row.image));
      await sql.begin(async (tx) => {
        await tx`INSERT INTO product_images (product_id, data, content_type, byte_size)
                 VALUES (${row.id}, ${data}, ${type}, ${data.length})`;
        await tx`UPDATE products SET image = NULL WHERE id = ${row.id}`;
      });
    } catch (err) {
      console.warn(`• Could not copy ${row.image}: ${(err as Error).message}`);
    }
  }
  if (rows.length) console.log(`✓ Moved ${rows.length} product photos into the database`);
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
