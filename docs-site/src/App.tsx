import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Installation from './components/Installation'
import Modules from './components/Modules'
import Docs from './components/Docs'
import Architecture from './components/Architecture'
import FlowDiagram from './components/FlowDiagram'
import ApiRef from './components/ApiRef'
import Examples from './components/Examples'
import ReleaseNotes from './components/ReleaseNotes'
import Footer from './components/Footer'
import UnitTesting from './pages/UnitTesting'

function MainPage() {
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
        <Architecture />
        <div className="divider" />
        <FlowDiagram />
        <div className="divider" />
        <Docs />
        <div className="divider" />
        <ApiRef />
        <div className="divider" />
        <Examples />
        <div className="divider" />
        <ReleaseNotes />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/unit-testing" element={<UnitTesting />} />
    </Routes>
  )
}
