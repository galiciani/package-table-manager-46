
import { useState } from 'react';

export function useTableUISettings() {
  const [showGridLines, setShowGridLines] = useState(false);

  const toggleGridLines = () => {
    setShowGridLines(prev => !prev);
  };

  return {
    showGridLines,
    toggleGridLines
  };
}
