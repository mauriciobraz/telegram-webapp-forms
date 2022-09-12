-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT
);

-- CreateTable
CREATE TABLE "FormCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "title" TEXT,
    CONSTRAINT "FormCategory_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "formCategoryId" TEXT,
    "title" TEXT,
    "placeholder" TEXT,
    "type" TEXT NOT NULL,
    "required" BOOLEAN DEFAULT false,
    CONSTRAINT "FormQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormQuestion_formCategoryId_fkey" FOREIGN KEY ("formCategoryId") REFERENCES "FormCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
