import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "AI Job Matcher",
  description: "MVP scaffold"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">AI Job Matcher</div>
            <div className="nav-links">
              <Link href="/">Match CV</Link>
              <Link href="/jobs">Jobs List</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
