import { BrandImage } from './brand';

export interface BrandCollab {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  collab_image: BrandImage[];
  localizations: any[];
}

export interface BrandCollabsResponse {
  data: BrandCollab[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
} 