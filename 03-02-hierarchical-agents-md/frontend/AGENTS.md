# Frontend Rules (frontend/)

## Accessibility & Testing Hooks
- Include `data-testid` on the root element and every
  key rendered value element.
- Use semantic HTML (`<section>`, `<dl>`, `<dt>`, `<dd>`)
  with an explicit `aria-label` on the root container.

## Styling Constraints
- Zero inline `style="..."` attributes or `<style>` blocks.
- Prefix all CSS class names with `sp-` (e.g., `sp-card`).
- Escape untrusted text before HTML interpolation.
