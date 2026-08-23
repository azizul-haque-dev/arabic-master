const CACHE_PREFIX = "arabic-master:cache:v1";

export const cacheNamespaces = {
  categories: `${CACHE_PREFIX}:categories`,
  words: `${CACHE_PREFIX}:words`,
  sentences: `${CACHE_PREFIX}:sentences`,
  topics: `${CACHE_PREFIX}:topics`,
  topicConversations: `${CACHE_PREFIX}:topic-conversations`,
  conversations: `${CACHE_PREFIX}:conversations`,
  conversationLines: `${CACHE_PREFIX}:conversation-lines`,
  arabicTexts: `${CACHE_PREFIX}:arabic-texts`,
} as const;
