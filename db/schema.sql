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

-- Extra admin accounts. The owner (default super admin) comes from ADMIN_USERNAME /
-- ADMIN_PASSWORD env vars and is intentionally NOT stored here, so it can never be deleted.
CREATE TABLE IF NOT EXISTS admin_users (
  id               serial PRIMARY KEY,
  username         text UNIQUE NOT NULL CHECK (username = lower(username)),
  name             text NOT NULL,
  password_hash    text NOT NULL,
  role             text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  session_version  integer NOT NULL DEFAULT 1,   -- bumped to sign the user out everywhere
  created_by       text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Who last changed an order's status, and when (added after launch; safe to re-run).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_by text;
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Product management (added after launch; safe to re-run).
ALTER TABLE products ADD COLUMN IF NOT EXISTS details text;                    -- longer text for the product page
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0);  -- NULL = not counted
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;  -- false = hidden from the shop
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Product photos stored in the database. The first by sort_order is the main photo.
CREATE TABLE IF NOT EXISTS product_images (
  id            serial PRIMARY KEY,
  product_id    integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  data          bytea NOT NULL,
  content_type  text NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  byte_size     integer NOT NULL,
  width         integer,
  height        integer,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id, sort_order, id);
