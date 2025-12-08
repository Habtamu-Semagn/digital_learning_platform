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
import { Separator } from "../../ui/separator";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  SettingsIcon,
  Megaphone,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const instructorNavItems = [
  {
    title: "Dashboard",
    button: <LayoutDashboard />,
    url: "/dashboard/instructor",
  },
  {
    title: "My Courses",
    button: <BookOpen />,
    url: "/dashboard/instructor/courses",
  },
  {
    title: "Students",
    button: <Users />,
    url: "/dashboard/instructor/students",
  },
  {
    title: "Announcements",
    button: <Megaphone />,
    url: "/dashboard/instructor/announcements",
  },
  {
    title: "Assignments",
    button: <ClipboardList />,
    url: "/dashboard/instructor/assignments",
  },
  {
    title: "Analytics",
    button: <BarChart3 />,
    url: "/dashboard/instructor/analytics",
  },
  {
    title: "Q&A",
    button: <MessageCircle />,
    url: "/dashboard/instructor/qa",
  },
  {
    title: "Settings",
    button: <Settings />,
    url: "/dashboard/instructor/settings",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isActive, setIsActive] = React.useState("Home");
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 py-3">
          <GraduationCap />
          Instructor
        </div>
        <Separator />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {instructorNavItems.map((el) => (
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
