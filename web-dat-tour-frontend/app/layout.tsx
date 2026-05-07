import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "HTravel",
  description: "HTravel - Du lich va trai nghiem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        <link
          rel="shortcut icon"
          href="/clients/assets/images/logos/favicon.png"
          type="image/x-icon"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/clients/assets/css/flaticon.min.css" />
        <link
          rel="stylesheet"
          href="/clients/assets/css/fontawesome-5.14.0.min.css"
        />
        <link rel="stylesheet" href="/clients/assets/css/bootstrap.min.css" />
        <link
          rel="stylesheet"
          href="/clients/assets/css/magnific-popup.min.css"
        />
        <link rel="stylesheet" href="/clients/assets/css/nice-select.min.css" />
        <link rel="stylesheet" href="/clients/assets/css/jquery-ui.min.css" />
        <link rel="stylesheet" href="/clients/assets/css/aos.css" />
        <link rel="stylesheet" href="/clients/assets/css/slick.min.css" />
        <link rel="stylesheet" href="/clients/assets/css/style.css" />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="/clients/assets/css/jquery.datetimepicker.min.css"
        />
        <link rel="stylesheet" href="/clients/assets/css/custom-css.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css"
        />
        <link
          rel="stylesheet"
          href="/clients/assets/css/css-login/style.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css"
        />
      </head>
      <body className="min-h-full">
        <Header />
        {children}
        <Footer />
        <Script
          src="/clients/assets/js/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/clients/assets/js/bootstrap.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/appear.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/slick.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/jquery.magnific-popup.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/jquery.nice-select.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/imagesloaded.pkgd.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/skill.bars.jquery.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/jquery-ui.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/isotope.pkgd.min.js"
          strategy="afterInteractive"
        />
        <Script src="/clients/assets/js/aos.js" strategy="afterInteractive" />
        <Script
          src="/clients/assets/js/script.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/custom-js.js"
          strategy="afterInteractive"
        />
        <Script
          src="/clients/assets/js/jquery.datetimepicker.full.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
