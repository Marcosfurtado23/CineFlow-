export type ContentType = 'movie' | 'series' | 'live' | 'novela';

export interface Actor {
  id: string;
  name: string;
  photoUrl: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  rating: string | number;
  year: string | number;
  duration?: string;
  seasons?: number;
  type: ContentType;
  genre: string[];
  imageUrl: string;
  backdropUrl: string;
  videoUrl?: string;
  subtitleUrl?: string;
  actors?: Actor[];
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  myList?: string[];
}
