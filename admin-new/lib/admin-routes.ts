
export const adminRoutes = {
    root: () => "/admin",
    arabicEntities: () => "/admin/arabic-entities",
    arabicEntity: (id: string) => `/admin/arabic-entities/${id}`,
    words: () => "/admin/words",
    word: (id: string) => `/admin/words/${id}`,
    sentences: () => "/admin/sentences",
    sentence: (id: string) => `/admin/sentences/${id}`,
    sections: () => "/admin/sections",
    section: (id: string) => `/admin/sections/${id}`,
    courses: () => "/admin/courses",
    course: (id: string) => `/admin/courses/${id}`,
    lessons: () => "/admin/lessons",
    lesson: (id: string) => `/admin/lessons/${id}`,
} as const;