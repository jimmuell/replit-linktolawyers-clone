# Case Type Dropdown Implementation Prompt

## Overview
Implement a comprehensive case type dropdown system with bilingual support (English/Spanish) for immigration law case types. This system includes database storage, API endpoints, admin management, and client-side usage.

## Required Components

### 1. Database Schema (shared/schema.ts)
Add this table definition to your Drizzle schema:

```typescript
export const caseTypes = pgTable("case_types", {
  id: serial("id").primaryKey(),
  value: varchar("value", { length: 255 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  labelEs: varchar("label_es", { length: 255 }),
  description: text("description").notNull(),
  descriptionEs: text("description_es"),
  category: varchar("category", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add insert schema and types
export const insertCaseTypeSchema = createInsertSchema(caseTypes).pick({
  value: true,
  label: true,
  labelEs: true,
  description: true,
  descriptionEs: true,
  category: true,
  displayOrder: true,
  isActive: true,
});

export type InsertCaseType = z.infer<typeof insertCaseTypeSchema>;
export type CaseType = typeof caseTypes.$inferSelect;
```

### 2. Storage Interface (server/storage.ts)
Add these methods to your IStorage interface and DatabaseStorage class:

```typescript
// In IStorage interface
getCaseType(id: number): Promise<CaseType | undefined>;
getAllCaseTypes(): Promise<CaseType[]>;
createCaseType(caseType: InsertCaseType): Promise<CaseType>;
updateCaseType(id: number, caseType: Partial<InsertCaseType>): Promise<CaseType>;
deleteCaseType(id: number): Promise<void>;

// In DatabaseStorage class implementation
async getCaseType(id: number): Promise<CaseType | undefined> {
  const [caseType] = await db
    .select()
    .from(caseTypes)
    .where(eq(caseTypes.id, id));
  return caseType || undefined;
}

async getAllCaseTypes(): Promise<CaseType[]> {
  return await db
    .select()
    .from(caseTypes)
    .where(eq(caseTypes.isActive, true))
    .orderBy(asc(caseTypes.displayOrder), asc(caseTypes.label));
}

async createCaseType(insertCaseType: InsertCaseType): Promise<CaseType> {
  const [caseType] = await db
    .insert(caseTypes)
    .values(insertCaseType)
    .returning();
  return caseType;
}

async updateCaseType(id: number, updates: Partial<InsertCaseType>): Promise<CaseType> {
  const [caseType] = await db
    .update(caseTypes)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(caseTypes.id, id))
    .returning();
  return caseType;
}

async deleteCaseType(id: number): Promise<void> {
  await db.delete(caseTypes).where(eq(caseTypes.id, id));
}
```

### 3. API Routes (server/routes.ts)
Add these API endpoints:

```typescript
// Public endpoint for client-side dropdown
app.get("/api/case-types", async (req, res) => {
  try {
    const caseTypes = await storage.getAllCaseTypes();
    const language = req.query.lang as string || 'en';
    
    // Transform case types based on language
    const transformedCaseTypes = caseTypes.map(caseType => ({
      ...caseType,
      label: language === 'es' && caseType.labelEs ? caseType.labelEs : caseType.label,
      description: language === 'es' && caseType.descriptionEs ? caseType.descriptionEs : caseType.description
    }));
    
    res.json({ success: true, data: transformedCaseTypes });
  } catch (error) {
    console.error("Error fetching case types:", error);
    res.status(500).json({ success: false, error: "Failed to fetch case types" });
  }
});

// Admin endpoints for management
app.get("/api/admin/case-types", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const caseTypes = await storage.getAllCaseTypes();
    res.json(caseTypes);
  } catch (error) {
    console.error("Error fetching case types:", error);
    res.status(500).json({ error: "Failed to fetch case types" });
  }
});

app.post("/api/admin/case-types", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const validatedData = insertCaseTypeSchema.parse(req.body);
    const caseType = await storage.createCaseType(validatedData);
    res.json(caseType);
  } catch (error) {
    console.error("Error creating case type:", error);
    res.status(500).json({ error: "Failed to create case type" });
  }
});

app.put("/api/admin/case-types/:id", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const id = parseInt(req.params.id);
    const validatedData = insertCaseTypeSchema.partial().parse(req.body);
    const caseType = await storage.updateCaseType(id, validatedData);
    res.json(caseType);
  } catch (error) {
    console.error("Error updating case type:", error);
    res.status(500).json({ error: "Failed to update case type" });
  }
});

app.delete("/api/admin/case-types/:id", async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const id = parseInt(req.params.id);
    await storage.deleteCaseType(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting case type:", error);
    res.status(500).json({ error: "Failed to delete case type" });
  }
});
```

### 4. Data Seeding (server/seed-case-types.ts)
Create a comprehensive seeding function:

```typescript
import { storage } from "./storage";
import type { InsertCaseType } from "@shared/schema";

export async function seedCaseTypes() {
  console.log("Seeding case types...");
  
  try {
    const caseTypesData: InsertCaseType[] = [
      {
        value: "family-based-immigrant-visa-immediate-relative",
        label: "Family-Based Immigrant Visa - Immediate Relative",
        labelEs: "Visa de Inmigrante Basada en Familia - Pariente Inmediato",
        description: "You are a spouse, parent, or unmarried child under 21 of a U.S. citizen",
        descriptionEs: "Eres cónyuge, padre or hijo soltero menor de 21 años de un ciudadano estadounidense",
        category: "Family-Based Immigrant Visa",
        displayOrder: 1,
        isActive: true
      },
      {
        value: "family-based-immigrant-visa-family-preference-category",
        label: "Family-Based Immigrant Visa - Family Preference Category",
        labelEs: "Visa de Inmigrante Basada en Familia - Categoría de Preferencia Familiar",
        description: "More distant relatives of U.S. citizens or relatives of green card holders",
        descriptionEs: "Parientes más distantes de ciudadanos estadounidenses o parientes de portadores de tarjeta verde",
        category: "Family-Based Immigrant Visa",
        displayOrder: 2,
        isActive: true
      },
      {
        value: "k1-fiance-visa",
        label: "K-1 Fiancé(e) Visa",
        labelEs: "Visa K-1 de Prometido(a)",
        description: "You are engaged to a U.S. citizen and want to enter the U.S. to get married within 90 days",
        descriptionEs: "Estás comprometido con un ciudadano estadounidense y quieres entrar a EE.UU. para casarte dentro de 90 días",
        category: "K-1 Fiancé(e) Visa",
        displayOrder: 3,
        isActive: true
      },
      {
        value: "citizenship-naturalization-n400",
        label: "Citizenship & Naturalization - Naturalization (N-400)",
        labelEs: "Ciudadanía y Naturalización - Naturalización (N-400)",
        description: "You are applying to become a U.S. citizen",
        descriptionEs: "Estás solicitando convertirte en ciudadano estadounidense",
        category: "Citizenship & Naturalization",
        displayOrder: 4,
        isActive: true
      },
      {
        value: "asylum-affirmative",
        label: "Asylum - Affirmative Asylum",
        labelEs: "Asilo - Asilo Afirmativo",
        description: "You are not in immigration court and want to apply for asylum with USCIS",
        descriptionEs: "No estás en corte de inmigración y quieres aplicar por asilo con USCIS",
        category: "Asylum",
        displayOrder: 5,
        isActive: true
      },
      {
        value: "deportation-defense-removal-proceedings",
        label: "Deportation Defense / Removal Proceedings",
        labelEs: "Defensa de Deportación / Procedimientos de Remoción",
        description: "You are in immigration court or received a Notice to Appear (NTA)",
        descriptionEs: "Estás en corte de inmigración o recibiste una Notificación para Comparecer (NTA)",
        category: "Deportation Defense",
        displayOrder: 6,
        isActive: true
      },
      {
        value: "other",
        label: "Other",
        labelEs: "Otro",
        description: "You're not sure or need help with a different immigration matter",
        descriptionEs: "No estás seguro o necesitas ayuda con un asunto de inmigración diferente",
        category: "Other",
        displayOrder: 7,
        isActive: true
      }
    ];

    for (const caseTypeData of caseTypesData) {
      try {
        const existingCaseTypes = await storage.getAllCaseTypes();
        const existingCaseType = existingCaseTypes.find(ct => ct.value === caseTypeData.value);
        
        if (!existingCaseType) {
          await storage.createCaseType(caseTypeData);
          console.log(`Created case type: ${caseTypeData.label}`);
        } else {
          console.log(`Case type already exists: ${caseTypeData.label}`);
        }
      } catch (error) {
        console.error(`Error seeding case type ${caseTypeData.label}:`, error);
      }
    }
    
    console.log("Case types seeding complete!");
  } catch (error) {
    console.error("Error in seedCaseTypes:", error);
    throw error;
  }
}
```

### 5. Client-Side Usage
Example of how to use the dropdown in React forms:

```typescript
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// In your component
const CaseTypeDropdown = ({ value, onChange, language = 'en' }) => {
  const { data: caseTypes, isLoading } = useQuery({
    queryKey: ['/api/case-types', language],
    queryFn: () => fetch(`/api/case-types?lang=${language}`).then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a case type..." />
      </SelectTrigger>
      <SelectContent>
        {caseTypes?.data?.map((caseType) => (
          <SelectItem key={caseType.id} value={caseType.value}>
            {caseType.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### 6. Database Migration
Run the database migration:

```bash
npm run db:push
```

### 7. Initialize Data
Call the seeding function in your server startup:

```typescript
import { seedCaseTypes } from "./seed-case-types";

// In your server startup
await seedCaseTypes();
```

## Features Included

✅ **Database Storage**: PostgreSQL table with proper schema
✅ **Bilingual Support**: English and Spanish labels/descriptions
✅ **API Endpoints**: Public and admin endpoints
✅ **Data Seeding**: Comprehensive immigration case types
✅ **Admin Management**: CRUD operations for case types
✅ **Client Integration**: React Query hooks for frontend
✅ **Type Safety**: Full TypeScript support
✅ **Ordering**: Display order support
✅ **Active/Inactive**: Status management

## Usage Notes

1. **Language Detection**: The API automatically returns the correct language based on the `lang` query parameter
2. **Admin Access**: Admin endpoints require authentication and admin role
3. **Data Validation**: All inputs are validated using Zod schemas
4. **Error Handling**: Comprehensive error handling for all operations
5. **Caching**: Client-side caching with React Query for performance

This implementation provides a complete, production-ready case type dropdown system with full bilingual support and admin management capabilities.