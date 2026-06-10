export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
