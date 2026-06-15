import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

function ContactInfo() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="">
        <CardTitle className="font-semibold text-lg">
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="mb-1 font-medium">Address</h4>
            <p className="text-sm text-muted-foreground">
              123 Food Street
              <br />
              Culinary City, FC 12345
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="mb-1 font-medium">Phone</h4>
            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="mb-1 font-medium">Email</h4>
            <p className="text-sm text-muted-foreground">
              support@quickfood.com
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="mb-1 font-medium">Business Hours</h4>
            <p className="text-sm text-muted-foreground">
              Mon - Fri: 9:00 AM - 10:00 PM
              <br />
              Sat - Sun: 10:00 AM - 11:00 PM
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactInfo;
