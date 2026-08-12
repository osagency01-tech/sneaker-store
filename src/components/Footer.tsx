export function Footer() {
  return (
    <footer className="mt-20 border-t border-paper-line bg-paper-soft">
      <div className="mx-auto grid max-w-app gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <div className="display text-lg">VANTOM</div>
          <p className="mt-2 max-w-xs text-sm text-ink-faint">
            Sneakers premium livrées en Afrique de l'Ouest. Paiement Mobile Money, sans compte.
          </p>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Boutique</div>
          <ul className="space-y-2 text-ink-soft">
            <li><a href="/shop" className="hover:text-ink">Tous les modèles</a></li>
            <li><a href="/shop?cat=running" className="hover:text-ink">Running</a></li>
            <li><a href="/shop?cat=lifestyle" className="hover:text-ink">Lifestyle</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Aide</div>
          <ul className="space-y-2 text-ink-soft">
            <li>Livraison Mobile Money</li>
            <li>Suivi de commande par lien</li>
            <li>Retours sous 7 jours</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper-line py-4 text-center tech text-xs text-ink-faint">
        © {new Date().getFullYear()} Vantom
      </div>
    </footer>
  );
}
