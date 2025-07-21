export interface AdminRole {
  _id: string;
  name: string;
  email: string;
  filter: 'all access' | 'only view' | 'no access';
  product: 'all access' | 'only view' | 'no access';
  seo: 'all access' | 'only view' | 'no access';
  // Add any other fields as needed
} 