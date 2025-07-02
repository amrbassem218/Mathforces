import katex from "katex";
import "katex/dist/katex.min.css";

// Example usage
const container = document.getElementById("math");
katex.render("c = \\pm\\sqrt{a^2 + b^2}", container);
