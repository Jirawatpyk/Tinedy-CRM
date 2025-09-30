# Accessibility Checklist & Component Recommendations
## Stories 2.7, 2.8, 2.9 Implementation Guide

**Prepared by:** Luna (UX/UI Designer)
**Date:** 2025-09-30
**Target:** WCAG 2.1 Level AA Compliance

---

## Executive Summary

This document provides comprehensive accessibility requirements and component recommendations for implementing Stories 2.7 (Delete Customer), 2.8 (User Management), and 2.9 (Delete Job). All patterns follow WCAG 2.1 Level AA standards and ensure the CRM is usable by all team members, including those with disabilities.

---

## WCAG 2.1 Level AA Compliance Checklist

### 1. Perceivable (Users must be able to perceive the information)

#### 1.1 Text Alternatives
- [ ] All icon-only buttons have `aria-label` or visible text
- [ ] Status badges include both color and text/icon indicators
- [ ] Role badges use icons + text (not color alone)
- [ ] Images (if any) have descriptive alt text
- [ ] Loading spinners have associated text ("Loading...", "Deleting...")

**Implementation Example:**
```tsx
// ❌ Bad: Icon only
<Button onClick={handleDelete}>
  <Trash2 className="w-4 h-4" />
</Button>

// ✅ Good: Icon with label or aria-label
<Button onClick={handleDelete} aria-label="Delete customer John Doe">
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>
```

#### 1.2 Time-based Media
- [ ] Auto-dismissing toasts have sufficient duration (minimum 5 seconds)
- [ ] Users can dismiss toasts manually before auto-dismiss
- [ ] No content flashes more than 3 times per second

**Implementation:**
```tsx
toast({
  duration: 5000, // Minimum 5 seconds
  action: <ToastAction altText="Close">×</ToastAction>
});
```

#### 1.3 Adaptable
- [ ] Content adapts from 320px to 1920px viewport width
- [ ] No horizontal scrolling required at 320px width
- [ ] Information hierarchy maintained across screen sizes
- [ ] Tables convert to cards on mobile (<640px)
- [ ] Modal dialogs scale appropriately on mobile

#### 1.4 Distinguishable

**Color Contrast:**
- [ ] Normal text (16px): minimum 4.5:1 contrast ratio
- [ ] Large text (18px+): minimum 3:1 contrast ratio
- [ ] UI components (buttons, borders): minimum 3:1 contrast ratio
- [ ] Focus indicators: minimum 3:1 contrast with background

**Recommended Color Combinations:**
```tsx
// Text on background
const textColors = {
  primary: 'text-gray-900 bg-white',        // 21:1 ratio ✅
  muted: 'text-gray-600 bg-white',          // 7:1 ratio ✅
  destructive: 'text-red-700 bg-red-50',    // 6.5:1 ratio ✅
  success: 'text-green-700 bg-green-50',    // 6.2:1 ratio ✅
};

// Button states
const buttonColors = {
  default: 'bg-blue-600 text-white',        // 8:1 ratio ✅
  destructive: 'bg-red-600 text-white',     // 8.5:1 ratio ✅
  outline: 'border-gray-300 text-gray-700', // 5.5:1 ratio ✅
};
```

**Visual Separation:**
- [ ] Status not conveyed by color alone (use icon + text)
- [ ] Error states use icon + color + text
- [ ] Disabled states use opacity + cursor + aria-disabled
- [ ] Focus indicators are at least 2px thick and high contrast

**Focus Indicators:**
```tsx
// Tailwind config for consistent focus
{
  theme: {
    extend: {
      ringWidth: {
        'focus': '2px',
      },
      ringColor: {
        'focus': '#2563eb', // Blue-600 for focus
      }
    }
  }
}

// Usage in components
className="focus:ring-2 focus:ring-focus focus:ring-offset-2"
```

---

### 2. Operable (Users must be able to operate the interface)

#### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] Tab order follows visual/reading order
- [ ] No keyboard traps in modals or dialogs
- [ ] Escape key closes all dialogs/modals
- [ ] Enter key submits forms
- [ ] Space key toggles checkboxes/switches
- [ ] Arrow keys navigate within select/dropdown components

**Keyboard Navigation Map:**
```
Dialog/Modal:
├─ Tab: Move forward through interactive elements
├─ Shift+Tab: Move backward
├─ Escape: Close dialog and return focus to trigger
├─ Enter: Activate focused button
└─ Space: Toggle checkboxes/radio buttons

Form:
├─ Tab: Move between fields
├─ Arrow Up/Down: Navigate select options
├─ Enter: Submit form
└─ Escape: Clear/cancel (if applicable)

Table/List:
├─ Tab: Move to table, then through interactive elements
├─ Arrow keys: Navigate cells (advanced, optional)
└─ Enter: Activate selected row action
```

**Implementation Example:**
```tsx
// Modal focus trap
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent
    onOpenAutoFocus={(e) => {
      // Focus on safe action (Cancel) by default
      const cancelButton = e.currentTarget.querySelector('[data-cancel]');
      if (cancelButton) {
        e.preventDefault();
        (cancelButton as HTMLElement).focus();
      }
    }}
    onCloseAutoFocus={(e) => {
      // Return focus to trigger element
      triggerRef.current?.focus();
    }}
  >
    {/* Content */}
  </DialogContent>
</Dialog>
```

#### 2.2 Enough Time
- [ ] No time limits on completing forms
- [ ] Auto-save drafts if form takes >5 minutes to complete
- [ ] Session timeout warning 2 minutes before expiry
- [ ] Users can extend session without losing data

#### 2.3 Seizures and Physical Reactions
- [ ] No flashing content
- [ ] Smooth animations (no rapid flashing)
- [ ] Loading spinners rotate smoothly (no strobing)

#### 2.4 Navigable
- [ ] Page titles describe content (e.g., "User Management - Settings")
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Skip to main content link (optional but recommended)
- [ ] Breadcrumbs show current location
- [ ] Focus order follows DOM order

**Page Structure:**
```tsx
<main>
  <h1>User Management</h1>
  <section>
    <h2>Active Users</h2>
    <div>{/* User list */}</div>
  </section>
  <section>
    <h2>Inactive Users</h2>
    <div>{/* Inactive user list */}</div>
  </section>
</main>
```

#### 2.5 Input Modalities
- [ ] Touch targets minimum 44px × 44px on mobile
- [ ] Spacing between touch targets minimum 8px
- [ ] Pointer/click actions work with keyboard
- [ ] Drag-and-drop has keyboard alternative (if used)

**Touch Target Verification:**
```tsx
// Button component with minimum touch target
<Button
  className={cn(
    'min-h-[44px] min-w-[44px]', // WCAG AAA (44px)
    'md:min-h-[40px] md:min-w-[40px]' // Desktop can be smaller
  )}
>
  Delete
</Button>
```

---

### 3. Understandable (Users must be able to understand the information)

#### 3.1 Readable
- [ ] Page language set in HTML (`<html lang="th">`)
- [ ] Mixed language content marked with `lang` attribute
- [ ] Font size minimum 16px for body text
- [ ] Line height minimum 1.5 for body text
- [ ] Paragraph spacing at least 2× font size

**Typography Settings:**
```tsx
// Tailwind config
{
  theme: {
    fontSize: {
      'sm': ['0.875rem', { lineHeight: '1.5' }],  // 14px
      'base': ['1rem', { lineHeight: '1.5' }],    // 16px
      'lg': ['1.125rem', { lineHeight: '1.5' }],  // 18px
    }
  }
}
```

#### 3.2 Predictable
- [ ] Consistent navigation across all pages
- [ ] Buttons in same location across similar pages
- [ ] Consistent naming (e.g., always "Delete" not sometimes "Remove")
- [ ] No automatic context changes without warning
- [ ] Form submission requires explicit action (button click)

**Consistent Button Placement:**
```tsx
// Always use this order in dialogs
<DialogFooter>
  <Button variant="outline">Cancel</Button>      {/* Left/First */}
  <Button variant="default">Save</Button>        {/* Right/Last */}
</DialogFooter>

// Destructive actions
<AlertDialogFooter>
  <AlertDialogCancel>Cancel</AlertDialogCancel>  {/* Left/First */}
  <Button variant="destructive">Delete</Button>  {/* Right/Last */}
</AlertDialogFooter>
```

#### 3.3 Input Assistance
- [ ] Form labels clearly identify required fields
- [ ] Error messages describe problem and solution
- [ ] Input validation provides real-time feedback
- [ ] Help text available for complex fields
- [ ] Confirmation required for destructive actions

**Error Message Patterns:**
```tsx
// ❌ Bad: Vague error
"Invalid input"

// ✅ Good: Specific error with solution
"Email address is required. Please enter a valid email (e.g., user@tinedy.com)"

// ❌ Bad: Technical error
"Validation failed: email_unique_constraint"

// ✅ Good: User-friendly error
"This email address is already registered. Try a different email or reset the password."
```

**Form Validation Example:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">
    Email Address <span className="text-destructive">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : 'email-helper'}
  />
  {!errors.email && (
    <p id="email-helper" className="text-sm text-muted-foreground">
      Use company email: user@tinedy.com
    </p>
  )}
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

---

### 4. Robust (Content must be robust enough for assistive technologies)

#### 4.1 Compatible
- [ ] Valid HTML5 (no unclosed tags, correct nesting)
- [ ] Unique IDs for all form inputs
- [ ] ARIA attributes used correctly
- [ ] No ARIA roles that contradict semantic HTML
- [ ] Tested with screen readers (NVDA, JAWS, VoiceOver)

**Semantic HTML:**
```tsx
// ✅ Good: Use semantic elements
<main>
  <nav>
    <ul>
      <li><a href="/users">Users</a></li>
    </ul>
  </nav>
  <article>
    <h1>User Management</h1>
    <section>
      <h2>Active Users</h2>
    </section>
  </article>
</main>

// ❌ Bad: Generic divs everywhere
<div>
  <div>
    <div>
      <div>Users</div>
    </div>
  </div>
</div>
```

---

## Component-Specific Accessibility Requirements

### Story 2.7: Delete Customer Dialog

#### Required ARIA Attributes
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="destructive"
      aria-label={`Delete customer ${customer.name}`}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent
    role="alertdialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <AlertDialogHeader>
      <AlertDialogTitle id="dialog-title">
        Delete Customer?
      </AlertDialogTitle>
      <AlertDialogDescription id="dialog-description">
        Are you sure you want to delete {customer.name}?
        This customer has {jobCount} associated jobs.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <Button variant="destructive" onClick={handleDelete}>
        Delete Permanently
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Screen Reader Testing Points
- [ ] Dialog title announced when opened
- [ ] Description read after title
- [ ] Job count announced clearly
- [ ] Button purposes clear (Cancel vs Delete)
- [ ] Focus returns to trigger after close

#### Keyboard Navigation
- [ ] Tab: Move between buttons
- [ ] Enter: Activate focused button
- [ ] Escape: Close dialog (equivalent to Cancel)
- [ ] Focus trapped within dialog while open

---

### Story 2.8: User Management Page

#### Form Accessibility
```tsx
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend className="text-lg font-semibold mb-4">
      User Information
    </legend>

    {/* Name field */}
    <div className="space-y-2">
      <Label htmlFor="name">
        Full Name <abbr title="required" aria-label="required">*</abbr>
      </Label>
      <Input
        id="name"
        name="name"
        type="text"
        required
        aria-required="true"
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      {errors.name && (
        <p id="name-error" className="text-sm text-destructive" role="alert">
          <AlertCircle className="inline w-4 h-4 mr-1" aria-hidden="true" />
          {errors.name.message}
        </p>
      )}
    </div>

    {/* Role selection */}
    <fieldset>
      <legend className="text-sm font-medium mb-2">
        User Role <abbr title="required" aria-label="required">*</abbr>
      </legend>
      <RadioGroup
        value={selectedRole}
        onValueChange={setSelectedRole}
        aria-label="Select user role"
        aria-required="true"
      >
        {roles.map((role) => (
          <div key={role.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={role.value}
              id={role.value}
              aria-describedby={`${role.value}-description`}
            />
            <Label htmlFor={role.value} className="cursor-pointer">
              <div className="font-medium">{role.label}</div>
              <div
                id={`${role.value}-description`}
                className="text-sm text-muted-foreground"
              >
                {role.description}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  </fieldset>

  <div className="flex gap-2 mt-6">
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit">
      Create User
    </Button>
  </div>
</form>
```

#### Table Accessibility
```tsx
<Table>
  <caption className="sr-only">
    List of {filteredUsers.length} users. Use Tab to navigate through actions.
  </caption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">
        <Button
          variant="ghost"
          onClick={() => handleSort('name')}
          aria-label="Sort by name"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </TableHead>
      <TableHead scope="col">Email</TableHead>
      <TableHead scope="col">Role</TableHead>
      <TableHead scope="col">Status</TableHead>
      <TableHead scope="col">
        <span className="sr-only">Actions</span>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="font-medium">{user.name}</div>
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <RoleBadge role={user.role} />
        </TableCell>
        <TableCell>
          <StatusBadge isActive={user.isActive} />
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${user.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleEdit(user.id)}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleDeactivate(user.id)}>
                <Ban className="mr-2 h-4 w-4" aria-hidden="true" />
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Live Region for Search Results
```tsx
<div className="space-y-4">
  {/* Search input */}
  <Input
    placeholder="Search users..."
    value={searchQuery}
    onChange={handleSearch}
    aria-label="Search users by name or email"
    aria-controls="user-results"
  />

  {/* Announce results to screen readers */}
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {isSearching
      ? 'Searching...'
      : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`
    }
  </div>

  {/* Results */}
  <div id="user-results">
    <UserTable users={filteredUsers} />
  </div>
</div>
```

---

### Story 2.9: Delete Job Dialog

#### Progress Indicator Accessibility
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span id="checklist-progress-label">Checklist Progress</span>
    <span aria-label={`${completedCount} of ${totalCount} items completed`}>
      {completedCount}/{totalCount}
    </span>
  </div>
  <Progress
    value={completionPercentage}
    aria-labelledby="checklist-progress-label"
    aria-valuenow={completionPercentage}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuetext={`${completionPercentage}% complete`}
  />
</div>
```

#### Status Badge Accessibility
```tsx
<Badge
  variant="outline"
  className={statusConfig[status].color}
  role="status"
  aria-label={`Job status: ${statusConfig[status].label}`}
>
  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
  {statusConfig[status].label}
</Badge>
```

---

## Required shadcn/ui Components

### Installation Commands

```bash
# Core components (already installed)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast

# Story 2.7: Delete Customer
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add card
npx shadcn-ui@latest add separator

# Story 2.8: User Management
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add select
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add command  # For search with keyboard shortcuts

# Story 2.9: Delete Job
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add popover
```

### Component Accessibility Features

#### Alert Dialog (Story 2.7, 2.9)
**Built-in Accessibility:**
- ✅ Focus trap
- ✅ Escape to close
- ✅ ARIA attributes
- ✅ Return focus to trigger

**Usage:**
```tsx
<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Dialog (Story 2.8)
**Built-in Accessibility:**
- ✅ Focus management
- ✅ Escape to close
- ✅ Backdrop click to close
- ✅ ARIA attributes

**Best Practice:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Add User</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New User</DialogTitle>
      <DialogDescription>Enter user details below.</DialogDescription>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Radio Group (Story 2.8)
**Built-in Accessibility:**
- ✅ Arrow key navigation
- ✅ Space to select
- ✅ ARIA attributes

**Usage:**
```tsx
<RadioGroup value={role} onValueChange={setRole}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="ADMIN" id="admin" />
    <Label htmlFor="admin">Admin</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="OPERATIONS" id="ops" />
    <Label htmlFor="ops">Operations</Label>
  </div>
</RadioGroup>
```

#### Toast (All Stories)
**Built-in Accessibility:**
- ✅ ARIA live region
- ✅ Announced to screen readers
- ✅ Dismissible

**Best Practice:**
```tsx
toast({
  title: "User Created",
  description: "John Doe has been added successfully.",
  duration: 5000, // 5 seconds minimum
  action: (
    <ToastAction altText="Undo user creation">
      Undo
    </ToastAction>
  ),
});
```

---

## Testing Checklist

### Manual Testing

#### Keyboard Navigation Testing
```
Test Scenario 1: Delete Customer Dialog
1. [ ] Navigate to customer list with Tab
2. [ ] Open actions dropdown with Enter
3. [ ] Navigate to Delete with Arrow keys
4. [ ] Activate Delete with Enter
5. [ ] Dialog opens with focus on Cancel button
6. [ ] Tab to other buttons
7. [ ] Escape closes dialog
8. [ ] Focus returns to actions dropdown

Test Scenario 2: User Form
1. [ ] Tab through all form fields in order
2. [ ] Use Arrow keys in select dropdowns
3. [ ] Space toggles checkboxes
4. [ ] Enter submits form
5. [ ] Error messages announced when validation fails
6. [ ] Focus moves to first error field

Test Scenario 3: Delete Job
1. [ ] Tab to Delete button
2. [ ] Enter opens confirmation
3. [ ] Tab through job details
4. [ ] Type-to-confirm input receives focus
5. [ ] Type "DELETE" with keyboard
6. [ ] Enter confirms deletion
7. [ ] Success toast announced
```

#### Screen Reader Testing

**Tools:**
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (macOS) - Built-in

**Test Points:**
```
Story 2.7: Delete Customer
- [ ] Customer name announced when dialog opens
- [ ] Job count announced clearly
- [ ] Active jobs blocking message read
- [ ] Button purposes clear (Deactivate vs Delete)
- [ ] Success/error toast announced

Story 2.8: User Management
- [ ] Table caption announced
- [ ] Column headers read with data
- [ ] Form labels associated with inputs
- [ ] Error messages announced with role="alert"
- [ ] Password strength announced
- [ ] Role descriptions read when focused

Story 2.9: Delete Job
- [ ] Job details read in logical order
- [ ] Checklist progress percentage announced
- [ ] Status restrictions explained
- [ ] Alternative actions suggested
- [ ] Redirect choice announced
```

#### Color Contrast Testing

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Browser DevTools: Lighthouse Accessibility Audit
- axe DevTools: Browser extension

**Test Points:**
```
- [ ] Body text: 4.5:1 minimum
- [ ] Headings: 4.5:1 minimum
- [ ] Button text: 4.5:1 minimum
- [ ] Disabled text: 3:1 minimum (if must be readable)
- [ ] Focus indicators: 3:1 against background
- [ ] Status badges: 4.5:1 for text
- [ ] Error messages: 4.5:1 minimum
```

#### Mobile Touch Target Testing

**Test Devices:**
- iPhone SE (375px) - Smallest modern phone
- iPhone 14 Pro (393px)
- Samsung Galaxy S22 (360px)
- iPad Mini (768px)

**Test Points:**
```
- [ ] All buttons at least 44px × 44px
- [ ] Spacing between buttons at least 8px
- [ ] Dropdown menu items at least 44px height
- [ ] Table row actions accessible with thumb
- [ ] Modal close button easy to tap
- [ ] Form inputs large enough for touch
```

### Automated Testing

#### Install Testing Libraries
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-axe  # Accessibility testing
npm install --save-dev @axe-core/playwright  # E2E accessibility
```

#### Unit Test Example (DeleteCustomerDialog)
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('DeleteCustomerDialog Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <DeleteCustomerDialog customer={mockCustomer} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should trap focus within dialog', async () => {
    const user = userEvent.setup();
    render(<DeleteCustomerDialog customer={mockCustomer} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    // Tab forward
    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(deleteButton).toHaveFocus();

    // Tab should cycle back
    await user.tab();
    expect(cancelButton).toHaveFocus();
  });

  it('should announce dialog content to screen readers', () => {
    render(<DeleteCustomerDialog customer={mockCustomer} />);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');

    const title = screen.getByRole('heading', { name: /delete customer/i });
    expect(title).toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<DeleteCustomerDialog customer={mockCustomer} onClose={onClose} />);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
```

#### E2E Test Example (Playwright with axe)
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('User Management Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/settings/users');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/settings/users');

    // Tab to Add User button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /add user/i })).toBeFocused();

    // Open dialog
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/name/i)).toBeFocused();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should have correct ARIA labels', async ({ page }) => {
    await page.goto('/settings/users');

    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    const searchInput = page.getByRole('searchbox', { name: /search users/i });
    await expect(searchInput).toBeVisible();

    const addButton = page.getByRole('button', { name: /add new user/i });
    await expect(addButton).toBeVisible();
  });
});
```

---

## Accessibility Statement Template

Include this in your application footer or help section:

```markdown
# Accessibility Statement for Tinedy CRM

We are committed to ensuring digital accessibility for all users, including those with disabilities. We strive to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

## Conformance Status
The Tinedy CRM system is **partially conformant** with WCAG 2.1 Level AA. "Partially conformant" means that some parts of the content do not fully conform to the accessibility standard.

## What We've Done
- All functionality is available via keyboard navigation
- Color is not the only means of conveying information
- Text meets minimum contrast ratios (4.5:1)
- Touch targets meet minimum size requirements (44px × 44px)
- Screen reader support with appropriate ARIA labels
- Form inputs have clear labels and error messages
- Focus indicators are visible and high contrast

## Known Issues
We are continuously working to improve accessibility. Known issues:
- [List any temporary accessibility barriers]

## Feedback
We welcome feedback on the accessibility of Tinedy CRM. Please contact us if you encounter accessibility barriers:
- Email: support@tinedy.com
- Phone: [Support phone number]

## Technical Specifications
- Compatibility: Tested with NVDA, JAWS, and VoiceOver screen readers
- Browsers: Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS 15+, Android 10+
```

---

## Summary

### Implementation Priority

**Phase 1: Critical Accessibility (Must Have)**
1. ✅ Keyboard navigation for all interactive elements
2. ✅ ARIA labels on all icon-only buttons
3. ✅ Color contrast meets 4.5:1 minimum
4. ✅ Form labels associated with inputs
5. ✅ Error messages with role="alert"
6. ✅ Focus indicators on all interactive elements

**Phase 2: Enhanced Accessibility (Should Have)**
1. ✅ Screen reader announcements for dynamic content
2. ✅ Live regions for search results
3. ✅ Detailed ARIA descriptions
4. ✅ Keyboard shortcuts documentation
5. ✅ Skip to content links

**Phase 3: Optimal Accessibility (Nice to Have)**
1. ✅ High contrast mode support
2. ✅ Reduced motion preferences
3. ✅ Font size customization
4. ✅ Voice command support (future)

### Success Metrics

- [ ] 100% keyboard navigable
- [ ] 0 critical axe violations
- [ ] 4.5:1 minimum contrast ratio on all text
- [ ] 44px minimum touch targets on mobile
- [ ] Screen reader compatibility confirmed
- [ ] Tested by users with disabilities

### Resources

**Documentation:**
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/

**Testing Tools:**
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools

**Screen Readers:**
- NVDA (Free): https://www.nvaccess.org/
- JAWS (Trial): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (Built-in): macOS and iOS

---

**Questions or Need Help?**
Contact Luna (UX/UI Designer) for accessibility guidance or Sarah (Product Owner) for prioritization decisions.