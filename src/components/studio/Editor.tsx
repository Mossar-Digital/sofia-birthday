'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Cloud,
  ExternalLink,
  Flower2,
  HardDrive,
  Image as ImageIcon,
  LogOut,
  Mail,
  Music,
  Save,
  Settings2,
  TriangleAlert,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import MusicTab from '@/components/studio/MusicTab';
import PhotosTab from '@/components/studio/PhotosTab';
import { Card, Notice, Spinner, TextArea, TextField } from '@/components/studio/ui';
import { FLOWER_ART } from '@/components/flowers';
import type { StoreBackend } from '@/lib/store';
import type { SiteConfig } from '@/lib/types';

type TabId = 'general' | 'fleurs' | 'lettre' | 'galerie' | 'musique';

const TABS: { id: TabId; label: string; icon: typeof Settings2 }[] = [
  { id: 'general', label: 'Général', icon: Settings2 },
  { id: 'fleurs', label: 'Fleurs', icon: Flower2 },
  { id: 'lettre', label: 'Lettre', icon: Mail },
  { id: 'galerie', label: 'Galerie', icon: ImageIcon },
  { id: 'musique', label: 'Musique', icon: Music },
];

const BACKEND_LABEL: Record<StoreBackend, { text: string; icon: typeof Cloud; tone: string }> = {
  supabase: { text: 'Supabase', icon: Cloud, tone: 'text-dore/75' },
  file: { text: 'Fichier local', icon: HardDrive, tone: 'text-latte/60' },
  memory: { text: 'Mémoire seule', icon: TriangleAlert, tone: 'text-carminClair/80' },
};

interface EditorProps {
  initialConfig: SiteConfig;
  initialBackend: StoreBackend;
  onSignOut: () => void;
}

export default function Editor({ initialConfig, initialBackend, onSignOut }: EditorProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<SiteConfig>(initialConfig);
  const [backend, setBackend] = useState<StoreBackend>(initialBackend);
  const [tab, setTab] = useState<TabId>('general');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(savedConfig),
    [config, savedConfig],
  );

  const patch = useCallback(<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const payload = (await response.json()) as {
        config?: SiteConfig;
        backend?: StoreBackend;
        error?: string;
      };

      if (!response.ok || !payload.config) {
        setError(payload.error ?? 'Enregistrement impossible');
        return;
      }

      setConfig(payload.config);
      setSavedConfig(payload.config);
      if (payload.backend) setBackend(payload.backend);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2400);
    } catch {
      setError('Le serveur ne répond pas.');
    } finally {
      setSaving(false);
    }
  }, [config]);

  // Ctrl/⌘ + S enregistre, comme dans un éditeur de texte.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty && !saving) void save();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, saving, save]);

  // Prévient avant de quitter avec des changements non enregistrés.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const Backend = BACKEND_LABEL[backend];

  return (
    <div className="min-h-dvh pb-28">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-30 border-b border-dore/15 bg-espresso/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <h1 className="font-serif text-lg leading-none text-creme">Studio</h1>
            <p className={`mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] ${Backend.tone}`}>
              <Backend.icon className="h-3 w-3" />
              {Backend.text}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-full border border-dore/25 px-3 text-[11px] text-creme/80 transition hover:border-dore/55"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voir
            </a>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Se déconnecter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-dore/25 text-latte/65 transition hover:border-carminClair/50 hover:text-carminClair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Onglets, défilables au doigt sur mobile */}
        <nav className="mx-auto max-w-3xl overflow-x-auto no-scrollbar px-4">
          <ul className="flex gap-1 pb-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs transition ${
                    tab === id ? 'text-espresso' : 'text-latte/65 hover:text-creme'
                  }`}
                >
                  {tab === id && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-dore"
                      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        {backend === 'memory' && (
          <Notice tone="warn">
            Aucun support de stockage inscriptible : les modifications ne survivront pas au
            redémarrage du serveur. Renseignez les clés Supabase pour une sauvegarde durable.
          </Notice>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            {tab === 'general' && (
              <>
                <Card title="Identité" description="Le prénom apparaît dans le titre et la signature.">
                  <div className="space-y-4">
                    <TextField
                      label="Prénom"
                      value={config.name}
                      onChange={(name) => patch('name', name)}
                      placeholder="Sofia"
                    />
                    <TextField
                      label="Message d'anniversaire"
                      value={config.greeting}
                      onChange={(greeting) => patch('greeting', greeting)}
                      placeholder="Joyeux Anniversaire Sofia"
                      hint="Chaque mot apparaît l'un après l'autre à l'écran."
                    />
                    <TextArea
                      label="Sous-titre"
                      value={config.subtitle}
                      onChange={(subtitle) => patch('subtitle', subtitle)}
                      rows={2}
                    />
                  </div>
                </Card>

                <Card
                  title="Écran de verrouillage"
                  description="Ce que Sofia doit saisir pour ouvrir le cadeau."
                >
                  <div className="space-y-4">
                    <TextField
                      label="Mot de passe"
                      value={config.password}
                      onChange={(password) => patch('password', password)}
                      placeholder="sofia"
                      hint="Insensible aux majuscules et aux espaces autour. Laisser vide conserve l'actuel."
                    />
                    <TextArea
                      label="Indice"
                      value={config.hint}
                      onChange={(hint) => patch('hint', hint)}
                      rows={2}
                      hint="Consultable au clic sur « Un indice ? »."
                    />
                  </div>
                </Card>
              </>
            )}

            {tab === 'fleurs' && (
              <Card
                title="Le jardin des 5 fleurs"
                description="Un message d'amour par fleur, affiché dans une modale au clic."
              >
                <div className="space-y-4">
                  {config.flowers.map((flower, index) => {
                    const Art = FLOWER_ART[flower.id];
                    return (
                      <div
                        key={flower.id}
                        className="rounded-2xl border border-dore/18 bg-espresso/35 p-4"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <Art className="h-12 w-auto shrink-0" />
                          <input
                            value={flower.name}
                            onChange={(event) =>
                              patch(
                                'flowers',
                                config.flowers.map((f, i) =>
                                  i === index ? { ...f, name: event.target.value } : f,
                                ),
                              )
                            }
                            placeholder="Nom de la fleur"
                            className="min-w-0 flex-1 rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 font-serif text-base text-creme focus:border-dore/50"
                          />
                        </div>

                        <div className="space-y-3">
                          <input
                            value={flower.title}
                            onChange={(event) =>
                              patch(
                                'flowers',
                                config.flowers.map((f, i) =>
                                  i === index ? { ...f, title: event.target.value } : f,
                                ),
                              )
                            }
                            placeholder="Titre du message"
                            className="w-full rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-sm text-creme placeholder:text-latte/40 focus:border-dore/50"
                          />
                          <textarea
                            value={flower.message}
                            onChange={(event) =>
                              patch(
                                'flowers',
                                config.flowers.map((f, i) =>
                                  i === index ? { ...f, message: event.target.value } : f,
                                ),
                              )
                            }
                            rows={5}
                            placeholder="Le message…"
                            className="w-full resize-y rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-sm leading-relaxed text-creme placeholder:text-latte/40 focus:border-dore/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {tab === 'lettre' && (
              <Card
                title="La lettre d'amour"
                description="Présentée sur un parchemin scellé à la cire. Laissez une ligne vide entre deux paragraphes."
              >
                <div className="space-y-4">
                  <TextField
                    label="Appel"
                    value={config.letter.title}
                    onChange={(title) => patch('letter', { ...config.letter, title })}
                    placeholder="Ma Sofia,"
                  />
                  <TextArea
                    label="Corps de la lettre"
                    value={config.letter.body}
                    onChange={(body) => patch('letter', { ...config.letter, body })}
                    rows={16}
                    hint="Une ligne vide sépare les paragraphes. La première lettre est calligraphiée."
                  />
                  <TextField
                    label="Signature"
                    value={config.letter.signature}
                    onChange={(signature) => patch('letter', { ...config.letter, signature })}
                    placeholder="Pour toujours, à toi."
                  />
                </div>
              </Card>
            )}

            {tab === 'galerie' && (
              <>
                <Card title="Introduction du jardin" description="Texte affiché au-dessus des fleurs.">
                  <TextArea
                    label="Texte d'introduction"
                    value={config.gardenIntro}
                    onChange={(gardenIntro) => patch('gardenIntro', gardenIntro)}
                    rows={3}
                  />
                </Card>
                <PhotosTab photos={config.photos} onChange={(photos) => patch('photos', photos)} />
              </>
            )}

            {tab === 'musique' && (
              <MusicTab
                songs={config.songs}
                bgm={config.bgm}
                onSongsChange={(songs) => patch('songs', songs)}
                onBgmChange={(bgm) => patch('bgm', bgm)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barre d'enregistrement, toujours accessible au pouce */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-dore/15 bg-espresso/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 safe-b">
          <p className="min-w-0 text-[11px] leading-snug text-latte/55">
            {error ? (
              <span className="text-carminClair">{error}</span>
            ) : justSaved ? (
              <span className="flex items-center gap-1.5 text-dore">
                <Check className="h-3.5 w-3.5" /> Enregistré
              </span>
            ) : dirty ? (
              'Modifications non enregistrées'
            ) : (
              'Tout est à jour'
            )}
          </p>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="btn-gold shrink-0 !px-5 !py-2.5 text-sm"
          >
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
