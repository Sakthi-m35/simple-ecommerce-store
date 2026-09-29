import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Heart,
  LampDesk,
  Leaf,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { calculateCartTotals, clampQuantity } from "@shared/storefront";

type Category = "All" | "Workspace" | "Carry" | "Home" | "Objects";
type ProductKind = "lamp" | "bag" | "vase" | "wallet";

type Product = {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  price: number;
  subtitle: string;
  description: string;
  tone: string;
  accent: string;
  kind: ProductKind;
  stock: number;
  badge?: string;
  featured?: boolean;
};

type CartLine = { product: Product; quantity: number };

const products: Product[] = [
  {
    id: "lumen-desk-lamp",
    name: "Lumen Desk Lamp",
    category: "Workspace",
    price: 148,
    subtitle: "A little light for big ideas.",
    description: "A softly sculpted aluminum lamp with a warm dimmable glow. Designed to make the last hour of work feel a little more intentional.",
    tone: "#dce8dc",
    accent: "#3b624c",
    kind: "lamp",
    stock: 12,
    badge: "New",
    featured: true,
  },
  {
    id: "arc-carryall",
    name: "Arc Carryall",
    category: "Carry",
    price: 116,
    subtitle: "Your daily essentials, held well.",
    description: "A structured, unlined carryall in soft vegetable-tanned leather. Room for your notebook, headphones, and the things you find along the way.",
    tone: "#f0dcc8",
    accent: "#a65335",
    kind: "bag",
    stock: 8,
    badge: "Best seller",
    featured: true,
  },
  {
    id: "mori-stoneware",
    name: "Mori Stoneware",
    category: "Home",
    price: 42,
    subtitle: "A quiet place for small things.",
    description: "Hand-finished stoneware with a satin glaze and generous shape. Each piece carries its own subtle variation.",
    tone: "#e9d8c6",
    accent: "#b78364",
    kind: "vase",
    stock: 24,
    featured: true,
  },
  {
    id: "nori-card-wallet",
    name: "Nori Card Wallet",
    category: "Carry",
    price: 58,
    subtitle: "Less pocket, more possibility.",
    description: "A compact card wallet that gets better with age. Four card slots, one folded-note pocket, zero fuss.",
    tone: "#e2e4de",
    accent: "#53665d",
    kind: "wallet",
    stock: 31,
    featured: true,
  },
  {
    id: "field-notebook",
    name: "Field Notebook",
    category: "Objects",
    price: 18,
    subtitle: "For notes worth keeping.",
    description: "A durable linen-bound notebook with dot-grid pages and a lay-flat spine for lists, sketches, and half-formed ideas.",
    tone: "#e7e1d7",
    accent: "#756d60",
    kind: "wallet",
    stock: 42,
  },
  {
    id: "still-tray",
    name: "Still Tray",
    category: "Home",
    price: 36,
    subtitle: "A landing place for the day.",
    description: "An understated oak catch-all for keys, rings, and the small daily rituals that deserve a home.",
    tone: "#efdfbf",
    accent: "#9b6a36",
    kind: "vase",
    stock: 17,
  },
];

const money = (value: number) => `$${value.toFixed(2)}`;

function ProductArtwork({ product, large = false }: { product: Product; large?: boolean }) {
  const iconProps = { size: large ? 92 : 62, strokeWidth: 1.15 };
  return (
    <div className="product-art relative flex h-full w-full items-center justify-center overflow-hidden" style={{ backgroundColor: product.tone }}>
      <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-black/10" />
      <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full border border-black/10" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/15" />
      <div className="relative z-10 flex flex-col items-center gap-3" style={{ color: product.accent }}>
        {product.kind === "lamp" && <LampDesk {...iconProps} />}
        {product.kind === "bag" && <ShoppingBag {...iconProps} />}
        {product.kind === "vase" && <Leaf {...iconProps} />}
        {product.kind === "wallet" && <CreditCard {...iconProps} />}
        {large && <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">field / goods</span>}
      </div>
    </div>
  );
}

function Header({ cartCount, onNavigate }: { cartCount: number; onNavigate: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = (path: string) => {
    setMenuOpen(false);
    setSearchOpen(false);
    onNavigate(path);
  };

  return (
    <>
      <div className="bg-[#24372d] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#f7f3ec] sm:text-xs">
        Complimentary shipping on orders over $75 <span className="mx-2 text-[#f1a488]">/</span> Built for everyday rituals
      </div>
      <header className="sticky top-0 z-30 border-b border-[#ded8ce]/80 bg-[#f7f3ec]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <button aria-label="Open menu" className="focus-ring rounded-full p-2 lg:hidden" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <button onClick={() => navigate("/")} className="focus-ring group flex items-center gap-2 rounded-md text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e56b43] text-[#fffaf4]"><Sparkles size={16} /></span>
            <span className="text-lg font-bold tracking-[-0.06em]">FIELD<span className="text-[#e56b43]">/</span>GOODS</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#536057] lg:flex">
            <button className="focus-ring rounded-sm hover:text-[#e56b43]" onClick={() => navigate("/shop")}>Shop all</button>
            <button className="focus-ring rounded-sm hover:text-[#e56b43]" onClick={() => navigate("/shop?category=Workspace")}>Workspace</button>
            <button className="focus-ring rounded-sm hover:text-[#e56b43]" onClick={() => navigate("/shop?category=Home")}>Home</button>
            <button className="focus-ring rounded-sm hover:text-[#e56b43]" onClick={() => navigate("/shop?category=Carry")}>Carry</button>
          </nav>
          <div className="flex items-center gap-1">
            <button aria-label="Search" className="focus-ring rounded-full p-2.5 hover:bg-[#eee8de]" onClick={() => setSearchOpen((open) => !open)}><Search size={19} /></button>
            <button aria-label="Account" className="focus-ring hidden rounded-full p-2.5 hover:bg-[#eee8de] sm:block" onClick={() => toast("Account space is coming soon") }><CircleUserRound size={19} /></button>
            <button aria-label={`Cart with ${cartCount} items`} className="focus-ring relative rounded-full p-2.5 hover:bg-[#eee8de]" onClick={() => navigate("/cart")}>
              <ShoppingBag size={19} />
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#e56b43] px-1 text-[10px] font-bold text-white">{cartCount}</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="border-t border-[#ded8ce] bg-[#fbf9f5] px-5 py-4">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <Search size={18} className="text-[#6b756e]" />
              <input autoFocus onKeyDown={(event) => event.key === "Enter" && navigate(`/shop?search=${encodeURIComponent(event.currentTarget.value)}`)} placeholder="Search considered objects..." className="focus-ring w-full bg-transparent text-sm outline-none placeholder:text-[#9ba39c]" />
              <button className="text-xs font-bold uppercase tracking-[0.18em] text-[#e56b43]" onClick={() => setSearchOpen(false)}>Close</button>
            </div>
          </div>
        )}
        {menuOpen && (
          <nav className="border-t border-[#ded8ce] bg-[#fbf9f5] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-4 text-lg font-semibold">
              <button className="text-left" onClick={() => navigate("/shop")}>Shop all</button>
              <button className="text-left" onClick={() => navigate("/shop?category=Workspace")}>Workspace</button>
              <button className="text-left" onClick={() => navigate("/shop?category=Home")}>Home</button>
              <button className="text-left" onClick={() => navigate("/shop?category=Carry")}>Carry</button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <footer className="mt-24 bg-[#24372d] px-5 py-12 text-[#f7f3ec] lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-2 text-lg font-bold tracking-[-0.06em]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e56b43]"><Sparkles size={16} /></span>FIELD/GOODS</div>
          <p className="max-w-xs text-sm leading-6 text-[#b8c1b6]">Good things, thoughtfully gathered. Objects that earn their place in your everyday.</p>
          <button onClick={() => onNavigate("/admin")} className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1a488]">Admin preview <ArrowUpRight size={13} className="ml-1 inline" /></button>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f1a488]">Explore</p>
          <div className="flex flex-col gap-3 text-sm text-[#d5ded4]"><button className="text-left hover:text-white" onClick={() => onNavigate("/shop")}>Shop all</button><button className="text-left hover:text-white" onClick={() => onNavigate("/shop?category=Workspace")}>Workspace</button><button className="text-left hover:text-white" onClick={() => onNavigate("/shop?category=Home")}>Home</button></div>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f1a488]">Help</p>
          <div className="flex flex-col gap-3 text-sm text-[#d5ded4]"><button className="text-left hover:text-white" onClick={() => toast("Returns are easy within 30 days")}>Shipping & returns</button><button className="text-left hover:text-white" onClick={() => toast("Say hello at hello@fieldgoods.example")}>Contact</button><button className="text-left hover:text-white" onClick={() => toast("Privacy policy coming soon")}>Privacy</button></div>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f1a488]">Stay in the field</p>
          <p className="mb-4 text-sm leading-6 text-[#d5ded4]">Notes on useful objects, small rituals, and what we are making room for.</p>
          <div className="flex border-b border-[#607167] pb-2"><input placeholder="Your email" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9dac9f]" /><button className="text-[#f1a488]" onClick={() => toast("You're on the list") }><ArrowRight size={18} /></button></div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-[#516358] pt-5 text-[10px] uppercase tracking-[0.18em] text-[#8d9b90] sm:flex-row sm:justify-between"><span>© 2026 Field / Goods</span><span>Made for slower, better days</span></div>
    </footer>
  );
}

function ProductCard({ product, onSelect, onAdd }: { product: Product; onSelect: () => void; onAdd: () => void }) {
  return (
    <article className="product-card reveal group">
      <button onClick={onSelect} className="focus-ring relative block aspect-[4/4.5] w-full overflow-hidden rounded-[4px] text-left">
        <ProductArtwork product={product} />
        {product.badge && <span className="absolute left-4 top-4 rounded-full bg-[#f7f3ec] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#24372d]">{product.badge}</span>}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#f7f3ec] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} /></span>
      </button>
      <div className="flex items-start justify-between gap-3 pt-4">
        <button onClick={onSelect} className="focus-ring text-left"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#e56b43]">{product.category}</p><h3 className="mt-1 text-base font-semibold tracking-[-0.02em]">{product.name}</h3><p className="mt-1 text-sm text-[#6b756e]">{product.subtitle}</p></button>
        <div className="flex flex-col items-end gap-2"><span className="text-sm font-semibold">{money(product.price)}</span><button onClick={onAdd} className="focus-ring rounded-full border border-[#cfc8bd] p-2 transition-colors hover:border-[#e56b43] hover:bg-[#e56b43] hover:text-white" aria-label={`Add ${product.name} to cart`}><Plus size={16} /></button></div>
      </div>
    </article>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1e2b24]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="reveal relative grid max-h-[90vh] w-full max-w-4xl overflow-auto bg-[#fbf9f5] sm:grid-cols-2 sm:rounded-2xl">
        <button onClick={onClose} className="focus-ring absolute right-4 top-4 z-10 rounded-full bg-[#f7f3ec] p-2"><X size={18} /></button>
        <div className="min-h-[360px] sm:min-h-[560px]"><ProductArtwork product={product} large /></div>
        <div className="flex flex-col justify-center p-7 sm:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e56b43]">{product.category} / {product.stock} in stock</p><h2 className="serif mt-4 text-5xl leading-[.92] sm:text-6xl">{product.name}</h2><p className="mt-5 text-base leading-7 text-[#6b756e]">{product.description}</p><div className="mt-8 flex items-center justify-between border-y border-[#ded8ce] py-5"><span className="text-xl font-semibold">{money(product.price)}</span><span className="text-xs font-semibold uppercase tracking-[.15em] text-[#6b756e]">Ships in 2–4 days</span></div><button onClick={onAdd} className="mt-8 flex items-center justify-center gap-3 rounded-full bg-[#e56b43] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#c95431]"><ShoppingBag size={17} /> Add to cart</button><button onClick={onClose} className="mt-4 text-center text-xs font-bold uppercase tracking-[.16em] text-[#6b756e]">Keep browsing</button></div>
      </div>
    </div>
  );
}

function HomePage({ onNavigate, onSelect, onAdd }: { onNavigate: (path: string) => void; onSelect: (product: Product) => void; onAdd: (product: Product) => void }) {
  const featured = products.filter((product) => product.featured);
  return (
    <>
      <main>
        <section className="paper-grid overflow-hidden px-5 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-20">
            <div className="reveal max-w-xl">
              <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e56b43]"><span className="h-px w-8 bg-[#e56b43]" /> Considered goods for everyday</div>
              <h1 className="serif text-[clamp(4.2rem,10vw,8.2rem)] leading-[.84] tracking-[-0.05em]">Make room<br /><em className="text-[#e56b43]">for good</em> things.</h1>
              <p className="mt-8 max-w-md text-base leading-7 text-[#6b756e]">Objects with a point of view, made to be lived with. A small collection of useful, beautiful things for the spaces between.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><button onClick={() => onNavigate("/shop")} className="focus-ring flex items-center gap-3 rounded-full bg-[#24372d] px-6 py-3.5 text-sm font-bold text-[#f7f3ec] transition hover:bg-[#35513f]">Explore the collection <ArrowRight size={17} /></button><button onClick={() => onNavigate("/shop?category=Workspace")} className="focus-ring rounded-full border border-[#bfb8ac] px-6 py-3.5 text-sm font-bold hover:border-[#24372d]">Shop workspace</button></div>
              <div className="mt-12 flex items-center gap-4 text-xs text-[#6b756e]"><div className="flex -space-x-2"><span className="h-8 w-8 rounded-full border-2 border-[#f7f3ec] bg-[#e56b43]" /><span className="h-8 w-8 rounded-full border-2 border-[#f7f3ec] bg-[#9db79e]" /><span className="h-8 w-8 rounded-full border-2 border-[#f7f3ec] bg-[#e9d6b8]" /></div><span>Loved by 2,400+ everyday people</span></div>
            </div>
            <div className="reveal relative min-h-[450px] [animation-delay:120ms] lg:min-h-[650px]">
              <div className="absolute left-0 top-2 z-10 rounded-full bg-[#e56b43] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white lg:left-5">New / field notes 01</div>
              <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[#dbe5d7] shadow-[18px_20px_0_0_#e9d6b8] lg:inset-x-8"><img src="/manus-storage/uEWQe0q8iWxB_2133bdcb.jpg" alt="Thoughtfully arranged workspace with useful everyday objects" className="h-full w-full object-cover mix-blend-multiply opacity-90" /><div className="absolute inset-0 bg-gradient-to-tr from-[#24372d]/35 via-transparent to-[#f7f3ec]/5" /><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white"><div><p className="text-[10px] font-bold uppercase tracking-[.18em]">The workspace edit</p><p className="serif mt-1 text-3xl">Things that help you begin.</p></div><button onClick={() => onNavigate("/shop?category=Workspace")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f3ec] text-[#24372d]"><ArrowUpRight size={19} /></button></div></div>
              <div className="absolute -bottom-5 -right-2 hidden h-28 w-28 rounded-full border border-[#e56b43] lg:block" />
            </div>
          </div>
        </section>
        <div className="marquee border-y border-[#ded8ce] py-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#6b756e]"><div className="marquee-track gap-12"><span>Useful by design</span><span className="text-[#e56b43]">✳</span><span>Made to last</span><span className="text-[#e56b43]">✳</span><span>Small batch / big feeling</span><span className="text-[#e56b43]">✳</span><span>Useful by design</span><span className="text-[#e56b43]">✳</span><span>Made to last</span><span className="text-[#e56b43]">✳</span><span>Small batch / big feeling</span></div></div>
        <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">01 / The collection</p><h2 className="serif mt-3 text-5xl leading-none sm:text-6xl">Meet the good stuff.</h2></div><button onClick={() => onNavigate("/shop")} className="hidden items-center gap-2 text-sm font-bold text-[#e56b43] sm:flex">View all goods <ArrowUpRight size={17} /></button></div><div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} onSelect={() => onSelect(product)} onAdd={() => onAdd(product)} />)}</div><button onClick={() => onNavigate("/shop")} className="mt-12 flex w-full items-center justify-center gap-2 rounded-full border border-[#bfb8ac] py-3.5 text-sm font-bold sm:hidden">View all goods <ArrowRight size={16} /></button></div></section>
        <section className="px-5 pb-20 lg:px-8 lg:pb-28"><div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="relative min-h-[440px] overflow-hidden rounded-[3px] bg-[#e56b43] p-8 text-[#fffaf4] sm:p-12"><div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/30" /><div className="absolute bottom-8 right-8 opacity-90"><Sparkles size={90} strokeWidth={.7} /></div><div className="relative z-10 flex h-full max-w-md flex-col justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#ffe1d4]">A slower kind of shopping</p><h2 className="serif mt-6 text-6xl leading-[.88] sm:text-7xl">Keep<br />what feels<br /><em>right.</em></h2></div><button onClick={() => toast("We believe fewer, better things make better days") } className="mt-10 flex items-center gap-2 text-sm font-bold">Our point of view <ArrowUpRight size={17} /></button></div></div><div className="flex min-h-[440px] flex-col justify-between rounded-[3px] bg-[#dfe8dc] p-8 text-[#24372d] sm:p-12"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#3b624c]">02 / Good to know</p><h3 className="serif mt-6 text-5xl leading-[.88]">Built for the<br /><em>long haul.</em></h3></div><div><div className="mb-6 h-px bg-[#b7c8b5]" /><div className="grid grid-cols-3 gap-4 text-xs leading-5"><div><ShieldCheck size={19} className="mb-3" /><p className="font-bold">Thoughtfully sourced</p></div><div><RotateCcw size={19} className="mb-3" /><p className="font-bold">Easy 30-day returns</p></div><div><Package size={19} className="mb-3" /><p className="font-bold">Packed with care</p></div></div></div></div></div></section>
      </main>
      <Footer onNavigate={onNavigate} />
    </>
  );
}

function ShopPage({ onNavigate, onSelect, onAdd }: { onNavigate: (path: string) => void; onSelect: (product: Product) => void; onAdd: (product: Product) => void }) {
  const params = new URLSearchParams(window.location.search);
  const initialCategory = (params.get("category") as Category) || "All";
  const initialSearch = params.get("search") || "";
  const [category, setCategory] = useState<Category>(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");
  const categories: Category[] = ["All", "Workspace", "Carry", "Home", "Objects"];
  const filtered = useMemo(() => {
    const result = products.filter((product) => (category === "All" || product.category === category) && `${product.name} ${product.subtitle}`.toLowerCase().includes(search.toLowerCase()));
    return [...result].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [category, search, sort]);
  return <main className="min-h-[70vh] px-5 py-12 lg:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-7 border-b border-[#ded8ce] pb-10 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">The collection</p><h1 className="serif mt-3 text-6xl leading-[.9] sm:text-8xl">All good things.</h1><p className="mt-5 max-w-lg text-sm leading-6 text-[#6b756e]">A considered edit of objects for the spaces you live, work, carry, and return to.</p></div><div className="flex items-center gap-3 text-sm text-[#6b756e]"><span className="hidden sm:inline">Sort by</span><label className="relative"><select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring appearance-none rounded-full border border-[#cfc8bd] bg-transparent py-2.5 pl-4 pr-9 text-sm font-semibold outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5" /></label></div></div><div className="flex flex-col gap-4 border-b border-[#ded8ce] py-5 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`focus-ring rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? "bg-[#24372d] text-[#f7f3ec]" : "border border-[#d6cfc4] text-[#6b756e] hover:border-[#24372d] hover:text-[#24372d]"}`}>{item}</button>)}</div><label className="flex min-w-[220px] items-center gap-2 border-b border-[#cfc8bd] pb-2 text-sm text-[#6b756e]"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the edit" className="w-full bg-transparent outline-none placeholder:text-[#9ba39c]" /></label></div>{filtered.length > 0 ? <div className="grid gap-x-5 gap-y-12 py-10 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} onSelect={() => onSelect(product)} onAdd={() => onAdd(product)} />)}</div> : <div className="flex min-h-[280px] flex-col items-center justify-center text-center"><Search size={30} className="mb-4 text-[#e56b43]" /><h2 className="serif text-4xl">Nothing here yet.</h2><p className="mt-2 text-sm text-[#6b756e]">Try another category or search term.</p><button onClick={() => { setCategory("All"); setSearch(""); }} className="mt-6 text-xs font-bold uppercase tracking-[.17em] text-[#e56b43]">Clear filters</button></div>}</div></main>;
}

function QuantityControl({ quantity, onDecrease, onIncrease }: { quantity: number; onDecrease: () => void; onIncrease: () => void }) {
  return <div className="flex items-center gap-3 rounded-full border border-[#d6cfc4] px-2 py-1"><button aria-label="Decrease quantity" onClick={onDecrease} className="focus-ring rounded-full p-1 hover:bg-[#eee8de]"><Minus size={14} /></button><span className="w-4 text-center text-sm font-bold">{quantity}</span><button aria-label="Increase quantity" onClick={onIncrease} className="focus-ring rounded-full p-1 hover:bg-[#eee8de]"><Plus size={14} /></button></div>;
}

function CartPage({ cart, setCart, onNavigate, onSelect }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>>; onNavigate: (path: string) => void; onSelect: (product: Product) => void }) {
  const { subtotal, shipping, total } = calculateCartTotals(cart.map((line) => ({ price: line.product.price, quantity: line.quantity })));
  const update = (id: string, delta: number) => setCart((lines) => lines.map((line) => line.product.id === id ? { ...line, quantity: clampQuantity(line.quantity + delta, line.product.stock) } : line).filter((line) => line.quantity > 0));
  return <main className="min-h-[70vh] px-5 py-12 lg:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between border-b border-[#ded8ce] pb-8"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">Your edit</p><h1 className="serif mt-3 text-6xl leading-none sm:text-8xl">The bag.</h1></div><span className="text-sm text-[#6b756e]">{cart.length} {cart.length === 1 ? "item" : "items"}</span></div>{cart.length === 0 ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><ShoppingBag size={38} className="mb-5 text-[#e56b43]" /><h2 className="serif text-5xl">A little empty here.</h2><p className="mt-3 text-sm text-[#6b756e]">Good things are waiting to be found.</p><button onClick={() => onNavigate("/shop")} className="mt-7 flex items-center gap-2 rounded-full bg-[#24372d] px-6 py-3.5 text-sm font-bold text-[#f7f3ec]">Browse the collection <ArrowRight size={16} /></button></div> : <div className="grid gap-12 py-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-24"><div className="space-y-6">{cart.map((line) => <div key={line.product.id} className="flex gap-4 border-b border-[#ded8ce] pb-6 sm:gap-6"><button onClick={() => onSelect(line.product)} className="focus-ring h-28 w-24 shrink-0 overflow-hidden rounded-[3px] sm:h-36 sm:w-32"><ProductArtwork product={line.product} /></button><div className="flex min-w-0 flex-1 flex-col justify-between"><div className="flex justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e56b43]">{line.product.category}</p><button onClick={() => onSelect(line.product)} className="focus-ring mt-1 text-left text-base font-semibold">{line.product.name}</button><p className="mt-1 text-sm text-[#6b756e]">{line.product.subtitle}</p></div><span className="text-sm font-semibold">{money(line.product.price * line.quantity)}</span></div><div className="flex items-center justify-between"><QuantityControl quantity={line.quantity} onDecrease={() => update(line.product.id, -1)} onIncrease={() => update(line.product.id, 1)} /><button onClick={() => setCart((lines) => lines.filter((item) => item.product.id !== line.product.id))} className="focus-ring text-xs font-bold uppercase tracking-[.14em] text-[#6b756e] hover:text-[#e56b43]">Remove</button></div></div></div>)}</div><div className="h-fit rounded-[3px] bg-[#dfe8dc] p-7 sm:p-9"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#3b624c]">Order summary</p><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><span className="text-[#6b756e]">Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#6b756e]">Shipping</span><span className="font-semibold">{shipping === 0 ? "Complimentary" : money(shipping)}</span></div><div className="border-t border-[#b7c8b5] pt-4"><div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(total)}</span></div><p className="mt-2 text-xs text-[#53665d]">Taxes calculated at checkout.</p></div></div><button onClick={() => onNavigate("/checkout")} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#e56b43] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#c95431]">Continue to checkout <ArrowRight size={17} /></button><p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#53665d]"><ShieldCheck size={15} /> Secure, encrypted checkout</p></div></div>}</div></main>;
}

function CheckoutPage({ cart, onNavigate, onComplete }: { cart: CartLine[]; onNavigate: (path: string) => void; onComplete: (orderNumber: string) => void }) {
  const { subtotal, shipping, total } = calculateCartTotals(cart.map((line) => ({ price: line.product.price, quantity: line.quantity })));
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", postal: "" });
  const [paying, setPaying] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!cart.length) { onNavigate("/shop"); return; } setPaying(true); window.setTimeout(() => { setPaying(false); onComplete(`FG-${Math.floor(100000 + Math.random() * 900000)}`); }, 900); };
  return <main className="min-h-[70vh] px-5 py-12 lg:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><button onClick={() => onNavigate("/cart")} className="focus-ring mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#6b756e]"><ArrowLeft size={15} /> Back to bag</button><div className="grid gap-12 lg:grid-cols-[1fr_.65fr] lg:gap-24"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">Almost yours</p><h1 className="serif mt-3 text-6xl leading-none sm:text-8xl">Checkout.</h1><form onSubmit={submit} className="mt-12 space-y-9"><fieldset><legend className="mb-5 text-[10px] font-bold uppercase tracking-[.22em]">Contact</legend><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} /><Field label="Email address" type="email" value={form.email} required onChange={(value) => setForm({ ...form, email: value })} /><Field label="Phone (optional)" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /></div></fieldset><fieldset><legend className="mb-5 text-[10px] font-bold uppercase tracking-[.22em]">Shipping address</legend><div className="grid gap-4"><Field label="Address" value={form.address} required onChange={(value) => setForm({ ...form, address: value })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="City" value={form.city} required onChange={(value) => setForm({ ...form, city: value })} /><Field label="Postal code" value={form.postal} required onChange={(value) => setForm({ ...form, postal: value })} /></div></div></fieldset><fieldset><legend className="mb-5 text-[10px] font-bold uppercase tracking-[.22em]">Payment</legend><div className="flex items-center justify-between rounded-[3px] border border-[#cfc8bd] bg-[#fbf9f5] p-4"><div className="flex items-center gap-3"><CreditCard size={19} className="text-[#e56b43]" /><div><p className="text-sm font-semibold">Card payment</p><p className="mt-1 text-xs text-[#6b756e]">Secure demo checkout — no card details stored.</p></div></div><ShieldCheck size={17} className="text-[#3b624c]" /></div></fieldset><button disabled={paying} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[#24372d] px-6 py-4 text-sm font-bold text-[#f7f3ec] transition hover:bg-[#35513f] disabled:cursor-wait disabled:opacity-70">{paying ? "Confirming your order..." : `Place order · ${money(total)}`} {!paying && <ArrowRight size={17} />}</button><p className="flex items-center justify-center gap-2 text-center text-xs text-[#6b756e]"><Truck size={15} /> Ships within 2–4 business days</p></form></div><aside className="h-fit rounded-[3px] bg-[#dfe8dc] p-7 sm:p-9 lg:sticky lg:top-32"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#3b624c]">Your order</p><div className="mt-7 space-y-5">{cart.map((line) => <div key={line.product.id} className="flex items-center gap-3"><div className="h-14 w-12 shrink-0 overflow-hidden rounded-[2px]"><ProductArtwork product={line.product} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{line.product.name}</p><p className="mt-1 text-xs text-[#53665d]">Qty {line.quantity}</p></div><span className="text-sm font-semibold">{money(line.product.price * line.quantity)}</span></div>)}{cart.length === 0 && <p className="text-sm text-[#6b756e]">Your bag is empty.</p>}</div><div className="mt-7 space-y-3 border-t border-[#b7c8b5] pt-5 text-sm"><div className="flex justify-between"><span className="text-[#53665d]">Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-[#53665d]">Shipping</span><span>{shipping === 0 ? "Complimentary" : money(shipping)}</span></div><div className="flex justify-between border-t border-[#b7c8b5] pt-3 text-base font-bold"><span>Total</span><span>{money(total)}</span></div></div></aside></div></div></main>;
}

function Field({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <label className="block text-sm"><span className="mb-2 block text-xs font-semibold text-[#6b756e]">{label}{required && <span className="ml-1 text-[#e56b43]">*</span>}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring w-full rounded-[3px] border border-[#cfc8bd] bg-[#fbf9f5] px-4 py-3 outline-none transition focus:border-[#e56b43]" /></label>;
}

function ConfirmationPage({ orderNumber, onNavigate }: { orderNumber: string; onNavigate: (path: string) => void }) {
  return <main className="paper-grid flex min-h-[70vh] items-center px-5 py-16 lg:px-8"><div className="mx-auto w-full max-w-2xl text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e56b43] text-white"><Check size={30} /></div><p className="mt-8 text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">Order confirmed / {orderNumber}</p><h1 className="serif mt-4 text-7xl leading-[.85] sm:text-9xl">Good choice.</h1><p className="mx-auto mt-7 max-w-md text-base leading-7 text-[#6b756e]">Your order is on its way to becoming part of your everyday. We sent a confirmation email with all the details.</p><div className="mx-auto mt-10 grid max-w-lg gap-3 sm:grid-cols-3"><div className="rounded-[3px] bg-[#dfe8dc] p-4"><Package size={20} className="mx-auto mb-3 text-[#3b624c]" /><p className="text-xs font-bold">Packed with care</p></div><div className="rounded-[3px] bg-[#f0dcc8] p-4"><Truck size={20} className="mx-auto mb-3 text-[#a65335]" /><p className="text-xs font-bold">Ships in 2–4 days</p></div><div className="rounded-[3px] bg-[#e7e1d7] p-4"><Heart size={20} className="mx-auto mb-3 text-[#756d60]" /><p className="text-xs font-bold">Made to keep</p></div></div><button onClick={() => onNavigate("/shop")} className="mt-10 flex items-center gap-2 mx-auto rounded-full bg-[#24372d] px-6 py-3.5 text-sm font-bold text-[#f7f3ec]">Continue browsing <ArrowRight size={17} /></button></div></main>;
}

function AdminPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [active, setActive] = useState<"products" | "orders">("products");
  return <main className="min-h-[70vh] bg-[#eee8de] px-5 py-10 lg:px-8 lg:py-14"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#e56b43]">Store operations / preview</p><h1 className="serif mt-3 text-6xl leading-none sm:text-8xl">Control room.</h1></div><button onClick={() => onNavigate("/")} className="flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[.16em] text-[#6b756e] md:self-auto"><ArrowLeft size={15} /> Back to store</button></div><div className="mt-10 grid gap-4 sm:grid-cols-3"><Metric label="Live products" value="06" note="All healthy" /><Metric label="Open orders" value="24" note="4 need packing" /><Metric label="This month" value="$8.4k" note="+18% vs last month" /></div><div className="mt-10 rounded-[3px] bg-[#fbf9f5] p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-[#ded8ce] pb-5 sm:flex-row sm:items-center"><div className="flex gap-2"><button onClick={() => setActive("products")} className={`rounded-full px-4 py-2 text-xs font-bold ${active === "products" ? "bg-[#24372d] text-[#f7f3ec]" : "border border-[#d6cfc4] text-[#6b756e]"}`}>Products</button><button onClick={() => setActive("orders")} className={`rounded-full px-4 py-2 text-xs font-bold ${active === "orders" ? "bg-[#24372d] text-[#f7f3ec]" : "border border-[#d6cfc4] text-[#6b756e]"}`}>Orders</button></div><button onClick={() => toast("Product editor is ready for database wiring") } className="flex items-center gap-2 rounded-full bg-[#e56b43] px-4 py-2.5 text-xs font-bold text-white"><Plus size={15} /> Add product</button></div>{active === "products" ? <div className="divide-y divide-[#ded8ce]">{products.map((product) => <div key={product.id} className="flex items-center gap-4 py-5"><div className="h-14 w-12 shrink-0 overflow-hidden rounded-[2px]"><ProductArtwork product={product} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-[#6b756e]">{product.category} <span className="mx-1">·</span> {product.stock} in stock</p></div><span className="hidden text-sm font-semibold sm:block">{money(product.price)}</span><span className="rounded-full bg-[#dfe8dc] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#3b624c]">Active</span><button onClick={() => toast(`${product.name} editor opened`) } className="focus-ring rounded-full border border-[#d6cfc4] px-3 py-2 text-xs font-bold">Edit</button></div>)}</div> : <div className="divide-y divide-[#ded8ce]">{["FG-104823", "FG-104822", "FG-104821", "FG-104817"].map((order, index) => <div key={order} className="flex flex-wrap items-center gap-3 py-5"><div className="flex-1"><p className="text-sm font-semibold">{order}</p><p className="mt-1 text-xs text-[#6b756e]">{index + 1} item{index === 0 ? "s" : ""} <span className="mx-1">·</span> {index === 0 ? "Today" : `${index + 1} days ago`}</p></div><span className="text-sm font-semibold">{money(148 - index * 24)}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] ${index === 0 ? "bg-[#f5c2a8] text-[#8e3d25]" : "bg-[#dfe8dc] text-[#3b624c]"}`}>{index === 0 ? "Packing" : "Shipped"}</span><button onClick={() => toast(`${order} details opened`) } className="focus-ring rounded-full border border-[#d6cfc4] px-3 py-2 text-xs font-bold">View</button></div>)}</div>}</div><p className="mt-5 flex items-center gap-2 text-xs text-[#6b756e]"><ShieldCheck size={15} /> Protected admin area placeholder — connect to the included auth and database layer before launch.</p></div></main>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-[3px] bg-[#24372d] p-6 text-[#f7f3ec]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a9b9aa]">{label}</p><p className="serif mt-3 text-5xl">{value}</p><p className="mt-2 text-xs text-[#c3d0c3]">{note}</p></div>;
}

export default function Home() {
  const [location, navigate] = useLocation();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderNumber, setOrderNumber] = useState("FG-104824");
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [location]);

  const addToCart = (product: Product) => {
    setCart((lines) => { const existing = lines.find((line) => line.product.id === product.id); return existing ? lines.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(product.stock, line.quantity + 1) } : line) : [...lines, { product, quantity: 1 }]; });
    setSelectedProduct(null);
    toast(`${product.name} added to your bag`, { action: { label: "View bag", onClick: () => navigate("/cart") } });
  };

  const go = (path: string) => { setSelectedProduct(null); navigate(path); };
  const page = location.split("?")[0];
  let content = <HomePage onNavigate={go} onSelect={setSelectedProduct} onAdd={addToCart} />;
  if (page === "/shop") content = <><ShopPage onNavigate={go} onSelect={setSelectedProduct} onAdd={addToCart} /><Footer onNavigate={go} /></>;
  if (page === "/cart") content = <><CartPage cart={cart} setCart={setCart} onNavigate={go} onSelect={setSelectedProduct} /><Footer onNavigate={go} /></>;
  if (page === "/checkout") content = <><CheckoutPage cart={cart} onNavigate={go} onComplete={(number) => { setOrderNumber(number); setCart([]); go("/order-confirmed"); }} /><Footer onNavigate={go} /></>;
  if (page === "/order-confirmed") content = <><ConfirmationPage orderNumber={orderNumber} onNavigate={go} /><Footer onNavigate={go} /></>;
  if (page === "/admin") content = <AdminPage onNavigate={go} />;

  return <div className="min-h-screen bg-[#f7f3ec] text-[#1e2b24]">{page !== "/admin" && <Header cartCount={cartCount} onNavigate={go} />}{content}{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => addToCart(selectedProduct)} />}</div>;
}
