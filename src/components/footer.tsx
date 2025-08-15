// import Link from "next/link";
// import { Zap, Twitter, Github, Linkedin, Mail } from "lucide-react";
// import { Button } from "../components/ui/Button";

// export function Footer() {
//   return (
//     <footer className="border-t bg-muted/30">
//       <div className="container py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {/* Brand */}
//           <div className="space-y-4">
//             <Link href="/" className="flex items-center space-x-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
//                 <Zap className="h-5 w-5 text-primary-foreground" />
//               </div>
//               <span className="font-mono text-xl font-bold">FundLoom</span>
//             </Link>
//             <p className="text-sm text-muted-foreground leading-relaxed">
//               Empowering creators and supporters through decentralized
//               crowdfunding. Built for everyone, secured by blockchain.
//             </p>
//             <div className="flex space-x-2">
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Twitter className="h-4 w-4" />
//               </Button>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Github className="h-4 w-4" />
//               </Button>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Linkedin className="h-4 w-4" />
//               </Button>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Mail className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Platform */}
//           <div className="space-y-4">
//             <h3 className="font-semibold">Platform</h3>
//             <ul className="space-y-2 text-sm">
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Create Campaign
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Explore Campaigns
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   How It Works
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Success Stories
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Pricing
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Support */}
//           <div className="space-y-4">
//             <h3 className="font-semibold">Support</h3>
//             <ul className="space-y-2 text-sm">
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Help Center
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Community
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Documentation
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   API
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Legal */}
//           <div className="space-y-4">
//             <h3 className="font-semibold">Legal</h3>
//             <ul className="space-y-2 text-sm">
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Privacy Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Terms of Service
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Cookie Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Security
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="#"
//                   className="text-muted-foreground hover:text-foreground transition-colors"
//                 >
//                   Compliance
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
//           <p className="text-sm text-muted-foreground">
//             © 2025 Fundloom. All rights reserved.
//           </p>
//           <div className="flex items-center space-x-4 text-sm text-muted-foreground">
//             <span>Built with ❤️ for creators worldwide</span>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { Link } from "react-router-dom"; // React Router Link
import { Zap, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "../components/ui/Button";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold">FundLoom</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering creators and supporters through decentralized
              crowdfunding. Built for everyone, secured by blockchain.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Campaign
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore Campaigns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 FundLoom. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Built with ❤️ for creators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
