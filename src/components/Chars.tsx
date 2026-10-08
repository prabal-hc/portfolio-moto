import { Fragment } from "react";

/**
 * Headline split into letters for the rise-in animation, with each word kept whole: letters sit in a
 * no-wrap word span, and the spaces between words stay real spaces, so lines only ever break between words.
 */
export default function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span className="word" aria-hidden>
            {[...w].map((c, ci) => (
              <span key={ci} className="ch">
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}
