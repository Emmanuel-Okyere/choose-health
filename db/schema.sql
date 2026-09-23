-- Choose Health schema. Idempotent: safe to run repeatedly.

CREATE TABLE IF NOT EXISTS products (
  id              serial PRIMARY KEY,
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  brand           text,
  description     text NOT NULL,
  size            text,
  category        text NOT NULL,          -- spices | detox | balms | nuts-seeds
  price_pesewas   integer NOT NULL CHECK (price_pesewas >= 0),
  image           text,
  badge           text,                   -- e.g. "Restocked", "Wholesale"
  in_stock        boolean NOT NULL DEFAULT true,
  wholesale       boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id            serial PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  excerpt       text NOT NULL,
  body          text NOT NULL,            -- light markdown: "## " headings, "- " bullets, blank-line paragraphs
  category      text NOT NULL,
  read_minutes  integer NOT NULL DEFAULT 3,
  published_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                serial PRIMARY KEY,
  code              text UNIQUE NOT NULL,
  customer_name     text NOT NULL,
  phone             text NOT NULL,
  fulfilment        text NOT NULL CHECK (fulfilment IN ('pickup', 'delivery')),
  address           text,
  payment_method    text NOT NULL CHECK (payment_method IN ('momo', 'cash')),
  note              text,
  subtotal_pesewas  integer NOT NULL,
  status            text NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'paid', 'ready', 'completed', 'cancelled')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id                   serial PRIMARY KEY,
  order_id             integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id           integer REFERENCES products(id) ON DELETE SET NULL,
  name                 text NOT NULL,
  unit_price_pesewas   integer NOT NULL,
  quantity             integer NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
