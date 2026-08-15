import {
  useState,
} from "react";

import {
  LogOut,
  Search,
  X,
} from "lucide-react";

import type {
  ExplorerCategory,
} from "../types/explorer";

import DocumentTree from "./DocumentTree";


type Props = {
  open: boolean;
  organizationName: string;
  email: string;
  tree: ExplorerCategory[];
  selectedDocumentId: string | null;
  onClose: () => void;
  onDocumentSelect: (documentId: string) => void;
  onSignOut: () => void;
};


function categoryMatches(
  category: ExplorerCategory,
  query: string,
): ExplorerCategory | null {

  const documents =
    category.documents.filter((document) =>
      `${document.code} ${document.title}`
        .toLowerCase()
        .includes(query),
    );

  const children =
    category.children
      .map((child) =>
        categoryMatches(child, query),
      )
      .filter(
        (child): child is ExplorerCategory =>
          child !== null,
      );

  if (
    documents.length === 0 &&
    children.length === 0 &&
    !category.name.toLowerCase().includes(query)
  ) {
    return null;
  }

  return {
    ...category,
    expanded: true,
    documents,
    children,
  };

}


export default function LibraryDrawer({
  open,
  organizationName,
  email,
  tree,
  selectedDocumentId,
  onClose,
  onDocumentSelect,
  onSignOut,
}: Props) {

  const searchInputId =
    "otles-mobile-library-search";


  return (

    <>

      <div
        className={
          `mobile-drawer-backdrop ${open ? "open" : ""}`
        }
        onClick={onClose}
      />

      <aside
        className={
          `mobile-drawer ${open ? "open" : ""}`
        }
        aria-hidden={!open}
      >

        <div className="mobile-drawer-header">

          <div>
            <strong>OTLES</strong>
            <span>{organizationName}</span>
          </div>

          <button
            type="button"
            className="mobile-drawer-close"
            aria-label="Close library"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>

        <DrawerSearch
          inputId={searchInputId}
          tree={tree}
          selectedDocumentId={selectedDocumentId}
          onDocumentSelect={onDocumentSelect}
        />

        <div className="mobile-drawer-account">

          <span>{email}</span>

          <button
            type="button"
            onClick={onSignOut}
          >
            <LogOut size={15} />
            Sign out
          </button>

        </div>

      </aside>

    </>

  );

}


function DrawerSearch({
  inputId,
  tree,
  selectedDocumentId,
  onDocumentSelect,
}: {
  inputId: string;
  tree: ExplorerCategory[];
  selectedDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
}) {

  const [
    query,
    setQuery,
  ] = useState("");


  const normalized =
    query.trim().toLowerCase();


  const filteredTree =
    normalized
      ? tree
          .map((category) =>
            categoryMatches(
              category,
              normalized,
            ),
          )
          .filter(
            (
              category,
            ): category is ExplorerCategory =>
              category !== null,
          )
      : tree;


  return (

    <>

      <label
        className="mobile-drawer-search"
        htmlFor={inputId}
      >

        <Search size={16} />

        <input
          id={inputId}
          type="search"
          placeholder="Search documentation"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

      </label>

      <div className="mobile-drawer-tree">

        {
          filteredTree.length > 0
            ? (
              <DocumentTree
                nodes={filteredTree}
                selectedDocumentId={
                  selectedDocumentId
                }
                onDocumentSelect={
                  onDocumentSelect
                }
              />
            )
            : (
              <p className="mobile-search-empty">
                No matching documents.
              </p>
            )
        }

      </div>

    </>

  );

}
