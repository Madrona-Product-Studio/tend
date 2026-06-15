import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('@pages/Home'));
const GardenView = lazy(() => import('@pages/garden/GardenView'));
const ZoneView = lazy(() => import('@pages/garden/ZoneView'));
const BedView = lazy(() => import('@pages/garden/BedView'));
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
          <Route path="/garden/:gardenId" element={<GardenView />} />
          <Route path="/garden/:gardenId/zone/:zoneId" element={<ZoneView />} />
          <Route path="/garden/:gardenId/bed/:bedId" element={<BedView />} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
