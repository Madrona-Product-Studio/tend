import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('@pages/Home'));
const GardenDetail = lazy(() => import('@pages/garden/GardenDetail'));

function LoadingFallback() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#4a7c59', fontSize: 14 }}>Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/garden/:gardenId" element={<GardenDetail />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
