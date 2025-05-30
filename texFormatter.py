import re
import sys

def convert_mbox_with_nested_math(latex_string: str) -> str:
    pattern_with_math = r'\\mbox{([^$]*)\$([^$]*)\$([^}]*)}'

    replacement_with_math = r'\\text{\g<1>}\g<2>\\text{\g<3>}'

    processed_string = re.sub(pattern_with_math, replacement_with_math, latex_string, flags=re.DOTALL)

    pattern_no_math = r'\\mbox{([^}]*)}'
    replacement_no_math = r'\\text{\g<1>}'
    processed_string = re.sub(pattern_no_math, replacement_no_math, processed_string, flags=re.DOTALL)

    processed_string = re.sub(r'\\text{}\s*', '', processed_string)


    return processed_string

def format_tex(tex_text):
    # Match only the main \begin{itemize}...\end{itemize} block
    itemize_match = re.search(r'\\begin{itemize}(.*?)\\end{itemize}', tex_text, re.DOTALL)
    if not itemize_match:
        return convert_mbox_with_nested_math(tex_text)

    before = tex_text[:itemize_match.start()]
    itemize_content = itemize_match.group(1)
    after = tex_text[itemize_match.end():]

    itemize_content = convert_mbox_with_nested_math(itemize_content)

    itemize_content = re.sub(r'(\\begin{enumerate})', r'\n\1\n', itemize_content)
    itemize_content = re.sub(r'(\\end{enumerate})', r'\n\1\n', itemize_content)

    parts = re.split(r'(\\item\[[^\]]+\])', itemize_content)
    flattened = []

    i = 1  # skip preamble
    while i < len(parts):
        item_header = parts[i].strip()
        item_body = parts[i + 1].strip() if i + 1 < len(parts) else ''
        i += 2

        item_body = re.sub(r'\s*\n\s*', ' ', item_body)  # remove line breaks
        item_body = re.sub(r'\s+', ' ', item_body).strip()  # remove multiple spaces

        item_body = re.sub(r'(\\begin{enumerate})', r'\n\1\n', item_body)
        item_body = re.sub(r'(\\end{enumerate})', r'\n\1\n', item_body)

        flattened.append(f'{item_header} {item_body}')

    new_itemize = "\\begin{itemize}\n\n" + "\n\n".join(flattened) + "\n\n\\end{itemize}"
    result = before + new_itemize + after

    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python flatten_tex_items.py input.tex > output.tex")
        sys.exit(1)

    input_file = sys.argv[1]
    with open(input_file, 'r', encoding='utf-8') as f:
        tex_data = f.read()
    result = format_tex(tex_data)
    print(result)




