// import { Check } from "lucide-react";

// export default function TempHome() {
//   return (
//     <div className="min-h-screen bg-white font-sans">
//       {/* Header */}
//       <header className="relative z-10 px-4 sm:px-8 md:px-20 lg:px-[140px] py-6 md:py-10">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-2">
//             <img
//               src="https://api.builder.io/api/v1/image/assets/TEMP/51d0dfb48dbdd2564ab9655d986d35b6de4185ad?width=378"
//               alt="UAEPermit.com"
//               className="h-8 md:h-12 w-auto"
//             />
//           </div>

//           {/* Navigation - Desktop */}
//           <nav className="hidden lg:flex items-center gap-8 text-base font-semibold">
//             <a href="#" className="hover:text-uae-mint transition-colors">
//               Apply
//             </a>
//             <a href="#" className="hover:text-uae-mint transition-colors">
//               Track
//             </a>
//             <a href="#" className="hover:text-uae-mint transition-colors">
//               FAQs
//             </a>
//             <a href="#" className="hover:text-uae-mint transition-colors">
//               Blog
//             </a>
//           </nav>

//           {/* Contact Button */}
//           <button className="bg-black text-white px-6 py-3 rounded-full text-sm md:text-base font-semibold hover:bg-gray-900 transition-colors">
//             Contact us
//           </button>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         {/* Decorative Gradient Blobs */}
//         <div className="absolute top-0 right-0 w-[400px] md:w-[677px] h-[300px] md:h-[523px] opacity-70 pointer-events-none">
//           <div className="absolute w-[237px] h-[237px] md:w-[475px] md:h-[475px] rounded-full bg-uae-light blur-[50px] md:blur-[100px] right-0 top-0"></div>
//           <div className="absolute w-[191px] h-[191px] md:w-[382px] md:h-[383px] rounded-full bg-uae-mint opacity-34 blur-[50px] md:blur-[100px] left-0 top-20 md:top-40"></div>
//         </div>
//         <div className="absolute top-40 md:top-80 left-0 w-[200px] md:w-[419px] h-[300px] md:h-[546px] opacity-70 pointer-events-none">
//           <div className="absolute w-[146px] h-[146px] md:w-[293px] md:h-[293px] rounded-full bg-uae-light blur-[50px] md:blur-[100px]"></div>
//           <div className="absolute w-[146px] h-[146px] md:w-[293px] md:h-[293px] rounded-full bg-uae-mint opacity-34 blur-[50px] md:blur-[100px] right-0 top-20"></div>
//         </div>

//         <div className="relative grid lg:grid-cols-2 gap-12 items-center">
//           {/* Left Content */}
//           <div className="space-y-6">
//             <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
//               The Quickest Method to Obtain Your{" "}
//               <span className="font-bold">UAE PERMIT</span>
//             </h1>
//             <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//               Our expertise lies in providing permit assistance and
//               travel-related services to individuals and businesses in the
//               United Arab Emirates. As a licensed private agency, we simplify
//               the process of obtaining travel permits and documentation with
//               professionalism and transparency.
//             </p>

//             {/* Search Bar */}
//             <div className="relative max-w-[686px]">
//               <div className="bg-white border border-gray-200 rounded-full p-1 flex items-center gap-2 shadow-sm">
//                 <div className="pl-4 flex items-center gap-3 flex-1">
//                   <svg
//                     className="w-6 h-6 text-uae-mint flex-shrink-0"
//                     fill="currentColor"
//                     viewBox="0 0 27 27"
//                   >
//                     <path d="M26.684 25.052L19.174 17.473C20.644 15.631 21.529 13.296 21.529 10.758C21.529 4.817 16.713 0 10.764 0C4.815 0 0 4.823 0 10.765C0 16.707 4.816 21.523 10.765 21.523C13.338 21.523 15.694 20.623 17.55 19.118L25.01 26.648C25.235 26.887 25.544 27.007 25.847 27.007C26.135 27.007 26.424 26.902 26.642 26.691C27.106 26.248 27.12 25.517 26.684 25.053L26.684 25.052ZM10.765 19.209C8.508 19.209 6.385 18.33 4.788 16.734C3.192 15.138 2.313 13.014 2.313 10.764C2.313 8.507 3.192 6.384 4.788 4.794C6.384 3.198 8.508 2.319 10.765 2.319C13.022 2.319 15.145 3.198 16.742 4.794C18.338 6.39 19.217 8.514 19.217 10.764C19.217 13.021 18.338 15.144 16.742 16.734C15.146 18.33 13.022 19.209 10.765 19.209Z" />
//                   </svg>
//                   <input
//                     type="text"
//                     placeholder="type your country to proceed"
//                     className="flex-1 text-sm md:text-base outline-none placeholder:text-gray-400 placeholder:opacity-50"
//                   />
//                 </div>
//                 <button className="bg-uae-mint text-black font-semibold px-6 md:px-8 py-3 rounded-full hover:bg-opacity-90 transition-all">
//                   Search
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Image */}
//           <div className="hidden lg:block">
//             <img
//               src="https://api.builder.io/api/v1/image/assets/TEMP/0e0ae003466d8b5f5ed27a8b27c8a4fd589059b5?width=594"
//               alt="Woman with luggage"
//               className="w-full max-w-[297px] ml-auto"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Comparison Section */}
//       <section className="relative px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         <h2 className="text-2xl md:text-4xl font-medium text-center mb-12 md:mb-16">
//           Why millions of travelers choose UAEPermit
//         </h2>

//         {/* Decorative Circles */}
//         <div className="absolute right-0 top-20 md:top-40 w-[120px] h-[120px] md:w-[241px] md:h-[241px] rounded-full bg-uae-mint -z-10"></div>
//         <div className="absolute right-40 md:right-80 top-0 md:top-20 w-[120px] h-[120px] md:w-[241px] md:h-[241px] rounded-full bg-uae-light -z-10"></div>

//         <div className="relative max-w-[1188px] mx-auto">
//           <div className="bg-white/20 backdrop-blur-[45px] border border-white rounded-2xl p-6 md:p-12">
//             <div className="grid md:grid-cols-2 gap-8 md:gap-12">
//               {/* Do It Yourself */}
//               <div>
//                 <h3 className="text-xl md:text-2xl font-bold mb-6">
//                   Do It Yourself
//                 </h3>
//                 <ul className="space-y-4">
//                   {[
//                     "Confusing government websites and forms",
//                     "Unclear instructions",
//                     "One mistake can cause rejection or delays",
//                     "Applications accepted only at limited times",
//                     "Little or no assistance available",
//                     "Must restart if you lose progress",
//                     "Limited payment methods",
//                   ].map((item, i) => (
//                     <li
//                       key={i}
//                       className="flex items-start gap-3 text-sm md:text-base"
//                     >
//                       <Check className="w-5 h-5 text-uae-mint flex-shrink-0 mt-0.5" />
//                       <span>{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* With UAEPermit */}
//               <div>
//                 <div className="flex items-center gap-2 mb-6">
//                   <h3 className="text-xl md:text-2xl font-bold">With</h3>
//                   <img
//                     src="https://api.builder.io/api/v1/image/assets/TEMP/7eb6e0a361e132f60d9544951f723264e23a84c7?width=258"
//                     alt="UAEPermit"
//                     className="h-6 md:h-8"
//                   />
//                 </div>
//                 <ul className="space-y-4">
//                   {[
//                     "Simple, user-friendly application",
//                     "Clear, step-by-step guidance",
//                     "Careful review to avoid mistakes",
//                     "Apply anytime, 24/7",
//                     "Dedicated chat, WhatsApp, and email support",
//                     "Save and continue anytime",
//                     "Multiple payment options",
//                   ].map((item, i) => (
//                     <li
//                       key={i}
//                       className="flex items-start gap-3 text-sm md:text-base"
//                     >
//                       <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
//                       <span>{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             <div className="text-center mt-8">
//               <button className="border-2 border-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-all">
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Statistics Section */}
//       <section className="px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         <div className="max-w-[1160px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//           {[
//             { number: "99%", text: "worldwide approval rate" },
//             { number: "12+", text: "years of experience" },
//             { number: "24/7", text: "assistance in your language" },
//             { number: "200+", text: "passport nationalities served" },
//           ].map((stat, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center border border-white"
//             >
//               <div className="text-3xl md:text-5xl font-bold text-uae-mint mb-2">
//                 {stat.number}
//               </div>
//               <div className="text-xs md:text-base text-gray-800 capitalize">
//                 {stat.text}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Process Section */}
//       <section className="relative px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         {/* Background Decorations */}
//         <div className="absolute left-0 top-0 w-[300px] md:w-[615px] h-[300px] md:h-[586px] opacity-70 pointer-events-none">
//           <div className="absolute w-[184px] h-[184px] md:w-[369px] md:h-[369px] rounded-full bg-uae-light blur-[50px] md:blur-[100px]"></div>
//           <div className="absolute w-[148px] h-[148px] md:w-[297px] md:h-[297px] rounded-full bg-uae-mint opacity-34 blur-[50px] md:blur-[100px] right-0 top-20"></div>
//         </div>

//         <div className="relative grid lg:grid-cols-2 gap-12 items-center">
//           {/* Left Image */}
//           <div className="order-2 lg:order-1">
//             <img
//               src="https://api.builder.io/api/v1/image/assets/TEMP/8fb1203bf356467b2d3332c2532cd48f884b9139?width=452"
//               alt="Process illustration"
//               className="w-full max-w-[226px] mx-auto"
//             />
//           </div>

//           {/* Right Content */}
//           <div className="order-1 lg:order-2 space-y-8">
//             <h2 className="text-2xl md:text-4xl font-medium">
//               Our easy Process
//             </h2>

//             {/* Step 1 */}
//             <div className="flex gap-4">
//               <div className="flex-shrink-0 w-12 h-12 md:w-[78px] md:h-[78px] rounded-full bg-uae-mint flex items-center justify-center">
//                 <svg
//                   className="w-6 h-6 md:w-8 md:h-8"
//                   viewBox="0 0 37 37"
//                   fill="none"
//                 >
//                   <path d="M21 21H37V37H21V21Z" fill="black" />
//                   <path
//                     d="M18.2172 21.0001C22.1745 21.0001 26.1318 20.9995 30.0891 21.0003C31.1194 21.0007 32.3808 22.2497 32.3811 24.2656V37H18.2172V21.0001Z"
//                     fill="black"
//                   />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-sm md:text-base mb-2">
//                   1. Find your visa
//                 </h3>
//                 <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//                   Use our visa checker to know exactly what's needed — no
//                   confusion.
//                 </p>
//               </div>
//             </div>

//             {/* Step 2 */}
//             <div className="flex gap-4">
//               <div className="flex-shrink-0 w-12 h-12 md:w-[78px] md:h-[78px] rounded-full bg-uae-light flex items-center justify-center">
//                 <svg
//                   className="w-6 h-6 md:w-8 md:h-8"
//                   viewBox="0 0 36 36"
//                   fill="none"
//                 >
//                   <path d="M18 4L8 14H28L18 4Z" fill="black" />
//                   <rect x="14" y="14" width="8" height="18" fill="black" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-sm md:text-base mb-2">
//                   2. Apply and pay in minutes
//                 </h3>
//                 <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//                   Enter your travel details, pay securely, and upload the
//                   required documents
//                 </p>
//               </div>
//             </div>

//             {/* Step 3 */}
//             <div className="flex gap-4">
//               <div className="flex-shrink-0 w-12 h-12 md:w-[78px] md:h-[78px] rounded-full bg-uae-mint flex items-center justify-center">
//                 <svg
//                   className="w-6 h-6 md:w-8 md:h-8"
//                   viewBox="0 0 33 38"
//                   fill="none"
//                 >
//                   <path d="M16.5 0L8 8H25L16.5 0Z" fill="black" />
//                   <rect x="12" y="8" width="9" height="30" fill="black" />
//                 </svg>
//               </div>
//               <div>
//                 <h3 className="font-bold text-sm md:text-base mb-2">
//                   3. We take care of everything
//                 </h3>
//                 <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//                   Our smart technology and expert team review your application
//                   to ensure smooth approval.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Reviews Section */}
//       <section className="px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         <h2 className="text-2xl md:text-4xl font-medium text-center mb-12 capitalize">
//           reviews
//         </h2>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1160px] mx-auto">
//           {[
//             {
//               name: "Jo Bronte",
//               review:
//                 "Very easy application process, totally digital and super fast approval, less than 24 hours.",
//             },
//             {
//               name: "Arshad Mahmood",
//               review:
//                 "The iVisa Team granted full help and support at every step of visa application process, ultimately achieved success in getting visitor visa.",
//             },
//             {
//               name: "Roy Alan Facey",
//               review:
//                 "The process of obtaining the visa was made very simple – bearing in mind that I am not as tech savvy as some younger people.",
//             },
//           ].map((review, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-lg shadow-lg p-6 md:p-8 border border-gray-100"
//             >
//               <div className="flex gap-1 mb-3">
//                 {[...Array(5)].map((_, i) => (
//                   <svg
//                     key={i}
//                     className="w-4 h-4"
//                     viewBox="0 0 20 20"
//                     fill="#00B67A"
//                   >
//                     <rect width="20" height="20" fill="#00B67A" />
//                   </svg>
//                 ))}
//               </div>
//               <h3 className="font-bold text-sm md:text-base mb-3">
//                 {review.name}
//               </h3>
//               <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//                 {review.review}
//               </p>
//             </div>
//           ))}
//         </div>

//         <div className="flex justify-center gap-2 mt-8">
//           <div className="w-2 h-2 rounded-full bg-uae-mint"></div>
//           <div className="w-2 h-2 rounded-full bg-gray-300"></div>
//           <div className="w-2 h-2 rounded-full bg-gray-300"></div>
//         </div>
//       </section>

//       {/* Countries Section */}
//       <section className="px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20 bg-gray-50/50">
//         <h2 className="text-2xl md:text-4xl font-medium text-center mb-8 md:mb-12 lowercase">
//           Countries Whose Citizens need a UAE visit Visa
//         </h2>

//         {/* Search Bar */}
//         <div className="max-w-[594px] mx-auto mb-12">
//           <div className="bg-white border border-gray-200 rounded-full p-1 flex items-center gap-2">
//             <div className="pl-4 flex items-center gap-3 flex-1">
//               <svg
//                 className="w-6 h-6 text-uae-mint flex-shrink-0"
//                 fill="currentColor"
//                 viewBox="0 0 27 27"
//               >
//                 <path d="M26.684 25.052L19.174 17.473C20.644 15.631 21.529 13.296 21.529 10.758C21.529 4.817 16.713 0 10.764 0C4.815 0 0 4.823 0 10.765C0 16.707 4.816 21.523 10.765 21.523C13.338 21.523 15.694 20.623 17.55 19.118L25.01 26.648C25.235 26.887 25.544 27.007 25.847 27.007C26.135 27.007 26.424 26.902 26.642 26.691C27.106 26.248 27.12 25.517 26.684 25.053L26.684 25.052ZM10.765 19.209C8.508 19.209 6.385 18.33 4.788 16.734C3.192 15.138 2.313 13.014 2.313 10.764C2.313 8.507 3.192 6.384 4.788 4.794C6.384 3.198 8.508 2.319 10.765 2.319C13.022 2.319 15.145 3.198 16.742 4.794C18.338 6.39 19.217 8.514 19.217 10.764C19.217 13.021 18.338 15.144 16.742 16.734C15.146 18.33 13.022 19.209 10.765 19.209Z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search country"
//                 className="flex-1 text-sm md:text-base outline-none placeholder:text-gray-400 placeholder:opacity-50"
//               />
//             </div>
//             <button className="bg-uae-mint text-black font-semibold px-6 md:px-8 py-3 rounded-full">
//               Search
//             </button>
//           </div>
//         </div>

//         {/* Countries Grid */}
//         <div className="max-w-[860px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
//           {[
//             "Bangladesh",
//             "India",
//             "Pakistan",
//             "Bhutan",
//             "North Korea",
//             "Sri Lanka",
//             "Vietnam",
//             "Nepal",
//             "Mongolia",
//             "Japan",
//             "South Korea",
//             "Afghanistan",
//             "Brunei",
//             "Bahrain",
//             "Azerbaijan",
//             "Armenia",
//           ].map((country, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-3 text-sm md:text-base"
//             >
//               <div className="w-10 h-7 md:w-11 md:h-8 bg-gray-200 rounded border border-gray-300"></div>
//               <span>{country}</span>
//             </div>
//           ))}
//         </div>

//         <div className="text-center">
//           <button className="border-2 border-black px-8 py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-all">
//             All Countries
//           </button>
//         </div>
//       </section>

//       {/* Blog Section */}
//       <section className="px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20">
//         <h2 className="text-2xl md:text-4xl font-medium text-center mb-12">
//           Blogs
//         </h2>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1160px] mx-auto">
//           {[1, 2, 3].map((_, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-lg overflow-hidden shadow-lg"
//             >
//               <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
//               <div className="p-6">
//                 <h3 className="font-bold text-lg mb-3">
//                   Lorem ipsum dolor sit amet
//                 </h3>
//                 <p className="text-sm text-gray-700 mb-4 leading-relaxed">
//                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
//                   in iaculis ante.{" "}
//                   <span className="font-bold">
//                     Mauris eget lectus diam. Nullam a ante est. Phasellus
//                     finibus mauris turpis, quis volutpat ante vehicula at....
//                   </span>
//                 </p>
//                 <a
//                   href="#"
//                   className="inline-flex items-center gap-2 text-uae-mint font-medium text-sm"
//                 >
//                   <span>Read More</span>
//                   <div className="w-5 h-5 rounded-full border-2 border-uae-mint flex items-center justify-center">
//                     <svg
//                       className="w-3 h-3"
//                       fill="currentColor"
//                       viewBox="0 0 8 8"
//                     >
//                       <path d="M6.52246 5.36442e-07C6.70478 -0.000101447 6.87979 0.0723345 7.00879 0.201172C7.1379 0.330288 7.21016 0.505883 7.20996 0.688477V6.52246C7.21013 6.70496 7.1378 6.87971 7.00879 7.00879C6.87976 7.13782 6.70492 7.21104 6.52246 7.21094H0.688477C0.308377 7.21094 0.000124067 6.90253 0 6.52246C6.85453e-07 6.14229 0.3083 5.83399 0.688477 5.83398H4.8623L0.203125 1.17481C-0.0653606 0.90632 -0.0653606 0.470635 0.203125 0.202149C0.471571 -0.0658588 0.906437 -0.0659846 1.1748 0.202149L5.83398 4.86133V0.689454C5.83375 0.506903 5.90613 0.331275 6.03516 0.202149C6.1643 0.0730043 6.33982 -0.000230759 6.52246 5.36442e-07Z" />
//                     </svg>
//                   </div>
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="px-4 sm:px-8 md:px-20 lg:px-[140px] py-12 md:py-20 bg-uae-dark text-white relative overflow-hidden">
//         {/* Decorative gradient bar */}
//         <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-uae-light to-uae-mint"></div>

//         <div className="max-w-[1160px] mx-auto grid lg:grid-cols-[2fr,1fr] gap-8 items-center relative z-10">
//           <div>
//             <h2 className="text-2xl md:text-4xl font-medium mb-4">
//               <span className="text-uae-mint">
//                 Need fast assistance to UAE travel?
//               </span>
//             </h2>
//             <p className="text-xl md:text-2xl">
//               Apply now to get professional assistance and quick processing
//               support from our licensed travel agency.
//             </p>
//           </div>
//           <div className="text-right">
//             <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all">
//               Contact us
//             </button>
//           </div>
//         </div>

//         <div className="max-w-[1160px] mx-auto mt-8 pt-8 border-t border-white/20">
//           <p className="text-xs leading-relaxed opacity-90">
//             Disclaimer: uaepermit.com is operated by Budget Travel & Tourism LLC
//             (License No. 1202281), a licensed private travel and tourism agency
//             based in Dubai, United Arab Emirates. We provide professional
//             assistance and support for UAE visit visa applications and related
//             travel documentation. uaepermit.com is not affiliated with the UAE
//             Government or any official immigration authority. Our services
//             include consultation, document preparation, and customer support.
//             Service fees apply in addition to any applicable government visa
//             charges. Applicants may also choose to apply directly through
//             official UAE government channels at a lower cost, without using our
//             private support services.
//           </p>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-uae-dark text-white px-4 sm:px-8 md:px-20 lg:px-[140px] py-12">
//         <div className="max-w-[1160px] mx-auto">
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
//             {/* Logo & Social */}
//             <div>
//               <img
//                 src="https://api.builder.io/api/v1/image/assets/TEMP/2a7018a009cf971c04bb7b63b8d0e59dd507fe38?width=378"
//                 alt="UAEPermit"
//                 className="h-12 mb-4"
//               />
//               <div className="flex gap-3">
//                 <a
//                   href="#"
//                   className="w-8 h-8 rounded-full bg-uae-mint flex items-center justify-center hover:opacity-80"
//                 >
//                   <svg
//                     className="w-4 h-4 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                   </svg>
//                 </a>
//                 <a
//                   href="#"
//                   className="w-8 h-8 rounded-full bg-uae-mint flex items-center justify-center hover:opacity-80"
//                 >
//                   <svg
//                     className="w-4 h-4 text-white"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>

//             {/* Get in Touch */}
//             <div>
//               <h3 className="font-bold mb-4 text-sm uppercase">Get in Touch</h3>
//               <div className="space-y-2 text-sm">
//                 <p>sales@uaepermit.com</p>
//                 <p>+971 56 261 7646</p>
//                 <p className="text-xs leading-relaxed">
//                   M21 Abdul Rahman Hassan Building Al Khabeesi Deira Dubai
//                 </p>
//               </div>
//             </div>

//             {/* Help & Support */}
//             <div>
//               <h3 className="font-bold mb-4 text-sm">Help & Support</h3>
//               <div className="space-y-2 text-sm">
//                 <p>support@uaepermit.com</p>
//                 <a href="#" className="block hover:text-uae-mint">
//                   FAQ
//                 </a>
//                 <p className="text-xs leading-tight mt-4">
//                   UAEPermit.com is operated by Budget Travel & Tourism LLC (DTCM
//                   License No. 1202281). Verify License
//                 </p>
//               </div>
//             </div>

//             {/* About Us */}
//             <div>
//               <h3 className="font-bold mb-4 text-sm">About Us</h3>
//               <div className="space-y-2 text-sm">
//                 <a href="#" className="block hover:text-uae-mint">
//                   About Us
//                 </a>
//                 <a href="#" className="block hover:text-uae-mint">
//                   Stay & Overstay Rules
//                 </a>
//                 <a href="#" className="block hover:text-uae-mint">
//                   Term of use
//                 </a>
//                 <a href="#" className="block hover:text-uae-mint">
//                   Privacy Policy
//                 </a>
//                 <a href="#" className="block hover:text-uae-mint">
//                   Blogs
//                 </a>
//               </div>
//             </div>
//           </div>

//           <div className="border-t border-white/20 pt-6 text-sm text-center md:text-left">
//             <p>Copyrights © 2026 UAEPermit.com All Rights Reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
