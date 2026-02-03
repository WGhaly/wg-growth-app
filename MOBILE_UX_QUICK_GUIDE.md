# Mobile UX Quick Reference Guide

## 🎯 For Users

### **How to Use Swipe Actions**

#### On Mobile:
1. **Swipe LEFT** on any card (Goal, Habit, Routine)
   - Shows GREEN action (Complete, Log, Start)
   - Tap the revealed button to execute
   
2. **Swipe RIGHT** on any card
   - Shows RED action (Delete)
   - Tap to delete (with confirmation)

3. **Actions auto-close** after 3 seconds
   - Just swipe again if needed

#### Quick Add Button (FAB):
- Look for the **golden circular button** at bottom-right
- Tap to quickly add new items
- Always visible - no scrolling needed

---

## 🔧 For Developers

### **Applying Mobile Patterns**

#### 1. Add SwipeActions to a Card:

```tsx
import { SwipeActions } from '@/components/ui/SwipeActions';

<SwipeActions
  leftActions={[
    {
      icon: <CheckCircle size={20} />,
      label: 'Complete',
      color: 'green',
      onClick: handleComplete,
    }
  ]}
  rightActions={[
    {
      icon: <Trash2 size={20} />,
      label: 'Delete',
      color: 'red',
      onClick: handleDelete,
    }
  ]}
  className="rounded-lg overflow-hidden"
>
  <Card>
    {/* Your card content */}
  </Card>
</SwipeActions>
```

#### 2. Add FAB to Page:

```tsx
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';

// At end of component, inside return:
<div className="md:hidden">
  <FloatingActionButton
    onClick={() => setIsCreateModalOpen(true)}
    icon={<Plus size={24} />}
  />
</div>
```

#### 3. Responsive Button Pattern:

```tsx
// In header/card:
<div className="hidden md:flex items-center gap-2">
  <button
    onClick={handleAction}
    className="p-2 hover:bg-green-500/10 rounded text-green-400 transition-colors"
    title="Action name"
  >
    <ActionIcon className="w-4 h-4" />
  </button>
</div>
```

---

## 🎨 Color Codes

- **Green** (`'green'`): Primary actions (Complete, Log, Success)
- **Red** (`'red'`): Destructive actions (Delete, Remove)
- **Blue** (`'blue'`): Secondary actions (Edit, Start)
- **Yellow** (`'yellow'`): Warning actions (Archive, Skip)

---

## 📱 Touch Target Sizes

- FAB: **56x56px** (Material Design standard)
- Swipe action buttons: **80px wide**
- Desktop action buttons: **40x40px minimum**

---

## ⚡ Performance Tips

- Swipe actions use `transform` (GPU-accelerated)
- Transition duration: **200ms**
- Auto-close timeout: **3000ms**
- Touch events are optimized

---

## ✅ Completed Components

- [x] GoalCard - Full swipe support
- [x] HabitCard - Full swipe support  
- [x] RoutineCard - Full swipe support
- [x] GoalsClient - FAB added
- [x] HabitsClient - FAB added

---

## 🚀 Next Components to Update

**High Priority:**
- [ ] Finance/AccountCard
- [ ] Relationships/PersonCard
- [ ] Routines page (add FAB)

**Medium Priority:**
- [ ] Identity cards
- [ ] Business components
- [ ] Transaction items

---

## 🐛 Troubleshooting

### Swipe not working?
- Ensure parent has `overflow: hidden`
- Check touch events aren't captured by parent
- Verify `touch-action: pan-y` is set

### FAB not showing on mobile?
- Check `md:hidden` class is present
- Verify z-index (should be 40)
- Confirm bottom positioning (80px from bottom)

### Desktop buttons not showing?
- Check `hidden md:flex` classes
- Verify breakpoint is correct
- Ensure flex gap for spacing

---

**Last Updated**: February 3, 2026
