# Toast Demo Page

This page demonstrates all the available toast notification methods for create, update, and delete actions in your application.

## 🚀 How to Access

Navigate to: `/dashboard/toast-demo`

## 📱 Features Demonstrated

### 1. **Create Actions**
- ✅ Success Toast - Green success messages
- ❌ Error Toast - Red error messages  
- ℹ️ Info Toast - Blue info messages
- ⚠️ Warning Toast - Orange warning messages
- ⏳ Promise Toast - Loading states with promises

### 2. **Update Actions**
- ✅ Success Toast - Green success messages
- ❌ Error Toast - Red error messages
- ℹ️ Info Toast - Blue info messages
- ⚠️ Warning Toast - Orange warning messages
- ⏳ Promise Toast - Loading states with promises

### 3. **Delete Actions**
- ✅ Success Toast - Green success messages
- ❌ Error Toast - Red error messages
- ℹ️ Info Toast - Blue info messages
- ⚠️ Warning Toast - Orange warning messages
- ⏳ Promise Toast - Loading states with promises

### 4. **Custom Toast Actions**
- 🎯 Custom Toast - With description and action buttons
- 🎉 Custom Icon - With emoji icons
- ⏰ Auto-dismiss - Configurable timing
- 📚 Multiple Toasts - Show multiple toasts simultaneously

## 🛠️ How to Use in Your Code

### Basic Toast Methods

```javascript
import { toast } from 'src/components/snackbar';

// Success messages
toast.success('Item created successfully!');

// Error messages
toast.error('Failed to create item. Please try again.');

// Info messages
toast.info('Creating new item...');

// Warning messages
toast.warning('Item name is required before creating.');

// Default toast
toast('This is a default toast message');
```

### Promise-based Toasts

```javascript
const promise = new Promise((resolve, reject) => {
  // Your async operation here
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve('Operation successful!');
    } else {
      reject('Operation failed');
    }
  }, 2000);
});

toast.promise(promise, {
  loading: 'Processing...',
  success: (data) => data,
  error: (err) => err,
});
```

### Custom Toast Options

```javascript
toast.success('Custom toast!', {
  icon: '🎉',
  description: 'Additional description text',
  duration: 10000, // 10 seconds
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo clicked'),
  },
});
```

## 🎨 Toast Styling

The toasts use your existing theme and are styled with:
- **Success**: Green color with check icon
- **Error**: Red color with danger icon  
- **Warning**: Orange color with triangle icon
- **Info**: Blue color with info icon
- **Default**: Neutral color with no icon

## 📍 Toast Positions

Toasts appear in the **top-right** corner by default, but you can customize:
- `position: 'top-center'`
- `position: 'top-left'`
- `position: 'bottom-right'`
- `position: 'bottom-center'`
- `position: 'bottom-left'`

## ⚡ Performance Tips

1. **Use Promise Toasts** for async operations
2. **Set appropriate durations** for different message types
3. **Limit concurrent toasts** to avoid overwhelming users
4. **Use descriptive messages** that clearly indicate the action result

## 🔧 Integration Examples

### In Forms
```javascript
const handleSubmit = async (data) => {
  try {
    await createItem(data);
    toast.success('Item created successfully!');
  } catch (error) {
    toast.error('Failed to create item: ' + error.message);
  }
};
```

### In Tables
```javascript
const handleDelete = async (id) => {
  try {
    await deleteItem(id);
    toast.success('Item deleted successfully!');
    // Refresh table data
  } catch (error) {
    toast.error('Failed to delete item');
  }
};
```

### In API Calls
```javascript
const handleUpdate = async (id, data) => {
  const promise = updateItem(id, data);
  
  toast.promise(promise, {
    loading: 'Updating item...',
    success: 'Item updated successfully!',
    error: 'Failed to update item',
  });
};
```

## 🎯 Best Practices

1. **Be Specific**: Use clear, actionable messages
2. **Consistent Timing**: Keep success/error toasts visible long enough to read
3. **Appropriate Icons**: Use icons that match the message type
4. **Action Buttons**: Add undo/retry buttons for destructive actions
5. **Loading States**: Show progress for long-running operations

## 🚨 Common Issues

- **Toasts not showing**: Ensure `Snackbar` component is mounted in your layout
- **Multiple toasts**: Use `toast.promise()` to avoid duplicate messages
- **Position conflicts**: Check z-index and positioning in your theme
- **Auto-dismiss**: Set appropriate `duration` values for different message types

---

**Happy Toasting! 🍞✨**
