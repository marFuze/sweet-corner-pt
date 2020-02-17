DROP TABLE IF EXISTS "cartItems";

CREATE TABLE "cartItems" (
  "id" SERIAL,
  "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
  "productId" uuid NOT NULL,
  "quantity" int DEFAULT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL
);


