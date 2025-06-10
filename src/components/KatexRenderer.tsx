// KaTeXRenderer.tsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';
// import 
interface KaTeXRendererProps {
  expression: string;
  displayMode?: boolean;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({expression}) => {
  let element = useRef<HTMLDivElement>(null);
  expression = expression
    .replace(/\\mbox/g, '\\text')
    .replace(/\\rm/g, '\\mathrm')
    .replace(/\\bf/g, '\\mathbf')
    .replace(/\\it/g, '\\mathit')
    .replace(/\\choose/g, '\\binom');
    try {
      useEffect(()=>{
          
        if(element.current){
          renderMathInElement(element.current, {
            delimiters: [
              {left: "$$", right: "$$", display: true},
              {left: "$", right: "$", display: false},
              {left: "``", right: "''", display: false},
              {left: "\\[", right: "\\]", display: true},
              {left: "\\(", right: "\\)", display: false}
            ]
          })
        }
      },[expression])
      return <div ref={element}>{expression}</div>
  } catch (error) {
    return <span>Couldn't render Problem</span>;
  }
};

export default KaTeXRenderer;
