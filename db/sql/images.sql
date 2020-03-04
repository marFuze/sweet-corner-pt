create type image_type as enum('full_image', 'thumbnail');

  DROP TABLE IF EXISTS "images";

  CREATE TABLE "images" (
      "id" SERIAL,
      "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
      "productId" int NOT NULL,
      "createdById" int NOT NULL,
      "altText" text DEFAULT NULL,
      "name" text,
      "file" text DEFAULT NULL,
      "type" image_type,
      "createdAt" timestamptz NOT NULL DEFAULT NOW(),
      "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
      "deletedAt" timestamptz DEFAULT NULL
  );

  INSERT INTO "images" ("productId", "altText", "id", "name", "file", "type", "createdAt", "updatedAt", "deletedAt", "createdById") VALUES
  (1, 'Strawberry cupcake', 1, 'Strawberry Delight', 'cupcake_sq_1.jpg', 'full_image', now(), now(), NULL, 1),
  (1, 'Strawberry cupcake', 2, 'Strawberry Delight', 'cupcake_sq_1.jpg', 'thumbnail', now(), now(), NULL, 1),
  (2, 'Berry cupcake', 3, 'Purple Dream', 'cupcake_sq_2.jpg', 'full_image', now(), now(), NULL, 1),
  (2, 'Berry cupcake', 4, 'Purple Dream', 'cupcake_sq_2.jpg', 'thumbnail', now(), now(), NULL, 1),
  (3, 'Mini strawberry cupcake', 5, 'Mini Berry', 'cupcake_sq_3.jpg', 'full_image', now(), now(), NULL, 1),
  (3, 'Mini strawberry cupcake', 6, 'Mini Berry', 'cupcake_sq_3.jpg', 'thumbnail', now(), now(), NULL, 1),
  (4, 'Unicorn tear sparkling cupcake', 7, 'Unicorn Tear', 'cupcake_sq_4.jpg', 'full_image', now(), now(), NULL, 1),
  (4, 'Unicorn tear sparkling cupcake', 8, 'Unicorn Tear', 'cupcake_sq_4.jpg', 'thumbnail', now(), now(), NULL, 1),
  (5, 'Red and yellow vanilla cupcake', 9, 'Pearl Rose', 'cupcake_sq_5.jpg', 'full_image', now(), now(), NULL, 1),
  (5, 'Red and yellow vanilla cupcake', 10, 'Pearl Rose', 'cupcake_sq_5.jpg', 'thumbnail', now(), now(), NULL, 1),
  (6, 'Silky red cupcake loaded with frosting', 11, 'Red Silk', 'cupcake_sq_6.jpg', 'full_image', now(), now(), NULL, 1),
  (6, 'Silky red cupcake loaded with frosting', 12, 'Red Silk', 'cupcake_sq_6.jpg', 'thumbnail', now(), now(), NULL, 1),
  (7, 'Vanilla cupcake with vanilla frosting', 13, 'Vanilla Stack Cake', 'cupcake_sq_7.jpg', 'full_image', now(), now(), NULL, 1),
  (7, 'Vanilla cupcake with vanilla frosting', 14, 'Vanilla Stack Cake', 'cupcake_sq_7.jpg', 'thumbnail', now(), now(), NULL, 1),
  (8, 'Blueberry cupcake piled high with toppings', 15, 'Blueberry Malt Cake', 'cupcake_sq_8.jpg', 'full_image', now(), now(), NULL, 1),
  (8, 'Blueberry cupcake piled high with toppings', 16, 'Blueberry Malt Cake', 'cupcake_sq_8.jpg', 'thumbnail', now(), now(), NULL, 1),
  (9, 'Lemon cupcake with piled high lemon frosting', 17, 'Double Lemon', 'cupcake_sq_9.jpg', 'full_image', now(), now(), NULL, 1),
  (9, 'Lemon cupcake with piled high lemon frosting', 18, 'Double Lemon', 'cupcake_sq_9.jpg', 'thumbnail', now(), now(), NULL, 1);