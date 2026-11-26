-- CreateEnum
CREATE TYPE "ChronicleCategory" AS ENUM ('VOYAGE_LOG', 'ISLAND_DISCOVERY', 'AKUMA_NO_MI', 'VOID_CENTURY');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CREW_RECRUITMENT', 'BOUNTY_HUNTER');

-- CreateEnum
CREATE TYPE "Sea" AS ENUM ('EAST_BLUE', 'GRAND_LINE', 'NEW_WORLD');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "chronicles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ChronicleCategory" NOT NULL,
    "cover_url" TEXT,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "chronicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronicle_likes" (
    "chronicle_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronicle_likes_pkey" PRIMARY KEY ("chronicle_id","user_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "chronicle_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "reward" BIGINT NOT NULL DEFAULT 0,
    "sea" "Sea" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'OPEN',
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chronicles_created_at_idx" ON "chronicles"("created_at" DESC);

-- CreateIndex
CREATE INDEX "chronicles_category_created_at_idx" ON "chronicles"("category", "created_at" DESC);

-- CreateIndex
CREATE INDEX "chronicles_author_id_idx" ON "chronicles"("author_id");

-- CreateIndex
CREATE INDEX "chronicle_likes_user_id_idx" ON "chronicle_likes"("user_id");

-- CreateIndex
CREATE INDEX "comments_chronicle_id_created_at_idx" ON "comments"("chronicle_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");

-- CreateIndex
CREATE INDEX "contracts_sea_type_status_created_at_idx" ON "contracts"("sea", "type", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "contracts_created_at_idx" ON "contracts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "contracts_author_id_idx" ON "contracts"("author_id");

-- AddForeignKey
ALTER TABLE "chronicles" ADD CONSTRAINT "chronicles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_likes" ADD CONSTRAINT "chronicle_likes_chronicle_id_fkey" FOREIGN KEY ("chronicle_id") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronicle_likes" ADD CONSTRAINT "chronicle_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_chronicle_id_fkey" FOREIGN KEY ("chronicle_id") REFERENCES "chronicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (PostgreSQL Full-Text Search GIN weighted index on chronicles)
CREATE INDEX "chronicles_fts_idx" ON "chronicles"
USING GIN (
  (
    setweight(to_tsvector('portuguese', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce("content", '')), 'B')
  )
);

-- CreateIndex (PostgreSQL Full-Text Search GIN weighted index on contracts)
CREATE INDEX "contracts_fts_idx" ON "contracts"
USING GIN (
  (
    setweight(to_tsvector('portuguese', coalesce("title", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce("description", '')), 'B')
  )
);
