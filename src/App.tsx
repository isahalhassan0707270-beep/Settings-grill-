import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Phone,
  Clock,
  Sparkles,
  MapPin,
  Star,
  Check,
  Copy,
  UtensilsCrossed,
  Truck,
  Menu,
  X,
  ShoppingCart,
  Plus,
  Minus,
  MessageCircle,
  ThumbsUp,
  Award
} from "lucide-react";

// Images generated via asset pipeline
import heroBannerImg from "./assets/images/grill_hero_banner_1781115553144.png";
import suyaImg from "./assets/images/stick_suya_1781115567263.png";
import chickenImg from "./assets/images/grilled_chicken_1781115582162.png";
import catfishImg from "./assets/images/grilled_catfish_1781115594858.png";

// Core brand phone/WhatsApp lines
const WHATSAPP_NUMBER = "+2347072707429";
const CALL_NUMBER = "+2347072707429";
const AUX_NUMBER = "+2349019048308";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  spicyRange: string[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "stick-suya",
    name: "Stick Suya",
    price: 4500,
    description: "Smoky, spiced tender beef skewered to perfection and grilled over raw wood coals, coated generously with authentic Northern Nigerian Yaji pepper spice.",
    image: suyaImg,
    spicyRange: ["Mild", "Medium-Hot", "Suya Hazard (Insanely Hot! 🔥)"]
  },
  {
    id: "grilled-chicken",
    name: "Juicy Grilled Chicken",
    price: 6500,
    description: "Plump quarter chicken flame-grilled to sizzling golden-brown perfection. Glistening with our signature pepper-glaze marinade. Tender to the bone.",
    image: chickenImg,
    spicyRange: ["Mild", "Smoky BBQ", "Fiery Red Glaze 🔥"]
  },
  {
    id: "grilled-catfish",
    name: "Grilled Catfish",
    price: 12500,
    description: "Succulent, freshly-caught whole catfish slow-grilled and basted with an aromatic rich red bell pepper soup paste. The ultimate Nigerian grill classic.",
    image: catfishImg,
    spicyRange: ["Standard Heat", "Original Spicy", "Viper Pepper Threat 🔥🔥🔥"]
  }
];

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  basePrice: number;
  quantity: number;
  spiceLevel: string;
  sides: { name: string; price: number }[];
}

interface PastOrder {
  id: string;
  timestamp: string;
  items: {
    name: string;
    quantity: number;
    spiceLevel: string;
    sides: string[];
    price: number;
  }[];
  total: number;
  customerName: string;
  deliveryAddress: string;
}

export default function App() {
  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smokehouse Order Draft Builder state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userName, setUserName] = useState("");
  const [userAddress, setUserAddress] = useState("");

  // History states
  const [orderHistory, setOrderHistory] = useState<PastOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("settings_grill_orders");
      if (raw) {
        setOrderHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error loading order history", e);
    }
  }, []);
  
  // Dynamic configuration state for each item (currently selected customization on the card)
  const [customizer, setCustomizer] = useState<{
    [itemId: string]: {
      spice: string;
      quantity: number;
      sides: { [sideName: string]: boolean };
    };
  }>({
    "stick-suya": { spice: "Medium-Hot", quantity: 1, sides: {} },
    "grilled-chicken": { spice: "Fiery Red Glaze 🔥", quantity: 1, sides: {} },
    "grilled-catfish": { spice: "Original Spicy", quantity: 1, sides: {} }
  });

  // State to handle copy to clipboard feedback
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Available side dishes
  const SIDE_OPTIONS = [
    { name: "Extra Onions & Pepper", price: 500 },
    { name: "Sweet Fried Plantain (Dodo)", price: 1500 },
    { name: "Fresh Steamed Cabbage Pack", price: 1000 },
    { name: "Grill-Baked Sweet Potatoes", price: 1200 }
  ];

  // Helper to handle copying numbers
  const handleCopyNumber = (phoneStr: string, label: string) => {
    navigator.clipboard.writeText(phoneStr);
    setCopiedNumber(label);
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2500);
  };

  // Customizer functions
  const handleSpiceChange = (itemId: string, spiceLevel: string) => {
    setCustomizer(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        spice: spiceLevel
      }
    }));
  };

  const handleQtyChange = (itemId: string, direction: "inc" | "dec") => {
    setCustomizer(prev => {
      const currentQty = prev[itemId].quantity;
      let newQty = currentQty;
      if (direction === "inc") newQty += 1;
      if (direction === "dec" && currentQty > 1) newQty -= 1;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: newQty
        }
      };
    });
  };

  const handleSideToggle = (itemId: string, sideName: string) => {
    setCustomizer(prev => {
      const currentSides = { ...prev[itemId].sides };
      currentSides[sideName] = !currentSides[sideName];
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          sides: currentSides
        }
      };
    });
  };

  // Add customized item to the interactive draft cart
  const addToDraft = (item: MenuItem) => {
    const config = customizer[item.id];
    const selectedSides = SIDE_OPTIONS.filter(side => config.sides[side.name]);
    
    // Create a unique id based on customizations
    const cartItemId = `${item.id}-${config.spice}-${selectedSides.map(s => s.name).sort().join("-")}`;

    setCart(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + config.quantity } : i);
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            menuId: item.id,
            name: item.name,
            basePrice: item.price,
            quantity: config.quantity,
            spiceLevel: config.spice,
            sides: selectedSides
          }
        ];
      }
    });

    // Pulse feedback or scroll helper can go here, but doing simple reset on card quantity to 1 for next add
    setCustomizer(prev => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        quantity: 1,
        sides: {} // reset sides
      }
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartId));
  };

  // Total calculation
  const calculateItemTotal = (item: CartItem) => {
    const sidesCost = item.sides.reduce((sum, side) => sum + side.price, 0);
    return (item.basePrice + sidesCost) * item.quantity;
  };

  const totalCartCost = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  // Generate WhatsApp Order API URL
  const getWhatsAppURL = () => {
    if (cart.length === 0) {
      // Direct general WhatsApp if cart is empty
      return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=Hello%20Settings%20Grill!%20I'd%20like%20to%20view%20the%20active%20menu%20and%20order%20some%20smoky%2520hot%2520grills.`;
    }

    let message = `🔥 *NEW SETTINGS GRILL ORDER* 🔥\n\n`;
    if (userName) message += `👤 *Customer Name:* ${userName}\n`;
    if (userAddress) message += `📍 *Delivery Address:* ${userAddress}\n\n`;
    
    message += `📝 *Order Details:*\n`;
    cart.forEach((item, index) => {
      const sidesText = item.sides.length > 0 ? ` (Sides: ${item.sides.map(s => s.name).join(", ")})` : "";
      message += `${index + 1}. *x${item.quantity} ${item.name}*\n`;
      message += `   🌶️ _Spice:_ ${item.spiceLevel}\n`;
      if (sidesText) message += `   🥗 _Add-ons:_ ${sidesText}\n`;
      message += `   💵 _Subtotal:_ ₦${calculateItemTotal(item).toLocaleString()}\n\n`;
    });

    message += `------------------------------\n`;
    message += `💰 *Estimated Total:* ₦${totalCartCost.toLocaleString()}\n`;
    message += `📱 _Grilled to perfection. Delivered piping hot._\n\n`;
    message += `Please confirm availability. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${encodedMessage}`;
  };

  const logOrderToHistory = () => {
    if (cart.length === 0) return;

    const newOrder: PastOrder = {
      id: `SG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        spiceLevel: item.spiceLevel,
        sides: item.sides.map(s => s.name),
        price: calculateItemTotal(item)
      })),
      total: totalCartCost,
      customerName: userName.trim() || "Valued Patron",
      deliveryAddress: userAddress.trim() || "Self Pickup / Call-In"
    };

    const updatedHistory = [newOrder, ...orderHistory].slice(0, 20);
    setOrderHistory(updatedHistory);
    localStorage.setItem("settings_grill_orders", JSON.stringify(updatedHistory));
  };

  const handleReorder = (pastOrder: PastOrder) => {
    const newCartItems: CartItem[] = pastOrder.items.map((item, idx) => {
      const menuItem = MENU_ITEMS.find(m => m.name === item.name);
      const menuId = menuItem ? menuItem.id : "stick-suya";
      const resolvedSides = item.sides.map(sideName => {
        const matchSide = SIDE_OPTIONS.find(s => s.name === sideName);
        return {
          name: sideName,
          price: matchSide ? matchSide.price : 1000
        };
      });
      const basePrice = menuItem ? menuItem.price : (item.price / item.quantity);

      return {
        id: `${menuId}-${item.spiceLevel}-${item.sides.sort().join("-")}-${Date.now()}-${idx}`,
        menuId,
        name: item.name,
        basePrice,
        quantity: item.quantity,
        spiceLevel: item.spiceLevel,
        sides: resolvedSides
      };
    });

    setCart(newCartItems);
    
    if (pastOrder.customerName && pastOrder.customerName !== "Valued Patron") {
      setUserName(pastOrder.customerName);
    }
    if (pastOrder.deliveryAddress && pastOrder.deliveryAddress !== "Self Pickup / Call-In") {
      setUserAddress(pastOrder.deliveryAddress);
    }

    const draftElement = document.getElementById("order-draft-panel") || document.getElementById("menu");
    if (draftElement) {
      setTimeout(() => {
        draftElement.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear your entire Settings Grill order history?")) {
      setOrderHistory([]);
      localStorage.removeItem("settings_grill_orders");
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = orderHistory.filter(o => o.id !== id);
    setOrderHistory(updated);
    localStorage.setItem("settings_grill_orders", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-orange selection:text-black">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-brand-black/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a id="nav-logo" href="#hero" className="flex items-center space-x-2 text-white group">
            <span className="p-2 bg-gradient-to-tr from-brand-red to-brand-orange rounded-xl glow-orange">
              <Flame className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            </span>
            <div className="leading-tight">
              <span className="font-display text-2xl tracking-wider block font-bold text-white group-hover:text-brand-orange transition-colors duration-200">
                SETTINGS <span className="text-brand-orange">GRILL</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">
                Smoky Premium Street-Food
              </span>
            </div>
          </a>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8 font-medium">
            <a href="#about" className="text-sm text-zinc-300 hover:text-brand-orange transition-all duration-200">About Us</a>
            <a href="#menu" className="text-sm text-zinc-300 hover:text-brand-orange transition-all duration-200">The Sizzling Menu</a>
            <a href="#why-choose-us" className="text-sm text-zinc-300 hover:text-brand-orange transition-all duration-200">Why Us</a>
            <a href="#how-to-order" className="text-sm text-zinc-300 hover:text-brand-orange transition-all duration-200">How to Order</a>
            <a href="#testimonials" className="text-sm text-zinc-300 hover:text-brand-orange transition-all duration-200">Reviews</a>
          </nav>

          {/* CTAs - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              id="nav-call-cta"
              href={`tel:${CALL_NUMBER}`}
              className="flex items-center space-x-2 px-4 py-2 border border-zinc-700 rounded-lg text-sm font-semibold text-white hover:bg-zinc-800 transition-all duration-200"
            >
              <Phone className="w-4 h-4 text-brand-orange animate-pulse" />
              <span>Call to Order</span>
            </a>
            <a
              id="nav-whatsapp-cta"
              href={getWhatsAppURL()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-black px-5 py-2 rounded-lg text-sm font-black transition-all duration-200 shadow-md glow-orange"
            >
              <MessageCircle className="w-4 h-4 fill-black text-black" />
              <span>Order via WhatsApp</span>
            </a>
          </div>

          {/* Hamburger Menu - Mobile */}
          <button
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-950 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-brand-charcoal border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col">
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-brand-orange font-medium"
                >
                  About Us
                </a>
                <a
                  href="#menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-brand-orange font-medium"
                >
                  The Sizzling Menu
                </a>
                <a
                  href="#why-choose-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-brand-orange font-medium"
                >
                  Why Us
                </a>
                <a
                  href="#how-to-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-brand-orange font-medium"
                >
                  How to Order
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-zinc-300 hover:text-brand-orange font-medium"
                >
                  Reviews
                </a>
                <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-3">
                  <a
                    href={`tel:${CALL_NUMBER}`}
                    className="flex items-center justify-center space-x-2 py-3 border border-zinc-800 rounded-lg text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all"
                  >
                    <Phone className="w-4 h-4 text-brand-orange" />
                    <span>Call: +234 707 270 7429</span>
                  </a>
                  <a
                    href={getWhatsAppURL()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 bg-brand-orange hover:bg-brand-orange-hover text-black py-3 rounded-lg text-sm font-extrabold transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-black" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-16 px-4"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.98)), url(${heroBannerImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Dynamic rising fire emers mock decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,rgba(255,107,0,0.15),transparent_60%)]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          
          <div className="lg:col-span-12 text-center max-w-4xl mx-auto space-y-8">
            
            {/* Sizzling Badge */}
            <div className="inline-flex items-center space-x-2 bg-brand-red/20 border border-brand-red/30 px-4 py-1.5 rounded-full text-brand-orange text-xs tracking-wider uppercase font-mono font-black animate-bounce">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse" />
              <span>Smokin' hot charcoal legends</span>
            </div>

            {/* Huge Headline */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-9xl tracking-tight leading-tight text-white uppercase select-none drop-shadow-2xl font-black">
              WHERE EVERY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-brand-orange to-brand-red glow-orange-text">
                BITE HITS DIFFERENT
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-zinc-300 text-lg sm:text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
              Legend-tier <span className="text-white font-semibold underline decoration-brand-orange underline-offset-4">Stick Suya</span>, sizzling <span className="text-white font-semibold underline decoration-brand-orange underline-offset-4">Juicy Grilled Chicken</span> & perfectly seasoned <span className="text-white font-semibold underline decoration-brand-orange underline-offset-4">Grilled Catfish</span>. Rooted in pure street sureness, elevated for royalty.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <a
                id="hero-whatsapp-btn"
                href={getWhatsAppURL()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-brand-orange to-brand-red hover:from-[#E05E00] hover:to-[#A92D21] text-black hover:text-white px-8 py-5 rounded-xl font-display text-lg tracking-widest font-black uppercase transition-all duration-300 shadow-xl glow-orange"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Order Now via WhatsApp</span>
              </a>
              <a
                id="hero-call-btn"
                href={`tel:${CALL_NUMBER}`}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-zinc-900 border-2 border-zinc-700 hover:border-brand-orange text-white hover:bg-black px-8 py-5 rounded-xl font-display text-lg tracking-widest font-bold uppercase transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-brand-orange" />
                <span>Call to Order</span>
              </a>
            </div>

            {/* Order lines list */}
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 pt-6 text-zinc-400 font-mono text-xs">
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-brand-orange" />
                <span>Hot Delivery Available Weekly</span>
              </span>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <span className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Fast Transit Out of Lagos, Nigeria</span>
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-24 bg-brand-charcoal border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Grid Collage */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 h-96 group">
                <img
                  src={suyaImg}
                  alt="Smoky Suya cooking"
                  className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="w-4 h-4 text-brand-orange" />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-brand-orange font-bold">The Taste Tradition</span>
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-white">Genuine Wood Charcoal Grilling</h3>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 lg:-right-10 bg-brand-orange text-black p-6 rounded-2xl font-display uppercase tracking-widest text-center shadow-xl z-20 w-32 hidden sm:block glow-orange">
                <span className="block text-4xl font-black">100%</span>
                <span className="block text-[10px] leading-tight font-black">Freshly Made Daily</span>
              </div>
            </div>

            {/* Story copy */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <h2 className="font-mono text-brand-orange text-xs tracking-widest uppercase font-bold flex items-center space-x-2">
                <span>OUR SMOKEHOUSE CRUSADE</span>
                <span className="w-8 h-[1px] bg-brand-orange" />
              </h2>
              <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white leading-none font-bold">
                Smoky Street Vibe, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-red">
                  Elite Craft Execution.
                </span>
              </h2>
              <div className="space-y-4 text-zinc-300 font-light leading-relaxed text-sm sm:text-base">
                <p>
                  At <strong className="text-white font-medium">Settings Grill</strong>, we don’t just host flame. We capture culinary culture. Our mission is centered on raw, authentic heat. No shortcuts, no pre-cooked reheated disappointment, and absolutely no compromises.
                </p>
                <p>
                  We start with selected high-grade meats and fresh seafood, rubbed thoroughly with spices sourced straight from northern farms. Slow-roasted over dense wood coals by master grillers, every order delivers dense, caramelized edges, tender meat, and spice-crusted profiles that satisfy your deep flavor cravings.
                </p>
              </div>

              {/* Trust statement */}
              <div className="p-5 bg-brand-black/40 rounded-xl border border-zinc-800 flex items-start space-x-4">
                <span className="p-3 bg-brand-orange/10 rounded-lg text-brand-orange mt-1">
                  <Award className="w-5 h-5 text-brand-orange" />
                </span>
                <div>
                  <h4 className="font-display text-lg uppercase tracking-wide text-white font-semibold">Our Unwavering Trust Pledge</h4>
                  <p className="text-zinc-400 text-xs mt-1">
                    &quot;Grilled to absolute perfection. Delivered sizzling hot in secure, clean food bags. If it isn't dripping with genuine smoky sureness, it isn't Settings Grill.&quot;
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC SIGNATURE DISHES & INTERACTIVE BUILDER GRID */}
      <section id="menu" className="py-24 bg-brand-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-mono text-brand-orange text-xs tracking-widest uppercase font-bold flex items-center justify-center space-x-2">
              <span className="w-4 h-[1px] bg-brand-orange" />
              <span>THE SIZZLING FEAST</span>
              <span className="w-4 h-[1px] bg-brand-orange" />
            </h2>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white">
              SIGNATURE GRILLED DISHES
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light">
              Customize your spice calibration and pile on legendary Nigerian side combinations directly on the cards below!
            </p>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MENU_ITEMS.map((item) => {
              const cardConfig = customizer[item.id];
              return (
                <div
                  id={`menu-card-${item.id}`}
                  key={item.id}
                  className="bg-brand-charcoal rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-brand-orange/60 transition-all duration-300 flex flex-col group h-full relative"
                >
                  {/* Food Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent" />
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-brand-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full z-10">
                      <span className="font-mono text-brand-orange font-bold text-sm">
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-display text-2xl uppercase tracking-wide text-white group-hover:text-brand-orange transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-zinc-400 text-xs font-light line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Step 1: Spice Customization */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">
                        🔥 1. Call your spice level
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {item.spicyRange.map((spice) => {
                          const isSelected = cardConfig.spice === spice;
                          return (
                            <button
                              id={`btn-spice-${item.id}-${spice.replace(/\s+/g, '-').toLowerCase()}`}
                              key={spice}
                              onClick={() => handleSpiceChange(item.id, spice)}
                              className={`py-1.5 px-1 rounded-md text-[10px] font-bold text-center uppercase tracking-normal transition-all duration-200 border ${
                                isSelected
                                  ? "bg-brand-orange/15 border-brand-orange text-brand-orange font-extrabold"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {spice.replace(" (Insanely Hot! 🔥)", "").replace(" 🔥", "").slice(0, 15)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Choose Sides */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">
                        🥗 2. Stack fresh sides (Optional)
                      </label>
                      <div className="space-y-1">
                        {SIDE_OPTIONS.map((side) => {
                          const isChecked = !!cardConfig.sides[side.name];
                          return (
                            <button
                              id={`btn-side-${item.id}-${side.name.replace(/\s+/g, '-').toLowerCase()}`}
                              key={side.name}
                              onClick={() => handleSideToggle(item.id, side.name)}
                              className={`w-full flex items-center justify-between p-2 rounded-md transition-all text-left text-xs border ${
                                isChecked
                                  ? "bg-brand-orange/5 border-zinc-700 text-white font-medium"
                                  : "bg-zinc-900 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                                  isChecked ? "bg-brand-orange border-brand-orange text-black" : "border-zinc-700"
                                }`}>
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                                </span>
                                <span>{side.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-zinc-400">+₦{side.price.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3: Quantity Selector and Add to Cart */}
                    <div className="pt-2 flex items-center space-x-3 mt-auto">
                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <button
                          id={`qty-dec-${item.id}`}
                          onClick={() => handleQtyChange(item.id, "dec")}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-mono text-sm text-white font-bold w-6 text-center">
                          {cardConfig.quantity}
                        </span>
                        <button
                          id={`qty-inc-${item.id}`}
                          onClick={() => handleQtyChange(item.id, "inc")}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        id={`btn-add-to-draft-${item.id}`}
                        onClick={() => addToDraft(item)}
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-black rounded-lg text-xs font-black uppercase tracking-wider transition-colors glow-orange"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 fill-black" />
                        <span>Add To Order</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* FLOATING / IN-LINE DRAFT SUMMARY IF CART IS ACTIVE */}
          <div className="mt-16">
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  id="order-draft-panel"
                  className="bg-zinc-950 border-2 border-brand-orange/40 rounded-2xl p-6 sm:p-8 outline-none glow-orange max-w-3xl mx-auto relative overflow-hidden"
                >
                  {/* Decorative glowing background mesh */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange">
                        <Flame className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                          Smokehouse Order Draft
                        </h3>
                        <p className="text-zinc-400 text-xs font-light">
                          Perfect! Your grill feast is queued below.
                        </p>
                      </div>
                    </div>
                    {/* Clear order button */}
                    <button
                      id="btn-clear-order"
                      onClick={() => setCart([])}
                      className="text-zinc-500 hover:text-brand-red text-[10px] font-mono uppercase tracking-widest hover:underline"
                    >
                      Reset Draft
                    </button>
                  </div>

                  {/* List of queue items */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map((cartItem) => (
                      <div
                        id={`cart-item-${cartItem.id}`}
                        key={cartItem.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brand-charcoal rounded-xl border border-zinc-800 space-y-3 sm:space-y-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs bg-brand-orange/15 text-brand-orange font-bold px-2 py-0.5 rounded">
                              x{cartItem.quantity}
                            </span>
                            <h4 className="font-display text-lg uppercase text-white tracking-wide">
                              {cartItem.name}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                            <span className="flex items-center space-x-1">
                              <span className="text-brand-orange">🌶️</span>
                              <span>Spice Level: {cartItem.spiceLevel}</span>
                            </span>
                            {cartItem.sides.length > 0 && (
                              <span className="flex items-center space-x-1">
                                <span className="text-brand-orange">🥗</span>
                                <span>Sides: {cartItem.sides.map(s => s.name).join(", ")}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <span className="font-mono text-zinc-300 font-bold text-sm">
                            ₦{calculateItemTotal(cartItem).toLocaleString()}
                          </span>
                          <button
                            id={`btn-remove-${cartItem.id}`}
                            onClick={() => removeFromCart(cartItem.id)}
                            className="p-1 px-2 hover:bg-brand-red/10 border border-transparent hover:border-brand-red/20 text-zinc-500 hover:text-brand-red rounded text-[10px] font-mono uppercase tracking-wide transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800 mt-6">
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1.5">
                        Your Name (Pre-fills WhatsApp)
                      </label>
                      <input
                        id="order-form-name"
                        type="text"
                        placeholder="John Doe"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-brand-charcoal border border-zinc-800 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 block mb-1.5">
                        Lagos Delivery Address (Pre-fills WhatsApp)
                      </label>
                      <input
                        id="order-form-address"
                        type="text"
                        placeholder="e.g. Lekki Phase 1"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className="w-full bg-brand-charcoal border border-zinc-800 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Submission and Estimation total */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-6 border-t border-zinc-800 bg-[#FF6B00]/5 -mx-6 -mb-6 p-6">
                    <div className="mb-4 sm:mb-0">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                        ESTIMATED ORDER TOTAL
                      </span>
                      <span className="text-3xl font-display font-black text-white leading-none">
                        ₦{totalCartCost.toLocaleString()}
                      </span>
                    </div>

                    <a
                      id="order-submit-whatsapp-btn"
                      href={getWhatsAppURL()}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => logOrderToHistory()}
                      className="flex items-center justify-center space-x-3 bg-brand-orange hover:bg-brand-orange-hover text-black font-display font-black uppercase text-base tracking-widest px-8 py-4 rounded-xl shadow-xl transition-all glow-orange"
                    >
                      <MessageCircle className="w-5 h-5 fill-black" />
                      <span>Send Order details to WhatsApp</span>
                    </a>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* PREVIOUS ORDER HISTORY */}
            <div className="mt-10 max-w-3xl mx-auto" id="order-history-section">
              <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                {/* Visual red flame backing glow */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
                  <div className="flex items-center space-x-2.5">
                    <span className="p-2 bg-zinc-900 border border-zinc-805 rounded-xl text-brand-orange">
                      <Clock className="w-5 h-5 text-brand-orange" />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl uppercase tracking-wider text-white">Your Grill History</h3>
                      <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest">Preloaded local legacy rosters</p>
                    </div>
                  </div>

                  {orderHistory.length > 0 && (
                    <button
                      id="btn-clear-history"
                      onClick={clearAllHistory}
                      className="self-start sm:self-center text-zinc-500 hover:text-brand-red text-[10px] font-mono uppercase tracking-widest hover:underline transition-colors"
                    >
                      Clear All History
                    </button>
                  )}
                </div>

                {orderHistory.length === 0 ? (
                  <div className="text-center py-10 bg-brand-charcoal/20 rounded-xl border border-dashed border-zinc-850 p-6">
                    <Flame className="w-6 h-6 text-zinc-700 mx-auto mb-2 animate-pulse" />
                    <p className="text-zinc-400 text-sm font-medium">Your charcoal records are currently empty.</p>
                    <p className="text-zinc-600 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                      Your meals will automatically log here when you click &quot;Send Order details to WhatsApp&quot; so you can quickly refuel your favorite feast in one click!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderHistory.map((pastOrder) => {
                      const isExpanded = expandedOrderId === pastOrder.id;
                      return (
                        <div
                          key={pastOrder.id}
                          className="bg-brand-charcoal/40 border border-zinc-850/80 hover:border-zinc-800 rounded-xl transition-all overflow-hidden"
                        >
                          {/* Main Row summary */}
                          <div
                            onClick={() => setExpandedOrderId(isExpanded ? null : pastOrder.id)}
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <span className="p-1 px-2.5 bg-zinc-900 rounded-lg text-[10px] font-mono text-brand-orange font-black border border-brand-orange/25 uppercase shrink-0">
                                {pastOrder.id}
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs text-white font-bold font-mono">
                                  {pastOrder.timestamp}
                                </div>
                                <div className="text-[11px] text-zinc-400 truncate mt-0.5 max-w-md">
                                  {pastOrder.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4">
                              <div className="text-left md:text-right">
                                <span className="text-[9px] text-zinc-500 font-mono block uppercase">Estimated Total</span>
                                <span className="text-xs font-bold text-white font-mono">
                                  ₦{pastOrder.total.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReorder(pastOrder);
                                  }}
                                  className="py-1.5 px-3 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all"
                                >
                                  Reorder
                                </button>
                                <button
                                  onClick={(e) => deleteHistoryItem(pastOrder.id, e)}
                                  className="p-2 text-zinc-600 hover:text-brand-red rounded-lg hover:bg-zinc-900 transition-colors"
                                  title="Delete from history"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail display */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-2 border-t border-zinc-900 bg-brand-black/40 space-y-3 font-sans"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Patron Name</span>
                                    <span className="text-zinc-200 font-bold block mt-0.5">{pastOrder.customerName}</span>
                                  </div>
                                  <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-850">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Lagos Delivery Location</span>
                                    <span className="text-zinc-200 font-bold block mt-0.5">{pastOrder.deliveryAddress}</span>
                                  </div>
                                </div>

                                <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-850/60 space-y-2">
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Item roster</span>
                                  {pastOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-xs text-zinc-300 py-1 border-b border-zinc-900 last:border-0">
                                      <div>
                                        <div className="font-bold text-white font-mono text-xs">
                                          x{item.quantity} {item.name}
                                        </div>
                                        <div className="flex flex-wrap gap-x-2 text-[10px] text-zinc-500 mt-0.5">
                                          <span>🌶️ Spice: {item.spiceLevel}</span>
                                          {item.sides.length > 0 && (
                                            <span>🥗 Add-ons: {item.sides.join(", ")}</span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="font-mono text-zinc-300 text-xs shrink-0 font-bold ml-2">₦{item.price.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className="py-24 bg-brand-charcoal relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-mono text-brand-orange text-xs tracking-widest uppercase font-bold flex items-center justify-center space-x-2">
              <span className="w-4 h-[1px] bg-brand-orange" />
              <span>THE COALS OF QUALITY</span>
              <span className="w-4 h-[1px] bg-brand-orange" />
            </h2>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-white">
              WHY THE REPUBLIC REIGNS
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light">
              We stand distinct because our commitment to real flavor runs deep into the wood we burn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Value card 1 */}
            <div className="bg-brand-black/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-brand-orange/40 transition-all group">
              <span className="inline-flex p-3 bg-brand-orange/10 rounded-xl text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-black transition-colors duration-300">
                <Flame className="w-6 h-6" />
              </span>
              <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2">
                Fresh Ingredients Daily
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Zero cold storage holding. We prepare our raw meats, catfish, and proprietary spices every single morning to guarantee crisp, clean food structure.
              </p>
            </div>

            {/* Value card 2 */}
            <div className="bg-brand-black/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-brand-orange/40 transition-all group">
              <span className="inline-flex p-3 bg-brand-orange/10 rounded-xl text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-black transition-colors duration-300">
                <UtensilsCrossed className="w-6 h-6" />
              </span>
              <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2">
                Authentic Grill Technique
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                We strictly use organic hardwood charcoal. No gas shortcuts, no fluid flavorings. Just pure fire ember caramelized crusts for maximum wood-smoke notes.
              </p>
            </div>

            {/* Value card 3 */}
            <div className="bg-brand-black/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-brand-orange/40 transition-all group">
              <span className="inline-flex p-3 bg-brand-orange/10 rounded-xl text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-black transition-colors duration-300">
                <Truck className="w-6 h-6" />
              </span>
              <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2">
                Fast Delivery Lock
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Shipped directly in thermal heat packs. Your Suya and grilled catfish will arrive at your door in its native sizzling heat, ready to eat immediately.
              </p>
            </div>

            {/* Value card 4 */}
            <div className="bg-brand-black/40 border border-zinc-800/80 p-8 rounded-2xl hover:border-brand-orange/40 transition-all group">
              <span className="inline-flex p-3 bg-brand-orange/10 rounded-xl text-brand-orange mb-6 group-hover:bg-brand-orange group-hover:text-black transition-colors duration-300">
                <Sparkles className="w-6 h-6" />
              </span>
              <h3 className="font-display text-xl uppercase tracking-wide text-white mb-2">
                Addictive Taste Profile
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Made with secret Yaji ratios, roasted garlic accents, and a distinct final touch that hits the tongue and instantly keeps you longing for the next skewer.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW TO ORDER */}
      <section id="how-to-order" className="py-24 bg-brand-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-mono text-brand-orange text-xs tracking-widest uppercase font-bold flex items-center justify-center space-x-2">
              <span className="w-4 h-[1px] bg-brand-orange" />
              <span>THE HUNGRY TRANSIT</span>
              <span className="w-4 h-[1px] bg-brand-orange" />
            </h2>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-white">
              3 STEPS TO HOT GRILLS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-[25%] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-brand-orange/40 via-brand-red/40 to-transparent z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <span className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 text-brand-orange flex items-center justify-center font-display text-2xl font-bold font-mono">
                01
              </span>
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                Browse The Menu
              </h3>
              <p className="text-zinc-400 text-sm font-light max-w-xs">
                Look through our signature dishes above and add custom sides or spice profiles to lock in your craving draft.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <span className="w-16 h-16 rounded-full bg-brand-orange text-black flex items-center justify-center font-display text-2xl font-bold font-mono shadow-md glow-orange">
                02
              </span>
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                Call or WhatsApp Us
              </h3>
              <p className="text-zinc-400 text-sm font-light max-w-xs">
                Send your order draft automatically in a click, or dial our direct lines to finalize with an dispatcher setup.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <span className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 text-brand-orange flex items-center justify-center font-display text-2xl font-bold font-mono">
                03
              </span>
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                Get It Hot & Fresh
              </h3>
              <p className="text-zinc-400 text-sm font-light max-w-xs">
                Our drivers lock the feast into thermal insulated safety packs and speed directly to your physical address.
              </p>
            </div>

          </div>

          {/* Core Order Line Contacts Panel */}
          <div className="mt-16 bg-brand-charcoal border border-zinc-800 p-8 rounded-2xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <div>
                <h3 className="font-display text-2xl uppercase text-white tracking-wide">
                  Direct Order Hotline Setup
                </h3>
                <p className="text-zinc-400 text-xs font-light mt-1.5">
                  Have special event layouts, wedding suyan requests, or wholesale order calls? Touch to copy or call our lines directly.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-black rounded-lg border border-zinc-800 hover:border-zinc-750 transition-all">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-brand-orange" />
                    <span className="font-mono text-sm text-zinc-300 font-bold">{CALL_NUMBER}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-copy-num-1"
                      onClick={() => handleCopyNumber(CALL_NUMBER, "line1")}
                      className="p-1 px-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-wider rounded transition-all"
                    >
                      {copiedNumber === "line1" ? "Copied" : "Copy"}
                    </button>
                    <a
                      id="btn-dial-num-1"
                      href={`tel:${CALL_NUMBER}`}
                      className="p-1 px-2.5 bg-brand-orange hover:bg-brand-orange-hover text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all"
                    >
                      Call
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-brand-black rounded-lg border border-zinc-800 hover:border-zinc-750 transition-all">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-brand-orange flex-shrink-0" />
                    <span className="font-mono text-sm text-zinc-300 font-bold">{AUX_NUMBER}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-copy-num-2"
                      onClick={() => handleCopyNumber(AUX_NUMBER, "line2")}
                      className="p-1 px-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-[10px] font-mono text-zinc-400 hover:text-white uppercase tracking-wider rounded transition-all"
                    >
                      {copiedNumber === "line2" ? "Copied" : "Copy"}
                    </button>
                    <a
                      id="btn-dial-num-2"
                      href={`tel:${AUX_NUMBER}`}
                      className="p-1 px-2.5 bg-brand-orange hover:bg-brand-orange-hover text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all"
                    >
                      Call
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-brand-charcoal relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-mono text-brand-orange text-xs tracking-widest uppercase font-bold flex items-center justify-center space-x-2">
              <span className="w-4 h-[1px] bg-brand-orange" />
              <span>THE REPUBLIC REPORT</span>
              <span className="w-4 h-[1px] bg-brand-orange" />
            </h2>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-white">
              WHAT THE PATRONS SAY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Review 1 */}
            <div className="bg-brand-black/40 border border-zinc-850 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-zinc-300 font-light italic text-sm leading-relaxed">
                  &quot;The Stick Suya is unbelievable! The spice (Yaji) is fresh and original, not like those basic market packets. Grilled catfish was huge and seasoned straight to the center bone. Absolute legendary street vibe!&quot;
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-zinc-850">
                <div className="w-10 h-10 bg-brand-orange/10 border border-brand-orange/20 rounded-full flex items-center justify-center text-brand-orange font-bold text-xs">
                  CA
                </div>
                <div>
                  <h4 className="text-white font-medium text-xs font-mono">Chisom A.</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Verified Order Patron</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-brand-black/40 border border-zinc-850 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-zinc-300 font-light italic text-sm leading-relaxed">
                  &quot;Settings Grill chicken is exceptionally juicy. My office orders 10 portions every Friday. Delivery is fast and matches the temperature of food directly taken off the wood coal. Highly recommended!&quot;
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-zinc-850">
                <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center text-brand-orange font-bold text-xs">
                  BM
                </div>
                <div>
                  <h4 className="text-white font-medium text-xs font-mono">Bello M.</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Verified Order Patron</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-brand-black/40 border border-zinc-850 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-zinc-300 font-light italic text-sm leading-relaxed">
                  &quot;I selected the Suya Hazard spice level and it literally hit different. Crazy spice warmth with amazing smoky sweetness. Side plantain was tender too. Settings Grill holds the surefire crown.&quot;
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-zinc-850">
                <div className="w-10 h-10 bg-brand-orange/10 border border-brand-orange/20 rounded-full flex items-center justify-center text-brand-orange font-bold text-xs">
                  FO
                </div>
                <div>
                  <h4 className="text-white font-medium text-xs font-mono">Funke O.</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Verified Order Patron</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 bg-brand-black relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.12),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-brand-red to-brand-orange p-8 sm:p-14 rounded-3xl text-center relative z-10 shadow-2xl glow-red">
          
          {/* Flame element */}
          <div className="inline-flex p-4 bg-brand-black/20 rounded-full text-white mb-6">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="font-display text-4xl sm:text-6xl tracking-tight uppercase text-black font-black leading-tight">
            HUNGRY FOR REAL SMOKE?<br />
            DON&apos;T DELAY COAL TIME.
          </h2>
          
          <p className="text-white text-base sm:text-lg max-w-xl mx-auto font-medium mt-4 opacity-90 leading-relaxed">
            Choose your spice meter, stack custom dodo sides, and finalize in a simple WhatsApp text. Our coals are actively glowing!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <a
              id="cta-whatsapp-btn-footer"
              href={getWhatsAppURL()}
              target="_blank"
              rel="noreferrer"
              onClick={() => logOrderToHistory()}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-black hover:bg-zinc-900 border border-black text-brand-orange hover:text-white px-8 py-4 rounded-xl font-display text-lg tracking-widest font-black uppercase transition-all shadow-xl"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Order on WhatsApp Now</span>
            </a>
            
            <a
              id="cta-dial-btn-footer"
              href={`tel:${CALL_NUMBER}`}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white hover:bg-zinc-100 text-black px-8 py-4 rounded-xl font-display text-lg tracking-widest font-bold uppercase transition-all shadow-xl"
            >
              <Phone className="w-5 h-5 text-brand-red animate-bounce" />
              <span>Call order Dispatch</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-y-2 gap-x-6 text-black/80 font-mono text-xs mt-6 font-bold">
            <span>📞 Call line 1: {CALL_NUMBER}</span>
            <span className="hidden sm:inline">•</span>
            <span>📞 Call line 2: {AUX_NUMBER}</span>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-charcoal border-t border-white/5 py-12 mt-auto text-zinc-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            
            {/* Logo repeated */}
            <div className="text-left">
              <span className="font-display text-xl tracking-wider font-bold text-white block uppercase">
                SETTINGS <span className="text-brand-orange">GRILL</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block mt-0.5">
                Bold Flavors. Real Grill.
              </span>
            </div>

            {/* Quick Contacts Repeated */}
            <div className="text-center sm:text-right font-mono text-[10px] space-y-0.5">
              <p className="text-zinc-400">Order Lines:</p>
              <p className="text-white font-bold">{CALL_NUMBER} | {AUX_NUMBER}</p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-zinc-650 border-t border-white/5 pt-6 space-y-4 sm:space-y-0">
            
            <p className="text-[10px]">
              &copy; {new Date().getFullYear()} Settings Grill. All charcoal rights reserved. Lagos, Nigeria.
            </p>

            {/* Micro social platforms */}
            <div className="flex space-x-4">
              <span className="hover:text-brand-orange cursor-pointer transition-colors">Instagram</span>
              <span className="text-zinc-800">•</span>
              <span className="hover:text-brand-orange cursor-pointer transition-colors">TikTok</span>
              <span className="text-zinc-800">•</span>
              <span className="hover:text-brand-orange cursor-pointer transition-colors">Facebook</span>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}
