import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/listings`);
      return response.data;
    }
  });
}

export default function App() {
  const { data: listings = [], isLoading, isError } = useListings();

  return (
    <div className="page">
      <header className="hero">
        <h1>Hemnet Marketplace</h1>
        <p>Discover curated property listings from trusted agents across Sweden.</p>
      </header>

      {isLoading && <p>Loading listings…</p>}
      {isError && <p role="alert">Unable to load listings. Please try again later.</p>}

      <section className="grid">
        {listings.map((listing) => (
          <article key={listing.id} className="card">
            {listing.image_url && (
              <img src={listing.image_url} alt={listing.title} className="card__image" />
            )}
            <div className="card__body">
              <h2>{listing.title}</h2>
              <p className="card__location">{listing.location}</p>
              <p className="card__price">{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(listing.price)}</p>
              {listing.size && <p className="card__size">{listing.size} m²</p>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
