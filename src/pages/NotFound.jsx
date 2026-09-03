import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center">
        <div className="text-6xl font-extrabold text-slate-900">404</div>
        <p className="text-slate-600 mt-2">Page not found.</p>
        <Link to="/" className="inline-block mt-6"><Button>Back to Home</Button></Link>
      </div>
    </div>
  );
}
