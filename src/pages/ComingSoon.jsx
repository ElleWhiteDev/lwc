import { Link } from "react-router-dom";
import StarBurstTarget from "../components/StarBurstTarget";
import "./ComingSoon.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const ComingSoon = () => (
  <div className="coming-soon">
    <section
      className="coming-soon-hero"
      style={{ backgroundImage: `url(${LWCHomeBackground})` }}
      aria-labelledby="coming-soon-title"
    >
      <div className="container coming-soon-container">
        <div className="coming-soon-content">
          <h1 id="coming-soon-title" className="coming-soon-title">
            <span className="title-block">A Life Worth</span>
            <span className="title-script" aria-label="Celebrating">
              <span aria-hidden="true">
                <span className="letter-C">C</span>
                <span className="letter-e1">e</span>
                <span className="letter-l">l</span>
                <span className="letter-e2">e</span>
                <span className="letter-b">b</span>
                <span className="letter-r">r</span>
                <span className="letter-a">a</span>
                <span className="letter-t">t</span>
                <span className="letter-i">i</span>
                <span className="letter-n">n</span>
                <span className="letter-g">g</span>
              </span>
            </span>
          </h1>
          <p className="coming-soon-subtitle">
            Our new website is launching soon! We&apos;re creating an even better
            experience to celebrate our vibrant community.
          </p>
          <div className="coming-soon-message">
            <h2>Coming Soon</h2>
            <p>Stay tuned for something special!</p>
          </div>
          <div className="coming-soon-buttons">
            <Link to="/preview" className="btn btn-rainbow">
              Preview Site
            </Link>
          </div>
        </div>

        <StarBurstTarget className="coming-soon-image" />
      </div>
    </section>
  </div>
);

export default ComingSoon;
