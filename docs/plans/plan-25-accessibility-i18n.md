# Plan 25: Accessibility & Internationalization

## Overview

Make Deluge accessible to all users regardless of ability, language, or device. WCAG 2.1 AA compliance, multi-language support, and inclusive design ensure the platform serves every community member.

---

## Phase 1: Accessibility Audit & Foundation

### 1A. Accessibility Audit

**Goal:** Identify and document current accessibility gaps.

**Audit Areas:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- Form accessibility
- ARIA labels
- Skip links
- Error handling

**Files:**
- `docs/accessibility-audit.md` - Audit findings
- `docs/accessibility-roadmap.md` - Fix priorities
- `src/lib/a11y/audit-checklist.ts` - Programmatic checks

### 1B. A11y Testing Infrastructure

**Goal:** Automated accessibility testing.

**Files:**
- `src/lib/a11y/testing.ts` - Testing utilities
- `tests/a11y/*.test.ts` - Accessibility tests
- Integration with axe-core or similar
- CI pipeline for a11y testing

---

## Phase 2: Core Accessibility Fixes

### 2A. Keyboard Navigation

**Goal:** Full keyboard accessibility.

**Files:**
- `src/components/a11y/focus-trap.tsx` - Modal focus trapping
- `src/components/a11y/skip-links.tsx` - Skip to content (exists, enhance)
- `src/components/a11y/roving-tabindex.tsx` - Complex widget navigation
- `src/lib/a11y/keyboard.ts` - Keyboard utilities
- Update all interactive components for keyboard support

### 2B. Screen Reader Support

**Goal:** Meaningful screen reader experience.

**Files:**
- `src/components/a11y/visually-hidden.tsx` - SR-only content
- `src/components/a11y/live-region.tsx` - Announcements
- `src/components/a11y/aria-description.tsx` - Descriptions
- Update all components with proper ARIA attributes

### 2C. Color & Contrast

**Goal:** WCAG AA contrast compliance.

**Files:**
- `src/lib/a11y/colors.ts` - Contrast checking utilities
- Update `globals.css` with accessible color palette
- `src/components/ui/high-contrast-toggle.tsx`
- `src/contexts/contrast-context.tsx`

---

## Phase 3: Accessible Components

### 3A. Form Accessibility

**Goal:** Fully accessible forms.

**Files:**
- `src/components/a11y/form-field.tsx` - Accessible form wrapper
- `src/components/a11y/error-message.tsx` - Linked error messages
- `src/components/a11y/required-indicator.tsx`
- `src/components/a11y/input-instructions.tsx`
- Update all form components

**Requirements:**
- Labels associated with inputs
- Error messages linked via aria-describedby
- Required fields indicated
- Focus management on errors

### 3B. Modal & Dialog Accessibility

**Goal:** Accessible modal dialogs.

**Files:**
- Update `src/components/ui/modal.tsx`
- `src/components/a11y/dialog.tsx` - Accessible dialog
- `src/components/a11y/alert-dialog.tsx` - Confirmations
- Proper focus trapping and restoration

### 3C. Data Table Accessibility

**Goal:** Accessible data tables.

**Files:**
- `src/components/a11y/data-table.tsx` - Accessible table
- `src/components/a11y/sortable-header.tsx`
- `src/components/a11y/table-caption.tsx`
- Proper table semantics and navigation

---

## Phase 4: Internationalization Foundation

### 4A. i18n Infrastructure

**Goal:** Set up translation system.

**Schema Addition:**

```prisma
model Translation {
  id        String   @id @default(cuid())
  locale    String
  namespace String
  key       String
  value     String
  context   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([locale, namespace, key])
  @@index([locale, namespace])
}

model UserLocale {
  id            String   @id @default(cuid())
  userId        String   @unique
  locale        String   @default("en")
  timezone      String?
  dateFormat    String?
  numberFormat  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/lib/i18n/index.ts` - i18n setup
- `src/lib/i18n/config.ts` - Supported locales
- `src/lib/i18n/server.ts` - Server-side translations
- `src/lib/i18n/client.ts` - Client-side translations
- `src/contexts/locale-context.tsx`
- `src/hooks/use-translation.ts`

### 4B. Message Extraction

**Goal:** Extract translatable strings.

**Files:**
- `src/lib/i18n/extractor.ts` - Extract strings
- `messages/en.json` - English base messages
- `messages/es.json` - Spanish translations
- `scripts/extract-messages.ts` - Extraction script

### 4C. Locale Detection

**Goal:** Detect and set user locale.

**Files:**
- `src/middleware/locale.ts` - Detect locale
- `src/lib/i18n/detection.ts` - Detection logic
- `src/components/i18n/locale-switcher.tsx`

---

## Phase 5: Translation Implementation

### 5A. UI Translations

**Goal:** Translate all UI text.

**Translation Namespaces:**
- `common` - Shared UI elements
- `auth` - Authentication flows
- `projects` - Project-related
- `communities` - Community features
- `loans` - Microloan system
- `account` - User account
- `admin` - Admin interface

**Files:**
- Update all components to use translation hooks
- `src/components/i18n/translated-text.tsx`
- `src/components/i18n/formatted-number.tsx`
- `src/components/i18n/formatted-date.tsx`
- `src/components/i18n/formatted-currency.tsx`

### 5B. Content Translations

**Goal:** Translate user-generated content.

**Schema Addition:**

```prisma
model ContentTranslation {
  id          String   @id @default(cuid())
  entityType  String   // project, community, etc.
  entityId    String
  field       String   // title, description, etc.
  locale      String
  content     String
  isVerified  Boolean  @default(false)
  translatedBy String? // User or "auto"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([entityType, entityId, field, locale])
  @@index([entityType, entityId])
}
```

**Files:**
- `src/lib/i18n/content.ts` - Content translation
- `src/lib/i18n/auto-translate.ts` - ML translation integration
- `src/components/i18n/translated-content.tsx`
- `src/components/i18n/translation-editor.tsx`

### 5C. RTL Support

**Goal:** Support right-to-left languages.

**Files:**
- `src/lib/i18n/rtl.ts` - RTL utilities
- Update `globals.css` with RTL styles
- `src/components/i18n/rtl-provider.tsx`
- Test with Arabic/Hebrew content

---

## Phase 6: Inclusive Design

### 6A. Reading Level

**Goal:** Accessible content readability.

**Files:**
- `src/lib/a11y/readability.ts` - Readability scoring
- `src/components/a11y/simple-language-toggle.tsx`
- Content guidelines documentation

### 6B. Motion & Animation

**Goal:** Respect motion preferences.

**Files:**
- `src/lib/a11y/motion.ts` - Motion utilities
- `src/contexts/reduced-motion-context.tsx`
- Update all animations to respect prefers-reduced-motion
- `src/components/a11y/motion-toggle.tsx`

### 6C. Text Customization

**Goal:** User-controlled text display.

**Schema Addition:**

```prisma
model AccessibilityPreferences {
  id              String   @id @default(cuid())
  userId          String   @unique
  fontSize        String   @default("medium") // small, medium, large, xl
  fontFamily      String   @default("default") // default, dyslexic, mono
  lineSpacing     String   @default("normal") // tight, normal, relaxed
  highContrast    Boolean  @default(false)
  reducedMotion   Boolean  @default(false)
  screenReader    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Files:**
- `src/app/(app)/account/accessibility/page.tsx`
- `src/components/a11y/text-size-control.tsx`
- `src/components/a11y/font-selector.tsx`
- `src/components/a11y/preferences-panel.tsx`
- `src/contexts/a11y-preferences-context.tsx`

---

## Phase 7: Testing & Documentation

### 7A. Accessibility Testing

**Goal:** Comprehensive a11y testing.

**Files:**
- `tests/a11y/keyboard.test.ts`
- `tests/a11y/screen-reader.test.ts`
- `tests/a11y/color-contrast.test.ts`
- `tests/a11y/forms.test.ts`
- `playwright.a11y.config.ts` - E2E a11y tests

### 7B. Accessibility Statement

**Goal:** Public accessibility commitment.

**Files:**
- `src/app/(marketing)/accessibility/page.tsx`
- `src/components/a11y/a11y-statement.tsx`
- `src/components/a11y/report-issue.tsx`

### 7C. Developer Documentation

**Goal:** A11y guidelines for development.

**Files:**
- `docs/accessibility-guide.md`
- `docs/i18n-guide.md`
- Component documentation with a11y notes
- Storybook a11y addon configuration

---

## Implementation Order

| Phase | Features | Effort | Priority |
|-------|----------|--------|----------|
| 1 | Audit & Foundation | Medium | Critical |
| 2 | Core A11y Fixes | Large | Critical |
| 3 | Accessible Components | Large | High |
| 4 | i18n Foundation | Large | High |
| 5 | Translation Implementation | Large | Medium |
| 6 | Inclusive Design | Medium | Medium |
| 7 | Testing & Documentation | Medium | High |

---

## Key Files Summary

### Schema Changes
- `prisma/schema.prisma` - Add Translation, UserLocale, ContentTranslation, AccessibilityPreferences

### New Libraries
- `src/lib/a11y/audit-checklist.ts`
- `src/lib/a11y/testing.ts`
- `src/lib/a11y/keyboard.ts`
- `src/lib/a11y/colors.ts`
- `src/lib/a11y/readability.ts`
- `src/lib/a11y/motion.ts`
- `src/lib/i18n/index.ts`
- `src/lib/i18n/config.ts`
- `src/lib/i18n/server.ts`
- `src/lib/i18n/client.ts`
- `src/lib/i18n/detection.ts`
- `src/lib/i18n/content.ts`
- `src/lib/i18n/auto-translate.ts`
- `src/lib/i18n/rtl.ts`

### Components
- `src/components/a11y/focus-trap.tsx`
- `src/components/a11y/live-region.tsx`
- `src/components/a11y/visually-hidden.tsx`
- `src/components/a11y/form-field.tsx`
- `src/components/a11y/dialog.tsx`
- `src/components/a11y/data-table.tsx`
- `src/components/a11y/preferences-panel.tsx`
- `src/components/i18n/locale-switcher.tsx`
- `src/components/i18n/translated-text.tsx`
- `src/components/i18n/formatted-number.tsx`
- `src/components/i18n/formatted-date.tsx`

### Pages
- `src/app/(app)/account/accessibility/page.tsx`
- `src/app/(marketing)/accessibility/page.tsx`

---

## Supported Locales (Initial)

| Locale | Language | Priority |
|--------|----------|----------|
| `en` | English | Launch |
| `es` | Spanish | Launch |
| `zh` | Chinese (Simplified) | Phase 2 |
| `vi` | Vietnamese | Phase 2 |
| `tl` | Tagalog | Phase 2 |
| `ko` | Korean | Phase 3 |
| `ar` | Arabic (RTL) | Phase 3 |

---

## WCAG 2.1 Checklist

### Level A (Required)
- [ ] Non-text content has alternatives
- [ ] Time-based media has alternatives
- [ ] Content is adaptable
- [ ] Content is distinguishable
- [ ] Keyboard accessible
- [ ] Enough time for users
- [ ] No seizure-inducing content
- [ ] Navigable
- [ ] Readable
- [ ] Predictable
- [ ] Input assistance

### Level AA (Target)
- [ ] Captions for live content
- [ ] Audio description
- [ ] 4.5:1 contrast ratio
- [ ] Text resizable to 200%
- [ ] Images of text avoided
- [ ] Multiple ways to find pages
- [ ] Headings and labels descriptive
- [ ] Focus visible
- [ ] Language of parts identified
- [ ] Consistent navigation
- [ ] Consistent identification
- [ ] Error suggestion
- [ ] Error prevention

---

## Verification

After each phase:
1. `npx prisma db push`
2. `npx tsc --noEmit`
3. Run axe-core accessibility tests
4. Test with screen reader (NVDA/VoiceOver)
5. Test keyboard-only navigation
6. Test with high contrast mode
7. Verify translations render correctly
8. Test RTL layout (when applicable)
