import Link from 'next/link';

const decoColors = [
  '#f7c5d8', '#ffd8a0', '#b8e4b8', '#b8caff',
  '#ffc8a0', '#cdb8ff', '#a8e8cc', '#ffc0b8',
];

export default function Header() {
  return (
    <div className="header" style={{ position: 'relative' }}>
      <Link href="/admin" style={{ position: 'absolute', top: '-1rem', right: '0', fontSize: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', textDecoration: 'none' }}>
        ⚙️ แอดมิน
      </Link>
      <div className="header-badge">ภาษาจีนระดับประถม 6</div>
      <h1>สื่อการเรียนรู้ภาษาจีน</h1>
      <p>中文学习教材</p>
      <div className="deco-line">
        <div
          className="line"
          style={{ background: 'linear-gradient(to right, transparent, #f7c5d8)' }}
        />
        {decoColors.map((color, i) => (
          <div key={i} className="dot" style={{ background: color }} />
        ))}
        <div
          className="line"
          style={{ background: 'linear-gradient(to left, transparent, #ffc0b8)' }}
        />
      </div>
    </div>
  );
}
