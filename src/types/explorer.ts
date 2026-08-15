export type ExplorerDocument = {
  id: string;
  code: string;
  title: string;
  status: string;
};

export type ExplorerCategory = {
  id: string;
  name: string;
  expanded: boolean;
  documents: ExplorerDocument[];
  children: ExplorerCategory[];
};