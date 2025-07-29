import { Link } from 'react-router-dom';

/**
 * Fallback page shown when no route matches the current URL. It offers a
 * gentle reminder and a link back to the home page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-600">The page you are looking for could not be found.</p>
      <Link to="/" className="text-indigo-600 hover:underline font-medium">
        Return to home
      </Link>
    </div>
  );
}