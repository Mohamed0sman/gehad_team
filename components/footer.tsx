import { Trello } from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Trello className="h-5 w-5 text-blue-400" />
            <span className="text-lg font-bold">TrelloClone</span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <span>© 2025 Gehad Team. All rights reserved.</span>
            <span>Built with Next.js 15, Clerk & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
