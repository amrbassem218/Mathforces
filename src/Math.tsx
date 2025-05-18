import React, { useEffect, useRef } from 'react';
import { useMathJaxContext } from './MathJaxConfig';

interface MathProps {
  math: string;
  display?: boolean;
}

const Math: React.FC<MathProps> = ({ math, display = false }) => {
  const mathRef = useRef<HTMLSpanElement>(null);
  const { mathJaxLoaded } = useMathJaxContext();

  // Helper function to check if LaTeX commands are properly escaped
  const validateLatexCommands = (text: string): string => {
    // Common LaTeX commands that need escaping
    const commands = ['frac', 'sqrt', 'int', 'sum', 'pm', 'infty', 'alpha', 'beta', 'gamma'];
    let validatedText = text;

    commands.forEach(cmd => {
      // Check for unescaped commands
      const unescapedPattern = new RegExp(`\\\\${cmd}(?!\\\\)`, 'g');
      if (unescapedPattern.test(text)) {
        console.warn(`Warning: The LaTeX command '\\${cmd}' should be escaped as '\\\\${cmd}'`);
        // Auto-fix the escaping
        validatedText = validatedText.replace(unescapedPattern, `\\\\${cmd}`);
      }
    });

    return validatedText;
  };

  useEffect(() => {
    if (!mathJaxLoaded || !mathRef.current) return;

    try {
      // Validate and potentially fix LaTeX commands
      const validatedMath = validateLatexCommands(math);
      
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise([mathRef.current])
          .catch((err: any) => {
            console.error('MathJax error:', err);
            // Add error class to show something is wrong
            if (mathRef.current) {
              mathRef.current.classList.add('mathjax-error');
            }
          });
      } else {
        console.warn('MathJax is not fully loaded yet or typesetPromise is not available');
      }
    } catch (error) {
      console.error('Error typesetting math:', error);
    }
  }, [math, mathJaxLoaded]);

  const content = display ? `$$${math}$$` : `$${math}$`;

  return (
    <span 
      ref={mathRef}
      style={{ 
        display: display ? 'block' : 'inline',
      }}
      className="math-container"
    >
      {content}
    </span>
  );
};

export default Math;