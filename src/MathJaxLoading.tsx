import React from 'react';
import { useMathJaxContext } from './MathJaxConfig';

interface MathJaxLoadingProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const MathJaxLoading: React.FC<MathJaxLoadingProps> = ({ 
  fallback = <div>Loading MathJax...</div>,
  children 
}) => {
  const { mathJaxLoaded } = useMathJaxContext();
  
  if (!mathJaxLoaded) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default MathJaxLoading;