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
  title = "Kampala Kids Life Skills Programme | Holiday Training for Children",
  description = "Empower your child with essential life skills through our comprehensive holiday programme in Kampala. Professional training in cooking, cleaning, leadership, financial literacy & more. Ages 6-17. Enroll now!",
  keywords = "Kampala kids life skills, children holiday programme Uganda, practical skills training, cooking classes children Kampala, leadership development kids, responsibility training, confidence building children, life skills education Uganda, holiday activities Kampala, children development programme",
  image = "/src/assets/children-learning-1.jpg",
  url = typeof window !== 'undefined' ? window.location.href : 'https://kampala-kids-skills.com',
  type = "website",
  children
}) => {
  const siteName = "Kampala Kids Life Skills Programme";
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
          "name": "Kampala Kids Life Skills Programme",
          "description": description,
          "url": url,
          "logo": "/src/assets/life-skills-logo.png",
          "image": image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kampala",
            "addressRegion": "Central Region",
            "addressCountry": "Uganda"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+256 XX XXX XXXX",
            "contactType": "customer service",
            "availableLanguage": ["English", "Luganda"],
            "areaServed": "UG"
          },
          "serviceArea": {
            "@type": "City",
            "name": "Kampala"
          },
          "foundingDate": "2023",
          "numberOfStudents": "500+",
          "slogan": "Building Confidence, Responsibility & Life Skills"
        })}
      </script>

      {/* Course/Programme Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Kampala Kids Life Skills Holiday Programme",
          "description": "Comprehensive life skills training programme for children aged 6-17, covering cooking, cleaning, personal care, leadership, financial literacy, and practical DIY skills.",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Kampala Kids Life Skills Programme",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Kampala",
              "addressRegion": "Central Region",
              "addressCountry": "Uganda"
            }
          },
          "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "validFrom": "2023-01-01",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": "Contact for pricing",
              "priceCurrency": "UGX"
            }
          },
          "courseMode": ["offline", "hands-on"],
          "educationalLevel": ["Beginner", "Intermediate", "Advanced"],
          "timeRequired": "P4D",
          "inLanguage": ["en", "lg"],
          "coursePrerequisites": "None - Age-appropriate levels available (6-17 years)",
          "teaches": [
            "Culinary Skills & Nutrition",
            "House Cleaning & Organization",
            "Personal Care & Hygiene",
            "Leadership & Communication",
            "Financial Literacy & Budgeting",
            "DIY & Maker Skills",
            "Study Skills & Time Management",
            "Ethics & Social Responsibility"
          ],
          "audience": {
            "@type": "EducationalAudience",
            "educationalRole": "student",
            "audienceType": "children",
            "suggestedMinAge": 6,
            "suggestedMaxAge": 17
          }
        })}
      </script>

      {/* FAQ Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What age groups do you cater to?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We welcome children aged 6-17 years with age-appropriate skill levels and activities designed for different developmental stages."
              }
            },
            {
              "@type": "Question", 
              "name": "What skills do children learn?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our programme covers culinary skills, house cleaning, personal care, leadership, financial literacy, DIY skills, study skills, and social responsibility."
              }
            },
            {
              "@type": "Question",
              "name": "How long is the programme?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our standard holiday programme runs for 4 intensive days, with weekend classes and private tutoring also available."
              }
            },
            {
              "@type": "Question",
              "name": "Where are you located?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We are based in Kampala, Uganda, serving families throughout the Central Region with convenient locations and flexible scheduling."
              }
            }
          ]
        })}
      </script>

      {children}
    </Helmet>
  );
};

export default SEO;