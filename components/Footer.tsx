import { ShieldLockIcon } from "@/components/icons/ShieldLockIcon";

export function Footer() {
  return (
    <footer className="w-full bg-navy-800/50 border-t border-blue-600/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <p className="text-smoke text-sm">
          &copy; 2025 Liars Table
        </p>
        <p className="text-smoke text-sm flex items-center gap-1.5">
          <ShieldLockIcon size={16} />
          Powered by{" "}
          <span className="text-blue-500 font-medium">Inco</span> FHE
        </p>
      </div>
    </footer>
  );
}
