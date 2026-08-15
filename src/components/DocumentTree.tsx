import {
  useEffect,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";

import type {
  ExplorerCategory,
} from "../types/explorer";


type Props = {
  nodes: ExplorerCategory[];
  selectedDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
  depth?: number;
};


export default function DocumentTree({
  nodes,
  selectedDocumentId,
  onDocumentSelect,
  depth = 0,
}: Props) {

  return (

    <div className="mobile-tree">

      {
        nodes.map((category) => (

          <CategoryNode
            key={category.id}
            category={category}
            depth={depth}
            selectedDocumentId={
              selectedDocumentId
            }
            onDocumentSelect={
              onDocumentSelect
            }
          />

        ))
      }

    </div>

  );

}


function CategoryNode({
  category,
  depth,
  selectedDocumentId,
  onDocumentSelect,
}: {
  category: ExplorerCategory;
  depth: number;
  selectedDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
}) {

  const [
    open,
    setOpen,
  ] =
    useState(category.expanded);


  useEffect(() => {

    if (category.expanded) {
      setOpen(true);
    }

  }, [category.expanded]);


  const hasChildren =
    category.documents.length > 0 ||
    category.children.length > 0;


  return (

    <div className="mobile-tree-category">

      <button
        type="button"
        className="mobile-tree-category-row"
        style={{
          paddingLeft:
            `${14 + depth * 18}px`,
        }}
        onClick={() =>
          setOpen((current) => !current)
        }
      >

        {
          hasChildren
            ? open
              ? <ChevronDown size={14} />
              : <ChevronRight size={14} />
            : (
              <span className="mobile-tree-chevron-spacer" />
            )
        }

        {
          open
            ? <FolderOpen size={16} />
            : <Folder size={16} />
        }

        <span>{category.name}</span>

      </button>

      {
        open && (

          <>

            {
              category.documents.map((document) => (

                <button
                  key={document.id}
                  type="button"
                  className={
                    `mobile-tree-document ${
                      selectedDocumentId === document.id
                        ? "selected"
                        : ""
                    }`
                  }
                  style={{
                    paddingLeft:
                      `${36 + depth * 18}px`,
                  }}
                  onClick={() =>
                    onDocumentSelect(document.id)
                  }
                >

                  <FileText size={15} />

                  <span>
                    <small>{document.code}</small>
                    {document.title}
                  </span>

                </button>

              ))
            }

            {
              category.children.length > 0 && (

                <DocumentTree
                  nodes={category.children}
                  depth={depth + 1}
                  selectedDocumentId={
                    selectedDocumentId
                  }
                  onDocumentSelect={
                    onDocumentSelect
                  }
                />

              )
            }

          </>

        )
      }

    </div>

  );

}
