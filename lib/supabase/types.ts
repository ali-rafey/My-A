export type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  meta_description: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

export type BlogInput = {
  title: string;
  slug: string;
  content: string;
  cover_image?: string | null;
  meta_description?: string | null;
  tags?: string[];
  published: boolean;
};
