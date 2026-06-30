# Implementation Plan: User Anonymization & Soft Delete (Strategy A)

This plan details the implementation of a secure, privacy-compliant (GDPR/CCPA) "Delete User" action using a **soft delete and anonymization pattern** (Strategy A).

This strategy erases the user's personally identifiable information (PII) while preserving database referential integrity and transaction histories (orders/invoices) for accounting purposes.

**No files in the workspace have been modified.**

---

## 1. Architectural Flow

---

## 2. Proposed Changes

### A. Server Actions: `src/actions/admin-users.ts`

We will add a new server action `deleteUserAction` and update the search/fetch action `fetchAdminUsersPaged` to filter out soft-deleted accounts.

#### 1. Add `deleteUserAction`

This action asserts admin privileges, checks for self-deletion attempts, parses inputs using Zod, erases PII, and sets the `isDeleted: true` flag.

```typescript
const DeleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export async function deleteUserAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  // 1. Enforce Admin verification
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  // 2. Validate input parameters via Zod
  const parsed = DeleteUserSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid User ID structure" };
  }

  const { userId } = parsed.data;

  try {
    // 3. Admin Edge Case: Prevent operators from deleting themselves
    const session = await auth();
    const operatorId = session?.user?.id;

    if (operatorId && operatorId === userId) {
      return {
        success: false,
        error:
          "Action Denied: You cannot delete your own administrative account.",
      };
    }

    // 4. Perform GDPR-compliant anonymization patch
    await client
      .patch(userId)
      .set({
        name: "Deleted Account",
        email: `deleted-${userId.slice(0, 8)}@disabled-account.com`,
        phoneNumber: "",
        bio: "",
        walletBalance: 0,
        image: null,
        isDeleted: true,
      })
      .commit();

    // 5. Force Next.js cache revalidation for users
    revalidateTag("users", "max");
    return { success: true };
  } catch (error) {
    // Log raw error internally and return clean message to the client
    console.error(`Failed to soft-delete user ${userId} in Sanity:`, error);
    return {
      success: false,
      error: "Failed to delete user account due to a database error.",
    };
  }
}
```

#### 2. Update `fetchAdminUsersPaged` Filter Clause

Update the GROQ query filter clause (around line 55) to exclude deleted user documents from the active users list.

```typescript
// From:
let filterClauses = `_type == "user"`;

// To:
let filterClauses = `_type == "user" && !isDeleted`;
```

---

### B. Custom Hook: `src/hooks/useUsersLogic.ts`

Extend the hook to add a local state for deleted users and the transition handler.

- **deletedUserIds Set:** Local state tracking optimistically deleted IDs.
- **List Filter:** Filters the computed users array returned to the UI.
- **Rollback Handler:** Removes the ID from the set if the server action fails.

```typescript
// 1. Add deleted IDs state inside useUsersLogic:
const [deletedUserIds, setDeletedUserIds] = useState<Set<string>>(new Set());

// 2. Filter the users array inside useUsersLogic:
const users = (initialUsers || [])
  .filter((user) => !deletedUserIds.has(user._id))
  .map((user) => {
    const update = localUpdates[user._id];
    return update ? { ...user, ...update } : user;
  });

// 3. Implement handleDeleteUser transition:
const handleDeleteUser = async (userId: string) => {
  // Optimistically hide the user from view instantly
  setDeletedUserIds((prev) => {
    const next = new Set(prev);
    next.add(userId);
    return next;
  });

  startTransition(async () => {
    const result = await deleteUserAction({ userId });

    if (result.success) {
      toast.success("User account deleted successfully.");
    } else {
      toast.error(result.error || "Failed to delete user. Reverting changes.");
      // Rollback optimistic update on failure
      setDeletedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  });
};

// 4. Return new properties in the hook's return statement:
return {
  users,
  isPending,
  handleUpdateRole,
  handleSaveDetails,
  handleAdjustWallet,
  handleDeleteUser, // Return deletion handler
};
```

---

### C. UI Component: `src/components/admin/features/users/usersTable.tsx`

Update the user management table to provide the delete trigger button and confirm prompt.

- **deletingUser State:** Tracks which user is queued in the dialog.
- **Trash Action Button:** Rendered in the Actions column next to the Edit button.
- **AlertDialog Dialog:** confirmation box mapping user info.

```tsx
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Inside UsersTable:
// 1. Track which user is queued for deletion
const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);

// 2. Add Delete Button inside Actions column (next to Edit button, line 138+):
<TableCell className="text-right pr-4 flex justify-end gap-2">
  {/* Edit Button */}
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setSelectedUser(user)}
    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
    disabled={isPending}
  >
    <Edit className="size-4" />
  </Button>

  {/* Trash/Delete Button */}
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setDeletingUser(user)}
    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
    disabled={isPending}
  >
    <Trash2 className="size-4" />
  </Button>
</TableCell>

// 3. Add AlertDialog component at the bottom of the table container:
<AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the account of <strong>{deletingUser?.name || "Unnamed"}</strong> ({deletingUser?.email}) from the active users list. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        disabled={isPending}
        onClick={async () => {
          if (deletingUser) {
            await handleDeleteUser(deletingUser._id);
            setDeletingUser(null);
          }
        }}
      >
        {isPending ? "Deleting..." : "Confirm Delete"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 3. Adherence to `plan.md`

| Section in `plan.md`          | Compliance Strategy                                                                      |
| :---------------------------- | :--------------------------------------------------------------------------------------- |
| **Backend Enforcement**       | Uses server action `deleteUserAction` for mutations.                                     |
| **Zero-Trust Role Check**     | Protected with `assertAdmin()` before making mutations.                                  |
| **Self-Deletion Guard**       | Prevents lockouts by validating `operatorId !== userId`.                                 |
| **Zod Validation**            | Validated via `DeleteUserSchema.safeParse()` to prevent crash vectors.                   |
| **Error Obfuscation**         | Logs internal db errors inside `try/catch` and returns a sanitized user-friendly string. |
| **Optimistic State updates**  | State-driven filtering keeps list mutations feeling instantaneous.                       |
| **UX Polish & Layout shifts** | Uses loading locks and custom confirmation alert boxes.                                  |
| **Cache Sync**                | Purges cache tags on change using `revalidateTag("users")`.                              |
