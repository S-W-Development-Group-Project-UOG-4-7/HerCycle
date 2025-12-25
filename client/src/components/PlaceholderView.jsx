import { Construction } from 'lucide-react';

export default function PlaceholderView({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-up">
      <div className="bg-slate-800 p-6 rounded-full mb-6 border border-slate-700 shadow-lg">
        <Construction className="w-12 h-12 text-secondary" />
      </div>
      <h2 className="text-3xl font-bold font-display text-white mb-2">{title}</h2>
      <p className="text-slate-400 font-sans max-w-md">
        This feature is currently under development. Stay tuned for updates!
      </p>
    </div>
  );
}