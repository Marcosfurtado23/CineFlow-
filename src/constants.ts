import { MediaItem } from './types';

export interface ContinueWatchingItem extends MediaItem {
  progress: number;
}

export const HERO_CONTENT: MediaItem = {
  id: 'm-tempestade',
  title: 'TEMPESTADE: PLANETA EM FÚRIA',
  description: 'Quando a rede de satélites projetada para controlar o clima global começa a atacar a Terra, um engenheiro corre para descobrir a verdadeira ameaça antes que uma tempestade mundial apague tudo e todos.',
  rating: 4.6,
  year: 2017,
  duration: '1h 49min',
  type: 'movie',
  genre: ['Ação', 'Ficção Científica', 'Suspense'],
  imageUrl: 'https://i.postimg.cc/0K0hZxCJ/poster.jpg',
  backdropUrl: 'https://i.postimg.cc/XpFrjPYx/image.jpg',
  videoUrl: 'https://www.dropbox.com/scl/fi/0zz1s8j3by0hauurha248/Tempestade-Planeta-Em-F-ria-Dublado-Series-Zoiudo.mp4?rlkey=0wcz8om35mw75v5xsvtfldatb&st=rgley7w3&raw=1',
  actors: [
    {
      id: 'a1',
      name: 'Gerard Butler',
      photoUrl: 'https://picsum.photos/seed/gerard/200/200',
      socials: { instagram: 'https://instagram.com/gerardbutler' }
    },
    {
      id: 'a2',
      name: 'Jim Sturgess',
      photoUrl: 'https://picsum.photos/seed/jim/200/200',
      socials: { instagram: 'https://instagram.com/mrjimsturgess' }
    },
    {
      id: 'a3',
      name: 'Abbie Cornish',
      photoUrl: 'https://picsum.photos/seed/abbie/200/200',
      socials: { instagram: 'https://instagram.com/abbiecornish' }
    }
  ]
};

export const SERIES_HERO: MediaItem = {
  id: 'hero-series-1',
  title: 'THE LAST OF US',
  description: 'Vinte anos após a civilização moderna ser destruída, Joel, um sobrevivente experiente, é contratado para contrabandear Ellie, uma garota de 14 anos, para fora de uma zona de quarentena opressiva.',
  rating: 4.9,
  year: 2023,
  seasons: 1,
  type: 'series',
  genre: ['Drama', 'Ação', 'Pós-Apocalíptico'],
  imageUrl: 'https://i.postimg.cc/z3XXtZGG/image.jpg',
  backdropUrl: 'https://i.postimg.cc/9wpmfbb5/image.jpg',
  actors: [
    {
      id: 'a4',
      name: 'Pedro Pascal',
      photoUrl: 'https://picsum.photos/seed/pedro/200/200',
      socials: { instagram: 'https://instagram.com/pascalispunk' }
    },
    {
      id: 'a5',
      name: 'Bella Ramsey',
      photoUrl: 'https://picsum.photos/seed/bella/200/200',
      socials: { instagram: 'https://instagram.com/bellaramsey' }
    },
    {
      id: 'a6',
      name: 'Gabriel Luna',
      photoUrl: 'https://picsum.photos/seed/gabriel/200/200',
      socials: { instagram: 'https://instagram.com/iamgabrielluna' }
    }
  ]
};

export const ALL_MEDIA: MediaItem[] = [
  HERO_CONTENT,
  SERIES_HERO,
  {
    id: 'm-panico-2022',
    title: 'Pânico (2022)',
    description: 'Vinte e cinco anos após uma série de assassinatos brutais chocar a pacata cidade de Woodsboro, um novo assassino veste a máscara de Ghostface e começa a perseguir um grupo de adolescentes para trazer à tona segredos do passado mortal da cidade.',
    rating: 4.5,
    year: 2022,
    duration: '1h 54min',
    type: 'movie',
    genre: ['Terror', 'Suspense'],
    imageUrl: 'https://picsum.photos/seed/panico2022/400/600',
    backdropUrl: 'https://picsum.photos/seed/panico2022bg/1920/1080',
    videoUrl: 'https://drive.google.com/file/d/1tyvc4hLs07nkGNGh0u5dFJQtkNKo7t7o/view?usp=drivesdk',
  },
  {
    id: 'm-dune',
    title: 'Duna: Parte Dois',
    description: 'Paul Atreides une-se a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
    rating: 4.9,
    year: 2024,
    duration: '2h 46min',
    type: 'movie',
    genre: ['Ação', 'Ficção Científica', 'Épico'],
    imageUrl: 'https://picsum.photos/seed/dune-poster/400/600',
    backdropUrl: 'https://picsum.photos/seed/dune-hero/1920/1080',
  },
  {
    id: 'm-1',
    title: 'Oppenheimer',
    description: 'O físico J. Robert Oppenheimer trabalha com uma equipe de cientistas durante o Projeto Manhattan, levando ao desenvolvimento da bomba atômica.',
    rating: 4.8,
    year: 2023,
    duration: '3h 0min',
    type: 'movie',
    genre: ['Drama', 'História'],
    imageUrl: 'https://picsum.photos/seed/oppenheimer/400/600',
    backdropUrl: 'https://picsum.photos/seed/oppenheimer-bg/1920/1080',
  },
  {
    id: 'm-2',
    title: 'Godzilla X KONG',
    description: 'Duas antigas titãs, Godzilla e Kong, enfrentam-se em uma batalha épica enquanto os humanos descobrem suas origens e conexão com os mistérios da Ilha da Caveira.',
    rating: 4.5,
    year: 2024,
    duration: '1h 55min',
    type: 'movie',
    genre: ['Ação', 'Aventura'],
    imageUrl: 'https://picsum.photos/seed/godzilla/400/600',
    backdropUrl: 'https://picsum.photos/seed/godzilla-bg/1920/1080',
  },
  {
    id: 's-1',
    title: 'The Bear',
    description: 'Um jovem chef do mundo da alta gastronomia retorna a Chicago para administrar a lanchonete de sua família.',
    rating: 4.7,
    year: 2022,
    seasons: 3,
    type: 'series',
    genre: ['Drama', 'Comédia'],
    imageUrl: 'https://picsum.photos/seed/thebear/400/600',
    backdropUrl: 'https://picsum.photos/seed/thebear-bg/1920/1080',
  },
  {
    id: 's-2',
    title: 'The Last of Us',
    description: 'Vinte anos após a civilização moderna ser destruída, Joel é contratado para contrabandear Ellie para fora de uma zona de quarentena.',
    rating: 4.9,
    year: 2023,
    seasons: 1,
    type: 'series',
    genre: ['Drama', 'Ação'],
    imageUrl: 'https://i.postimg.cc/z3XXtZGG/image.jpg',
    backdropUrl: 'https://i.postimg.cc/9wpmfbb5/image.jpg',
  },
  {
    id: 's-3',
    title: 'Succession',
    description: 'A família Roy é conhecida por controlar o maior conglomerado de mídia e entretenimento do mundo.',
    rating: 4.8,
    year: 2018,
    seasons: 4,
    type: 'series',
    genre: ['Drama'],
    imageUrl: 'https://picsum.photos/seed/succession/400/600',
    backdropUrl: 'https://picsum.photos/seed/succession-bg/1920/1080',
  },
  {
    id: 's-4',
    title: 'The Crown',
    description: 'Esta série dramática segue as rivalidades políticas e o romance do reinado da Rainha Elizabeth II.',
    rating: 4.7,
    year: 2016,
    seasons: 6,
    type: 'series',
    genre: ['Drama', 'História'],
    imageUrl: 'https://picsum.photos/seed/thecrown/400/600',
    backdropUrl: 'https://picsum.photos/seed/thecrown-bg/1920/1080',
  },
  {
    id: 's-5',
    title: 'Stranger Things',
    description: 'Quando um jovem garoto desaparece, uma pequena cidade descobre um mistério envolvendo experimentos secretos e forças sobrenaturais.',
    rating: 4.8,
    year: 2016,
    seasons: 4,
    type: 'series',
    genre: ['Ficção', 'Terror'],
    imageUrl: 'https://picsum.photos/seed/strangerthings/400/600',
    backdropUrl: 'https://picsum.photos/seed/stranger-bg/1920/1080',
  },
  {
    id: 's-6',
    title: 'House of the Dragon',
    description: 'A história da família Targaryen, 200 anos antes dos eventos de Game of Thrones.',
    rating: 4.8,
    year: 2022,
    seasons: 2,
    type: 'series',
    genre: ['Fantasia', 'Drama'],
    imageUrl: 'https://picsum.photos/seed/hotd/400/600',
    backdropUrl: 'https://picsum.photos/seed/hotd-bg/1920/1080',
  },
  {
    id: 'm-3',
    title: 'A Freira 2',
    description: 'Em 1956, na França, um padre é assassinado e o mal está se espalhando. A Irmã Irene mais uma vez fica cara a cara com Valak.',
    rating: 4.8,
    year: 2023,
    duration: '1h 50min',
    type: 'movie',
    genre: ['Terror', 'Mistério'],
    imageUrl: 'https://picsum.photos/seed/nun2/400/600',
    backdropUrl: 'https://picsum.photos/seed/nun2-bg/1920/1080',
  },
  {
    id: 'live-redbull',
    title: 'Red Bull TV',
    description: 'Esportes radicais, cultura e estilo de vida 24 horas por dia.',
    rating: 4.8,
    year: 2024,
    type: 'live',
    genre: ['Esportes'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Red_Bull_TV_logo.svg/1024px-Red_Bull_TV_logo.svg.png',
    backdropUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Red_Bull_TV_logo.svg/1024px-Red_Bull_TV_logo.svg.png',
    videoUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
  },
  {
    id: 'live-nasa',
    title: 'NASA TV',
    description: 'Transmissão oficial da agência espacial americana.',
    rating: 4.9,
    year: 2024,
    type: 'live',
    genre: ['Ciência', 'Notícias'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1024px-NASA_logo.svg.png',
    backdropUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1024px-NASA_logo.svg.png',
    videoUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8'
  },
  {
    id: 'live-cgtn',
    title: 'CGTN News',
    description: 'Notícias internacionais 24 horas por dia.',
    rating: 4.2,
    year: 2024,
    type: 'live',
    genre: ['Notícias'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/CGTN_logo.svg/1024px-CGTN_logo.svg.png',
    backdropUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/CGTN_logo.svg/1024px-CGTN_logo.svg.png',
    videoUrl: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8'
  }
];

export const CONTINUE_WATCHING: ContinueWatchingItem[] = [
  {
    ...ALL_MEDIA.find(m => m.id === 'hero-series-1')!,
    progress: 50,
  },
  {
    ...ALL_MEDIA.find(m => m.id === 'm-2')!,
    progress: 85,
  },
  {
    ...ALL_MEDIA.find(m => m.id === 's-5')!,
    progress: 10,
  }
];
