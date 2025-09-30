# Updated UI/UX Patterns for Story 2.9: Delete Job with Cascade Handling

**Replace the existing "UI/UX Patterns" section in Story 2.9 with the content below:**

---

## UI/UX Patterns

### Design Philosophy
- **Context-Aware Confirmation**: Show full job details to prevent accidental deletion
- **Transparent Cascade Impact**: Clearly show what checklist data will be lost
- **Smart Blocking**: Explain why deletion is blocked and suggest alternatives
- **Guided Navigation**: Let users choose where to go after deletion

### Delete Button Placement

#### Job Detail Page - Header Layout

```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
  <div className="flex items-center gap-4">
    <Button variant="ghost" onClick={goBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Job #{job.id.slice(0, 8)}</h1>
        <JobStatusBadge status={job.status} />
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {job.customer.name} • {job.serviceType}
      </div>
    </div>
  </div>

  <div className="flex gap-2 w-full sm:w-auto">
    <Button
      variant="outline"
      onClick={handleEdit}
      className="flex-1 sm:flex-none"
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit
    </Button>

    {/* Show delete only for Admin and allowed statuses */}
    {session?.user?.role === 'ADMIN' && (
      <>
        {canDelete ? (
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                disabled
                className="flex-1 sm:flex-none opacity-50"
              >
                <Ban className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium mb-1">
                Cannot delete {job.status.toLowerCase().replace('_', ' ')} jobs
              </p>
              {getDeleteBlockedReason(job.status)}
            </TooltipContent>
          </Tooltip>
        )}
      </>
    )}
  </div>
</div>
```

### Status-Based Delete Rules

```tsx
// Helper to determine if job can be deleted
const canDeleteJob = (status: JobStatus): boolean => {
  const deletableStatuses: JobStatus[] = ['NEW', 'ASSIGNED', 'ON_HOLD', 'CANCELLED'];
  return deletableStatuses.includes(status);
};

// Helper to get blocked reason
const getDeleteBlockedReason = (status: JobStatus): React.ReactNode => {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <p className="text-sm">
          Active work must be completed first. Consider marking as complete or
          cancelled instead.
        </p>
      );
    case 'COMPLETED':
      return (
        <p className="text-sm">
          Historical records must be preserved for audit purposes. Contact
          admin if deletion is necessary.
        </p>
      );
    default:
      return null;
  }
};
```

### Two-Step Delete Confirmation Flow

#### Step 1: Context-Rich Warning Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        Delete Job Confirmation
      </DialogTitle>
      <DialogDescription>
        Review job details and impact before deletion
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-6 py-4">
      {/* Job Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Job ID</div>
              <div className="font-medium">#{job.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status</div>
              <JobStatusBadge status={job.status} />
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Customer</div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{job.customer.name}</span>
              <span className="text-sm text-muted-foreground">
                ({job.customer.phone})
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Service Type</div>
            <div className="font-medium">{job.serviceType}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Scheduled Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(job.scheduledDate)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-medium">฿{formatPrice(job.price)}</div>
            </div>
          </div>

          {job.assignedUser && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Assigned To</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {job.assignedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{job.assignedUser.name}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Data Warning (if exists) */}
      {hasChecklistData && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Checklist Data Will Be Deleted</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              This job has checklist data that will be permanently lost:
            </p>
            <div className="bg-background/50 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Checklist Template:</span>
                <span className="font-medium">{job.checklistTemplate?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Progress:</span>
                <span className="font-medium">
                  {completedCount} of {totalCount} items completed ({completionPercentage}%)
                </span>
              </div>
            </div>
            <Button
              variant="link"
              onClick={() => setShowChecklistDetails(!showChecklistDetails)}
              className="px-0 h-auto"
            >
              {showChecklistDetails ? (
                <>
                  Hide Checklist Details
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Checklist Details
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Expandable Checklist Details */}
      {hasChecklistData && showChecklistDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Checklist Progress ({completedCount}/{totalCount})
              <Progress value={completionPercentage} className="w-24 h-2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {checklistItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-sm py-2 border-b last:border-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                    {index + 1}. {item.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>What will be deleted:</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
            <li>Job record and all details</li>
            {hasChecklistData && (
              <>
                <li>Checklist completion progress ({completedCount} completed items)</li>
                <li>Quality control data and timestamps</li>
              </>
            )}
            <li>Assignment history</li>
            <li>Job notes and metadata</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Redirect Choice */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">After deletion, return to:</Label>
        <RadioGroup value={redirectTo} onValueChange={setRedirectTo}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="job-list" id="job-list" />
            <Label htmlFor="job-list" className="font-normal cursor-pointer">
              Job List (recommended)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="customer-detail" id="customer-detail" />
            <Label htmlFor="customer-detail" className="font-normal cursor-pointer">
              Customer Detail: {job.customer.name}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dashboard" id="dashboard" />
            <Label htmlFor="dashboard" className="font-normal cursor-pointer">
              Dashboard
            </Label>
          </div>
        </RadioGroup>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="remember-choice"
            checked={rememberChoice}
            onCheckedChange={setRememberChoice}
          />
          <Label
            htmlFor="remember-choice"
            className="text-sm font-normal cursor-pointer"
          >
            Remember my choice for future deletions
          </Label>
        </div>
      </div>

      {/* Cannot Undo Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>This action cannot be undone</AlertTitle>
        <AlertDescription>
          All job data and checklist progress will be permanently deleted from
          the system.
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        onClick={() => setIsOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleProceedToConfirm}
        className="w-full sm:w-auto"
      >
        Continue to Delete
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Step 2: Final Confirmation with Type-to-Confirm

```tsx
<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
        <XCircle className="w-5 h-5" />
        Final Deletion Confirmation
      </AlertDialogTitle>
      <AlertDialogDescription className="space-y-4">
        {/* Warning Banner */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>This action CANNOT be undone</AlertTitle>
          <AlertDescription>
            Job #{job.id.slice(0, 8)} for {job.customer.name} will be
            permanently deleted.
          </AlertDescription>
        </Alert>

        {/* What will be lost */}
        {hasChecklistData && (
          <div className="bg-muted p-4 rounded-md space-y-2">
            <div className="font-medium text-sm">Checklist data will be lost:</div>
            <div className="text-sm text-muted-foreground">
              • {completedCount} completed checklist items
              <br />
              • Progress data and timestamps
              <br />• Quality control records
            </div>
          </div>
        )}

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
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            You will be redirected to: {getRedirectLabel(redirectTo)}
          </p>
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
            Delete Job Permanently
          </>
        )}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Blocked Deletion Dialog with Alternatives

When deletion is blocked due to status:

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-orange-600">
        <Ban className="w-5 h-5" />
        Cannot Delete {job.status.replace('_', ' ')} Job
      </DialogTitle>
      <DialogDescription>
        {getStatusBlockMessage(job.status)}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Current Status */}
      <div className="bg-muted p-4 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          <JobStatusBadge status={job.status} />
        </div>
        <div className="text-sm">
          Job #{job.id.slice(0, 8)} - {job.serviceType}
        </div>
      </div>

      {/* Reason */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Why can't I delete this job?</AlertTitle>
        <AlertDescription>
          {job.status === 'IN_PROGRESS' && (
            <p>
              Jobs in progress represent active work. They must be completed or
              cancelled before deletion to maintain work history integrity.
            </p>
          )}
          {job.status === 'COMPLETED' && (
            <p>
              Completed jobs are historical records that must be preserved for
              audit purposes, reporting, and customer service history.
            </p>
          )}
        </AlertDescription>
      </Alert>

      {/* Alternative Actions */}
      <div className="space-y-2">
        <div className="text-sm font-medium">What would you like to do instead?</div>

        {job.status === 'IN_PROGRESS' && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleChangeStatus('ON_HOLD')}
            >
              <Pause className="mr-2 h-4 w-4" />
              Put Job On Hold
              <span className="ml-auto text-xs text-muted-foreground">
                Pause temporarily
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleChangeStatus('CANCELLED')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Job
              <span className="ml-auto text-xs text-muted-foreground">
                Then can delete
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleChangeStatus('COMPLETED')}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Job
              <span className="ml-auto text-xs text-muted-foreground">
                Finish work
              </span>
            </Button>
          </>
        )}

        {job.status === 'COMPLETED' && (
          <>
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                If you need to delete this completed job for special reasons,
                please contact a system administrator.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleContactAdmin}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Administrator
            </Button>
          </>
        )}
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Job Status Badge Component

```tsx
const jobStatusConfig = {
  NEW: {
    label: 'New',
    icon: Plus,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    canDelete: true,
  },
  ASSIGNED: {
    label: 'Assigned',
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    canDelete: true,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    canDelete: false,
  },
  ON_HOLD: {
    label: 'On Hold',
    icon: Pause,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    canDelete: true,
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
    canDelete: false,
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    canDelete: true,
  },
} as const;

export const JobStatusBadge = ({ status }: { status: JobStatus }) => {
  const config = jobStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1.5', config.color)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
```

### Checklist Preview Component

```tsx
export const ChecklistPreview = ({
  items,
  completedCount,
  totalCount,
}: ChecklistPreviewProps) => {
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Checklist Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
            <Progress value={completionPercentage} className="w-20 h-2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          <div className="space-y-2 pr-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm',
                      item.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {index + 1}. {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  )}
                  {item.completed && item.completedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed: {formatDateTime(item.completedAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
```

### Success and Error Feedback

#### Success Toast with Redirect

```tsx
// After successful deletion
toast({
  title: "Job Deleted Successfully",
  description: (
    <div className="space-y-1">
      <p>Job #{job.id.slice(0, 8)} has been permanently deleted.</p>
      {hasChecklistData && (
        <p className="text-xs text-muted-foreground">
          Checklist data ({completedCount} items) was also removed.
        </p>
      )}
    </div>
  ),
});

// Then redirect based on user choice
router.push(getRedirectPath(redirectTo));
```

#### Error Toast

```tsx
// Deletion failed
toast({
  title: "Cannot Delete Job",
  description: `Jobs with status "${job.status}" cannot be deleted. ${getStatusBlockMessage(job.status)}`,
  variant: "destructive",
  action: (
    <ToastAction altText="View alternatives" onClick={handleShowAlternatives}>
      View Options
    </ToastAction>
  ),
});
```

### Mobile Responsive Design

#### Mobile Delete Button

```tsx
// On mobile, show delete in dropdown menu instead
<div className="sm:hidden">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuItem onClick={handleEdit}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit Job
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {canDelete ? (
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Job
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem disabled>
          <Ban className="mr-2 h-4 w-4" />
          Cannot Delete ({job.status})
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

#### Mobile Dialog Layout

```tsx
// Adjust dialog padding and scrolling for mobile
<DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
  {/* Content with mobile-optimized spacing */}
</DialogContent>
```

### Accessibility Features

#### Keyboard Navigation

```tsx
// Allow Escape to cancel at any step
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isOpen) {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}, [isOpen]);
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
announceToScreenReader(
  `Job ${job.id} has been deleted successfully. Redirecting to ${getRedirectLabel(redirectTo)}.`
);
```

#### ARIA Labels

```tsx
<Button
  variant="destructive"
  onClick={handleDelete}
  aria-label={`Delete job ${job.id} for customer ${job.customer.name}`}
  aria-describedby={canDelete ? undefined : 'delete-disabled-reason'}
>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>

{!canDelete && (
  <span id="delete-disabled-reason" className="sr-only">
    Cannot delete jobs with status {job.status}. {getStatusBlockMessage(job.status)}
  </span>
)}
```

### Visual Hierarchy

#### Button Order in Dialogs

```tsx
// Always left-to-right priority:
// 1. Cancel/Go Back (safe action) - left
// 2. Destructive action (delete) - right

<DialogFooter className="flex-col sm:flex-row gap-2">
  <Button variant="outline" className="w-full sm:w-auto">
    Cancel
  </Button>
  <Button variant="destructive" className="w-full sm:w-auto">
    Delete Job
  </Button>
</DialogFooter>
```

#### Color Coding for Impact

```tsx
// Use color to indicate severity
const impactColors = {
  safe: 'bg-blue-50 border-blue-200',      // Informational
  warning: 'bg-yellow-50 border-yellow-200', // Has checklist data
  danger: 'bg-red-50 border-red-200',      // Cannot undo
};
```

### Component File Structure

```
apps/crm-app/components/shared/
├── DeleteJobDialog.tsx              (Main deletion dialog)
├── JobStatusBadge.tsx               (Status indicator)
├── ChecklistPreview.tsx             (Checklist items display)
└── DeleteBlockedDialog.tsx          (Blocked deletion with alternatives)
```

### Helper Functions

```tsx
// Format redirect label
const getRedirectLabel = (redirectTo: string): string => {
  switch (redirectTo) {
    case 'job-list':
      return 'Job List';
    case 'customer-detail':
      return 'Customer Detail';
    case 'dashboard':
      return 'Dashboard';
    default:
      return 'Job List';
  }
};

// Get redirect path
const getRedirectPath = (redirectTo: string, job: Job): string => {
  switch (redirectTo) {
    case 'customer-detail':
      return `/customers/${job.customerId}`;
    case 'dashboard':
      return '/dashboard';
    case 'job-list':
    default:
      return '/jobs';
  }
};

// Get status block message
const getStatusBlockMessage = (status: JobStatus): string => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'Active work must be completed or cancelled first.';
    case 'COMPLETED':
      return 'Historical records must be preserved for audit purposes.';
    default:
      return 'This job cannot be deleted in its current state.';
  }
};

// Calculate checklist completion
const calculateChecklistCompletion = (itemStatus: Record<string, boolean>) => {
  const items = Object.values(itemStatus);
  const completedCount = items.filter(Boolean).length;
  const totalCount = items.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return { completedCount, totalCount, completionPercentage };
};
```

### Implementation Checklist

- [ ] Install shadcn/ui components: `dialog`, `alert-dialog`, `progress`, `scroll-area`, `radio-group`
- [ ] Create `DeleteJobDialog` component with two-step confirmation
- [ ] Create `JobStatusBadge` component with color coding
- [ ] Build `ChecklistPreview` component with progress indicator
- [ ] Create `DeleteBlockedDialog` with alternative actions
- [ ] Add delete button to job detail page header
- [ ] Implement status-based delete validation
- [ ] Add checklist data detection and warning
- [ ] Implement redirect choice with user preference storage
- [ ] Create type-to-confirm final confirmation
- [ ] Add keyboard shortcuts (Escape to cancel)
- [ ] Implement screen reader announcements
- [ ] Add ARIA labels for accessibility
- [ ] Test mobile responsive layout (375px to 1920px)
- [ ] Verify touch targets are 44px minimum
- [ ] Test keyboard navigation without mouse
- [ ] Test with screen readers (NVDA/JAWS)
- [ ] Implement success/error toast notifications
- [ ] Add loading states for async operations

---

**Design QA Checklist:**
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] Focus indicators visible on all interactive elements
- [ ] Checklist preview is readable and scrollable
- [ ] Status badges are distinguishable by color and icon
- [ ] Error messages provide clear next steps
- [ ] Mobile layout adapts gracefully from 375px
- [ ] All buttons have descriptive labels
- [ ] Keyboard navigation follows logical flow
- [ ] Loading states provide clear feedback
- [ ] Success/error messages are announced to screen readers
- [ ] Type-to-confirm input has proper focus management
- [ ] Redirect choice is saved and respected