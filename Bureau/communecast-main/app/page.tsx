'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Lock, Globe, Heart, Flame, Zap } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [pseudo, setPseudo] = useState('');
  const [roomId, setRoomId] = useState('');
  const [customRoomName, setCustomRoomName] = useState(''); // Nouveau champ
  const router = useRouter();

  useEffect(() => {
    const savedPseudo = localStorage.getItem('communecast-pseudo');
    if (savedPseudo) {
      setPseudo(savedPseudo);
    }
  }, []);

  const generateRoomId = () => {
    const adjectives = ['libre', 'rouge', 'noir', 'rebel', 'solidaire', 'autonome', 'fier', 'fort', 'unite', 'radical'];
    const nouns = ['commune', 'cercle', 'collectif', 'groupe', 'conseil', 'union', 'brigade', 'cellule', 'front', 'resistance'];
    const random = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}-${noun}-${random}`;
  };

  const createRoom = () => {
    if (!pseudo.trim()) {
      alert('Veuillez choisir un pseudo, camarade');
      return;
    }
    localStorage.setItem('communecast-pseudo', pseudo);
    const newRoomId = customRoomName.trim() ? customRoomName.trim() : generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!pseudo.trim()) {
      alert('Veuillez choisir un pseudo, camarade');
      return;
    }
    if (!roomId.trim()) {
      alert('Veuillez saisir un ID de salle');
      return;
    }
    localStorage.setItem('communecast-pseudo', pseudo);
    router.push(`/room/${roomId}`);
  };

  // Fonction pour copier le lien de la salle et afficher un toast de confirmation
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Lien copié !',
      description: 'Le lien de la page a été copié dans le presse-papiers.'
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #E10600 50%, #000 50%)' }}>
      {/* Header */}
      <header className="border-b-2 border-black" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo className="h-14 w-auto" />
            <Badge variant="outline" className="border-black text-white bg-[#E10600] encrypted-indicator">
              <Lock className="w-3 h-3 mr-1 text-white" />
              E2EE Anarchiste
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold" style={{ color: '#fff', textShadow: '3px 3px 8px #000' }}>
              CommuneCast
            </h1>
            <p className="text-lg font-bold text-white mt-2" style={{ textShadow: '2px 2px 6px #000', letterSpacing: '0.1em' }}>
              LIBRE • AUTONOME • SOLIDAIRE
            </p>
            <p className="text-xl font-semibold text-white" style={{ textShadow: '2px 2px 6px #000' }}>
              Vidéoconférence anarchiste et chiffrée
            </p>
            <div className="flex items-center justify-center space-x-3 text-sm text-white">
              <Flame className="w-5 h-5 text-[#E10600]" />
              <span className="font-bold" style={{ textShadow: '2px 2px 6px #000' }}>Ni dieu, ni maître, ni surveillance</span>
              <Zap className="w-5 h-5 text-[#E10600]" />
            </div>
          </div>

          <Card className="commune-card border-2 border-black" style={{ background: 'rgba(0,0,0,0.92)' }}>
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold" style={{ textShadow: '2px 2px 6px #000' }}>Rejoindre la révolution</CardTitle>
              <CardDescription className="text-white/90">
                Aucune donnée enregistrée. Communication libre et autonome.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-bold text-white mb-2 block" style={{ textShadow: '1px 1px 4px #000' }}>
                  Votre pseudo anarchiste
                </label>
                <Input
                  type="text"
                  placeholder="Camarade révolutionnaire..."
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  className="commune-input text-white placeholder-white/80 bg-black/80 border border-[#E10600]"
                  style={{ textShadow: '1px 1px 4px #000' }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-white mb-2 block" style={{ textShadow: '1px 1px 4px #000' }}>
                    Nom de l&apos;assemblée (optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder="Nom personnalisé de l&apos;assemblée..."
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    className="commune-input text-white placeholder-white/80 bg-black/80 border border-[#E10600]"
                    style={{ textShadow: '1px 1px 4px #000' }}
                  />
                </div>
                <Button
                  onClick={createRoom}
                  className="w-full commune-button text-white font-bold bg-[#E10600] border-2 border-black hover:bg-black hover:text-[#E10600] transition"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Créer une cellule révolutionnaire
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-red-600/40" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-3 text-white font-bold">ou</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="ID de l&apos;assemblée..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="commune-input text-white placeholder-white/80 bg-black/80 border border-[#E10600]"
                    style={{ textShadow: '1px 1px 4px #000' }}
                  />
                  <Button
                    onClick={joinRoom}
                    variant="outline"
                    className="w-full border-2 border-[#E10600] text-[#E10600] font-bold hover:bg-[#E10600] hover:text-white commune-button bg-black transition"
                    size="lg"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Rejoindre la résistance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features anarchistes */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="commune-card p-4 border-2 border-black" style={{ background: 'rgba(0,0,0,0.92)' }}>
              <Shield className="w-7 h-7 text-white mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Chiffrement E2EE</div>
              <div className="text-xs text-white/80 mt-1">Inviolable</div>
            </div>
            <div className="commune-card p-4 border-2 border-black" style={{ background: 'rgba(0,0,0,0.92)' }}>
              <Lock className="w-7 h-7 text-white mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Zéro surveillance</div>
              <div className="text-xs text-white/80 mt-1">Autonome</div>
            </div>
          </div>

          {/* Manifeste anarchiste */}
          <div className="commune-card p-4 border-2 border-black text-center" style={{ background: 'rgba(0,0,0,0.92)' }}>
            <p className="text-sm text-white italic" style={{ textShadow: '1px 1px 4px #000' }}>
              &quot;L&apos;émancipation des travailleurs sera l&apos;œuvre des travailleurs eux-mêmes&quot;
            </p>
            <p className="text-xs text-white/80 mt-2" style={{ textShadow: '1px 1px 4px #000' }}>
              - Association Internationale des Travailleurs (AIT)
            </p>
          </div>
        </div>
      </main>

      {/* Footer anarchiste */}
      <footer className="border-t-2 border-black" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="container mx-auto px-4 py-4 text-center text-sm text-white">
          <p className="font-bold">La solidarité est notre arme</p>
          <p className="text-xs text-white/80 mt-1">Code libre - Résistance numérique</p>
        </div>
      </footer>
    </div>
  );
}