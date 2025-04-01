"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/dashboard/sidebar/scroll-area";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  Package,
  ReceiptText,
  ShoppingCart,
  Store,
  LayoutDashboard,
  BarChart,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/dashboard/sidebar/avatar"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/dashboard/sidebar/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dashboard/sidebar/dropdown-menu";
import { Separator } from "@/components/dashboard/sidebar/separator";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

interface SidebarProps {
  organizationId: string;
  organizationName: string;
}

export function SessionNavBar({ organizationId, organizationName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-gray-700 h-full shrink-0 flex-col bg-white transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2 hover:bg-gray-100" 
                    >
                      <Avatar className='rounded size-4 bg-green-600 text-white'>
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              {organizationName}
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/organizations"
                        className="flex items-center gap-2"
                      >
                        <Store className="h-4 w-4" />
                        Switch Organization
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <Link
                      href={`/organizations/${organizationId}/dashboard`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/dashboard`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <LayoutDashboard className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/dashboard`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </Link>
                    
                    <Link
                      href={`/organizations/${organizationId}/pos`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/pos`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <ShoppingCart className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/pos`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">POS</p>
                        )}
                      </motion.li>
                    </Link>
                    
                    {/* Link yang dilindungi - Products */}
                    <a
                      href={`/organizations/${organizationId}/products`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/products`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <Package className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/products`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Products</p>
                        )}
                      </motion.li>
                    </a>
                    
                    <Link
                      href={`/organizations/${organizationId}/sales`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/sales`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <ReceiptText className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/sales`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Sales History</p>
                        )}
                      </motion.li>
                    </Link>
                    
                    <Separator className="w-full my-2" />
                    
                    {/* Link yang dilindungi - Settings */}
                    <a
                      href={`/organizations/${organizationId}/settings`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/settings`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <Settings className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/settings`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Settings</p>
                        )}
                      </motion.li>
                    </a>
                    
                    {/* Link yang dilindungi - Inventory */}
                    <a
                      href={`/organizations/${organizationId}/inventory`}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100",
                        pathname?.includes(`/organizations/${organizationId}/inventory`) &&
                          "bg-gray-100 text-green-600",
                      )}
                    >
                      <BarChart className={cn(
                        "h-4 w-4",
                        pathname?.includes(`/organizations/${organizationId}/inventory`) ? "text-green-600" : "text-gray-600"
                      )} />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Inventory</p>
                        )}
                      </motion.li>
                    </a>
                  </div>
                </ScrollArea>
              </div>
              
              <div className="p-2">
                <Link
                  href="/logout"
                  className={cn(
                    "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Logout</p>
                    )}
                  </motion.li>
                </Link>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
