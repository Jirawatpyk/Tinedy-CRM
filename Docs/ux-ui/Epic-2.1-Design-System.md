# Epic 2.1: Design System & Component Library

## 🎨 Design Token Specifications

### Color System

#### Primary Palette
```css
:root {
  /* Primary Brand Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;   /* Main brand */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  --primary-950: #172554;
}
```

#### Status & Semantic Colors
```css
:root {
  /* Success (Completed Jobs) */
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-700: #047857;

  /* Warning (In Progress) */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #b45309;

  /* Error (Overdue/Issues) */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-700: #c53030;

  /* Info (New Jobs) */
  --info-50: #f0f9ff;
  --info-500: #06b6d4;
  --info-700: #0891b2;

  /* Service Type Colors */
  --cleaning-color: #06d6a0;
  --training-color: #f72585;
}
```

#### Neutral Palette
```css
:root {
  /* Neutral Colors */
  --neutral-0: #ffffff;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  --neutral-950: #030712;
}
```

### Typography System

#### Font Families
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
  --font-thai: 'Sarabun', 'Inter', sans-serif;
}
```

#### Typography Scale
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

#### Typography Classes
```css
/* Headings */
.text-h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--neutral-900);
}

.text-h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--neutral-900);
}

.text-h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--neutral-900);
}

.text-h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--neutral-900);
}

/* Body Text */
.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--neutral-700);
}

.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-700);
}

.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}

/* Labels & Captions */
.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--neutral-800);
}

.text-caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-500);
}
```

### Spacing System

#### Base Unit: 8px
```css
:root {
  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

### Border Radius System
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-base: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;   /* Full circle */
}
```

### Shadow System
```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-base: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

  /* Focus Shadows */
  --shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.1);
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

## 🧩 Component Library

### 1. Button Components

#### Primary Button
```css
.btn {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target */

  /* Disable text selection */
  user-select: none;
  -webkit-user-select: none;
}

.btn:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

#### Button Variants
```css
/* Primary */
.btn-primary {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-primary:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-base);
}

.btn-primary:active {
  background: var(--primary-700);
  border-color: var(--primary-700);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary */
.btn-secondary {
  background: white;
  color: var(--primary-600);
  border-color: var(--primary-300);
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-400);
}

/* Success */
.btn-success {
  background: var(--success-500);
  color: white;
  border-color: var(--success-500);
}

.btn-success:hover {
  background: var(--success-600);
  border-color: var(--success-600);
}

/* Danger */
.btn-danger {
  background: var(--error-500);
  color: white;
  border-color: var(--error-500);
}

.btn-danger:hover {
  background: var(--error-600);
  border-color: var(--error-600);
}
```

#### Button Sizes
```css
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  min-height: 36px;
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
  min-height: 52px;
}

.btn-icon {
  padding: var(--space-3);
  min-width: 44px;
  aspect-ratio: 1;
}
```

### 2. Card Components

#### Base Card
```css
.card {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}
```

#### Interactive Card
```css
.card-interactive {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-300);
}

.card-interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-base);
}
```

#### Job Card Specific
```css
.job-card {
  position: relative;
  border-left: 4px solid var(--neutral-300);
}

.job-card.cleaning {
  border-left-color: var(--cleaning-color);
}

.job-card.training {
  border-left-color: var(--training-color);
}

.job-card-status {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
}

.job-card-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .job-card-actions {
    flex-direction: column;
  }
}
```

### 3. Form Components

#### Input Fields
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--neutral-800);
}

.form-label.required::after {
  content: ' *';
  color: var(--error-500);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  background: white;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target */
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-400);
  box-shadow: var(--shadow-focus);
}

.form-input:invalid {
  border-color: var(--error-400);
}

.form-input:invalid:focus {
  box-shadow: var(--shadow-focus-error);
}

.form-input:disabled {
  background: var(--neutral-100);
  color: var(--neutral-500);
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--neutral-400);
}
```

#### Textarea
```css
.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}
```

#### Select Dropdown
```css
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: var(--space-10);
}
```

#### Error States
```css
.form-error {
  font-size: var(--text-sm);
  color: var(--error-600);
  margin-top: var(--space-1);
}

.form-input.error {
  border-color: var(--error-400);
}
```

### 4. Status Components

#### Status Badge
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

.status-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-new {
  background: var(--info-50);
  color: var(--info-700);
}
.status-new::before {
  background: var(--info-500);
}

.status-assigned {
  background: var(--warning-50);
  color: var(--warning-700);
}
.status-assigned::before {
  background: var(--warning-500);
}

.status-in-progress {
  background: var(--success-50);
  color: var(--success-700);
}
.status-in-progress::before {
  background: var(--success-500);
}

.status-completed {
  background: var(--primary-50);
  color: var(--primary-700);
}
.status-completed::before {
  background: var(--primary-500);
}

.status-overdue {
  background: var(--error-50);
  color: var(--error-700);
}
.status-overdue::before {
  background: var(--error-500);
}
```

### 5. Navigation Components

#### Header Navigation
```css
.header {
  background: white;
  border-bottom: 1px solid var(--neutral-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.nav-link {
  color: var(--neutral-600);
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-base);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--primary-600);
  background: var(--primary-50);
}

.nav-link.active {
  color: var(--primary-600);
  background: var(--primary-100);
}

@media (max-width: 768px) {
  .header-nav {
    display: none; /* Use mobile menu */
  }
}
```

#### Mobile Bottom Navigation
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--neutral-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-content {
  display: flex;
  justify-content: space-around;
  padding: var(--space-2) 0;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  text-decoration: none;
  color: var(--neutral-500);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  min-width: 44px;
  border-radius: var(--radius-base);
  transition: all 0.2s ease;
}

.bottom-nav-item:hover,
.bottom-nav-item.active {
  color: var(--primary-600);
  background: var(--primary-50);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
}
```

### 6. Modal & Dialog Components

#### Modal Overlay
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--neutral-900);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-500);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--neutral-100);
  color: var(--neutral-700);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--neutral-200);
  background: var(--neutral-50);
}
```

### 7. Loading & Progress Components

#### Loading Spinner
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--neutral-200);
  border-top: 2px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 1px;
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}
```

#### Progress Bar
```css
.progress {
  width: 100%;
  height: 8px;
  background: var(--neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-500);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-bar.success {
  background: var(--success-500);
}

.progress-bar.warning {
  background: var(--warning-500);
}

.progress-bar.error {
  background: var(--error-500);
}
```

#### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-200) 25%,
    var(--neutral-100) 50%,
    var(--neutral-200) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-base);
  animation: skeleton 2s ease-in-out infinite;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 1em;
  margin-bottom: var(--space-2);
}

.skeleton-card {
  height: 200px;
  width: 100%;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
```

## 📱 Responsive Breakpoints

```css
:root {
  /* Breakpoints */
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
}

/* Mobile First Media Queries */
.container {
  width: 100%;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    margin: 0 auto;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
    padding: 0 var(--space-8);
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

## 🎭 Animation & Transitions

### Standard Transitions
```css
:root {
  /* Animation Durations */
  --duration-fast: 0.15s;
  --duration-normal: 0.2s;
  --duration-slow: 0.3s;
  --duration-slower: 0.5s;

  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Standard transition for interactive elements */
.transition {
  transition: all var(--duration-normal) var(--ease-in-out);
}

.transition-fast {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.transition-slow {
  transition: all var(--duration-slow) var(--ease-in-out);
}
```

### Micro-Interactions
```css
/* Button press animation */
.btn-press {
  transform: scale(1);
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.btn-press:active {
  transform: scale(0.98);
}

/* Card hover lift */
.card-lift {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Fade in animation */
.fade-in {
  opacity: 0;
  animation: fadeIn var(--duration-slow) var(--ease-out) forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Slide up animation */
.slide-up {
  transform: translateY(20px);
  opacity: 0;
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## 🎯 Usage Guidelines

### Component Implementation Example

```jsx
// React component using design system
const JobCard = ({ job, onStatusUpdate, onEdit, onDelete }) => {
  return (
    <div className={`
      card
      card-interactive
      job-card
      ${job.serviceType === 'CLEANING' ? 'cleaning' : 'training'}
      transition
      fade-in
    `}>
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-h4 mb-1">{job.customer.name}</h3>
            <p className="text-body-sm text-neutral-600">
              {job.serviceType === 'CLEANING' ? '🧹 ทำความสะอาด' : '📚 อบรม'}
            </p>
          </div>
          <div className={`status-badge status-${job.status.toLowerCase()}`}>
            {job.statusDisplay}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-caption">📅</span>
            <span className="text-body-sm">{job.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption">⏰</span>
            <span className="text-body-sm">{job.scheduledTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption">💰</span>
            <span className="text-body-sm">{job.price} บาท</span>
          </div>
        </div>

        <div className="job-card-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => onEdit(job.id)}
          >
            ✏️ แก้ไข
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onStatusUpdate(job.id)}
          >
            🔄 อัปเดต
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(job.id)}
          >
            ❌ ลบ
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Accessibility Integration

```css
/* Focus management */
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }

  .card {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Design system นี้ให้พื้นฐานที่แข็งแกร่งสำหรับการพัฒนา Epic 2.1 โดยเน้นการใช้งานง่าย, ความสอดคล้อง, และการเข้าถึงได้สำหรับผู้ใช้งานทุกกลุ่ม