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

  return (
    <Navbar className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
      <NavbarBrand>
        <NextLink className="flex items-center gap-4" href="/">
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
                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                endContent={<ChevronDown className="text-small" />}
                radius="sm"
                variant="light"
              >
                Examples
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Example pages"
              className="w-[200px]"
              itemClasses={{
                base: 'gap-4',
              }}
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
          <NextLink
            className={`w-full ${pathname === '/photography1' ? 'text-primary' : 'text-foreground'}`}
            href="/photography1"
          >
            Photography 1
          </NextLink>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <NextLink
            className={`w-full ${pathname === '/mba' ? 'text-primary' : 'text-foreground'}`}
            href="/mba"
          >
            MBA Tutor
          </NextLink>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
