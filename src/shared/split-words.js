import { CLASS_WORD } from '../constants.js';

/**
 * Wraps every word of an element's text in its own span so words can animate separately.
 * @param {HTMLElement} element
 * @returns {HTMLSpanElement[]}
 */
export function splitWords(element) {
  const words = element.textContent.trim().split(/\s+/);
  element.setAttribute('aria-label', words.join(' '));
  element.textContent = '';

  return words.map((word, index) => {
    const span = document.createElement('span');
    span.className = CLASS_WORD;
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    element.append(span);
    if (index < words.length - 1) element.append(' ');
    return span;
  });
}
