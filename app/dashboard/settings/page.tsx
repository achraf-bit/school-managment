"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Role</p>
          <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
            {user?.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
