import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">School Management SaaS</h1>
        <p className="mt-4 text-muted-foreground">Multi-tenant platform for schools</p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded border border-primary px-6 py-2 text-primary hover:bg-primary/10"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
