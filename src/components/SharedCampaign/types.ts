export interface Campaign {
  id: string | number;
  title: string;
  description: string;
  raised: number;
  target: number;
  deadline: string | number | Date;
  backers: number;
  image?: string;
  walletAddress?: string;
  charity?: {
    name: string;
    description?: string;
    logo?: string;
  };
  updates?: Array<{
    id: string | number;
    title: string;
    content: string;
    date: string | Date;
    author?: string;
  }>;
}
