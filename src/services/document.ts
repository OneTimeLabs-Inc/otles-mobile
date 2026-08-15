import { supabase } from "../lib/supabase";

import type { Document } from "../types/document";
import type {
  ExplorerCategory,
  ExplorerDocument,
} from "../types/explorer";


type CategoryRecord = {
  id: string;
  parent_id: string | null;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
};


type DocumentDatabaseRecord = {
  id: string;
  category_id: string | null;
  number: number;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  current_revision_id: string | null;
  author: string | null;
  updated_at: string;
  is_published: boolean;
  sort_order: number;
};


type RevisionDatabaseRecord = {
  id: string;
  document_id: string;
  revision: number;
  version: string;
  title: string;
  content: string;
  created_at: string;
};


/* ==========================================================
   DOCUMENT TREE
   Load categories and documents for workspace
   ========================================================== */

export async function getExplorerTree(
  workspaceId: string,
): Promise<
  ExplorerCategory[]
> {


  //
  // Load Categories
  //

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("otles_categories")
    .select(`
      id,
      parent_id,
      code,
      name,
      description,
      sort_order
    `)
    .eq(
      "workspace_id",
      workspaceId,
    )
.order("sort_order", {
  ascending: true,
});




  if (categoryError) {
    throw new Error(
      `Unable to load OTLES categories: ${categoryError.message}`,
    );
  }




let documentQuery =
  supabase
    .from("otles_documents")
    .select(`
      id,
      category_id,
      number,
      title,
      description,
      status,
      current_revision_id,
      author,
      updated_at,
      is_published,
      sort_order
    `)
    .eq(
      "workspace_id",
      workspaceId,
    );

const {
  data: documentData,
  error: documentError,

} =
  await documentQuery

.order("number", {
  ascending: true,
});



  if (documentError) {
    throw new Error(
      `Unable to load OTLES documents: ${documentError.message}`,
    );
  }



  const categories =
    (categoryData as CategoryRecord[]) ?? [];


  const documents =
    (documentData as DocumentDatabaseRecord[]) ?? [];



  //
  // Build empty category tree first
  //

  const categoryMap = new Map<
    string,
    ExplorerCategory
  >();



  for (const category of categories) {

    categoryMap.set(
      category.id,
      {
        id: category.id,
        name: category.name,
        expanded: true,
        documents: [],
        children: [],
      },
    );

  }



  //
  // Add documents
  //

  for (const document of documents) {

    const category =
      categoryMap.get(
        document.category_id ?? "",
      );


    if (!category) {
      continue;
    }



const explorerDocument: ExplorerDocument = {
  id: document.id,

  code:
    `${category.name
      .substring(0, 3)
      .toUpperCase()}-${document.number
      .toString()
      .padStart(3, "0")}`,

  title:
    document.title,

  status:
    document.status,
};



    category.documents.push(
      explorerDocument,
    );

  }



  //
  // Build the nested category hierarchy.
  // Categories with no valid parent remain at the root.
  //

  const rootCategories: ExplorerCategory[] = [];

  for (const category of categories) {

    const node =
      categoryMap.get(
        category.id,
      );

    if (!node) {
      continue;
    }

    if (
      category.parent_id &&
      categoryMap.has(
        category.parent_id,
      )
    ) {

      categoryMap
        .get(
          category.parent_id,
        )!
        .children
        .push(
          node,
        );

    } else {

      rootCategories.push(
        node,
      );

    }

  }


  return rootCategories;

}





/* ==========================================================
   DOCUMENT DETAIL
   Load individual document
   ========================================================== */

export async function getDocument(
  id: string,
): Promise<Document> {


  const {
    data: documentData,
    error: documentError,
  } = await supabase
    .from("otles_documents")
    .select(`
  id,
  category_id,
  number,
  title,
  slug,
  description,
  status,
  current_revision_id,
  author,
  updated_at,
  is_published
`)
    .eq(
      "id",
      id,
    )
    .single();



  if (documentError) {
    throw new Error(
      `Unable to load the OTLES document: ${documentError.message}`,
    );
  }



  const documentRecord =
    documentData as DocumentDatabaseRecord;



  if (!documentRecord.current_revision_id) {
    throw new Error(
      `Document ${documentRecord.id} does not have a current revision.`,
    );
  }



  const {
    data: revisionData,
    error: revisionError,
  } = await supabase
    .from("otles_document_revisions")
    .select(`
      id,
      document_id,
      revision,
      version,
      title,
      content,
      created_at
    `)
    .eq(
      "id",
      documentRecord.current_revision_id,
    )
    .single();



  if (revisionError) {
    throw new Error(
      `Unable to load the current document revision: ${revisionError.message}`,
    );
  }



  const revisionRecord =
    revisionData as RevisionDatabaseRecord;



  return {

    id:
      documentRecord.id,


    categoryId:
      documentRecord.category_id,


    number:
      documentRecord.number,


    title:
      revisionRecord.title &&
      revisionRecord.title.trim().length > 0
        ? revisionRecord.title
        : documentRecord.title,


    description:
      documentRecord.description ?? "",


    content:
      revisionRecord.content,


    version:
      revisionRecord.version,


    status:
      documentRecord.status,


    updated:
      documentRecord.updated_at ??
      revisionRecord.created_at,


    author:
      documentRecord.author ??
      "Unknown",


revisionId:
  revisionRecord.id,


revisionNumber:
  revisionRecord.revision,


slug:
  documentRecord.slug,


isPublished:
  documentRecord.is_published,

  };

}

/* ==========================================================
   DOCUMENT CREATION
   Create document and initial revision
   ========================================================== */

export async function createDocument({

  workspaceId,

  categoryId,

  title,

  description,

  version,

  content,

  author,

}: {

  workspaceId: string;

  categoryId: string;

  title: string;

  description: string;

  version: string;

  content: string;

  author: string;

}) {


  /* ==========================================================
     DOCUMENT NUMBERING
     Generate next category document number
     ========================================================== */


  const {
    data: existingDocuments,
    error: numberingError,

  } =
    await supabase

      .from("otles_documents")

      .select(
        "number",
      )

      .eq(
        "category_id",
        categoryId,
      )

      .order(
        "number",
        {
          ascending: false,
        },
      )

      .limit(1);



  if (numberingError) {

    throw new Error(
      `Unable to determine document number: ${numberingError.message}`,
    );

  }



  const nextNumber =

    existingDocuments &&
    existingDocuments.length > 0

      ? existingDocuments[0].number + 1

      : 1;



  /*
     Create document record
  */
const {
  data: sessionData,
} = await supabase.auth.getSession();

console.log(
  "SUPABASE DEMO SESSION",
  sessionData.session
    ? {
        userId:
          sessionData.session.user.id,
        email:
          sessionData.session.user.email,
        role:
          sessionData.session.user.role,
      }
    : null,
);

     console.log(
  "CREATE DOCUMENT VALUES",
  {
    workspaceId,
    categoryId,
    title,
    description,
    author,
    status: "Draft",
    is_published: false,
  },
);

  const {
    data: document,
    error: documentError,

  } =
    await supabase

    
    
      .from("otles_documents")

      .insert({

        workspace_id:
          workspaceId,

        category_id:
          categoryId,

        number:
          nextNumber,

        title,

        description,

        author,

        status:
          "Draft",

        is_published:
          false,

      })

      .select()

      .single();



  if (documentError) {

    throw new Error(
      `Unable to create document: ${documentError.message}`,
    );

  }



  /*
     Create initial revision
  */


  const {
    data: revision,
    error: revisionError,

  } =
    await supabase

      .from("otles_document_revisions")

.insert({

  document_id:
    document.id,

  revision:
    1,

  version,

  title,

  content,

  change_summary:
    "Initial document creation",

})

      .select()

      .single();



  if (revisionError) {

    throw new Error(
      `Unable to create document revision: ${revisionError.message}`,
    );

  }



  /*
     Attach current revision
  */


  const {
    error: updateError,

  } =
    await supabase

      .from("otles_documents")

      .update({

        current_revision_id:
          revision.id,

      })

      .eq(

        "id",

        document.id,

      );



  if (updateError) {

    throw new Error(
      `Unable to update current revision: ${updateError.message}`,
    );

  }



  return document;

}

/* ==========================================================
DOCUMENT SAVE
Save working OTML document content
========================================================== */

export async function saveDocumentContent(
  revisionId: string,
  content: string,
) {

  const {
    data,
    error,
  } = await supabase
    .from("otles_document_revisions")
    .update({
      content,
    })
    .eq(
      "id",
      revisionId,
    )
    .select(`
      id,
      document_id,
      revision,
      version,
      content
    `)
    .single();


  if (error) {

    throw new Error(
      `Unable to save document: ${error.message}`,
    );

  }


  if (!data) {

    throw new Error(
      "Document save completed without returning an updated revision.",
    );

  }


  console.log(
    "Saved OTLES document revision:",
    data,
  );


  return data;

}

/* ==========================================================
   DOCUMENT DELETE
   Permanently delete document
   ========================================================== */

export async function deleteDocument(
  documentId: string,
) {

  const { error } =
    await supabase

      .from("otles_documents")

      .delete()

      .eq(
        "id",
        documentId,
      );

  if (error) {

    throw new Error(
      `Unable to delete document: ${error.message}`,
    );

  }

}

/* ==========================================================
   DOCUMENT PUBLISH
   Publish document to the public organization site
   ========================================================== */

export async function publishDocument(
  documentId: string,
) {

  const {
    data,
    error,
  } = await supabase

    .from("otles_documents")

    .update({

      status:
        "Published",

      is_published:
        true,

    })

    .eq(
      "id",
      documentId,
    )

    .select(`
      id,
      status,
      is_published,
      updated_at
    `)

    .single();


  if (error) {

    throw new Error(
      `Unable to publish document: ${error.message}`,
    );

  }


  if (!data) {

    throw new Error(
      "Document publish completed without returning the updated document.",
    );

  }


  return data;

}

/* ==========================================================
   DOCUMENT UNPUBLISH
   Remove document from the public organization site
   ========================================================== */

export async function unpublishDocument(
  documentId: string,
) {

  const {
    data,
    error,
  } = await supabase

    .from("otles_documents")

    .update({

      status:
        "Draft",

      is_published:
        false,

    })

    .eq(
      "id",
      documentId,
    )

    .select(`
      id,
      status,
      is_published,
      updated_at
    `)

    .single();


  if (error) {

    throw new Error(
      `Unable to unpublish document: ${error.message}`,
    );

  }


  if (!data) {

    throw new Error(
      "Document unpublish completed without returning the updated document.",
    );

  }


  return data;

}