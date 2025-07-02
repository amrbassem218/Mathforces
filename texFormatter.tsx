function convertMboxWithNestedMath(latexString: string): string {
  const patternWithMath = /\\mbox\{([^$]*)\$([^$]*)\$([^}]*)\}/gs;
  const replacementWithMath = "\\text{$1}$2\\text{$3}";

  let processedString = latexString.replace(
    patternWithMath,
    replacementWithMath,
  );

  const patternNoMath = /\\mbox\{([^}]*)\}/g;
  const replacementNoMath = "\\text{$1}";
  processedString = processedString.replace(patternNoMath, replacementNoMath);

  processedString = processedString.replace(/\\text\{\}\s*/g, "");

  return processedString;
}

function formatTex(texText: string): string {
  const itemizeMatch = texText.match(
    /\\begin\{itemize\}(.*?)\\end\{itemize\}/s,
  );
  if (!itemizeMatch) {
    return convertMboxWithNestedMath(texText);
  }

  const before = texText.substring(0, itemizeMatch.index!);
  let itemizeContent = itemizeMatch[1];
  const after = texText.substring(itemizeMatch.index! + itemizeMatch[0].length);

  itemizeContent = convertMboxWithNestedMath(itemizeContent);

  itemizeContent = itemizeContent.replace(/(\\begin\{enumerate\})/g, "\n$1\n");
  itemizeContent = itemizeContent.replace(/(\\end\{enumerate\})/g, "\n$1\n");

  const parts = itemizeContent.split(/(\\item\[[^\]]+\])/);
  const flattened: string[] = [];

  let i = 1; // skip preamble
  while (i < parts.length) {
    const itemHeader = parts[i].trim();
    const itemBody = (i + 1 < parts.length ? parts[i + 1] : "").trim();
    i += 2;

    let processedBody = itemBody.replace(/\s*\n\s*/g, " "); // remove line breaks
    processedBody = processedBody.replace(/\s+/g, " ").trim(); // remove multiple spaces

    processedBody = processedBody.replace(/(\\begin\{enumerate\})/g, "\n$1\n");
    processedBody = processedBody.replace(/(\\end\{enumerate\})/g, "\n$1\n");

    flattened.push(`${itemHeader} ${processedBody}`);
  }

  const newItemize =
    "\\begin{itemize}\n\n" + flattened.join("\n\n") + "\n\n\\end{itemize}";
  const result = before + newItemize + after;

  return result;
}

export { convertMboxWithNestedMath, formatTex };
