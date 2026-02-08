# Plan 28: AI-Powered Platform Features

## Overview

Leverage AI to enhance user experience, improve project matching, automate moderation, and provide intelligent insights. AI assists but never replaces human decision-making for financial matters.

**Note:** All AI features are assistive. Final decisions on funding, approval, and community matters remain with humans.

---

## Phase 1: Smart Project Matching

### 1A. User Interest Profiling

**Goal:** Learn user preferences from behavior.

**Schema Addition:**

```prisma
model UserInterestProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  interests       Json     // { "categories": {...}, "communities": {...} }
  behaviorSignals Json     // { "funded_categories": [...], "viewed_projects": [...] }
  lastUpdated     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ProjectSimilarity {
  id          String   @id @default(cuid())
  projectAId  String
  projectBId  String
  similarity  Float    // 0-1 score
  factors     Json     // { "category": 0.3, "community": 0.4, "description": 0.3 }
  computedAt  DateTime @default(now())

  @@unique([projectAId, projectBId])
  @@index([projectAId])
  @@index([projectBId])
}
```

**Files:**
- `src/lib/ai/interest-profiler.ts` - Build user profiles
- `src/lib/ai/similarity.ts` - Compute project similarities
- `src/app/api/ai/interests/route.ts`

### 1B. Personalized Recommendations

**Goal:** Show relevant projects to each user.

**Files:**
- `src/lib/ai/recommendations.ts` - Recommendation engine
- `src/app/api/ai/recommendations/route.ts`
- `src/components/ai/recommended-projects.tsx`
- `src/components/ai/why-recommended.tsx` - Explain recommendations

**Integration Points:**
- Homepage "For You" section
- Project discovery page
- Email digests

---

## Phase 2: Content Assistance

### 2A. Project Description Helper

**Goal:** Help project creators write compelling descriptions.

**Files:**
- `src/lib/ai/content-assistant.ts` - AI writing assistance
- `src/app/api/ai/assist/description/route.ts`
- `src/components/ai/description-helper.tsx`
- `src/components/ai/suggestion-panel.tsx`

**Features:**
- Improve clarity and grammar
- Suggest impact metrics to include
- Recommend compelling titles
- Check for completeness

### 2B. Grant Application Assistant

**Goal:** Help with grant applications.

**Files:**
- `src/lib/ai/grant-assistant.ts`
- `src/app/api/ai/assist/grant/route.ts`
- `src/components/ai/grant-helper.tsx`
- Integration with Plan 26 grant system

**Features:**
- Suggest budget line items
- Improve impact statements
- Check eligibility requirements
- Estimate competitiveness

### 2C. Story Enhancement

**Goal:** Help users tell better impact stories.

**Files:**
- `src/lib/ai/story-assistant.ts`
- `src/app/api/ai/assist/story/route.ts`
- `src/components/ai/story-helper.tsx`
- Integration with Plan 24 storytelling

---

## Phase 3: Intelligent Moderation

### 3A. Content Screening

**Goal:** Flag potentially problematic content.

**Schema Addition:**

```prisma
model ContentFlag {
  id           String   @id @default(cuid())
  contentType  String   // project, comment, story, loan
  contentId    String
  flagType     String   // spam, inappropriate, fraud_risk, off_topic
  confidence   Float    // 0-1 AI confidence
  reason       String?
  status       String   @default("pending") // pending, reviewed, dismissed
  reviewedBy   String?
  reviewedAt   DateTime?
  createdAt    DateTime @default(now())

  @@index([contentType, contentId])
  @@index([status, flagType])
}
```

**Files:**
- `src/lib/ai/moderation.ts` - Content screening
- `src/lib/ai/fraud-detection.ts` - Fraud pattern detection
- `src/app/api/ai/moderate/route.ts`
- `src/app/admin/moderation/page.tsx` - Review flagged content
- `src/components/admin/flagged-content-queue.tsx`

### 3B. Duplicate Detection

**Goal:** Identify duplicate or near-duplicate projects.

**Files:**
- `src/lib/ai/duplicate-detector.ts`
- `src/app/api/ai/duplicates/route.ts`
- `src/components/admin/duplicate-review.tsx`
- Alert on similar project submission

### 3C. Anomaly Detection

**Goal:** Detect unusual patterns.

**Files:**
- `src/lib/ai/anomaly-detector.ts`
- `src/app/api/ai/anomalies/route.ts`
- `src/components/admin/anomaly-dashboard.tsx`

**Patterns Detected:**
- Unusual funding velocity
- Coordinated funding behavior
- Suspicious account creation patterns
- Loan default risk indicators

---

## Phase 4: Intelligent Search

### 4A. Semantic Search

**Goal:** Natural language project search.

**Schema Addition:**

```prisma
model SearchEmbedding {
  id         String   @id @default(cuid())
  entityType String   // project, community, story
  entityId   String
  embedding  Bytes    // Vector embedding
  text       String   // Original text
  updatedAt  DateTime @default(now())

  @@unique([entityType, entityId])
}
```

**Files:**
- `src/lib/ai/embeddings.ts` - Generate embeddings
- `src/lib/ai/semantic-search.ts` - Vector similarity search
- `src/app/api/ai/search/route.ts`
- `src/components/ai/smart-search.tsx`

### 4B. Question Answering

**Goal:** Answer user questions about the platform.

**Files:**
- `src/lib/ai/qa.ts` - Question answering
- `src/app/api/ai/ask/route.ts`
- `src/components/ai/help-assistant.tsx`
- `src/components/ai/contextual-help.tsx`

---

## Phase 5: Predictive Analytics

### 5A. Project Success Prediction

**Goal:** Predict project funding success.

**Schema Addition:**

```prisma
model ProjectPrediction {
  id              String   @id @default(cuid())
  projectId       String   @unique
  successProb     Float    // 0-1 probability of full funding
  predictedDays   Int?     // Estimated days to full funding
  riskFactors     Json     // Factors reducing success
  strengthFactors Json     // Factors increasing success
  computedAt      DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/ai/prediction.ts` - Success prediction
- `src/app/api/ai/predict/route.ts`
- `src/components/ai/success-indicator.tsx` - For project creators
- `src/components/admin/prediction-insights.tsx`

### 5B. Churn Prediction

**Goal:** Identify users at risk of leaving.

**Files:**
- `src/lib/ai/churn-prediction.ts`
- `src/app/api/ai/churn/route.ts`
- `src/app/admin/engagement/at-risk/page.tsx`
- Trigger re-engagement campaigns

### 5C. Trend Analysis

**Goal:** Identify emerging patterns and trends.

**Files:**
- `src/lib/ai/trends.ts`
- `src/app/api/ai/trends/route.ts`
- `src/components/admin/trend-dashboard.tsx`
- `src/components/ai/trending-now.tsx`

---

## Phase 6: Automated Insights

### 6A. Impact Reports

**Goal:** Auto-generate impact summaries.

**Files:**
- `src/lib/ai/impact-reporter.ts` - Generate summaries
- `src/app/api/ai/reports/impact/route.ts`
- `src/components/ai/generated-report.tsx`
- Email templates with AI summaries

### 6B. Community Insights

**Goal:** Automated community health analysis.

**Files:**
- `src/lib/ai/community-insights.ts`
- `src/app/api/ai/insights/community/[id]/route.ts`
- `src/components/ai/community-health-report.tsx`
- Quarterly automated reports

### 6C. Personalized Digests

**Goal:** AI-curated email digests.

**Files:**
- `src/lib/ai/digest-curator.ts`
- `src/app/api/ai/digest/route.ts`
- Personalized email content selection

---

## Phase 7: Admin AI Tools

### 7A. Natural Language Queries

**Goal:** Query data using natural language.

**Files:**
- `src/lib/ai/nl-query.ts` - Natural language to SQL
- `src/app/api/ai/query/route.ts`
- `src/app/admin/ai/query/page.tsx`
- `src/components/admin/ai-query-interface.tsx`

### 7B. Automated Categorization

**Goal:** Auto-categorize projects and content.

**Files:**
- `src/lib/ai/categorizer.ts`
- `src/app/api/ai/categorize/route.ts`
- `src/components/admin/category-suggestions.tsx`

### 7C. Response Drafting

**Goal:** Draft responses to user inquiries.

**Files:**
- `src/lib/ai/response-drafter.ts`
- `src/app/api/ai/draft/route.ts`
- `src/components/admin/response-assistant.tsx`

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Smart Project Matching | Large | High |
| 2 | Content Assistance | Medium | Medium |
| 3 | Intelligent Moderation | Large | High |
| 4 | Intelligent Search | Large | Medium |
| 5 | Predictive Analytics | Large | Low |
| 6 | Automated Insights | Medium | Medium |
| 7 | Admin AI Tools | Medium | Low |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add UserInterestProfile, ProjectSimilarity, ContentFlag, SearchEmbedding, ProjectPrediction

### New Libraries
- `src/lib/ai/interest-profiler.ts`
- `src/lib/ai/similarity.ts`
- `src/lib/ai/recommendations.ts`
- `src/lib/ai/content-assistant.ts`
- `src/lib/ai/moderation.ts`
- `src/lib/ai/fraud-detection.ts`
- `src/lib/ai/duplicate-detector.ts`
- `src/lib/ai/anomaly-detector.ts`
- `src/lib/ai/embeddings.ts`
- `src/lib/ai/semantic-search.ts`
- `src/lib/ai/qa.ts`
- `src/lib/ai/prediction.ts`
- `src/lib/ai/churn-prediction.ts`
- `src/lib/ai/trends.ts`
- `src/lib/ai/impact-reporter.ts`
- `src/lib/ai/community-insights.ts`
- `src/lib/ai/digest-curator.ts`
- `src/lib/ai/nl-query.ts`
- `src/lib/ai/categorizer.ts`
- `src/lib/ai/response-drafter.ts`

### Pages
- `src/app/admin/moderation/page.tsx`
- `src/app/admin/engagement/at-risk/page.tsx`
- `src/app/admin/ai/query/page.tsx`

---

## AI Provider Strategy

| Feature | Provider Options |
|---------|-----------------|
| Text Generation | OpenAI GPT-4, Claude, local LLM |
| Embeddings | OpenAI, Cohere, local model |
| Moderation | OpenAI Moderation API, custom |
| Image Analysis | OpenAI Vision, Google Vision |

**Recommendation:** Start with OpenAI APIs, abstract behind interface for future flexibility.

---

## Privacy & Ethics

- User data never sent to AI without anonymization
- AI recommendations are suggestions, not mandates
- Transparent about when AI is being used
- Opt-out available for personalization
- No AI decision-making on funding approval
- Regular bias auditing of recommendations
- Clear labeling of AI-generated content

---

## Cost Management

- Cache embeddings and predictions
- Batch API calls where possible
- Use smaller models for simple tasks
- Rate limit AI feature usage
- Monitor API costs in admin dashboard

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Test AI feature accuracy
4. Verify privacy compliance
5. Monitor API costs
6. Check response times
7. Test error handling for API failures

