import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertCategory(slug: string, name: string, description: string, sortOrder: number) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, description, sortOrder },
    create: { name, slug, description, sortOrder },
  });
}

interface ItemDef {
  id: string;
  name: string;
  description?: string;
  image: string;
  isPizza?: boolean;
  featured?: boolean;
  sizes: { name: string; price: number }[];
}

async function upsertItem(categoryId: string, sortOrder: number, def: ItemDef) {
  const data = {
    categoryId,
    name: def.name,
    description: def.description,
    image: def.image,
    isPizza: def.isPizza ?? false,
    featured: def.featured ?? false,
    sortOrder,
  };
  const item = await prisma.menuItem.upsert({
    where: { id: def.id },
    update: data,
    create: { id: def.id, ...data },
  });
  await prisma.productSize.deleteMany({ where: { menuItemId: item.id } });
  await prisma.productSize.createMany({
    data: def.sizes.map((s, i) => ({ id: `${item.id}-${s.name}`, menuItemId: item.id, name: s.name, price: s.price, sortOrder: i })),
  });
  return item;
}

async function main() {
  console.log("Seeding Bruno's Deli & Pizza database...");

  const [pizzas, snacks, salads, sandwiches, others, chinese, drinks, desserts] = await Promise.all([
    upsertCategory("pizzas", "Pizzas", "Made with our special sauce and plenty of mozzarella cheese.", 1),
    upsertCategory("snacks", "Snacks", "Wings, fries, and shareables.", 2),
    upsertCategory("salads", "Salads", "Fresh and simple.", 3),
    upsertCategory("hot-sandwiches", "Hot Sandwiches", "Served hot, served fast.", 4),
    upsertCategory("others", "Others", "Steaks, seafood, and comfort classics.", 5),
    upsertCategory("chinese-menu", "Chinese Menu", "Bruno's signature Chinese kitchen.", 6),
    upsertCategory("drinks", "Drinks", "Ice cold refreshments.", 7),
    upsertCategory("desserts", "Desserts", "Sweet finishes.", 8),
  ]);

  // ── Toppings (real Bruno's topping list) ───────────────────────────────
  const toppingData: { name: string; price: number; premium?: boolean }[] = [
    { name: "Extra Cheese", price: 2.0 },
    { name: "Extra Spicy Sauce", price: 2.0 },
    { name: "Pepperoni", price: 2.0 },
    { name: "Ham", price: 2.0 },
    { name: "Bacon", price: 2.0 },
    { name: "Salami", price: 2.0 },
    { name: "Lean Ground Beef", price: 2.0 },
    { name: "Sausage", price: 2.0 },
    { name: "Fresh Mushrooms", price: 2.0 },
    { name: "Fresh Tomato", price: 2.0 },
    { name: "Onion", price: 2.0 },
    { name: "Green Pepper", price: 2.0 },
    { name: "Black Olives", price: 2.0 },
    { name: "Green Olives", price: 2.0 },
    { name: "Pineapple", price: 2.0 },
    { name: "Anchovy", price: 2.0 },
    { name: "Caper", price: 2.0 },
    { name: "Shrimp", price: 2.0 },
    { name: "Feta Cheese", price: 2.0 },
    { name: "Jalapeno Peppers", price: 2.0 },
    { name: "Banana Peppers", price: 2.0 },
    { name: "Garlic", price: 2.0 },
    { name: "Chicken", price: 7.0, premium: true },
    { name: "BBQ Chicken", price: 7.0, premium: true },
    { name: "Donair Meat", price: 7.0, premium: true },
  ];
  for (const [i, t] of toppingData.entries()) {
    await prisma.topping.upsert({
      where: { name: t.name },
      update: { price: t.price, premium: t.premium ?? false, sortOrder: i },
      create: { name: t.name, price: t.price, premium: t.premium ?? false, sortOrder: i },
    });
  }

  // ── Pizzas ────────────────────────────────────────────────────────────
  const pizzaSizes = [
    { name: "Small (10\")", price: 13.0 },
    { name: "Medium (12\")", price: 16.5 },
    { name: "Large (14\")", price: 20.0 },
  ];
  const pizzaDefs: ItemDef[] = [
    {
      id: "seed-pizza-build",
      name: "Build Your Own Pizza",
      description: "Start with our special sauce and plenty of mozzarella, then make it yours from 25 toppings.",
      image: "/images/food/pizza-pepperoni.jpg",
      isPizza: true,
      featured: true,
      sizes: pizzaSizes,
    },
    {
      id: "seed-pizza-house-special",
      name: "Bruno's House Special",
      description: "Extra cheese, pepperoni, bacon, mushrooms, pineapple & shrimp.",
      image: "/images/food/pizza-deluxe.jpg",
      featured: true,
      sizes: [
        { name: "Small (10\")", price: 22.0 },
        { name: "Medium (12\")", price: 28.0 },
        { name: "Large (14\")", price: 31.0 },
      ],
    },
    {
      id: "seed-pizza-vegetarian",
      name: "Bruno's Vegetarian Pizza",
      description: "Fresh mushrooms, onion, tomato, olives, green pepper, pineapple & capers.",
      image: "/images/food/pizza-veggie.jpg",
      sizes: [
        { name: "Small (10\")", price: 22.0 },
        { name: "Medium (12\")", price: 28.0 },
        { name: "Large (14\")", price: 31.0 },
      ],
    },
    {
      id: "seed-pizza-fully-loaded",
      name: "Fully Loaded",
      description: "Every classic topping we've got, piled high.",
      image: "/images/food/pizza-meat.jpg",
      featured: true,
      sizes: [
        { name: "Small (10\")", price: 25.0 },
        { name: "Medium (12\")", price: 31.0 },
        { name: "Large (14\")", price: 35.0 },
      ],
    },
    {
      id: "seed-pizza-meat-lovers",
      name: "Meat Lovers",
      description: "Pepperoni, ham, bacon, salami, lean ground beef & sausage.",
      image: "/images/food/pizza-bbq.jpg",
      featured: true,
      sizes: [
        { name: "Small (10\")", price: 25.0 },
        { name: "Medium (12\")", price: 31.0 },
        { name: "Large (14\")", price: 35.0 },
      ],
    },
  ];
  for (const [i, p] of pizzaDefs.entries()) await upsertItem(pizzas.id, i, p);

  // ── Snacks ────────────────────────────────────────────────────────────
  const snackDefs: ItemDef[] = [
    { id: "seed-snack-wings-spicy", name: "Spicy Chicken Wings", description: "8 pieces with spicy fries.", image: "/images/food/snack-wings-spicy.jpg", sizes: [{ name: "Regular", price: 18.5 }] },
    { id: "seed-snack-wings-saltpepper", name: "Salt & Pepper Chicken Wings", description: "8 pieces with french fries.", image: "/images/food/side-wings.jpg", sizes: [{ name: "Regular", price: 18.5 }] },
    { id: "seed-snack-wings-honeygarlic", name: "Honey Garlic Chicken Wings", description: "8 pieces with french fries.", image: "/images/food/side-wings.jpg", sizes: [{ name: "Regular", price: 18.5 }] },
    { id: "seed-snack-wings-bbq", name: "BBQ Chicken Wings", description: "8 pieces with french fries.", image: "/images/food/side-wings.jpg", sizes: [{ name: "Regular", price: 18.5 }] },
    { id: "seed-snack-wings-southern", name: "Breaded Southern Chicken Wings", description: "8 pieces with french fries.", image: "/images/food/side-wings.jpg", sizes: [{ name: "Regular", price: 18.5 }] },
    { id: "seed-snack-shrimp", name: "Deep Fried Shrimp", image: "/images/food/snack-shrimp.jpg", sizes: [{ name: "Regular", price: 15.0 }] },
    { id: "seed-snack-donair", name: "Donair", description: "Served with white sauce or pizza sauce. Topped with diced tomatoes, onions & lettuce.", image: "/images/food/snack-donair.jpg", sizes: [{ name: "Regular", price: 12.5 }] },
    { id: "seed-snack-ribs", name: "Dry Ribs", image: "/images/food/snack-ribs.jpg", sizes: [{ name: "Regular", price: 15.0 }] },
    { id: "seed-snack-onion-rings", name: "Onion Rings", image: "/images/food/snack-onion-rings.jpg", sizes: [{ name: "Regular", price: 11.0 }] },
    { id: "seed-snack-fries-spicy", name: "Spicy French Fries", image: "/images/food/side-fries.jpg", sizes: [{ name: "Regular", price: 11.0 }] },
    { id: "seed-snack-fingers", name: "Chicken Fingers", description: "Served with french fries.", image: "/images/food/snack-fingers.jpg", sizes: [{ name: "Regular", price: 16.0 }] },
    { id: "seed-snack-poutine", name: "Poutine", image: "/images/food/snack-poutine.jpg", sizes: [{ name: "Regular", price: 13.0 }] },
    { id: "seed-snack-chicken-poutine", name: "Chicken Poutine", image: "/images/food/snack-poutine.jpg", sizes: [{ name: "Regular", price: 17.0 }] },
    { id: "seed-snack-fries", name: "French Fries", image: "/images/food/side-fries.jpg", sizes: [{ name: "Regular", price: 9.0 }] },
    { id: "seed-snack-jalapeno-poppers", name: "Jalapeno Poppers", image: "/images/food/snack-jalapeno-poppers.jpg", sizes: [{ name: "Regular", price: 16.0 }] },
    {
      id: "seed-snack-nachos",
      name: "Super Nachos",
      description: "Served with salsa & sour cream. Cheddar cheese, ground beef, tomatoes, onions, green peppers, black olives, and pineapple.",
      image: "/images/food/snack-nachos.jpg",
      featured: true,
      sizes: [
        { name: "Small", price: 22.0 },
        { name: "Medium", price: 28.0 },
        { name: "Large", price: 35.0 },
      ],
    },
    { id: "seed-snack-gravy", name: "Gravy", image: "/images/food/snack-poutine.jpg", sizes: [{ name: "Regular", price: 2.5 }] },
    { id: "seed-snack-garlic-toast", name: "Side Garlic Toast", image: "/images/food/side-garlic-bread.jpg", sizes: [{ name: "Regular", price: 2.5 }] },
    { id: "seed-snack-hot-sauce", name: "Hot Sauce", image: "/images/food/side-wings.jpg", sizes: [{ name: "Regular", price: 3.0 }] },
  ];
  for (const [i, s] of snackDefs.entries()) await upsertItem(snacks.id, i, s);

  // ── Salads ────────────────────────────────────────────────────────────
  const saladDefs: ItemDef[] = [
    { id: "seed-salad-caesar", name: "Caesar Salad", description: "Served with garlic toast. Add chicken +$7.00.", image: "/images/food/salad-caesar.jpg", featured: true, sizes: [{ name: "Regular", price: 13.95 }] },
    { id: "seed-salad-chefs", name: "Chef's Salad", image: "/images/food/salad-caesar.jpg", sizes: [{ name: "Regular", price: 13.95 }] },
    { id: "seed-salad-tossed", name: "Tossed Salad", image: "/images/food/salad-tossed.jpg", sizes: [{ name: "Regular", price: 8.95 }] },
  ];
  for (const [i, s] of saladDefs.entries()) await upsertItem(salads.id, i, s);

  // ── Hot Sandwiches ──────────────────────────────────────────────────────
  const sandwichDefs: ItemDef[] = [
    { id: "seed-sandwich-hamburger", name: "Hot Hamburger Sandwich", description: "Served with french fries and onions.", image: "/images/food/sandwich-burger.jpg", sizes: [{ name: "Regular", price: 15.0 }] },
    { id: "seed-sandwich-turkey", name: "Hot Turkey Sandwich", description: "Served with french fries.", image: "/images/food/sandwich-club.jpg", sizes: [{ name: "Regular", price: 15.0 }] },
    { id: "seed-sandwich-grilled-cheese", name: "Grilled Cheese Sandwich", description: "Served with french fries. Add ham or bacon +$4.00.", image: "/images/food/sandwich-grilled-cheese.jpg", sizes: [{ name: "Regular", price: 11.0 }] },
    { id: "seed-sandwich-burger-deluxe", name: "House Burger Deluxe", description: "Juicy 6 oz. burger patty with bacon, tomato, lettuce. Served with french fries. Add cheese +$1.00.", image: "/images/food/sandwich-burger.jpg", featured: true, sizes: [{ name: "Regular", price: 14.0 }] },
    { id: "seed-sandwich-chicken-burger", name: "Chicken Burger", description: "Served with french fries.", image: "/images/food/sandwich-burger.jpg", sizes: [{ name: "Regular", price: 14.0 }] },
    { id: "seed-sandwich-pizza-sub", name: "Pizza Sub", description: "Pepperoni, salami, ham, diced tomato, green peppers, lettuce, and plenty of mozzarella cheese.", image: "/images/food/pizza-pepperoni.jpg", sizes: [{ name: "Regular", price: 12.95 }] },
    { id: "seed-sandwich-club", name: "Three Decker Club House", description: "Sliced turkey, bacon, tomato, lettuce.", image: "/images/food/sandwich-club.jpg", sizes: [{ name: "Regular", price: 16.0 }] },
    { id: "seed-sandwich-blt", name: "Toasted Bacon, Lettuce and Tomato Sandwich", description: "Served with french fries.", image: "/images/food/sandwich-club.jpg", sizes: [{ name: "Regular", price: 14.5 }] },
  ];
  for (const [i, s] of sandwichDefs.entries()) await upsertItem(sandwiches.id, i, s);

  // ── Others ────────────────────────────────────────────────────────────
  const otherDefs: ItemDef[] = [
    { id: "seed-other-steak", name: "Grilled Chopped Sirloin Steak", description: "With fried onions, french fries, garlic toast and pan gravy.", image: "/images/food/other-steak.jpg", sizes: [{ name: "Regular", price: 16.95 }] },
    { id: "seed-other-filet-fish", name: "Filet O' Fish", description: "2 pieces.", image: "/images/food/other-fish-chips.jpg", sizes: [{ name: "Regular", price: 16.0 }] },
    { id: "seed-other-fish-chips", name: "Fish N' Chips", description: "Served with cheddar cheese and lots of tartar sauce.", image: "/images/food/other-fish-chips.jpg", featured: true, sizes: [{ name: "Regular", price: 16.0 }] },
    { id: "seed-other-bbq-chicken-spaghetti", name: "BBQ Chicken with Spaghetti", description: "In homemade BBQ sauce.", image: "/images/food/other-lasagna.jpg", sizes: [{ name: "Regular", price: 23.95 }] },
    { id: "seed-other-spareribs", name: "BBQ Back Pork Spareribs", description: "Marinated pork spareribs in homemade BBQ sauce. Served with french fries and garlic toast.", image: "/images/food/other-spareribs.jpg", sizes: [{ name: "Regular", price: 23.95 }] },
    { id: "seed-other-lasagna", name: "Baked Lasagna", description: "With meat sauce, cheese and garlic toast. Extra cheese +$2.50.", image: "/images/food/other-lasagna.jpg", sizes: [{ name: "Regular", price: 17.5 }] },
    { id: "seed-other-spaghetti", name: "Baked Spaghetti with Meat Sauce", description: "Served with garlic toast. Extra cheese +$2.50.", image: "/images/food/other-lasagna.jpg", sizes: [{ name: "Regular", price: 17.5 }] },
    {
      id: "seed-other-garlic-fingers",
      name: "Garlic Fingers",
      description: "With white sauce or pizza sauce.",
      image: "/images/food/side-garlic-bread.jpg",
      sizes: [
        { name: "Small", price: 21.0 },
        { name: "Medium", price: 27.0 },
        { name: "Large", price: 30.0 },
      ],
    },
    { id: "seed-other-ny-steak", name: "8 oz. New York Steak", description: "Served with garlic toast and french fries.", image: "/images/food/other-steak.jpg", featured: true, sizes: [{ name: "Regular", price: 24.95 }] },
  ];
  for (const [i, o] of otherDefs.entries()) await upsertItem(others.id, i, o);

  // ── Chinese Menu ────────────────────────────────────────────────────────
  const chineseDefs: ItemDef[] = [
    { id: "seed-chinese-eggroll", name: "Egg Roll / Spring Roll", image: "/images/food/chinese-springroll.jpg", sizes: [{ name: "Each", price: 3.75 }] },
    { id: "seed-chinese-wonton-soup", name: "Wonton Soup", description: "8 pieces.", image: "/images/food/chinese-wonton-soup.jpg", sizes: [{ name: "Regular", price: 15.95 }] },
    { id: "seed-chinese-wonton-soup-noodles", name: "Wonton Soup with Noodles", description: "8 pieces.", image: "/images/food/chinese-wonton-soup.jpg", sizes: [{ name: "Regular", price: 17.95 }] },
    { id: "seed-chinese-fried-wontons", name: "Deep Fried Wontons", description: "12 pieces with homemade sweet & sour sauce.", image: "/images/food/chinese-springroll.jpg", sizes: [{ name: "Regular", price: 15.0 }] },
    { id: "seed-chinese-fried-rice", name: "Fried Rice", description: "With chicken, mushroom, or vegetable.", image: "/images/food/chinese-friedrice.jpg", featured: true, sizes: [{ name: "Regular", price: 15.95 }] },
    { id: "seed-chinese-beef-fried-rice", name: "Beef Fried Rice", image: "/images/food/chinese-friedrice.jpg", sizes: [{ name: "Regular", price: 17.95 }] },
    { id: "seed-chinese-shrimp-fried-rice", name: "Shrimp Fried Rice", image: "/images/food/chinese-friedrice.jpg", sizes: [{ name: "Regular", price: 19.95 }] },
    { id: "seed-chinese-special-fried-rice", name: "Special Fried Rice", description: "With beef, chicken & shrimp.", image: "/images/food/chinese-friedrice.jpg", sizes: [{ name: "Regular", price: 25.95 }] },
    {
      id: "seed-chinese-chow-mein",
      name: "Chow Mein",
      description: "Choose your protein.",
      image: "/images/food/chinese-chowmein.jpg",
      sizes: [
        { name: "Chicken", price: 17.95 },
        { name: "Beef", price: 19.95 },
        { name: "Shrimp", price: 22.95 },
      ],
    },
    { id: "seed-chinese-special-chow-mein", name: "Special Chow Mein", description: "With chicken, beef & shrimp.", image: "/images/food/chinese-chowmein.jpg", sizes: [{ name: "Regular", price: 26.95 }] },
    { id: "seed-chinese-yum-yum-shrimp", name: "Yum Yum Shrimp", image: "/images/food/chinese-friedrice.jpg", sizes: [{ name: "Regular", price: 21.95 }] },
    { id: "seed-chinese-sweetsour-chicken", name: "Sweet & Sour Chicken Balls", image: "/images/food/chinese-sweetsour-chicken.jpg", featured: true, sizes: [{ name: "Regular", price: 17.0 }] },
    { id: "seed-chinese-ginger-beef", name: "Ginger Beef", description: "With steamed rice.", image: "/images/food/chinese-ginger-beef.jpg", sizes: [{ name: "Regular", price: 18.95 }] },
    { id: "seed-chinese-boneless-pork", name: "Boneless Pork", description: "Served with homemade sweet & sour sauce.", image: "/images/food/chinese-sweetsour-chicken.jpg", sizes: [{ name: "Regular", price: 15.95 }] },
    { id: "seed-chinese-lemon-chicken", name: "Breaded Lemon Chicken", image: "/images/food/chinese-sweetsour-chicken.jpg", sizes: [{ name: "Regular", price: 17.95 }] },
    { id: "seed-chinese-combo", name: "Bruno's Signature Chinese Combo", description: "2 mini spring rolls, chicken fried rice, sweet & sour chicken balls.", image: "/images/food/chinese-springroll.jpg", featured: true, sizes: [{ name: "Regular", price: 19.0 }] },
    { id: "seed-chinese-dumplings", name: "Chinese Pork Dumplings", description: "6 pieces.", image: "/images/food/chinese-dumplings.jpg", sizes: [{ name: "Regular", price: 12.95 }] },
    { id: "seed-chinese-stirfry-beef", name: "Stir Fry Beef & Vegetables", image: "/images/food/chinese-ginger-beef.jpg", sizes: [{ name: "Regular", price: 17.95 }] },
    { id: "seed-chinese-steamed-rice", name: "Steamed Rice", image: "/images/food/chinese-friedrice.jpg", sizes: [{ name: "Regular", price: 4.0 }] },
    { id: "seed-chinese-sweetsour-sauce", name: "Sweet & Sour Pineapple Sauce", image: "/images/food/chinese-sweetsour-chicken.jpg", sizes: [{ name: "Regular", price: 3.5 }] },
  ];
  for (const [i, c] of chineseDefs.entries()) await upsertItem(chinese.id, i, c);

  // ── Drinks ────────────────────────────────────────────────────────────
  const drinkDefs = [
    { name: "Coke", price: 2.49, art: "cola" },
    { name: "Pepsi", price: 2.49, art: "soda2" },
    { name: "Sprite", price: 2.49, art: "lemon-lime" },
    { name: "Bottled Water", price: 1.99, art: "water" },
    { name: "Iced Tea", price: 2.49, art: "iced-tea" },
  ];
  for (const [i, d] of drinkDefs.entries()) {
    await upsertItem(drinks.id, i, {
      id: `seed-drink-${i}`,
      name: d.name,
      description: "Ice cold, 20oz bottle.",
      image: `/images/food/drink-${d.art}.jpg`,
      sizes: [{ name: "Regular", price: d.price }],
    });
  }

  // ── Desserts ──────────────────────────────────────────────────────────
  const dessertDefs = [
    { name: "Brownie", description: "Rich, fudgy, chocolate brownie.", price: 4.99, art: "brownie" },
    { name: "Cookies", description: "Warm chocolate chip cookies, 4-pack.", price: 4.49, art: "cookies" },
    { name: "Cheesecake", description: "Creamy New York-style cheesecake slice.", price: 5.99, art: "cheesecake" },
  ];
  for (const [i, d] of dessertDefs.entries()) {
    await upsertItem(desserts.id, i, {
      id: `seed-dessert-${i}`,
      name: d.name,
      description: d.description,
      image: `/images/food/dessert-${d.art}.jpg`,
      sizes: [{ name: "Regular", price: d.price }],
    });
  }

  // ── Deals ─────────────────────────────────────────────────────────────
  const dealDefs = [
    { name: "Bruno Combo", description: "Any medium 2-topping pizza, side garlic toast, and a 2L pop.", price: 26.99, image: "/images/food/pizza-pepperoni.jpg" },
    { name: "Family Feast", description: "2 large 2-topping pizzas, 8-piece wings, and 2L pop.", price: 54.99, image: "/images/food/deal-feast.jpg" },
    { name: "Late Night Combo", description: "Any small pizza + poutine, ready whenever you are - we're open past midnight.", price: 22.99, image: "/images/food/pizza-cheese.jpg" },
  ];
  for (const [i, d] of dealDefs.entries()) {
    await prisma.deal.upsert({
      where: { id: `seed-deal-${i}` },
      update: { ...d, sortOrder: i },
      create: { id: `seed-deal-${i}`, ...d, sortOrder: i },
    });
  }

  // ── Ticket number sequence ───────────────────────────────────────────
  await prisma.$executeRawUnsafe(
    `CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 10001 INCREMENT BY 1;`
  );

  // ── Admin user ────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@brunopizza.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change_this_password";
  const adminName = process.env.ADMIN_NAME || "Bruno's Deli & Pizza Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: adminName, email: adminEmail, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
