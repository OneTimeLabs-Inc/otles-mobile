import {
  OTMLRenderer,
} from "@onetimelabs/otml";

import type {
  Document,
} from "../types/document";


type Props = {
  document: Document;
};


export default function DocumentReader({
  document,
}: Props) {

  return (

    <section className="mobile-reader">

      <header className="mobile-reader-header">

        <p>
          {document.number}
        </p>

        <h1>
          {document.title}
        </h1>

        <div className="mobile-reader-meta">

          <span>
            Version {document.version}
          </span>

          <span>
            {document.status}
          </span>

        </div>

      </header>

      <article className="mobile-reader-content">

        {
          document.content
            ? (
              <OTMLRenderer
                title=""
                purpose=""
                content={document.content}
              />
            )
            : (
              <p className="mobile-reader-empty">
                This document does not contain content.
              </p>
            )
        }

      </article>

    </section>

  );

}
