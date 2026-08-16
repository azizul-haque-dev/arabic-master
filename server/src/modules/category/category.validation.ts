import { VALIDATION } from "@/shared/constants.js";
import { z } from "zod";

/*
Allowed Categories (MUST use ONLY one of these):

1. Greetings & Introductions
2. Pronouns
3. Numbers
4. Days, Time & Date
5. Questions & Question Words
6. Verbs
7. Prepositions
8. Connectors & Sentence Linking
9. Conversation Fillers
10. Common Daily Expressions
11. Emergency & Survival Phrases
12. Family & Relationships
13. Body Parts
14. Health & Sickness
15. Food & Drink
16. Shopping & Money
17. Clothing & Appearance
18. House & Home
19. Colors
20. Weather
21. Transportation
22. Directions & Navigation
23. Places & Locations
24. Work & Professions
25. Education
26. Technology & Modern Life
27. Social & Cultural Etiquette
28. Hospitality Phrases
29. Islamic Daily Phrases
30. Religious Occasions & Celebrations
31. Opinions & Uncertainty
32. Agreement, Disagreement & Perspectives
33. Comparisons
34. Quantity & Counting
35. Storytelling & Conversation Flow
36. High-Frequency Mixed Vocabulary & Sentences
*/

export const createCategorySchema = z.object({
  nameEn: z.string().trim().toLowerCase().min(VALIDATION.CATEGORY_NAME.MIN_LENGTH).max(VALIDATION.CATEGORY_NAME.MAX_LENGTH),
  nameBn: z.string().trim().toLowerCase().min(VALIDATION.CATEGORY_NAME.MIN_LENGTH).max(VALIDATION.CATEGORY_NAME.MAX_LENGTH),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdParamSchema = z.object({
  id: z.string().min(1),
});
