import { motion } from 'framer-motion';
import AnimatedNumber from '../common/AnimatedNumber.jsx';

const STATUS_STYLES = {
  good: { bar: 'bg-primary', badge: 'from-primary/25 to-primary/5 text-primary' },
  warning: { bar: 'bg-warning', badge: 'from-warning/25 to-warning/5 text-warning' },
  bad: { bar: 'bg-danger', badge: 'from-danger/25 to-danger/5 text-danger' },
  neutral: { bar: 'bg-muted/40', badge: 'from-white/10 to-white/0 text-muted' },
};

export default function KpiCard({ icon: Icon, label, target, format, status = 'neutral' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.neutral;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-card-2 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:border-white/10 hover:shadow-xl"
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${style.bar}`} />
      <div className="flex items-center justify-between">
        <span className={`flex size-7 items-center justify-center rounded-lg bg-gradient-to-br ${style.badge}`}>
          <Icon className="size-3.5" strokeWidth={2.1} />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-text">
        <AnimatedNumber value={target} format={format} />
      </p>
    </motion.div>
  );
}
