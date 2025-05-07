'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import FeedbackModal from '@/components/FeedbackModal';

export default function NavBar() {
  const pathname = usePathname();

  // Function to get the base domain for constructing absolute URLs
  const getBaseDomain = () => {
    // In browser environment
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      // Extract the base domain from the host
      // e.g., from "healthcare.example.com" get "example.com"
      const parts = host.split('.');

      if (parts.length > 2) {
        // Return the base domain (last two parts)
        return parts.slice(-2).join('.');
      }

      return host; // Return as is if it's already a base domain
    }

    // Server-side or during build, use a default domain
    return 'advantageintegrationai.com'; // Ensure this is your correct production base domain
  };

  // Function to get the full URL for a subdomain
  const getSubdomainUrl = (subdomain: string, path: string = '/') => {
    const baseDomain = getBaseDomain();
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

    // For localhost development - this might need adjustment based on local setup
    if (baseDomain.includes('localhost') || baseDomain.includes('127.0.0.1')) {
      // If testing subdomains locally (e.g. demos.localhost:3000), this needs to be smarter
      // For simple localhost:3000, it would just be the path.
      // However, if you ARE using subdomains locally (e.g. via /etc/hosts and Nginx)
      // then you'd want behavior similar to production.
      // Assuming for now that local dev will use relative paths or a single host for simplicity with NextLink.
      // If you want absolute local subdomain URLs, this part needs to match your local Nginx setup.
      // For now, let's make it behave like production for consistency, assuming local setup mirrors it.

      if (subdomain === '' || subdomain === 'www') {
        // Handle case for main domain without subdomain prefix
        return `${protocol}//${baseDomain}${path}`;
      }

      return `${protocol}//${subdomain}.${baseDomain}${path}`;
    }

    // For production with subdomains
    if (subdomain === '' || subdomain === 'www') {
      // Handle case for main domain without subdomain prefix
      return `${protocol}//${baseDomain}${path}`;
    }

    return `${protocol}//${subdomain}.${baseDomain}${path}`;
  };

  return (
    <Navbar className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
      <NavbarBrand>
        <NextLink className="flex items-center gap-4" href={getSubdomainUrl('demos', '/')}>
          <Image
            priority
            alt="AI Education Platform"
            className="h-8 w-auto"
            height={40}
            src="/LogoHorizontal WEB White.png"
            width={200}
          />
        </NextLink>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={pathname === '/'}>
          <NextLink className={`text-${pathname === '/' ? 'primary' : 'foreground'}`} href="/">
            Home
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent flex items-center"
                endContent={<ChevronDown className="text-small" />}
                radius="sm"
                variant="light"
              >
                Education
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Education pages"
              className="w-[200px]"
              itemClasses={{ base: 'gap-4' }}
            >
              <DropdownItem key="project-overview" textValue="Project Overview">
                <NextLink className="w-full" href="/education">
                  Project Overview
                </NextLink>
              </DropdownItem>
              <DropdownItem key="photography1" textValue="Photography 1">
                <NextLink className="w-full" href="/photography1">
                  Photography 1
                </NextLink>
              </DropdownItem>
              <DropdownItem key="mba" textValue="MBA Tutor">
                <NextLink className="w-full" href="/mba">
                  MBA Tutor
                </NextLink>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
        <NavbarItem isActive={pathname === '/healthcare'}>
          <NextLink
            className={`text-${pathname === '/healthcare' ? 'primary' : 'foreground'}`}
            href="/healthcare"
          >
            Healthcare
          </NextLink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <div className="flex items-center gap-4">
          <FeedbackModal />
        </div>
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>
      <NavbarMenu className="bg-gray-900/95 backdrop-blur-md pt-6">
        <NavbarMenuItem>
          <NextLink
            className={`w-full ${pathname === '/' ? 'text-primary' : 'text-foreground'}`}
            href="/"
          >
            Home
          </NextLink>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Dropdown>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent w-full text-left justify-start"
                endContent={<ChevronDown className="text-small" />}
                radius="sm"
                variant="light"
              >
                Education
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Education pages"
              className="w-[200px]"
              itemClasses={{ base: 'gap-4' }}
            >
              <DropdownItem key="photography1" textValue="Photography 1">
                <NextLink className="w-full" href="/photography1">
                  Photography 1
                </NextLink>
              </DropdownItem>
              <DropdownItem key="mba" textValue="MBA Tutor">
                <NextLink className="w-full" href="/mba">
                  MBA Tutor
                </NextLink>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <NextLink
            className={`w-full ${pathname === '/healthcare' ? 'text-primary' : 'text-foreground'}`}
            href="/healthcare"
          >
            Healthcare
          </NextLink>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
