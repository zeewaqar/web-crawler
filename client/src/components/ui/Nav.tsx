"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Menu, Globe, ArrowLeft, RefreshCw, Home} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {SignOutButton} from "@/lib/SignOutButton";
import {cn} from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Context for page-specific navigation data
interface NavContextType {
  pageTitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  updateNavData?: (data: NavContextType) => void;
}

const NavContext = createContext<NavContextType>({});

export const useNavContext = () => useContext(NavContext);

export const NavProvider = ({children}: {children: React.ReactNode}) => {
  const [navData, setNavData] = useState<NavContextType>({});

  // Memoize updateNavData to prevent unnecessary re-renders
  const updateNavData = useCallback((data: NavContextType) => {
    setNavData((prev) => ({...prev, ...data}));
  }, []);

  // Reset nav data on unmount
  useEffect(() => {
    return () => updateNavData({});
  }, [updateNavData]);

  return (
    <NavContext.Provider value={{...navData, updateNavData}}>
      {children}
    </NavContext.Provider>
  );
};

// Hook for pages to register their navigation data
export const useNavigation = (data: NavContextType) => {
  const {updateNavData} = useNavContext();

  useEffect(() => {
    if (updateNavData) {
      updateNavData(data);
    }

    // Cleanup on unmount
    return () => {
      if (updateNavData) {
        updateNavData({});
      }
    };
  }, [data, data.pageTitle, data.onRefresh, data.isLoading, updateNavData]);
};

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const {pageTitle, onRefresh, isLoading} = useNavContext();

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = useCallback(() => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{label: "Dashboard", href: "/dashboard", icon: Home}];

    if (segments.includes("urls")) {
      const urlId = segments[segments.length - 1];
      if (urlId && urlId !== "urls") {
        breadcrumbs.push({
          label: pageTitle || `URL Analysis #${urlId}`,
          href: `/urls/${urlId}`,
          icon: Globe,
        });
      }
    }

    return breadcrumbs;
  }, [pathname, pageTitle]);

  const breadcrumbs = getBreadcrumbs();
  const isUrlDetailPage =
    pathname.includes("/urls/") && pathname.split("/").length > 3;

  const handleBack = useCallback(() => {
    if (isUrlDetailPage) {
      router.push("/dashboard");
    } else {
      router.back();
    }
  }, [isUrlDetailPage, router]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Navigation */}
          <div className="flex items-center space-x-4">
            {/* Mobile hamburger menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <button
                  aria-label="Open menu"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-8 space-y-3">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Mobile navigation links</SheetDescription>
                </SheetHeader>
                <Link
                  href="/dashboard"
                  prefetch={false}
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="pt-4 border-t">
                  <SignOutButton />
                </div>
              </SheetContent>
            </Sheet>

            {/* Back button for detail pages */}
            {isUrlDetailPage && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Back to Dashboard">
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              </button>
            )}

            {/* Brand */}
            <Link
              href="/dashboard"
              prefetch={false}
              className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              <Globe className="h-6 w-6 text-blue-600" />
              <span className="hidden sm:block">Web Crawler</span>
            </Link>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                  <Link
                    href={crumb.href}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors",
                      pathname === crumb.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900"
                    )}>
                    <crumb.icon className="h-4 w-4" />
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-3">
            {/* Refresh button for detail pages */}
            {isUrlDetailPage && onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={cn(
                  "p-2 hover:bg-gray-100 rounded-lg transition-colors group",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                title="Refresh Analysis">
                <RefreshCw
                  className={cn(
                    "h-5 w-5 text-gray-600 group-hover:text-gray-900",
                    isLoading && "animate-spin"
                  )}
                />
              </button>
            )}

            <div className="hidden md:flex items-center space-x-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
