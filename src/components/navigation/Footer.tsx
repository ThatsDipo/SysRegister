import { FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <div className="w-full gap-8 flex items-center justify-center mb-4">
      <Link
        label="GitHub"
        href="https://github.com/SysWhiteDev/SysRegister"
        icon={<FaGithub />}
      />
      <Link
        label="Instagram"
        href="https://instagram.com/sys.white"
        icon={<FaInstagram />}
      />
    </div>
  );
}

function Link({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a target="_blank" href={href}>
      <span className="flex hover:underline items-center gap-1 opacity-60 text-sm">
        {icon}
        {label}
      </span>
    </a>
  );
}
