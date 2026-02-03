import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, ArrowLeft, ExternalLink } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const socialData: Record<string, { name: string; icon: typeof Instagram; color: string; handle: string; url: string }> = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-purple-500 to-pink-500",
    handle: "@nitipgo.id",
    url: "https://instagram.com/nitipgo.id",
  },
  twitter: {
    name: "Twitter",
    icon: Twitter,
    color: "from-blue-400 to-blue-600",
    handle: "@nitipgo",
    url: "https://twitter.com/nitipgo",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-800",
    handle: "NitipGo Official",
    url: "https://facebook.com/nitipgo",
  },
};

export default function SocialPlaceholder() {
  const { platform } = useParams();
  const social = socialData[platform || ""] || socialData.instagram;
  const Icon = social.icon;

  return (
    <MainLayout>
      <section className="py-12 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className={`inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${social.color} mb-6`}>
              <Icon className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {social.name}
            </h1>
            <p className="text-xl text-primary font-medium mb-6">
              {social.handle}
            </p>
            
            <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
              <p className="text-muted-foreground">
                Ikuti kami di {social.name} untuk mendapatkan update terbaru, promo eksklusif, dan tips perjalanan!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" asChild>
                <a href={social.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Buka {social.name}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
