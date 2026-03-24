import React, { useState, useMemo, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Plus, 
  Search, 
  Home, 
  Bookmark, 
  Download, 
  MoreHorizontal,
  Star,
  Clapperboard,
  ChevronRight,
  Check,
  Trash2,
  X,
  User as UserIcon,
  Settings,
  Bell,
  Shield,
  LogOut,
  HelpCircle,
  Info,
  ArrowLeft,
  Maximize2,
  Volume2,
  SkipForward,
  SkipBack,
  Pause,
  Subtitles,
  Instagram,
  Twitter,
  Facebook,
  Lock,
  RotateCw
} from 'lucide-react';
import { HERO_CONTENT, SERIES_HERO, CONTINUE_WATCHING, ALL_MEDIA as STATIC_MEDIA } from './constants';
import { MediaItem, UserProfile } from './types';
import AdminPanel from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

type TopTab = 'Filmes' | 'Séries' | 'Novelas' | 'Ao Vivo' | 'Minha Lista' | 'Explorar';
type BottomTab = 'Início' | 'Pesquisar' | 'Minha Lista' | 'Downloads' | 'Mais';

const CAROUSEL_IMAGES = [
  'https://i.postimg.cc/tC4Nbws5/hq720.jpg',
  'https://picsum.photos/seed/carousel2/1920/1080',
  'https://picsum.photos/seed/carousel3/1920/1080',
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>(STATIC_MEDIA);
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const [activeTopTab, setActiveTopTab] = useState<TopTab>('Filmes');
  const [authEmail, setAuthEmail] = useState('marcossilva192024@gmail.com');
  const [authPassword, setAuthPassword] = useState('123456');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('Início');
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const [downloadedItems, setDownloadedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getProcessedVideoUrl = (url: string) => {
    if (url.includes('dropbox.com')) {
      return `/api/stream?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    if (selectedMedia && videoRef.current) {
      // Reset error state
      setVideoError(null);
      // Pause before changing source to avoid interruption errors
      videoRef.current.pause();
      
      const processedUrl = getProcessedVideoUrl(selectedMedia.videoUrl);
      
      if (processedUrl.includes('.m3u8')) {
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          const hls = new Hls();
          hls.loadSource(processedUrl);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play().catch(e => {
              if (e.name === 'NotAllowedError') setIsPlaying(false);
              if (e.name !== 'AbortError' && e.name !== 'NotAllowedError' && e.name !== 'NotSupportedError') console.error("Auto-play prevented", e);
            });
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setVideoError("Erro ao carregar o vídeo. O formato pode não ser suportado ou o link está quebrado.");
            }
          });
          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = processedUrl;
          videoRef.current.play().catch(e => {
            if (e.name === 'NotAllowedError') setIsPlaying(false);
            if (e.name !== 'AbortError' && e.name !== 'NotAllowedError' && e.name !== 'NotSupportedError') console.error("Auto-play prevented", e);
          });
        }
      } else {
        // Handle non-HLS videos
        videoRef.current.src = processedUrl;
        videoRef.current.play().catch(e => {
          if (e.name === 'NotAllowedError') setIsPlaying(false);
          if (e.name !== 'AbortError' && e.name !== 'NotAllowedError' && e.name !== 'NotSupportedError') console.error("Auto-play prevented", e);
        });
      }
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedMedia]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Auth Listener
  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  // Real-time Media Fetching
  useEffect(() => {
    setAllMedia(STATIC_MEDIA);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authEmail === 'marcossilva192024@gmail.com' && authPassword === '123456') {
      const mockUser = { uid: 'admin-123', email: authEmail };
      setUser(mockUser);
      setUserProfile({
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: 'Marcos Silva',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos',
        role: 'admin',
        myList: []
      });
    } else {
      setAuthError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setUserProfile(null);
    setMyList(new Set());
    setActiveBottomTab('Início');
  };

  const toggleMyList = async (id: string) => {
    if (!user) return;
    
    const nextList = new Set(myList);
    if (nextList.has(id)) nextList.delete(id);
    else nextList.add(id);
    
    setMyList(nextList);
  };

  const toggleDownload = (id: string) => {
    setDownloadedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return allMedia.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, allMedia]);

  const myListItems = useMemo(() => {
    return allMedia.filter(item => myList.has(item.id));
  }, [myList, allMedia]);

  const downloadedMedia = useMemo(() => {
    return allMedia.filter(item => downloadedItems.has(item.id));
  }, [downloadedItems, allMedia]);

  const isAdmin = userProfile?.role === 'admin';

  const currentHero = allMedia[0] || STATIC_MEDIA[0];

  const renderHome = () => (
    <>
      {/* Carousel Section */}
      <section className="relative w-full px-4 mb-8">
        <div className="relative aspect-[16/10] rounded-3xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentCarouselIndex}
              src={CAROUSEL_IMAGES[currentCarouselIndex]}
              alt={`Banner ${currentCarouselIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCarouselIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentCarouselIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Continue Watching */}
      <section className="mb-8">
        <h3 className="px-4 text-xl font-bold mb-4">Continuar Assistindo</h3>
        <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
          {CONTINUE_WATCHING.filter(i => activeTopTab === 'Filmes' ? i.type === 'movie' : activeTopTab === 'Séries' ? i.type === 'series' : true).map((item) => (
            <div 
              key={item.id} 
              className="min-w-[280px] flex flex-col group cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${item.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{item.type === 'series' ? 'Série' : 'Filme'}</span>
                    <span className="text-zinc-700">•</span>
                    <span>{item.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="mb-8">
        <div className="px-4 flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {activeTopTab === 'Filmes' ? 'Filmes Recomendados' :
             activeTopTab === 'Séries' ? 'Séries Recomendadas' :
             activeTopTab === 'Novelas' ? 'Novelas' :
             activeTopTab === 'Ao Vivo' ? 'Canais ao Vivo' :
             'Recomendados para Você'}
          </h3>
          <button className="text-blue-500 text-sm font-medium flex items-center gap-1">
            Ver tudo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
          {allMedia.filter(i => {
            if (activeTopTab === 'Filmes') return i.type === 'movie';
            if (activeTopTab === 'Séries') return i.type === 'series';
            if (activeTopTab === 'Novelas') return i.type === 'novela';
            if (activeTopTab === 'Ao Vivo') return i.type === 'live';
            return true;
          }).map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onToggleList={() => toggleMyList(item.id)}
              isInList={myList.has(item.id)}
              onWatch={() => setSelectedMedia(item)}
            />
          ))}
        </div>
      </section>

      {/* Live Channels Section (Only if not already filtered) */}
      {activeTopTab === 'Explorar' && allMedia.some(i => i.type === 'live') && (
        <section className="mb-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Canais ao Vivo
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
            {allMedia.filter(i => i.type === 'live').map((item) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                onToggleList={() => toggleMyList(item.id)}
                isInList={myList.has(item.id)}
                onWatch={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Novelas Section (Only if not already filtered) */}
      {activeTopTab === 'Explorar' && allMedia.some(i => i.type === 'novela') && (
        <section className="mb-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Novelas</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
            {allMedia.filter(i => i.type === 'novela').map((item) => (
              <MediaCard 
                key={item.id} 
                item={item} 
                onToggleList={() => toggleMyList(item.id)}
                isInList={myList.has(item.id)}
                onWatch={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );

  const renderSearch = () => (
    <div className="px-4 pt-4">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input 
          autoFocus
          type="text" 
          placeholder="Títulos, gêneros ou elenco..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-blue-500 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        )}
      </div>

      {searchQuery ? (
        <div className="grid grid-cols-2 gap-4">
          {searchResults.map(item => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onToggleList={() => toggleMyList(item.id)}
              isInList={myList.has(item.id)}
              onWatch={() => setSelectedMedia(item)}
            />
          ))}
          {searchResults.length === 0 && (
            <div className="col-span-2 py-20 text-center">
              <p className="text-zinc-500">Nenhum resultado para "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold mb-4">Buscas Populares</h3>
          <div className="flex flex-wrap gap-2">
            {['Ação', 'Terror', 'Drama', 'Sci-Fi', 'Comédia'].map(tag => (
              <button 
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-4 py-2 bg-zinc-900 rounded-full text-sm font-medium border border-white/5 hover:border-blue-500 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMyList = () => (
    <div className="px-4 pt-4">
      <h2 className="text-2xl font-bold mb-6">Minha Lista</h2>
      {myListItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {myListItems.map(item => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onToggleList={() => toggleMyList(item.id)}
              isInList={true}
              onWatch={() => setSelectedMedia(item)}
            />
          ))}
        </div>
      ) : (
        <div className="py-40 text-center">
          <Bookmark className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-500">Sua lista está vazia</p>
          <button 
            onClick={() => setActiveBottomTab('Início')}
            className="mt-4 text-blue-500 font-bold"
          >
            Explorar Conteúdo
          </button>
        </div>
      )}
    </div>
  );

  const renderDownloads = () => (
    <div className="px-4 pt-4">
      <h2 className="text-2xl font-bold mb-6">Downloads</h2>
      {downloadedMedia.length > 0 ? (
        <div className="space-y-4">
          {downloadedMedia.map(item => (
            <div 
              key={item.id} 
              className="flex gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-white/5 cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              <img 
                src={item.imageUrl} 
                className="w-24 aspect-[2/3] object-cover rounded-xl" 
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold">{item.title}</h4>
                <p className="text-xs text-zinc-500 mb-2">
                  {item.type === 'movie' ? item.duration : `${item.seasons} Temporadas`} • {item.year}
                </p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs font-bold text-blue-500">
                    <Play className="w-3 h-3 fill-current" /> Assistir
                  </button>
                  <button 
                    onClick={() => toggleDownload(item.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-500"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center">
          <Download className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-500">Nenhum download concluído</p>
        </div>
      )}
    </div>
  );

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const renderMais = () => (
    <div className="px-4 pt-4 pb-12">
      <div className="flex items-center gap-4 mb-8 bg-zinc-900/40 p-6 rounded-3xl border border-white/5">
        <img 
          src={userProfile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos"} 
          alt="User" 
          className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-blue-500/30"
        />
        <div>
          <h2 className="text-xl font-bold">{userProfile?.displayName || 'Usuário'}</h2>
          <p className="text-sm text-zinc-500">{isAdmin ? 'Administrador' : 'Plano Premium'} • Ativo</p>
          <button className="text-xs text-blue-500 font-bold mt-1">Editar Perfil</button>
        </div>
      </div>

      <div className="space-y-6">
        {isAdmin && (
          <section>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Gestão</h3>
            <div className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden">
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="text-blue-500"><Clapperboard className="w-5 h-5" /></div>
                  <span className="text-sm font-medium text-zinc-200">Painel do Administrador</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Conta</h3>
          <div className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden">
            <SettingsItem icon={<UserIcon className="w-5 h-5" />} label="Dados Pessoais" />
            <SettingsItem icon={<Settings className="w-5 h-5" />} label="Configurações da Conta" />
            <SettingsItem icon={<Bell className="w-5 h-5" />} label="Notificações" />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Segurança e Suporte</h3>
          <div className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden">
            <SettingsItem icon={<Shield className="w-5 h-5" />} label="Privacidade e Segurança" />
            <SettingsItem icon={<HelpCircle className="w-5 h-5" />} label="Central de Ajuda" />
            <SettingsItem icon={<Info className="w-5 h-5" />} label="Sobre o CineFlow" />
          </div>
        </section>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">CineFlow v2.5.0 (Firebase)</p>
      </div>
    </div>
  );

  const renderPlayer = () => {
    if (!selectedMedia) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto no-scrollbar"
      >
        {/* Player Header */}
        <div className="p-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => {
                setSelectedMedia(null);
                setIsSynopsisExpanded(false);
              }}
              className="p-2 hover:bg-zinc-800 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-bold truncate">{selectedMedia.title}</h2>
          </div>

          {/* Resolução Selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all flex items-center justify-center"
                title="Configurações de Tela"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 flex flex-col"
                >
                  <button
                    onClick={() => {
                      const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
                      const nextIndex = (modes.indexOf(fitMode) + 1) % modes.length;
                      setFitMode(modes[nextIndex]);
                      setShowSettingsMenu(false);
                    }}
                    className="px-4 py-3 text-left text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <Maximize2 className="w-4 h-4 text-zinc-400" />
                    {fitMode === 'contain' ? 'Ajustar à Tela' : fitMode === 'cover' ? 'Preencher Tela' : 'Esticar Tela'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (!document.fullscreenElement) {
                          await document.documentElement.requestFullscreen();
                        }
                        if (screen.orientation && (screen.orientation as any).lock) {
                          await (screen.orientation as any).lock('landscape');
                        }
                      } catch (error: any) {
                        if (error.name !== 'SecurityError' && error.name !== 'NotSupportedError') {
                          console.error("Erro ao girar a tela:", error);
                        }
                      }
                      setShowSettingsMenu(false);
                    }}
                    className="px-4 py-3 text-left text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <RotateCw className="w-4 h-4 text-zinc-400" />
                    Girar Tela
                  </button>
                  <button
                    onClick={() => {
                      toggleFullScreen();
                      setShowSettingsMenu(false);
                    }}
                    className="px-4 py-3 text-left text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <Maximize2 className="w-4 h-4 text-zinc-400" />
                    Tela Cheia
                  </button>
                </motion.div>
              )}
            </div>

            <div className="relative">
            <button 
              onClick={() => setShowResolutionMenu(!showResolutionMenu)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {resolution}
            </button>

            {showResolutionMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20"
              >
                {(['720p', '1080p', '4K'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      setResolution(res);
                      setShowResolutionMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-xs font-bold transition-all hover:bg-white/5 flex items-center justify-between ${resolution === res ? 'text-blue-500 bg-blue-500/5' : 'text-zinc-400'}`}
                  >
                    {res}
                    {resolution === res && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-zinc-900 group">
          {selectedMedia.videoUrl ? (
            selectedMedia.videoUrl.includes('youtube.com') || 
            selectedMedia.videoUrl.includes('youtu.be') || 
            selectedMedia.videoUrl.includes('vimeo.com') ||
            selectedMedia.videoUrl.includes('drive.google.com') ? (
              <div className="w-full h-full overflow-hidden relative">
                <iframe 
                  src={selectedMedia.videoUrl.includes('drive.google.com') ? selectedMedia.videoUrl.replace(/\/view.*$/, '/preview') : selectedMedia.videoUrl}
                  className="absolute w-full h-[calc(100%+80px)] -top-[40px] left-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div 
                className="relative w-full h-full group"
                onMouseMove={handleVideoInteraction}
                onClick={handleVideoInteraction}
              >
                <video 
                  ref={videoRef}
                  src={getProcessedVideoUrl(selectedMedia.videoUrl).includes('.m3u8') ? undefined : getProcessedVideoUrl(selectedMedia.videoUrl)}
                  className={`w-full h-full ${
                    fitMode === 'contain' ? 'object-contain' : 
                    fitMode === 'cover' ? 'object-cover' : 
                    'object-fill'
                  }`}
                  autoPlay
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error("Video error:", e);
                    setVideoError("Erro ao carregar o vídeo. O formato pode não ser suportado ou o link está quebrado.");
                  }}
                >
                  {selectedMedia.subtitleUrl && (
                    <track 
                      kind="subtitles" 
                      src={selectedMedia.subtitleUrl} 
                      srcLang="pt" 
                      label="Português" 
                      default 
                    />
                  )}
                </video>
                
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
                    <p className="text-red-500 font-bold text-center px-4">{videoError}</p>
                  </div>
                )}
                
                {/* Custom Controls Overlay for Video */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 bg-black/40 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (videoRef.current) videoRef.current.currentTime -= 10; 
                        handleVideoInteraction();
                      }}
                      className="p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                      <SkipBack className="w-6 h-6 fill-current" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (videoRef.current) {
                          if (videoRef.current.paused) {
                            const playPromise = videoRef.current.play();
                            if (playPromise !== undefined) {
                              playPromise.catch(error => {
                                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError' && error.name !== 'NotSupportedError') {
                                  console.error("Playback interrupted:", error);
                                }
                              });
                            }
                          } else {
                            videoRef.current.pause();
                          }
                        }
                        handleVideoInteraction();
                      }}
                      className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 transition-all shadow-xl shadow-blue-500/20"
                    >
                      {!isPlaying ? (
                        <Play className="w-8 h-8 fill-current ml-1" />
                      ) : (
                        <Pause className="w-8 h-8 fill-current" />
                      )}
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (videoRef.current) videoRef.current.currentTime += 10; 
                        handleVideoInteraction();
                      }}
                      className="p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                      <SkipForward className="w-6 h-6 fill-current" />
                    </button>

                    {selectedMedia.subtitleUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current) {
                            const tracks = videoRef.current.textTracks;
                            if (tracks.length > 0) {
                              tracks[0].mode = tracks[0].mode === 'showing' ? 'hidden' : 'showing';
                            }
                          }
                          handleVideoInteraction();
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-all"
                        title="Alternar Legendas"
                      >
                        <Subtitles className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        videoRef.current.currentTime += 85;
                      }
                      handleVideoInteraction();
                    }}
                    className="mt-6 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Pular Sequência
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              <img 
                src={selectedMedia.backdropUrl} 
                alt={selectedMedia.title}
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              
              {/* Player Controls Overlay (Mock) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-8">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>
                  <button className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 transition-all shadow-xl shadow-blue-500/20">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>
                
                <button 
                  className="mt-6 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Pular Sequência
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <div className="h-1 w-full bg-zinc-700 rounded-full mb-4 overflow-hidden">
                  <div className="h-full w-1/3 bg-blue-600 rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                      <Pause className="w-5 h-5 fill-current" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-medium text-zinc-300">
                      {selectedMedia.type === 'live' ? (
                        <span className="flex items-center gap-1.5 text-red-500 font-bold">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> AO VIVO
                        </span>
                      ) : (
                        `12:45 / ${selectedMedia.duration || '45:00'}`
                      )}
                    </span>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">{selectedMedia.title}</h1>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="text-emerald-500 font-bold">98% Match</span>
                <span>{selectedMedia.year}</span>
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-bold">14+</span>
                <span>{selectedMedia.type === 'movie' ? selectedMedia.duration : `${selectedMedia.seasons} Temporadas`}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleMyList(selectedMedia.id)}
                className={`p-3 rounded-2xl transition-all ${
                  myList.has(selectedMedia.id) ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-900 border border-white/5'
                }`}
              >
                {myList.has(selectedMedia.id) ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
              <button 
                onClick={() => toggleDownload(selectedMedia.id)}
                className={`p-3 rounded-2xl transition-all ${
                  downloadedItems.has(selectedMedia.id) ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-900 border border-white/5'
                }`}
              >
                <Download className={`w-6 h-6 ${downloadedItems.has(selectedMedia.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Synopsis */}
          <div className="mb-8">
            <p className={`text-zinc-400 leading-relaxed transition-all duration-300 ${isSynopsisExpanded ? '' : 'line-clamp-3'}`}>
              {selectedMedia.description}
            </p>
            {!isSynopsisExpanded && (
              <button 
                onClick={() => setIsSynopsisExpanded(true)}
                className="text-white font-bold text-sm mt-2 hover:text-blue-500 transition-colors"
              >
                Ler mais
              </button>
            )}
            {isSynopsisExpanded && (
              <button 
                onClick={() => setIsSynopsisExpanded(false)}
                className="text-white font-bold text-sm mt-2 hover:text-blue-500 transition-colors"
              >
                Ler menos
              </button>
            )}
          </div>

          {/* Cast & Info */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="text-zinc-500 text-sm font-bold w-20">Gênero:</span>
              <span className="text-zinc-300 text-sm">{selectedMedia.genre.join(', ')}</span>
            </div>
            
            {selectedMedia.actors && selectedMedia.actors.length > 0 && (
              <div className="space-y-4">
                <span className="text-zinc-500 text-sm font-bold block">Elenco & Redes Sociais:</span>
                <div className="grid grid-cols-1 gap-4">
                  {selectedMedia.actors.map(actor => (
                    <div key={actor.id} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        {/* Foto como Link Principal (Instagram por padrão) */}
                        <a 
                          href={actor.socials?.instagram || actor.socials?.twitter || actor.socials?.facebook || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative group"
                        >
                          <div className={`p-[2px] rounded-full transition-all duration-300 ${actor.socials?.instagram ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-110' : 'bg-blue-500 group-hover:scale-110'}`}>
                            <div className="bg-black rounded-full p-[2px]">
                              <img 
                                src={actor.photoUrl} 
                                alt={actor.name} 
                                className="w-12 h-12 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                          {/* Ícone flutuante na foto */}
                          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                            {actor.socials?.instagram ? (
                              <Instagram className="w-3 h-3 text-white" />
                            ) : actor.socials?.twitter ? (
                              <Twitter className="w-3 h-3 text-white" />
                            ) : (
                              <Facebook className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </a>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{actor.name}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Ver Perfil</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Mantendo os ícones laterais para acesso direto a outras redes se houver */}
                        {actor.socials?.instagram && (
                          <a 
                            href={actor.socials.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 rounded-xl transition-all"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {/* ... outros ícones se necessário ... */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Content */}
        <div className="mt-8 pb-12">
          <h3 className="px-6 text-lg font-bold mb-4">Títulos Semelhantes</h3>
          <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar">
            {allMedia.filter(m => m.id !== selectedMedia.id && m.type === selectedMedia.type).slice(0, 5).map(item => (
              <div 
                key={item.id} 
                className="min-w-[140px] aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer"
                onClick={() => {
                  setSelectedMedia(item);
                  setIsSynopsisExpanded(false);
                  window.scrollTo(0, 0);
                }}
              >
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const handleAddMedia = (media: Partial<MediaItem>) => {
    const newItem = {
      ...media,
      id: Date.now().toString()
    } as MediaItem;
    setAllMedia(prev => [newItem, ...prev]);
  };

  const handleDeleteMedia = (id: string) => {
    setAllMedia(prev => prev.filter(m => m.id !== id));
  };

  const renderLogin = () => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full"
      >
        <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Clapperboard className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">CINEFLOW</h1>
        <p className="text-zinc-400 mb-8">Sua experiência premium de streaming começa aqui.</p>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Seu e-mail" 
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full px-4 py-4 bg-zinc-900/80 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          <input 
            type="password" 
            placeholder="Sua senha" 
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full px-4 py-4 bg-zinc-900/80 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          
          {authError && (
            <p className="text-red-500 text-xs text-center">{authError}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 mt-2"
          >
            {isLoginMode ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <button 
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setAuthError('');
          }}
          className="w-full mt-6 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {isLoginMode ? 'Não tem uma conta? Crie agora.' : 'Já tem uma conta? Entre aqui.'}
        </button>
        
        <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">
          Ao entrar, você concorda com nossos <br />
          <span className="text-zinc-400">Termos de Uso</span> e <span className="text-zinc-400">Privacidade</span>
        </p>
      </motion.div>
    </div>
  );

  if (!isAuthReady) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return renderLogin();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white flex flex-col pb-24">
        <AnimatePresence>
          {selectedMedia && renderPlayer()}
          {showAdminPanel && (
            <AdminPanel 
              onClose={() => setShowAdminPanel(false)} 
              existingMedia={allMedia}
              onAddMedia={handleAddMedia}
              onDeleteMedia={handleDeleteMedia}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-50 bg-black/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">CineFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="p-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-full transition-colors"
                title="Painel do Administrador"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(e => console.log(e));
                } else if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              title="Tela Cheia"
            >
              <Maximize2 className="w-5 h-5 text-zinc-300" />
            </button>
            <div className="flex items-center gap-2 bg-white/5 py-1 pl-1 pr-3 rounded-full border border-white/10">
              <img 
                src={userProfile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos"} 
                alt="User" 
                className="w-7 h-7 rounded-full bg-zinc-800"
              />
              <span className="text-sm font-medium text-zinc-300">{userProfile?.displayName?.split(' ')[0] || 'Usuário'}</span>
            </div>
          </div>
        </header>

        {/* Top Tabs (Only on Home) */}
        {activeBottomTab === 'Início' && (
          <div className="px-4 flex items-center gap-6 mb-6 overflow-x-auto no-scrollbar">
            {(['Filmes', 'Séries', 'Novelas', 'Ao Vivo', 'Minha Lista', 'Explorar'] as TopTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Minha Lista') setActiveBottomTab('Minha Lista');
                  else setActiveTopTab(tab);
                }}
                className={`relative text-lg font-medium transition-colors whitespace-nowrap ${
                  activeTopTab === tab && activeBottomTab === 'Início' ? 'text-blue-500' : 'text-zinc-500'
                }`}
              >
                {tab}
                {activeTopTab === tab && activeBottomTab === 'Início' && (
                  <motion.div 
                    layoutId="activeTopTab"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {activeBottomTab === 'Início' && renderHome()}
          {activeBottomTab === 'Pesquisar' && renderSearch()}
          {activeBottomTab === 'Minha Lista' && renderMyList()}
          {activeBottomTab === 'Downloads' && renderDownloads()}
          {activeBottomTab === 'Mais' && renderMais()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 flex items-center justify-between">
          <NavButton 
            icon={<Home className="w-6 h-6" />} 
            label="Início" 
            active={activeBottomTab === 'Início'} 
            onClick={() => setActiveBottomTab('Início')} 
          />
          <NavButton 
            icon={<Search className="w-6 h-6" />} 
            label="Pesquisar" 
            active={activeBottomTab === 'Pesquisar'} 
            onClick={() => setActiveBottomTab('Pesquisar')} 
          />
          <NavButton 
            icon={<Bookmark className="w-6 h-6" />} 
            label="Minha Lista" 
            active={activeBottomTab === 'Minha Lista'} 
            onClick={() => setActiveBottomTab('Minha Lista')} 
          />
          <NavButton 
            icon={<Download className="w-6 h-6" />} 
            label="Downloads" 
            active={activeBottomTab === 'Downloads'} 
            onClick={() => setActiveBottomTab('Downloads')} 
          />
          <NavButton 
            icon={<MoreHorizontal className="w-6 h-6" />} 
            label="Mais" 
            active={activeBottomTab === 'Mais'} 
            onClick={() => setActiveBottomTab('Mais')} 
          />
        </nav>
      </div>
    </ErrorBoundary>
  );
}

const MediaCard: React.FC<{ 
  item: MediaItem, 
  onToggleList: () => void,
  isInList: boolean,
  onWatch: () => void
}> = ({ 
  item, 
  onToggleList, 
  isInList,
  onWatch
}) => {
  return (
    <div className="flex flex-col group cursor-pointer" onClick={onWatch}>
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold border border-white/10">
          <span className="text-white">{item.rating}</span>
          <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleList();
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md border transition-all ${
            isInList ? 'bg-blue-500 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
          }`}
        >
          {isInList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {item.type === 'live' && (
          <div className="absolute bottom-2 left-2 bg-red-600 px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[8px] font-black tracking-tighter text-white animate-pulse">
            <div className="w-1 h-1 bg-white rounded-full" /> AO VIVO
          </div>
        )}
      </div>
      <h4 className="font-bold text-sm text-zinc-300 truncate">{item.title}</h4>
      <p className="text-[10px] text-zinc-500">{item.genre[0]} • {item.year}</p>
    </div>
  );
}

const NavButton: React.FC<{ 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}> = ({ 
  icon, 
  label, 
  active, 
  onClick 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-blue-500' : 'text-zinc-500'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

const SettingsItem: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="text-zinc-400">{icon}</div>
        <span className="text-sm font-medium text-zinc-200">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600" />
    </button>
  );
}
