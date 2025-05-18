import { useEffect } from 'react';
import { useMathJaxContext } from './MathJaxConfig';

const useMathJax = (deps: React.DependencyList = []) => {
  const { mathJaxLoaded } = useMathJaxContext();

  useEffect(() => {
    if (!mathJaxLoaded) return;

    try {
      // Use typeset method which is more reliably available
      if (window.MathJax && typeof window.MathJax.typeset === 'function') {
        window.MathJax.typeset();
      } else {
        console.log('MathJax is not fully loaded yet or typeset is not available');
      }
    } catch (error) {
      console.error('Error running MathJax typeset:', error);
    }
  }, [mathJaxLoaded, ...deps]);
};

export default useMathJax;