import { storage } from "./storage";
import type { InsertCaseType } from "@shared/schema";

export async function seedCaseTypes() {
  // Debug: console.log("Seeding case types...");
  
  try {
    const caseTypesData: InsertCaseType[] = [
      {
        value: "family-based-immigrant-visa-immediate-relative",
        label: "Family-Based Immigrant Visa - Immediate Relative",
        labelEs: "Visa de Inmigrante Basada en Familia - Pariente Inmediato",
        description: "You are a spouse, parent, or unmarried child under 21 of a U.S. citizen",
        descriptionEs: "Eres cónyuge, padre o hijo soltero menor de 21 años de un ciudadano estadounidense",
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
        value: "family-based-immigrant-visa-waivers",
        label: "Family-Based Immigrant Visa - Waivers related to Family-Based Immigration",
        labelEs: "Visa de Inmigrante Basada en Familia - Exenciones relacionadas con Inmigración Basada en Familia",
        description: "For those who entered without inspection or have inadmissibility issues",
        descriptionEs: "Para aquellos que entraron sin inspección o tienen problemas de inadmisibilidad",
        category: "Family-Based Immigrant Visa",
        displayOrder: 3,
        isActive: true
      },
      {
        value: "k1-fiance-visa",
        label: "K-1 Fiancé(e) Visa",
        labelEs: "Visa K-1 de Prometido(a)",
        description: "You are engaged to a U.S. citizen and want to enter the U.S. to get married within 90 days",
        descriptionEs: "Estás comprometido con un ciudadano estadounidense y quieres entrar a EE.UU. para casarte dentro de 90 días",
        category: "K-1 Fiancé(e) Visa",
        displayOrder: 4,
        isActive: true
      },
      {
        value: "citizenship-naturalization-n400",
        label: "Citizenship & Naturalization - Naturalization (N-400)",
        labelEs: "Ciudadanía y Naturalización - Naturalización (N-400)",
        description: "You are applying to become a U.S. citizen",
        descriptionEs: "Estás solicitando convertirte en ciudadano estadounidense",
        category: "Citizenship & Naturalization",
        displayOrder: 5,
        isActive: true
      },
      {
        value: "citizenship-naturalization-through-parents-n600",
        label: "Citizenship & Naturalization - Citizenship Through Parents (N-600)",
        labelEs: "Ciudadanía y Naturalización - Ciudadanía a Través de Padres (N-600)",
        description: "You are claiming U.S. citizenship automatically through your parent(s)",
        descriptionEs: "Estás reclamando ciudadanía estadounidense automáticamente a través de tu(s) padre(s)",
        category: "Citizenship & Naturalization",
        displayOrder: 6,
        isActive: true
      },
      {
        value: "asylum-affirmative",
        label: "Asylum - Affirmative Asylum",
        labelEs: "Asilo - Asilo Afirmativo",
        description: "You are not in immigration court and want to apply for asylum with USCIS",
        descriptionEs: "No estás en corte de inmigración y quieres aplicar por asilo con USCIS",
        category: "Asylum",
        displayOrder: 7,
        isActive: true
      },
      {
        value: "asylum-defensive",
        label: "Asylum - Defensive Asylum",
        labelEs: "Asilo - Asilo Defensivo",
        description: "You are in immigration court and are requesting asylum as a defense against deportation",
        descriptionEs: "Estás en corte de inmigración y solicitas asilo como defensa contra la deportación",
        category: "Asylum",
        displayOrder: 8,
        isActive: true
      },
      {
        value: "deportation-defense-removal-proceedings",
        label: "Deportation Defense / Removal Proceedings",
        labelEs: "Defensa de Deportación / Procedimientos de Remoción",
        description: "You are in immigration court or received a Notice to Appear (NTA)",
        descriptionEs: "Estás en corte de inmigración o recibiste una Notificación para Comparecer (NTA)",
        category: "Deportation Defense / Removal Proceedings",
        displayOrder: 9,
        isActive: true
      },
      {
        value: "violence-against-women-act-vawa",
        label: "Violence Against Women Act (VAWA)",
        labelEs: "Ley de Violencia Contra las Mujeres (VAWA)",
        description: "You are applying independently due to abuse by a U.S. citizen or green card holder spouse, parent, or child",
        descriptionEs: "Estás aplicando independientemente debido a abuso por parte de un cónyuge, padre o hijo ciudadano estadounidense o portador de tarjeta verde",
        category: "Violence Against Women Act (VAWA)",
        displayOrder: 10,
        isActive: true
      },
      {
        value: "other",
        label: "Other",
        labelEs: "Otro",
        description: "You're not sure or need help with a different immigration matter",
        descriptionEs: "No estás seguro o necesitas ayuda con un asunto de inmigración diferente",
        category: "Other",
        displayOrder: 11,
        isActive: true
      }
    ];

    for (const caseTypeData of caseTypesData) {
      try {
        const existingCaseTypes = await storage.getAllCaseTypes();
        const existingCaseType = existingCaseTypes.find(ct => ct.value === caseTypeData.value);
        
        if (!existingCaseType) {
          await storage.createCaseType(caseTypeData);
          // Debug: console.log(`Created case type: ${caseTypeData.label}`);
        } else {
          // Debug: console.log(`Case type already exists: ${caseTypeData.label}`);
        }
      } catch (error) {
        console.error(`Error seeding case type ${caseTypeData.label}:`, error);
      }
    }
    
    // Debug: console.log("Case types seeding complete!");
  } catch (error) {
    console.error("Error in seedCaseTypes:", error);
    throw error;
  }
}