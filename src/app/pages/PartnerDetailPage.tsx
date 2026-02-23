import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Phone, Globe, MessageSquare, MapPin, Loader2, Building2, Clock, CheckCircle2, Star, Share2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import * as api from "../lib/api";
import { toast } from "sonner";

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<api.Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPartner(id);
    }
  }, [id]);

  const loadPartner = async (partnerId: string) => {
    try {
      const data = await api.getPartnerById(partnerId);
      setPartner(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load partner details");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!partner?.whatsapp_url) return;
    const url = partner.whatsapp_url.startsWith("http") 
      ? partner.whatsapp_url 
      : `https://wa.me/${partner.whatsapp_url.replace(/[^0-9]/g, "")}`;
    window.open(url, "_blank");
  };

  const handleCall = () => {
    if (!partner?.phone) return;
    window.location.href = `tel:${partner.phone}`;
  };

  const handleWebsite = () => {
    if (!partner?.website_url) return;
    const url = partner.website_url.startsWith("http") 
      ? partner.website_url 
      : `https://${partner.website_url}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-5 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <Building2 className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Partner Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-xs mx-auto">The partner you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="relative h-48 md:h-64 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800"></div>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="absolute top-4 left-4 z-20">
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 -mt-24 relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white p-2">
            <ImageWithFallback
              src={partner.logo_url}
              alt={partner.business_name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{partner.business_name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> Verified Partner
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 (120 reviews)
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 justify-center">
                    <button className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 max-w-2xl">{partner.short_description}</p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {partner.whatsapp_url && (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#20ba5a] transition-all shadow-lg shadow-green-500/20 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </button>
              )}
              {partner.phone && (
                <button
                  onClick={handleCall}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              )}
              {partner.website_url && (
                <button
                  onClick={handleWebsite}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Products / Promos Section */}
            {partner.products && partner.products.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Current Offers</h3>
                    </div>
                    
                    {partner.products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative group transition-all hover:shadow-lg hover:border-primary/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-primary/20">
                                        Special Offer
                                    </span>
                                    {product.expiry_date && (
                                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                            Expires {new Date(product.expiry_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {product.image_url && (
                                        <div className="w-full md:w-32 shrink-0">
                                            <div className="aspect-square bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                                                <ImageWithFallback 
                                                    src={product.image_url} 
                                                    alt={product.title} 
                                                    className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{product.title}</h2>
                                        
                                        {product.discount_info && (
                                            <div className="text-rose-500 font-bold text-sm mb-3">
                                                {product.discount_info}
                                            </div>
                                        )}
                                        
                                        {product.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                                                {product.description}
                                            </p>
                                        )}
                                        
                                        {product.terms_conditions && (
                                            <div className="mt-auto pt-4 border-t border-gray-50">
                                                <p className="text-[10px] text-gray-400">
                                                    <span className="font-bold text-gray-500">T&C:</span> {product.terms_conditions}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                    <p className="text-gray-400 font-medium">No active offers at the moment.</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-900">About Us</h3>
              <div className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {partner.full_description || "No detailed description available."}
              </div>
            </div>
          </div>

          {/* Sidebar / Address */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <p className="text-sm text-gray-900 whitespace-pre-line mb-6 font-medium">
                {partner.address || "No address provided."}
              </p>
              
              {/* Map Preview (Mock) */}
              <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                   <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">Map Preview</div>
              </div>

              {partner.address && (
                <a
                  href={partner.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.business_name + " " + partner.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
