/*
  Warnings:

  - Added the required column `name` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FormCategory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "formCategoryId" TEXT,
    "title" TEXT,
    "placeholder" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN DEFAULT false,
    CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormQuestion_formCategoryId_fkey" FOREIGN KEY ("formCategoryId") REFERENCES "FormCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FormQuestion" ("createdAt", "formCategoryId", "formId", "id", "placeholder", "required", "title", "type", "updatedAt") SELECT "createdAt", "formCategoryId", "formId", "id", "placeholder", "required", "title", "type", "updatedAt" FROM "FormQuestion";
DROP TABLE "FormQuestion";
ALTER TABLE "new_FormQuestion" RENAME TO "FormQuestion";
CREATE TABLE "new_FormCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "title" TEXT,
    "name" TEXT NOT NULL,
    CONSTRAINT "FormCategory_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FormCategory" ("createdAt", "formId", "id", "title", "updatedAt") SELECT "createdAt", "formId", "id", "title", "updatedAt" FROM "FormCategory";
DROP TABLE "FormCategory";
ALTER TABLE "new_FormCategory" RENAME TO "FormCategory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
