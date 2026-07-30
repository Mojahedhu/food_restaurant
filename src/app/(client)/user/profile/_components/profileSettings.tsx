import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ProfileSettings() {
  return (
    <Card>
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold">
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive updates about your orders and promotions
            </p>
          </div>
          <Button variant={"outline"}>Manage</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-muted-foreground">
              Change your password to keep your account secure
            </p>
          </div>
          <Button variant={"outline"}>Change</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Button variant={"outline"} className="px-3.5">
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileSettings;
