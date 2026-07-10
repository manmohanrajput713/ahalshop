import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-12 w-full">
        <h1 
          className="text-4xl lg:text-5xl font-normal text-foreground mb-8"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Privacy Policy
        </h1>
        <div className="prose prose-sm md:prose-base prose-neutral text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, when you participate in activities on the website, or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following: names, phone numbers, email addresses, mailing addresses, billing addresses, and payment information.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. We use the information we collect or receive to facilitate account creation, to fulfill and manage your orders, to send administrative information to you, and for other business purposes.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Will Your Information Be Shared?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, or Legal Obligations.
          </p>
          <p>
            Specifically, we use Razorpay as our payment gateway. Razorpay may collect and process your payment information in accordance with their own privacy policies.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have questions or comments about this notice, you may email us at support@ashlshop.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
