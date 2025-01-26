import React from 'react';
import { Helmet } from 'react-helmet-async';


const SEO = ({ title, description, keywords, canonical }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    <link rel="canonical" href={canonical} />
  </Helmet>
);

export default SEO;
