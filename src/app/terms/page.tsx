import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-12 w-full">
        <h1 
          className="text-4xl lg:text-5xl font-normal text-foreground mb-8"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Terms & Conditions
        </h1>
        <div className="prose prose-sm md:prose-base prose-neutral text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing our website, you agree to be bound by these Terms and Conditions and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on ASHL Herbal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Product Descriptions</h2>
          <p>
            ASHL Herbal attempts to be as accurate as possible. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free. The products are intended for personal use and not for resale.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Shipping & Returns</h2>
          <p>
            Orders are processed and shipped within the specified timeframe. Refunds and returns are subject to our Returns Policy. If you have an issue with your order, please contact our support team.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">5. Pricing & Payments</h2>
          <p>
            All prices are subject to change without notice. We reserve the right at any time to modify or discontinue products. We use Razorpay to process payments securely.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
