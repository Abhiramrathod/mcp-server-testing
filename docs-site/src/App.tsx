import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Installation from './components/Installation'
import Modules from './components/Modules'
import Docs from './components/Docs'
import Architecture from './components/Architecture'
import Examples from './components/Examples'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-14 pb-12">
        <Hero />
        <div className="divider" />
        <Features />
        <div className="divider" />
        <Installation />
        <div className="divider" />
        <Modules />
        <div className="divider" />
        <Docs />
        <div className="divider" />
        <Architecture />
        <div className="divider" />
        <Examples />
      </main>
      <Footer />
    </>
  )
}
