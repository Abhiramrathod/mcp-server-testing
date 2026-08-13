import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from './components/SiteHeader'
import Footer from './components/Footer'
import Home from './pages/Home'
import QuickStart from './pages/QuickStart'
import Installation from './pages/Installation'
import Architecture from './pages/Architecture'
import Transports from './pages/Transports'
import Lifecycle from './pages/Lifecycle'
import IntegrationTesting from './pages/IntegrationTesting'
import ToolsTesting from './pages/ToolsTesting'
import ResourcesTesting from './pages/ResourcesTesting'
import PromptsTesting from './pages/PromptsTesting'
import Performance from './pages/Performance'
import ApiReference from './pages/ApiReference'
import Modules from './pages/Modules'
import Examples from './pages/Examples'
import Glossary from './pages/Glossary'
import Faq from './pages/Faq'
import Changelog from './pages/Changelog'
import UpcomingRelease from './pages/UpcomingRelease'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quickstart" element={<QuickStart />} />
        <Route path="/installation" element={<Installation />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/transports" element={<Transports />} />
        <Route path="/lifecycle" element={<Lifecycle />} />
        <Route path="/integration-testing" element={<IntegrationTesting />} />
        <Route path="/tools-testing" element={<ToolsTesting />} />
        <Route path="/resources-testing" element={<ResourcesTesting />} />
        <Route path="/prompts-testing" element={<PromptsTesting />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/api-reference" element={<ApiReference />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/upcoming-release" element={<UpcomingRelease />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  )
}
