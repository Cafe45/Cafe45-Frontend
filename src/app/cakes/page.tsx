import CakePage from '@/components/views/CakePage';

// Bra för SEO (Syns i webbläsarfliken)
export const metadata = {
  title: 'Beställ Tårta | Café 45',
  description: 'Skräddarsy din egen tårta eller välj från våra favoriter.',
};

export default function Page() {
  return <CakePage />;
}