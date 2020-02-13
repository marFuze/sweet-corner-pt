DROP TABLE IF EXISTS "cartStatuses";

CREATE TABLE "cartStatuses" (
  "id" SERIAL,
  "mid" text NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT NOW(),
  "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
  "deletedAt" timestamptz DEFAULT NULL
);

INSERT INTO "cartStatuses" ("description", "id", "mid", "name", "createdAt", "updatedAt", "deletedAt") VALUES
('Cart is new and empty', 1, 'new', 'New', now(), now(), NULL),
('Cart has items but the order has not been completed', 2, 'active', 'Active', now(), now(), NULL),
('The order has been completed and the cart is closed', 3, 'closed', 'Closed', now(), now(), NULL),
('The order has been canceled and the cart is closed', 4, 'canceled', 'Canceled', now(), now(), NULL),
('Cart is no longer the currently active cart, but can be reactivated', 5, 'inactive', 'Inactive', now(), now(), NULL);