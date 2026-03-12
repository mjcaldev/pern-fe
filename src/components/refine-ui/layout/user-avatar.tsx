import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useActiveAuthProvider, useGetIdentity } from "@refinedev/core";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
};

export function UserAvatar() {
  const authProvider = useActiveAuthProvider();
  const identityEnabled = !!authProvider?.getIdentity;

  const { data: user, isLoading: userIsLoading } = useGetIdentity<User>({
    queryOptions: {
      enabled: identityEnabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  });

  if (!identityEnabled) {
    return (
      <Avatar className={cn("h-10", "w-10")}>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
  }

  if (userIsLoading || !user) {
    return <Skeleton className={cn("h-10", "w-10", "rounded-full")} />;
  }

  const { fullName, avatar } = user;

  return (
    <Avatar className={cn("h-10", "w-10")}>
      {avatar && <AvatarImage src={avatar} alt={fullName} />}
      <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
    </Avatar>
  );
}

const getInitials = (name = "") => {
  const names = name.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

UserAvatar.displayName = "UserAvatar";
