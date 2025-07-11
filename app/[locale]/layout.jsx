import "@/styles/globals.css";

export const metadata = {
  title: "Redtec - ChatUI",
  description: "CHATUI",  
  image: "/assets/images/logos/logo_v1.png",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <link rel="icon" type="image/png+xml" href="/assets/images/logos/logo_v2.png" />
        <link rel="apple-touch-icon" href="/assets/images/logos/logo_v2.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:url" content={metadata.url} />
        <meta name="keywords" content="rocknrolla23, rocknrolla, rock, rolla, 23, rocknrolla.23, rocknrolla23.com" />
      </head>
      <body>
        <main className="app h-screen">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;