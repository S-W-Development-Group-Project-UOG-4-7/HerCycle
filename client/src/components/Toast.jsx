import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {

  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md min-w-[300px] ${type === 'success'
          ? 'bg-purple-950/90 border-green-400/50 text-white shadow-green-400/10'
          : 'bg-purple-950/90 border-red-400/50 text-white shadow-red-400/10'
        }`}>

        {/* Icon */}
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        </div>

        {/* Message */}
        <div className="flex-1">
          <h4 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
          <p className="text-purple-200 text-xs">{message}</p>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}