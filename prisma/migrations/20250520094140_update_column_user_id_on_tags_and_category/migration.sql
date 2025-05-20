-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "userId" DROP NOT NULL;
