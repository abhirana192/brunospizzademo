import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-cream-100">
      <div className="text-7xl mb-4">🍕</div>
      <h1 className="font-display text-3xl font-bold text-charcoal-900">Page not found</h1>
      <p className="text-charcoal-500 mt-2">We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
