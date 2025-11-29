# Quick Reference: MUI to Tailwind Conversion

## Common Pattern Replacements

### Layout Components

```tsx
// MUI Box → Tailwind div
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
<div className="flex flex-col gap-2">

// MUI Box with padding
<Box sx={{ p: 3, m: 2 }}>
<div className="p-6 m-4">

// MUI Paper
<Paper sx={{ p: 3, borderRadius: 3 }}>
<div className="card p-6">

// MUI Card
<Card sx={{ mb: 2, cursor: 'pointer' }}>
  <CardContent>
<div className="card mb-4 cursor-pointer">
```

### Typography

```tsx
// MUI Typography variants
<Typography variant="h1" gutterBottom>
<h1 className="text-6xl font-bold mb-4">

<Typography variant="h4" fontWeight="600">
<h2 className="text-3xl font-semibold">

<Typography variant="body1" color="text.secondary">
<p className="text-gray-600 dark:text-gray-400">

<Typography variant="caption" color="text.secondary">
<span className="text-xs text-gray-500">
```

### Buttons

```tsx
// MUI Button variants
<Button variant="contained" color="primary">
<button className="btn-primary">

<Button variant="outlined">
<button className="btn-outline">

<Button variant="text" startIcon={<Icon />}>
<button className="flex items-center gap-2 text-primary-500 hover:text-primary-600">
  <FiIcon /> Text
</button>

// IconButton
<IconButton size="small">
  <EditIcon />
</IconButton>
<button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
  <FiEdit2 className="w-4 h-4" />
</button>
```

### Form Elements

```tsx
// TextField (keep MUI for complex forms, or use Tailwind)
<TextField fullWidth label="Name" />
<div>
  <label className="block text-sm font-medium mb-2">Name</label>
  <input className="input-field" />
</div>

// Select (keep MUI or use Headless UI)
<Select value={value} onChange={handleChange}>
  <MenuItem value="1">One</MenuItem>
</Select>
// Keep MUI for Select or use @headlessui/react Listbox
```

### Progress Bars

```tsx
// Linear Progress
<LinearProgress variant="determinate" value={60} />
<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
  <div
    className="bg-primary-500 h-2 rounded-full transition-all"
    style={{ width: '60%' }}
  />
</div>

// Circular Progress
<CircularProgress />
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
```

### Avatars

```tsx
// Single Avatar
<Avatar sx={{ bgcolor: 'primary.main' }}>
  {name.charAt(0)}
</Avatar>
<div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
  {name.charAt(0)}
</div>

// Avatar Group (custom implementation)
<AvatarGroup max={4}>
  {members.map(m => <Avatar key={m.id}>{m.name[0]}</Avatar>)}
</AvatarGroup>
<div className="flex -space-x-2">
  {members.slice(0, 4).map(m => (
    <div key={m.id} className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
      {m.name[0]}
    </div>
  ))}
</div>
```

### Chips/Badges

```tsx
// MUI Chip
<Chip label="Active" color="success" size="small" />
<span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
  Active
</span>

// Chip with icon
<Chip icon={<WifiIcon />} label="Online" />
<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
  <FiWifi className="w-3 h-3" /> Online
</span>
```

### Lists

```tsx
// MUI List
<List>
  <ListItem button>
    <ListItemIcon><Icon /></ListItemIcon>
    <ListItemText primary="Item" />
  </ListItem>
</List>

// Tailwind
<ul className="space-y-2">
  <li className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
    <FiIcon className="w-5 h-5 text-gray-500" />
    <span>Item</span>
  </li>
</ul>
```

### Tabs

```tsx
// MUI Tabs (keep MUI or use Headless UI)
<Tabs value={tab} onChange={setTab}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
</Tabs>

// Custom Tailwind
<div className="border-b border-gray-200 dark:border-gray-700">
  <div className="flex gap-1 px-6">
    {['Tab 1', 'Tab 2'].map((label, i) => (
      <button
        key={label}
        onClick={() => setTab(i)}
        className={`px-6 py-4 font-medium transition-colors ${
          tab === i
            ? 'text-primary-500 border-b-2 border-primary-500'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
</div>
```

### Alerts

```tsx
// Keep MUI Alert for consistency
<Alert severity="error" onClose={handleClose}>
  Error message
</Alert>

// Or custom Tailwind
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
  <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
  <div className="flex-1">Error message</div>
  <button onClick={handleClose}>
    <FiX className="w-4 h-4" />
  </button>
</div>
```

### Responsive Design

```tsx
// MUI breakpoints
<Box sx={{
  display: { xs: 'none', md: 'block' },
  p: { xs: 2, md: 4 }
}}>

// Tailwind responsive
<div className="hidden md:block p-4 md:p-8">
```

### Colors

```tsx
// MUI theme colors → Tailwind custom colors
color="primary" → text-primary-500 / bg-primary-500
color="secondary" → text-secondary-500 / bg-secondary-500
color="error" → text-red-600 / bg-red-600
color="warning" → text-amber-600 / bg-amber-600
color="success" → text-green-600 / bg-green-600
color="text.secondary" → text-gray-600 dark:text-gray-400
bgcolor="background.paper" → bg-white dark:bg-slate-800
```

### Icons

```tsx
// MUI Icons → React Icons (Feather)
import { Add, Edit, Delete, Settings } from '@mui/icons-material';
import { FiPlus, FiEdit2, FiTrash2, FiSettings } from 'react-icons/fi';

// Usage
<Add />
<FiPlus className="w-5 h-5" />
```

## Keep These MUI Components

For speed and accessibility, consider keeping:

- `Dialog` - Complex modal management
- `TextField` - Form inputs with validation
- `Select` / `MenuItem` - Dropdowns
- `Alert` - Consistent notifications
- `DatePicker` - Date selection
- `Autocomplete` - Search/select

Use Headless UI alternatives if you want full Tailwind control:

- `@headlessui/react` - Dialog, Menu, Listbox, Popover, etc.

## Spacing Reference

MUI spacing units → Tailwind classes:

- `p={1}` → `p-2` (0.5rem)
- `p={2}` → `p-4` (1rem)
- `p={3}` → `p-6` (1.5rem)
- `p={4}` → `p-8` (2rem)
- `gap={1}` → `gap-2`
- `gap={2}` → `gap-4`
- `gap={3}` → `gap-6`

## Common Gotchas

1. **MUI `sx` prop has camelCase**, Tailwind uses kebab-case

   - `sx={{ backgroundColor: 'red' }}` → `className="bg-red-500"`

2. **MUI spacing is 8px per unit**, Tailwind is 0.25rem (4px)

   - MUI `p={2}` (16px) = Tailwind `p-4` (1rem = 16px)

3. **Dark mode syntax**

   - MUI: Use theme variants
   - Tailwind: `dark:` prefix (e.g., `dark:bg-gray-800`)

4. **Flexbox defaults**

   - MUI Box doesn't apply flex by default
   - Tailwind: manually add `flex` class

5. **Typography doesn't auto-inherit**
   - Add text color classes explicitly: `text-gray-900 dark:text-white`
