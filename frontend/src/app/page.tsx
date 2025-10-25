import Link from "next/link";
import styles from "./indexStyles.module.css";
import Image from "next/image";
import UnauthenticatedNavbar from "./components/indexPage/unauthenticatedNavbar";
import AuthenticatedNavbar from "./components/indexPage/authenticatedNavbar";
import { cookies } from "next/headers";

export default function Home() {
  const listOfCookies = cookies();
  const tokenExists = listOfCookies.has("token");
  console.log(tokenExists);

  return (
    <main className={styles.body}>
      {tokenExists ? <AuthenticatedNavbar /> : <UnauthenticatedNavbar />}
      {/* Introduction */}
      <div className={styles.introSection}>
        <div className="grid grid-cols-2 gap-6 pt-8">
          <div className="mx-20 align-center mt-12">
            <h1 className="text-3xl font-bold text-center">
              Agile Development is increasing in popularity.
            </h1>
            <p className="text-center mt-4">
              Experience the power of Agile project management with our system!
              It embraces change and delivers the most valuable features first,
              ensuring that your project stays on track and within budget. Our
              system fosters a collaborative environment where responsibilities
              are shared, leading to improved communication and project
              management. Plus, our system breaks down complex processes into
              manageable &quot;sprints&quot;, allowing for rapid feedback and
              continuous improvement.
            </p>
          </div>
          <div className="text-xl flex items-center justify-center">
            <Image
              src="/HomepageImage1.png"
              width={700}
              height={700}
              alt="User Dashboard Image"
            />
          </div>
        </div>
      </div>

      {/* Screenshots of Application - Slideshow */}
      <div className={styles.applicationSlideshow}>
        <div className="carousel w-4/5">
          <div id="slide1" className="carousel-item relative w-full">
            <div className="w-full h-[800px] relative">
              {" "}
              {/* Tailwind CSS container */}
              <Image
                src="/HomepageCarouselImage1.png"
                layout="fill" // This makes the image fill its container
                objectFit="cover" // This ensures the image covers the container without distortion
                alt="Placeholder for image 1"
              />
            </div>
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <Link href="#slide3" className="btn btn-circle">
                ❮
              </Link>
              <Link href="#slide2" className="btn btn-circle">
                ❯
              </Link>
            </div>
          </div>
          <div id="slide2" className="carousel-item relative w-full">
            <div className="w-full h-[800px] relative">
              {" "}
              {/* Tailwind CSS container */}
              <Image
                src="/HomepageCarouselImage2.png"
                layout="fill" // This makes the image fill its container
                objectFit="cover" // This ensures the image covers the container without distortion
                alt="Placeholder for image 2"
              />
            </div>
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <Link href="#slide1" className="btn btn-circle">
                ❮
              </Link>
              <Link href="#slide3" className="btn btn-circle">
                ❯
              </Link>
            </div>
          </div>
          <div id="slide3" className="carousel-item relative w-full">
            <div className="w-full h-[800px] relative">
              {" "}
              {/* Tailwind CSS container */}
              <Image
                src="/HomepageCarouselImage3.png"
                layout="fill" // This makes the image fill its container
                objectFit="cover" // This ensures the image covers the container without distortion
                alt="Placeholder for image 3"
              />
            </div>
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <Link href="#slide2" className="btn btn-circle">
                ❮
              </Link>
              <Link href="#slide1" className="btn btn-circle">
                ❯
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Articles about benefits of agile project management */}
      <div className={styles.articles}>
        {/* Card 1 */}
        <div className="card w-90 flex justify-center align-center shadow-xl pt-1 pl-1 mr-4">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Agile Development Benefits</h2>
            <p>Placeholder for Description</p>
            <div className="card-title">
              <button className="btn glass">
                <Link href="https://kissflow.com/project/agile/benefits-of-agile/">
                  Read about it here.
                </Link>
              </button>
            </div>
          </div>
        </div>
        {/* Card 2*/}
        <div className="card w-90 flex justify-center align-center shadow-xl pt-1 pl-1 mr-4">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Agile Development Statistics</h2>
            <p>Placeholder for Description</p>
            <div className="card-title">
              <button className="btn glass">
                <Link href="https://www.runn.io/blog/agile-statistics">
                  Read about it here.
                </Link>
              </button>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="card w-90 flex justify-center align-center shadow-xl pt-1 pl-1">
          <div className="card-body items-center text-center">
            <h2 className="card-title">How Agile Development Works</h2>
            <p>Placeholder for Description</p>
            <div className="card-title">
              <button className="btn glass">
                <Link href="https://www.atlassian.com/agile">
                  Read about it here.
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
