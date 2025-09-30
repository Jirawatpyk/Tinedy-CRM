# Updated UI/UX Patterns for Story 2.7: Delete Customer with Safety Checks

**Replace the existing "UI/UX Patterns" section in Story 2.7 with the content below:**

---

## UI/UX Patterns

### Design Philosophy
- **Safety First**: Use progressive disclosure to prevent accidental deletions
- **Clear Consequences**: Show exactly what will be deleted and why
- **Guided Alternatives**: Suggest deactivation when deletion is not possible
- **Consistent Feedback**: Provide clear success/error messages

### Delete Button Placement

#### Customer List - Actions Column
Located in the rightmost actions dropdown menu:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreHorizontal className="h-4 w-4" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleView}>
      <Eye className="w-4 h-4 mr-2" />
      View Details
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleEdit}>
      <Pencil className="w-4 h-4 mr-2" />
      Edit Customer
    </DropdownMenuItem>
    <DropdownMenuSeparator />

    {/* Show delete only for customers without active jobs */}
    {activeJobCount === 0 ? (
      <DropdownMenuItem
        onClick={handleDelete}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Customer
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem disabled>
        <AlertCircle className="w-4 h-4 mr-2 text-muted" />
        Cannot Delete ({activeJobCount} active jobs)
      </DropdownMenuItem>
    )}

    <DropdownMenuItem onClick={handleDeactivate}>
      <Ban className="w-4 h-4 mr-2" />
      Deactivate Instead
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Customer Detail Page - Header
Located in page header as secondary action:

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={goBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
    <div>
      <h1 className="text-2xl font-bold">{customer.name}</h1>
      <CustomerStatusBadge status={customer.status} />
    </div>
  </div>

  <div className="flex gap-2">
    <Button variant="outline" onClick={handleEdit}>
      <Pencil className="w-4 h-4 mr-2" />
      Edit
    </Button>

    {/* Show deactivate button based on status */}
    {customer.status === 'ACTIVE' ? (
      <Button variant="outline" onClick={handleDeactivate}>
        <Ban className="w-4 h-4 mr-2" />
        Deactivate
      </Button>
    ) : (
      <Button variant="outline" onClick={handleReactivate}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reactivate
      </Button>
    )}
  </div>
</div>
```

### Two-Step Confirmation Flow

#### Step 1: Initial Warning Dialog with Job Impact

Use shadcn/ui `AlertDialog` component with custom styling:

```tsx
<AlertDialog>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        Delete Customer?
      </AlertDialogTitle>
      <AlertDialogDescription className="space-y-4">
        {/* Customer Info */}
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="font-semibold">{customer.name}</div>
          <div className="text-sm text-muted-foreground">
            Phone: {customer.phone}
          </div>
          {customer.email && (
            <div className="text-sm text-muted-foreground">
              Email: {customer.email}
            </div>
          )}
        </div>

        {/* Job Count with Visual Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Total Jobs:</span>
            <span className="font-semibold">{totalJobCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Active Jobs:</span>
            <span className={cn(
              "font-semibold",
              activeJobCount > 0 ? "text-red-600" : "text-green-600"
            )}>
              {activeJobCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Completed Jobs:</span>
            <span className="font-semibold">{completedJobCount}</span>
          </div>
        </div>

        {/* Active Jobs Blocking Notice */}
        {activeJobCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cannot Delete</AlertTitle>
            <AlertDescription>
              This customer has {activeJobCount} active job(s) that must be
              completed or cancelled first.
            </AlertDescription>
          </Alert>
        )}

        {/* View Active Jobs Link */}
        {activeJobCount > 0 && (
          <Button
            variant="link"
            onClick={handleViewActiveJobs}
            className="w-full"
          >
            View Active Jobs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
      <AlertDialogCancel>Cancel</AlertDialogCancel>

      {/* Always show deactivate option */}
      <Button
        variant="outline"
        onClick={handleDeactivate}
        className="w-full sm:w-auto"
      >
        <Ban className="w-4 h-4 mr-2" />
        Deactivate Instead
      </Button>

      {/* Only show delete if no active jobs */}
      {activeJobCount === 0 && (
        <Button
          variant="destructive"
          onClick={handleProceedToDelete}
          className="w-full sm:w-auto"
        >
          Delete Permanently
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### Step 2: Final Confirmation with Type-to-Confirm

For hard delete when no active jobs exist:

```tsx
<AlertDialog>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
        <XCircle className="w-5 h-5" />
        Permanent Deletion Confirmation
      </AlertDialogTitle>
      <AlertDialogDescription className="space-y-4">
        {/* Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>This action CANNOT be undone</AlertTitle>
          <AlertDescription>
            Customer "{customer.name}" and all associated data will be
            permanently removed from the system.
          </AlertDescription>
        </Alert>

        {/* Alternative Suggestion */}
        <div className="bg-muted p-4 rounded-md">
          <div className="text-sm font-medium mb-2">
            💡 Alternative: Deactivate Instead
          </div>
          <div className="text-sm text-muted-foreground">
            You can deactivate this customer to hide them while preserving
            all data for future reference.
          </div>
          <Button
            variant="link"
            onClick={handleDeactivateInstead}
            className="px-0 mt-2"
          >
            Deactivate Customer Instead
          </Button>
        </div>

        {/* Type to Confirm */}
        <div className="space-y-2">
          <Label htmlFor="confirm-input" className="text-sm">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </Label>
          <Input
            id="confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="font-mono"
            autoComplete="off"
          />
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel onClick={handleGoBack}>Go Back</AlertDialogCancel>
      <Button
        variant="destructive"
        onClick={handleConfirmDelete}
        disabled={confirmText !== 'DELETE' || isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            Confirm Permanent Delete
          </>
        )}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Active Jobs Blocking Dialog

When users try to delete but active jobs exist, show detailed job list:

```tsx
<Dialog>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        Cannot Delete Customer - Active Jobs Exist
      </DialogTitle>
      <DialogDescription>
        This customer has {activeJobCount} active job(s) that must be
        completed or cancelled before deletion.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {activeJobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{job.id.slice(0, 8)}</Badge>
                  <JobStatusBadge status={job.status} />
                </div>
                <div className="font-medium">{job.serviceType}</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(job.scheduledDate)}
                  </div>
                  {job.assignedUser && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assigned to: {job.assignedUser.name}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewJob(job.id)}
              >
                View Job
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
        Close
      </Button>
      <Button
        onClick={handleDeactivateCustomer}
        className="w-full sm:w-auto"
      >
        <Ban className="w-4 h-4 mr-2" />
        Deactivate Customer Instead
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Customer Status Badge Component

Visual indicator for customer status:

```tsx
const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => {
  const statusConfig = {
    ACTIVE: {
      label: 'Active',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 border-green-300'
    },
    INACTIVE: {
      label: 'Inactive',
      icon: Ban,
      className: 'bg-orange-100 text-orange-800 border-orange-300'
    },
    BLOCKED: {
      label: 'Blocked',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-300'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
```

### Inactive Customer Management

#### Filter Toggle in Customer List

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    {/* Search */}
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>

    {/* Status Filter */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">Active Only</SelectItem>
        <SelectItem value="INACTIVE">Inactive Only</SelectItem>
        <SelectItem value="ALL">All Customers</SelectItem>
        <SelectItem value="BLOCKED">Blocked Only</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Add Customer Button */}
  {session?.user?.role === 'ADMIN' && (
    <Button onClick={handleAddCustomer}>
      <Plus className="w-4 h-4 mr-2" />
      Add Customer
    </Button>
  )}
</div>
```

### Success and Error Feedback

#### Success Toast with Undo Option (Soft Delete)

```tsx
// For deactivation (soft delete)
toast({
  title: "Customer Deactivated",
  description: `${customer.name} has been deactivated successfully.`,
  action: (
    <ToastAction
      altText="Undo deactivation"
      onClick={handleUndo}
    >
      Undo
    </ToastAction>
  ),
});
```

#### Success Toast (Hard Delete)

```tsx
// For permanent deletion
toast({
  title: "Customer Deleted",
  description: `${customer.name} has been permanently deleted.`,
  variant: "default",
});
```

#### Error Toast

```tsx
// For failed deletion
toast({
  title: "Cannot Delete Customer",
  description: `This customer has ${activeJobCount} active jobs. Complete or cancel them first.`,
  variant: "destructive",
  action: (
    <ToastAction
      altText="View active jobs"
      onClick={handleViewJobs}
    >
      View Jobs
    </ToastAction>
  ),
});
```

### Mobile Responsive Design

#### Breakpoint Specifications

```tsx
// Mobile (<640px): Stack buttons vertically
// Tablet (640px-1024px): Horizontal layout with wrapping
// Desktop (>1024px): Full horizontal layout

<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  {/* Buttons automatically stack on mobile, horizontal on desktop */}
</div>
```

#### Touch Target Sizes

```tsx
// All interactive elements meet 44px minimum
<Button
  className="min-h-[44px] min-w-[44px]"
  // ...props
>
  {/* Content */}
</Button>
```

### Accessibility Features

#### Keyboard Navigation

```tsx
// Dialog trap focus
<AlertDialog>
  <AlertDialogContent
    onOpenAutoFocus={(e) => {
      // Focus on cancel button by default (safe action)
      e.preventDefault();
      const cancelButton = e.currentTarget.querySelector('[data-cancel]');
      cancelButton?.focus();
    }}
  >
    {/* Content */}
  </AlertDialogContent>
</AlertDialog>
```

#### Screen Reader Announcements

```tsx
// Announce deletion result
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
};

// Usage
announceToScreenReader(`Customer ${customer.name} has been deleted successfully`);
```

#### ARIA Labels

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleDelete}
  aria-label={`Delete customer ${customer.name}`}
>
  <Trash2 className="w-4 h-4" />
</Button>
```

### Visual Hierarchy and Color System

#### Button Hierarchy in Dialogs

```tsx
// Left to Right priority (Western reading)
// 1. Cancel (ghost/outline) - lowest priority
// 2. Alternative action (outline) - medium priority
// 3. Primary action (destructive for delete) - highest priority

<AlertDialogFooter>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
  <Button variant="outline">Alternative</Button>
  <Button variant="destructive">Delete</Button>
</AlertDialogFooter>
```

#### Color Coding

```tsx
// Status colors
const colors = {
  safe: 'text-green-600',      // Safe actions (deactivate)
  warning: 'text-yellow-600',  // Warnings
  danger: 'text-red-600',      // Destructive actions
  info: 'text-blue-600',       // Informational
  muted: 'text-muted-foreground' // Secondary info
};
```

### Component File Structure

```
apps/crm-app/components/shared/
├── DeleteCustomerDialog.tsx       (Main component)
├── CustomerStatusBadge.tsx        (Status indicator)
├── ActiveJobsList.tsx             (Jobs blocking deletion)
└── DeactivateCustomerDialog.tsx   (Soft delete component)
```

### Implementation Checklist

- [ ] Install required shadcn/ui components: `AlertDialog`, `Dialog`, `Alert`, `Toast`, `Badge`
- [ ] Create `DeleteCustomerDialog` component with two-step flow
- [ ] Create `CustomerStatusBadge` component
- [ ] Add delete button to customer list actions dropdown
- [ ] Add deactivate button to customer detail page
- [ ] Implement soft delete API endpoint `/api/customers/[id]/deactivate`
- [ ] Add status filter to customer list page
- [ ] Implement keyboard navigation for dialogs
- [ ] Add ARIA labels for accessibility
- [ ] Test with screen readers (NVDA/JAWS)
- [ ] Verify touch targets are 44px minimum on mobile
- [ ] Test confirmation flow on all screen sizes
- [ ] Implement success/error toast notifications
- [ ] Add undo functionality for soft delete

---

**Design QA Checklist:**
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] Focus indicators visible on all interactive elements
- [ ] Error messages are clear and actionable
- [ ] Success feedback is immediate and visible
- [ ] Mobile layout tested on 375px viewport
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader announces all important actions
- [ ] Button labels are descriptive and clear