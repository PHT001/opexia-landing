import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-[#007AFF] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#111] mb-3">Page introuvable</h1>
        <p className="text-[#6B7280] mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-[#007AFF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0055D4] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
