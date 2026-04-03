import { useEffect, useState } from "react"
import LandingHeader from "../components/landing/LandingHeader"
import HeroSection from "../components/landing/HeroSection"
import ValueSection from "../components/landing/ValueSection"
import FeatureSection from "../components/landing/FeatureSection"
import FlowSection from "../components/landing/FlowSection"
import PreviewSection from "../components/landing/PreviewSection"
import CtaSection from "../components/landing/CtaSection"
import LandingFooter from "../components/landing/LandingFooter"
import { tokenStore } from "../auth/token"
import SupportFloatingButton from "../components/support/SupportFloatingButton"
import SupportPanel from "../components/support/SupportPanel"

export default function LandingLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(tokenStore.isLoggedIn())
  const [supportOpen, setSupportOpen] = useState(false)
  
  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(() => {
      setIsLoggedIn(tokenStore.isLoggedIn())
    })

    setIsLoggedIn(tokenStore.isLoggedIn())

    return unsubscribe
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingHeader isLoggedIn={isLoggedIn} />
      <main>
        <HeroSection isLoggedIn = {isLoggedIn}/>
        <ValueSection />
        <FeatureSection />
        <FlowSection />
        <PreviewSection />
        <CtaSection isLoggedIn = {isLoggedIn}/>
      </main>
      <LandingFooter isLoggedIn = {isLoggedIn}/>

      <SupportFloatingButton
        open={supportOpen}
        onClick={() => setSupportOpen((prev) => !prev)}
      />
      <SupportPanel open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}