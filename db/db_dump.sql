--
-- PostgreSQL database dump
--

-- Dumped from database version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.10 (Ubuntu 10.10-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: image_type; Type: TYPE; Schema: public; Owner: dev
--

CREATE TYPE public.image_type AS ENUM (
    'full_image',
    'thumbnail'
);


ALTER TYPE public.image_type OWNER TO dev;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: cartItems; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public."cartItems" (
    id integer NOT NULL,
    pid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "cartId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."cartItems" OWNER TO dev;

--
-- Name: cartItems_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public."cartItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."cartItems_id_seq" OWNER TO dev;

--
-- Name: cartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public."cartItems_id_seq" OWNED BY public."cartItems".id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    pid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "statusId" integer NOT NULL,
    "userId" integer,
    "lastInteraction" timestamp with time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.carts OWNER TO dev;

--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.carts_id_seq OWNER TO dev;

--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.images (
    id integer NOT NULL,
    pid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" integer NOT NULL,
    "createdById" integer NOT NULL,
    "altText" text,
    name text,
    file text,
    type public.image_type,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.images OWNER TO dev;

--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.images_id_seq OWNER TO dev;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.products (
    id integer NOT NULL,
    pid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdById" integer NOT NULL,
    caption text,
    cost integer NOT NULL,
    description text,
    name text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public.products OWNER TO dev;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO dev;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: dev
--

CREATE TABLE public.users (
    id integer NOT NULL,
    pid uuid DEFAULT public.uuid_generate_v4(),
    "roleId" integer DEFAULT 1,
    firstname text,
    "lastName" text,
    email text,
    password text,
    "lastAccessedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO dev;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: dev
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO dev;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dev
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cartItems id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public."cartItems" ALTER COLUMN id SET DEFAULT nextval('public."cartItems_id_seq"'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: dev
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cartItems; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public."cartItems" (id, pid, "cartId", "productId", quantity, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	5974f7a7-3f23-49f7-82a9-17d220bc7156	1	1	1	2020-02-22 20:22:56.614372+00	2020-02-22 20:22:56.614372+00	\N
2	c89afa1d-6935-4d99-b7ee-370b5182d7b5	1	2	1	2020-02-22 20:23:31.765399+00	2020-02-22 20:23:31.765399+00	\N
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.carts (id, pid, "statusId", "userId", "lastInteraction", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	0f772368-b1b0-4995-9951-895abf39c514	2	\N	2020-02-22 20:22:56.607979+00	2020-02-22 20:22:56.607979+00	2020-02-22 20:22:56.607979+00	\N
\.


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.images (id, pid, "productId", "createdById", "altText", name, file, type, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	151340c5-a732-49d7-89b7-a0fa7e5532fb	1	1	Strawberry cupcake	Strawberry Delight	cupcake_sq_1.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
2	883d5519-4d1d-4f0d-bc9d-f95231337f74	1	1	Strawberry cupcake	Strawberry Delight	cupcake_sq_1.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
3	f97c5bd7-648e-44ac-b71c-da27feb6c86c	2	1	Berry cupcake	Purple Dream	cupcake_sq_2.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
4	bacadb1a-1340-443c-aa2e-f795ab49098b	2	1	Berry cupcake	Purple Dream	cupcake_sq_2.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
5	7e23bec7-b91f-479c-b98d-b2b8a5b1871a	3	1	Mini strawberry cupcake	Mini Berry	cupcake_sq_3.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
6	d3a84519-b53e-48b9-aa33-2f6ede2d565c	3	1	Mini strawberry cupcake	Mini Berry	cupcake_sq_3.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
7	30b88815-020c-4974-8901-87c357ee75fb	4	1	Unicorn tear sparkling cupcake	Unicorn Tear	cupcake_sq_4.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
8	ef53e945-d117-4f26-8d61-a42bc5459c38	4	1	Unicorn tear sparkling cupcake	Unicorn Tear	cupcake_sq_4.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
9	997e3ffe-313e-4e0a-bdc7-88bd1a5163a4	5	1	Red and yellow vanilla cupcake	Pearl Rose	cupcake_sq_5.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
10	18105813-6753-44d2-93a6-60e1095e9437	5	1	Red and yellow vanilla cupcake	Pearl Rose	cupcake_sq_5.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
11	eb865a9d-54a0-49cc-8e08-0df2a9e1be99	6	1	Silky red cupcake loaded with frosting	Red Silk	cupcake_sq_6.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
12	838cc50d-9306-4166-8f0f-9e47031d8839	6	1	Silky red cupcake loaded with frosting	Red Silk	cupcake_sq_6.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
13	19ec73fe-02c5-466b-8502-b8404c45353e	7	1	Vanilla cupcake with vanilla frosting	Vanilla Stack Cake	cupcake_sq_7.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
14	5621704c-0f95-43e9-ac75-dfb8001682fc	7	1	Vanilla cupcake with vanilla frosting	Vanilla Stack Cake	cupcake_sq_7.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
15	5d6f4c53-9263-4c49-a61c-a83622fcd3fa	8	1	Blueberry cupcake piled high with toppings	Blueberry Malt Cake	cupcake_sq_8.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
16	46ddd0d0-a501-4555-95eb-d029ef1b7820	8	1	Blueberry cupcake piled high with toppings	Blueberry Malt Cake	cupcake_sq_8.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
17	11a3f22d-c4db-4f36-bc7a-c0400fe49678	9	1	Lemon cupcake with piled high lemon frosting	Double Lemon	cupcake_sq_9.jpg	full_image	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
18	a5c5cfd4-e408-4846-9318-3c8d13a1a1c2	9	1	Lemon cupcake with piled high lemon frosting	Double Lemon	cupcake_sq_9.jpg	thumbnail	2020-02-09 00:10:09.629058+00	2020-02-09 00:10:09.629058+00	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.products (id, pid, "createdById", caption, cost, description, name, "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	22f81249-e14d-4bce-a325-1eab6d684682	1	Delicious Strawberry Cupcake	350	These strawberry delights will satisfy both your sweet tooth and those strawberry cravings.	Strawberry Delight	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
2	1c37f49c-7e18-4656-be50-1f472fd87e76	1	Sweet Berry Cupcake	200	This is the berry cupcake of your dreams, they may be small but pack huge flavor.	Purple Dream	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
3	31fc7e86-a248-45d9-84f3-77c6426dbaa3	1	Mini Strawberry Cupcake	225	These are a miniature version of our famous Strawberry Delight cupcakes, all the flavor, half the guilt.	Mini Berry	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
4	b288ec09-ffdf-4be1-926a-4a63aa2de765	1	Unicorn Tear Sparkling Cupcake	650	What do unicorn tears taste like? We don't know, but we do know these cupcakes taste better!	Unicorn Tear	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
5	25111cb7-f4d0-44c3-a85e-739a6cd921e9	1	Red and Yellow Rose Vanilla Cupcake	575	Delightful vanilla cupcakes with rose frosting piled high on top.	Pearl Rose	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
6	b34294ab-df35-4cbb-9b04-6e59d58be19b	1	Silky Red Cupcake Loaded with Frosting	350	A vanilla cupcake with strawberry silk frosting eloquently piled high with a peach topping.	Red Silk	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
7	6fe6a9fe-de63-4dc3-9a2c-320decb301e0	1	Vanilla Cupcake Piled with Vanilla Frosting	600	Not just another vanilla cupcake. Our Vanilla Stack Cake cupcake is stacked with three scoops of vanilla frosting and topped with drizzled vanilla and a delicious cherry.	Vanilla Stack Cake	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
8	16d15ae6-4fe1-4fb1-b6bb-4539267991df	1	Blueberry Cupcake Piled High with Toppings	775	A large blueberry cupcake topped with blueberry frosting, chocolate syrup, whip cream, and a sweet cherry. Looks and taste like your favorite blueberry malt.	Blueberry Malt Cake	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
9	54ae0847-74e5-487b-b40e-04f22f8dfd13	1	Lemon Cupcake with Piled High Lemon Frosting	450	Lemon, lemon, and more lemon! Love lemon? So do we and our Double Lemon cupcake proves it!	Double Lemon	2020-02-09 00:10:21.208739+00	2020-02-09 00:10:21.208739+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dev
--

COPY public.users (id, pid, "roleId", firstname, "lastName", email, password, "lastAccessedAt", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Name: cartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public."cartItems_id_seq"', 2, true);


--
-- Name: carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.carts_id_seq', 1, true);


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.images_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dev
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

