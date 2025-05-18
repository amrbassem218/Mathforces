import React, { useEffect, useRef } from 'react';
import { useMathJaxContext } from './MathJaxConfig';

interface MathContentProps {
  content: string;
}

const MathContent: React.FC<MathContentProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { mathJaxLoaded } = useMathJaxContext();
  
  useEffect(() => {
    if (!mathJaxLoaded || !contentRef.current) return;
    
    try {
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise([contentRef.current])
          .catch((err: any) => console.error('MathJax error:', err));
      } else {
        console.warn('MathJax is not fully loaded yet or typesetPromise is not available');
      }
    } catch (error) {
      console.error('Error typesetting content:', error);
    }
  }, [content, mathJaxLoaded]);
  
  return (
    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default MathContent;