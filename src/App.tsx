import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('@pages/Home'));
const GardenDetail = lazy(() => import('@pages/garden/GardenDetail'));
const MapView = lazy(() => import('@pages/garden/MapView'));
const StyleGuide = lazy(() => import('@pages/StyleGuide'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-clay">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/garden/:gardenId" element={<GardenDetail />} />
          <Route path="/garden/:gardenId/map" element={<MapView />} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
