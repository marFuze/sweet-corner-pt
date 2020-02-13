DROP TABLE IF EXISTS "products";

  CREATE TABLE "products" (
      "id" SERIAL,
      "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
      "createdById" int NOT NULL,
      "caption" text DEFAULT NULL,
      "cost" int NOT NULL,
      "description" text DEFAULT NULL,
      "name" text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT NOW(),
      "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
      "deletedAt" timestamptz DEFAULT NULL
  );

  INSERT INTO "products" ("caption", "cost", "description", "id", "name", "createdAt", "updatedAt", "deletedAt", "createdById") VALUES
  ('Delicious Strawberry Cupcake', 350, 'These strawberry delights will satisfy both your sweet tooth and those strawberry cravings.', 1, 'Strawberry Delight', now(), now(), NULL, 1),
  ('Sweet Berry Cupcake', 200, 'This is the berry cupcake of your dreams, they may be small but pack huge flavor.', 2, 'Purple Dream', now(), now(), NULL, 1),
  ('Mini Strawberry Cupcake', 225, 'These are a miniature version of our famous Strawberry Delight cupcakes, all the flavor, half the guilt.', 3, 'Mini Berry', now(), now(), NULL, 1),
  ('Unicorn Tear Sparkling Cupcake', 650, 'What do unicorn tears taste like? We don''t know, but we do know these cupcakes taste better!', 4, 'Unicorn Tear', now(), now(), NULL, 1),
  ('Red and Yellow Rose Vanilla Cupcake', 575, 'Delightful vanilla cupcakes with rose frosting piled high on top.', 5, 'Pearl Rose', now(), now(), NULL, 1),
  ('Silky Red Cupcake Loaded with Frosting', 350, 'A vanilla cupcake with strawberry silk frosting eloquently piled high with a peach topping.', 6, 'Red Silk', now(), now(), NULL, 1),
  ('Vanilla Cupcake Piled with Vanilla Frosting', 600, 'Not just another vanilla cupcake. Our Vanilla Stack Cake cupcake is stacked with three scoops of vanilla frosting and topped with drizzled vanilla and a delicious cherry.', 7, 'Vanilla Stack Cake', now(), now(), NULL, 1),
  ('Blueberry Cupcake Piled High with Toppings', 775, 'A large blueberry cupcake topped with blueberry frosting, chocolate syrup, whip cream, and a sweet cherry. Looks and taste like your favorite blueberry malt.', 8, 'Blueberry Malt Cake', now(), now(), NULL, 1),
  ('Lemon Cupcake with Piled High Lemon Frosting', 450, 'Lemon, lemon, and more lemon! Love lemon? So do we and our Double Lemon cupcake proves it!', 9, 'Double Lemon', now(), now(), NULL, 1);