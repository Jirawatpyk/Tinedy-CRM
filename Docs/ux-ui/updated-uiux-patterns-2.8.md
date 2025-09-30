# Updated UI/UX Patterns for Story 2.8: User Management (CRUD)

**Replace the existing "UI/UX Patterns" section in Story 2.8 with the content below:**

---

## UI/UX Patterns

### Design Philosophy
- **Clear Role Hierarchy**: Visual differentiation between user roles
- **Security-First UX**: Prevent accidental permission escalation
- **Guided User Creation**: Step-by-step form with inline validation
- **Safe Deactivation**: Check for active assignments before deactivation

### Complete Page Layout

#### Desktop View (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ☰ Tinedy CRM                                        🔔  👤 Admin User    [⚙] │
├─────────────────────────────────────────────────────────────────────────────┤
│ │                                                                            │
│ │ SETTINGS                USER MANAGEMENT                                   │
│ │                                                                            │
│ │ ► Users                 [+ Add New User]              [Export CSV ▼]      │
│ │   Profile               ────────────────────────────────────────────      │
│ │   Checklist Templates                                                      │
│ │   System Settings       🔍 Search by name or email...   [Filters ▼]      │
│ │   Audit Logs                                                               │
│ │                         Role: [All Roles ▼]    [● Active] [○ Inactive]   │
│ │                         ────────────────────────────────────────────      │
│ │                                                                            │
│ │                         NAME & EMAIL         ROLE          STATUS  ACTIONS│
│ │                         ──────────────────────────────────────────────────│
│ │                                                                            │
│ │                         👤 John Admin                                     │
│ │                            admin@tinedy.com   🔴 Admin     🟢 Active [...]│
│ │                            Created: Oct 1, 2025                            │
│ │                                                                            │
│ │                         👤 Sarah Operations                                │
│ │                            ops1@tinedy.com    🔵 Operations 🟢 Active [...]│
│ │                            Created: Oct 15, 2025                           │
│ │                                                                            │
│ │                         👤 Mike Training                                   │
│ │                            train@tinedy.com   🟣 Training   🟢 Active [...]│
│ │                            Created: Oct 20, 2025                           │
│ │                                                                            │
│ │                         👤 Lisa QC Manager                                 │
│ │                            qc@tinedy.com      🟢 QC Manager  🟢 Active [...]│
│ │                            Created: Oct 25, 2025                           │
│ │                                                                            │
│ │                         👤 Tom Johnson (Inactive)                          │
│ │                            tom@tinedy.com     🔵 Operations  🟠 Inactive[...]│
│ │                            Deactivated: Oct 28, 2025                       │
│ │                         ────────────────────────────────────────────      │
│ │                         Showing 5 of 25 users              [1][2][3] →    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Mobile View (375px)

```
┌──────────────────────────────────────┐
│ ☰  User Management            [+]    │
├──────────────────────────────────────┤
│ 🔍 Search users...                   │
│ [All Roles ▼] [● Active] [○ Inactive]│
├──────────────────────────────────────┤
│                                      │
│ 👤 John Admin                        │
│    admin@tinedy.com                  │
│    🔴 Admin | 🟢 Active              │
│    Created Oct 1, 2025               │
│    [Edit] [Reset Password] [⋮]       │
│                                      │
├──────────────────────────────────────┤
│                                      │
│ 👤 Sarah Operations                  │
│    ops1@tinedy.com                   │
│    🔵 Operations | 🟢 Active         │
│    5 assigned jobs                   │
│    [Edit] [Reset Password] [⋮]       │
│                                      │
├──────────────────────────────────────┤
│                                      │
│ 👤 Mike Training                     │
│    train@tinedy.com                  │
│    🟣 Training | 🟢 Active           │
│    Created Oct 20, 2025              │
│    [Edit] [Reset Password] [⋮]       │
│                                      │
└──────────────────────────────────────┘
```

### User Table Component

#### Desktop Table Layout

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[300px]">
        <Button variant="ghost" onClick={() => handleSort('name')}>
          Name & Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead className="w-[180px]">
        <Button variant="ghost" onClick={() => handleSort('role')}>
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead className="w-[120px]">Status</TableHead>
      <TableHead className="w-[150px]">Assigned Jobs</TableHead>
      <TableHead className="text-right w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <RoleBadge role={user.role} />
        </TableCell>
        <TableCell>
          <StatusBadge isActive={user.isActive} />
        </TableCell>
        <TableCell>
          {user.role === 'OPERATIONS' && (
            <div className="text-sm">
              <span className="font-medium">{user._count?.jobs || 0}</span>
              <span className="text-muted-foreground"> jobs</span>
            </div>
          )}
        </TableCell>
        <TableCell className="text-right">
          <UserActionsDropdown user={user} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Mobile Card Layout

```tsx
<div className="space-y-4">
  {users.map((user) => (
    <Card key={user.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
          <UserActionsDropdown user={user} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <RoleBadge role={user.role} />
          <StatusBadge isActive={user.isActive} />
        </div>

        {user.role === 'OPERATIONS' && user._count?.jobs > 0 && (
          <div className="text-sm text-muted-foreground mb-3">
            {user._count.jobs} assigned jobs
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(user.id)}
            className="flex-1"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResetPassword(user.id)}
            className="flex-1"
          >
            <Key className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Role Badge Component

Visual design with color coding and icons:

```tsx
const roleBadgeConfig = {
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    border: 'border-red-300 dark:border-red-700',
    description: 'Full system access, user management'
  },
  OPERATIONS: {
    label: 'Operations',
    icon: Wrench,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-700',
    description: 'Job management, field work updates'
  },
  TRAINING: {
    label: 'Training',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-700',
    description: 'Training workflow and course management'
  },
  QC_MANAGER: {
    label: 'QC Manager',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    border: 'border-green-300 dark:border-green-700',
    description: 'Quality control oversight, read-only access'
  }
} as const;

export const RoleBadge = ({ role, showDescription = false }: RoleBadgeProps) => {
  const config = roleBadgeConfig[role];
  const Icon = config.icon;

  if (showDescription) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn('gap-1.5', config.color, config.border)}
          >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5', config.color, config.border)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};
```

### Status Badge Component

```tsx
export const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  if (isActive) {
    return (
      <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-700 border-orange-200">
      <XCircle className="h-3 w-3" />
      Inactive
    </Badge>
  );
};
```

### User Actions Dropdown

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Open actions menu for {user.name}</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />

    <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
      <Eye className="mr-2 h-4 w-4" />
      View Details
    </DropdownMenuItem>

    <DropdownMenuItem onClick={() => handleEdit(user.id)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit User
    </DropdownMenuItem>

    <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
      <Key className="mr-2 h-4 w-4" />
      Reset Password
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    {/* Cannot deactivate self */}
    {currentUser.id === user.id ? (
      <DropdownMenuItem disabled>
        <Info className="mr-2 h-4 w-4 text-muted-foreground" />
        Cannot deactivate yourself
      </DropdownMenuItem>
    ) : user.isActive ? (
      <DropdownMenuItem
        onClick={() => handleDeactivate(user.id)}
        className="text-orange-600 focus:text-orange-600"
      >
        <Ban className="mr-2 h-4 w-4" />
        Deactivate User
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem onClick={() => handleReactivate(user.id)}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reactivate User
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

### Add/Edit User Form

#### Create User Modal

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {mode === 'create' ? 'Add New User' : `Edit User: ${user?.name}`}
      </DialogTitle>
      <DialogDescription>
        {mode === 'create'
          ? 'Create a new user account with a temporary password'
          : 'Update user information and role'}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@tinedy.com"
            onChange={handleEmailChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {emailCheckStatus === 'checking' && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {emailCheckStatus === 'available' && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
          )}
          {emailCheckStatus === 'taken' && (
            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-600" />
          )}
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Use company email format: user@tinedy.com
        </p>
      </div>

      {/* Temporary Password (Create mode only) */}
      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="password">
            Temporary Password <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Min 8 characters"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby="password-helper password-error"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePassword}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyPassword}
              disabled={!watch('password')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
          <div id="password-helper" className="space-y-1">
            <p className="text-xs text-muted-foreground">
              ⓘ User will be required to change on first login
            </p>
            {watch('password') && (
              <PasswordStrengthIndicator password={watch('password')} />
            )}
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-2">
        <Label>
          User Role <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={watch('role')}
          onValueChange={(value) => setValue('role', value as UserRole)}
        >
          {Object.entries(roleBadgeConfig).map(([roleKey, config]) => {
            const Icon = config.icon;
            const isCurrentUserRole = currentUser.role === roleKey;
            const isEditingSelf = mode === 'edit' && currentUser.id === user?.id;
            const disabled = isEditingSelf && isCurrentUserRole;

            return (
              <div
                key={roleKey}
                className={cn(
                  'relative flex items-start space-x-3 rounded-lg border p-4',
                  'hover:bg-accent transition-colors',
                  watch('role') === roleKey && 'border-primary bg-accent',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <RadioGroupItem
                  value={roleKey}
                  id={roleKey}
                  disabled={disabled}
                  className="mt-1"
                />
                <Label
                  htmlFor={roleKey}
                  className={cn(
                    'flex-1 cursor-pointer',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{config.label}</span>
                    {disabled && (
                      <Badge variant="outline" className="ml-auto">
                        Current Role
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        {mode === 'edit' && currentUser.id === user?.id && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You cannot change your own role to prevent accidental lockout.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Send Welcome Email (Create mode only) */}
      {mode === 'create' && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sendEmail"
            checked={watch('sendWelcomeEmail')}
            onCheckedChange={(checked) =>
              setValue('sendWelcomeEmail', checked as boolean)
            }
          />
          <Label
            htmlFor="sendEmail"
            className="text-sm font-normal cursor-pointer"
          >
            Send welcome email with login instructions
          </Label>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              {mode === 'create' ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User Account
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update User
                </>
              )}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Password Strength Indicator

```tsx
export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = calculatePasswordStrength(password);

  const strengthConfig = {
    0: { label: 'Very Weak', color: 'bg-red-500', width: 'w-1/5' },
    1: { label: 'Weak', color: 'bg-orange-500', width: 'w-2/5' },
    2: { label: 'Fair', color: 'bg-yellow-500', width: 'w-3/5' },
    3: { label: 'Good', color: 'bg-lime-500', width: 'w-4/5' },
    4: { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
  };

  const config = strengthConfig[strength];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className={cn('font-medium', strength >= 3 ? 'text-green-600' : 'text-orange-600')}>
          {config.label}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', config.color, config.width)}
        />
      </div>
    </div>
  );
};

// Password strength calculation
function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  return Math.min(strength, 4);
}
```

### Password Reset Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Key className="h-5 w-5" />
        Reset Password
      </DialogTitle>
      <DialogDescription>
        Generate a new temporary password for {user.name}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          A new temporary password will be generated. The user will be required
          to change it on their next login.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium">{user.email}</span>
        </div>
      </div>

      {!newPassword ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showPassword"
              checked={showPasswordInDialog}
              onCheckedChange={setShowPasswordInDialog}
            />
            <Label htmlFor="showPassword" className="text-sm font-normal">
              Show temporary password in this dialog
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copyPassword"
              checked={autoCopyPassword}
              onCheckedChange={setAutoCopyPassword}
            />
            <Label htmlFor="copyPassword" className="text-sm font-normal">
              Copy temporary password to clipboard
            </Label>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Password Reset Successful</AlertTitle>
          </Alert>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Temporary Password:</Label>
            <div className="flex gap-2">
              <Input
                value={newPassword}
                readOnly
                className="font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This password will only be shown once. Please copy it now.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            ✉ An email has been sent to {user.email}
          </div>
        </div>
      )}
    </div>

    <DialogFooter>
      {!newPassword ? (
        <>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword} disabled={isResetting}>
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate & Reset Password
              </>
            )}
          </Button>
        </>
      ) : (
        <Button onClick={handleClose} className="w-full">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Password Copied - Close
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Password & Close
            </>
          )}
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Deactivate User Dialog

#### With Active Jobs (Blocked)

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-orange-600">
        <AlertCircle className="h-5 w-5" />
        Cannot Deactivate User
      </DialogTitle>
      <DialogDescription>
        {user.name} has {activeJobCount} active assigned jobs
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You must reassign or complete these jobs before deactivating this user.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
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
                      <User className="w-4 h-4" />
                      Customer: {job.customer.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Scheduled: {formatDate(job.scheduledDate)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewJob(job.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleReassignJob(job.id)}
                  >
                    Reassign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Close
      </Button>
      <Button onClick={handleBulkReassign}>
        <Users className="mr-2 h-4 w-4" />
        Reassign All Jobs
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Without Active Jobs (Allowed)

```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
      <AlertDialogDescription className="space-y-4">
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">This user will:</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Lose access to the system immediately</li>
            <li>Not be able to log in</li>
            <li>Not appear in assignment dropdowns</li>
            <li>Retain all historical work records</li>
          </ul>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can reactivate this user at any time from the user list.
          </AlertDescription>
        </Alert>
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <Button
        variant="destructive"
        onClick={handleDeactivate}
        disabled={isDeactivating}
      >
        {isDeactivating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deactivating...
          </>
        ) : (
          <>
            <Ban className="mr-2 h-4 w-4" />
            Deactivate User
          </>
        )}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Search and Filter Bar

```tsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  {/* Search */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
    {searchQuery && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
        onClick={() => setSearchQuery('')}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>

  {/* Role Filter */}
  <Select value={roleFilter} onValueChange={setRoleFilter}>
    <SelectTrigger className="w-full sm:w-[200px]">
      <SelectValue placeholder="All Roles" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">All Roles</SelectItem>
      <SelectSeparator />
      {Object.entries(roleBadgeConfig).map(([key, config]) => {
        const Icon = config.icon;
        return (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {config.label}
            </div>
          </SelectItem>
        );
      })}
    </SelectContent>
  </Select>

  {/* Status Filter */}
  <div className="flex gap-2">
    <Button
      variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
      onClick={() => setStatusFilter('ACTIVE')}
      className="flex-1 sm:flex-none"
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      Active
    </Button>
    <Button
      variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
      onClick={() => setStatusFilter('INACTIVE')}
      className="flex-1 sm:flex-none"
    >
      <XCircle className="mr-2 h-4 w-4" />
      Inactive
    </Button>
  </div>
</div>

{/* Active Filters Display */}
{(roleFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-sm text-muted-foreground">Active filters:</span>
    {roleFilter !== 'ALL' && (
      <Badge variant="secondary" className="gap-1">
        Role: {roleBadgeConfig[roleFilter as UserRole].label}
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => setRoleFilter('ALL')}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    )}
    {statusFilter !== 'ALL' && (
      <Badge variant="secondary" className="gap-1">
        Status: {statusFilter}
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => setStatusFilter('ALL')}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    )}
    {searchQuery && (
      <Badge variant="secondary" className="gap-1">
        Search: "{searchQuery}"
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => setSearchQuery('')}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    )}
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClearAllFilters}
      className="ml-auto"
    >
      Clear All
    </Button>
  </div>
)}
```

### Success and Error Feedback

#### Success Toasts

```tsx
// User created
toast({
  title: "User Created Successfully",
  description: (
    <div className="space-y-1">
      <p>{user.name} has been added to the system.</p>
      <p className="text-xs text-muted-foreground">
        Temporary password has been sent to {user.email}
      </p>
    </div>
  ),
});

// User updated
toast({
  title: "User Updated",
  description: `Changes to ${user.name} have been saved.`,
});

// Password reset
toast({
  title: "Password Reset Successful",
  description: `New temporary password sent to ${user.email}`,
  action: (
    <ToastAction altText="Copy password" onClick={handleCopy}>
      Copy Password
    </ToastAction>
  ),
});

// User deactivated
toast({
  title: "User Deactivated",
  description: `${user.name} has been deactivated and can no longer log in.`,
  action: (
    <ToastAction altText="Undo" onClick={handleUndo}>
      Undo
    </ToastAction>
  ),
});
```

#### Error Toasts

```tsx
// Email already exists
toast({
  title: "Email Already Exists",
  description: "This email address is already registered in the system.",
  variant: "destructive",
});

// Cannot deactivate user with jobs
toast({
  title: "Cannot Deactivate User",
  description: `${user.name} has ${activeJobCount} active jobs. Reassign them first.`,
  variant: "destructive",
  action: (
    <ToastAction altText="View jobs" onClick={handleViewJobs}>
      View Jobs
    </ToastAction>
  ),
});

// Cannot change own role
toast({
  title: "Cannot Change Own Role",
  description: "You cannot change your own role to prevent accidental lockout.",
  variant: "destructive",
});
```

### Accessibility Features

#### Keyboard Shortcuts

```tsx
// Add keyboard shortcuts for common actions
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K: Focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }

    // Cmd/Ctrl + N: Add new user
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      handleAddUser();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

// Show keyboard shortcuts hint
<div className="text-xs text-muted-foreground">
  Press <kbd className="px-1.5 py-0.5 bg-muted rounded">⌘K</kbd> to search
</div>
```

#### Screen Reader Support

```tsx
// Announce filter changes
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {filteredUsers.length} users found
</div>

// Label icon-only buttons
<Button
  variant="ghost"
  size="icon"
  aria-label={`View details for ${user.name}`}
>
  <Eye className="h-4 w-4" />
</Button>
```

### Component File Structure

```
apps/crm-app/components/shared/
├── UserTable.tsx                    (Main table component)
├── UserCard.tsx                     (Mobile card view)
├── UserForm.tsx                     (Create/Edit form)
├── UserActionsDropdown.tsx          (Actions menu)
├── RoleBadge.tsx                    (Role indicator)
├── StatusBadge.tsx                  (Active/Inactive badge)
├── DeactivateUserDialog.tsx         (Deactivation confirmation)
├── ResetPasswordDialog.tsx          (Password reset)
└── PasswordStrengthIndicator.tsx    (Password strength meter)
```

### Implementation Checklist

- [ ] Install shadcn/ui components: `dialog`, `radio-group`, `checkbox`, `avatar`, `tooltip`
- [ ] Create user management page at `/settings/users`
- [ ] Implement UserTable with sortable columns
- [ ] Create UserForm with role selection and validation
- [ ] Build RoleBadge with color coding and icons
- [ ] Implement StatusBadge for active/inactive display
- [ ] Create ResetPasswordDialog with copy functionality
- [ ] Build DeactivateUserDialog with job check
- [ ] Add search and filter functionality
- [ ] Implement email uniqueness check
- [ ] Add password generator utility
- [ ] Create PasswordStrengthIndicator component
- [ ] Implement keyboard shortcuts (Cmd+K, Cmd+N)
- [ ] Add ARIA labels and screen reader support
- [ ] Test mobile responsive layout (375px to 1920px)
- [ ] Verify touch targets are 44px minimum
- [ ] Test with keyboard navigation only
- [ ] Test with screen readers (NVDA/JAWS)
- [ ] Implement success/error toast notifications

---

**Design QA Checklist:**
- [ ] Color contrast meets WCAG 2.1 AA standards
- [ ] All interactive elements have visible focus indicators
- [ ] Form validation provides clear, actionable error messages
- [ ] Role badges are distinguishable by color and icon
- [ ] Mobile layout adapts gracefully from 375px to desktop
- [ ] All buttons have descriptive labels or aria-labels
- [ ] Keyboard navigation follows logical tab order
- [ ] Loading states provide clear feedback
- [ ] Success/error messages are announced to screen readers
- [ ] Password reset flow is secure and user-friendly