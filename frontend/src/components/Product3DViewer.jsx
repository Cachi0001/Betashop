import { useState } from 'react';
import { Package } from 'lucide-react';

function ProductViewer({ modelUrl, className }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Enhanced product viewer component
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Product Gallery</p>
        </div>
      </div>
    </div>
  );
}

export default ProductViewer;