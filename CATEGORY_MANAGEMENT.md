# Category Management Feature 🏷️

## Overview
You can now manage custom categories directly from the UI! This feature allows you to create and organize your own categories for better transaction and bill tracking.

## How to Access
1. Click on **"Categories"** in the sidebar navigation
2. Or navigate to `/categories` in your browser

## Features

### ✨ Add Custom Categories
Create your own categories with:
- **Custom Name**: Name it whatever you want (e.g., "Groceries", "Freelance Income")
- **Icon Selection**: Choose from 20+ popular Material Icons
- **Color Picker**: Pick from 15 preset colors or use any hex color
- **Type**: Select Income or Expense

### 🎨 Icon Options
Choose from popular icons like:
- 🍴 Restaurant (Food)
- 🏠 Home
- 🚗 Car
- 🛒 Shopping
- 🎬 Entertainment
- 💊 Health
- ⚡ Utilities
- 💳 Payments
- 💼 Work
- 🎓 Education
- ✈️ Travel
- 🏋️ Fitness
- 🐾 Pets
- And more!

### 🎨 Color Options
15 beautiful preset colors optimized for both light and dark modes.

### 📊 Category Display
- **Income Categories**: Green-themed section showing all income categories
- **Expense Categories**: Red-themed section showing all expense categories
- Each category shows its icon, name, and color
- Categories are automatically sorted alphabetically

## Default Categories Included

### Income (1):
- 💳 Salary (Green)

### Expense (7):
- 🍴 Food (Red)
- 🏠 Rent (Blue)
- 🛒 Shopping (Orange)
- 🚗 Transport (Purple)
- 🎬 Entertainment (Pink)
- 💊 Health (Teal)
- ⚡ Utilities (Cyan) - **NEW!**

## How to Add a Category

1. **Click "Add Category"** button in the top right
2. **Fill in the form**:
   - Enter a category name
   - Select Income or Expense type
   - Pick an icon from the grid
   - Choose a color
3. **Preview** - See how it looks in real-time
4. **Click "Create Category"** - Done!

## Using Your Categories

Once created, your custom categories will automatically appear in:
- ✅ Transaction creation/editing
- ✅ Bill creation/editing
- ✅ Budget creation
- ✅ Filtering and reporting

## Technical Details

### Backend API
- **GET** `/api/categories` - Get all categories
- **POST** `/api/categories` - Create new category
- **POST** `/api/categories/seed-missing` - Add missing default categories

### Frontend
- Component: `CategoriesComponent`
- Route: `/categories`
- Service: `CategoryService` with `create()` method

### Data Model
```typescript
{
  name: string;      // Category name
  icon: string;      // Material Icon name
  color: string;     // Hex color code
  type: number;      // 0 = Income, 1 = Expense
}
```

## Future Enhancements (Possible)
- Edit existing categories
- Delete categories (with safety checks)
- User-specific categories
- Category icons grouping
- Recently used colors
- Custom icon upload

## Tips
- Use descriptive names for better organization
- Choose colors that make categories easy to distinguish
- Icons help quickly identify categories in lists
- Keep category names short for better mobile display

---

**Enjoy organizing your finances with custom categories!** 🎯
