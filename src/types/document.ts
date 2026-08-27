export type Document = {
  id: string;
  categoryId: string | null;
  number: number;
  code: string;
  title: string;
  status: string;
  description: string;
  content: string;
  version: string;
  updated: string;
  author: string;
  revisionId: string;
  revisionNumber: number;

  slug: string;
  isPublished: boolean;
  loginRequired: boolean;
};