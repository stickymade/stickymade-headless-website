export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 py-8 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-6 text-sm text-black/50 dark:text-white/50">
        © {new Date().getFullYear()} Stickymade. Powered by Shopify.
      </div>
    </footer>
  );
}
