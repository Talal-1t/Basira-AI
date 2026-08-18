import { motion } from 'framer-motion';
import AnimatedNumber from '../common/AnimatedNumber.jsx';

export default function StatCard({ icon: Icon, label, target, format }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40"
    >
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-3.5" strokeWidth={2} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-text">
        <AnimatedNumber value={target} format={format} />
      </p>
    </motion.div>
  );
}
