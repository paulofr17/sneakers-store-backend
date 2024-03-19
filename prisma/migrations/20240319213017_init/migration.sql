-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'user');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "googleId" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "role" NOT NULL DEFAULT 'user',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "color_name" VARCHAR(50) NOT NULL,
    "preview_image" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stock" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "product_variant_id" INTEGER NOT NULL,
    "size_number" DECIMAL(4,1) NOT NULL,

    CONSTRAINT "product_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_stock_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_stock_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preview_image" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "size" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "totalPrice" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size" (
    "number" DECIMAL(4,1) NOT NULL,

    CONSTRAINT "size_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "color" (
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "color_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "image" (
    "url" VARCHAR(255) NOT NULL,
    "product_variant_id" INTEGER NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("url")
);

-- CreateTable
CREATE TABLE "category" (
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "product_id_key" ON "product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_slug_key" ON "product_variant"("slug");

-- CreateIndex
CREATE INDEX "product_variant_color_name_idx" ON "product_variant"("color_name");

-- CreateIndex
CREATE INDEX "product_variant_product_id_idx" ON "product_variant"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_product_id_color_name_key" ON "product_variant"("product_id", "color_name");

-- CreateIndex
CREATE INDEX "product_stock_product_variant_id_idx" ON "product_stock"("product_variant_id");

-- CreateIndex
CREATE INDEX "product_stock_size_number_idx" ON "product_stock"("size_number");

-- CreateIndex
CREATE UNIQUE INDEX "product_stock_product_variant_id_size_number_key" ON "product_stock"("product_variant_id", "size_number");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_id_key" ON "product_category"("id");

-- CreateIndex
CREATE INDEX "product_category_product_id_idx" ON "product_category"("product_id");

-- CreateIndex
CREATE INDEX "product_category_category_name_idx" ON "product_category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_product_id_category_name_key" ON "product_category"("product_id", "category_name");

-- CreateIndex
CREATE UNIQUE INDEX "cart_id_key" ON "cart"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_userId_key" ON "cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_id_key" ON "cart_item"("id");

-- CreateIndex
CREATE INDEX "cart_item_cart_id_idx" ON "cart_item"("cart_id");

-- CreateIndex
CREATE INDEX "cart_item_product_stock_id_idx" ON "cart_item"("product_stock_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_product_stock_id_key" ON "cart_item"("cart_id", "product_stock_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_id_key" ON "order"("id");

-- CreateIndex
CREATE INDEX "order_user_id_idx" ON "order"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_id_key" ON "order_item"("id");

-- CreateIndex
CREATE INDEX "order_item_order_id_idx" ON "order_item"("order_id");

-- CreateIndex
CREATE INDEX "order_item_product_stock_id_idx" ON "order_item"("product_stock_id");

-- CreateIndex
CREATE UNIQUE INDEX "size_number_key" ON "size"("number");

-- CreateIndex
CREATE UNIQUE INDEX "color_name_key" ON "color"("name");

-- CreateIndex
CREATE UNIQUE INDEX "image_url_key" ON "image"("url");

-- CreateIndex
CREATE INDEX "image_product_variant_id_idx" ON "image"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_color_name_fkey" FOREIGN KEY ("color_name") REFERENCES "color"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_stock" ADD CONSTRAINT "product_stock_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_stock" ADD CONSTRAINT "product_stock_size_number_fkey" FOREIGN KEY ("size_number") REFERENCES "size"("number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "category"("name") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_stock_id_fkey" FOREIGN KEY ("product_stock_id") REFERENCES "product_stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_stock_id_fkey" FOREIGN KEY ("product_stock_id") REFERENCES "product_stock"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
