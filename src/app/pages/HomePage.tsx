import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Car,
  Users,
  Calculator,
  Tag,
  ChevronRight,
  Star,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Quote,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { WhatsAppFAB } from "../components/WhatsAppFAB";
import { useUser } from "../components/UserContext";
import * as api from "../lib/api";

// --- Components ---

function QuickAction({ to, icon: Icon, label, colorClass }: any) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 group">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-border transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${colorClass}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-center text-gray-700 group-hover:text-primary transition-colors">
        {label}
      </span>
    </Link>
  );
}

function FeaturedModelCard({ model }: { model: any }) {
  return (
    <Link
      to={`/models/${model.id}`}
      className="block relative min-w-[260px] md:min-w-[300px] h-64 rounded-2xl overflow-hidden group snap-start border border-border bg-white shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
      <ImageWithFallback
        src={model.image}
        alt={model.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
        <h3 className="text-lg font-bold mb-0.5 group-hover:text-primary-foreground transition-colors">
          {model.name}
        </h3>
        <p className="text-xs text-white/80 mb-2">{model.tagline}</p>
        <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{model.priceRange}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
            </div>
        </div>
      </div>
    </Link>
  );
}

function PartnersSection() {
  const [partners, setPartners] = useState<api.Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPartners()
      .then((data) => setPartners(data.filter((p) => p.is_active)))
      .catch((e) => console.log("Failed to load partners", e))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinUs = () => {
    const adminNumber = "601126456073";
    const message = encodeURIComponent(
      "Hi OSL, I am interested in listing my automotive business on OSL Autosales."
    );
    window.open(`https://wa.me/${adminNumber}?text=${message}`, "_blank");
  };

  if (loading || partners.length === 0) return null;

  return (
    <section className="py-8 bg-gray-50/50">
      <div className="px-5 mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold flex items-center gap-2 text-gray-900">
          <Building2 className="w-4 h-4 text-primary" />
          Trusted Partners
        </h2>
        <button
          onClick={handleJoinUs}
          className="text-[10px] font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
        >
          Join Network
        </button>
      </div>

      <div className="flex overflow-x-auto px-5 gap-3 snap-x snap-mandatory scrollbar-hide pb-4">
        {partners
          .sort((a, b) => a.display_order - b.display_order)
          .map((partner) => (
            <Link
              key={partner.id}
              to={`/partner/${partner.id}`}
              className="flex-shrink-0 w-24 snap-center group flex flex-col items-center gap-2"
            >
              <div className="w-20 h-20 bg-white rounded-xl border border-border p-2 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all relative overflow-hidden flex items-center justify-center">
                {partner.is_featured && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full m-1 animate-pulse" />
                )}
                <ImageWithFallback
                  src={partner.logo_url}
                  alt={partner.business_name}
                  className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-600 text-center line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {partner.business_name}
              </span>
            </Link>
          ))}
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, text, image, rating }: any) {
    return (
        <div className="min-w-[280px] bg-white border border-border rounded-xl p-5 shadow-sm snap-center">
            <div className="flex items-center gap-3 mb-3">
                <ImageWithFallback src={image} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                    <h4 className="text-sm font-bold text-gray-900">{name}</h4>
                    <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                </div>
            </div>
            <div className="relative">
                <Quote className="w-6 h-6 text-primary/10 absolute -top-1 -left-1" />
                <p className="text-xs text-gray-600 leading-relaxed pl-4 relative z-10 italic">
                    "{text}"
                </p>
            </div>
        </div>
    );
}

function PartnerProductsSection() {
    const [products, setProducts] = useState<any[]>([]);
    
    useEffect(() => {
        api.getPartners().then(partners => {
            const allProducts = partners
                .filter(p => p.is_active && p.products && p.products.length > 0)
                .flatMap(p => (p.products || []).map(prod => ({
                    ...prod,
                    partnerName: p.business_name,
                    partnerId: p.id,
                    partnerLogo: p.logo_url
                })));
            
            // Randomize or sort by newest logic here
            setProducts(allProducts.slice(0, 10)); // Show top 10
        }).catch(err => console.error(err));
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="mb-10 px-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                    New Arrivals
                </h2>
                <Link to="/community" className="text-primary text-xs font-medium hover:underline">
                    See All Offers
                </Link>
            </div>
            
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4 -mx-5 px-5">
                {products.map((product, idx) => (
                    <Link 
                        key={idx} 
                        to={`/partner/${product.partnerId}`}
                        className="flex-shrink-0 w-64 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm snap-center group hover:shadow-md transition-all"
                    >
                        <div className="w-full h-32 bg-gray-50 rounded-xl mb-3 overflow-hidden border border-gray-50">
                            <ImageWithFallback 
                                src={product.image_url} 
                                alt={product.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <ImageWithFallback 
                                src={product.partnerLogo} 
                                alt={product.partnerName} 
                                className="w-5 h-5 rounded-full object-cover border border-gray-100" 
                            />
                            <span className="text-[10px] text-gray-500 truncate">{product.partnerName}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">{product.title}</h4>
                        <div className="flex items-center justify-between">
                            {product.discount_info ? (
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                    {product.discount_info}
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-400">View Details</span>
                            )}
                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export function HomePage() {
  const { cars } = useUser();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pb-20 bg-background min-h-screen"
    >
      {/* --- Hero Section --- */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gray-900">
            <ImageWithFallback
                src="https://images.unsplash.com/photo-1754782385579-56aeff7a8630?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaWx2ZXIlMjBjYXIlMjBzaWRlJTIwcHJvZmlsZSUyMGFic3RyYWN0JTIwc3R1ZGlvJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzcxODMwNDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Hero Background"
                className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom" // Add slow zoom animation if possible or just scale
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-12 max-w-lg mx-auto md:ml-0 md:max-w-3xl md:justify-center md:pl-20">
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-medium mb-4 tracking-wider uppercase shadow-sm">
              Malaysia's Premier Perodua Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Drive Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">Dream</span> Today.
            </h1>
            <p className="text-gray-200 text-sm md:text-lg mb-8 max-w-md leading-relaxed">
              Experience transparent pricing, connect with top-rated advisors, and enjoy a seamless car buying journey.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/get-quotation"
                className="bg-primary hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-95 flex items-center gap-2"
              >
                Get Quotation
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/models"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Explore Models
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Quick Actions Grid --- */}
      <section className="px-5 -mt-8 relative z-20 mb-10">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 grid grid-cols-4 gap-2 md:gap-8"
        >
          <QuickAction
            to="/models"
            icon={Car}
            label="Models"
            colorClass="bg-blue-50 text-blue-600 border-blue-100"
          />
          <QuickAction
            to="/sa-list"
            icon={Users}
            label="Find SA"
            colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
          />
          <QuickAction
            to="/calculator"
            icon={Calculator}
            label="Loan Calc"
            colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
          />
          <QuickAction
            to="/community" 
            icon={Tag}
            label="Stories"
            colorClass="bg-amber-50 text-amber-600 border-amber-100"
          />
        </motion.div>
      </section>

      {/* --- Featured Models --- */}
      <section className="mb-10 space-y-5">
        <motion.div variants={itemVariants} className="px-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Popular Models</h2>
            <p className="text-xs text-muted-foreground">Find the perfect ride for you</p>
          </div>
          <Link
            to="/models"
            className="text-primary text-xs font-medium flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-full"
          >
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex overflow-x-auto px-5 gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
        >
          {cars.length === 0 ? (
             // Skeleton Loader
             [1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[260px] h-64 bg-gray-100 rounded-2xl animate-pulse" />
             ))
          ) : (
            cars.slice(0, 5).map((model) => (
                <FeaturedModelCard key={model.id} model={model} />
            ))
          )}
          
          {/* View All Card */}
          <Link
            to="/models"
            className="flex-shrink-0 w-32 h-64 snap-start flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary/50 hover:text-primary transition-all group"
          >
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                <ChevronRight className="w-6 h-6" />
             </div>
             <span className="text-xs font-medium">View All</span>
          </Link>
        </motion.div>
      </section>

      {/* --- NEW: Partner Products Section (New Arrivals) --- */}
      <motion.div variants={itemVariants}>
          <PartnerProductsSection />
      </motion.div>

      {/* --- Value Proposition Banner --- */}
      <section className="px-5 mb-10">
        <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                        <ShieldCheck className="w-6 h-6 text-green-400" />
                        Trusted Sales Advisors
                    </h3>
                    <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
                        Connect with professional agents dedicated to serving you. We verify profiles to ensure you get the best service without the hassle.
                    </p>
                    <div className="flex gap-4 mt-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Transparent
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Efficient
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Reliable
                        </div>
                    </div>
                </div>
                <Link to="/sa-list" className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg active:scale-95 whitespace-nowrap">
                    Find an Agent
                </Link>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        </motion.div>
      </section>

      {/* --- Special Offers / Community Teaser --- */}
      <section className="mb-10 px-5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                Latest Offers
            </h2>
            <Link to="/community" className="text-primary text-xs font-medium hover:underline">
                See All
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Link to="/community" className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-5 border border-red-100 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                    <Tag className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Exclusive Stories</h4>
                    <p className="text-xs text-muted-foreground">Check out limited-time deals from our agents.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-red-300 ml-auto" />
             </Link>
             
             <Link to="/community" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">New Arrivals</h4>
                    <p className="text-xs text-muted-foreground">Be the first to know about new model launches.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-300 ml-auto" />
             </Link>
        </div>
      </section>

      {/* --- Happy Customers (Testimonials) --- */}
      <section className="mb-10">
        <div className="px-5 mb-5">
            <h2 className="text-xl font-bold text-gray-900">Happy Customers</h2>
            <p className="text-xs text-muted-foreground">Real stories from real car owners</p>
        </div>
        <div className="flex overflow-x-auto px-5 gap-4 snap-x snap-mandatory scrollbar-hide pb-4">
            <TestimonialCard/>
            <TestimonialCard/>
            <TestimonialCard/>
        </div>
      </section>

      {/* --- Partners Section --- */}
      <motion.div variants={itemVariants}>
        <PartnersSection />
      </motion.div>

      {/* Footer */}
      <footer className="px-5 pt-12 pb-8 text-center bg-white border-t border-border mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">OSL AUTOSALES</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
          Connecting you with the best automotive deals and services in Malaysia.
        </p>
        
        <div className="flex justify-center gap-6 mb-8">
            <Link to="/models" className="text-xs text-gray-500 hover:text-primary">Models</Link>
            <Link to="/sa-list" className="text-xs text-gray-500 hover:text-primary">Find Agents</Link>
            <Link to="/community" className="text-xs text-gray-500 hover:text-primary">Stories</Link>
            <Link to="/login" className="text-xs text-gray-500 hover:text-primary">Partner Login</Link>
        </div>

        <div className="border-t border-gray-100 pt-6">
            <p className="text-[10px] text-gray-400">
              &copy; {new Date().getFullYear()} OSL AUTOSALES. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Penafian:
              Platform ini diuruskan secara bebas dan bukan saluran rasmi mana-mana jenama automotif. 
              Semua harga adalah untuk rujukan sahaja. Sebarang sebut harga akhir tertakluk kepada harga 
              rasmi jenama dan rundingan antara pelanggan dan Penasihat Jualan (SA). Cukai dan caj tambahan 
              mungkin tidak termasuk. Platform ini tidak bertanggungjawab terhadap sebarang pertikaian harga.<br></br>
              Disclaimer:
              This platform is independently operated and is not an official channel of any automotive brand. 
              All prices are for reference only. Final quotations are subject to official brand pricing and 
              negotiation between customers and Sales Advisors (SA). Taxes and additional fees may not be included. 
              The platform is not responsible for any pricing disputes.<br></br>
              免责声明:
              本平台为独立运营，并非任何汽车品牌的官方渠道。所有价格仅供参考，最终报价以品牌官方及客户与销售顾问（SA）协商为准。
              价格可能未包含税费及其他额外费用，对任何价格纠纷，本平台概不负责。
            </p>
        </div>
      </footer>

      <WhatsAppFAB />
    </motion.div>
  );
}
