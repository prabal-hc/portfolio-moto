import Cover from "@/components/Cover";
import Garage from "@/components/Garage";
import Nav from "@/components/Nav";
import Ride from "@/components/Ride";
import Rider from "@/components/Rider";
import Route from "@/components/Route";
import SmoothScroll from "@/components/SmoothScroll";
import Specs from "@/components/Specs";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Cover />
        <Rider />
        <Specs />
        <Garage />
        <Route />
        <Ride />
      </main>
    </>
  );
}
