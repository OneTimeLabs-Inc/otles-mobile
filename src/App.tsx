import {
  useEffect,
  useState,
} from "react";

import "./App.css";

import {
  useAuthContext,
} from "./contexts/AuthContext";

import {
  signOut,
} from "./services/auth";

import {
  getCurrentWorkspace,
  type CurrentWorkspace,
} from "./services/workspace";

import {
  getDocument,
  getExplorerTree,
} from "./services/document";

import type {
  Document,
} from "./types/document";

import type {
  ExplorerCategory,
} from "./types/explorer";

import DocumentReader from "./components/DocumentReader";
import LibraryDrawer from "./components/LibraryDrawer";
import MobileHeader from "./components/MobileHeader";

import Login from "./pages/Login";


const LAST_DOCUMENT_KEY =
  "otles-mobile-last-document";


function getRequestedDocumentId(): string | null {

  const match =
    window.location.pathname.match(
      /^\/document\/([^/]+)\/?$/,
    );

  return match
    ? decodeURIComponent(
        match[1],
      )
    : null;

}


export default function App() {

  const {
    isLoading,
    user,
  } =
    useAuthContext();


  const [
    workspace,
    setWorkspace,
  ] =
    useState<CurrentWorkspace | null>(null);


  const [
    tree,
    setTree,
  ] =
    useState<ExplorerCategory[]>([]);


  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<Document | null>(null);


  const [
    drawerOpen,
    setDrawerOpen,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  async function openDocument(
    documentId: string,
    updateUrl = true,
  ) {

    setLoading(true);
    setError("");


    try {

      const document =
        await getDocument(documentId);


      setSelectedDocument(document);

      localStorage.setItem(
        LAST_DOCUMENT_KEY,
        documentId,
      );

      if (updateUrl) {

        window.history.pushState(
          {},
          "",
          `/document/${documentId}`,
        );

      }

      setDrawerOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });

    }
    catch (loadError) {

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the document.",
      );

    }
    finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    if (!user) {

      setWorkspace(null);
      setTree([]);
      setSelectedDocument(null);

      return;

    }


    async function initialize() {

      setLoading(true);
      setError("");


      try {

        const currentWorkspace =
          await getCurrentWorkspace();


        setWorkspace(currentWorkspace);


        const workspaceId =
          currentWorkspace
            ?.organization
            ?.otles_workspaces
            ?.[0]
            ?.id;


        if (!workspaceId) {
          return;
        }


        const explorerTree =
          await getExplorerTree(workspaceId);


        setTree(explorerTree);


        const requestedDocumentId =
          getRequestedDocumentId();


        const documentIdToOpen =
          requestedDocumentId ??
          localStorage.getItem(
            LAST_DOCUMENT_KEY,
          );


        if (documentIdToOpen) {

          try {

            const initialDocument =
              await getDocument(
                documentIdToOpen,
              );


            setSelectedDocument(
              initialDocument,
            );


            localStorage.setItem(
              LAST_DOCUMENT_KEY,
              documentIdToOpen,
            );

          }
          catch {

            if (!requestedDocumentId) {

              localStorage.removeItem(
                LAST_DOCUMENT_KEY,
              );

            }

            if (requestedDocumentId) {

              setError(
                "This document could not be opened. It may not exist or you may not have access to it.",
              );

            }

          }

        }

      }
      catch (loadError) {

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load OTLES.",
        );

      }
      finally {

        setLoading(false);

      }

    }


    void initialize();

  }, [user]);


  if (isLoading) {

    return (

      <main className="mobile-loading">

        <div className="mobile-loading-mark">
          O
        </div>

        <p>Loading OTLES...</p>

      </main>

    );

  }


  if (!user) {
    return <Login />;
  }


  const organizationName =
    workspace?.organization?.name ??
    "OTLES";


  return (

    <main className="mobile-shell">

      <MobileHeader
        onMenu={() =>
          setDrawerOpen(true)
        }
      />

      <LibraryDrawer
        open={drawerOpen}
        organizationName={
          organizationName
        }
        email={
          user.email ?? ""
        }
        tree={tree}
        selectedDocumentId={
          selectedDocument?.id ?? null
        }
        onClose={() =>
          setDrawerOpen(false)
        }
        onDocumentSelect={(documentId) => {
          void openDocument(documentId);
        }}
        onSignOut={() => {
          void signOut();
        }}
      />

      {
        loading && (

          <div className="mobile-library-state">

            <div className="mobile-loading-mark">
              O
            </div>

            <p>Loading documentation...</p>

          </div>

        )
      }

      {
        !loading &&
        error && (

          <section className="mobile-reader">

            <div className="mobile-workspace-error">
              <strong>OTLES error</strong>
              <p>{error}</p>
            </div>

          </section>

        )
      }

      {
        !loading &&
        !error &&
        selectedDocument && (

          <DocumentReader
            document={selectedDocument}
          />

        )
      }

      {
        !loading &&
        !error &&
        !selectedDocument && (

          <section className="mobile-home">

            <div className="mobile-home-mark">
              O
            </div>

            <p>OTLES MOBILE VIEWER</p>

            <h1>
              {organizationName}
            </h1>

            <span>
              Open the library to select a document.
            </span>

            <button
              type="button"
              onClick={() =>
                setDrawerOpen(true)
              }
            >
              Browse documentation
            </button>

          </section>

        )
      }

    </main>

  );

}
