"use client";

import React from "react";
import { useGeneralAuth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import { useNotificationCount } from "@/lib/notificationsCount";
import Loading from "@/components/Loading";

const AboutPage = () => {
  const { user, loading } = useGeneralAuth();
  const notificationCount = useNotificationCount();

  if (loading) return <Loading />;
  return (
    <div>
      <Navbar User={user} notificationCount={notificationCount} />
      <div className="about-container">
        <div className="content">
          <h1>About Yet Another Social Media App (YASMP)</h1>
          <p>
            <strong>Yet Another Social Media App (YASMP)</strong> is a
            full-stack web application inspired by platforms like Instagram. It
            was built to showcase various skills, including Web Development,
            Cloud Deployment, CI/CD pipelining, and Software Design principles.
          </p>
          <h2>Key Features</h2>
          <ul>
            <li>
              Next.js for fast frontend development with server-side rendering.
            </li>
            <li>
              Firebase Auth for seamless user authentication and security.
            </li>
            <li>
              Firestore as a scalable NoSQL database for efficient data storage.
            </li>
            <li>
              Google Cloud App Engine for backend API hosting using Golang.
            </li>
            <li>
              Real-time notifications and updates for an engaging user
              experience.
            </li>
          </ul>
          <h2>System Design Highlights</h2>
          <p>
            YASMP's design balances ease of development and deployment
            scalability. It utilizes modern cloud technologies like Google Cloud
            Platform and Firebase, with automated CI/CD pipelines for continuous
            deployment and monitoring.
          </p>
          <h2>What I Learned</h2>
          <p>
            Working on YASMP helped me gain hands-on experience with cloud
            services, real-time data handling, and building a scalable, modular
            system. It also provided valuable insights into error handling,
            optimization, and working with large codebases.
          </p>
          <a
            href="https://github.com/ashvegeta/SocialMediaApp/blob/main/README.md"
            className="readme-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more about the project
          </a>
        </div>
      </div>

      <style jsx>{`
        .about-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #f7f9fc;
        }

        .about-container .content {
          max-width: 800px;
          background-color: #fff;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .about-container .content h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 1.5rem;
        }

        .about-container .content h2 {
          font-size: 1.8rem;
          color: #555;
          margin-top: 1.5rem;
          text-align: left;
        }

        .about-container .content p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #666;
        }

        .about-container ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .about-container ul li {
          margin-bottom: 0.8rem;
        }

        .readme-link {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 0.8rem 1.2rem;
          background-color: #0070f3;
          color: #fff;
          border-radius: 5px;
          text-decoration: none;
        }

        .readme-link:hover {
          background-color: #005bb5;
        }

        @media (max-width: 480px) {
          .about-container .content {
            padding: 1rem;
          }

          .about-container {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
