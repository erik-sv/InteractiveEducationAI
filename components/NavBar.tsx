"use client";

import {
  Link,
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
  Button
} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import FeedbackModal from "@/components/FeedbackModal";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <Navbar className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
      <NavbarBrand>
        <NextLink href="/" className="flex items-center gap-4">
          <Image
            src="/LogoHorizontal WEB White.png"
            alt="AI Education Platform"
            width={200}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </NextLink>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={pathname === "/"}>
          <NextLink 
            href="/" 
            className={`text-${pathname === "/" ? "primary" : "foreground"}`}
          >
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
                base: "gap-4",
              }}
            >
              <DropdownItem 
                key="photography1"
                textValue="Photography 1"
              >
                <NextLink 
                  href="/photography1" 
                  className="w-full"
                >
                  Photography 1
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
            href="/" 
            className={`w-full ${pathname === "/" ? "text-primary" : "text-foreground"}`}
          >
            Home
          </NextLink>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <NextLink 
            href="/photography1" 
            className={`w-full ${pathname === "/photography1" ? "text-primary" : "text-foreground"}`}
          >
            Photography 1
          </NextLink>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
