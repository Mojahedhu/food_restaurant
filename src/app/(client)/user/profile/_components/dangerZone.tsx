import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
function DangerZone() {
  return (
    <Card className="border border-destructive!">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="text-destructive! leading-none font-semibold">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all your data
            </p>
          </div>
          <Button
            variant={"destructive"}
            className="text-card bg-destructive/80 hover:text-card hover:bg-destructive"
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DangerZone;
