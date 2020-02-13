DROP TABLE IF EXISTS "carts";

CREATE TABLE "carts" (
  "id" SERIAL,
  "pid" uuid NOT NULL DEFAULT uuid_generate_v4 (),
  "statusId" int NOT NULL,
  "userId" int DEFAULT NULL,
  "lastInteraction" timestamptz NOT NULL DEFAULT NOW(),
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL
);