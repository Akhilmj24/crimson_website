import { HelmetProvider } from 'react-helmet-async'
import { SEO } from './components/SEO'
import { Navbar } from './sections/Navbar'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { WhyChoose } from './sections/WhyChoose'
import { Products } from './sections/Products'
import { Process } from './sections/Process'
import { Gallery } from './sections/Gallery'
import { Reviews } from './sections/Reviews'
import { FAQ } from './sections/FAQ'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { BackgroundManager } from './components/BackgroundManager'

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-paper-texture font-sans antialiased text-[#1A1A1A] relative">
        {/* Global background theme and watermarks */}
        <BackgroundManager />

        {/* Global SEO Meta Manager */}
        <SEO />

        {/* Navigation bar */}
        <Navbar />

        {/* Landing Page Content Sections */}
        <main>
          <Hero />
          <About />
          <WhyChoose />
          <Products />
          <Process />
          <Gallery />
          <Reviews />
          <FAQ />
          <Contact />
        </main>

        {/* Footer info & licenses */}
        <Footer />
      </div>
    </HelmetProvider>
  )
}

export default App
