import Link from "next/link";
import Image from "next/image";
import src from "@/images/logo.png";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-0.5 group">
      <div className="relative w-12 h-12 group-hover:scale-110 hover-effect">
        <Image
          src={src}
          alt="Quick food logo"
          className="object-cover"
          priority
        />
      </div>
      <span className="text-2xl text-foreground font-bold tracking-tight">
        Quick <span className="text-primary">Food</span>
      </span>
    </Link>
  );
};

export default Logo;
