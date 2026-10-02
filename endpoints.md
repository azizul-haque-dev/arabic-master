### Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/logout`
* `POST /auth/refresh`
* `GET /auth/me`
* `GET /auth/google`
* `GET /auth/google/callback`
* `POST /auth/verify-email`
* `POST /auth/resend-verification`
* `POST /auth/forgot-password`
* `POST /auth/reset-password`
* `POST /auth/change-password`

### Onboarding / Profile

* `GET /profile`
* `PATCH /profile`
* `POST /onboarding/complete`

### Guest

* `POST /guests`
* `GET /guests/:deviceId`
* `POST /guests/:deviceId/migrate`

### User Progress

* `GET /progress`
* `POST /progress/claim-daily-heart`
* `POST /progress/activity`

### Words

* `GET /words`
* `GET /words/:wordKey`
* `POST /words/:wordKey/complete`

### Sentences

* `GET /sentences`
* `GET /sentences/:sentenceKey`
* `POST /sentences/:sentenceKey/complete`

### Conversations

* `GET /conversations`
* `GET /conversations/:conversationKey`
* `POST /conversations/:conversationKey/complete`

### Courses

* `GET /courses`
* `GET /courses/:courseKey`
* `GET /courses/:courseKey/sections`
* `GET /sections/:sectionKey`
* `GET /sections/:sectionKey/lessons`
* `GET /lessons/:lessonKey`
* `GET /lessons/:lessonKey/items`
* `POST /lessons/:lessonKey/start`
* `POST /lessons/:lessonKey/complete`

### Lesson Progress

* `GET /lesson-progress`
* `GET /lessons/:lessonKey/progress`

### Quick Practice / Content Completion

* `GET /content-completions`
* `POST /content-completions`

### Subscription

* `GET /subscription`
* `POST /subscription/checkout`
* `GET /subscription/status`

### Payments

* `POST /payments/initiate`
* `POST /payments/ipn`
* `POST /payments/success`
* `POST /payments/fail`
* `POST /payments/cancel`
* `GET /payments/:transactionId`

### Sessions / Devices

* `GET /sessions`
* `DELETE /sessions/:sessionId`
* `POST /sessions/:sessionId/revoke`

### Admin — Users

* `GET /admin/users`
* `GET /admin/users/:userId`
* `PATCH /admin/users/:userId/status`
* `PATCH /admin/users/:userId/role`
* `GET /admin/users/:userId/sessions`
* `DELETE /admin/users/:userId/sessions/:sessionId`

### Admin — Words

* `GET /admin/words`
* `GET /admin/words/:wordKey`
* `POST /admin/words`
* `PATCH /admin/words/:wordKey`
* `DELETE /admin/words/:wordKey`
* `PATCH /admin/words/:wordKey/status`

### Admin — Sentences

* `GET /admin/sentences`
* `GET /admin/sentences/:sentenceKey`
* `POST /admin/sentences`
* `PATCH /admin/sentences/:sentenceKey`
* `DELETE /admin/sentences/:sentenceKey`
* `PATCH /admin/sentences/:sentenceKey/status`

### Admin — Conversations

* `GET /admin/conversations`
* `GET /admin/conversations/:conversationKey`
* `POST /admin/conversations`
* `PATCH /admin/conversations/:conversationKey`
* `DELETE /admin/conversations/:conversationKey`
* `PATCH /admin/conversations/:conversationKey/status`

### Admin — Courses

* `GET /admin/courses`
* `GET /admin/courses/:courseKey`
* `POST /admin/courses`
* `PATCH /admin/courses/:courseKey`
* `DELETE /admin/courses/:courseKey`
* `PATCH /admin/courses/:courseKey/status`

### Admin — Sections

* `GET /admin/sections/:sectionKey`
* `POST /admin/courses/:courseKey/sections`
* `PATCH /admin/sections/:sectionKey`
* `DELETE /admin/sections/:sectionKey`
* `PATCH /admin/sections/:sectionKey/status`
* `PATCH /admin/courses/:courseKey/sections/reorder`

### Admin — Lessons

* `GET /admin/lessons/:lessonKey`
* `POST /admin/sections/:sectionKey/lessons`
* `PATCH /admin/lessons/:lessonKey`
* `DELETE /admin/lessons/:lessonKey`
* `PATCH /admin/lessons/:lessonKey/status`
* `PATCH /admin/sections/:sectionKey/lessons/reorder`

### Admin — Lesson Content Items

* `GET /admin/lessons/:lessonKey/items`
* `POST /admin/lessons/:lessonKey/items`
* `PATCH /admin/lesson-items/:itemId`
* `DELETE /admin/lesson-items/:itemId`
* `PATCH /admin/lessons/:lessonKey/items/reorder`

### Admin — Arabic Entity

* `GET /admin/entities`
* `GET /admin/entities/:entityKey`
* `POST /admin/entities`
* `PATCH /admin/entities/:entityKey`
* `PATCH /admin/entities/:entityKey/status`

### Admin — Payments / Subscriptions

* `GET /admin/transactions`
* `GET /admin/transactions/:transactionId`
* `GET /admin/subscriptions`
* `GET /admin/subscriptions/:subscriptionId`

### Admin — Dashboard

* `GET /admin/dashboard`
* `GET /admin/dashboard/users`
* `GET /admin/dashboard/content`
* `GET /admin/dashboard/revenue`
