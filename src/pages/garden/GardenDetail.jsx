import { useParams } from 'react-router-dom';

export default function GardenDetail() {
  const { gardenId } = useParams();
  return (
    <div style={{ padding: 52, fontFamily: 'Inter, sans-serif', color: '#1c1410' }}>
      <h2>Garden {gardenId}</h2>
      <p>Garden detail coming soon.</p>
    </div>
  );
}
