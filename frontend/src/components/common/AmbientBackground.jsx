import { motion } from 'framer-motion';

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      <motion.div
        className="absolute -left-32 top-[-10%] size-[420px] rounded-full bg-primary/10 blur-[110px]"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-10%] top-[30%] size-[380px] rounded-full bg-primary/8 blur-[120px]"
        animate={{ x: [0, -30, 20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[20%] size-[440px] rounded-full bg-primary/6 blur-[130px]"
        animate={{ x: [0, 25, -15, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}
