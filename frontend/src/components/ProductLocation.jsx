import { MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

function ProductLocation({ location, className = "" }) {
  if (!location || (!location.city && !location.state)) {
    return null;
  }

  const formatLocation = () => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country && location.country !== 'Nigeria') parts.push(location.country);
    return parts.join(', ');
  };

  return (
    <div className={`flex items-center gap-1 text-sm text-gray-600 ${className}`}>
      <MapPin className="w-4 h-4" />
      <span>{formatLocation()}</span>
    </div>
  );
}

export function ProductLocationBadge({ location, className = "" }) {
  if (!location || (!location.city && !location.state)) {
    return null;
  }

  const formatLocation = () => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.join(', ');
  };

  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      <MapPin className="w-3 h-3 mr-1" />
      {formatLocation()}
    </Badge>
  );
}

export default ProductLocation;