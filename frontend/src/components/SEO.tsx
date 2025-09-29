import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title = "Children's Life Skills Holiday Programme | Kampala, Uganda",
  description = "Equip your child with practical life skills, confidence, and responsibility through our structured holiday programme in Kampala. Cooking, cleaning, leadership & more. Enroll today!",
  keywords = "children life skills, holiday programme Kampala, kids training Uganda, cooking classes children, leadership skills, practical skills, confidence building, responsibility, children development Kampala",
  image = "/assets/children-learning-1.jpg",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  children
}) => {
  const siteName = "Children's Life Skills Programme";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Children's Life Skills Programme" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_UG" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Favicon */}
      <link rel="icon" type="image/jpeg" href="/favicon.jpeg" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Local Business Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": "Children's Life Skills Holiday Programme",
          "description": description,
          "url": url,
          "logo": "/assets/life-skills-logo.jpeg",
          "image": image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kampala",
            "addressCountry": "Uganda"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+256754723614",
            "contactType": "customer service",
            "availableLanguage": "English"
          },
          "sameAs": [
            // Add social media URLs when available
          ],
          "offers": {
            "@type": "Offer",
            "name": "Life Skills Holiday Programme",
            "description": "4-day intensive life skills training for children aged 8-17",
            "price": "200000",
            "priceCurrency": "UGX",
            "availability": "https://schema.org/InStock"
          },
          "areaServed": {
            "@type": "City",
            "name": "Kampala"
          }
        })}
      </script>

      {/* Course/Programme Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Children's Life Skills Holiday Programme",
          "description": "Comprehensive life skills training programme for children aged 8-17, covering cooking, cleaning, personal care, leadership, and financial literacy.",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Children's Life Skills Programme",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kampala",
              "addressCountry": "Uganda"
            }
          },
          "offers": {
            "@type": "Offer",
            "price": "200000",
            "priceCurrency": "UGX",
            "availability": "https://schema.org/InStock"
          },
          "courseMode": "offline",
          "educationalLevel": "Beginner to Advanced",
          "timeRequired": "P4D",
          "inLanguage": "en",
          "coursePrerequisites": "None - Age-appropriate levels available",
          "teaches": [
            "Culinary Skills",
            "House Cleaning",
            "Personal Care",
            "Leadership Skills",
            "Financial Literacy",
            "DIY Skills"
          ]
        })}
      </script>

      {children}
    </Helmet>
  );
};

export default SEO;