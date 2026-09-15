
export const adminRoutes = {
    root: () => "/admin",
    arabicEntities: () => "/admin/arabic-entities",
    arabicEntity: (id: string) => `/admin/arabic-entities/${id}`,
    words: () => "/admin/words",
    word: (id: string) => `/admin/words/${id}`,
    sentences: () => "/admin/sentences",
    sentence: (id: string) => `/admin/sentences/${id}`,
} as const;