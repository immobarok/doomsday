-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "release_year" INTEGER NOT NULL,
    "runtime_minutes" INTEGER NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_prerequisites" (
    "movie_id" UUID NOT NULL,
    "prerequisite_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_prerequisites_pkey" PRIMARY KEY ("movie_id","prerequisite_id")
);

-- CreateTable
CREATE TABLE "cinemas" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cinemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cinema_bundle_sizes" (
    "cinema_id" UUID NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "cinema_bundle_sizes_pkey" PRIMARY KEY ("cinema_id","size")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_title_key" ON "movies"("title");

-- CreateIndex
CREATE INDEX "movie_prerequisites_prerequisite_id_idx" ON "movie_prerequisites"("prerequisite_id");

-- CreateIndex
CREATE UNIQUE INDEX "cinemas_name_key" ON "cinemas"("name");

-- AddForeignKey
ALTER TABLE "movie_prerequisites" ADD CONSTRAINT "movie_prerequisites_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_prerequisites" ADD CONSTRAINT "movie_prerequisites_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cinema_bundle_sizes" ADD CONSTRAINT "cinema_bundle_sizes_cinema_id_fkey" FOREIGN KEY ("cinema_id") REFERENCES "cinemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "movies" ADD CONSTRAINT "chk_movies_runtime_minutes" CHECK ("runtime_minutes" BETWEEN 1 AND 300);

-- AddCheckConstraint
ALTER TABLE "movie_prerequisites" ADD CONSTRAINT "chk_movie_prerequisites_no_self_loop" CHECK ("movie_id" <> "prerequisite_id");

-- AddCheckConstraint
ALTER TABLE "cinema_bundle_sizes" ADD CONSTRAINT "chk_cinema_bundle_sizes_range" CHECK ("size" BETWEEN 1 AND 500);
