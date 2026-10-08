import Cover from "@/components/Cover";
import Garage from "@/components/Garage";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Ride from "@/components/Ride";
import Rider from "@/components/Rider";
import Route from "@/components/Route";
import SmoothScroll from "@/components/SmoothScroll";
import Specs from "@/components/Specs";

const BAND = ["React", "Next.js", "TypeScript", "Tailwind", "Supabase", "Three.js", "Vue", "GSAP"];

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <div className="frame" aria-hidden />
      <Nav />
      <main>
        <Cover />
        <Marquee items={BAND} />
        <Rider />
        <Specs />
        <Garage />
        <Route />
        <Ride />
      </main>
    </>
  );
}
