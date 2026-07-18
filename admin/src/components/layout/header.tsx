import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { logoutRequest } from "@/features/auth/api";
import { NavigationLinks } from "./sidebar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clear();
      navigate("/login", { replace: true });
    },
  });

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-5">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold text-ink">Arabic App</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <UserIcon className="h-4 w-4" />
            {user?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => mutation.mutate()} className="text-destructive">
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 h-dvh max-h-none w-72 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-l-0 p-0">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex h-14 items-center gap-2 border-b border-border px-5">
            <span className="arabic-text text-xl text-accent">Ø¹</span>
            <span className="text-sm font-semibold text-ink">Arabic App Admin</span>
          </div>
          <nav className="flex flex-col gap-1 px-3 py-2">
            <NavigationLinks onNavigate={() => setMobileNavOpen(false)} />
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
