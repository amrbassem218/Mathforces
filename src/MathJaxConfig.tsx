import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxConfigProps {
  children: React.ReactNode;
}

const MathJaxConfig: React.FC<MathJaxConfigProps> = ({ children }) => {
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  useEffect(() => {
    // Check if MathJax is already loaded
    if (window.MathJax && window.MathJax.typesetPromise) {
      setMathJaxLoaded(true);
      return;
    }

    // Add MathJax configuration object
    window.MathJax = {
      loader: {
        load: ['[tex]/ams', '[tex]/newcommand', '[tex]/html', '[tex]/mhchem', '[tex]/color', '[tex]/physics']
      },
      tex: {
        packages: { 
          '[+]': ['ams', 'newcommand', 'html', 'mhchem', 'color', 'physics']
        },
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        tags: 'ams',
        tagSide: 'right',
        tagIndent: '0.8em',
        multlineWidth: '85%',
        macros: {
          // Add some common LaTeX macros
          RR: '{\\mathbb{R}}',
          NN: '{\\mathbb{N}}',
          ZZ: '{\\mathbb{Z}}',
          QQ: '{\\mathbb{Q}}',
          CC: '{\\mathbb{C}}',
          vec: ['{\\boldsymbol{#1}}', 1],
          mat: ['{\\mathbf{#1}}', 1],
        },
        environments: {
          // Add support for common LaTeX environments
          aligned: ['\\begin{aligned}', '\\end{aligned}'],
          gather: ['\\begin{gather}', '\\end{gather}'],
          equation: ['\\begin{equation}', '\\end{equation}'],
          cases: ['\\begin{cases}', '\\end{cases}'],
          matrix: ['\\begin{matrix}', '\\end{matrix}'],
          pmatrix: ['\\begin{pmatrix}', '\\end{pmatrix}'],
          bmatrix: ['\\begin{bmatrix}', '\\end{bmatrix}'],
        }
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      startup: {
        pageReady: () => {
          console.log('MathJax is loaded and ready');
          setMathJaxLoaded(true);
          return window.MathJax.startup.defaultPageReady();
        }
      }
    };

    // Add MathJax script if it doesn't exist
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    script.id = 'MathJax-script';
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const mathJaxScript = document.getElementById('MathJax-script');
      if (mathJaxScript) {
        mathJaxScript.remove();
      }
    };
  }, []);

  // Create a context to share mathJaxLoaded state
  return (
    <MathJaxContext.Provider value={{ mathJaxLoaded }}>
      {children}
    </MathJaxContext.Provider>
  );
};

// Create a context to share MathJax loading state
export const MathJaxContext = React.createContext<{ mathJaxLoaded: boolean }>({
  mathJaxLoaded: false
});

// Custom hook to use MathJax context
export const useMathJaxContext = () => React.useContext(MathJaxContext);

export default MathJaxConfig;