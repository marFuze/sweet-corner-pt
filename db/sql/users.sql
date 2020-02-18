DROP TABLE IF EXISTS "users";

CREATE TABLE "users" (
"id" SERIAL,
"pid" uuid default uuid_generate_v4(),
"roleId" int default 1,
"firstname" text,
"lastName" text,
"email" text,
"password" text,
"lastAccessedAt" timestamptz NOT NULL DEFAULT NOW(),
"createdAt" timestamptz NOT NULL DEFAULT NOW(),
"updatedAt" timestamptz NOT NULL DEFAULT NOW(),
"deletedAt" timestamptz NOT NULL DEFAULT NOW()
);