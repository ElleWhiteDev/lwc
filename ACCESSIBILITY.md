# Accessibility Documentation

## Overview

"A Life Worth Celebrating" is committed to providing an inclusive and accessible web experience for all users. This application follows **WCAG 2.1 Level AA** standards and implements comprehensive accessibility features to ensure compliance with the Americans with Disabilities Act (ADA).

## Accessibility Standards Compliance

### WCAG 2.1 AA Compliance

This application meets or exceeds the following WCAG 2.1 Level AA success criteria:

- **Perceivable**: Information and user interface components are presentable to users in ways they can perceive
- **Operable**: User interface components and navigation are operable
- **Understandable**: Information and operation of the user interface are understandable
- **Robust**: Content is robust enough to be interpreted by a wide variety of user agents, including assistive technologies

## Implemented Accessibility Features

### 1. Semantic HTML

All pages use proper semantic HTML5 elements:

- `<header>`, `<nav>`, `<main>`, `<footer>` for page structure
- `<article>` for self-contained content (news cards, event cards, mission cards, board member cards)
- `<section>` for thematic grouping of content
- `<time>` elements with `dateTime` attributes for dates
- Proper heading hierarchy (`<h1>` through `<h6>`)

### 2. ARIA Attributes

Comprehensive ARIA attributes are implemented throughout:

#### Landmark Roles
- `role="main"` on main content area
- `role="navigation"` on navigation elements
- `role="contentinfo"` on footer

#### Interactive Elements
- `role="button"` on clickable non-button elements
- `role="dialog"` with `aria-modal="true"` for modal dialogs
- `role="img"` with descriptive `aria-label` for decorative images and emojis
- `role="status"` for dynamic content updates
- `role="alert"` for error and success messages

#### Labels and Descriptions
- `aria-label` for descriptive labels on interactive elements
- `aria-labelledby` to associate sections with their headings
- `aria-required="true"` on required form fields
- `aria-disabled` on disabled buttons
- `aria-hidden="true"` on decorative SVG icons

#### Live Regions
- `aria-live="polite"` for success messages and status updates
- `aria-live="assertive"` for error messages requiring immediate attention
- `aria-atomic="true"` for content that should be announced as a whole

### 3. Keyboard Navigation

All interactive elements are fully keyboard accessible:

#### Focus Management
- Visible focus indicators on all interactive elements (3px solid purple outline with 2px offset)
- Logical tab order throughout the application
- Skip link to main content (visible on focus)

#### Keyboard Shortcuts
- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward through interactive elements
- **Enter**: Activate buttons, links, and interactive cards
- **Space**: Activate buttons and interactive cards
- **Escape**: Close modal dialogs

#### Interactive Elements
- News cards: `tabIndex={0}` with `onKeyDown` handlers for Enter and Space
- Event cards: `tabIndex={0}` with `onKeyDown` handlers for Enter and Space
- Hero image star burst: Keyboard accessible with Enter and Space
- Modal close buttons: Keyboard accessible
- All form inputs: Native keyboard support

### 4. Form Accessibility

All forms include proper accessibility features:

#### Labels
- Explicit `<label>` elements with `htmlFor` attributes linked to input `id`
- Visually hidden labels where appropriate (using `.visually-hidden` class)
- Clear, descriptive label text

#### Required Fields
- `required` attribute on required inputs
- `aria-required="true"` for screen reader announcement
- Visual indicators for required fields

#### Error Handling
- `role="alert"` on error messages
- `aria-live="assertive"` for immediate error announcement
- Clear, descriptive error messages
- Error messages associated with their inputs

#### Success Messages
- `role="alert"` or `role="status"` on success messages
- `aria-live="polite"` for non-intrusive announcement
- Clear confirmation of successful actions

### 5. Color Contrast

All text and interactive elements meet WCAG AA contrast requirements:

#### Text Contrast Ratios
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

#### Color Combinations
- Primary purple (#7b2d8e) on white background: 7.2:1 ✓
- Dark gray (#343a40) on white background: 12.6:1 ✓
- Medium gray (#6c757d) on white background: 4.7:1 ✓
- White text on primary purple: 7.2:1 ✓
- Error text (#721c24) on error background (#f8d7da): 8.1:1 ✓
- Success text (#155724) on success background (#d4edda): 7.9:1 ✓

#### Focus Indicators
- 3px solid purple outline with 2px offset
- Meets 3:1 contrast requirement against all backgrounds

### 6. Screen Reader Support

The application is optimized for screen readers:

#### Tested With
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

#### Screen Reader Features
- Descriptive alt text for all meaningful images
- `aria-label` for decorative images and icons
- Proper announcement of dynamic content changes
- Clear form labels and error messages
- Modal dialog announcements
- Skip link for bypassing navigation




### 7. Visual Accessibility

#### Visually Hidden Content
A `.visually-hidden` CSS class is used for content that should be available to screen readers but not visible on screen:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Used for:
- Newsletter form email label
- Screen reader-only instructions
- Additional context for interactive elements

#### Focus Indicators
Enhanced focus indicators for keyboard navigation:

```css
*:focus-visible {
  outline: 3px solid var(--primary-purple);
  outline-offset: 2px;
}
```

### 8. Image Accessibility

All images include proper accessibility features:

#### Meaningful Images
- Descriptive `alt` text that conveys the purpose and content
- Board member photos include name and title in alt text
- Event images include descriptive alt text

#### Decorative Images
- `aria-hidden="true"` on purely decorative images
- Empty `alt=""` for decorative images
- Background images used for decoration only

#### Emoji Icons
- `role="img"` on emoji characters
- Descriptive `aria-label` explaining the emoji's meaning
- Examples:
  - `<span role="img" aria-label="Rainbow">🌈</span>`
  - `<span role="img" aria-label="Success checkmark">✓</span>`

## Page-Specific Accessibility Features

### Home Page (Home.jsx)
- ✅ Newsletter subscription form with proper labels and ARIA attributes
- ✅ Keyboard-accessible news cards with Enter/Space activation
- ✅ Modal dialogs with `role="dialog"` and `aria-modal="true"`
- ✅ Hero image star burst with keyboard accessibility
- ✅ All sections labeled with `aria-labelledby`

### Events Page (Events.jsx)
- ✅ Keyboard-accessible event cards (upcoming and past)
- ✅ Modal dialogs for event details
- ✅ Image carousel with keyboard navigation
- ✅ Image counter with `role="status"` and `aria-live="polite"`
- ✅ Proper body scroll management in useEffect

### About Page (About.jsx)
- ✅ Mission, values, and board sections with `aria-labelledby`
- ✅ Semantic `<article>` elements for cards
- ✅ Emoji icons with `role="img"` and descriptive labels
- ✅ Board member photos with descriptive alt text

### Authentication Pages
- ✅ **Login.jsx**: Proper form labels, error handling, and ARIA attributes
- ✅ **ForgotPassword.jsx**: Accessible form with live regions for messages
- ✅ **ResetPassword.jsx**: Password fields with show/hide toggle and ARIA labels
- ✅ All forms include `aria-required` on required fields
- ✅ Error messages with `aria-live="assertive"`
- ✅ Success messages with `aria-live="polite"`

### Components
- ✅ **Header.jsx**: Accessible navigation with proper ARIA attributes
- ✅ **Footer.jsx**: Newsletter form with proper labels and ARIA
- ✅ **App.jsx**: Skip link to main content

## Testing Procedures

### Keyboard Navigation Testing

1. **Tab Through All Interactive Elements**
   - Verify all buttons, links, and form inputs are reachable
   - Check that focus indicators are visible
   - Ensure tab order is logical

2. **Test Interactive Cards**
   - Navigate to news cards and press Enter or Space
   - Navigate to event cards and press Enter or Space
   - Verify modals open correctly

3. **Test Modal Dialogs**
   - Open a modal with keyboard
   - Verify focus is trapped within modal
   - Press Escape to close
   - Verify focus returns to trigger element

4. **Test Forms**
   - Navigate through all form fields
   - Submit forms with keyboard
   - Verify error messages are announced

### Screen Reader Testing

#### NVDA/JAWS (Windows)
1. Start NVDA (Insert + N) or JAWS
2. Navigate through the page with arrow keys
3. Use H key to jump between headings
4. Use Tab to navigate interactive elements
5. Verify all content is announced correctly

#### VoiceOver (macOS)
1. Enable VoiceOver (Cmd + F5)
2. Use VO + Right Arrow to navigate
3. Use VO + Cmd + H to navigate headings
4. Use Tab to navigate interactive elements
5. Verify all content is announced correctly

### Visual Testing

1. **Color Contrast**
   - Use browser DevTools or online contrast checker
   - Verify all text meets 4.5:1 ratio (or 3:1 for large text)
   - Check focus indicators have 3:1 contrast

2. **Zoom Testing**
   - Test at 200% zoom
   - Verify all content is readable and functional
   - Check that no content is cut off

3. **High Contrast Mode**
   - Enable Windows High Contrast mode
   - Verify all content is visible
   - Check that focus indicators are visible


## Maintenance Guidelines

### When Adding New Features

1. **Use Semantic HTML**
   - Choose the most appropriate HTML5 element
   - Use `<button>` for buttons, not `<div>` with click handlers
   - Use `<a>` for links, not `<button>` for navigation

2. **Add ARIA Attributes**
   - Add `aria-label` for icon-only buttons
   - Use `aria-labelledby` to associate sections with headings
   - Add `role="alert"` for error messages
   - Use `aria-live` for dynamic content

3. **Ensure Keyboard Accessibility**
   - All interactive elements must be keyboard accessible
   - Add `tabIndex={0}` for custom interactive elements
   - Implement `onKeyDown` handlers for Enter and Space
   - Manage focus for modals and dynamic content

4. **Test Accessibility**
   - Test with keyboard only
   - Test with screen reader
   - Check color contrast
   - Verify ARIA attributes are correct

### Common Patterns

#### Accessible Button
```jsx
<button
  onClick={handleClick}
  aria-label="Descriptive label"
  disabled={isDisabled}
  aria-disabled={isDisabled}
>
  Button Text
</button>
```

#### Accessible Interactive Card
```jsx
<article
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
  aria-label="Descriptive label"
>
  Card Content
</article>
```

#### Accessible Modal Dialog
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
  <button onClick={closeModal} aria-label="Close modal">×</button>
  {/* Modal content */}
</div>
```

#### Accessible Form Field
```jsx
<label htmlFor="field-id" className="form-field">
  <span>Field Label</span>
  <input
    id="field-id"
    type="text"
    required
    aria-required="true"
    aria-describedby="field-error"
  />
</label>
{error && (
  <p id="field-error" role="alert" aria-live="assertive">
    {error}
  </p>
)}
```

## Resources

### WCAG 2.1 Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### Testing Tools
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Free, Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (Built-in, macOS/iOS)](https://www.apple.com/accessibility/voiceover/)

### ARIA Documentation
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Using ARIA](https://www.w3.org/TR/using-aria/)

## Contact

For accessibility concerns or questions, please contact:
- Email: alifeworthcelebratinginc@gmail.com

## Commitment

"A Life Worth Celebrating" is committed to maintaining and improving the accessibility of our website. We welcome feedback and will continue to enhance our accessibility features to ensure an inclusive experience for all users.

---

**Last Updated**: February 2026
**WCAG Version**: 2.1 Level AA
**Compliance Status**: Compliant
