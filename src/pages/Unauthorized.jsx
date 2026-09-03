import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">⛔</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">Unauthorized</h1>
        <p className="text-slate-600 mt-2">You don't have permission to access this page. Your role does not allow it.</p>
        <Link to="/" className="inline-block mt-6"><Button>Go Home</Button></Link>
      </div>
    </div>
  );
}
