export default function Loading() {
  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
}
