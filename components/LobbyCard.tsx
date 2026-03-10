import Link from "next/link";

interface LobbyCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  href?: string;
  onClick?: () => void;
}

export function LobbyCard({
  title,
  description,
  icon,
  buttonText,
  href,
  onClick,
}: LobbyCardProps) {
  const btn = (
    <button
      onClick={!href ? onClick : undefined}
      className="mt-auto bg-blue-500 text-navy-900 font-semibold px-6 py-3 rounded-lg hover:bg-blue-400 transition-colors cursor-pointer"
    >
      {buttonText}
    </button>
  );

  return (
    <div className="w-full md:w-80 bg-navy-800 blue-border rounded-xl p-8 card-glow hover:-translate-y-1 transition-transform duration-200 flex flex-col items-center text-center gap-5">
      <span className="text-5xl">{icon}</span>
      <h2 className="font-display text-blue-500 text-2xl">{title}</h2>
      <p className="text-smoke text-sm leading-relaxed">{description}</p>
      {href ? <Link href={href}>{btn}</Link> : btn}
    </div>
  );
}
