DROP TABLE IF EXISTS "orders";

CREATE TABLE "orders" (
  "id" SERIAL,
	"itemCount" int NOT NULL,
  "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
	"total" int NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL,
	"cartId" int DEFAULT NULL,
	"guestId" int DEFAULT NULL,
	"statusId" int DEFAULT NULL,
	"userId" int DEFAULT NULL
);

DROP TABLE IF EXISTS "orderItems";

CREATE TABLE "orderItems" (
	"each" int NOT NULL,
  "id" SERIAL,
  "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
  "quantity" int NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL,
	"orderId" int NOT NULL,
	"productId" int DEFAULT NULL
);


DROP TABLE IF EXISTS "orderStatuses";

CREATE TABLE "orderStatuses" (
	"description" text DEFAULT NULL,
  "id" SERIAL,
  "mid" text NOT NULL,
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL
);
