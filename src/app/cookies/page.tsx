import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-12 w-full">
        <h1 
          className="text-4xl lg:text-5xl font-normal text-foreground mb-8"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Cookie Policy
        </h1>
        <div className="prose prose-sm md:prose-base prose-neutral text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. What Are Cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. Why Do We Use Cookies?</h2>
          <p>
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Types of Cookies We Use</h2>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li><strong>Essential website cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas or maintaining your shopping cart.</li>
            <li><strong>Performance and functionality cookies:</strong> These are used to enhance the performance and functionality of our website but are non-essential to their use.</li>
            <li><strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are.</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">4. How Can I Control Cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
