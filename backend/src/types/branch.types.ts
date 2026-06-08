export type BranchRow = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  status: "active" | "inactive";
};
