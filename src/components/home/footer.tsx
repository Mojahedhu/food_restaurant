import Link from "next/link";
import Container from "../common/container";
import Logo from "../common/logo";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { FOOTER_LINKS } from "@/constants/statics";
import { cn } from "@/lib/utils";

const Footer = () => {
  const socialLinks = [
    {
      href: "#",
      icon: <Facebook className="h-5 w-5" />,
      label: "Facebook",
    },
    {
      href: "#",
      icon: <Twitter className="h-5 w-5" />,
      label: "Twitter",
    },
    {
      href: "#",
      icon: <Instagram className="h-5 w-5" />,
      label: "Instagram",
    },
  ];

  const contactInfo = [
    {
      title: "+123 456 7890",
      icon: <Phone className="h-5 w-5 text-primary shrink-0" />,
      href: "tel:+1234567890",
    },
    {
      title: "hello@quickfood.com",
      icon: <Mail className="h-5 w-5 text-primary shrink-0" />,
      href: "mailto:hello@quickfood.com",
    },
  ];

  return (
    <div className="bg-muted border-t border-border font-sans">
      <Container className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:pag-10 px-4 py-12 lg:py-16">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="text-muted-foreground leading-relaxed max-w-xs">
            We deliver organic, fresh, and healthy food to your doorstep. Our
            mission is to provide the best quality food for your healthy life.
          </p>
          <div className="flex space-x-3 pt-2">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm hover:text-primary hover:bg-primary/10 hover:shadow-md transition-all"
                aria-label={link.label}
              >
                {link.icon}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 md:mb-6 text-base lg:text-lg font-bold text-foreground uppercase tracking-wide">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2">
            {FOOTER_LINKS?.map((link) => (
              <li
                key={link.label}
                className="text-muted-foreground font-medium hover:text-primary transition-colors  inline-block hover-effect"
              >
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 md:mb-6 text-base lg:text-lg font-bold text-foreground uppercase tracking-wide">
            Opening Hours
          </h3>
          <ul className="space-y-2 lg:space-y-3 text-sm lg:text-base">
            <li className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Mon - Fri</span>
              <span className="font-semibold text-foreground whitespace-nowrap">
                8:00 AM - 6:00 PM
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Saturday</span>
              <span className="font-semibold text-foreground whitespace-nowrap">
                9:00 AM - 5:00 PM
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Sunday</span>
              <span className="font-semibold text-foreground whitespace-nowrap">
                10:00 AM - 4:00 PM
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 md:mb-6 text-base lg:text-lg font-bold text-foreground uppercase tracking-wide">
            Contact Us
          </h3>
          <ul className="space-y-3 lg:space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm lg:text-base">
                123 Main St, Green City, South Carolina, USA
              </span>
            </li>
            {contactInfo.map((contact, index) => (
              <li key={contact.title} className="flex items-center gap-3">
                {contact.icon}
                <Link
                  href={contact.href}
                  className={cn(
                    "text-muted-foreground hover:text-primary transition-colors hover-effect",
                    index == 0 && "font-semibold",
                  )}
                >
                  {contact.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="py-10 border-t border-border">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} QuickFood. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;
