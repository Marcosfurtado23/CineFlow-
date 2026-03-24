import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Save, Clapperboard, Film, Tv, Radio, MonitorPlay, FileJson, Link } from 'lucide-react';
import { MediaItem } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Sparkles, Languages } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AdminPanelProps {
  onClose: () => void;
  existingMedia: MediaItem[];
  onAddMedia: (media: Partial<MediaItem>) => void;
  onDeleteMedia: (id: string) => void;
}

export default function AdminPanel({ onClose, existingMedia, onAddMedia, onDeleteMedia }: AdminPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isImportingM3U, setIsImportingM3U] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [m3uUrl, setM3uUrl] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('pt-BR');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MediaItem>>({
    title: '',
    description: '',
    videoUrl: '',
    imageUrl: '',
    backdropUrl: '',
    subtitleUrl: '',
    type: 'movie',
    genre: [],
    year: new Date().getFullYear().toString(),
    rating: '5.0',
    duration: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onAddMedia({
        ...formData,
        createdAt: new Date().toISOString() as any
      });
      setIsAdding(false);
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        imageUrl: '',
        backdropUrl: '',
        subtitleUrl: '',
        type: 'movie',
        genre: [],
        year: new Date().getFullYear().toString(),
        rating: '5.0',
        duration: ''
      });
      alert('Filme/Série adicionado com sucesso!');
    } catch (error: any) {
      console.error("Error adding media:", error);
      alert('Erro ao adicionar.');
    }
  };

  const generateAISubtitles = async () => {
    if (!formData.title || !formData.description) {
      alert("Por favor, preencha o título e a sinopse para que a IA possa gerar legendas contextuais.");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const prompt = `Gere um arquivo de legenda no formato WebVTT (.vtt) para um conteúdo audiovisual com o título "${formData.title}" e a sinopse "${formData.description}". 
      O idioma da legenda deve ser "${aiLanguage}". 
      Como não tenho o arquivo de vídeo completo para transcrição direta agora, gere uma legenda de exemplo (cerca de 10-15 entradas) que faça sentido com o contexto da obra, incluindo diálogos dramáticos ou descrições de cena.
      Retorne APENAS o conteúdo do arquivo VTT, começando com "WEBVTT".`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const vttContent = response.text || '';
      if (vttContent.includes('WEBVTT')) {
        // In a real app, we would upload this to a storage bucket.
        // For this demo, we'll create a Data URL.
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);
        setFormData({ ...formData, subtitleUrl: url });
        alert("Legendas geradas com sucesso pela IA!");
      } else {
        throw new Error("Formato de legenda inválido retornado pela IA.");
      }
    } catch (error) {
      console.error("Erro ao gerar legendas:", error);
      alert("Erro ao gerar legendas com IA. Verifique o console.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      onDeleteMedia(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Erro ao excluir.");
    }
  };

  const handleM3UImport = async () => {
    if (!m3uUrl) {
      alert("Por favor, insira a URL da lista M3U.");
      return;
    }

    setIsImportingM3U(true);
    try {
      let text = '';
      try {
        // Tenta fetch direto primeiro
        const response = await fetch(m3uUrl);
        if (!response.ok) throw new Error("Erro direto");
        text = await response.text();
      } catch (e) {
        // Se falhar (CORS), tenta via proxy AllOrigins
        console.log("Tentando via proxy devido a erro de CORS...");
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(m3uUrl)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Erro ao carregar a lista M3U mesmo via proxy.");
        text = await response.text();
      }
      
      if (!text.includes('#EXTM3U')) {
        alert("O arquivo não parece ser uma lista M3U válida.");
        setIsImportingM3U(false);
        return;
      }

      const lines = text.split(/\r?\n/);
      const items: any[] = [];
      let currentItem: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
          // Extrai título (costuma ser o texto após a última vírgula)
          const titleParts = line.split(',');
          const title = titleParts[titleParts.length - 1].trim();
          
          // Extrai atributos (logo, grupo, etc)
          const logoMatch = line.match(/tvg-logo="(.*?)"/i);
          const groupMatch = line.match(/group-title="(.*?)"/i);
          const nameMatch = line.match(/tvg-name="(.*?)"/i);
          
          currentItem = {
            title: title || nameMatch?.[1] || 'Canal Sem Nome',
            imageUrl: logoMatch ? logoMatch[1] : `https://picsum.photos/seed/${encodeURIComponent(title)}/400/600`,
            genre: groupMatch ? [groupMatch[1]] : ['IPTV'],
            type: 'live',
            year: new Date().getFullYear().toString(),
            rating: '5.0',
            description: `Canal importado via lista M3U. Grupo: ${groupMatch?.[1] || 'Geral'}`,
            backdropUrl: logoMatch ? logoMatch[1] : `https://picsum.photos/seed/${encodeURIComponent(title)}-bg/1920/1080`
          };
        } else if (line.startsWith('http')) {
          if (currentItem) {
            currentItem.videoUrl = line;
            items.push(currentItem);
            currentItem = null;
          }
        }
      }

      if (items.length === 0) {
        alert("Nenhum canal encontrado na lista M3U.");
        return;
      }

      // Limita a importação para não travar o navegador se a lista for gigantesca
      const maxItems = 500;
      const itemsToImport = items.slice(0, maxItems);

      if (window.confirm(`Foram encontrados ${items.length} canais. Deseja importar os primeiros ${itemsToImport.length} para o banco de dados?`)) {
        let count = 0;
        setImportProgress({ current: 0, total: itemsToImport.length });
        for (const item of itemsToImport) {
          onAddMedia({
            ...item,
            createdAt: new Date().toISOString() as any
          });
          count++;
          setImportProgress({ current: count, total: itemsToImport.length });
        }
        alert(`${count} canais importados com sucesso!`);
        setM3uUrl('');
      }
    } catch (error) {
      console.error("Erro na importação M3U:", error);
      alert("Erro ao importar lista M3U. Verifique se a URL é válida.");
    } finally {
      setIsImportingM3U(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const seedDefaultChannels = async () => {
    if (!window.confirm("Deseja carregar uma lista de canais públicos brasileiros padrão?")) return;
    
    setIsSeeding(true);
    const defaultChannels = [
      { title: 'Record News', videoUrl: 'https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xf07S6790S/playlist.m3u8', imageUrl: 'https://i.imgur.com/HZDRG0K.png', genre: ['Notícias'] },
      { title: 'Jovem Pan News', videoUrl: 'https://cdn.jmvstream.com/w/LVW-10444/LVW10444_Xf07S6790S/playlist.m3u8', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Jovem_Pan_logo_2018.svg/960px-Jovem_Pan_logo_2018.svg.png', genre: ['Notícias'] },
      { title: 'Pluto TV Anime', videoUrl: 'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/62a2e8d8a1c8650007e95bac/master.m3u8?advertisingId=&appName=web&appVersion=unknown&appStoreUrl=&architecture=&buildVersion=&clientTime=0&deviceDNT=0&deviceId=62a2e8d8a1c8650007e95bac&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&sid=5f5f5f5f-5f5f-5f5f-5f5f-5f5f5f5f5f5f&userId=', imageUrl: 'https://images.pluto.tv/channels/62a2e8d8a1c8650007e95bac/colorLogoPNG.png', genre: ['Anime'] },
      { title: 'TV Cultura', videoUrl: 'https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xf07S6790S/playlist.m3u8', imageUrl: 'https://i.ibb.co/nm0jXMM/cultura-3x.png', genre: ['Cultura'] },
      { title: 'Pluto TV Filmes Ação', videoUrl: 'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5f1f0f0f0f0f0f0f0f0f0f0f/master.m3u8?appName=web', imageUrl: 'https://i.imgur.com/HkCV9cQ.png', genre: ['Filmes'] }
    ];

    try {
      let count = 0;
      for (const ch of defaultChannels) {
        onAddMedia({
          ...ch,
          type: 'live',
          year: '2024',
          rating: '5.0',
          description: 'Canal público padrão.',
          backdropUrl: ch.imageUrl,
          createdAt: new Date().toISOString() as any
        });
        count++;
      }
      alert(`${count} canais padrão adicionados!`);
    } catch (error) {
      console.error("Erro ao semear canais:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto p-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Clapperboard className="text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white">Painel de Admin</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                {isAdding ? <X size={20} /> : <Plus size={20} />}
                {isAdding ? 'Cancelar Cadastro' : 'Adicionar Novo Filme/Série'}
              </button>

              <button
                onClick={async () => {
                  try {
                    onAddMedia({
                      title: 'Pecadores',
                      description: 'Do roteirista e diretor Ryan Coogler e estrelado por Michael B. Jordan, Pecadores é um novo thriller de terror original.',
                      videoUrl: 'https://www.dropbox.com/scl/fi/vkctgfykm0z4tlq64lx3c/Pecadores-Dublado.mp4?rlkey=bx0gprig6owrbpdrtx5mbpkop&st=85fad6xz&raw=1',
                      imageUrl: 'https://i.postimg.cc/zfKPZK98/images-(2).jpg',
                      backdropUrl: 'https://i.postimg.cc/0y5x3W63/images-(1).jpg',
                      subtitleUrl: '',
                      type: 'movie',
                      genre: ['Terror', 'Thriller'],
                      year: '2025',
                      rating: '5.0',
                      duration: '2h 10m',
                      createdAt: new Date().toISOString() as any
                    });
                    alert('Filme "Pecadores" adicionado com sucesso!');
                  } catch (error: any) {
                    console.error("Error adding Pecadores:", error);
                    alert('Erro ao adicionar.');
                  }
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors"
              >
                <Plus size={20} />
                Adicionar "Pecadores" (Rápido)
              </button>

              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <FileJson size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Importar Lista M3U (IPTV)</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="url" 
                      placeholder="Cole a URL .m3u aqui..." 
                      value={m3uUrl}
                      onChange={e => setM3uUrl(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={seedDefaultChannels}
                      disabled={isSeeding}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Canais Padrão
                    </button>
                    <button 
                      onClick={handleM3UImport}
                      disabled={isImportingM3U}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isImportingM3U ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          {importProgress.total > 0 ? `${importProgress.current}/${importProgress.total}` : 'Lendo...'}
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Importar
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  * A URL deve ser pública e permitir acesso via navegador (CORS).
                </p>
              </div>
            </div>

            {isAdding && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                onSubmit={handleSave}
                className="bg-zinc-900 p-6 rounded-2xl border border-white/10 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                    placeholder="Ex: Interestelar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                    >
                      <option value="movie">Filme</option>
                      <option value="series">Série</option>
                      <option value="novela">Novela</option>
                      <option value="live">Canal ao Vivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ano</label>
                    <input 
                      type="text" 
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL do Vídeo (Direto)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                    placeholder="https://exemplo.com/video.mp4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Capa (Poster)</label>
                  <input 
                    type="text" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                    placeholder="https://exemplo.com/capa.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL do Banner (Fundo)</label>
                  <input 
                    type="text" 
                    value={formData.backdropUrl}
                    onChange={e => setFormData({...formData, backdropUrl: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                    placeholder="https://exemplo.com/banner.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Legenda (.vtt recomendado)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.subtitleUrl}
                      onChange={e => setFormData({...formData, subtitleUrl: e.target.value})}
                      className="flex-1 bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                      placeholder="https://exemplo.com/legenda.vtt"
                    />
                    <div className="flex flex-col gap-2">
                      <select 
                        value={aiLanguage}
                        onChange={e => setAiLanguage(e.target.value)}
                        className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                      >
                        <option value="pt-BR">Português</option>
                        <option value="en-US">Inglês</option>
                        <option value="es-ES">Espanhol</option>
                        <option value="fr-FR">Francês</option>
                      </select>
                      <button
                        type="button"
                        onClick={generateAISubtitles}
                        disabled={isGeneratingAI}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white p-3 rounded-lg transition-all flex items-center justify-center"
                        title="Gerar com IA"
                      >
                        {isGeneratingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <Languages size={10} />
                    A IA gerará legendas contextuais baseadas no título e sinopse.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sinopse</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white h-24 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar no Catálogo
                </button>
              </motion.form>
            )}
          </div>

          {/* List Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Itens no Catálogo ({existingMedia.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {existingMedia.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      className="w-12 h-16 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-white font-medium line-clamp-1">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.type === 'movie' && <Film size={12} className="text-gray-500" />}
                        {item.type === 'series' && <Tv size={12} className="text-gray-500" />}
                        {item.type === 'novela' && <MonitorPlay size={12} className="text-gray-500" />}
                        {item.type === 'live' && <Radio size={12} className="text-gray-500" />}
                        <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-zinc-400 mb-6">Tem certeza que deseja excluir este item do catálogo? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
