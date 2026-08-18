import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, FileText, FolderOpen, X } from 'lucide-react';
import { getRecentFiles, removeRecentFile } from '../../utils/recentFiles.js';

export default function MyFiles() {
  const { t, i18n } = useTranslation();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const load = () => setFiles(getRecentFiles());
    load();
    window.addEventListener('basira:recent-files-changed', load);
    return () => window.removeEventListener('basira:recent-files-changed', load);
  }, []);

  if (files.length === 0) return null;

  return (
    <section className="pb-24">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="mb-4 flex items-center gap-1.5">
            <FolderOpen className="size-4 text-primary" strokeWidth={2.1} />
            <p className="text-sm font-semibold text-text">{t('myFiles.title')}</p>
          </div>

          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {files.map((f) => {
                const Icon = f.kind === 'pdf' ? FileText : FileSpreadsheet;
                const date = new Date(f.savedAt).toLocaleDateString(
                  i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US',
                  { dateStyle: 'medium' }
                );
                return (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-gradient-to-b from-card to-card-2 px-4 py-3 shadow-lg shadow-black/10"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" strokeWidth={1.9} />
                    </span>
                    <Link to={`/dashboard/${f.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text hover:text-primary">{f.filename}</p>
                      <p className="text-xs text-muted">{date}</p>
                    </Link>
                    <button
                      onClick={() => removeRecentFile(f.id)}
                      className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-text"
                      aria-label={`Remove ${f.filename}`}
                    >
                      <X className="size-4" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
