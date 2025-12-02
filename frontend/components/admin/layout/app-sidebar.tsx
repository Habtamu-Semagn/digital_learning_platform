"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Building,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  GraduationCap,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const adminNavItems = [
  {
    title: "Dashboard",
    button: <LayoutDashboard />,
    url: "/dashboard/admin",
  },
  {
    title: "User Management",
    button: <Users />,
    url: "/dashboard/admin/users",
  },
  {
    title: "Instructors",
    button: <Shield />,
    url: "/dashboard/admin/instructors",
  },
  {
    title: "Course Catalog",
    button: <BookOpen />,
    url: "/dashboard/admin/courses",
  },
  {
    title: "Organizations",
    button: <Building />,
    url: "/dashboard/admin/organizations",
  },
  {
    title: "Billing & Payments",
    button: <CreditCard />,
    url: "/dashboard/admin/billing",
  },
  {
    title: "Reports",
    button: <BarChart3 />,
    url: "/dashboard/admin/analytics",
  },
  {
    title: "System Settings",
    button: <Settings />,
    url: "/dashboard/admin/settings",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isActive, setIsActive] = React.useState("Home");
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 py-3">
          <GraduationCap />
          Admin
        </div>
        <Separator />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {adminNavItems.map((el) => (
                <SidebarMenuItem key={el.title}>
                  <Link href={el.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={el.title === isActive}
                      onClick={() => setIsActive(el.title)}
                    >
                      <span>
                        {el.button}
                        {el.title}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="flex ml-auto lg:fixed bottom-5 right-5">
          <Select>
            <SelectTrigger className="text-black">
              Account <SettingsIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Profile">Profile</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
              <SelectItem value="Help">Help</SelectItem>
            </SelectContent>
          </Select>
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
