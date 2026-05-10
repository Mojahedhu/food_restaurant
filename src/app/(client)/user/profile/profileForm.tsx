import { useEffect, useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { User } from "../../../../../types/sanityTypes";

import { getUserImage } from "@/lib/utils";
import ProfileImageForm from "./profileImageForm";
import { UpdateProfilePayload } from "./action";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  user: User;
  open: boolean;
  setOpen: (value: boolean) => void;
  onUpdate: (payload: UpdateProfilePayload) => Promise<void>;
}
const BIO_LIMIT = 200;

const ProfileForm = ({ user, open, setOpen, onUpdate }: ProfileFormProps) => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<User>(user);

  const [previewUrl, setPreviewUrl] = useState(getUserImage(user) || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  /* reset form every time modal opens */
  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(user);
    setImageFile(null);
    setPreviewUrl(getUserImage(user) || "");
  }, [open, user]);

  const originalImage = getUserImage(user) || "";
  const hasChanges =
    form.name !== user.name ||
    form.email !== user.email ||
    form.phoneNumber !== user.phoneNumber ||
    previewUrl !== originalImage ||
    imageFile !== null ||
    form.bio !== user.bio;

  const name = user.name;
  const isAdmin = user?.role?._ref === "admin";

  const submit = () => {
    if (!hasChanges) return;
    startTransition(async () => {
      await onUpdate({
        _id: user._id,
        name: form.name!,
        email: form.email!,
        phoneNumber: form.phoneNumber!,
        bio: form.bio,
        imageFile,
        imageUrl: { url: previewUrl, source: "url" },
      });
    });
  };

  const closeForm = () => {
    if (pending) return;
    setOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="md:max-w-2xl lg:max-w-4xl w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader className="space-y-2 text-center sm:text-left p-0 gap-0">
          <SheetTitle className="text-lg font-semibold">
            Edit Profile
          </SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <form
          className="space-y-6 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <ProfileImageForm
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              setImageFile={setImageFile}
              user={user}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="name"
              placeholder="Enter your full name"
              required
              value={form.name || ""}
              onChange={handleChange}
              name="name"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="email"
              placeholder="your.email@example.com"
              required
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              name="email"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll send order updates to this email
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="phone"
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={form.phoneNumber || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              For delivery notifications and updates
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="bio"
            >
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={200}
              value={form.bio || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
            ></textarea>
            <p className="text-xs text-muted-foreground text-right">
              {(form.bio || "").length}/{BIO_LIMIT}
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="role"
            >
              Account Role
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize"
              id="role"
              disabled
              value={form?.role?._ref || ""}
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your role
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
            <Button
              type="button"
              onClick={closeForm}
              className="py-2 px-4"
              variant={"outline"}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              disabled={pending || !hasChanges}
              className="py-2 px-4"
              type="submit"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileForm;
