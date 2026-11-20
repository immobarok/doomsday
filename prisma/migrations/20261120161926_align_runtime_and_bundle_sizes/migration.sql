/*
  Warnings:

  - You are about to drop the column `runtime_minutes` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the `cinema_bundle_sizes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `runtime` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cinema_bundle_sizes" DROP CONSTRAINT "cinema_bundle_sizes_cinema_id_fkey";

-- AlterTable
ALTER TABLE "cinemas" ADD COLUMN     "bundle_sizes" INTEGER[];

-- AlterTable
ALTER TABLE "movies" DROP COLUMN "runtime_minutes",
ADD COLUMN     "runtime" INTEGER NOT NULL;

-- DropTable
DROP TABLE "cinema_bundle_sizes";

-- AddCheckConstraint
ALTER TABLE "movies" ADD CONSTRAINT "chk_movies_runtime" CHECK ("runtime" BETWEEN 1 AND 300);

-- AddCheckConstraint
ALTER TABLE "cinemas" ADD CONSTRAINT "chk_cinemas_bundle_sizes_length" CHECK (array_length("bundle_sizes", 1) BETWEEN 1 AND 10);
