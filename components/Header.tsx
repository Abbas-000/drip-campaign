'use client';

interface HeaderProps {
  onExport: (format: 'json' | 'jsonl') => void;
  onReload: () => void;
  stats: { totalGuests: number; totalActions: number } | null;
}

export function Header({ onExport, onReload, stats }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Drip Campaign Manager</h1>
            {stats && (
              <div className="ml-6 flex space-x-4 text-sm text-gray-500">
                <span>{stats.totalGuests} guests</span>
                <span>{stats.totalActions} actions</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onReload}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reload Data
            </button>
            
            <div className="relative">
              <button
                onClick={() => onExport('jsonl')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export JSONL
              </button>
            </div>
            
            <button
              onClick={() => onExport('json')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
