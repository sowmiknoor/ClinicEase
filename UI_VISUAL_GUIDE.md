# UI Visual Guide - ClinicEase

## Quick Reference for All UI Elements

### Color Palette by Role

#### 👤 Patient Theme (Soft Rose/Pink)
```
Primary Gradient:    #f43f5e → #ec4899
Background:          #fff1f2 → #fdf2f8
Text Colors:         #881337 (dark), #be123c (medium), #9f1239 (light)
Hover Background:    #fce7f3
Border Color:        rgba(244, 63, 94, 0.15)
Box Shadow:          rgba(244, 63, 94, 0.35)
```

#### 👨‍⚕️ Doctor Theme (Professional Blue/Teal)
```
Primary Gradient:    #3b82f6 → #14b8a6
Background:          #eff6ff → #f0fdfa
Text Colors:         #1e3a8a (dark), #1e40af (medium)
Hover Background:    #dbeafe
Border Color:        rgba(59, 130, 246, 0.2)
Box Shadow:          rgba(59, 130, 246, 0.35)
```

#### 👔 Admin Theme (Dark Corporate Orange/Amber)
```
Primary Gradient:    #f97316 → #fbbf24
Background:          #1e293b → #334155 (dark)
Text Colors:         #fcd34d (bright), #fef3c7 (light)
Hover Background:    rgba(249, 115, 22, 0.2)
Border Color:        rgba(249, 115, 22, 0.3)
Box Shadow:          rgba(249, 115, 22, 0.4)
```

### Component States

#### Navigation Buttons
```css
/* Default State */
padding: 10px 16px
border-radius: 10px
font-size: 14px
box-shadow: 0 2px 6px rgba(0,0,0,0.04)

/* Hover State */
transform: translateY(-2px)
box-shadow: 0 4px 12px rgba(0,0,0,0.08)

/* Active State */
background: Role-specific gradient
color: white (Patient/Doctor) or #0f172a (Admin)
box-shadow: 0 4px 12px with role color
```

#### Hero Buttons
```css
/* Default */
padding: 14px 24px
font-size: 15px
border-radius: 12px
box-shadow: 0 4px 16px

/* Hover */
transform: translateY(-3px)
box-shadow: 0 8px 24px

/* Outline Variant */
background: transparent
border: 2px solid
```

#### Sidebar
```css
/* Dimensions */
Width: 300px (desktop), 85vw (mobile, max 320px)
Height: 100vh
Position: Fixed, slides from left

/* Animation */
Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Backdrop: blur(4px)

/* Buttons */
Padding: 18px 24px
Icon Size: 26px
Hover: translateX(6px)
```

### Spacing System

```
Extra Small:    4px   (gap-1)
Small:          8px   (gap-2)
Medium:         12px  (gap-3)
Large:          16px  (gap-4)
Extra Large:    24px  (gap-6)
XXL:            32px  (gap-8)
```

### Typography Scale

```
Hero Title:         36px, weight: 800, line-height: 1.2
Section Title:      28-32px, weight: 700-800
Lead Text:          16px, line-height: 1.7
Body Text:          14-15px
Small Text:         12-13px
Button Text:        14-15px, weight: 600-700
Stat Value:         32px, weight: 800
Stat Label:         13px, weight: 700, uppercase
```

### Shadow System

```
Level 1 (Subtle):   0 2px 6px rgba(0,0,0,0.04)
Level 2 (Card):     0 4px 12px rgba(0,0,0,0.08)
Level 3 (Elevated): 0 6px 20px rgba(0,0,0,0.12)
Level 4 (Popup):    0 8px 28px rgba(0,0,0,0.15)
Sidebar:            6px 0 32px rgba(0,0,0,0.15)
```

### Border Radius

```
Small:      8px
Medium:     10px
Large:      12px
XL:         14px
XXL:        16px
Circular:   50%
```

### Breakpoints

```css
Mobile Small:   480px and below
Mobile:         768px and below
Tablet:         1024px and below
Desktop:        1200px and above
```

### Animation Timing

```
Fast:       0.2s (hover effects)
Standard:   0.3s (most transitions)
Slow:       0.5s (page transitions)
Easing:     cubic-bezier(0.4, 0, 0.2, 1)
```

### Dark Mode Colors

```
Background:         #0f172a → #1e293b
Card Background:    #1e293b
Border:             #334155, #475569
Text Primary:       #f1f5f9
Text Secondary:     #cbd5e1
Text Muted:         #94a3b8
Input Background:   #0f172a
Accent:             #3b82f6 (blue)
```

### Accessibility

```
Focus Outline:      2px solid #0ea5e9
Focus Offset:       2px
Min Touch Target:   44px
Font Size (mobile): 16px (inputs to prevent zoom)
Contrast Ratio:     WCAG AA compliant
```

### Z-Index Layers

```
Base:               0
Nav Bar:            10
Sidebar Overlay:    999
Sidebar:            1000
Modal Overlay:      1999
Modal:              2000
Tooltip:            3000
```

### Stat Cards

```css
/* Layout */
Padding: 20px
Border-Radius: 14px
Text-Align: center

/* Hover Effect */
Transform: translateY(-4px)
Box-Shadow: 0 8px 28px

/* Label */
Font-Size: 13px
Text-Transform: uppercase
Letter-Spacing: 0.8px

/* Value */
Font-Size: 32px
Font-Weight: 800
```

### Hero Section

```css
/* Container */
Padding: 32px 0
Border-Radius: 16px
Margin-Bottom: 32px

/* Title */
Font-Size: 36px (desktop), 24px (mobile)
Margin-Bottom: 16px

/* Lead Text */
Max-Width: 600px
Line-Height: 1.7

/* Actions */
Gap: 12px
Flex-Wrap: wrap
```

### Notification Badge

```css
Position: absolute
Top: 2px, Right: 4px
Size: 20px × 20px
Border-Radius: 50%
Background: #ef4444
Font-Size: 11px
Border: 2px solid white
```

### Mobile Optimizations

```css
/* Touch Targets */
Min-Height: 44px (iOS guideline)
Min-Width: Auto (buttons stretch)

/* Typography */
Input Font-Size: 16px (prevents zoom)
Button Font-Size: 14px

/* Spacing */
Header Height: 64px (mobile), 76px (desktop)
Padding: Reduced by ~25% on mobile

/* Sidebar */
Width: 85vw (max 320px)
Transform: Slide from left
```

### Scrollbar Styling

```css
Width: 10px
Track: #f1f5f9
Thumb: linear-gradient(135deg, #0ea5e9, #06b6d4)
Thumb Hover: linear-gradient(135deg, #0284c7, #0891b2)
Border-Radius: 5px
```

## Component-Specific Guidelines

### Header
- Fixed position at top
- Height: 76px (desktop), 64px (mobile)
- Contains: Brand logo, Role badge, Menu button
- Backdrop filter for glassmorphism

### Navigation Bar
- Below header, within white container
- Horizontal scroll on overflow
- Role-themed background
- Active state with gradient

### Sidebar
- Slides from left (-300px to 0)
- 3 buttons: Profile, Settings, Logout
- Each with icon (26px) and label
- Smooth hover with translateX(6px)

### Page Hero
- First section after nav
- Two columns: Content (left) + Stats (right)
- Responsive: Stack on mobile
- Role-specific gradient backgrounds

### Buttons
- Primary: Gradient background, white text
- Outline: Transparent bg, colored border
- Ghost: No background, minimal styling
- Icon: 44px × 44px, centered icon

### Forms
- Input height: 44px minimum
- Border: 1px solid, rounded corners
- Focus: Blue border + shadow
- Dark mode: Inverted colors

## Best Practices

1. **Always use role-specific classes** for theming
2. **Maintain 44px minimum** for touch targets
3. **Use cubic-bezier easing** for smooth animations
4. **Test on mobile devices** (especially iOS)
5. **Check dark mode** for all new components
6. **Ensure proper contrast** (WCAG AA minimum)
7. **Add focus states** for keyboard navigation
8. **Use semantic HTML** with ARIA labels
9. **Optimize images** and use SVG when possible
10. **Test with screen readers** for accessibility

## Quick Tips

- Use `transform` instead of `top/left` for better performance
- Add `will-change` for frequently animated properties
- Use `backdrop-filter: blur()` for modern glassmorphism
- Implement smooth scrolling with `scroll-behavior: smooth`
- Add touch-action for better mobile interaction
- Use CSS custom properties for easier theme switching
- Implement skeleton screens for loading states
- Add microinteractions for better UX feedback

## Testing Checklist

Before deploying any UI changes:

- [ ] Test on Chrome, Safari, Firefox
- [ ] Test on iOS Safari and Chrome mobile
- [ ] Test in dark mode
- [ ] Test with keyboard navigation
- [ ] Check all three role themes (Patient, Doctor, Admin)
- [ ] Verify 320px width (smallest mobile)
- [ ] Verify 1920px width (large desktop)
- [ ] Check hover states on all interactive elements
- [ ] Verify focus states are visible
- [ ] Test with screen reader
- [ ] Check color contrast with tools
- [ ] Verify touch targets are 44px+
- [ ] Test sidebar on mobile
- [ ] Verify smooth animations (no jank)
- [ ] Check for console errors

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- CSS File Size: < 150KB
- No layout shifts (CLS = 0)
- Smooth 60fps animations

---

**Last Updated:** December 11, 2025
**Version:** 2.0 (Major UI Overhaul)
**Status:** Production Ready ✅
