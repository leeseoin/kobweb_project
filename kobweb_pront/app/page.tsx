
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#F0F5F9'}}>
      {/* Header */}
      <header style={{backgroundColor: '#F0F5F9'}} className="border-b" style={{borderColor: '#bfc7d1'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold" style={{color: '#1E2022'}}>Kobweb</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" style={{backgroundColor: '#F0F5F9'}}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6" style={{color: '#1E2022'}}>
            Welcome to Our Platform
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{color: '#52616B'}}>
            Your professional network for business connections and opportunities
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="px-8 py-3 rounded-full text-lg hover:opacity-90 transition-colors cursor-pointer whitespace-nowrap inline-block" style={{backgroundColor: '#1E2022', color: '#F0F5F9'}}>
              Get Started
            </Link>
            <button className="border px-8 py-3 rounded-full text-lg hover:opacity-80 transition-colors cursor-pointer whitespace-nowrap" style={{borderColor: '#bfc7d1', color: '#1E2022', backgroundColor: 'transparent'}}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{backgroundColor: '#C9D6DF'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{color: '#1E2022'}}>
              Digital Business Card Management
            </h2>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed" style={{color: '#52616B'}}>
              Transform your physical business cards into powerful digital connections. Our advanced card registration 
              system allows you to instantly digitize and organize your professional network. Visualize your business 
              relationships through our innovative relationship mapping feature, helping you understand and leverage your 
              professional connections like never before. Discover hidden networking opportunities and strengthen your 
              business relationships with our intelligent networking insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#34373b'}}>
                <i className="ri-qr-scan-line text-2xl" style={{color: '#F0F5F9'}}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{color: '#1E2022'}}>Card Scanning</h3>
              <p style={{color: '#52616B'}}>
                Instantly digitize business cards with AI-powered scanning technology
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#34373b'}}>
                <i className="ri-share-line text-2xl" style={{color: '#F0F5F9'}}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{color: '#1E2022'}}>Network Mapping</h3>
              <p style={{color: '#52616B'}}>
                Visualize and understand your professional connections
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: '#34373b'}}>
                <i className="ri-lightbulb-line text-2xl" style={{color: '#F0F5F9'}}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{color: '#1E2022'}}>Smart Insights</h3>
              <p style={{color: '#52616B'}}>
                Discover hidden opportunities within your network
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20" style={{backgroundColor: '#F0F5F9'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{color: '#1E2022'}}>
              Customer Testimonials
            </h2>
            <p className="text-lg" style={{color: '#52616B'}}>
              See what our clients say about Kobweb
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg" style={{backgroundColor: '#e1e4e6'}}>
              <div className="flex items-center mb-4">
                <img 
                  src="https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Sarah%20Johnson%2C%20marketing%20director%2C%20confident%20business%20woman%20with%20clean%20background%2C%20corporate%20style%20portrait&width=60&height=60&seq=sarah-testimonial&orientation=squarish"
                  alt="Sarah Johnson"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold" style={{color: '#1E2022'}}>Sarah Johnson</h4>
                  <p className="text-sm" style={{color: '#52616B'}}>Marketing Director</p>
                </div>
              </div>
              <p className="italic" style={{color: '#52616B'}}>
                "Kobweb has revolutionized how we manage our business cards. The digital transformation is seamless and professional."
              </p>
            </div>

            <div className="p-8 rounded-lg" style={{backgroundColor: '#e1e4e6'}}>
              <div className="flex items-center mb-4">
                <img 
                  src="https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Michael%20Chen%2C%20sales%20manager%2C%20confident%20business%20man%20with%20clean%20background%2C%20corporate%20style%20portrait&width=60&height=60&seq=michael-testimonial&orientation=squarish"
                  alt="Michael Chen"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold" style={{color: '#1E2022'}}>Michael Chen</h4>
                  <p className="text-sm" style={{color: '#52616B'}}>Sales Manager</p>
                </div>
              </div>
              <p className="italic" style={{color: '#52616B'}}>
                "The account management features are incredibly intuitive. Our team productivity has increased by 40% since implementing."
              </p>
            </div>

            <div className="p-8 rounded-lg" style={{backgroundColor: '#e1e4e6'}}>
              <div className="flex items-center mb-4">
                <img 
                  src="https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Emily%20Rodriguez%2C%20business%20owner%2C%20confident%20business%20woman%20with%20clean%20background%2C%20corporate%20style%20portrait&width=60&height=60&seq=emily-testimonial&orientation=squarish"
                  alt="Emily Rodriguez"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold" style={{color: '#1E2022'}}>Emily Rodriguez</h4>
                  <p className="text-sm" style={{color: '#52616B'}}>Business Owner</p>
                </div>
              </div>
              <p className="italic" style={{color: '#52616B'}}>
                "Outstanding service and support. Kobweb simplified our networking process and helped us connect with more clients effectively."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{backgroundColor: '#C9D6DF'}}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6" style={{color: '#1E2022'}}>
            Are you ready to start now?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{color: '#52616B'}}>
            Join thousands of businesses already using Kobweb to streamline their networking and 
            business card management.
          </p>
          <button className="px-8 py-3 rounded-md text-lg hover:opacity-90 transition-colors cursor-pointer whitespace-nowrap" style={{backgroundColor: '#1E2022', color: '#F0F5F9'}}>
            Request a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{backgroundColor: '#F0F5F9', borderColor: '#bfc7d1'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 font-['Pacifico']" style={{color: '#1E2022'}}>logo</h3>
              <p className="text-sm" style={{color: '#52616B'}}>
                Revolutionizing business networking through innovative digital solutions and professional card management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{color: '#1E2022'}}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{color: '#52616B'}}>
                <li><a href="#" className="hover:opacity-80 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:opacity-80 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4" style={{color: '#1E2022'}}>Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#52616B'}}>
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="hover:opacity-80 transition-colors" style={{color: '#52616B'}}>
                  <i className="ri-linkedin-fill text-xl"></i>
                </a>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm mb-2" style={{color: '#788189'}}>© 2024 Company. All rights reserved.</p>
              <a href="https://readdy.ai/?origin=logo" className="text-sm hover:opacity-80 transition-colors" style={{color: '#788189'}}>
                Made with Readdy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
